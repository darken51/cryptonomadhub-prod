"""
Celery tasks package
"""

from .celery_app import celery_app
from .tax_sync_tasks import sync_all_tax_data_task, sync_countries_task

# Import wallet tasks to register them with Celery
try:
    from .wallet_tasks import sync_wallet_snapshot, create_consolidated_snapshot
    from .defi_audit_tasks import process_defi_audit_task, cleanup_old_audits_task
    __all__ = [
        'celery_app',
        'sync_all_tax_data_task',
        'sync_countries_task',
        'sync_wallet_snapshot',
        'create_consolidated_snapshot',
        'process_defi_audit_task',
        'cleanup_old_audits_task'
    ]
except ImportError as e:
    # Some tasks not available (missing dependencies in worker)
    try:
        from .defi_audit_tasks import process_defi_audit_task, cleanup_old_audits_task
        __all__ = [
            'celery_app',
            'sync_all_tax_data_task',
            'sync_countries_task',
            'process_defi_audit_task',
            'cleanup_old_audits_task'
        ]
    except ImportError:
        __all__ = ['celery_app', 'sync_all_tax_data_task', 'sync_countries_task']
