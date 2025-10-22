"""
Dashboard Activity Models - Activity tracking for dashboard timeline
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class DashboardActivity(Base):
    """
    Dashboard activity log

    Tracks user activities for the dashboard timeline view.
    Used to display recent actions like audits, simulations, chat messages, etc.
    """
    __tablename__ = "dashboard_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Activity identification
    activity_type = Column(String(50), nullable=False, index=True)  # 'chat', 'defi_audit', 'simulation', 'cost_basis', 'tax_opportunity'
    activity_id = Column(String(100), nullable=True)  # ID of the related entity (optional)

    # Display information
    title = Column(String(200), nullable=False)  # "DeFi Audit Completed", "New Chat Conversation"
    subtitle = Column(String(500), nullable=True)  # Additional context

    # Activity metadata (flexible JSON for activity-specific data)
    activity_metadata = Column(JSON, nullable=True)  # {chain: "Ethereum", wallet: "0x...", result: "high_risk"}

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User")

    # Composite index for efficient user activity queries
    __table_args__ = (
        Index('ix_dashboard_activities_user_created', 'user_id', 'created_at'),
        Index('ix_dashboard_activities_user_type', 'user_id', 'activity_type'),
    )

    def __repr__(self):
        return f"<DashboardActivity {self.id}: {self.activity_type} - {self.title}>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "activity_type": self.activity_type,
            "activity_id": self.activity_id,
            "title": self.title,
            "subtitle": self.subtitle,
            "metadata": self.activity_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
