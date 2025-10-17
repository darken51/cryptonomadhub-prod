"""
User Wallets Router

Manage multiple wallet addresses per user for consolidated tracking.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, validator
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.user_wallet import UserWallet
from app.routers.auth import get_current_user

router = APIRouter(prefix="/wallets", tags=["User Wallets"])


class WalletCreate(BaseModel):
    wallet_address: str
    chain: str
    wallet_name: Optional[str] = None
    is_primary: bool = False
    notes: Optional[str] = None
    
    @validator('wallet_address')
    def validate_address(cls, v):
        v = v.strip().lower()
        if not v.startswith('0x') or len(v) != 42:
            raise ValueError('Invalid Ethereum-compatible address format')
        return v
    
    @validator('chain')
    def validate_chain(cls, v):
        allowed_chains = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'avalanche', 'base', 'fantom', 'solana', 'bitcoin']
        if v.lower() not in allowed_chains:
            raise ValueError(f'Chain must be one of: {", ".join(allowed_chains)}')
        return v.lower()


class WalletResponse(BaseModel):
    id: int
    wallet_address: str
    chain: str
    wallet_name: Optional[str]
    is_primary: bool
    is_active: bool
    first_transaction_date: Optional[str]
    last_sync_date: Optional[str]
    total_transactions: int
    notes: Optional[str]
    created_at: str
    
    class Config:
        from_attributes = True


@router.get("", response_model=List[WalletResponse])
async def list_wallets(
    chain: Optional[str] = None,
    active_only: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all wallets for current user
    
    Args:
        chain: Filter by specific chain
        active_only: Only return active wallets (default: True)
    """
    query = db.query(UserWallet).filter(UserWallet.user_id == current_user.id)
    
    if chain:
        query = query.filter(UserWallet.chain == chain.lower())
    
    if active_only:
        query = query.filter(UserWallet.is_active == True)
    
    wallets = query.order_by(UserWallet.is_primary.desc(), UserWallet.created_at.desc()).all()
    
    return [
        WalletResponse(
            id=w.id,
            wallet_address=w.wallet_address,
            chain=w.chain,
            wallet_name=w.wallet_name,
            is_primary=w.is_primary,
            is_active=w.is_active,
            first_transaction_date=w.first_transaction_date.isoformat() if w.first_transaction_date else None,
            last_sync_date=w.last_sync_date.isoformat() if w.last_sync_date else None,
            total_transactions=w.total_transactions,
            notes=w.notes,
            created_at=w.created_at.isoformat()
        )
        for w in wallets
    ]


@router.post("", response_model=WalletResponse)
async def add_wallet(
    request: WalletCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new wallet address to user's portfolio
    """
    # Check if wallet already exists for this user
    existing = db.query(UserWallet).filter(
        UserWallet.user_id == current_user.id,
        UserWallet.wallet_address == request.wallet_address,
        UserWallet.chain == request.chain
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This wallet address is already linked to your account"
        )
    
    # If this is set as primary, unset other primary wallets on same chain
    if request.is_primary:
        db.query(UserWallet).filter(
            UserWallet.user_id == current_user.id,
            UserWallet.chain == request.chain,
            UserWallet.is_primary == True
        ).update({"is_primary": False})
    
    # Create wallet
    wallet = UserWallet(
        user_id=current_user.id,
        wallet_address=request.wallet_address,
        chain=request.chain,
        wallet_name=request.wallet_name,
        is_primary=request.is_primary,
        notes=request.notes
    )
    
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    
    return WalletResponse(
        id=wallet.id,
        wallet_address=wallet.wallet_address,
        chain=wallet.chain,
        wallet_name=wallet.wallet_name,
        is_primary=wallet.is_primary,
        is_active=wallet.is_active,
        first_transaction_date=None,
        last_sync_date=None,
        total_transactions=0,
        notes=wallet.notes,
        created_at=wallet.created_at.isoformat()
    )


@router.delete("/{wallet_id}")
async def delete_wallet(
    wallet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a wallet (or mark inactive)
    """
    wallet = db.query(UserWallet).filter(
        UserWallet.id == wallet_id,
        UserWallet.user_id == current_user.id
    ).first()
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Check if there are cost basis lots associated
    from app.models.cost_basis import CostBasisLot
    lots_count = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == current_user.id,
        CostBasisLot.chain == wallet.chain
    ).count()
    
    if lots_count > 0:
        # Don't delete, just deactivate
        wallet.is_active = False
        db.commit()
        return {"message": f"Wallet deactivated (has {lots_count} associated cost basis lots)"}
    else:
        # Safe to delete
        db.delete(wallet)
        db.commit()
        return {"message": "Wallet deleted successfully"}


