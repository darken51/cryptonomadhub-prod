"""
Wallet Snapshot Model

Stores daily snapshots of wallet values for historical tracking.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, JSON, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class WalletSnapshot(Base):
    """
    Daily snapshot of wallet portfolio value

    Used to calculate 24h/7d/30d changes and generate charts.
    One snapshot per wallet per day at 00:00 UTC.
    """
    __tablename__ = "wallet_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    wallet_id = Column(Integer, ForeignKey("user_wallets.id"), nullable=True, index=True)  # null = consolidated

    # Snapshot metadata
    snapshot_date = Column(DateTime, nullable=False, index=True)

    # USD values
    total_value_usd = Column(Numeric(20, 8), nullable=False, default=0)
    total_cost_basis = Column(Numeric(20, 8), nullable=False, default=0)
    total_unrealized_gain_loss = Column(Numeric(20, 8), nullable=False, default=0)
    unrealized_gain_loss_percent = Column(Numeric(10, 4), nullable=False, default=0)

    # Local currency values
    total_value_local = Column(Numeric(20, 8), nullable=True)
    total_cost_basis_local = Column(Numeric(20, 8), nullable=True)
    total_unrealized_gain_loss_local = Column(Numeric(20, 8), nullable=True)
    local_currency = Column(String(3), nullable=True)
    currency_symbol = Column(String(5), nullable=True)
    exchange_rate = Column(Numeric(20, 8), nullable=True)

    # Detailed positions (JSON array)
    # [{token, chain, amount, value_usd, cost_basis, price, value_local}]
    positions = Column(JSON, nullable=True)

    # Stats
    total_tokens = Column(Integer, default=0)
    total_chains = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="wallet_snapshots")
    wallet = relationship("UserWallet", back_populates="snapshots")

    # Indexes for fast queries
    __table_args__ = (
        Index('idx_wallet_snapshot_date', 'wallet_id', 'snapshot_date'),
        Index('idx_user_snapshot_date', 'user_id', 'snapshot_date'),
    )

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "wallet_id": self.wallet_id,
            "snapshot_date": self.snapshot_date.isoformat() if self.snapshot_date else None,
            "total_value_usd": float(self.total_value_usd) if self.total_value_usd else 0,
            "total_cost_basis": float(self.total_cost_basis) if self.total_cost_basis else 0,
            "total_unrealized_gain_loss": float(self.total_unrealized_gain_loss) if self.total_unrealized_gain_loss else 0,
            "unrealized_gain_loss_percent": float(self.unrealized_gain_loss_percent) if self.unrealized_gain_loss_percent else 0,
            "total_value_local": float(self.total_value_local) if self.total_value_local else None,
            "total_cost_basis_local": float(self.total_cost_basis_local) if self.total_cost_basis_local else None,
            "total_unrealized_gain_loss_local": float(self.total_unrealized_gain_loss_local) if self.total_unrealized_gain_loss_local else None,
            "local_currency": self.local_currency,
            "currency_symbol": self.currency_symbol,
            "exchange_rate": float(self.exchange_rate) if self.exchange_rate else None,
            "positions": self.positions,
            "total_tokens": self.total_tokens,
            "total_chains": self.total_chains,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
