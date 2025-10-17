"""
Yield Farming Position Model

Track liquidity pools, staking positions, and yield farming for tax reporting.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class YieldPosition(Base):
    """
    Active or historical yield farming position
    
    Tracks LP tokens, staking, lending positions with rewards.
    """
    __tablename__ = "yield_positions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    audit_id = Column(Integer, ForeignKey("defi_audits.id"), nullable=True, index=True)
    
    # Position identification
    position_type = Column(String(50), nullable=False, index=True)
    # liquidity_pool, staking, lending, borrowing, farming
    
    protocol_name = Column(String(100), nullable=False, index=True)
    # Uniswap, Curve, Aave, Compound, Convex, Yearn, etc.
    
    protocol_address = Column(String(255), nullable=True)
    chain = Column(String(50), nullable=False, index=True)
    
    # Position details
    pool_name = Column(String(255), nullable=True)  # ETH-USDC, DAI-USDT, etc.
    lp_token_address = Column(String(255), nullable=True)  # LP token contract
    lp_token_amount = Column(Float, nullable=True)  # Amount of LP tokens
    
    # Assets deposited
    token_a = Column(String(50), nullable=True)  # First token (e.g., ETH)
    token_b = Column(String(50), nullable=True)  # Second token (e.g., USDC)
    amount_a = Column(Float, nullable=True)  # Amount of token A deposited
    amount_b = Column(Float, nullable=True)  # Amount of token B deposited
    
    # Single asset (staking, lending)
    single_token = Column(String(50), nullable=True)  # For single-sided staking
    single_amount = Column(Float, nullable=True)
    
    # Financial tracking
    deposit_value_usd = Column(Float, nullable=True)  # USD value when deposited
    current_value_usd = Column(Float, nullable=True)  # Current USD value
    
    # Rewards earned
    total_rewards_usd = Column(Float, default=0.0)  # Total rewards in USD
    rewards_claimed_usd = Column(Float, default=0.0)  # Already claimed
    rewards_unclaimed_usd = Column(Float, default=0.0)  # Pending
    
    # Reward tokens
    reward_tokens = Column(JSON, nullable=True)  # List of reward token symbols
    # Example: ["UNI", "WETH"]
    
    # APY tracking
    apy_at_deposit = Column(Float, nullable=True)  # APY when position opened
    current_apy = Column(Float, nullable=True)  # Current APY
    
    # Impermanent loss (for LPs)
    impermanent_loss_usd = Column(Float, nullable=True)
    impermanent_loss_pct = Column(Float, nullable=True)
    
    # Position status
    status = Column(String(20), default="active", index=True)
    # active, closed, partial
    
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    opened_at = Column(DateTime, nullable=False, index=True)
    closed_at = Column(DateTime, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Transaction hashes
    deposit_tx_hash = Column(String(255), nullable=True)
    withdraw_tx_hash = Column(String(255), nullable=True)
    
    # Tax implications
    holding_period_days = Column(Integer, nullable=True)
    total_gain_loss_usd = Column(Float, nullable=True)  # Including IL
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    audit = relationship("DeFiAudit")
    rewards = relationship("YieldReward", back_populates="position")
    
    def __repr__(self):
        return f"<YieldPosition {self.protocol_name} - {self.pool_name or self.single_token}>"


class YieldReward(Base):
    """
    Individual reward claim from yield farming
    """
    __tablename__ = "yield_rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    position_id = Column(Integer, ForeignKey("yield_positions.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Reward details
    reward_token = Column(String(50), nullable=False)
    reward_amount = Column(Float, nullable=False)
    reward_value_usd = Column(Float, nullable=True)
    
    # Transaction
    tx_hash = Column(String(255), nullable=True)
    claim_date = Column(DateTime, nullable=False, index=True)
    
    # Tax categorization
    tax_category = Column(String(50), default="income")  # income, capital_gains
    is_taxable = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    position = relationship("YieldPosition", back_populates="rewards")
    user = relationship("User")
    
    def __repr__(self):
        return f"<YieldReward {self.reward_amount} {self.reward_token}>"
