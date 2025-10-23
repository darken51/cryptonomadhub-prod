"""
Celery tasks for DeFi audit processing

Processes blockchain scans in background to avoid HTTP timeouts
"""
from celery import Task
from sqlalchemy.orm import Session
from app.tasks.celery_app import celery_app
from app.database import SessionLocal
from app.services.defi_audit_service import DeFiAuditService
from app.models.defi_protocol import DeFiAudit
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class DatabaseTask(Task):
    """Base task with database session management"""
    _db = None

    @property
    def db(self):
        if self._db is None:
            self._db = SessionLocal()
        return self._db

    def after_return(self, *args, **kwargs):
        if self._db is not None:
            self._db.close()
            self._db = None


@celery_app.task(base=DatabaseTask, bind=True, name="process_defi_audit")
def process_defi_audit_task(self, audit_id: int, wallet_address: str):
    """
    Process DeFi audit in background

    Args:
        audit_id: ID of audit to process
        wallet_address: Wallet address to scan
    """
    db = self.db

    logger.info(f"Starting background processing for audit {audit_id}")

    try:
        # Get audit
        audit = db.query(DeFiAudit).filter(DeFiAudit.id == audit_id).first()
        if not audit:
            logger.error(f"Audit {audit_id} not found")
            return {"status": "error", "message": "Audit not found"}

        # Update status to processing
        audit.status = "processing"
        db.commit()

        # Process audit
        service = DeFiAuditService(db)

        # Use synchronous version since Celery doesn't support async
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            loop.run_until_complete(service._process_audit(audit, wallet_address))
        finally:
            loop.close()

        logger.info(f"Audit {audit_id} processing completed successfully")

        return {
            "status": "success",
            "audit_id": audit_id,
            "total_transactions": audit.total_transactions
        }

    except Exception as e:
        logger.error(f"Failed to process audit {audit_id}: {e}", exc_info=True)

        # Update audit status to failed
        try:
            audit = db.query(DeFiAudit).filter(DeFiAudit.id == audit_id).first()
            if audit:
                audit.status = "failed"
                audit.error_message = str(e)
                db.commit()
        except Exception as db_error:
            logger.error(f"Failed to update audit status: {db_error}")

        return {
            "status": "error",
            "audit_id": audit_id,
            "error": str(e)
        }


@celery_app.task(name="cleanup_old_audits")
def cleanup_old_audits_task():
    """
    Cleanup old failed audits (older than 30 days)

    This task runs periodically to clean up the database
    """
    db = SessionLocal()

    try:
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=30)

        deleted = db.query(DeFiAudit).filter(
            DeFiAudit.status == "failed",
            DeFiAudit.created_at < cutoff_date
        ).delete()

        db.commit()
        logger.info(f"Cleaned up {deleted} old failed audits")

        return {"status": "success", "deleted": deleted}

    except Exception as e:
        logger.error(f"Failed to cleanup old audits: {e}", exc_info=True)
        db.rollback()
        return {"status": "error", "error": str(e)}

    finally:
        db.close()
