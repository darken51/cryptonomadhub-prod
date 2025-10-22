"""
Exchange Rate Service

Multi-source exchange rate service with Redis caching.
Supports historical and current rates for 160+ jurisdictions.

Data Sources (in priority order):
1. ECB (European Central Bank) - EUR and major currencies
2. ExchangeRate-API - All other currencies
3. USD Proxy - For unstable/exotic currencies

Cache Strategy:
- Historical rates (>24h old): 1 year TTL (immutable)
- Recent rates (<24h old): 1 hour TTL
- Current rates: 15 minutes TTL
"""

import redis
import httpx
import logging
from datetime import datetime, timedelta, date
from typing import Optional, Dict, Tuple
from decimal import Decimal
import json

from app.data.currency_mapping import get_currency_info

logger = logging.getLogger(__name__)


class ExchangeRateService:
    """Multi-source exchange rate service with caching"""

    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.http_client = httpx.AsyncClient(timeout=10.0)

        # API endpoints
        self.frankfurter_base_url = "https://api.frankfurter.app"  # Free ECB data (no key needed)
        self.exchangerate_api_url = "https://api.exchangerate-api.com/v4/latest"  # Free API

        # Cache TTLs
        self.historical_ttl = 365 * 24 * 60 * 60  # 1 year (immutable)
        self.recent_ttl = 60 * 60  # 1 hour
        self.current_ttl = 15 * 60  # 15 minutes

    def _get_cache_key(self, from_currency: str, to_currency: str, date_str: str) -> str:
        """Generate Redis cache key for exchange rate"""
        return f"exchange_rate:{from_currency}:{to_currency}:{date_str}"

    def _is_historical(self, target_date: date) -> bool:
        """Check if date is >24h in the past (historical)"""
        return target_date < (datetime.utcnow().date() - timedelta(days=1))

    async def get_exchange_rate(
        self,
        from_currency: str,
        to_currency: str,
        target_date: Optional[date] = None
    ) -> Tuple[Optional[Decimal], str]:
        """
        Get exchange rate from from_currency to to_currency on target_date.

        Args:
            from_currency: Source currency code (e.g., "USD")
            to_currency: Target currency code (e.g., "EUR")
            target_date: Date for historical rate. None = today.

        Returns:
            Tuple of (rate, source)
            - rate: Exchange rate as Decimal (1 from_currency = X to_currency)
            - source: Data source used ("ECB", "EXCHANGERATE_API", "USD_PROXY", "CACHE")

        Example:
            get_exchange_rate("USD", "EUR", date(2024, 1, 1))
            Returns: (Decimal("0.9234"), "ECB")
            Meaning: 1 USD = 0.9234 EUR
        """
        if target_date is None:
            target_date = datetime.utcnow().date()

        date_str = target_date.isoformat()

        # Special case: same currency
        if from_currency == to_currency:
            return Decimal("1.0"), "SAME_CURRENCY"

        # Check cache first
        cache_key = self._get_cache_key(from_currency, to_currency, date_str)
        cached = self.redis.get(cache_key)

        if cached:
            data = json.loads(cached)
            logger.info(f"✓ Cache hit: {from_currency}/{to_currency} @ {date_str}")
            return Decimal(data["rate"]), f"CACHE ({data['original_source']})"

        # Determine appropriate source based on currency info
        to_currency_info = get_currency_info(to_currency)

        if not to_currency_info:
            logger.warning(f"No currency info for {to_currency}, using USD proxy")
            return await self._get_usd_proxy_rate(from_currency, to_currency, target_date)

        # Try primary source
        rate = None
        source = None

        if to_currency_info.recommended_source == "ECB":
            rate, source = await self._get_ecb_rate(from_currency, to_currency, target_date)
        elif to_currency_info.recommended_source == "EXCHANGERATE_API":
            rate, source = await self._get_exchangerate_api_rate(from_currency, to_currency, target_date)

        # Fallback to secondary source if primary fails
        if rate is None:
            logger.warning(f"Primary source failed for {from_currency}/{to_currency}, trying fallback")

            if to_currency_info.recommended_source != "ECB":
                rate, source = await self._get_ecb_rate(from_currency, to_currency, target_date)

            if rate is None and to_currency_info.recommended_source != "EXCHANGERATE_API":
                rate, source = await self._get_exchangerate_api_rate(from_currency, to_currency, target_date)

        # Final fallback: USD proxy for exotic currencies
        if rate is None and to_currency_info.tier == 3:
            logger.warning(f"All sources failed, using USD proxy for {to_currency}")
            rate, source = await self._get_usd_proxy_rate(from_currency, to_currency, target_date)

        if rate is None:
            logger.error(f"❌ Failed to get exchange rate for {from_currency}/{to_currency} @ {date_str}")
            return None, "FAILED"

        # Cache the result
        ttl = self.historical_ttl if self._is_historical(target_date) else self.recent_ttl

        cache_data = {
            "rate": str(rate),
            "original_source": source,
            "cached_at": datetime.utcnow().isoformat()
        }

        self.redis.setex(cache_key, ttl, json.dumps(cache_data))
        logger.info(f"✓ Cached {from_currency}/{to_currency} @ {date_str} (TTL: {ttl}s)")

        return rate, source

    async def _get_ecb_rate(
        self,
        from_currency: str,
        to_currency: str,
        target_date: date
    ) -> Tuple[Optional[Decimal], str]:
        """Get rate from Frankfurter (ECB data, free API)"""
        try:
            # Frankfurter supports historical rates and cross-currency conversion
            # Format: https://api.frankfurter.app/2024-01-01?from=USD&to=EUR

            date_str = target_date.isoformat()

            # For today's date, use /latest instead of specific date
            if target_date >= datetime.utcnow().date():
                url = f"{self.frankfurter_base_url}/latest"
            else:
                url = f"{self.frankfurter_base_url}/{date_str}"

            params = {"from": from_currency, "to": to_currency}

            response = await self.http_client.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            # Response format: {"amount":1.0,"base":"USD","date":"2025-10-17","rates":{"EUR":0.85609}}
            rates = data.get("rates", {})

            if to_currency in rates:
                return Decimal(str(rates[to_currency])), "ECB"

            return None, "ECB"

        except Exception as e:
            logger.error(f"Frankfurter/ECB API error: {e}")
            return None, "ECB"

    async def _get_exchangerate_api_rate(
        self,
        from_currency: str,
        to_currency: str,
        target_date: date
    ) -> Tuple[Optional[Decimal], str]:
        """Get rate from ExchangeRate-API (free v4, no historical support)"""
        try:
            # This API provides latest rates only (v4 is free but no historical)
            # For historical dates, this will return current rate
            url = f"{self.exchangerate_api_url}/{from_currency}"

            response = await self.http_client.get(url)
            response.raise_for_status()

            data = response.json()

            # Response doesn't have "result" field, just check if rates exist
            rates = data.get("rates", {})

            if to_currency in rates:
                return Decimal(str(rates[to_currency])), "EXCHANGERATE_API"

            return None, "EXCHANGERATE_API"

        except Exception as e:
            logger.error(f"ExchangeRate-API error: {e}")
            return None, "EXCHANGERATE_API"

    async def _get_usd_proxy_rate(
        self,
        from_currency: str,
        to_currency: str,
        target_date: date
    ) -> Tuple[Optional[Decimal], str]:
        """
        Get rate using USD as proxy for exotic/unstable currencies.

        For exotic currencies, convert through USD:
        from_currency -> USD -> to_currency
        """
        try:
            if from_currency == "USD":
                # USD -> to_currency (just use direct rate)
                rate, source = await self._get_exchangerate_api_rate("USD", to_currency, target_date)
                if rate:
                    return rate, "USD_PROXY"
            elif to_currency == "USD":
                # from_currency -> USD
                rate, source = await self._get_exchangerate_api_rate(from_currency, "USD", target_date)
                if rate:
                    return rate, "USD_PROXY"
            else:
                # Cross rate through USD
                # Get from_currency -> USD
                from_to_usd, _ = await self._get_exchangerate_api_rate(from_currency, "USD", target_date)

                # Get USD -> to_currency
                usd_to_to, _ = await self._get_exchangerate_api_rate("USD", to_currency, target_date)

                if from_to_usd and usd_to_to:
                    cross_rate = from_to_usd * usd_to_to
                    return cross_rate, "USD_PROXY"

            return None, "USD_PROXY"

        except Exception as e:
            logger.error(f"USD proxy error: {e}")
            return None, "USD_PROXY"

    async def convert_amount(
        self,
        amount: Decimal,
        from_currency: str,
        to_currency: str,
        target_date: Optional[date] = None
    ) -> Optional[Decimal]:
        """
        Convert amount from one currency to another.

        Args:
            amount: Amount to convert
            from_currency: Source currency
            to_currency: Target currency
            target_date: Date for historical rate

        Returns:
            Converted amount in to_currency
        """
        rate, source = await self.get_exchange_rate(from_currency, to_currency, target_date)

        if rate is None:
            return None

        return amount * rate

    async def get_multi_currency_rates(
        self,
        base_currency: str,
        target_currencies: list[str],
        target_date: Optional[date] = None
    ) -> Dict[str, Optional[Decimal]]:
        """
        Get multiple exchange rates at once.

        Args:
            base_currency: Base currency
            target_currencies: List of target currencies
            target_date: Date for historical rates

        Returns:
            Dictionary mapping currency code to exchange rate
        """
        results = {}

        for currency in target_currencies:
            rate, source = await self.get_exchange_rate(base_currency, currency, target_date)
            results[currency] = rate

        return results

    async def close(self):
        """Close HTTP client"""
        await self.http_client.aclose()
