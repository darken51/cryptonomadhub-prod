"""
Wallet Portfolio Sync Tasks

Celery tasks for automatic wallet portfolio synchronization.
Runs daily with staggered scheduling to avoid rate limits.
"""

import logging
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
import random

from app.tasks.celery_app import celery_app
from app.database import SessionLocal
from app.models.user_wallet import UserWallet
from app.models.user import User
from app.models.wallet_snapshot import WalletSnapshot
from app.models.wallet_value_history import WalletValueHistory
from app.services.wallet_portfolio_service import WalletPortfolioService

logger = logging.getLogger(__name__)


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@celery_app.task(name="schedule_daily_wallet_syncs")
def schedule_daily_wallet_syncs():
    """
    Schedule wallet syncs for all users (staggered over 1 hour)

    Runs daily at 00:00 UTC.
    Staggers syncs to avoid API rate limits.
    """
    db = next(get_db())

    try:
        # Get all users with active wallets
        users_with_wallets = db.query(User).join(UserWallet).filter(
            UserWallet.is_active == True
        ).distinct().all()

        total_users = len(users_with_wallets)
        logger.info(f"Scheduling wallet syncs for {total_users} users")

        if total_users == 0:
            logger.info("No users with wallets to sync")
            return

        # Stagger over 1 hour (3600 seconds)
        delay_increment = 3600 / total_users

        for i, user in enumerate(users_with_wallets):
            delay_seconds = int(i * delay_increment)

            # Schedule with delay
            sync_user_wallets.apply_async(
                args=[user.id],
                countdown=delay_seconds
            )

            logger.debug(f"Scheduled sync for user {user.id} in {delay_seconds}s")

        logger.info(f"✅ Scheduled {total_users} wallet syncs (staggered over 1h)")

    except Exception as e:
        logger.error(f"Error scheduling wallet syncs: {e}", exc_info=True)
    finally:
        db.close()


@celery_app.task(name="sync_user_wallets")
def sync_user_wallets(user_id: int):
    """
    Sync all wallets for a specific user

    Args:
        user_id: User ID
    """
    db = next(get_db())

    try:
        wallets = db.query(UserWallet).filter(
            UserWallet.user_id == user_id,
            UserWallet.is_active == True
        ).all()

        logger.info(f"Syncing {len(wallets)} wallets for user {user_id}")

        for wallet in wallets:
            try:
                sync_wallet_snapshot.delay(wallet.id, user_id)
            except Exception as e:
                logger.error(f"Error scheduling sync for wallet {wallet.id}: {e}")
                continue

        # Also create consolidated snapshot
        create_consolidated_snapshot.delay(user_id)

    except Exception as e:
        logger.error(f"Error syncing user {user_id} wallets: {e}", exc_info=True)
    finally:
        db.close()


@celery_app.task(name="sync_wallet_snapshot")
def sync_wallet_snapshot(wallet_id: int, user_id: int):
    """
    Create a snapshot for a specific wallet

    Args:
        wallet_id: Wallet ID
        user_id: User ID
    """
    db = next(get_db())

    try:
        # Check if snapshot already exists for today
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        existing = db.query(WalletSnapshot).filter(
            WalletSnapshot.wallet_id == wallet_id,
            WalletSnapshot.snapshot_date >= today
        ).first()

        if existing:
            logger.info(f"Snapshot already exists for wallet {wallet_id} today")
            return

        # Create snapshot
        service = WalletPortfolioService(db)

        # Run async function in sync context
        import asyncio
        snapshot = asyncio.run(service.create_snapshot(wallet_id, user_id))

        logger.info(f"✅ Created snapshot for wallet {wallet_id}: ${snapshot.total_value_usd}")

        # Create value history entry
        create_value_history_entry.delay(wallet_id, user_id)

    except Exception as e:
        logger.error(f"Error creating snapshot for wallet {wallet_id}: {e}", exc_info=True)
    finally:
        db.close()