@router.get("/consolidated-portfolio")
async def get_consolidated_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get consolidated portfolio across ALL user wallets
    
    Returns aggregated cost basis data from all linked wallets.
    """
    from app.models.cost_basis import CostBasisLot
    from app.services.price_service import PriceService
    
    # Get all user wallets
    wallets = db.query(UserWallet).filter(
        UserWallet.user_id == current_user.id,
        UserWallet.is_active == True
    ).all()
    
    # Get all cost basis lots for this user (already consolidated by user_id)
    lots = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == current_user.id,
        CostBasisLot.remaining_amount > 0
    ).all()
    
    if not lots:
        return {
            "total_wallets": len(wallets),
            "wallets": [{"address": w.wallet_address, "chain": w.chain} for w in wallets],
            "total_value_usd": 0.0,
            "total_cost_basis": 0.0,
            "total_unrealized_gain_loss": 0.0,
            "total_lots": 0,
            "tokens_summary": {},
            "by_chain": {},
            "by_wallet": {}
        }
    
    price_service = PriceService()
    price_cache = {}
    
    # Aggregate by token, chain, and wallet
    tokens_summary = {}
    by_chain = {}
    by_wallet = {}
    
    total_value = 0.0
    total_cost_basis = 0.0
    
    for lot in lots:
        # Get current price
        if lot.token not in price_cache:
            current_price_decimal = price_service.get_current_price(lot.token)
            price_cache[lot.token] = float(current_price_decimal) if current_price_decimal else lot.acquisition_price_usd
        
        current_price = price_cache[lot.token]
        lot_value = lot.remaining_amount * current_price
        lot_cost_basis = lot.remaining_amount * lot.acquisition_price_usd
        
        total_value += lot_value
        total_cost_basis += lot_cost_basis
        
        # By token
        if lot.token not in tokens_summary:
            tokens_summary[lot.token] = {
                "amount": 0.0,
                "value_usd": 0.0,
                "cost_basis": 0.0,
                "gain_loss": 0.0,
                "current_price": current_price
            }
        
        tokens_summary[lot.token]["amount"] += lot.remaining_amount
        tokens_summary[lot.token]["value_usd"] += lot_value
        tokens_summary[lot.token]["cost_basis"] += lot_cost_basis
        tokens_summary[lot.token]["gain_loss"] += (lot_value - lot_cost_basis)
        
        # By chain
        if lot.chain not in by_chain:
            by_chain[lot.chain] = {
                "value_usd": 0.0,
                "cost_basis": 0.0,
                "gain_loss": 0.0,
                "lots_count": 0
            }
        
        by_chain[lot.chain]["value_usd"] += lot_value
        by_chain[lot.chain]["cost_basis"] += lot_cost_basis
        by_chain[lot.chain]["gain_loss"] += (lot_value - lot_cost_basis)
        by_chain[lot.chain]["lots_count"] += 1
    
    return {
        "total_wallets": len(wallets),
        "wallets": [
            {
                "address": w.wallet_address,
                "chain": w.chain,
                "name": w.wallet_name,
                "is_primary": w.is_primary
            }
            for w in wallets
        ],
        "total_value_usd": total_value,
        "total_cost_basis": total_cost_basis,
        "total_unrealized_gain_loss": total_value - total_cost_basis,
        "total_lots": len(lots),
        "tokens_summary": tokens_summary,
        "by_chain": by_chain
    }
