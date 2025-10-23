"""
Celery tasks package
"""

from .celery_app import celery_app
from .tax_sync_tasks import sync_all_tax_data_task, sync_countries_task

# Import wallet tasks to register them with Celery
try:
    from .wallet_tasks import sync_wallet_snapshot, create_consolidated_snapshot
    __all__ = [
        'celery_app',
        'sync_all_tax_data_task',
        'sync_countries_task',
        'sync_wallet_snapshot',
        'create_consolidated_snapshot'
    ]
except ImportError:
    # Wallet tasks not available (missing dependencies in worker)
    __all__ = ['celery_app', 'sync_all_tax_data_task', 'sync_countries_task']
