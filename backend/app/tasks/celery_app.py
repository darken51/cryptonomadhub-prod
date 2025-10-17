"""
Celery application configuration
"""

from celery import Celery
from celery.schedules import crontab
import os

# Initialize Celery
celery_app = Celery(
    "nomadcrypto",
    broker=os.getenv("REDIS_URL", "redis://redis:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://redis:6379/0"),
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    task_soft_time_limit=3000,  # 50 minutes soft limit
)

# Periodic task schedule
celery_app.conf.beat_schedule = {
    # Weekly tax data sync (every Sunday at 3 AM UTC)
    'weekly-tax-data-sync': {
        'task': 'app.tasks.tax_sync_tasks.sync_all_tax_data_task',
        'schedule': crontab(hour=3, minute=0, day_of_week=0),  # Sunday 3 AM
    },

    # Daily check for urgent updates (every day at 6 AM UTC)
    'daily-urgent-tax-check': {
        'task': 'app.tasks.tax_sync_tasks.check_urgent_updates_task',
        'schedule': crontab(hour=6, minute=0),  # Daily 6 AM
    },

    # Enrich scraper IA data with aggregator (every day at 7 AM UTC)
    'daily-enrich-scraper-data': {
        'task': 'app.tasks.tax_sync_tasks.enrich_scraper_data_task',
        'schedule': crontab(hour=7, minute=0),  # Daily 7 AM
    },

    # License management tasks
    # Reset monthly usage (1st of month at 00:00 UTC)
    'reset-usage-monthly': {
        'task': 'reset_monthly_usage',
        'schedule': crontab(day_of_month='1', hour='0', minute='0'),
    },

    # Check expired trials (daily at 01:00 UTC)
    'check-trials-daily': {
        'task': 'check_expired_trials',
        'schedule': crontab(hour='1', minute='0'),
    },

    # Send usage warnings (daily at 12:00 UTC)
    'usage-warnings-daily': {
        'task': 'send_usage_warning_emails',
        'schedule': crontab(hour='12', minute='0'),
    },
}

# Auto-discover tasks
celery_app.autodiscover_tasks(['app.tasks'])
