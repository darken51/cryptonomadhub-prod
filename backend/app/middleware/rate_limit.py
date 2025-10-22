"""
Rate limiting middleware using slowapi and Redis
Protects API endpoints from abuse and DDoS attacks
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import redis
from app.config import settings


# Initialize Redis connection for rate limiting
# Support for Upstash Redis with TLS
redis_url = settings.REDIS_URL
if redis_url.startswith('rediss://'):
    redis_client = redis.from_url(
        redis_url,
        decode_responses=True,
        ssl_cert_reqs=None  # Disable SSL certificate verification for Upstash
    )
else:
    redis_client = redis.from_url(redis_url, decode_responses=True)


def get_user_identifier(request: Request) -> str:
    """
    Get unique identifier for rate limiting.
    Uses user ID if authenticated, otherwise IP address.
    """
    # Try to get user from request state (set by auth middleware)
    if hasattr(request.state, "user") and request.state.user:
        return f"user:{request.state.user.id}"

    # Fallback to IP address for anonymous users
    return f"ip:{get_remote_address(request)}"


# Initialize limiter
limiter = Limiter(
    key_func=get_user_identifier,
    storage_uri=settings.REDIS_URL,
    default_limits=["100/minute", "1000/hour"],  # Global defaults
    headers_enabled=True,  # Add rate limit headers to responses
)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """
    Custom error handler for rate limit exceeded
    """
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please try again later.",
            "retry_after": exc.detail if hasattr(exc, "detail") else "60 seconds"
        },
        headers={
            "Retry-After": "60",
            "X-RateLimit-Limit": str(exc.detail) if hasattr(exc, "detail") else "unknown",
        }
    )


# Rate limit configurations for different endpoint types
RATE_LIMITS = {
    # Authentication endpoints - strict limits
    "auth_login": "5/minute, 20/hour",  # Prevent brute force
    "auth_register": "10/hour",  # Temporarily increased for testing (was 3/hour)
    "auth_password_reset": "3/hour",
    "auth_verify_email": "10/hour",

    # Core features - moderate limits
    "simulations": "20/minute, 100/hour",  # Tax simulations
    "chat": "15/minute, 60/hour",  # AI chat
    "defi_audit": "5/minute, 20/hour",  # ✅ PHASE 1.5: Réduit pour limiter coûts API blockchain
    "wallet_operations": "100/minute, 500/hour",  # Wallet group management (high refresh rate)

    # Data retrieval - lenient limits
    "read_only": "60/minute, 500/hour",  # GET endpoints
    "countries": "100/minute",

    # Admin endpoints - very strict
    "admin": "10/minute, 50/hour",

    # Webhooks - should not be rate limited by us (Paddle controls)
    "webhook": "1000/hour",
}


def get_rate_limit(limit_type: str) -> str:
    """Get rate limit string for a given type"""
    return RATE_LIMITS.get(limit_type, "100/minute")
