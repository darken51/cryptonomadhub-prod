"""
Wallet Portfolio Router

NEW endpoints for wallet portfolio tracking, syncing, and analytics.
Extends the basic wallet management from user_wallets.py
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import desc

from app.database import get_db
from app.models.user import User
from app.models.user_wallet import UserWallet
from app.models.wallet_snapshot import WalletSnapshot
from app.models.wallet_value_history import WalletValueHistory
from app.routers.auth import get_current_user
from app.services.wallet_portfolio_service import WalletPortfolioService
from app.services.blockchain_detector import ChainDetector

import logging

router = APIRouter(prefix="/wallet-portfolio", tags=["Wallet Portfolio"])
logger = logging.getLogger(__name__)


# ========== Schemas ==========

class WalletPortfolioResponse(BaseModel):
    """Wallet portfolio with current value and change"""
    id: int
    name: Optional[str]
    address: str
    chain: str
    total_value_usd: float
    total_cost_basis: float
    total_unrealized_gain_loss: float
    unrealized_gain_loss_percent: float
    change_24h_usd: Optional[float] = None
    change_24h_percent: Optional[float] = None
    total_tokens: int
    total_chains: int
    last_updated: Optional[str] = None

    # Local currency
    total_value_local: Optional[float] = None
    local_currency: Optional[str] = None
    currency_symbol: Optional[str] = None


class WalletPositionResponse(BaseModel):
    """Individual token position"""
    token: str
    token_address: Optional[str]
    chain: str
    amount: float
    price_usd: float
    value_usd: float
    cost_basis: float
    unrealized_gain_loss: float


class WalletDetailedPortfolioResponse(BaseModel):
    """Detailed wallet portfolio with positions"""
    wallet: WalletPortfolioResponse
    positions: List[WalletPositionResponse]


class ConsolidatedPortfolioResponse(BaseModel):
    """Consolidated portfolio across all wallets"""
    total_value_usd: float
    total_cost_basis: float
    total_unrealized_gain_loss: float
    unrealized_gain_loss_percent: float
    change_24h_usd: Optional[float] = None
    change_24h_percent: Optional[float] = None

    total_wallets: int
    total_tokens: int
    total_chains: int

    # Local currency
    total_value_local: Optional[float] = None
    local_currency: Optional[str] = None
    currency_symbol: Optional[str] = None

    wallets: List[WalletPortfolioResponse]


class WalletHistoryResponse(BaseModel):
    """Historical wallet value data point"""
    date: str
    value_usd: float
    value_local: Optional[float] = None
    change_from_previous_usd: Optional[float] = None
    change_from_previous_percent: Optional[float] = None


# ========== Endpoints ==========

@router.get("/overview", response_model=ConsolidatedPortfolioResponse)
async def get_portfolio_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get consolidated portfolio overview across ALL wallets

    Returns:
        - Total value and unrealized gains
        - 24h changes
        - List of all wallets with their values
    """
    import time
    import logging
    logger = logging.getLogger(__name__)

    start_time = time.time()
    logger.info(f"[WALLET_PORTFOLIO] User {current_user.id} - Starting portfolio fetch")

    service = WalletPortfolioService(db)

    try:
        # Get consolidated portfolio
        portfolio_start = time.time()
        portfolio = await service.get_consolidated_portfolio(current_user.id)
        portfolio_time = time.time() - portfolio_start
        logger.info(f"[WALLET_PORTFOLIO] User {current_user.id} - Portfolio calc: {portfolio_time:.2f}s")

        # Get 24h change (from most recent consolidated snapshot)
        yesterday = datetime.utcnow() - timedelta(hours=24)
        previous_snapshot = db.query(WalletSnapshot).filter(
            WalletSnapshot.user_id == current_user.id,
            WalletSnapshot.wallet_id == None,  # Consolidated snapshot
            WalletSnapshot.snapshot_date <= yesterday
        ).order_by(desc(WalletSnapshot.snapshot_date)).first()

        change_24h_usd = None
        change_24h_percent = None

        if previous_snapshot:
            current_value = float(portfolio["total_value_usd"])
            previous_value = float(previous_snapshot.total_value_usd)
            change_24h_usd = current_value - previous_value
            change_24h_percent = (change_24h_usd / previous_value * 100) if previous_value > 0 else 0

        # Format wallets
        wallets = []
        for wallet_data in portfolio["wallets"]:
            wallets.append(WalletPortfolioResponse(
                id=wallet_data["id"],
                name=wallet_data["name"],
                address=wallet_data["address"],
                chain=wallet_data["chain"],
                total_value_usd=wallet_data["value_usd"],
                total_cost_basis=0,  # TODO: Add from wallet_data
                total_unrealized_gain_loss=wallet_data["unrealized_gain_loss"],
                unrealized_gain_loss_percent=0,  # TODO: Calculate
                total_tokens=len(wallet_data["positions"]),
                total_chains=1,
                last_updated=datetime.utcnow().isoformat()
            ))

        total_time = time.time() - start_time
        logger.info(f"[WALLET_PORTFOLIO] User {current_user.id} - TOTAL TIME: {total_time:.2f}s")

        return ConsolidatedPortfolioResponse(
            total_value_usd=float(portfolio["total_value_usd"]),
            total_cost_basis=float(portfolio["total_cost_basis"]),
            total_unrealized_gain_loss=float(portfolio["total_unrealized_gain_loss"]),
            unrealized_gain_loss_percent=float(portfolio["unrealized_gain_loss_percent"]),
            change_24h_usd=change_24h_usd,
            change_24h_percent=change_24h_percent,
            total_wallets=len(wallets),
            total_tokens=portfolio["total_tokens"],
            total_chains=portfolio["total_chains"],
            wallets=wallets
        )

    except Exception as e:
        logger.error(f"Error getting portfolio overview: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get portfolio overview: {str(e)}")


