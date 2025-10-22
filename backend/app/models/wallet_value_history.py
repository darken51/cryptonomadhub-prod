"""
Wallet Value History Model

Tracks intraday value changes for real-time monitoring and alerts.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, Numeric, Index, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class WalletValueHistory(Base):
    """
    High-frequency wallet value tracking

    Stores value snapshots for calculating recent changes (1h, 24h).
    More frequent than WalletSnapshot (which is daily).
    """
    __tablename__ = "wallet_value_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    wallet_id = Column(Integer, ForeignKey("user_wallets.id"), nullable=True, index=True)  # null = consolidated

    # Timestamp of this value record
    timestamp = Column(DateTime, nullable=False, index=True, default=datetime.utcnow)

    # USD values
    total_value_usd = Column(Numeric(20, 8), nullable=False, default=0)

    # Changes vs previous record
    change_1h_usd = Column(Numeric(20, 8), nullable=True)
    change_1h_percent = Column(Numeric(10, 4), nullable=True)
    change_24h_usd = Column(Numeric(20, 8), nullable=True)
    change_24h_percent = Column(Numeric(10, 4), nullable=True)

    # Local currency
    total_value_local = Column(Numeric(20, 8), nullable=True)
    change_24h_local = Column(Numeric(20, 8), nullable=True)
    local_currency = Column(String(3), nullable=True)
    currency_symbol = Column(String(5), nullable=True)

    # Relationships
    user = relationship("User")
    wallet = relationship("UserWallet", back_populates="value_history")

    # Indexes for fast time-series queries
    __table_args__ = (
        Index('idx_wallet_value_time', 'wallet_id', 'timestamp'),
        Index('idx_user_value_time', 'user_id', 'timestamp'),
    )

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "wallet_id": self.wallet_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "total_value_usd": float(self.total_value_usd) if self.total_value_usd else 0,
            "change_1h_usd": float(self.change_1h_usd) if self.change_1h_usd else None,
            "change_1h_percent": float(self.change_1h_percent) if self.change_1h_percent else None,
            "change_24h_usd": float(self.change_24h_usd) if self.change_24h_usd else None,
            "change_24h_percent": float(self.change_24h_percent) if self.change_24h_percent else None,
            "total_value_local": float(self.total_value_local) if self.total_value_local else None,
            "change_24h_local": float(self.change_24h_local) if self.change_24h_local else None,
            "local_currency": self.local_currency,
            "currency_symbol": self.currency_symbol
        }
