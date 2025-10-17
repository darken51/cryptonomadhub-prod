"""
Wallet Group Endpoints

API routes for multi-wallet portfolio management.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User
from app.models.wallet_group import (
    WalletGroup,
    WalletGroupMember,
    InterWalletTransfer,
    ConsolidatedBalance,
    TransferType
)
from app.models.cost_basis import CostBasisLot
from app.routers.auth import get_current_user
from app.middleware import limiter, get_rate_limit
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from datetime import datetime
import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/wallet-groups", tags=["Multi-Wallet Manager"])


# Pydantic models
class CreateGroupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Group name (1-100 characters)")
    description: Optional[str] = Field(None, max_length=500, description="Optional description (max 500 characters)")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate group name"""
        v = v.strip()
        if not v:
            raise ValueError('Group name cannot be empty or only whitespace')
        return v


class AddWalletRequest(BaseModel):
    wallet_address: str = Field(..., min_length=26, max_length=100, description="Wallet address")
    chain: str = Field(..., min_length=2, max_length=50, description="Blockchain name")
    label: Optional[str] = Field(None, max_length=100, description="Optional wallet label")

    @field_validator('wallet_address')
    @classmethod
    def validate_wallet_address(cls, v: str) -> str:
        """Validate wallet address format"""
        v = v.strip()

        # EVM address: 0x followed by 40 hex characters
        if re.match(r'^0x[a-fA-F0-9]{40}$', v):
            return v.lower()

        # Solana address: base58, 32-44 characters
        if re.match(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$', v):
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

        # Cardano: starts with addr1
        if re.match(r'^addr1[a-z0-9]{98}$', v.lower()):
            return v.lower()

        # Cosmos: starts with cosmos1
        if re.match(r'^cosmos1[a-z0-9]{38}$', v.lower()):
            return v.lower()

        # Polkadot/Kusama: starts with 1 (different from Bitcoin, SS58 format)
        if re.match(r'^[1-9A-HJ-NP-Za-km-z]{47,48}$', v) and v[0] in ['1', 'F', 'G', 'H']:
            return v

        # Ripple (XRP): starts with r
        if re.match(r'^r[1-9A-HJ-NP-Za-km-z]{24,34}$', v):
            return v

        # Litecoin: starts with L or M or ltc1
        if re.match(r'^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$', v):
            return v
        if re.match(r'^ltc1[a-z0-9]{39,59}$', v.lower()):
            return v.lower()

        raise ValueError('Invalid wallet address format. Supported: EVM, Solana, Bitcoin, Cardano, Cosmos, Polkadot, Ripple, Litecoin')

    @field_validator('chain')
    @classmethod
    def validate_chain(cls, v: str) -> str:
        """Validate and normalize chain name"""
        v = v.strip().lower()
        if not v:
            raise ValueError('Chain name cannot be empty')
        return v


class WalletMemberResponse(BaseModel):
    id: int
    wallet_address: str
    chain: str
    label: Optional[str]
    is_active: bool
    added_at: str


class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_default: bool
    wallet_count: int
    wallets: List[WalletMemberResponse]
    created_at: str
    updated_at: str


class ConsolidatedBalanceResponse(BaseModel):
    token: str
    chain: str
    total_amount: float
    total_value_usd: float
    avg_cost_basis: Optional[float]
    unrealized_gain_loss: Optional[float]
    unrealized_gain_loss_percent: Optional[float]


class GroupPortfolioResponse(BaseModel):
    group_id: int
    group_name: str
    total_value_usd: float
    total_unrealized_gain_loss: float
    balances: List[ConsolidatedBalanceResponse]


@router.get("/groups", response_model=List[GroupResponse])
@limiter.limit(get_rate_limit("read_only"))
async def get_wallet_groups(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all wallet groups for the current user

    Returns list of wallet groups with their members.
    """
    groups = db.query(WalletGroup).filter(
        WalletGroup.user_id == current_user.id
    ).order_by(desc(WalletGroup.is_default), desc(WalletGroup.created_at)).all()

    result = []
    for group in groups:
        wallets = [
            WalletMemberResponse(
                id=member.id,
                wallet_address=member.wallet_address,
                chain=member.chain,
                label=member.label,
                is_active=member.is_active,
                added_at=member.added_at.isoformat()
            )
            for member in group.members
        ]

        result.append(GroupResponse(
            id=group.id,
            name=group.name,
            description=group.description,
            is_default=group.is_default,
            wallet_count=len(wallets),
            wallets=wallets,
            created_at=group.created_at.isoformat(),
            updated_at=group.updated_at.isoformat()
        ))

    return result


@router.post("/groups", response_model=GroupResponse)
@limiter.limit(get_rate_limit("wallet_operations"))
async def create_wallet_group(
    request: Request,
    response: Response,
    group_request: CreateGroupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new wallet group

    Groups multiple wallets together for consolidated tracking.
    """
    # Check if this is the user's first group
    existing_groups_count = db.query(WalletGroup).filter(
        WalletGroup.user_id == current_user.id
    ).count()

    is_default = existing_groups_count == 0

    group = WalletGroup(
        user_id=current_user.id,
        name=group_request.name,
        description=group_request.description,
        is_default=is_default
    )

    db.add(group)
    db.commit()
    db.refresh(group)

    return GroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        is_default=group.is_default,
        wallet_count=0,
        wallets=[],
        created_at=group.created_at.isoformat(),
        updated_at=group.updated_at.isoformat()
    )


@router.get("/groups/{group_id}", response_model=GroupResponse)
@limiter.limit(get_rate_limit("read_only"))
async def get_wallet_group(
    request: Request,
    response: Response,
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific wallet group by ID"""
    group = db.query(WalletGroup).filter(
        WalletGroup.id == group_id,
        WalletGroup.user_id == current_user.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Wallet group not found")

    wallets = [
        WalletMemberResponse(
            id=member.id,
            wallet_address=member.wallet_address,
            chain=member.chain,
            label=member.label,
            is_active=member.is_active,
            added_at=member.added_at.isoformat()
        )
        for member in group.members
    ]

    return GroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        is_default=group.is_default,
        wallet_count=len(wallets),
        wallets=wallets,
        created_at=group.created_at.isoformat(),
        updated_at=group.updated_at.isoformat()
    )


@router.put("/groups/{group_id}")
@limiter.limit(get_rate_limit("wallet_operations"))
async def update_wallet_group(
    request: Request,
    response: Response,
    group_id: int,
    update_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a wallet group's name or description"""
    group = db.query(WalletGroup).filter(
        WalletGroup.id == group_id,
        WalletGroup.user_id == current_user.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Wallet group not found")

    if "name" in update_data:
        group.name = update_data["name"]
    if "description" in update_data:
        group.description = update_data["description"]

    db.commit()

    return {"message": "Group updated successfully"}


@router.delete("/groups/{group_id}")
@limiter.limit(get_rate_limit("wallet_operations"))
async def delete_wallet_group(
    request: Request,
    response: Response,
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a wallet group"""
    group = db.query(WalletGroup).filter(
        WalletGroup.id == group_id,
        WalletGroup.user_id == current_user.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Wallet group not found")

    if group.is_default:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete default group. Create another group first."
        )

    db.delete(group)
    db.commit()

    return {"message": "Group deleted successfully"}


@router.post("/groups/{group_id}/wallets", response_model=WalletMemberResponse)
@limiter.limit(get_rate_limit("wallet_operations"))
async def add_wallet_to_group(
    request: Request,
    response: Response,
    group_id: int,
    wallet_request: AddWalletRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a wallet address to a group"""
    group = db.query(WalletGroup).filter(
        WalletGroup.id == group_id,
        WalletGroup.user_id == current_user.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Wallet group not found")

    # Check if wallet already exists in this group
    existing = db.query(WalletGroupMember).filter(
        WalletGroupMember.group_id == group_id,
        WalletGroupMember.wallet_address == wallet_request.wallet_address.lower(),
        WalletGroupMember.chain == wallet_request.chain.lower()
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Wallet already exists in this group"
        )

    member = WalletGroupMember(
        group_id=group_id,
        wallet_address=wallet_request.wallet_address.lower(),
        chain=wallet_request.chain.lower(),
        label=wallet_request.label,
        is_active=True
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return WalletMemberResponse(
        id=member.id,
        wallet_address=member.wallet_address,
        chain=member.chain,
        label=member.label,
        is_active=member.is_active,
        added_at=member.added_at.isoformat()
    )


@router.delete("/groups/{group_id}/wallets/{wallet_id}")
@limiter.limit(get_rate_limit("wallet_operations"))
async def remove_wallet_from_group(
    request: Request,
    response: Response,
    group_id: int,
    wallet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a wallet from a group"""
    # Verify group ownership
    group = db.query(WalletGroup).filter(
        WalletGroup.id == group_id,
        WalletGroup.user_id == current_user.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Wallet group not found")

    # Find and delete member
    member = db.query(WalletGroupMember).filter(
        WalletGroupMember.id == wallet_id,
        WalletGroupMember.group_id == group_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Wallet not found in group")

    db.delete(member)
    db.commit()

    return {"message": "Wallet removed from group"}


@router.get("/groups/{group_id}/portfolio", response_model=GroupPortfolioResponse)
@limiter.limit(get_rate_limit("read_only"))
async def get_group_portfolio(
    request: Request,
    response: Response,
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get consolidated portfolio view for a wallet group

    Aggregates balances across all wallets in the group.
    """
    group = db.query(WalletGroup).filter(
        WalletGroup.id == group_id,
        WalletGroup.user_id == current_user.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Wallet group not found")

    # Get all wallet addresses in this group
    wallet_addresses = [
        member.wallet_address
        for member in group.members
        if member.is_active
    ]

    if not wallet_addresses:
        return GroupPortfolioResponse(
            group_id=group.id,
            group_name=group.name,
            total_value_usd=0.0,
            total_unrealized_gain_loss=0.0,
            balances=[]
        )

    # Get cost basis lots for these wallets
    # Note: This is a simplified version. In production, you'd need to link
    # CostBasisLot to wallet addresses or query blockchain data

    # For now, return mock consolidated balances
    # In production, this would aggregate data from blockchain APIs

    balances = []
    total_value = 0.0
    total_unrealized_gl = 0.0

    # Mock data (TODO: integrate with real blockchain data)
    mock_balances = [
        {
            "token": "ETH",
            "chain": "ethereum",
            "amount": 5.5,
            "price": 2500.0,
            "cost_basis_per_unit": 2000.0
        },
        {
            "token": "USDC",
            "chain": "ethereum",
            "amount": 10000.0,
            "price": 1.0,
            "cost_basis_per_unit": 1.0
        }
    ]

    for balance_data in mock_balances:
        value = balance_data["amount"] * balance_data["price"]
        cost_basis_total = balance_data["amount"] * balance_data["cost_basis_per_unit"]
        unrealized_gl = value - cost_basis_total
        unrealized_gl_pct = (unrealized_gl / cost_basis_total * 100) if cost_basis_total > 0 else 0

        balances.append(ConsolidatedBalanceResponse(
            token=balance_data["token"],
            chain=balance_data["chain"],
            total_amount=balance_data["amount"],
            total_value_usd=value,
            avg_cost_basis=balance_data["cost_basis_per_unit"],
            unrealized_gain_loss=unrealized_gl,
            unrealized_gain_loss_percent=unrealized_gl_pct
        ))

        total_value += value
        total_unrealized_gl += unrealized_gl

    return GroupPortfolioResponse(
        group_id=group.id,
        group_name=group.name,
        total_value_usd=total_value,
        total_unrealized_gain_loss=total_unrealized_gl,
        balances=balances
    )


@router.get("/groups/{group_id}/transfers")
@limiter.limit(get_rate_limit("read_only"))
async def get_inter_wallet_transfers(
    request: Request,
    response: Response,
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get inter-wallet transfers detected within a group

    Shows transfers between wallets in the same group.
    """
    group = db.query(WalletGroup).filter(
        WalletGroup.id == group_id,
        WalletGroup.user_id == current_user.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Wallet group not found")

    transfers = db.query(InterWalletTransfer).filter(
        InterWalletTransfer.group_id == group_id
    ).order_by(desc(InterWalletTransfer.timestamp)).limit(100).all()

    return {
        "transfers": [
            {
                "id": t.id,
                "from_wallet": t.from_wallet_address,
                "from_chain": t.from_chain,
                "to_wallet": t.to_wallet_address,
                "to_chain": t.to_chain,
                "token": t.token,
                "amount": t.amount,
                "timestamp": t.timestamp.isoformat(),
                "transfer_type": t.transfer_type.value,
                "is_taxable": t.is_taxable,
                "confidence_score": t.confidence_score
            }
            for t in transfers
        ]
    }
