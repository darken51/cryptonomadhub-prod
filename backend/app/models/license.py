"""
License Model for Subscription Management

Handles freemium pricing tiers with usage limits:
- FREE: 5 simulations/month, no DeFi audit, no PDF export
- STARTER: 50 simulations/month, 5 DeFi audits/month, unlimited PDF
- PRO: 500 simulations/month, 50 DeFi audits/month, unlimited PDF
- ENTERPRISE: Unlimited everything
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from app.database import Base


class LicenseTier(str, enum.Enum):
    """License tiers matching Paddle plans"""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class SubscriptionStatus(str, enum.Enum):
    """Paddle subscription statuses"""
    ACTIVE = "active"
    TRIALING = "trialing"
    PAST_DUE = "past_due"
    PAUSED = "paused"
    DELETED = "deleted"
    CANCELLED = "cancelled"


class License(Base):
    """
    User license/subscription model

    Tracks Paddle subscription and enforces usage limits per tier
    """
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # License info
    tier = Column(SQLEnum(LicenseTier), default=LicenseTier.FREE, nullable=False)
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)

    # Paddle subscription info
    paddle_subscription_id = Column(String(255), unique=True, nullable=True, index=True)
    paddle_plan_id = Column(String(255), nullable=True)
    paddle_user_id = Column(String(255), nullable=True)
    paddle_email = Column(String(255), nullable=True)

    # Billing
    amount = Column(Float, nullable=True)  # Monthly amount in USD
    currency = Column(String(10), default="USD")
    billing_period = Column(String(50), default="monthly")  # monthly, yearly

    # Dates
    created_at = Column(DateTime, default=datetime.utcnow)
    activated_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    next_billing_date = Column(DateTime, nullable=True)

    # Usage tracking (reset monthly)
    simulations_used = Column(Integer, default=0)
    defi_audits_used = Column(Integer, default=0)
    pdf_exports_used = Column(Integer, default=0)
    chat_messages_used = Column(Integer, default=0)

    # Last reset date
    usage_reset_at = Column(DateTime, default=datetime.utcnow)

    # Trial
    is_trial = Column(Boolean, default=False)
    trial_ends_at = Column(DateTime, nullable=True)

    # Feature flags
    auto_renew = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="license")

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tier": self.tier.value,
            "status": self.status.value,
            "paddle_subscription_id": self.paddle_subscription_id,
            "amount": self.amount,
            "currency": self.currency,
            "billing_period": self.billing_period,
            "created_at": self.created_at.isoformat(),
            "activated_at": self.activated_at.isoformat() if self.activated_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "next_billing_date": self.next_billing_date.isoformat() if self.next_billing_date else None,
            "simulations_used": self.simulations_used,
            "defi_audits_used": self.defi_audits_used,
            "pdf_exports_used": self.pdf_exports_used,
            "chat_messages_used": self.chat_messages_used,
            "usage_reset_at": self.usage_reset_at.isoformat(),
            "limits": self.get_limits(),
            "remaining": self.get_remaining(),
            "is_trial": self.is_trial,
            "trial_ends_at": self.trial_ends_at.isoformat() if self.trial_ends_at else None,
        }

    def get_limits(self) -> dict:
        """Get usage limits for current tier"""
        limits = {
            LicenseTier.FREE: {
                "simulations": 5,
                "defi_audits": 0,
                "pdf_exports": 0,
                "chat_messages": 20,
            },
            LicenseTier.STARTER: {
                "simulations": 50,
                "defi_audits": 5,
                "pdf_exports": 999999,  # Unlimited
                "chat_messages": 200,
            },
            LicenseTier.PRO: {
                "simulations": 500,
                "defi_audits": 50,
                "pdf_exports": 999999,
                "chat_messages": 2000,
            },
            LicenseTier.ENTERPRISE: {
                "simulations": 999999,
                "defi_audits": 999999,
                "pdf_exports": 999999,
                "chat_messages": 999999,
            }
        }
        return limits.get(self.tier, limits[LicenseTier.FREE])

    def get_remaining(self) -> dict:
        """Get remaining usage for current billing period"""
        limits = self.get_limits()
        return {
            "simulations": max(0, limits["simulations"] - self.simulations_used),
            "defi_audits": max(0, limits["defi_audits"] - self.defi_audits_used),
            "pdf_exports": max(0, limits["pdf_exports"] - self.pdf_exports_used),
            "chat_messages": max(0, limits["chat_messages"] - self.chat_messages_used),
        }

    def can_use(self, resource: str) -> bool:
        """
        Check if user can use a specific resource

        Args:
            resource: "simulations", "defi_audits", "pdf_exports", "chat_messages"

        Returns:
            True if user has remaining quota, False otherwise
        """
        remaining = self.get_remaining()
        return remaining.get(resource, 0) > 0

    def increment_usage(self, resource: str, amount: int = 1):
        """
        Increment usage counter for a resource

        Args:
            resource: "simulations", "defi_audits", "pdf_exports", "chat_messages"
            amount: Amount to increment (default 1)
        """
        if resource == "simulations":
            self.simulations_used += amount
        elif resource == "defi_audits":
            self.defi_audits_used += amount
        elif resource == "pdf_exports":
            self.pdf_exports_used += amount
        elif resource == "chat_messages":
            self.chat_messages_used += amount

    def reset_usage(self):
        """Reset all usage counters (called monthly)"""
        self.simulations_used = 0
        self.defi_audits_used = 0
        self.pdf_exports_used = 0
        self.chat_messages_used = 0
        self.usage_reset_at = datetime.utcnow()

    def is_active(self) -> bool:
        """Check if license is active and not expired"""
        if self.status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]:
            return False

        # Check expiration
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return False

        return True

    def days_until_renewal(self) -> int:
        """Get days until next billing date"""
        if not self.next_billing_date:
            return -1

        delta = self.next_billing_date - datetime.utcnow()
        return max(0, delta.days)
