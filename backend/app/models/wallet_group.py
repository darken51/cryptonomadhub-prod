"""
Wallet Group Models

Multi-wallet portfolio management for consolidated tracking.

Features:
- Group multiple wallets under one portfolio
- Track inter-wallet transfers
- Consolidated balance calculation
- Shared cost basis across wallets
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime
import enum


class WalletGroup(Base):
    """
    Wallet Group - Portfolio of multiple wallets
    """
    __tablename__ = "wallet_groups"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    # Relationships
    members = relationship("WalletGroupMember", back_populates="group", cascade="all, delete-orphan")
    transfers = relationship("InterWalletTransfer", back_populates="group", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<WalletGroup(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class WalletGroupMember(Base):
    """
    Wallet Group Member - Association between wallet and group
    """
    __tablename__ = "wallet_group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("wallet_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    wallet_address = Column(String(255), nullable=False, index=True)
    chain = Column(String(50), nullable=False)
    label = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    added_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

    # Relationships
    group = relationship("WalletGroup", back_populates="members")

    def __repr__(self):
        return f"<WalletGroupMember(id={self.id}, wallet='{self.wallet_address[:10]}...', chain='{self.chain}')>"


class TransferType(str, enum.Enum):
    """Inter-wallet transfer types"""
    INTERNAL = "internal"  # Between wallets in same group
    EXTERNAL_IN = "external_in"  # From external wallet to group
    EXTERNAL_OUT = "external_out"  # From group to external wallet


class InterWalletTransfer(Base):
    """
    Inter-Wallet Transfer Detection
    
    Tracks transfers between wallets in the same group to avoid
    double-counting and incorrect cost basis calculations.
    """
    __tablename__ = "inter_wallet_transfers"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("wallet_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # From wallet
    from_wallet_address = Column(String(255), nullable=False, index=True)
    from_chain = Column(String(50), nullable=False)
    from_tx_hash = Column(String(255), nullable=False, index=True)
    
    # To wallet
    to_wallet_address = Column(String(255), nullable=False, index=True)
    to_chain = Column(String(50), nullable=False)
    to_tx_hash = Column(String(255), nullable=True, index=True)
    
    # Transfer details
    token = Column(String(50), nullable=False)
    token_address = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    
    # Transfer classification
    transfer_type = Column(SQLEnum(TransferType), nullable=False, default=TransferType.INTERNAL)
    is_confirmed = Column(Boolean, default=False)
    confidence_score = Column(Float, default=1.0)  # 0.0-1.0
    
    # Tax implications
    is_taxable = Column(Boolean, default=False)  # Usually false for internal transfers
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

    # Relationships
    group = relationship("WalletGroup", back_populates="transfers")

    def __repr__(self):
        return f"<InterWalletTransfer(id={self.id}, {self.from_wallet_address[:10]}→{self.to_wallet_address[:10]}, {self.amount} {self.token})>"


class ConsolidatedBalance(Base):
    """
    Consolidated Balance Snapshot
    
    Periodic snapshots of total balance across all wallets in a group.
    Useful for performance tracking and analytics.
    """
    __tablename__ = "consolidated_balances"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("wallet_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    
    token = Column(String(50), nullable=False, index=True)
    token_address = Column(String(255), nullable=True)
    chain = Column(String(50), nullable=False)
    
    total_amount = Column(Float, nullable=False)
    total_value_usd = Column(Float, nullable=False)
    avg_cost_basis = Column(Float, nullable=True)
    
    # Performance metrics
    unrealized_gain_loss = Column(Float, nullable=True)
    unrealized_gain_loss_percent = Column(Float, nullable=True)
    
    snapshot_at = Column(DateTime, nullable=False, index=True, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

    def __repr__(self):
        return f"<ConsolidatedBalance(group_id={self.group_id}, {self.total_amount} {self.token}, ${self.total_value_usd})>"
