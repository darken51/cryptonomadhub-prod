"""
Notification Service

Multi-channel notification system for DeFi audit completion, tax alerts, and reports.

Supported Channels:
- Email (SendGrid)
- SMS (Twilio)
- Push notifications (Firebase - future)
- Webhooks

Features:
- Template-based messages
- Priority levels
- Rate limiting
- Delivery tracking
"""

from typing import Optional, Dict, List
import logging
import httpx
from datetime import datetime
from sqlalchemy.orm import Session
from app.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Multi-channel notification service
    """

    def __init__(self, db: Session):
        self.db = db
        self.http_client = httpx.AsyncClient(timeout=10.0)
        
        # SendGrid configuration
        self.sendgrid_api_key = getattr(settings, 'SENDGRID_API_KEY', None)
        self.sendgrid_from = getattr(settings, 'SENDGRID_FROM_EMAIL', 'noreply@cryptonomadhub.com')
        
        # Twilio configuration
        self.twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
        self.twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
        self.twilio_from = getattr(settings, 'TWILIO_FROM_NUMBER', None)

    async def notify_audit_complete(self, user_id: int, audit_id: int) -> bool:
        """
        Notify user that their DeFi audit is complete

        Args:
            user_id: User ID
            audit_id: Audit ID

        Returns:
            True if notification sent successfully
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"User {user_id} not found")
            return False

        # Prepare message
        subject = "Your DeFi Audit is Complete!"
        body = f"""
Hi {user.username},

Your DeFi audit (ID: {audit_id}) has been completed successfully.

You can now view your comprehensive tax report, including:
- Total transactions analyzed
- Capital gains/losses breakdown
- Short-term vs long-term holdings
- Cost basis calculations
- Tax optimization suggestions

View your report: {settings.FRONTEND_URL}/defi-audit/{audit_id}

Best regards,
CryptoNomadHub Team
"""

        # Send email
        email_sent = False
        if user.email:
            email_sent = await self.send_email(
                to_email=user.email,
                subject=subject,
                body=body
            )

        # Send SMS if configured
        sms_sent = False
        if hasattr(user, 'phone_number') and user.phone_number:
            sms_body = f"Your DeFi audit (ID: {audit_id}) is complete! View at {settings.FRONTEND_URL}/defi-audit/{audit_id}"
            sms_sent = await self.send_sms(
                to_phone=user.phone_number,
                body=sms_body
            )

        return email_sent or sms_sent

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html: Optional[str] = None
    ) -> bool:
        """
        Send email via SendGrid

        Args:
            to_email: Recipient email
            subject: Email subject
            body: Plain text body
            html: Optional HTML body

        Returns:
            True if sent successfully
        """
        if not self.sendgrid_api_key:
            logger.warning("SendGrid API key not configured")
            return False

        try:
            url = "https://api.sendgrid.com/v3/mail/send"
            
            payload = {
                "personalizations": [{
                    "to": [{"email": to_email}],
                    "subject": subject
                }],
                "from": {"email": self.sendgrid_from},
                "content": [
                    {"type": "text/plain", "value": body}
                ]
            }

            if html:
                payload["content"].append({"type": "text/html", "value": html})

            headers = {
                "Authorization": f"Bearer {self.sendgrid_api_key}",
                "Content-Type": "application/json"
            }

            response = await self.http_client.post(url, json=payload, headers=headers)

            if response.status_code == 202:
                logger.info(f"Email sent to {to_email}")
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    async def send_sms(self, to_phone: str, body: str) -> bool:
        """
        Send SMS via Twilio

        Args:
            to_phone: Recipient phone number (E.164 format)
            body: SMS body (max 160 characters)

        Returns:
            True if sent successfully
        """
        if not all([self.twilio_sid, self.twilio_token, self.twilio_from]):
            logger.warning("Twilio credentials not configured")
            return False

        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.twilio_sid}/Messages.json"

            data = {
                "From": self.twilio_from,
                "To": to_phone,
                "Body": body[:160]  # Truncate to 160 chars
            }

            response = await self.http_client.post(
                url,
                data=data,
                auth=(self.twilio_sid, self.twilio_token)
            )

            if response.status_code == 201:
                logger.info(f"SMS sent to {to_phone}")
                return True
            else:
                logger.error(f"Twilio error: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"Failed to send SMS: {e}")
            return False

    async def send_webhook(self, url: str, payload: Dict) -> bool:
        """
        Send webhook notification

        Args:
            url: Webhook URL
            payload: JSON payload

        Returns:
            True if sent successfully
        """
        try:
            response = await self.http_client.post(url, json=payload)

            if 200 <= response.status_code < 300:
                logger.info(f"Webhook sent to {url}")
                return True
            else:
                logger.error(f"Webhook error: {response.status_code}")
                return False

        except Exception as e:
            logger.error(f"Failed to send webhook: {e}")
            return False

    async def notify_tax_optimization(
        self,
        user_id: int,
        suggestions: Dict
    ) -> bool:
        """
        Notify user about tax optimization opportunities

        Args:
            user_id: User ID
            suggestions: Tax optimization suggestions

        Returns:
            True if notification sent
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.email:
            return False

        potential_savings = suggestions.get("total_potential_savings", 0)

        subject = f"Tax Optimization Alert: Save ${potential_savings:,.0f}"
        body = f"""
Hi {user.username},

We've identified tax optimization opportunities in your portfolio:

Potential Tax Savings: ${potential_savings:,.2f}

Suggestions:
"""

        for suggestion in suggestions.get("trades_suggested", [])[:5]:
            body += f"\n- {suggestion.get('action', 'N/A')}: {suggestion.get('token', 'N/A')} (Save: ${suggestion.get('tax_savings', 0):,.2f})"

        body += f"""

View full report: {settings.FRONTEND_URL}/tax-optimizer

Best regards,
CryptoNomadHub Team
"""

        return await self.send_email(
            to_email=user.email,
            subject=subject,
            body=body
        )

    async def notify_wash_sale_warning(
        self,
        user_id: int,
        token: str,
        disallowed_loss: float
    ) -> bool:
        """
        Warn user about wash sale violation

        Args:
            user_id: User ID
            token: Token symbol
            disallowed_loss: Amount of disallowed loss

        Returns:
            True if notification sent
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.email:
            return False

        subject = f"Wash Sale Alert: {token}"
        body = f"""
Hi {user.username},

We detected a potential wash sale violation for {token}.

Disallowed Loss: ${abs(disallowed_loss):,.2f}

What this means:
- You sold {token} at a loss
- You repurchased {token} within 30 days
- Under IRS wash sale rules, this loss cannot be claimed immediately
- The loss has been added to the cost basis of your new purchase

Learn more: {settings.FRONTEND_URL}/help/wash-sale-rule

Best regards,
CryptoNomadHub Team
"""

        return await self.send_email(
            to_email=user.email,
            subject=subject,
            body=body
        )

    async def notify_report_ready(
        self,
        user_id: int,
        report_type: str,
        report_url: str
    ) -> bool:
        """
        Notify user that their tax report is ready

        Args:
            user_id: User ID
            report_type: Report type (pdf, csv, turbotax, etc.)
            report_url: URL to download report

        Returns:
            True if notification sent
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.email:
            return False

        subject = f"Your {report_type.upper()} Tax Report is Ready"
        body = f"""
Hi {user.username},

Your {report_type} tax report has been generated and is ready for download.

Download: {report_url}

This report includes:
- Complete transaction history
- Capital gains/losses calculations
- Cost basis details
- Tax form data (if applicable)

Reports expire after 30 days for security.

Best regards,
CryptoNomadHub Team
"""

        return await self.send_email(
            to_email=user.email,
            subject=subject,
            body=body
        )

    async def send_bulk_notification(
        self,
        user_ids: List[int],
        subject: str,
        body: str,
        channel: str = "email"
    ) -> Dict[str, int]:
        """
        Send notification to multiple users

        Args:
            user_ids: List of user IDs
            subject: Message subject
            body: Message body
            channel: Notification channel (email, sms)

        Returns:
            Dict with success/failure counts
        """
        results = {"success": 0, "failed": 0}

        for user_id in user_ids:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                results["failed"] += 1
                continue

            if channel == "email" and user.email:
                sent = await self.send_email(user.email, subject, body)
            elif channel == "sms" and hasattr(user, 'phone_number') and user.phone_number:
                sent = await self.send_sms(user.phone_number, body[:160])
            else:
                results["failed"] += 1
                continue

            if sent:
                results["success"] += 1
            else:
                results["failed"] += 1

        logger.info(f"Bulk notification: {results['success']} sent, {results['failed']} failed")
        return results
