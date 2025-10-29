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
import html

router = APIRouter(prefix="/wallets", tags=["User Wallets"])


class WalletCreate(BaseModel):
    wallet_address: str
    chain: str
    wallet_name: Optional[str] = None
    is_primary: bool = False
    notes: Optional[str] = None

    @validator('wallet_name')
    def sanitize_wallet_name(cls, v):
        """Sanitize wallet name to prevent XSS"""
        if v:
            v = html.escape(v.strip())
            if len(v) > 100:
                raise ValueError('Wallet name must be 100 characters or less')
        return v

    @validator('notes')
    def sanitize_notes(cls, v):
        """Sanitize notes to prevent XSS"""
        if v:
            v = html.escape(v.strip())
            if len(v) > 1000:
                raise ValueError('Notes must be 1000 characters or less')
        return v

    @validator('wallet_address')
    def validate_address(cls, v):
        import re
        v = v.strip()

        # EVM address: 0x followed by 40 hex characters with checksum validation
        if re.match(r'^0x[a-fA-F0-9]{40}$', v):
            try:
                from eth_utils import is_address, to_checksum_address
                if not is_address(v):
                    raise ValueError('Invalid EVM address format')
                # Return checksummed address for consistency
                return to_checksum_address(v)
            except ImportError:
                # Fallback if eth_utils not available
                return v.lower()

        # Solana address: base58, 32-44 characters with basic validation
        if re.match(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$', v):
            try:
                import base58
                # Verify it can be decoded (valid base58)
                decoded = base58.b58decode(v)
                if len(decoded) != 32:  # Solana addresses decode to 32 bytes
                    raise ValueError('Invalid Solana address: incorrect length after decoding')
                return v
            except (ValueError, ImportError):
                # Basic validation failed or library not available
                return v

        # Bitcoin Legacy (P2PKH): starts with 1
        if re.match(r'^1[a-km-zA-HJ-NP-Z1-9]{25,34}$', v):
            return v

        # Bitcoin SegWit (P2SH): starts with 3
        if re.match(r'^3[a-km-zA-HJ-NP-Z1-9]{25,34}$', v):
            return v

        # Bitcoin Bech32 (native SegWit): starts with bc1
        if re.match(r'^bc1[a-z0-9]{39,59}$', v.lower()):
            return v.lower()

        raise ValueError('Invalid wallet address format. Supported: EVM, Solana, Bitcoin')
    
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
    # 🔍 DEBUG: Log wallet creation attempts
    logger.info(f"[ADD_WALLET] User {current_user.id} attempting to add: {request.wallet_address} on {request.chain}")

    # Use transaction to prevent race conditions
    try:
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
            db.flush()  # Execute update before insert

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
    except HTTPException as he:
        db.rollback()
        logger.warning(f"[ADD_WALLET] HTTPException for user {current_user.id}: {he.status_code} - {he.detail}")
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"[ADD_WALLET] Unexpected error for user {current_user.id}: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to add wallet: {str(e)}")
    
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
    
    # Check if there are cost basis lots associated with this specific wallet
    from app.models.cost_basis import CostBasisLot
    lots_count = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == current_user.id,
        CostBasisLot.wallet_address == wallet.wallet_address
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
            price_cache[lot.token] = float(current_price_decimal) if current_price_decimal else float(lot.acquisition_price_usd)
        
        current_price = price_cache[lot.token]
        lot_value = float(lot.remaining_amount) * current_price
        lot_cost_basis = float(lot.remaining_amount) * float(lot.acquisition_price_usd)
        
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
        
        tokens_summary[lot.token]["amount"] += float(lot.remaining_amount)
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
