from sqlalchemy.orm import Session
from app.models.feature_flag import FeatureFlag
from app.models.user import User
from typing import Optional
import hashlib


class FeatureFlagService:
    """Service for feature flag management"""

    def __init__(self, db: Session):
        self.db = db
        self._cache = {}

    async def is_enabled(
        self,
        feature_name: str,
        user: Optional[User] = None,
        country: Optional[str] = None
    ) -> bool:
        """Check if feature enabled for user/context"""

        # Get flag from DB
        flag = self.db.query(FeatureFlag).filter_by(name=feature_name).first()

        if not flag:
            return False  # Default disabled

        # Global enabled?
        if flag.enabled_globally:
            return True

        # Beta users only?
        if flag.beta_only and user:
            if user.role.value == 'admin' or user.beta_tester:
                return True

        # Percentage rollout (deterministic A/B testing)
        if flag.rollout_percentage and user:
            # Hash user ID + feature name for deterministic result
            user_hash = int(
                hashlib.md5(f"{user.id}{feature_name}".encode()).hexdigest(),
                16
            )
            if (user_hash % 100) < flag.rollout_percentage:
                return True

        # Country-specific?
        if flag.enabled_countries and country:
            if country in flag.enabled_countries:
                return True

        return False

    def create_flag(
        self,
        name: str,
        description: str,
        enabled_globally: bool = False,
        beta_only: bool = False
    ) -> FeatureFlag:
        """Create new feature flag"""
        flag = FeatureFlag(
            name=name,
            description=description,
            enabled_globally=enabled_globally,
            beta_only=beta_only
        )
        self.db.add(flag)
        self.db.commit()
        self.db.refresh(flag)
        return flag

    def update_flag(self, name: str, **updates) -> Optional[FeatureFlag]:
        """Update feature flag settings"""
        flag = self.db.query(FeatureFlag).filter_by(name=name).first()
        if not flag:
            return None

        for key, value in updates.items():
            if hasattr(flag, key):
                setattr(flag, key, value)

        self.db.commit()
        self.db.refresh(flag)
        return flag
