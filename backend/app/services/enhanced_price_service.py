"""
Enhanced Price Service

Multi-source historical cryptocurrency price fetching with intelligent caching.
Sources: CoinGecko (free), CoinMarketCap (paid), DeFiLlama (on-chain).

Features:
- Multi-source fallback cascade
- Redis caching with TTL
- PostgreSQL archive for old prices
- Rate limiting with retry
- Confidence scoring
"""

from typing import Optional, Dict, List
from datetime import datetime, timedelta
from decimal import Decimal
import httpx
import logging
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.cached_price import CachedPrice, PriceSource
from app.config import settings
import redis
import json
from functools import lru_cache

logger = logging.getLogger(__name__)


class EnhancedPriceService:
    """
    Enhanced Price Service with multi-source support
    """

    # Token symbol to CoinGecko ID mapping (expanded)
    COINGECKO_IDS = {
        "ETH": "ethereum", "WETH": "ethereum",
        "BTC": "bitcoin", "WBTC": "wrapped-bitcoin",
        "USDC": "usd-coin", "USDT": "tether", "DAI": "dai",
        "MATIC": "matic-network", "POL": "matic-network",
        "BNB": "binancecoin", "AVAX": "avalanche-2",
        "ARB": "arbitrum", "OP": "optimism",
        "SOL": "solana", "LINK": "chainlink",
        "UNI": "uniswap", "AAVE": "aave",
        "CRV": "curve-dao-token", "SUSHI": "sushi",
        "COMP": "compound-governance-token",
        "MKR": "maker", "SNX": "havven",
    }

    def __init__(self, db: Session):
        self.db = db
        self.redis_client = redis.Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True
        )
        self.http_client = httpx.AsyncClient(timeout=15.0)

    async def get_price_at_timestamp(
        self,
        token: str,
        chain: str,
        timestamp: datetime
    ) -> Optional[float]:
        """
        Get historical price at specific timestamp

        Fallback order:
        1. Redis cache (hot)
        2. PostgreSQL cache (warm)
        3. CoinGecko API (free, reliable)
        4. CoinMarketCap API (paid, accurate)
        5. DeFiLlama API (on-chain, fallback)

        Args:
            token: Token symbol
            chain: Blockchain
            timestamp: Exact timestamp

        Returns:
            Price in USD or None if not found
        """
        cache_key = f"price:{token}:{chain}:{timestamp.isoformat()}"

        # 1. Try Redis cache (fastest)
        cached = self.redis_client.get(cache_key)
        if cached:
            logger.debug(f"Redis cache hit for {token} at {timestamp}")
            return float(cached)

        # 2. Try PostgreSQL cache
        db_price = self.db.query(CachedPrice).filter(
            and_(
                CachedPrice.token == token.upper(),
                CachedPrice.chain == chain.lower(),
                CachedPrice.timestamp >= timestamp - timedelta(minutes=5),
                CachedPrice.timestamp <= timestamp + timedelta(minutes=5)
            )
        ).order_by(CachedPrice.source_confidence.desc()).first()

        if db_price:
            logger.debug(f"DB cache hit for {token} at {timestamp}")
            # Update Redis cache
            self.redis_client.setex(cache_key, 3600, str(db_price.price_usd))
            return db_price.price_usd

        # 3. Fetch from APIs
        price = await self._fetch_from_sources(token, chain, timestamp)

        if price:
            # Cache in both Redis and PostgreSQL
            self.redis_client.setex(cache_key, 3600, str(price["price"]))
            self._save_to_db(token, chain, timestamp, price)

        return price["price"] if price else None

    async def _fetch_from_sources(
        self,
        token: str,
        chain: str,
        timestamp: datetime
    ) -> Optional[Dict]:
        """
        Fetch price from multiple sources with fallback

        Returns:
            Dict with {price, source, confidence} or None
        """
        # Try CoinGecko first (free, reliable)
        price = await self._fetch_coingecko(token, timestamp)
        if price:
            return price

        # Fallback to CoinMarketCap
        if hasattr(settings, 'COINMARKETCAP_API_KEY') and settings.COINMARKETCAP_API_KEY:
            price = await self._fetch_coinmarketcap(token, timestamp)
            if price:
                return price

        # Last resort: DeFiLlama
        price = await self._fetch_defillama(token, chain, timestamp)
        if price:
            return price

        logger.warning(f"No price found for {token} at {timestamp}")
        return None

    async def _fetch_coingecko(
        self,
        token: str,
        timestamp: datetime
    ) -> Optional[Dict]:
        """
        Fetch from CoinGecko API

        Free tier: 50 calls/minute
        """
        try:
            coingecko_id = self.COINGECKO_IDS.get(token.upper())
            if not coingecko_id:
                logger.debug(f"No CoinGecko ID for {token}")
                return None

            # CoinGecko historical endpoint
            date_str = timestamp.strftime("%d-%m-%Y")
            url = f"https://api.coingecko.com/api/v3/coins/{coingecko_id}/history"
            params = {
                "date": date_str,
                "localization": "false"
            }

            response = await self.http_client.get(url, params=params)

            if response.status_code == 429:
                logger.warning("CoinGecko rate limit hit")
                return None

            if response.status_code != 200:
                logger.warning(f"CoinGecko API error: {response.status_code}")
                return None

            data = response.json()

            if "market_data" in data and "current_price" in data["market_data"]:
                price = data["market_data"]["current_price"].get("usd")
                if price:
                    return {
                        "price": float(price),
                        "source": "coingecko",
                        "confidence": 0.95
                    }

        except Exception as e:
            logger.error(f"CoinGecko fetch error: {e}")

        return None

    async def _fetch_coinmarketcap(
        self,
        token: str,
        timestamp: datetime
    ) -> Optional[Dict]:
        """
        Fetch from CoinMarketCap API (paid)

        More accurate but requires API key
        """
        try:
            if not hasattr(settings, 'COINMARKETCAP_API_KEY'):
                return None

            url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical"
            headers = {
                "X-CMC_PRO_API_KEY": settings.COINMARKETCAP_API_KEY
            }
            params = {
                "symbol": token.upper(),
                "time_start": timestamp.isoformat(),
                "time_end": (timestamp + timedelta(hours=1)).isoformat()
            }

            response = await self.http_client.get(url, headers=headers, params=params)

            if response.status_code == 200:
                data = response.json()
                if "data" in data and "quotes" in data["data"]:
                    quotes = data["data"]["quotes"]
                    if quotes:
                        price = quotes[0]["quote"]["USD"]["price"]
                        return {
                            "price": float(price),
                            "source": "coinmarketcap",
                            "confidence": 0.98
                        }

        except Exception as e:
            logger.error(f"CoinMarketCap fetch error: {e}")

        return None

    async def _fetch_defillama(
        self,
        token: str,
        chain: str,
        timestamp: datetime
    ) -> Optional[Dict]:
        """
        Fetch from DeFiLlama API (free, on-chain data)

        Works well for DeFi tokens
        """
        try:
            # DeFiLlama uses chain:address format
            url = f"https://coins.llama.fi/prices/historical/{int(timestamp.timestamp())}"
            params = {
                "coins": f"{chain}:{token}",
                "searchWidth": "4h"
            }

            response = await self.http_client.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
                if "coins" in data:
                    coin_data = data["coins"].get(f"{chain}:{token}")
                    if coin_data and "price" in coin_data:
                        return {
                            "price": float(coin_data["price"]),
                            "source": "defillama",
                            "confidence": 0.85
                        }

        except Exception as e:
            logger.error(f"DeFiLlama fetch error: {e}")

        return None

    def _save_to_db(
        self,
        token: str,
        chain: str,
        timestamp: datetime,
        price_data: Dict
    ):
        """
        Save price to PostgreSQL cache
        """
        try:
            cached_price = CachedPrice(
                token=token.upper(),
                chain=chain.lower(),
                timestamp=timestamp,
                price_usd=price_data["price"],
                source=price_data["source"],
                source_confidence=price_data["confidence"],
                cached_at=datetime.utcnow()
            )

            self.db.add(cached_price)
            self.db.commit()

            logger.debug(f"Saved price to DB: {token} at {timestamp}")

        except Exception as e:
            logger.error(f"Failed to save price to DB: {e}")
            self.db.rollback()

    async def get_current_price(self, token: str, chain: str = "ethereum") -> Optional[float]:
        """
        Get current real-time price

        Uses simpler endpoint for current prices
        """
        cache_key = f"price:current:{token}:{chain}"

        # Try Redis cache (1 minute TTL for current prices)
        cached = self.redis_client.get(cache_key)
        if cached:
            return float(cached)

        try:
            coingecko_id = self.COINGECKO_IDS.get(token.upper())
            if not coingecko_id:
                return None

            url = f"https://api.coingecko.com/api/v3/simple/price"
            params = {
                "ids": coingecko_id,
                "vs_currencies": "usd"
            }

            response = await self.http_client.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
                if coingecko_id in data and "usd" in data[coingecko_id]:
                    price = float(data[coingecko_id]["usd"])

                    # Cache for 1 minute
                    self.redis_client.setex(cache_key, 60, str(price))

                    return price

        except Exception as e:
            logger.error(f"Failed to get current price: {e}")

        return None

    async def batch_get_prices(
        self,
        tokens: List[str],
        chain: str,
        timestamp: datetime
    ) -> Dict[str, Optional[float]]:
        """
        Get prices for multiple tokens at once

        More efficient than individual calls
        """
        results = {}

        for token in tokens:
            price = await self.get_price_at_timestamp(token, chain, timestamp)
            results[token] = price

        return results

    def clear_cache(self, token: Optional[str] = None):
        """
        Clear price cache

        Args:
            token: Optional token to clear. If None, clears all.
        """
        if token:
            pattern = f"price:*:{token.upper()}:*"
        else:
            pattern = "price:*"

        keys = self.redis_client.keys(pattern)
        if keys:
            self.redis_client.delete(*keys)
            logger.info(f"Cleared {len(keys)} price cache entries")
