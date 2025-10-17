from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    # Redis
    REDIS_URL: str

    # Ollama
    OLLAMA_HOST: str
    OLLAMA_MODEL: str = "meta-llama-3.1-8b-instruct:latest"

    # Paddle
    PADDLE_VENDOR_ID: str = "12345"
    PADDLE_AUTH_CODE: str = "test"
    PADDLE_PUBLIC_KEY: str = "test_public_key"
    PADDLE_WEBHOOK_SECRET: str = "test_secret"

    # Company Info (IBC Seychelles)
    COMPANY_NAME: str = ""
    COMPANY_NUMBER: str = ""
    COMPANY_COUNTRY: str = "SC"

    # App URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # CORS - Comma-separated list of allowed origins
    # Example: "https://app.domain.com,https://www.domain.com"
    # Leave empty to use FRONTEND_URL only
    CORS_ORIGINS: str = ""

    # Feature Flags
    ENABLE_EU_USERS: bool = False
    ENABLE_US_USERS: bool = True
    ENABLE_BETA_MODE: bool = True

    # Environment
    ENVIRONMENT: str = "development"

    # Monitoring
    SENTRY_DSN: str = ""

    # Email (SMTP)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@cryptonomadhub.com"
    SMTP_FROM_NAME: str = "NomadCrypto Hub"

    # Blockchain API Keys
    # SECURITY: These MUST be set in .env file, NOT hardcoded here
    # Single Etherscan API key works for 50+ EVM chains via v2 API
    ETHERSCAN_API_KEY: str = ""

    # Solana API Keys
    SOLANA_API_KEY: str = ""  # Solscan (fallback)
    HELIUS_API_KEY: str = ""  # Helius (primary, better for transactions)

    # Price API Keys
    COINMARKETCAP_API_KEY: str = ""  # CoinMarketCap (fallback for prices)

    class Config:
        env_file = ".env"

    def get_cors_origins(self) -> list[str]:
        """Get list of allowed CORS origins"""
        if self.CORS_ORIGINS:
            # Use custom origins if specified
            origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        else:
            # Default to FRONTEND_URL
            origins = [self.FRONTEND_URL]

        # In development, also allow common localhost ports
        if self.ENVIRONMENT == "development":
            dev_origins = [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001"
            ]
            # Add dev origins that aren't already in the list
            for origin in dev_origins:
                if origin not in origins:
                    origins.append(origin)

        return origins


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
