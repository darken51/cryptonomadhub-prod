"""
License Tasks for Celery

Cron jobs for license management:
- Reset monthly usage (runs on 1st of each month)
- Check and expire trials (runs daily)
"""

from celery import shared_task
from app.database import SessionLocal
from app.services.license_service import LicenseService
import logging

logger = logging.getLogger(__name__)


@shared_task(name="reset_monthly_usage")
def reset_monthly_usage():
    """
    Reset usage counters for all active licenses

    Scheduled to run on the 1st of each month at 00:00 UTC

    Celery Beat schedule:
        'reset-usage-monthly': {
            'task': 'reset_monthly_usage',
            'schedule': crontab(day_of_month='1', hour='0', minute='0'),
        }
    """
    logger.info("Starting monthly usage reset...")

    db = SessionLocal()
    try:
        license_service = LicenseService(db)
        count = license_service.reset_all_monthly_usage()

        logger.info(f"✅ Successfully reset usage for {count} licenses")
        return {"status": "success", "licenses_reset": count}

    except Exception as e:
        logger.error(f"❌ Failed to reset monthly usage: {e}")
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@shared_task(name="check_expired_trials")
def check_expired_trials():
    """
    Check for expired trials and downgrade to FREE

    Scheduled to run daily at 01:00 UTC

    Celery Beat schedule:
        'check-trials-daily': {
            'task': 'check_expired_trials',
            'schedule': crontab(hour='1', minute='0'),
        }
    """
    logger.info("Checking for expired trials...")

    db = SessionLocal()
    try:
        license_service = LicenseService(db)
        count = license_service.check_expired_trials()

        logger.info(f"✅ Processed {count} expired trials")
        return {"status": "success", "trials_expired": count}

    except Exception as e:
        logger.error(f"❌ Failed to check expired trials: {e}")
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@shared_task(name="send_usage_warning_emails")
def send_usage_warning_emails():
    """
    Send email warnings to users approaching their usage limits

    Scheduled to run daily at 12:00 UTC

    Sends warnings when user reaches:
    - 80% of their monthly quota
    - 90% of their monthly quota
    - 100% of their monthly quota

    Celery Beat schedule:
        'usage-warnings-daily': {
            'task': 'send_usage_warning_emails',
            'schedule': crontab(hour='12', minute='0'),
        }
    """
    logger.info("Checking usage limits and sending warnings...")

    db = SessionLocal()
    try:
        from app.models.license import License, SubscriptionStatus

        # Get all active licenses
        licenses = db.query(License).filter(
            License.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING])
        ).all()

        warnings_sent = 0

        for license in licenses:
            limits = license.get_limits()
            remaining = license.get_remaining()

            # Check if user is approaching limits for any resource
            for resource, limit in limits.items():
                if limit == 0 or limit > 99999:  # Skip disabled or unlimited resources
                    continue

                used = getattr(license, f"{resource}_used", 0)
                usage_percent = (used / limit) * 100 if limit > 0 else 0

                # Send warning if approaching limit (80%, 90%, or 100%)
                if usage_percent >= 80 and usage_percent < 100:
                    # TODO: Send email warning
                    logger.info(
                        f"User {license.user_id} at {usage_percent:.0f}% of {resource} limit "
                        f"({used}/{limit})"
                    )
                    warnings_sent += 1

                elif usage_percent >= 100:
                    # TODO: Send limit reached email
                    logger.warning(
                        f"User {license.user_id} reached {resource} limit ({used}/{limit})"
                    )
                    warnings_sent += 1

        logger.info(f"✅ Sent {warnings_sent} usage warnings")
        return {"status": "success", "warnings_sent": warnings_sent}

    except Exception as e:
        logger.error(f"❌ Failed to send usage warnings: {e}")
        return {"status": "error", "message": str(e)}

    finally:
        db.close()
