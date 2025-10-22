"""
Cost Basis Tracking Models

Tracks cost basis for crypto assets to calculate accurate capital gains/losses.
Supports FIFO, LIFO, HIFO, and Specific Identification methods.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class CostBasisMethod(str, enum.Enum):
    """Cost Basis Calculation Methods"""
    FIFO = "fifo"  # First In First Out (default for most countries)
    LIFO = "lifo"  # Last In First Out
    HIFO = "hifo"  # Highest In First Out (tax optimization)
    SPECIFIC_ID = "specific_id"  # Manual lot selection
    AVERAGE_COST = "average_cost"  # Average cost basis


class AcquisitionMethod(str, enum.Enum):
    """How the asset was acquired"""
    PURCHASE = "purchase"  # Bought with fiat/crypto
    SWAP = "swap"  # Received from token swap
    AIRDROP = "airdrop"  # Free airdrop
    MINING = "mining"  # Mining/staking rewards
    FORK = "fork"  # Hard fork
    GIFT = "gift"  # Received as gift
    TRANSFER_IN = "transfer_in"  # Transferred from another wallet
    UNKNOWN = "unknown"


class CostBasisLot(Base):
    """
    Individual Cost Basis Lot

    Represents a specific acquisition of an asset with its cost basis.
    Used for FIFO/LIFO/HIFO calculations.
    """
    __tablename__ = "cost_basis_lots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Asset identification
    token = Column(String(50), nullable=False, index=True)  # e.g., "ETH", "USDC"
    token_address = Column(String(255), nullable=True)  # Contract address if ERC20
    chain = Column(String(50), nullable=False)  # e.g., "ethereum", "polygon"
    wallet_address = Column(String(255), nullable=True, index=True)  # Wallet that acquired the asset

    # Acquisition details
    acquisition_date = Column(DateTime, nullable=False, index=True)
    acquisition_method = Column(Enum(AcquisitionMethod), nullable=False)
    acquisition_price_usd = Column(Numeric(20, 10), nullable=False)  # Unit price in USD
    source_tx_hash = Column(String(255), nullable=True, index=True)  # Original transaction
    source_audit_id = Column(Integer, ForeignKey("defi_audits.id", ondelete="SET NULL"), nullable=True, index=True)  # DeFi audit that created this lot

    # Multi-currency support
    acquisition_price_local = Column(Numeric(20, 10), nullable=True)  # Price in local currency
    local_currency = Column(String(3), nullable=True, index=True)  # Currency code (EUR, GBP, etc.)
    exchange_rate = Column(Numeric(20, 10), nullable=True)  # USD to local currency rate
    exchange_rate_source = Column(String(50), nullable=True)  # "ECB", "EXCHANGERATE_API", etc.
    exchange_rate_date = Column(DateTime, nullable=True)  # Date of exchange rate

    # Amounts
    original_amount = Column(Numeric(20, 10), nullable=False)  # Original amount acquired
    remaining_amount = Column(Numeric(20, 10), nullable=False)  # Amount still held (for FIFO)
    disposed_amount = Column(Numeric(20, 10), default=0.0)  # Amount already sold/disposed

    # Metadata
    notes = Column(Text, nullable=True)
    manually_added = Column(Boolean, default=False)  # Was this manually entered?
    verified = Column(Boolean, default=False)  # User verified this lot

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User")
    disposals = relationship("CostBasisDisposal", back_populates="lot")

    # Table constraints
    __table_args__ = (
        CheckConstraint('remaining_amount >= 0', name='check_remaining_positive'),
        CheckConstraint('disposed_amount >= 0', name='check_disposed_positive'),
        CheckConstraint('original_amount > 0', name='check_original_positive'),
        CheckConstraint('acquisition_price_usd >= 0', name='check_price_positive'),
    )


class CostBasisDisposal(Base):
    """
    Disposal (Sale/Swap) of a Cost Basis Lot

    Tracks when a portion of a lot is sold/swapped to calculate gain/loss.
    """
    __tablename__ = "cost_basis_disposals"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("cost_basis_lots.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Disposal details
    disposal_date = Column(DateTime, nullable=False, index=True)
    disposal_price_usd = Column(Numeric(20, 10), nullable=False)  # Sale price per unit
    amount_disposed = Column(Numeric(20, 10), nullable=False)  # Amount sold
    disposal_tx_hash = Column(String(255), nullable=True, index=True)

    # Multi-currency support
    disposal_price_local = Column(Numeric(20, 10), nullable=True)  # Sale price in local currency
    local_currency = Column(String(3), nullable=True, index=True)  # Currency code
    exchange_rate = Column(Numeric(20, 10), nullable=True)  # USD to local currency rate
    exchange_rate_source = Column(String(50), nullable=True)  # Exchange rate source

    # Calculated values
    cost_basis_per_unit = Column(Numeric(20, 10), nullable=False)  # From lot
    total_cost_basis = Column(Numeric(20, 10), nullable=False)  # cost_basis_per_unit * amount
    total_proceeds = Column(Numeric(20, 10), nullable=False)  # disposal_price * amount
    gain_loss = Column(Numeric(20, 10), nullable=False)  # proceeds - cost_basis
    holding_period_days = Column(Integer, nullable=False)  # Days held

    # Calculated values in local currency
    total_cost_basis_local = Column(Numeric(20, 10), nullable=True)  # Cost basis in local currency
    total_proceeds_local = Column(Numeric(20, 10), nullable=True)  # Proceeds in local currency
    gain_loss_local = Column(Numeric(20, 10), nullable=True)  # Gain/loss in local currency

    # Tax classification
    is_short_term = Column(Boolean, nullable=False)  # < 1 year
    is_long_term = Column(Boolean, nullable=False)  # >= 1 year

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lot = relationship("CostBasisLot", back_populates="disposals")
    user = relationship("User")


class UserCostBasisSettings(Base):
    """
    User preferences for cost basis calculations
    """
    __tablename__ = "user_cost_basis_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Calculation method
    default_method = Column(
        Enum(CostBasisMethod),
        default=CostBasisMethod.FIFO,
        nullable=False
    )

    # Tax jurisdiction (set from User.current_country on creation)
    tax_jurisdiction = Column(String(10), nullable=True)  # ISO country code, no default
    tax_year_start = Column(Integer, default=1)  # Month (1 = January)

    # Wash sale rule (US only - should be False by default, enabled only for US jurisdiction)
    apply_wash_sale_rule = Column(Boolean, default=False)
    wash_sale_days = Column(Integer, default=30)  # 30 days for US

    # Tracking preferences
    track_inter_wallet_transfers = Column(Boolean, default=False)  # Ignore or track
    auto_import_enabled = Column(Boolean, default=True)

    # Multi-currency preferences
    reporting_currency = Column(String(3), nullable=True)  # Currency for reports (auto-set from tax_jurisdiction)
    preferred_exchange_source = Column(String(50), nullable=True)  # Preferred exchange rate source
    show_dual_currency = Column(Boolean, default=True)  # Show both USD and local currency

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User")


class WashSaleViolation(Base):
    """
    Wash Sale Rule Violations (US Tax Law)

    Tracks when a substantially identical security is repurchased within 30 days
    of a loss sale, requiring cost basis adjustment.
    """
    __tablename__ = "wash_sale_violations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Original loss sale
    loss_disposal_id = Column(Integer, ForeignKey("cost_basis_disposals.id"), nullable=False)
    loss_amount = Column(Numeric(20, 10), nullable=False)  # Original loss

    # Repurchase within wash sale period
    repurchase_lot_id = Column(Integer, ForeignKey("cost_basis_lots.id"), nullable=False)
    repurchase_date = Column(DateTime, nullable=False)
    days_between = Column(Integer, nullable=False)  # Should be <= 30

    # Adjusted values
    disallowed_loss = Column(Numeric(20, 10), nullable=False)  # Loss that can't be claimed now
    adjusted_cost_basis = Column(Numeric(20, 10), nullable=False)  # New cost basis with loss added

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    loss_disposal = relationship("CostBasisDisposal", foreign_keys=[loss_disposal_id])
    repurchase_lot = relationship("CostBasisLot", foreign_keys=[repurchase_lot_id])
