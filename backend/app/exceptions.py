"""
✅ PHASE 2.7: Custom exception classes for standardized error handling

Provides consistent error responses across the application.
"""

from typing import Any, Optional, Dict
from fastapi import HTTPException, status


class BaseAPIException(HTTPException):
    """
    Base exception for all API errors.

    Provides consistent error structure with:
    - status_code: HTTP status code
    - error_code: Application-specific error code
    - message: Human-readable error message
    - details: Additional error context
    """

    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        self.error_code = error_code
        self.message = message
        self.details = details or {}

        super().__init__(
            status_code=status_code,
            detail={
                "error_code": error_code,
                "message": message,
                "details": details or {}
            }
        )


# Authentication Errors
class AuthenticationError(BaseAPIException):
    """Raised when authentication fails"""

    def __init__(self, message: str = "Authentication failed", details: Optional[Dict] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="AUTH_FAILED",
            message=message,
            details=details
        )


class InvalidCredentialsError(AuthenticationError):
    """Raised when credentials are invalid"""

    def __init__(self, message: str = "Invalid email or password"):
        super().__init__(
            message=message,
            details={"error_code": "INVALID_CREDENTIALS"}
        )


class TokenExpiredError(AuthenticationError):
    """Raised when token has expired"""

    def __init__(self, message: str = "Token has expired"):
        super().__init__(
            message=message,
            details={"error_code": "TOKEN_EXPIRED"}
        )


class EmailNotVerifiedError(BaseAPIException):
    """Raised when email is not verified"""

    def __init__(self, message: str = "Email not verified"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="EMAIL_NOT_VERIFIED",
            message=message,
            details={}
        )


# Authorization Errors
class AuthorizationError(BaseAPIException):
    """Raised when user lacks permission"""

    def __init__(self, message: str = "Insufficient permissions", details: Optional[Dict] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN",
            message=message,
            details=details or {}
        )


class AdminOnlyError(AuthorizationError):
    """Raised when endpoint requires admin role"""

    def __init__(self):
        super().__init__(
            message="This endpoint requires admin privileges",
            details={"required_role": "admin"}
        )


# Resource Errors
class ResourceNotFoundError(BaseAPIException):
    """Raised when requested resource doesn't exist"""

    def __init__(self, resource_type: str, resource_id: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="RESOURCE_NOT_FOUND",
            message=f"{resource_type} not found",
            details={"resource_type": resource_type, "resource_id": str(resource_id)}
        )


class ResourceAlreadyExistsError(BaseAPIException):
    """Raised when resource already exists"""

    def __init__(self, resource_type: str, identifier: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            error_code="RESOURCE_EXISTS",
            message=f"{resource_type} already exists",
            details={"resource_type": resource_type, "identifier": identifier}
        )


# Validation Errors
class ValidationError(BaseAPIException):
    """Raised when input validation fails"""

    def __init__(self, message: str, field: Optional[str] = None, details: Optional[Dict] = None):
        details_dict = details or {}
        if field:
            details_dict["field"] = field

        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            message=message,
            details=details_dict
        )


class InvalidCountryCodeError(ValidationError):
    """Raised when country code is invalid"""

    def __init__(self, country_code: str):
        super().__init__(
            message=f"Invalid country code: {country_code}",
            field="country_code",
            details={"provided_code": country_code}
        )


# Business Logic Errors
class BusinessLogicError(BaseAPIException):
    """Raised when business rules are violated"""

    def __init__(self, message: str, error_code: str = "BUSINESS_LOGIC_ERROR", details: Optional[Dict] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=error_code,
            message=message,
            details=details or {}
        )


class CryptoBannedError(BusinessLogicError):
    """Raised when crypto is banned in target country"""

    def __init__(self, country_code: str, country_name: str):
        super().__init__(
            message=f"Cryptocurrency is banned in {country_name} ({country_code})",
            error_code="CRYPTO_BANNED",
            details={"country_code": country_code, "country_name": country_name}
        )


class RateLimitExceededError(BaseAPIException):
    """Raised when rate limit is exceeded"""

    def __init__(self, retry_after: Optional[int] = None):
        details = {}
        if retry_after:
            details["retry_after"] = retry_after

        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="RATE_LIMIT_EXCEEDED",
            message="Rate limit exceeded. Please try again later.",
            details=details
        )


# External Service Errors
class ExternalServiceError(BaseAPIException):
    """Raised when external service fails"""

    def __init__(self, service_name: str, message: str = "External service error"):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_code="EXTERNAL_SERVICE_ERROR",
            message=message,
            details={"service": service_name}
        )


class PriceServiceError(ExternalServiceError):
    """Raised when price service fails"""

    def __init__(self, message: str = "Failed to fetch cryptocurrency prices"):
        super().__init__(service_name="price_service", message=message)


class BlockchainServiceError(ExternalServiceError):
    """Raised when blockchain service fails"""

    def __init__(self, chain: str, message: str = "Blockchain service error"):
        super().__init__(
            service_name=f"blockchain_{chain}",
            message=message
        )


# Database Errors
class DatabaseError(BaseAPIException):
    """Raised when database operation fails"""

    def __init__(self, message: str = "Database operation failed"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="DATABASE_ERROR",
            message=message,
            details={}
        )


# License / Subscription Errors
class LicenseError(BaseAPIException):
    """Raised when license validation fails"""

    def __init__(self, message: str, error_code: str = "LICENSE_ERROR"):
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            error_code=error_code,
            message=message,
            details={}
        )


class SubscriptionExpiredError(LicenseError):
    """Raised when subscription has expired"""

    def __init__(self):
        super().__init__(
            message="Your subscription has expired. Please renew to continue using this feature.",
            error_code="SUBSCRIPTION_EXPIRED"
        )


class FeatureNotAvailableError(LicenseError):
    """Raised when feature requires higher tier"""

    def __init__(self, feature_name: str, required_tier: str):
        super().__init__(
            message=f"This feature requires {required_tier} subscription",
            error_code="FEATURE_NOT_AVAILABLE"
        )
