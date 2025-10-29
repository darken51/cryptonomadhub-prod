"""
NOWPayments Webhook Handler

Handles crypto payment notifications and activates licenses
"""

from fastapi import APIRouter, Request, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.nowpayments_service import NOWPaymentsService
from app.services.license_service import LicenseService
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.license import LicenseTier, SubscriptionStatus
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/nowpayments", tags=["NOWPayments Webhooks"])


@router.post("/webhook")
async def nowpayments_webhook(
    request: Request,
    x_nowpayments_sig: str = Header(..., alias="x-nowpayments-sig"),
    db: Session = Depends(get_db)
):
    """
    Handle NOWPayments IPN callbacks

    Payment statuses:
    - waiting: Payment created, waiting for customer to send crypto
    - confirming: Payment received, waiting for blockchain confirmations
    - confirmed: Payment confirmed on blockchain
    - sending: Sending to your payout wallet
    - finished: Payment complete ✅
    - failed: Payment failed ❌
    - refunded: Payment refunded
    - expired: Payment expired (customer didn't pay in time)
    - partially_paid: Customer sent less than required amount
    """

    # Get raw body for signature verification
    body = await request.body()

    # Verify signature
    nowpayments = NOWPaymentsService()
    if not nowpayments.verify_ipn_signature(body, x_nowpayments_sig):
        logger.error("Invalid NOWPayments IPN signature")
        raise HTTPException(status_code=403, detail="Invalid signature")

    # Parse payload
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # Extract payment info
    payment_id = data.get("payment_id")
    payment_status = data.get("payment_status")
    order_id = data.get("order_id")  # Format: "user_123_starter_monthly"
    price_amount = data.get("price_amount")  # Fiat amount (e.g., "15.00")
    price_currency = data.get("price_currency")  # "usd"
    pay_amount = data.get("pay_amount")  # Crypto amount sent
    pay_currency = data.get("pay_currency")  # "btc", "eth", etc.
    actually_paid = data.get("actually_paid")  # Actual crypto received

    logger.info(f"NOWPayments IPN: payment_id={payment_id}, status={payment_status}, order={order_id}")

    # Parse order_id to extract user_id and plan
    try:
        # Format: "user_{user_id}_{tier}_{period}"
        # Example: "user_123_starter_monthly" or "user_456_pro_annual"
        parts = order_id.split("_")
        if len(parts) < 4 or parts[0] != "user":
            raise ValueError("Invalid order_id format")

        user_id = int(parts[1])
        tier_str = parts[2]  # "starter" or "pro"
        period = parts[3]  # "monthly" or "annual"

        # Map tier string to LicenseTier enum
        tier_map = {
            "starter": LicenseTier.STARTER,
            "pro": LicenseTier.PRO,
        }
        tier = tier_map.get(tier_str.lower())

        if not tier:
            raise ValueError(f"Unknown tier: {tier_str}")

    except (ValueError, IndexError) as e:
        logger.error(f"Failed to parse order_id '{order_id}': {e}")
        return {"status": "error", "message": "Invalid order_id"}

    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found for payment {payment_id}")
        return {"status": "error", "message": "User not found"}

    # Initialize services
    license_service = LicenseService(db)

    # Handle payment status
    if payment_status == "finished":
        # Payment successful ✅
        logger.info(f"✅ Payment {payment_id} finished for user {user_id} - Activating {tier.value} license")

        # Calculate expiration date
        if period == "annual":
            expires_at = datetime.utcnow() + timedelta(days=365)
        else:  # monthly
            expires_at = datetime.utcnow() + timedelta(days=30)

        # Activate license
        try:
            license = license_service.upgrade_license(
                user_id=user_id,
                tier=tier,
                paddle_subscription_id=f"crypto_{payment_id}",  # Use payment_id as subscription reference
                paddle_plan_id=f"{tier_str}_{period}",
                paddle_email=user.email,
                amount=float(price_amount),
                currency=price_currency.upper(),
                billing_period=period
            )

            # Set expiration
            license.expires_at = expires_at
            license.next_billing_date = expires_at  # For crypto, next billing = expiration (manual renewal)
            db.commit()

            logger.info(f"✅ Activated {tier.value} license for user {user_id} until {expires_at}")

            # Log successful payment
            audit = AuditLog(
                user_id=user_id,
                action="crypto_payment_received",
                details={
                    "payment_id": payment_id,
                    "tier": tier.value,
                    "period": period,
                    "amount": price_amount,
                    "currency": price_currency,
                    "crypto_amount": pay_amount,
                    "crypto_currency": pay_currency,
                    "expires_at": expires_at.isoformat()
                }
            )
            db.add(audit)
            db.commit()

        except Exception as e:
            logger.error(f"Failed to activate license for user {user_id}: {e}")
            db.rollback()
            return {"status": "error", "message": str(e)}

    elif payment_status in ["confirmed", "sending"]:
        # Payment confirmed, being processed
        logger.info(f"⏳ Payment {payment_id} confirmed, waiting for completion")

        audit = AuditLog(
            user_id=user_id,
            action="crypto_payment_confirmed",
            details={
                "payment_id": payment_id,
                "status": payment_status,
                "amount": price_amount,
                "crypto_currency": pay_currency
            }
        )
        db.add(audit)
        db.commit()

    elif payment_status in ["failed", "expired", "refunded"]:
        # Payment failed or cancelled
        logger.warning(f"❌ Payment {payment_id} {payment_status} for user {user_id}")

        audit = AuditLog(
            user_id=user_id,
            action="crypto_payment_failed",
            details={
                "payment_id": payment_id,
                "status": payment_status,
                "amount": price_amount,
                "reason": payment_status
            }
        )
        db.add(audit)
        db.commit()

    elif payment_status == "partially_paid":
        # Customer sent less crypto than required
        logger.warning(f"⚠️ Payment {payment_id} partially paid: sent {actually_paid} {pay_currency}, need {pay_amount}")

        audit = AuditLog(
            user_id=user_id,
            action="crypto_payment_partial",
            details={
                "payment_id": payment_id,
                "expected": pay_amount,
                "received": actually_paid,
                "crypto_currency": pay_currency
            }
        )
        db.add(audit)
        db.commit()

    elif payment_status == "waiting":
        # Payment created, waiting for customer to send crypto
        logger.info(f"⏳ Payment {payment_id} waiting for customer payment")

        audit = AuditLog(
            user_id=user_id,
            action="crypto_payment_created",
            details={
                "payment_id": payment_id,
                "tier": tier.value,
                "amount": price_amount,
                "crypto_currency": pay_currency
            }
        )
        db.add(audit)
        db.commit()

    return {"status": "ok"}