@router.get("/{wallet_id}/portfolio", response_model=WalletDetailedPortfolioResponse)
async def get_wallet_portfolio(
    wallet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed portfolio for a specific wallet

    Returns:
        - Wallet summary (value, gains, etc.)
        - List of all token positions
    """
    # Verify wallet ownership
    wallet = db.query(UserWallet).filter(
        UserWallet.id == wallet_id,
        UserWallet.user_id == current_user.id
    ).first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    service = WalletPortfolioService(db)

    try:
        # Calculate current portfolio
        portfolio = await service.calculate_wallet_value(wallet_id, current_user.id)

        # Get 24h change
        change_data = await service.calculate_24h_change(wallet_id, current_user.id)

        # Format positions
        positions = [
            WalletPositionResponse(**pos)
            for pos in portfolio["positions"]
        ]

        wallet_response = WalletPortfolioResponse(
            id=wallet.id,
            name=wallet.wallet_name,
            address=wallet.wallet_address,
            chain=wallet.chain,
            total_value_usd=float(portfolio["total_value_usd"]),
            total_cost_basis=float(portfolio["total_cost_basis"]),
            total_unrealized_gain_loss=float(portfolio["total_unrealized_gain_loss"]),
            unrealized_gain_loss_percent=float(portfolio["unrealized_gain_loss_percent"]),
            change_24h_usd=float(change_data["change_24h_usd"]),
            change_24h_percent=float(change_data["change_24h_percent"]),
            total_tokens=portfolio["total_tokens"],
            total_chains=portfolio["total_chains"],
            last_updated=datetime.utcnow().isoformat()
        )

        return WalletDetailedPortfolioResponse(
            wallet=wallet_response,
            positions=positions
        )

    except Exception as e:
        logger.error(f"Error getting wallet portfolio: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get wallet portfolio: {str(e)}")


@router.get("/{wallet_id}/history")
async def get_wallet_history(
    wallet_id: int,
    period: str = "7d",  # 7d, 30d, 90d, 1y
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get historical value data for a wallet

    Args:
        period: Time period (7d, 30d, 90d, 1y)

    Returns:
        Array of historical data points
    """
    # Verify wallet ownership
    wallet = db.query(UserWallet).filter(
        UserWallet.id == wallet_id,
        UserWallet.user_id == current_user.id
    ).first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    # Parse period
    PERIODS = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365
    }

    days = PERIODS.get(period, 7)
    start_date = datetime.utcnow() - timedelta(days=days)

    # Get snapshots
    snapshots = db.query(WalletSnapshot).filter(
        WalletSnapshot.wallet_id == wallet_id,
        WalletSnapshot.snapshot_date >= start_date
    ).order_by(WalletSnapshot.snapshot_date).all()

    # Format response
    history = []
    previous_value = None

    for snapshot in snapshots:
        value_usd = float(snapshot.total_value_usd)

        change_from_previous_usd = None
        change_from_previous_percent = None

        if previous_value is not None:
            change_from_previous_usd = value_usd - previous_value
            change_from_previous_percent = (change_from_previous_usd / previous_value * 100) if previous_value > 0 else 0

        history.append(WalletHistoryResponse(
            date=snapshot.snapshot_date.isoformat(),
            value_usd=value_usd,
            value_local=float(snapshot.total_value_local) if snapshot.total_value_local else None,
            change_from_previous_usd=change_from_previous_usd,
            change_from_previous_percent=change_from_previous_percent
        ))

        previous_value = value_usd

    return {
        "wallet_id": wallet_id,
        "period": period,
        "data_points": len(history),
        "history": history
    }


@router.post("/sync")
async def sync_all_wallets(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually trigger sync of ALL user wallets

    Creates snapshots and calculates 24h changes.
    Runs in background to avoid timeout.
    """
    from app.tasks.wallet_tasks import sync_user_wallets

    # Run in background
    background_tasks.add_task(sync_user_wallets, current_user.id)

    return {
        "message": "Wallet sync started",
        "user_id": current_user.id,
        "status": "processing"
    }


@router.post("/{wallet_id}/sync")
async def sync_wallet(
    wallet_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually trigger sync of a specific wallet
    """
    # Verify wallet ownership
    wallet = db.query(UserWallet).filter(
        UserWallet.id == wallet_id,
        UserWallet.user_id == current_user.id
    ).first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    from app.tasks.wallet_tasks import sync_wallet_snapshot

    # Run in background
    background_tasks.add_task(sync_wallet_snapshot, wallet_id, current_user.id)

    return {
        "message": "Wallet sync started",
        "wallet_id": wallet_id,
        "status": "processing"
    }


@router.get("/detect-chain")
async def detect_chain_from_address(
    address: str
):
    """
    Auto-detect blockchain from wallet address

    Args:
        address: Wallet address (query parameter)

    Returns:
        - blockchain_type: evm, solana, bitcoin, unknown
        - possible_chains: List of compatible chains
        - suggested_chain: Recommended chain to use
        - is_valid: Whether address format is valid
    """
    from app.services.blockchain_detector import ChainDetector

    blockchain_type = ChainDetector.detect_blockchain_type(address)
    possible_chains = ChainDetector.get_possible_chains(address)

    is_valid, error_message = ChainDetector.validate_address_format(address)

    return {
        "address": address,
        "blockchain_type": blockchain_type.value,
        "possible_chains": possible_chains,
        "is_valid": is_valid,
        "error_message": error_message if not is_valid else None,
        "suggested_chain": possible_chains[0] if possible_chains else None
    }
