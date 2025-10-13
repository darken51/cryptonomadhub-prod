"""
Admin Notification Model
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class NotificationType(str, enum.Enum):
    """Notification types"""
    TAX_DATA_UPDATED = "tax_data_updated"
    TAX_DATA_STALE = "tax_data_stale"
    SOURCE_FAILURE = "source_failure"
    SYNC_COMPLETED = "sync_completed"
    URGENT_UPDATE = "urgent_update"


class AdminNotification(Base):
    """
    Admin notifications for tax data updates and issues
    """
    __tablename__ = "admin_notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(NotificationType), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    country_code = Column(String(3), nullable=True, index=True)
    meta_data = Column(Text, nullable=True)  # JSON string
    read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)
