"""
License Service

Manages user licenses, subscriptions, and usage limits
Handles Paddle subscription lifecycle
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app.models.license import License, LicenseTier, SubscriptionStatus
from app.models.user import User
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class LicenseService:
    """Service for managing user licenses and subscriptions"""

    def __init__(self, db: Session):
        self.db = db

    def create_free_license(self, user_id: int) -> License:
        """
        Create a free license for a new user

        Called automatically during user registration
        """
        license = License(
            user_id=user_id,
            tier=LicenseTier.FREE,
            status=SubscriptionStatus.ACTIVE,
            activated_at=datetime.utcnow()
        )

        self.db.add(license)
        self.db.commit()
        self.db.refresh(license)

        logger.info(f"Created FREE license for user {user_id}")
        return license

    def get_user_license(self, user_id: int) -> Optional[License]:
        """Get license for a user"""
        return self.db.query(License).filter(License.user_id == user_id).first()

    def upgrade_license(
        self,
        user_id: int,
        tier: LicenseTier,
        paddle_subscription_id: str,
        paddle_plan_id: str,
        paddle_email: str,
        amount: float,
        currency: str = "USD",
        billing_period: str = "monthly"
    ) -> License:
        """
        Upgrade user license after Paddle subscription created

        Args:
            user_id: User ID
            tier: New tier (STARTER, PRO, ENTERPRISE)
            paddle_subscription_id: Paddle subscription ID
            paddle_plan_id: Paddle plan ID
            paddle_email: User's Paddle email
            amount: Monthly amount in USD
            currency: Currency code
            billing_period: Billing period (monthly, yearly)

        Returns:
            Updated license
        """
        license = self.get_user_license(user_id)

        if not license:
            # Create new license if doesn't exist
            license = License(user_id=user_id)
            self.db.add(license)

        # Update license
        license.tier = tier
        license.status = SubscriptionStatus.ACTIVE
        license.paddle_subscription_id = paddle_subscription_id
        license.paddle_plan_id = paddle_plan_id
        license.paddle_email = paddle_email
        license.amount = amount
        license.currency = currency
        license.billing_period = billing_period
        license.activated_at = datetime.utcnow()

        # Set next billing date
        if billing_period == "yearly":
            license.next_billing_date = datetime.utcnow() + timedelta(days=365)
        else:
            license.next_billing_date = datetime.utcnow() + timedelta(days=30)

        # Reset usage counters on upgrade
        license.reset_usage()

        self.db.commit()
        self.db.refresh(license)

        logger.info(f"Upgraded user {user_id} to {tier.value} - Paddle subscription: {paddle_subscription_id}")
        return license

    def downgrade_to_free(self, user_id: int, reason: str = "subscription_cancelled") -> License:
        """
        Downgrade user to FREE tier

        Called when subscription is cancelled or payment fails
        """
        license = self.get_user_license(user_id)

        if not license:
            return self.create_free_license(user_id)

        # Downgrade
        license.tier = LicenseTier.FREE
        license.status = SubscriptionStatus.CANCELLED
        license.cancelled_at = datetime.utcnow()

        # Clear Paddle info
        license.paddle_subscription_id = None
        license.paddle_plan_id = None
        license.amount = None

        # Reset usage to FREE limits
        license.reset_usage()

        self.db.commit()
        self.db.refresh(license)

        logger.warning(f"Downgraded user {user_id} to FREE - Reason: {reason}")
        return license

    def update_subscription_status(
        self,
        paddle_subscription_id: str,
        status: SubscriptionStatus
    ) -> Optional[License]:
        """
        Update subscription status from Paddle webhook

        Args:
            paddle_subscription_id: Paddle subscription ID
            status: New status (ACTIVE, PAUSED, PAST_DUE, etc.)

        Returns:
            Updated license or None if not found
        """
        license = self.db.query(License).filter(
            License.paddle_subscription_id == paddle_subscription_id
        ).first()

        if not license:
            logger.error(f"License not found for Paddle subscription: {paddle_subscription_id}")
            return None

        license.status = status

        # If cancelled, downgrade to FREE
        if status in [SubscriptionStatus.CANCELLED, SubscriptionStatus.DELETED]:
            license.tier = LicenseTier.FREE
            license.cancelled_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(license)

        logger.info(f"Updated subscription {paddle_subscription_id} status to {status.value}")
        return license

    def check_and_increment_usage(self, user_id: int, resource: str) -> tuple[bool, Optional[str]]:
        """
        Check if user can use resource and increment usage counter

        Args:
            user_id: User ID
            resource: Resource name ("simulations", "defi_audits", "pdf_exports", "chat_messages")

        Returns:
            Tuple of (allowed: bool, error_message: Optional[str])
        """
        license = self.get_user_license(user_id)

        if not license:
            return False, "No license found"

        # Check if license is active
        if not license.is_active():
            return False, f"License is {license.status.value}. Please upgrade your plan."

        # Check if user has remaining quota
        if not license.can_use(resource):
            limits = license.get_limits()
            limit = limits.get(resource, 0)

            tier_names = {
                LicenseTier.FREE: "FREE",
                LicenseTier.STARTER: "STARTER ($20/month)",
                LicenseTier.PRO: "PRO ($50/month)",
                LicenseTier.ENTERPRISE: "ENTERPRISE (Custom)"
            }

            current_tier_name = tier_names.get(license.tier, license.tier.value)

            return False, (
                f"You've reached your {resource.replace('_', ' ')} limit ({limit}/{license.usage_reset_at.strftime('%B')}). "
                f"Current plan: {current_tier_name}. Upgrade to get more!"
            )

        # Increment usage
        license.increment_usage(resource)
        self.db.commit()

        return True, None

    def reset_monthly_usage(self, user_id: int) -> License:
        """
        Reset monthly usage counters

        Called by cron job at the start of each month
        """
        license = self.get_user_license(user_id)

        if license:
            license.reset_usage()
            self.db.commit()
            self.db.refresh(license)
            logger.info(f"Reset monthly usage for user {user_id}")

        return license

    def reset_all_monthly_usage(self) -> int:
        """
        Reset usage for ALL active licenses

        Called by cron job on the 1st of each month

        Returns:
            Number of licenses reset
        """
        licenses = self.db.query(License).filter(
            License.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING])
        ).all()

        count = 0
        for license in licenses:
            license.reset_usage()
            count += 1

        self.db.commit()
        logger.info(f"Reset monthly usage for {count} licenses")
        return count

    def get_tier_from_paddle_plan_id(self, paddle_plan_id: str) -> LicenseTier:
        """
        Map Paddle plan ID to license tier

        Configure these in settings based on your Paddle dashboard
        """
        plan_mapping = {
            settings.PADDLE_PLAN_STARTER: LicenseTier.STARTER,
            settings.PADDLE_PLAN_PRO: LicenseTier.PRO,
            settings.PADDLE_PLAN_ENTERPRISE: LicenseTier.ENTERPRISE,
        }

        return plan_mapping.get(paddle_plan_id, LicenseTier.FREE)

    def start_trial(self, user_id: int, tier: LicenseTier, trial_days: int = 14) -> License:
        """
        Start a free trial for a user

        Args:
            user_id: User ID
            tier: Trial tier (usually STARTER or PRO)
            trial_days: Trial duration in days (default 14)

        Returns:
            Updated license
        """
        license = self.get_user_license(user_id)

        if not license:
            license = License(user_id=user_id)
            self.db.add(license)

        # Set trial
        license.tier = tier
        license.status = SubscriptionStatus.TRIALING
        license.is_trial = True
        license.trial_ends_at = datetime.utcnow() + timedelta(days=trial_days)
        license.activated_at = datetime.utcnow()

        # Reset usage
        license.reset_usage()

        self.db.commit()
        self.db.refresh(license)

        logger.info(f"Started {trial_days}-day trial for user {user_id} - Tier: {tier.value}")
        return license

    def check_expired_trials(self) -> int:
        """
        Check for expired trials and downgrade to FREE

        Called by daily cron job

        Returns:
            Number of trials expired
        """
        now = datetime.utcnow()

        expired_trials = self.db.query(License).filter(
            License.status == SubscriptionStatus.TRIALING,
            License.trial_ends_at <= now
        ).all()

        count = 0
        for license in expired_trials:
            license.tier = LicenseTier.FREE
            license.status = SubscriptionStatus.ACTIVE
            license.is_trial = False
            license.reset_usage()
            count += 1

            logger.info(f"Trial expired for user {license.user_id} - Downgraded to FREE")

        self.db.commit()
        return count
