"""
DeFi Audit Async Tasks

Background processing for DeFi audits, transaction parsing, and cost basis calculations.
"""

from celery import Task
from app.tasks.celery_app import celery_app
from app.database import get_db
from app.models.defi_protocol import DeFiAudit
from app.services.defi_audit_service import DeFiAuditService
from app.services.cost_basis_calculator import CostBasisCalculator
from app.services.notification_service import NotificationService
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)


class DatabaseTask(Task):
    """Base task with database session"""
    _db = None

    @property
    def db(self) -> Session:
        if self._db is None:
            self._db = next(get_db())
        return self._db


@celery_app.task(bind=True, base=DatabaseTask, name="process_defi_audit")
def process_defi_audit_task(self, audit_id: int, wallet_address: str):
    """
    Process DeFi audit asynchronously

    Args:
        audit_id: DeFi audit ID
        wallet_address: Wallet address to audit

    Progress states:
    - 0%: Starting
    - 10-80%: Scanning blockchains (10% per chain)
    - 80-90%: Calculating cost basis
    - 90-95%: Calculating taxes
    - 95-100%: Finalizing
    """
    try:
        # Get audit
        audit = self.db.query(DeFiAudit).filter(DeFiAudit.id == audit_id).first()
        if not audit:
            raise ValueError(f"Audit {audit_id} not found")

        # Update status
        audit.status = "processing"
        self.db.commit()

        # Initialize services
        defi_service = DeFiAuditService(self.db)
        cost_basis_calc = CostBasisCalculator(self.db, audit.user_id)

        # Progress tracking
        total_chains = len(audit.chains)
        progress_per_chain = 70 // total_chains if total_chains > 0 else 70

        self.update_state(
            state="PROGRESS",
            meta={
                "current": 0,
                "total": 100,
                "status": "Starting audit...",
                "audit_id": audit_id
            }
        )

        # Scan each blockchain
        all_transactions = []
        for idx, chain in enumerate(audit.chains):
            logger.info(f"Scanning chain {chain} ({idx+1}/{total_chains})")

            self.update_state(
                state="PROGRESS",
                meta={
                    "current": 10 + (idx * progress_per_chain),
                    "total": 100,
                    "status": f"Scanning {chain}...",
                    "chain": chain
                }
            )

            # Parse transactions for this chain
            txs = await defi_service.parser.parse_wallet_transactions(
                wallet_address=wallet_address,
                chain=chain,
                start_date=audit.start_date,
                end_date=audit.end_date
            )

            logger.info(f"Found {len(txs)} transactions on {chain}")

            # Process each transaction
            for tx in txs:
                defi_tx = await defi_service._process_transaction(tx, audit.id, audit.user_id)
                if defi_tx:
                    all_transactions.append(defi_tx)

        # Calculate cost basis for all disposals
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 80,
                "total": 100,
                "status": "Calculating cost basis..."
            }
        )

        for tx in all_transactions:
            if tx.transaction_type in ["swap", "remove_liquidity", "withdraw"]:
                # This is a disposal - calculate cost basis
                try:
                    result = await cost_basis_calc.calculate_disposal(
                        token=tx.token_out,
                        chain=tx.chain,
                        amount=tx.amount_out,
                        disposal_price_usd=tx.usd_value_out / tx.amount_out if tx.amount_out else 0,
                        disposal_date=tx.timestamp,
                        disposal_tx_hash=tx.tx_hash
                    )

                    # Update transaction with accurate gain/loss
                    tx.gain_loss_usd = result["total_gain_loss"]
                    tx.holding_period_days = result["disposals"][0].holding_period_days if result["disposals"] else 0

                except Exception as e:
                    logger.error(f"Failed to calculate cost basis for tx {tx.tx_hash}: {e}")

        # Calculate summary statistics
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 90,
                "total": 100,
                "status": "Calculating taxes..."
            }
        )

        summary = defi_service._calculate_summary(all_transactions)

        # Update audit with results
        audit.total_transactions = len(all_transactions)
        audit.total_volume_usd = summary["total_volume_usd"]
        audit.total_gains_usd = summary["total_gains_usd"]
        audit.total_losses_usd = summary["total_losses_usd"]
        audit.total_fees_usd = summary["total_fees_usd"]
        audit.short_term_gains = summary["short_term_gains"]
        audit.long_term_gains = summary["long_term_gains"]
        audit.ordinary_income = summary["ordinary_income"]
        audit.protocols_used = summary["protocols_breakdown"]
        audit.result_summary = summary["detailed_breakdown"]
        audit.status = "completed"
        audit.completed_at = datetime.utcnow()

        self.db.commit()

        # Send notification
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 95,
                "total": 100,
                "status": "Sending notification..."
            }
        )

        notification_service = NotificationService(self.db)
        await notification_service.notify_audit_complete(audit.user_id, audit.id)

        logger.info(f"Audit {audit_id} completed successfully")

        return {
            "state": "SUCCESS",
            "current": 100,
            "total": 100,
            "status": "Audit completed!",
            "audit_id": audit_id,
            "total_transactions": len(all_transactions)
        }

    except Exception as e:
        logger.error(f"Audit {audit_id} failed: {e}", exc_info=True)

        # Update audit status
        audit = self.db.query(DeFiAudit).filter(DeFiAudit.id == audit_id).first()
        if audit:
            audit.status = "failed"
            audit.error_message = str(e)
            self.db.commit()

        raise


@celery_app.task(name="sync_cost_basis_from_exchange")
def sync_cost_basis_from_exchange_task(user_id: int, exchange: str, api_key: str, api_secret: str):
    """
    Import cost basis lots from exchange API

    Args:
        user_id: User ID
        exchange: Exchange name (binance, coinbase, kraken)
        api_key: API key
        api_secret: API secret
    """
    from app.services.exchange_connectors import ExchangeConnectorFactory

    try:
        db = next(get_db())
        connector = ExchangeConnectorFactory.get_connector(exchange)

        trades = connector.fetch_trades(api_key, api_secret)

        cost_basis_calc = CostBasisCalculator(db, user_id)

        for trade in trades:
            if trade["side"] == "buy":
                await cost_basis_calc.add_lot(
                    token=trade["symbol"],
                    chain=trade.get("chain", "ethereum"),
                    amount=trade["amount"],
                    acquisition_price_usd=trade["price"],
                    acquisition_date=trade["timestamp"],
                    acquisition_method="purchase",
                    notes=f"Imported from {exchange}"
                )

        logger.info(f"Imported {len(trades)} trades from {exchange} for user {user_id}")

        return {"status": "success", "trades_imported": len(trades)}

    except Exception as e:
        logger.error(f"Failed to import from {exchange}: {e}")
        raise


@celery_app.task(name="calculate_tax_optimization")
def calculate_tax_optimization_task(user_id: int):
    """
    Calculate tax optimization suggestions

    Args:
        user_id: User ID

    Returns:
        Dict with optimization suggestions
    """
    from app.services.tax_optimizer import TaxOptimizer

    try:
        db = next(get_db())
        optimizer = TaxOptimizer(db, user_id)

        suggestions = await optimizer.analyze_portfolio()

        logger.info(f"Generated {len(suggestions['trades_suggested'])} tax optimization suggestions for user {user_id}")

        return suggestions

    except Exception as e:
        logger.error(f"Tax optimization failed for user {user_id}: {e}")
        raise
