from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.paddle_handler import PaddleHandler
from app.models.user import User
from app.models.audit_log import AuditLog
import json

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

    if event_type == "subscription_created":
        # New subscription
        subscription_id = data.get("subscription_id")
        plan_id = data.get("subscription_plan_id")

        # Get tier from plan ID
        tier = paddle.get_plan_tier_from_id(plan_id)

        # TODO: Update user license in database
        # license = License(user_id=user_id, tier=tier, paddle_subscription_id=subscription_id)
        # db.add(license)
        # db.commit()

        # Log
        audit = AuditLog(
            user_id=user_id,
            action="subscription_created",
            details={
                "subscription_id": subscription_id,
                "plan_id": plan_id,
                "tier": tier
            }
        )
        db.add(audit)
        db.commit()

    elif event_type == "subscription_updated":
        # Plan change
        subscription_id = data.get("subscription_id")
        plan_id = data.get("subscription_plan_id")
        tier = paddle.get_plan_tier_from_id(plan_id)

        # TODO: Update license tier
        # license = db.query(License).filter_by(paddle_subscription_id=subscription_id).first()
        # if license:
        #     license.tier = tier
        #     db.commit()

        audit = AuditLog(
            user_id=user_id,
            action="subscription_updated",
            details={"subscription_id": subscription_id, "new_tier": tier}
        )
        db.add(audit)
        db.commit()

    elif event_type == "subscription_cancelled":
        # Cancellation
        subscription_id = data.get("subscription_id")
        cancellation_date = data.get("cancellation_effective_date")

        # TODO: Mark license as cancelled
        # license = db.query(License).filter_by(paddle_subscription_id=subscription_id).first()
        # if license:
        #     license.status = "cancelled"
        #     license.cancels_at = cancellation_date
        #     db.commit()

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
        audit = AuditLog(
            user_id=user_id,
            action="payment_failed",
            details={"subscription_id": data.get("subscription_id")}
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