@router.get("/payment-status/{payment_id}")
async def get_payment_status(payment_id: int):
    """Get current status of a crypto payment"""
    nowpayments = NOWPaymentsService()
    payment = await nowpayments.get_payment_status(payment_id)

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return {
        "payment_id": payment.get("payment_id"),
        "payment_status": payment.get("payment_status"),
        "pay_address": payment.get("pay_address"),
        "pay_amount": payment.get("pay_amount"),
        "pay_currency": payment.get("pay_currency"),
        "price_amount": payment.get("price_amount"),
        "price_currency": payment.get("price_currency"),
        "actually_paid": payment.get("actually_paid"),
        "created_at": payment.get("created_at"),
        "updated_at": payment.get("updated_at")
    }


@router.get("/currencies")
async def get_available_currencies():
    """Get list of available cryptocurrencies for payment"""
    nowpayments = NOWPaymentsService()
    currencies = await nowpayments.get_available_currencies()

    # Filter to most popular ones
    popular = ["btc", "eth", "usdttrc20", "usdterc20", "ltc", "usdc", "bnb_bsc"]
    available = [c for c in currencies if c in popular]

    return {
        "currencies": available,
        "all_currencies": currencies
    }


@router.post("/estimate")
async def estimate_crypto_payment(
    amount: float,
    currency_from: str = "usd",
    currency_to: str = "btc"
):
    """
    Get estimated crypto amount for a fiat price

    Example: POST /nowpayments/estimate
    {
        "amount": 15.00,
        "currency_from": "usd",
        "currency_to": "btc"
    }
    """
    nowpayments = NOWPaymentsService()
    estimate = await nowpayments.get_estimate(amount, currency_from, currency_to)

    if not estimate:
        raise HTTPException(status_code=503, detail="Failed to get price estimate")

    return estimate


