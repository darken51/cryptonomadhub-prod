"""
Email Service

Handles sending emails via Resend API for:
- Password reset
- Email verification
- Usage warnings
- Subscription notifications
"""

import resend
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via Resend API"""

    def __init__(self):
        resend.api_key = settings.RESEND_API_KEY
        self.frontend_url = settings.FRONTEND_URL
        self.from_email = f"CryptoNomadHub <noreply@cryptonomadhub.io>"

    def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """
        Send email via Resend API

        Args:
            to_email: Recipient email
            subject: Email subject
            html_body: HTML email body

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            params = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_body,
            }

            response = resend.Emails.send(params)
            logger.info(f"Email sent to {to_email}: {subject} (ID: {response.get('id', 'unknown')})")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """
        Send password reset email

        Args:
            to_email: User's email
            reset_token: Password reset token

        Returns:
            True if sent successfully
        """
        reset_url = f"{self.frontend_url}/auth/reset-password?token={reset_token}"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
                .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Reset Your Password</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>

                    <p>We received a request to reset your password for your CryptoNomadHub account.</p>

                    <p>Click the button below to reset your password:</p>

                    <center>
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </center>

                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">{reset_url}</p>

                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>This link expires in 1 hour</li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>Never share this link with anyone</li>
                        </ul>
                    </div>

                    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                </div>
                <div class="footer">
                    <p>CryptoNomadHub - Crypto Tax Optimization for Digital Nomads</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(
            to_email=to_email,
            subject="Reset Your Password - CryptoNomadHub",
            html_body=html_body
        )

    def send_verification_email(self, to_email: str, verification_token: str) -> bool:
        """
        Send email verification email

        Args:
            to_email: User's email
            verification_token: Email verification token

        Returns:
            True if sent successfully
        """
        verify_url = f"{self.frontend_url}/auth/verify-email?token={verification_token}"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
                .features {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .feature {{ margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to CryptoNomadHub!</h1>
                </div>
                <div class="content">
                    <p>Hi there,</p>

                    <p>Thanks for joining CryptoNomadHub - your ultimate crypto tax optimization platform for digital nomads!</p>

                    <p><strong>Please verify your email address to activate your account:</strong></p>

                    <center>
                        <a href="{verify_url}" class="button">✓ Verify My Email</a>
                    </center>

                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">{verify_url}</p>

                    <div class="features">
                        <h3 style="margin-top: 0; color: #667eea;">What's included in your FREE account:</h3>
                        <div class="feature">🌍 <strong>167 Countries</strong> - Tax regulations & crypto laws</div>
                        <div class="feature">🗺️ <strong>Interactive Map</strong> - Visualize crypto-friendly jurisdictions</div>
                        <div class="feature">🤖 <strong>AI Analysis</strong> - Crypto & Nomad scores for each country</div>
                        <div class="feature">📊 <strong>Tax Comparisons</strong> - Find the best country for your situation</div>
                        <div class="feature">💼 <strong>Simulations</strong> - Estimate your tax obligations</div>
                    </div>

                    <p style="margin-top: 25px;"><strong>⚠️ Important:</strong> This verification link expires in 24 hours.</p>

                    <p>Questions? Just reply to this email (we're real humans 👋)</p>
                </div>
                <div class="footer">
                    <p><strong>CryptoNomadHub</strong> - Optimize Your Crypto Taxes Worldwide</p>
                    <p><a href="https://cryptonomadhub.io" style="color: #667eea;">cryptonomadhub.io</a></p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(
            to_email=to_email,
            subject="✉️ Verify your email - CryptoNomadHub",
            html_body=html_body
        )

    def send_usage_warning_email(self, to_email: str, usage_percent: int, limit_name: str) -> bool:
        """
        Send usage warning email when user approaches limit

        Args:
            to_email: User's email
            usage_percent: Percentage of limit used (e.g., 80)
            limit_name: Name of the limit (e.g., "API calls", "simulations")

        Returns:
            True if sent successfully
        """
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }}
                .progress {{ background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }}
                .progress-bar {{ background: linear-gradient(90deg, #f59e0b 0%, #dc2626 100%); height: 100%; width: {usage_percent}%; text-align: center; line-height: 30px; color: white; font-weight: bold; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ Usage Alert</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>

                    <div class="warning">
                        <strong>You've used {usage_percent}% of your {limit_name} limit.</strong>
                    </div>

                    <div class="progress">
                        <div class="progress-bar">{usage_percent}%</div>
                    </div>

                    <p>You're approaching your monthly limit for <strong>{limit_name}</strong>.</p>

                    <p><strong>What happens when you reach 100%?</strong></p>
                    <ul>
                        <li>You won't be able to use this feature until next month</li>
                        <li>Your account remains active</li>
                        <li>Other features continue to work normally</li>
                    </ul>

                    <p><strong>Want unlimited access?</strong></p>
                    <p>Upgrade to a paid plan for unlimited {limit_name} and premium features.</p>

                    <center>
                        <a href="{self.frontend_url}/pricing" class="button">View Plans</a>
                    </center>
                </div>
                <div class="footer">
                    <p>CryptoNomadHub - Crypto Tax Optimization</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(
            to_email=to_email,
            subject=f"⚠️ {usage_percent}% of your {limit_name} limit used",
            html_body=html_body
        )

    def send_subscription_notification(self, to_email: str, plan_name: str, status: str) -> bool:
        """
        Send subscription status notification

        Args:
            to_email: User's email
            plan_name: Name of the plan (e.g., "Pro")
            status: Status (e.g., "activated", "cancelled", "expired")

        Returns:
            True if sent successfully
        """
        status_messages = {
            "activated": ("🎉 Subscription Activated!", "#10b981", "Your subscription is now active"),
            "cancelled": ("Subscription Cancelled", "#f59e0b", "Your subscription has been cancelled"),
            "expired": ("⏰ Subscription Expired", "#dc2626", "Your subscription has expired"),
        }

        title, color, message = status_messages.get(status, ("Subscription Update", "#667eea", "Subscription status changed"))

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: {color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{title}</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>

                    <p><strong>{message}</strong></p>
                    <p>Plan: <strong>{plan_name}</strong></p>

                    <center>
                        <a href="{self.frontend_url}/dashboard" class="button">Go to Dashboard</a>
                    </center>

                    <p>If you have any questions, feel free to contact our support team.</p>
                </div>
                <div class="footer">
                    <p>CryptoNomadHub - Crypto Tax Optimization</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(
            to_email=to_email,
            subject=f"{title} - {plan_name}",
            html_body=html_body
        )
