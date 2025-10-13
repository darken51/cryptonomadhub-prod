"""
Email Service

Handles sending emails for:
- Password reset
- Email verification
- Usage warnings
- Subscription notifications
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP"""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.frontend_url = settings.FRONTEND_URL

    def send_email(self, to_email: str, subject: str, html_body: str, text_body: str = None) -> bool:
        """
        Send email via SMTP

        Args:
            to_email: Recipient email
            subject: Email subject
            html_body: HTML email body
            text_body: Plain text fallback (optional)

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.smtp_user
            msg['To'] = to_email

            # Add text and HTML parts
            if text_body:
                part1 = MIMEText(text_body, 'plain')
                msg.attach(part1)

            part2 = MIMEText(html_body, 'html')
            msg.attach(part2)

            # Connect and send
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"Email sent to {to_email}: {subject}")
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
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>

                    <p>We received a request to reset your password for your NomadCrypto Hub account.</p>

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
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Never share this link with anyone</li>
                        </ul>
                    </div>

                    <p>Need help? Contact us at support@cryptonomadhub.com</p>
                </div>
                <div class="footer">
                    <p>NomadCrypto Hub - Crypto Tax Optimization for Digital Nomads</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Password Reset Request

        We received a request to reset your password for your NomadCrypto Hub account.

        Reset your password by visiting this link:
        {reset_url}

        This link expires in 1 hour.

        If you didn't request this reset, please ignore this email.

        NomadCrypto Hub
        """

        return self.send_email(
            to_email=to_email,
            subject="Reset Your Password - NomadCrypto Hub",
            html_body=html_body,
            text_body=text_body
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
                .button {{ display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✉️ Verify Your Email</h1>
                </div>
                <div class="content">
                    <p>Welcome to NomadCrypto Hub!</p>

                    <p>Please verify your email address to activate your account and start optimizing your crypto taxes.</p>

                    <center>
                        <a href="{verify_url}" class="button">Verify Email</a>
                    </center>

                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">{verify_url}</p>

                    <p><strong>This link expires in 24 hours.</strong></p>

                    <p>After verification, you'll have access to:</p>
                    <ul>
                        <li>✅ 5 free tax simulations per month</li>
                        <li>✅ 98 country tax regulations</li>
                        <li>✅ AI-powered tax assistant</li>
                    </ul>

                    <p>Questions? Reply to this email or visit our help center.</p>
                </div>
                <div class="footer">
                    <p>NomadCrypto Hub - Crypto Tax Optimization for Digital Nomads</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Welcome to NomadCrypto Hub!

        Please verify your email address to activate your account.

        Verify your email by visiting this link:
        {verify_url}

        This link expires in 24 hours.

        NomadCrypto Hub
        """

        return self.send_email(
            to_email=to_email,
            subject="Verify Your Email - NomadCrypto Hub",
            html_body=html_body,
            text_body=text_body
        )

    def send_usage_warning_email(self, to_email: str, resource: str, usage_percent: int, limit: int) -> bool:
        """
        Send usage warning email when approaching limit

        Args:
            to_email: User's email
            resource: Resource name (simulations, defi_audits, etc.)
            usage_percent: Current usage percentage
            limit: Monthly limit

        Returns:
            True if sent successfully
        """
        resource_names = {
            "simulations": "Tax Simulations",
            "defi_audits": "DeFi Audits",
            "pdf_exports": "PDF Exports",
            "chat_messages": "AI Chat Messages"
        }

        resource_name = resource_names.get(resource, resource)
        upgrade_url = f"{self.frontend_url}/pricing"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #fbbf24; color: #78350f; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .progress {{ background: #e5e7eb; border-radius: 10px; height: 20px; margin: 20px 0; }}
                .progress-bar {{ background: #fbbf24; height: 100%; border-radius: 10px; width: {usage_percent}%; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ Usage Alert</h1>
                </div>
                <div class="content">
                    <p>You've used <strong>{usage_percent}%</strong> of your monthly {resource_name} limit.</p>

                    <div class="progress">
                        <div class="progress-bar"></div>
                    </div>

                    <p>Upgrade your plan to get more {resource_name} and unlock additional features!</p>

                    <center>
                        <a href="{upgrade_url}" class="button">View Plans</a>
                    </center>

                    <p><strong>Our plans:</strong></p>
                    <ul>
                        <li>💎 <strong>STARTER</strong> - $20/month - 50 simulations, 5 DeFi audits</li>
                        <li>🚀 <strong>PRO</strong> - $50/month - 500 simulations, 50 DeFi audits</li>
                        <li>🏢 <strong>ENTERPRISE</strong> - Custom pricing - Unlimited everything</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>NomadCrypto Hub</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(
            to_email=to_email,
            subject=f"⚠️ You've Used {usage_percent}% of Your {resource_name}",
            html_body=html_body
        )
