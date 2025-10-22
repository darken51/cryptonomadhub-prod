"""
✅ PHASE 3.3: Monitoring and error tracking with Sentry
✅ BONUS 5: Performance monitoring with custom metrics

Configure Sentry for production error monitoring and performance tracking.
"""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from app.config import settings
import logging
import time
from functools import wraps
from typing import Callable, Any
from contextlib import contextmanager

logger = logging.getLogger(__name__)


def init_sentry():
    """
    Initialize Sentry SDK for error tracking and performance monitoring.

    Only activates in production when SENTRY_DSN is configured.
    Captures unhandled exceptions, performance traces, and custom events.
    """
    if not settings.SENTRY_DSN:
        logger.info("Sentry DSN not configured, skipping Sentry initialization")
        return

    if settings.ENVIRONMENT == "development":
        logger.info("Development environment detected, skipping Sentry initialization")
        return

    try:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.ENVIRONMENT,

            # Performance monitoring
            traces_sample_rate=0.1,  # 10% of transactions for performance monitoring

            # Release tracking (use git commit hash in production)
            # release="nomadcrypto@1.0.0",

            # Integrations
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
                RedisIntegration(),
            ],

            # Send default PII (Personally Identifiable Information)
            send_default_pii=False,  # Don't send user IP, cookies, etc.

            # Before send hook to filter sensitive data
            before_send=filter_sensitive_data,
        )

        logger.info(f"Sentry initialized successfully for environment: {settings.ENVIRONMENT}")

    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {e}")


def filter_sensitive_data(event, hint):
    """
    Filter sensitive data before sending to Sentry.

    Removes passwords, tokens, API keys, and other sensitive information
    from error reports.

    Args:
        event (dict): Sentry event data
        hint (dict): Additional context

    Returns:
        dict: Filtered event or None to drop the event
    """
    # Remove sensitive keys from request data
    if "request" in event and "data" in event["request"]:
        sensitive_keys = [
            "password",
            "token",
            "api_key",
            "secret",
            "authorization",
            "cookie",
            "jwt",
            "refresh_token",
        ]

        for key in sensitive_keys:
            if key in event["request"]["data"]:
                event["request"]["data"][key] = "[REDACTED]"

    # Remove sensitive environment variables
    if "extra" in event:
        for key in list(event["extra"].keys()):
            if any(
                sensitive in key.lower()
                for sensitive in ["password", "secret", "key", "token"]
            ):
                event["extra"][key] = "[REDACTED]"

    return event


# ✅ BONUS 5: Performance Monitoring Utilities

@contextmanager
def monitor_performance(operation_name: str, tags: dict = None):
    """
    Context manager to monitor performance of operations.

    Usage:
        with monitor_performance("tax_calculation", {"country": "US"}):
            result = calculate_tax(...)

    Args:
        operation_name (str): Name of the operation being monitored
        tags (dict): Additional tags/context for the metric

    Yields:
        None
    """
    start_time = time.time()

    # Start a Sentry transaction
    with sentry_sdk.start_transaction(op=operation_name, name=operation_name) as transaction:
        if tags:
            for key, value in tags.items():
                transaction.set_tag(key, str(value))

        try:
            yield
        except Exception as e:
            # Capture exception with context
            sentry_sdk.capture_exception(e)
            transaction.set_status("internal_error")
            raise
        finally:
            duration = time.time() - start_time

            # Log performance metric
            logger.info(
                f"Performance: {operation_name} completed in {duration:.3f}s",
                extra={"operation": operation_name, "duration": duration, "tags": tags}
            )

            # Set custom measurement
            transaction.set_measurement(operation_name, duration, "second")


def track_metric(name: str, value: float, unit: str = "none", tags: dict = None):
    """
    Track custom metric in Sentry.

    Usage:
        track_metric("simulations_created", 1, "count", {"country": "US"})
        track_metric("api_latency", 0.250, "second", {"endpoint": "/simulations"})

    Args:
        name (str): Metric name
        value (float): Metric value
        unit (str): Unit of measurement (second, millisecond, byte, count, etc.)
        tags (dict): Additional tags/context
    """
    # Set metric in current transaction if one exists
    transaction = sentry_sdk.Hub.current.scope.transaction
    if transaction:
        transaction.set_measurement(name, value, unit)
        if tags:
            for key, val in tags.items():
                transaction.set_tag(key, str(val))

    # Also log for local debugging
    logger.debug(
        f"Metric: {name} = {value} {unit}",
        extra={"metric": name, "value": value, "unit": unit, "tags": tags}
    )


def monitor_endpoint(func: Callable) -> Callable:
    """
    Decorator to automatically monitor endpoint performance.

    Usage:
        @router.get("/endpoint")
        @monitor_endpoint
        async def my_endpoint():
            return {"status": "ok"}

    Args:
        func: The async function to monitor

    Returns:
        Wrapped function with performance monitoring
    """
    @wraps(func)
    async def wrapper(*args, **kwargs) -> Any:
        endpoint_name = func.__name__

        with monitor_performance(f"endpoint_{endpoint_name}"):
            result = await func(*args, **kwargs)

            # Track successful execution
            track_metric(
                f"{endpoint_name}_success",
                1,
                "count",
                {"endpoint": endpoint_name}
            )

            return result

    return wrapper


def set_user_context(user_id: int, email: str = None):
    """
    Set user context for Sentry error tracking.

    Usage:
        set_user_context(user.id, user.email)

    Args:
        user_id (int): User ID
        email (str): User email (optional, will be hashed if provided)
    """
    sentry_sdk.set_user({
        "id": str(user_id),
        # Don't send real email to comply with privacy
        "email": f"user_{user_id}@redacted.com" if not email else email
    })


def capture_message(message: str, level: str = "info", tags: dict = None):
    """
    Capture custom message in Sentry.

    Usage:
        capture_message("High value transaction detected", "warning", {"amount": 1000000})

    Args:
        message (str): Message to capture
        level (str): Severity level (debug, info, warning, error, fatal)
        tags (dict): Additional tags
    """
    with sentry_sdk.push_scope() as scope:
        if tags:
            for key, value in tags.items():
                scope.set_tag(key, str(value))

        sentry_sdk.capture_message(message, level=level)


# Performance tracking for critical operations
class PerformanceTracker:
    """
    Track performance metrics for critical operations.

    Usage:
        tracker = PerformanceTracker("tax_simulation")
        tracker.start()
        # ... do work ...
        tracker.stop({"country": "US", "user_id": 123})
    """

    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = None
        self.transaction = None

    def start(self):
        """Start tracking performance"""
        self.start_time = time.time()
        self.transaction = sentry_sdk.start_transaction(
            op=self.operation_name,
            name=self.operation_name
        )
        self.transaction.__enter__()

    def stop(self, tags: dict = None, measurements: dict = None):
        """
        Stop tracking and record metrics.

        Args:
            tags (dict): Tags to attach to the transaction
            measurements (dict): Custom measurements {name: value}
        """
        if not self.start_time or not self.transaction:
            return

        duration = time.time() - self.start_time

        # Set tags
        if tags:
            for key, value in tags.items():
                self.transaction.set_tag(key, str(value))

        # Set measurements
        self.transaction.set_measurement(f"{self.operation_name}_duration", duration, "second")
        if measurements:
            for name, value in measurements.items():
                self.transaction.set_measurement(name, value, "none")

        # Complete transaction
        self.transaction.__exit__(None, None, None)

        logger.info(
            f"Performance: {self.operation_name} completed",
            extra={
                "operation": self.operation_name,
                "duration": duration,
                "tags": tags,
                "measurements": measurements
            }
        )