from pydantic import BaseModel

class CreateCryptoPaymentRequest(BaseModel):
    tier: str
    period: str
    crypto: str


@router.post("/create-payment")
async def create_crypto_payment(
    payment_request: CreateCryptoPaymentRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Create a new crypto payment

    Example: POST /nowpayments/create-payment
    {
        "tier": "starter",
        "period": "monthly",
        "crypto": "btc"
    }

    Returns payment details with address and amount to pay
    """
    from app.auth import get_current_user

    # Get current user (requires authentication)
    try:
        user = await get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication required")

    tier = payment_request.tier
    period = payment_request.period
    crypto = payment_request.crypto

    # Validate tier and period
    if tier not in ["starter", "pro"]:
        raise HTTPException(status_code=400, detail="Invalid tier. Must be 'starter' or 'pro'")

    if period not in ["monthly", "annual"]:
        raise HTTPException(status_code=400, detail="Invalid period. Must be 'monthly' or 'annual'")

    # Define pricing
    pricing = {
        "starter": {"monthly": 15.00, "annual": 144.00},
        "pro": {"monthly": 39.00, "annual": 374.00}
    }

    price = pricing[tier][period]

    # Create order ID
    order_id = f"user_{user.id}_{tier}_{period}"

    # Create payment description
    plan_name = f"{tier.capitalize()} {period.capitalize()}"
    description = f"CryptoNomadHub {plan_name} Subscription"

    # Callback URLs
    from app.config import settings
    ipn_callback = f"{settings.BACKEND_URL}/nowpayments/webhook"
    success_url = f"{settings.FRONTEND_URL}/dashboard?payment=success"
    cancel_url = f"{settings.FRONTEND_URL}/pricing?payment=cancelled"

    # Create payment via NOWPayments
    nowpayments = NOWPaymentsService()
    payment = await nowpayments.create_payment(
        price_amount=price,
        price_currency="usd",
        pay_currency=crypto.lower(),
        order_id=order_id,
        order_description=description,
        ipn_callback_url=ipn_callback,
        success_url=success_url,
        cancel_url=cancel_url,
        customer_email=user.email
    )

    if not payment:
        raise HTTPException(status_code=503, detail="Failed to create payment")

    # Log payment creation
    audit = AuditLog(
        user_id=user.id,
        action="crypto_payment_initiated",
        details={
            "payment_id": payment.get("payment_id"),
            "tier": tier,
            "period": period,
            "amount": price,
            "crypto": crypto
        }
    )
    db.add(audit)
    db.commit()

    logger.info(f"Created crypto payment {payment.get('payment_id')} for user {user.id}")

    return {
        "payment_id": payment.get("payment_id"),
        "pay_address": payment.get("pay_address"),
        "pay_amount": payment.get("pay_amount"),
        "pay_currency": payment.get("pay_currency"),
        "price_amount": price,
        "price_currency": "USD",
        "order_id": order_id,
        "order_description": description,
        "created_at": payment.get("created_at"),
        "expiration_estimate_date": payment.get("expiration_estimate_date"),
        "payment_url": payment.get("invoice_url")  # Link to NOWPayments payment page
    }
