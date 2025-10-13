from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.paddle_handler import PaddleHandler
from app.services.license_service import LicenseService
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.license import SubscriptionStatus
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/paddle", tags=["Paddle Webhooks"])


@router.post("/webhook")
async def paddle_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Paddle subscription webhooks

    Events:
    - subscription_created
    - subscription_updated
    - subscription_cancelled
    - subscription_payment_succeeded
    - subscription_payment_failed
    """

    # Get payload
    form_data = await request.form()
    data = dict(form_data)

    # Get signature
    signature = data.get("p_signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")

    # Verify signature
    paddle = PaddleHandler()
    if not paddle.verify_webhook_signature(data, signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

    # Get event type
    event_type = data.get("alert_name")

    # Parse passthrough (contains user_id)
    passthrough = json.loads(data.get("passthrough", "{}"))
    user_id = passthrough.get("user_id")

    # Initialize services
    license_service = LicenseService(db)

    if event_type == "subscription_created":
        # New subscription
        subscription_id = data.get("subscription_id")
        plan_id = data.get("subscription_plan_id")
        email = data.get("email")
        amount = float(data.get("sale_gross", 0))
        currency = data.get("currency", "USD")
        billing_period = "yearly" if data.get("subscription_payment_frequency") == "yearly" else "monthly"

        # Get tier from plan ID
        tier = license_service.get_tier_from_paddle_plan_id(plan_id)

        # Upgrade user license
        try:
            license = license_service.upgrade_license(
                user_id=user_id,
                tier=tier,
                paddle_subscription_id=subscription_id,
                paddle_plan_id=plan_id,
                paddle_email=email,
                amount=amount,
                currency=currency,
                billing_period=billing_period
            )
            logger.info(f"Created subscription {subscription_id} for user {user_id} - Tier: {tier.value}")
        except Exception as e:
            logger.error(f"Failed to create subscription: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        # Log
        audit = AuditLog(
            user_id=user_id,
            action="subscription_created",
            details={
                "subscription_id": subscription_id,
                "plan_id": plan_id,
                "tier": tier.value,
                "amount": amount,
                "currency": currency
            }
        )
        db.add(audit)
        db.commit()

    elif event_type == "subscription_updated":
        # Plan change (upgrade/downgrade)
        subscription_id = data.get("subscription_id")
        plan_id = data.get("subscription_plan_id")
        email = data.get("email")
        amount = float(data.get("sale_gross", 0))
        currency = data.get("currency", "USD")

        # Get new tier
        tier = license_service.get_tier_from_paddle_plan_id(plan_id)

        # Update license
        try:
            license = license_service.upgrade_license(
                user_id=user_id,
                tier=tier,
                paddle_subscription_id=subscription_id,
                paddle_plan_id=plan_id,
                paddle_email=email,
                amount=amount,
                currency=currency
            )
            logger.info(f"Updated subscription {subscription_id} to tier {tier.value}")
        except Exception as e:
            logger.error(f"Failed to update subscription: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        audit = AuditLog(
            user_id=user_id,
            action="subscription_updated",
            details={"subscription_id": subscription_id, "new_tier": tier.value}
        )
        db.add(audit)
        db.commit()

    elif event_type == "subscription_cancelled":
        # Cancellation - downgrade to FREE at end of billing period
        subscription_id = data.get("subscription_id")
        cancellation_date = data.get("cancellation_effective_date")

        # Update subscription status
        try:
            license = license_service.update_subscription_status(
                paddle_subscription_id=subscription_id,
                status=SubscriptionStatus.CANCELLED
            )
            logger.info(f"Cancelled subscription {subscription_id} - Effective: {cancellation_date}")
        except Exception as e:
            logger.error(f"Failed to cancel subscription: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        audit = AuditLog(
            user_id=user_id,
            action="subscription_cancelled",
            details={"subscription_id": subscription_id, "date": cancellation_date}
        )
        db.add(audit)
        db.commit()

    elif event_type == "subscription_payment_succeeded":
        # Successful payment
        amount = data.get("sale_gross")
        currency = data.get("currency")

        audit = AuditLog(
            user_id=user_id,
            action="payment_received",
            details={
                "amount": amount,
                "currency": currency,
                "receipt_url": data.get("receipt_url")
            }
        )
        db.add(audit)
        db.commit()

    elif event_type == "subscription_payment_failed":
        # Failed payment - Paddle handles dunning automatically
        subscription_id = data.get("subscription_id")

        # Mark subscription as past_due
        try:
            license = license_service.update_subscription_status(
                paddle_subscription_id=subscription_id,
                status=SubscriptionStatus.PAST_DUE
            )
            logger.warning(f"Payment failed for subscription {subscription_id}")
        except Exception as e:
            logger.error(f"Failed to update payment failed status: {e}")

        audit = AuditLog(
            user_id=user_id,
            action="payment_failed",
            details={"subscription_id": subscription_id, "amount": data.get("sale_gross")}
        )
        db.add(audit)
        db.commit()

    return {"status": "ok"}


@router.get("/plans")
async def get_paddle_plans():
    """Get Paddle plan information"""
    from app.config import settings

    return {
        "plans": [
            {
                "id": settings.PADDLE_PLAN_STARTER,
                "name": "Starter",
                "price": 20,
                "currency": "USD",
                "features": [
                    "10 simulations/month",
                    "10 countries",
                    "Basic audit",
                    "Email support"
                ]
            },
            {
                "id": settings.PADDLE_PLAN_PRO,
                "name": "Pro",
                "price": 50,
                "currency": "USD",
                "features": [
                    "Unlimited simulations",
                    "50 countries",
                    "Real-time DeFi audit",
                    "Export tax forms",
                    "Priority support"
                ]
            },
            {
                "id": settings.PADDLE_PLAN_ENTERPRISE,
                "name": "Enterprise",
                "price": 100,
                "currency": "USD",
                "features": [
                    "Everything in Pro",
                    "API access",
                    "White-label option",
                    "Dedicated support",
                    "CPA review included"
                ]
            }
        ]
    }
