"""
NOWPayments Service for Crypto Payment Processing

Handles:
- Payment creation (invoices)
- Payment status checking
- Webhook signature verification
- Currency conversion
"""

import httpx
import hmac
import hashlib
import json
import logging
from typing import Dict, Optional, List
from decimal import Decimal

from app.config import settings

logger = logging.getLogger(__name__)


class NOWPaymentsService:
    """Service for handling NOWPayments crypto payment processing"""

    BASE_URL = "https://api.nowpayments.io/v1"
    SANDBOX_URL = "https://api-sandbox.nowpayments.io/v1"

    def __init__(self):
        self.api_key = settings.NOWPAYMENTS_API_KEY
        self.ipn_secret = settings.NOWPAYMENTS_IPN_SECRET
        self.base_url = self.SANDBOX_URL if settings.NOWPAYMENTS_SANDBOX else self.BASE_URL

    def _get_headers(self) -> Dict[str, str]:
        """Get API request headers"""
        return {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }

    async def get_available_currencies(self) -> List[str]:
        """Get list of available cryptocurrencies"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/currencies",
                    headers=self._get_headers()
                )
                response.raise_for_status()
                data = response.json()
                return data.get("currencies", [])
        except Exception as e:
            logger.error(f"Failed to get available currencies: {e}")
            return ["btc", "eth", "usdttrc20", "ltc"]  # Fallback defaults

    async def get_estimate(self, amount: Decimal, currency_from: str = "usd", currency_to: str = "btc") -> Optional[Dict]:
        """
        Get estimated price for crypto payment

        Args:
            amount: Amount in source currency
            currency_from: Source currency (default: usd)
            currency_to: Target cryptocurrency

        Returns:
            Dict with estimated_amount and other info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/estimate",
                    headers=self._get_headers(),
                    params={
                        "amount": str(amount),
                        "currency_from": currency_from,
                        "currency_to": currency_to
                    }
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to get price estimate: {e}")
            return None

    async def create_payment(
        self,
        price_amount: Decimal,
        price_currency: str,
        pay_currency: str,
        order_id: str,
        order_description: str,
        ipn_callback_url: str,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
        customer_email: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Create a new crypto payment

        Args:
            price_amount: Amount in fiat (e.g., 15.00)
            price_currency: Fiat currency (e.g., "usd")
            pay_currency: Crypto to receive (e.g., "btc", "eth", "usdttrc20")
            order_id: Unique order ID (e.g., "user_123_starter_monthly")
            order_description: Human-readable description
            ipn_callback_url: Webhook URL for status updates
            success_url: Redirect URL after successful payment
            cancel_url: Redirect URL after cancelled payment
            customer_email: Customer email (optional)

        Returns:
            Payment data with payment_id, pay_address, pay_amount, etc.
        """
        payload = {
            "price_amount": str(price_amount),
            "price_currency": price_currency,
            "pay_currency": pay_currency,
            "order_id": order_id,
            "order_description": order_description,
            "ipn_callback_url": ipn_callback_url,
        }

        if success_url:
            payload["success_url"] = success_url
        if cancel_url:
            payload["cancel_url"] = cancel_url
        # Note: customer_email not used in payload as NOWPayments doesn't accept it for /payment endpoint

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/payment",
                    headers=self._get_headers(),
                    json=payload
                )
                response.raise_for_status()
                payment_data = response.json()

                logger.info(f"Created payment: {payment_data.get('payment_id')} for order {order_id}")
                return payment_data

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error creating payment: {e.response.status_code} - {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Failed to create payment: {e}")
            return None

    async def get_payment_status(self, payment_id: int) -> Optional[Dict]:
        """
        Get payment status by payment ID

        Returns:
            Payment data with status: waiting, confirming, confirmed, sending, partially_paid, finished, failed, refunded, expired
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/payment/{payment_id}",
                    headers=self._get_headers()
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to get payment status: {e}")
            return None

    def verify_ipn_signature(self, request_body: bytes, signature: str) -> bool:
        """
        Verify IPN webhook signature

        Args:
            request_body: Raw request body (bytes)
            signature: Signature from x-nowpayments-sig header

        Returns:
            True if signature is valid
        """
        try:
            # Sort JSON keys as NOWPayments does
            sorted_body = json.dumps(json.loads(request_body), sort_keys=True, separators=(',', ':'))

            # Calculate HMAC
            expected_signature = hmac.new(
                self.ipn_secret.encode('utf-8'),
                sorted_body.encode('utf-8'),
                hashlib.sha512
            ).hexdigest()

            is_valid = hmac.compare_digest(signature, expected_signature)

            if not is_valid:
                logger.warning(f"Invalid IPN signature. Expected: {expected_signature[:20]}... Got: {signature[:20]}...")

            return is_valid

        except Exception as e:
            logger.error(f"Failed to verify IPN signature: {e}")
            return False

    async def get_minimum_payment_amount(self, currency: str) -> Optional[Decimal]:
        """Get minimum payment amount for a currency"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/min-amount",
                    headers=self._get_headers(),
                    params={"currency_from": "usd", "currency_to": currency}
                )
                response.raise_for_status()
                data = response.json()
                return Decimal(str(data.get("min_amount", 0)))
        except Exception as e:
            logger.error(f"Failed to get minimum amount: {e}")
            return Decimal("0.01")
