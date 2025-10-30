"""
License Management Endpoints

API routes for checking license status and usage quotas
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.license_service import LicenseService
from app.middleware import limiter, get_rate_limit
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/license", tags=["License"])


class UsageResponse(BaseModel):
    tier: str
    status: str
    expires_at: Optional[str] = None

    # Current usage
    simulations_used: int
    defi_audits_used: int
    pdf_exports_used: int
    chat_messages_used: int

    # Limits
    simulations_limit: int
    defi_audits_limit: int
    pdf_exports_limit: int
    chat_messages_limit: int
    wallets_limit: int
    cost_basis_tx_limit: int

    # Remaining
    simulations_remaining: int
    defi_audits_remaining: int
    pdf_exports_remaining: int
    chat_messages_remaining: int

    # Billing
    usage_reset_at: str
    next_billing_date: Optional[str] = None


@router.get("/usage", response_model=UsageResponse)
@limiter.limit(get_rate_limit("read_only"))
async def get_license_usage(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current license usage and remaining quotas

    Returns detailed usage information including:
    - Current tier (FREE, STARTER, PRO)
    - Usage counters for all resources
    - Remaining quotas
    - Reset date
    """

    license_service = LicenseService(db)
    license = license_service.get_user_license(current_user.id)

    if not license:
        raise HTTPException(status_code=404, detail="License not found")

    limits = license.get_limits()
    remaining = license.get_remaining()

    return UsageResponse(
        tier=license.tier.value,
        status=license.status.value,
        expires_at=license.expires_at.isoformat() if license.expires_at else None,

        # Current usage
        simulations_used=license.simulations_used,
        defi_audits_used=license.defi_audits_used,
        pdf_exports_used=license.pdf_exports_used,
        chat_messages_used=license.chat_messages_used,

        # Limits
        simulations_limit=limits["simulations"],
        defi_audits_limit=limits["defi_audits"],
        pdf_exports_limit=limits["pdf_exports"],
        chat_messages_limit=limits["chat_messages"],
        wallets_limit=limits["wallets"],
        cost_basis_tx_limit=limits["cost_basis_tx"],

        # Remaining
        simulations_remaining=remaining["simulations"],
        defi_audits_remaining=remaining["defi_audits"],
        pdf_exports_remaining=remaining["pdf_exports"],
        chat_messages_remaining=remaining["chat_messages"],

        # Billing
        usage_reset_at=license.usage_reset_at.isoformat(),
        next_billing_date=license.next_billing_date.isoformat() if license.next_billing_date else None
    )
