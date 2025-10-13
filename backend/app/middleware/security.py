"""
Security middleware for production deployment
Handles HTTPS enforcement and security headers
"""

from fastapi import Request, Response
from fastapi.responses import RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from app.config import settings


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """
    Middleware to enforce HTTPS in production
    Redirects HTTP requests to HTTPS
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # Only enforce HTTPS in production
        if settings.ENVIRONMENT == "production":
            # Check if request is HTTP
            if request.url.scheme == "http":
                # Get HTTPS URL
                https_url = request.url.replace(scheme="https")

                # Redirect to HTTPS
                return RedirectResponse(
                    url=str(https_url),
                    status_code=301  # Permanent redirect
                )

        # Continue with request
        response = await call_next(request)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses

    Headers added:
    - X-Content-Type-Options: Prevent MIME sniffing
    - X-Frame-Options: Prevent clickjacking
    - X-XSS-Protection: Enable XSS protection
    - Strict-Transport-Security: Enforce HTTPS
    - Content-Security-Policy: Control resource loading
    - Referrer-Policy: Control referer information
    - Permissions-Policy: Control browser features
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking attacks
        response.headers["X-Frame-Options"] = "DENY"

        # Enable browser XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Enforce HTTPS for 1 year (only in production)
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        # Content Security Policy - Allow only same origin + frontend
        # This prevents XSS attacks by controlling which resources can be loaded
        frontend_domain = settings.FRONTEND_URL.replace("http://", "").replace("https://", "").split(":")[0]

        csp_directives = [
            "default-src 'self'",
            f"connect-src 'self' {settings.FRONTEND_URL}",
            "font-src 'self' data:",
            "img-src 'self' data: https:",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",  # unsafe-inline needed for some styling
            "frame-ancestors 'none'",  # Prevent embedding in iframes
        ]

        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)

        # Control referer information leakage
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Control browser features (disable geolocation, camera, microphone, etc.)
        permissions_policy = [
            "geolocation=()",
            "microphone=()",
            "camera=()",
            "payment=()",
            "usb=()",
            "magnetometer=()",
            "gyroscope=()",
            "accelerometer=()"
        ]
        response.headers["Permissions-Policy"] = ", ".join(permissions_policy)

        # Remove server header to hide FastAPI/Uvicorn version
        if "Server" in response.headers:
            del response.headers["Server"]

        return response


def setup_security_middleware(app):
    """
    Setup all security middleware for the application

    Call this function in main.py after creating the FastAPI app
    """
    # Add security headers to all responses
    app.add_middleware(SecurityHeadersMiddleware)

    # Enforce HTTPS in production
    if settings.ENVIRONMENT == "production":
        app.add_middleware(HTTPSRedirectMiddleware)
