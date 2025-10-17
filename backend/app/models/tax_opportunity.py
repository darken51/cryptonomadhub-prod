"""
Tax Optimization Opportunity Models

Tracks tax-loss harvesting opportunities and optimal timing for asset sales.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class OpportunityType(str, enum.Enum):
    """Types of tax optimization opportunities"""
    TAX_LOSS_HARVEST = "tax_loss_harvest"  # Sell at loss to offset gains
    LONG_TERM_WAIT = "long_term_wait"  # Wait for long-term capital gains rate
    OPTIMAL_TIMING = "optimal_timing"  # Optimal time to sell based on tax year
    WASH_SALE_AVOIDANCE = "wash_sale_avoidance"  # Avoid wash sale violations
    JURISDICTIONAL = "jurisdictional"  # Optimize based on tax jurisdiction


class OpportunityStatus(str, enum.Enum):
    """Status of optimization opportunity"""
    ACTIVE = "active"  # Available to execute
    EXECUTED = "executed"  # User has executed this opportunity
    EXPIRED = "expired"  # No longer relevant (e.g., price changed, time passed)
    DISMISSED = "dismissed"  # User dismissed this suggestion


class TaxOpportunity(Base):
    """
    Tax Optimization Opportunity

    Represents a specific tax optimization action the user can take.
    """
    __tablename__ = "tax_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Opportunity details
    opportunity_type = Column(Enum(OpportunityType), nullable=False, index=True)
    status = Column(Enum(OpportunityStatus), default=OpportunityStatus.ACTIVE, nullable=False)

    # Asset information
    token = Column(String(50), nullable=False)
    token_address = Column(String(255), nullable=True)
    chain = Column(String(50), nullable=False)

    # Current position
    current_amount = Column(Float, nullable=False)
    current_price_usd = Column(Float, nullable=False)
    cost_basis_per_unit = Column(Float, nullable=False)
    current_value_usd = Column(Float, nullable=False)

    # Gain/Loss
    unrealized_gain_loss = Column(Float, nullable=False)
    unrealized_gain_loss_percent = Column(Float, nullable=False)

    # Tax implications
    potential_savings = Column(Float, nullable=False)  # Estimated tax savings in USD
    tax_year = Column(Integer, nullable=False)  # Which tax year this applies to

    # Action details
    recommended_action = Column(Text, nullable=False)  # "Sell 5.5 ETH to harvest $2,500 loss"
    action_description = Column(Text, nullable=False)  # Full explanation
    deadline = Column(DateTime, nullable=True)  # Deadline to execute (e.g., end of tax year)

    # Risk/Confidence
    confidence_score = Column(Float, default=0.8)  # 0.0-1.0
    risk_level = Column(String(20), default="low")  # low, medium, high

    # Related lots (for cost basis tracking)
    related_lot_ids = Column(Text, nullable=True)  # JSON array of lot IDs

    # Execution tracking
    executed_at = Column(DateTime, nullable=True)
    execution_tx_hash = Column(String(255), nullable=True)
    actual_savings = Column(Float, nullable=True)  # Actual savings after execution

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True, index=True)

    # Relationships
    user = relationship("User")


class TaxHarvestingTransaction(Base):
    """
    Tax-Loss Harvesting Transaction

    Records executed tax-loss harvesting transactions.
    """
    __tablename__ = "tax_harvesting_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("tax_opportunities.id"), nullable=True)

    # Transaction details
    token = Column(String(50), nullable=False)
    chain = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)

    # Prices
    cost_basis_per_unit = Column(Float, nullable=False)
    sale_price_per_unit = Column(Float, nullable=False)

    # Realized loss
    realized_loss = Column(Float, nullable=False)  # Should be negative
    tax_savings = Column(Float, nullable=False)  # Positive value

    # Transaction IDs
    sale_tx_hash = Column(String(255), nullable=True)
    repurchase_tx_hash = Column(String(255), nullable=True)  # If user repurchased

    # Timing
    sale_date = Column(DateTime, nullable=False)
    repurchase_date = Column(DateTime, nullable=True)

    # Wash sale tracking
    is_wash_sale = Column(Boolean, default=False)
    wash_sale_days = Column(Integer, nullable=True)

    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    opportunity = relationship("TaxOpportunity")


class TaxOptimizationSettings(Base):
    """
    User preferences for tax optimization
    """
    __tablename__ = "tax_optimization_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Strategy preferences
    enable_tax_loss_harvesting = Column(Boolean, default=True)
    enable_timing_optimization = Column(Boolean, default=True)
    enable_wash_sale_alerts = Column(Boolean, default=True)

    # Risk tolerance
    min_opportunity_savings = Column(Float, default=100.0)  # Min $ savings to show opportunity
    max_risk_level = Column(String(20), default="medium")  # low, medium, high

    # Tax settings
    tax_jurisdiction = Column(String(10), default="US")
    marginal_tax_rate = Column(Float, nullable=True)  # User's marginal tax rate (optional)
    capital_gains_rate_short = Column(Float, nullable=True)
    capital_gains_rate_long = Column(Float, nullable=True)

    # Notification preferences
    notify_on_opportunities = Column(Boolean, default=True)
    notify_days_before_deadline = Column(Integer, default=7)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User")
