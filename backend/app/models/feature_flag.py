from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ARRAY
from sqlalchemy.sql import func
from app.database import Base


class FeatureFlag(Base):
    """Feature flags for gradual rollout"""
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)

    # Rollout settings
    enabled_globally = Column(Boolean, default=False)
    beta_only = Column(Boolean, default=False)
    rollout_percentage = Column(Integer, default=0)  # 0-100
    enabled_countries = Column(ARRAY(String(2)))  # ['US', 'FR']

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "enabled_globally": self.enabled_globally,
            "beta_only": self.beta_only,
            "rollout_percentage": self.rollout_percentage,
            "enabled_countries": self.enabled_countries
        }
