"""
License Check Dependencies

FastAPI dependencies for enforcing license limits on endpoints
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.license_service import LicenseService
from typing import Callable


def require_license(resource: str):
    """
    Dependency factory to check license and enforce usage limits

    Usage:
        @router.post("/simulations")
        async def create_simulation(
            user: User = Depends(get_current_user),
            license_check = Depends(require_license("simulations")),
            db: Session = Depends(get_db)
        ):
            # This endpoint will only execute if user has remaining quota
            ...

    Args:
        resource: Resource name ("simulations", "defi_audits", "pdf_exports", "chat_messages")

    Returns:
        FastAPI dependency function
    """

    async def check_license(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        """Check if user can use the resource and increment counter"""

        license_service = LicenseService(db)

        # Check and increment usage
        allowed, error_message = license_service.check_and_increment_usage(
            user_id=current_user.id,
            resource=resource
        )

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,  # 402 Payment Required
                detail={
                    "error": "quota_exceeded",
                    "message": error_message,
                    "resource": resource,
                    "upgrade_url": "/pricing"
                }
            )

        return True

    return check_license


# Convenience dependencies for common resources
require_simulation = require_license("simulations")
require_defi_audit = require_license("defi_audits")
require_pdf_export = require_license("pdf_exports")
require_chat_message = require_license("chat_messages")
