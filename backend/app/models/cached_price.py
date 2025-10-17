"""
Cached Historical Prices Model

Stores historical cryptocurrency prices to avoid repeated API calls.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Index, UniqueConstraint
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base


class CachedPrice(Base):
    """
    Cached Historical Price

    Stores historical prices from various sources (CoinGecko, CoinMarketCap, etc.)
    to minimize API calls and improve performance.
    """
    __tablename__ = "cached_prices"

    id = Column(Integer, primary_key=True, index=True)

    # Asset identification
    token = Column(String(50), nullable=False, index=True)  # Ticker symbol
    token_address = Column(String(255), nullable=True)  # Contract address if applicable
    chain = Column(String(50), nullable=False, index=True)  # Blockchain

    # Price data
    timestamp = Column(DateTime, nullable=False, index=True)  # Price timestamp
    price_usd = Column(Float, nullable=False)  # Price in USD

    # Data source
    source = Column(String(50), nullable=False)  # coingecko, coinmarketcap, defillama, etc.
    source_confidence = Column(Float, default=1.0)  # 0.0 - 1.0 confidence score

    # Volume (optional, for validation)
    volume_24h_usd = Column(Float, nullable=True)
    market_cap_usd = Column(Float, nullable=True)

    # Caching metadata
    cached_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration
    cache_hits = Column(Integer, default=0)  # How many times used

    # Unique constraint: one price per token/chain/timestamp/source
    __table_args__ = (
        UniqueConstraint('token', 'chain', 'timestamp', 'source', name='_token_chain_time_source_uc'),
        Index('idx_price_lookup', 'token', 'chain', 'timestamp'),  # Fast lookup index
        Index('idx_price_recent', 'cached_at'),  # For cleanup queries
    )


class PriceSource(Base):
    """
    Price Data Source Configuration

    Tracks API providers and their status/rate limits.
    """
    __tablename__ = "price_sources"

    id = Column(Integer, primary_key=True, index=True)

    # Source info
    name = Column(String(50), unique=True, nullable=False)  # coingecko, cmc, etc.
    api_url = Column(String(255), nullable=False)
    requires_api_key = Column(Integer, default=0)  # 0=no, 1=optional, 2=required

    # Status
    is_active = Column(Integer, default=1)
    last_success = Column(DateTime, nullable=True)
    last_failure = Column(DateTime, nullable=True)
    failure_count = Column(Integer, default=0)

    # Rate limiting
    calls_per_minute = Column(Integer, default=50)
    calls_per_day = Column(Integer, nullable=True)
    current_minute_calls = Column(Integer, default=0)
    current_day_calls = Column(Integer, default=0)
    last_call_reset = Column(DateTime, default=datetime.utcnow)

    # Priority (lower = higher priority)
    priority = Column(Integer, default=10)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
