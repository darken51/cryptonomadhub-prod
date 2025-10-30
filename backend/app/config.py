from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60  # ✅ PHASE 1.3: Réduit de 24h à 1h
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # Refresh tokens valides 7 jours

    # Redis
    REDIS_URL: str

    # AI Assistant - Anthropic Claude (for country analysis)
    ANTHROPIC_API_KEY: str
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"  # Sonnet for deep analysis

    # AI Assistant - Google Gemini (for chat assistant)
    GOOGLE_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"  # Flash-Lite = 13x faster, 91% cheaper than Haiku

    # OAuth - Google Sign In
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Ollama (deprecated - migrated to Claude)
    # OLLAMA_HOST: str
    # OLLAMA_MODEL: str = "meta-llama-3.1-8b-instruct:latest"

    # Paddle
    PADDLE_VENDOR_ID: str = "12345"
    PADDLE_AUTH_CODE: str = "test"
    PADDLE_PUBLIC_KEY: str = "test_public_key"
    PADDLE_WEBHOOK_SECRET: str = "test_secret"

    # NOWPayments (Crypto payments)
    NOWPAYMENTS_API_KEY: str = ""
    NOWPAYMENTS_IPN_SECRET: str = ""
    NOWPAYMENTS_SANDBOX: bool = False  # Set to True for testing

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

    # Email (SMTP) - Legacy
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@cryptonomadhub.com"
    SMTP_FROM_NAME: str = "NomadCrypto Hub"

    # Email (Resend API) - Modern
    RESEND_API_KEY: str = ""

    # Blockchain API Keys
    # SECURITY: These MUST be set in .env file, NOT hardcoded here
    # Single Etherscan API key works for 50+ EVM chains via v2 API
    ETHERSCAN_API_KEY: str = ""

    # Multi-chain providers (support 50+ chains)
    MORALIS_API_KEY: str = ""  # Moralis (EVM + Solana, best for multi-chain)
    ALCHEMY_API_KEY: str = ""  # Alchemy (EVM only, best rate limits)
    INFURA_API_KEY: str = ""  # Infura (EVM backup)
    QUICKNODE_API_KEY: str = ""  # QuickNode (multi-chain)

    # Solana API Keys
    SOLANA_API_KEY: str = ""  # Solscan (fallback)
    HELIUS_API_KEY: str = ""  # Helius (primary, better for transactions)

    # Bitcoin API Keys
    BLOCKCYPHER_API_KEY: str = ""  # BlockCypher (Bitcoin, Litecoin, Dogecoin)
    BLOCKCHAIN_INFO_API_KEY: str = ""  # Blockchain.info (Bitcoin)

    # Price API Keys
    COINMARKETCAP_API_KEY: str = ""  # CoinMarketCap (fallback for prices)
    COINGECKO_API_KEY: str = ""  # CoinGecko Pro (optional, free tier works)

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
