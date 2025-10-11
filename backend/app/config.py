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
    OLLAMA_MODEL: str = "llama3.1:8b"

    # Paddle
    PADDLE_VENDOR_ID: str
    PADDLE_AUTH_CODE: str
    PADDLE_PUBLIC_KEY: str
    PADDLE_WEBHOOK_SECRET: str

    # Company Info (IBC Seychelles)
    COMPANY_NAME: str = ""
    COMPANY_NUMBER: str = ""
    COMPANY_COUNTRY: str = "SC"

    # App URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Feature Flags
    ENABLE_EU_USERS: bool = False
    ENABLE_US_USERS: bool = True
    ENABLE_BETA_MODE: bool = True

    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
