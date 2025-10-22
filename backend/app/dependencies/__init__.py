"""Dependencies package for NomadCrypto Hub"""

from .license_check import (
    require_license,
    require_simulation,
    require_defi_audit,
    require_pdf_export,
    require_chat_message
)
from .exchange_rate import (
    get_redis_client,
    get_exchange_rate_service
)

__all__ = [
    "require_license",
    "require_simulation",
    "require_defi_audit",
    "require_pdf_export",
    "require_chat_message",
    "get_redis_client",
    "get_exchange_rate_service"
]
