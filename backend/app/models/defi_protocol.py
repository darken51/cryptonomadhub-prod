"""
DeFi Protocol Models

Models for tracking DeFi protocols, transactions, and audit results
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class ProtocolType(str, enum.Enum):
    """DeFi Protocol Types"""
    DEX = "dex"  # Decentralized Exchange (Uniswap, Sushiswap)
    LENDING = "lending"  # Lending protocols (Aave, Compound)
    YIELD = "yield"  # Yield aggregators (Yearn, Beefy)
    STAKING = "staking"  # Staking protocols
    LIQUIDITY_POOL = "liquidity_pool"  # Liquidity pools
    OTHER = "other"


class TransactionType(str, enum.Enum):
    """DeFi Transaction Types"""
    SWAP = "swap"  # Token swap
    PROVIDE_LIQUIDITY = "provide_liquidity"  # Add liquidity to pool
    REMOVE_LIQUIDITY = "remove_liquidity"  # Remove liquidity from pool
    STAKE = "stake"  # Stake tokens
    UNSTAKE = "unstake"  # Unstake tokens
    LEND = "lend"  # Lend tokens
    BORROW = "borrow"  # Borrow tokens
    REPAY = "repay"  # Repay loan
    CLAIM_REWARDS = "claim_rewards"  # Claim rewards
    DEPOSIT = "deposit"  # Generic deposit
    WITHDRAW = "withdraw"  # Generic withdraw


class DeFiProtocol(Base):
    """
    DeFi Protocol information

    Stores metadata about supported DeFi protocols
    """
    __tablename__ = "defi_protocols"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # e.g., "Uniswap V3"
    protocol_type = Column(Enum(ProtocolType), nullable=False)
    chain = Column(String(50), nullable=False)  # e.g., "ethereum", "polygon", "bsc"
    contract_address = Column(String(255), nullable=True)  # Main contract address
    description = Column(Text, nullable=True)
    website_url = Column(String(255), nullable=True)
    docs_url = Column(String(255), nullable=True)
    supported = Column(String(20), default="active")  # active, deprecated, planned

    # Tax-related metadata
    default_tax_category = Column(String(50), nullable=True)  # e.g., "capital_gains", "income"

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transactions = relationship("DeFiTransaction", back_populates="protocol")


class DeFiTransaction(Base):
    """
    Parsed DeFi Transaction

    Stores individual DeFi transactions with categorization
    """
    __tablename__ = "defi_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    protocol_id = Column(Integer, ForeignKey("defi_protocols.id"), nullable=True)
    audit_id = Column(Integer, ForeignKey("defi_audits.id"), nullable=True)

    # Transaction details
    tx_hash = Column(String(255), unique=True, nullable=False, index=True)
    chain = Column(String(50), nullable=False)
    block_number = Column(Integer, nullable=True)
    timestamp = Column(DateTime, nullable=False)

    # Transaction type and category
    transaction_type = Column(Enum(TransactionType), nullable=False)
    tax_category = Column(String(50), nullable=False)  # capital_gains, income, non_taxable

    # Token information
    token_in = Column(String(50), nullable=True)  # Token sent
    amount_in = Column(Float, nullable=True)
    token_out = Column(String(50), nullable=True)  # Token received
    amount_out = Column(Float, nullable=True)

    # USD values at time of transaction
    usd_value_in = Column(Float, nullable=True)
    usd_value_out = Column(Float, nullable=True)

    # Fees
    gas_fee_usd = Column(Float, nullable=True)
    protocol_fee_usd = Column(Float, nullable=True)

    # Tax calculation
    gain_loss_usd = Column(Float, nullable=True)  # Calculated gain/loss
    holding_period_days = Column(Integer, nullable=True)  # For short/long-term determination

    # Raw data
    raw_data = Column(JSON, nullable=True)  # Store full transaction data

    # User notes
    notes = Column(Text, nullable=True)
    manually_verified = Column(String(20), default="pending")  # pending, verified, disputed

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    protocol = relationship("DeFiProtocol", back_populates="transactions")
    user = relationship("User")
    audit = relationship("DeFiAudit", back_populates="transactions")


class DeFiAudit(Base):
    """
    DeFi Audit Result

    Stores complete audit results for a user's DeFi activity
    """
    __tablename__ = "defi_audits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Audit period
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)

    # Chains audited
    chains = Column(JSON, nullable=False)  # ["ethereum", "polygon", "bsc"]

    # Summary statistics
    total_transactions = Column(Integer, default=0)
    total_volume_usd = Column(Float, default=0.0)
    total_gains_usd = Column(Float, default=0.0)
    total_losses_usd = Column(Float, default=0.0)
    total_fees_usd = Column(Float, default=0.0)

    # Tax breakdown
    short_term_gains = Column(Float, default=0.0)
    long_term_gains = Column(Float, default=0.0)
    ordinary_income = Column(Float, default=0.0)

    # Protocols breakdown
    protocols_used = Column(JSON, nullable=True)  # {"uniswap": {"volume": 1000, "txs": 5}, ...}

    # Status
    status = Column(String(20), default="processing")  # processing, completed, failed
    error_message = Column(Text, nullable=True)

    # Results
    result_summary = Column(JSON, nullable=True)  # Detailed results

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User")
    transactions = relationship("DeFiTransaction", back_populates="audit")
