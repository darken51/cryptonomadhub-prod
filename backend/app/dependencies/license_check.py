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


def require_pro_tier():
    """
    Dependency to require PRO tier for premium features

    Usage:
        @router.get("/tax-optimizer/analyze")
        async def analyze(
            user: User = Depends(get_current_user),
            _check = Depends(require_pro_tier()),
            db: Session = Depends(get_db)
        ):
            # Only PRO users can access
            ...
    """

    async def check_pro_tier(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        """Check if user has PRO tier"""
        from app.models.license import LicenseTier

        license_service = LicenseService(db)
        license = license_service.get_user_license(current_user.id)

        if not license or license.tier not in [LicenseTier.PRO, LicenseTier.ENTERPRISE]:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "error": "pro_required",
                    "message": "Tax Optimizer is a PRO feature. Upgrade to PRO to access AI-powered tax optimization.",
                    "current_tier": license.tier.value if license else "free",
                    "required_tier": "pro",
                    "upgrade_url": "/pricing"
                }
            )

        return True

    return check_pro_tier


def require_starter_plus():
    """
    Dependency to require STARTER tier or higher

    For features available to STARTER and PRO, but not FREE
    """

    async def check_starter_plus(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        """Check if user has STARTER or higher"""
        from app.models.license import LicenseTier

        license_service = LicenseService(db)
        license = license_service.get_user_license(current_user.id)

        if not license or license.tier == LicenseTier.FREE:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "error": "paid_tier_required",
                    "message": "This feature requires a paid subscription. Upgrade to STARTER or PRO to access.",
                    "current_tier": "free",
                    "required_tier": "starter",
                    "upgrade_url": "/pricing"
                }
            )

        return True

    return check_starter_plus


def require_csv_export():
    """
    Dependency to require PRO tier for CSV exports

    CSV exports are a PRO-only feature
    """

    async def check_csv_export(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        """Check if user has PRO tier for CSV export"""
        from app.models.license import LicenseTier

        license_service = LicenseService(db)
        license = license_service.get_user_license(current_user.id)

        if not license or license.tier not in [LicenseTier.PRO, LicenseTier.ENTERPRISE]:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "error": "pro_required",
                    "message": "CSV export is a PRO feature. Upgrade to PRO to export your data in CSV format.",
                    "current_tier": license.tier.value if license else "free",
                    "required_tier": "pro",
                    "upgrade_url": "/pricing"
                }
            )

        return True

    return check_csv_export
