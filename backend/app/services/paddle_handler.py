import hmac
import hashlib
import requests
from typing import Dict, Optional
from app.config import settings


class PaddleHandler:
    """Service for Paddle payments integration"""

    BASE_URL = "https://vendors.paddle.com/api/2.0"

    def __init__(self):
        self.vendor_id = settings.PADDLE_VENDOR_ID
        self.auth_code = settings.PADDLE_AUTH_CODE
        self.webhook_secret = settings.PADDLE_WEBHOOK_SECRET

    def verify_webhook_signature(self, data: Dict, signature: str) -> bool:
        """
        Verify Paddle webhook signature
        Returns: True if valid, False otherwise
        """
        # Sort data by key
        sorted_data = sorted(data.items())

        # Build string to hash
        data_string = ""
        for key, value in sorted_data:
            if key != "p_signature":
                data_string += f"{key}={value}"

        # Hash with webhook secret
        computed_signature = hmac.new(
            self.webhook_secret.encode(),
            data_string.encode(),
            hashlib.sha1
        ).hexdigest()

        return hmac.compare_digest(computed_signature, signature)

    async def get_subscription_details(self, subscription_id: str) -> Optional[Dict]:
        """Get subscription details from Paddle"""
        url = f"{self.BASE_URL}/subscription/users"
        payload = {
            "vendor_id": self.vendor_id,
            "vendor_auth_code": self.auth_code,
            "subscription_id": subscription_id
        }

        try:
            response = requests.post(url, data=payload)
            response.raise_for_status()
            data = response.json()

            if data.get("success"):
                return data.get("response", [{}])[0]
            return None
        except Exception as e:
            print(f"Error fetching subscription: {e}")
            return None

    async def cancel_subscription(self, subscription_id: str) -> bool:
        """Cancel a subscription"""
        url = f"{self.BASE_URL}/subscription/users_cancel"
        payload = {
            "vendor_id": self.vendor_id,
            "vendor_auth_code": self.auth_code,
            "subscription_id": subscription_id
        }

        try:
            response = requests.post(url, data=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("success", False)
        except Exception as e:
            print(f"Error canceling subscription: {e}")
            return False

    def get_plan_tier_from_id(self, plan_id: str) -> str:
        """Map Paddle plan ID to tier name"""
        plan_mapping = {
            settings.PADDLE_PLAN_STARTER: "starter",
            settings.PADDLE_PLAN_PRO: "pro",
            settings.PADDLE_PLAN_ENTERPRISE: "enterprise"
        }
        return plan_mapping.get(str(plan_id), "free")

    def get_checkout_url(
        self,
        plan_id: str,
        user_email: str,
        user_id: int,
        success_url: str = None
    ) -> str:
        """
        Generate Paddle checkout URL
        Note: For production, use Paddle.js on frontend
        This is for programmatic/API usage
        """
        base_checkout = "https://buy.paddle.com/product"
        params = f"?product_id={plan_id}&email={user_email}&passthrough={user_id}"

        if success_url:
            params += f"&success_url={success_url}"

        return base_checkout + params
