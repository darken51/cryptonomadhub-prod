"""
User Wallet Model

Allows users to link multiple wallets for consolidated cost basis tracking.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class UserWallet(Base):
    """
    User's linked wallet addresses

    Supports multi-wallet portfolios with consolidated cost basis.
    """
    __tablename__ = "user_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Wallet identification
    wallet_address = Column(String(255), nullable=False, index=True)
    chain = Column(String(50), nullable=False)  # ethereum, polygon, arbitrum, etc.
    wallet_name = Column(String(100), nullable=True)  # User-friendly name

    # Metadata
    is_primary = Column(Boolean, default=False)  # Primary wallet for this chain
    is_active = Column(Boolean, default=True)  # Can be disabled without deleting

    # Tracking
    first_transaction_date = Column(DateTime, nullable=True)
    last_sync_date = Column(DateTime, nullable=True)
    total_transactions = Column(Integer, default=0)

    # Notes
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="wallets")
    snapshots = relationship("WalletSnapshot", back_populates="wallet", cascade="all, delete-orphan")
    value_history = relationship("WalletValueHistory", back_populates="wallet", cascade="all, delete-orphan")

    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'wallet_address', 'chain',
                        name='uq_user_wallet_chain'),
    )
