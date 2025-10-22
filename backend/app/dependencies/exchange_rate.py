"""
Exchange Rate Service Dependencies

Provides dependency injection for ExchangeRateService.
"""
import os
import redis
from functools import lru_cache
from app.services.exchange_rate import ExchangeRateService


@lru_cache()
def get_redis_client() -> redis.Redis:
    """Get Redis client singleton"""
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    return redis.Redis.from_url(redis_url, decode_responses=True)


def get_exchange_rate_service() -> ExchangeRateService:
    """Get ExchangeRateService instance with Redis caching"""
    redis_client = get_redis_client()
    return ExchangeRateService(redis_client)
