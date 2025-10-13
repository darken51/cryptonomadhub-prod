"""
Admin Notification Service
"""

from sqlalchemy.orm import Session
from app.models.admin_notification import AdminNotification, NotificationType
from datetime import datetime, timezone
import json
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for creating and managing admin notifications"""

    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self,
        type: NotificationType,
        title: str,
        message: str,
        country_code: str = None,
        metadata: dict = None
    ) -> AdminNotification:
        """Create a new admin notification"""
        try:
            notification = AdminNotification(
                type=type,
                title=title,
                message=message,
                country_code=country_code,
                meta_data=json.dumps(metadata) if metadata else None,
                read=False
            )
            self.db.add(notification)
            self.db.commit()
            self.db.refresh(notification)

            logger.info(f"Created notification: {type} - {title}")
            return notification

        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            self.db.rollback()
            return None

    def notify_tax_data_updated(self, country_code: str, old_rate: float, new_rate: float, sources: list):
        """Notify when tax data is updated"""
        title = f"Tax Rate Updated: {country_code}"
        message = f"Capital gains tax rate for {country_code} updated from {old_rate:.1%} to {new_rate:.1%}"

        return self.create_notification(
            type=NotificationType.TAX_DATA_UPDATED,
            title=title,
            message=message,
            country_code=country_code,
            metadata={
                'old_rate': old_rate,
                'new_rate': new_rate,
                'sources': sources,
                'change_percent': ((new_rate - old_rate) / old_rate * 100) if old_rate > 0 else 0
            }
        )

    def notify_urgent_update_needed(self, country_code: str, days_old: int):
        """Notify when country data is urgently out of date"""
        title = f"Urgent Update: {country_code}"
        message = f"Tax data for {country_code} is {days_old} days old and needs review"

        return self.create_notification(
            type=NotificationType.URGENT_UPDATE,
            title=title,
            message=message,
            country_code=country_code,
            metadata={'days_old': days_old}
        )

    def notify_source_failure(self, source_name: str, error: str):
        """Notify when a data source fails"""
        title = f"Data Source Failure: {source_name}"
        message = f"Failed to fetch data from {source_name}: {error}"

        return self.create_notification(
            type=NotificationType.SOURCE_FAILURE,
            title=title,
            message=message,
            metadata={'source': source_name, 'error': error}
        )

    def notify_sync_completed(self, updated_count: int, failed_count: int, total: int):
        """Notify when sync is completed"""
        title = "Weekly Tax Data Sync Completed"
        message = f"Sync completed: {updated_count} updated, {failed_count} failed out of {total} total"

        return self.create_notification(
            type=NotificationType.SYNC_COMPLETED,
            title=title,
            message=message,
            metadata={
                'updated': updated_count,
                'failed': failed_count,
                'total': total
            }
        )

    def get_unread_notifications(self, limit: int = 50):
        """Get unread notifications"""
        return self.db.query(AdminNotification)\
            .filter(AdminNotification.read == False)\
            .order_by(AdminNotification.created_at.desc())\
            .limit(limit)\
            .all()

    def get_all_notifications(self, limit: int = 100, offset: int = 0):
        """Get all notifications with pagination"""
        return self.db.query(AdminNotification)\
            .order_by(AdminNotification.created_at.desc())\
            .offset(offset)\
            .limit(limit)\
            .all()

    def mark_as_read(self, notification_id: int):
        """Mark notification as read"""
        notification = self.db.query(AdminNotification)\
            .filter(AdminNotification.id == notification_id)\
            .first()

        if notification:
            notification.read = True
            notification.read_at = datetime.now(timezone.utc)
            self.db.commit()
            return True
        return False

    def mark_all_as_read(self):
        """Mark all notifications as read"""
        self.db.query(AdminNotification)\
            .filter(AdminNotification.read == False)\
            .update({
                'read': True,
                'read_at': datetime.now(timezone.utc)
            })
        self.db.commit()

    def get_unread_count(self) -> int:
        """Get count of unread notifications"""
        return self.db.query(AdminNotification)\
            .filter(AdminNotification.read == False)\
            .count()