@celery_app.task(name="create_consolidated_snapshot")
def create_consolidated_snapshot(user_id: int):
    """
    Create a consolidated snapshot for all user wallets

    Args:
        user_id: User ID
    """
    db = next(get_db())

    try:
        # Check if consolidated snapshot already exists for today
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        existing = db.query(WalletSnapshot).filter(
            WalletSnapshot.user_id == user_id,
            WalletSnapshot.wallet_id == None,  # Consolidated
            WalletSnapshot.snapshot_date >= today
        ).first()

        if existing:
            logger.info(f"Consolidated snapshot already exists for user {user_id} today")
            return

        # Calculate consolidated portfolio
        service = WalletPortfolioService(db)

        import asyncio
        portfolio = asyncio.run(service.get_consolidated_portfolio(user_id))

        # Get currency data
        local_currency_data = asyncio.run(service._get_local_currency_data(user_id))

        # Create consolidated snapshot
        snapshot = WalletSnapshot(
            user_id=user_id,
            wallet_id=None,  # Consolidated
            snapshot_date=today,
            total_value_usd=portfolio["total_value_usd"],
            total_cost_basis=portfolio["total_cost_basis"],
            total_unrealized_gain_loss=portfolio["total_unrealized_gain_loss"],
            unrealized_gain_loss_percent=portfolio["unrealized_gain_loss_percent"],
            positions=portfolio["total_positions"],
            total_tokens=portfolio["total_tokens"],
            total_chains=portfolio["total_chains"],
            **local_currency_data
        )

        db.add(snapshot)
        db.commit()

        logger.info(f"✅ Created consolidated snapshot for user {user_id}: ${portfolio['total_value_usd']}")

    except Exception as e:
        logger.error(f"Error creating consolidated snapshot for user {user_id}: {e}", exc_info=True)
    finally:
        db.close()


@celery_app.task(name="create_value_history_entry")
def create_value_history_entry(wallet_id: int, user_id: int):
    """
    Create a value history entry for 24h change tracking

    Args:
        wallet_id: Wallet ID
        user_id: User ID
    """
    db = next(get_db())

    try:
        service = WalletPortfolioService(db)

        import asyncio
        change_data = asyncio.run(service.calculate_24h_change(wallet_id, user_id))

        # Get local currency data
        local_currency_data = asyncio.run(service._get_local_currency_data(user_id))

        # Create history entry
        history = WalletValueHistory(
            user_id=user_id,
            wallet_id=wallet_id,
            timestamp=datetime.utcnow(),
            total_value_usd=change_data["current_value_usd"],
            change_24h_usd=change_data["change_24h_usd"],
            change_24h_percent=change_data["change_24h_percent"],
            total_value_local=float(change_data["current_value_usd"]) * float(local_currency_data.get("exchange_rate", 1)) if local_currency_data.get("exchange_rate") else None,
            change_24h_local=float(change_data["change_24h_usd"]) * float(local_currency_data.get("exchange_rate", 1)) if local_currency_data.get("exchange_rate") else None,
            local_currency=local_currency_data.get("local_currency"),
            currency_symbol=local_currency_data.get("currency_symbol")
        )

        db.add(history)
        db.commit()

        # Check for alerts (if change > 5%)
        if abs(float(change_data["change_24h_percent"])) >= 5.0:
            send_wallet_alert.delay(wallet_id, user_id, float(change_data["change_24h_percent"]))

    except Exception as e:
        logger.error(f"Error creating value history for wallet {wallet_id}: {e}", exc_info=True)
    finally:
        db.close()


@celery_app.task(name="send_wallet_alert")
def send_wallet_alert(wallet_id: int, user_id: int, change_percent: float):
    """
    Send alert for significant wallet value change

    Args:
        wallet_id: Wallet ID
        user_id: User ID
        change_percent: Percentage change
    """
    db = next(get_db())

    try:
        wallet = db.query(UserWallet).filter(UserWallet.id == wallet_id).first()
        user = db.query(User).filter(User.id == user_id).first()

        if not wallet or not user:
            return

        logger.info(f"⚠️ Alert: Wallet {wallet.wallet_name or wallet.wallet_address[:10]} changed by {change_percent:.2f}%")

        # TODO: Send email or push notification
        # For now, just log it

    except Exception as e:
        logger.error(f"Error sending alert for wallet {wallet_id}: {e}", exc_info=True)
    finally:
        db.close()


@celery_app.task(name="cleanup_old_snapshots")
def cleanup_old_snapshots(days_to_keep: int = 90):
    """
    Cleanup old wallet snapshots to save space

    Args:
        days_to_keep: Number of days to keep (default: 90)
    """
    db = next(get_db())

    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)

        deleted = db.query(WalletSnapshot).filter(
            WalletSnapshot.snapshot_date < cutoff_date
        ).delete()

        db.commit()

        logger.info(f"🧹 Cleaned up {deleted} old wallet snapshots (older than {days_to_keep} days)")

    except Exception as e:
        logger.error(f"Error cleaning up snapshots: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()
