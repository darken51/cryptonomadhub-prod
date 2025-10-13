"""
Sentry Configuration

Configures Sentry for error tracking and performance monitoring
"""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from app.config import settings
import logging

logger = logging.getLogger(__name__)


def init_sentry():
    """
    Initialize Sentry SDK for error tracking

    Only initializes in production if SENTRY_DSN is configured
    """
    if not settings.SENTRY_DSN or settings.SENTRY_DSN == "your_sentry_dsn":
        logger.info("Sentry not configured - skipping initialization")
        return

    # Configure Sentry with all integrations
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,

        # Integrations
        integrations=[
            # FastAPI integration - captures HTTP requests/responses
            FastApiIntegration(
                transaction_style="url",  # Group transactions by URL pattern
                failed_request_status_codes=[403, *range(500, 599)],  # Track 403 and 5xx errors
            ),

            # SQLAlchemy integration - tracks database queries
            SqlalchemyIntegration(),

            # Redis integration - tracks Redis operations
            RedisIntegration(),

            # Celery integration - tracks background tasks
            CeleryIntegration(),

            # Logging integration - captures log messages
            LoggingIntegration(
                level=logging.INFO,  # Capture info and above
                event_level=logging.ERROR  # Send errors as events
            ),
        ],

        # Performance Monitoring (APM)
        traces_sample_rate=0.1 if settings.ENVIRONMENT == "production" else 1.0,
        # In production, sample 10% of transactions for performance monitoring
        # In development, sample 100%

        # Error Sampling
        sample_rate=1.0,  # Send 100% of errors

        # Release tracking
        release=f"nomadcrypto@1.0.0",  # Update this with your release version

        # Additional options
        attach_stacktrace=True,  # Attach stack traces to messages
        send_default_pii=False,  # Don't send personally identifiable information

        # Before send hook - filter sensitive data
        before_send=before_send_hook,

        # Performance profiling
        profiles_sample_rate=0.1 if settings.ENVIRONMENT == "production" else 1.0,
    )

    logger.info(f"✅ Sentry initialized for environment: {settings.ENVIRONMENT}")


def before_send_hook(event, hint):
    """
    Hook called before sending events to Sentry

    Used to filter sensitive data and customize error reporting
    """
    # Don't send events from health checks
    if event.get("transaction") == "/health":
        return None

    # Filter sensitive headers
    if "request" in event:
        headers = event["request"].get("headers", {})

        # Remove sensitive headers
        sensitive_headers = ["Authorization", "Cookie", "X-API-Key"]
        for header in sensitive_headers:
            if header in headers:
                headers[header] = "[Filtered]"

    # Filter sensitive query params
    if "request" in event and "query_string" in event["request"]:
        query = event["request"]["query_string"]
        # Remove tokens, passwords, etc from query strings
        if any(sensitive in query.lower() for sensitive in ["token", "password", "secret", "key"]):
            event["request"]["query_string"] = "[Filtered]"

    return event


def set_user_context(user_id: int, email: str, tier: str = None):
    """
    Set user context for Sentry error reports

    Args:
        user_id: User ID
        email: User email (hashed in production)
        tier: License tier (FREE, STARTER, PRO, ENTERPRISE)
    """
    sentry_sdk.set_user({
        "id": user_id,
        "email": email if settings.ENVIRONMENT != "production" else f"user_{user_id}@redacted.com",
        "tier": tier
    })


def set_transaction_context(transaction_name: str, tags: dict = None):
    """
    Set transaction context for performance monitoring

    Args:
        transaction_name: Name of the transaction (e.g., "simulation.create")
        tags: Additional tags for filtering
    """
    with sentry_sdk.configure_scope() as scope:
        scope.set_transaction_name(transaction_name)

        if tags:
            for key, value in tags.items():
                scope.set_tag(key, value)


def capture_message(message: str, level: str = "info", **kwargs):
    """
    Capture a message in Sentry

    Args:
        message: Message to capture
        level: Log level (debug, info, warning, error, fatal)
        **kwargs: Additional context
    """
    with sentry_sdk.push_scope() as scope:
        for key, value in kwargs.items():
            scope.set_extra(key, value)

        sentry_sdk.capture_message(message, level=level)


def capture_exception(exception: Exception, **kwargs):
    """
    Capture an exception in Sentry

    Args:
        exception: Exception to capture
        **kwargs: Additional context
    """
    with sentry_sdk.push_scope() as scope:
        for key, value in kwargs.items():
            scope.set_extra(key, value)

        sentry_sdk.capture_exception(exception)
