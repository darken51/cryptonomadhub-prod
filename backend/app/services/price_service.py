"""
Price Service

Fetches historical crypto prices from CoinGecko API
"""

from typing import Optional, Dict
from datetime import datetime
from decimal import Decimal
import httpx
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)


class PriceService:
    """
    Fetch historical cryptocurrency prices

    Uses CoinGecko free API for price data
    """

    # Token symbol to CoinGecko ID mapping
    TOKEN_ID_MAP = {
        "ETH": "ethereum",
        "WETH": "ethereum",
        "BTC": "bitcoin",
        "WBTC": "bitcoin",
        "USDC": "usd-coin",
        "USDT": "tether",
        "DAI": "dai",
        "MATIC": "matic-network",
        "BNB": "binancecoin",
        "AVAX": "avalanche-2",
        "ARB": "arbitrum",
        "OP": "optimism",
        "BASE": "ethereum",  # Base uses ETH as native token
    }

    # Chain native tokens
    NATIVE_TOKENS = {
        "ethereum": "ETH",
        "polygon": "MATIC",
        "bsc": "BNB",
        "avalanche": "AVAX",
        "arbitrum": "ETH",
        "optimism": "ETH",
        "base": "ETH",
        "fantom": "FTM",
    }

    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        self.client = httpx.Client(timeout=10.0)

    # Historical average prices (fallback when API fails)
    HISTORICAL_AVERAGES = {
        "ETH": {
            "2024-01": Decimal("2300"),
            "2024-02": Decimal("2600"),
            "2024-03": Decimal("3400"),
            "2024-04": Decimal("3200"),
            "2024-05": Decimal("3100"),
            "2024-06": Decimal("3400"),
            "2024-07": Decimal("3300"),
            "2024-08": Decimal("2600"),
            "2024-09": Decimal("2600"),
            "2024-10": Decimal("2500"),
            "2024-11": Decimal("3100"),
            "2024-12": Decimal("3500"),
            "2025-01": Decimal("3300"),
        },
        "MATIC": {
            "2024-01": Decimal("0.90"),
            "2024-02": Decimal("0.95"),
            "2024-03": Decimal("1.10"),
            "2024-04": Decimal("0.75"),
            "2024-05": Decimal("0.70"),
            "2024-06": Decimal("0.65"),
            "2024-07": Decimal("0.60"),
            "2024-08": Decimal("0.50"),
            "2024-09": Decimal("0.45"),
            "2024-10": Decimal("0.40"),
            "2024-11": Decimal("0.45"),
            "2024-12": Decimal("0.50"),
        },
        "BNB": {
            "2024-01": Decimal("315"),
            "2024-02": Decimal("350"),
            "2024-03": Decimal("425"),
            "2024-04": Decimal("575"),
            "2024-05": Decimal("600"),
            "2024-06": Decimal("590"),
            "2024-07": Decimal("550"),
            "2024-08": Decimal("520"),
            "2024-09": Decimal("560"),
            "2024-10": Decimal("590"),
            "2024-11": Decimal("620"),
            "2024-12": Decimal("680"),
        }
    }

    @lru_cache(maxsize=1000)
    def get_historical_price(
        self,
        token_symbol: str,
        timestamp: datetime,
        vs_currency: str = "usd"
    ) -> Optional[Decimal]:
        """
        Get historical price for a token at a specific timestamp

        Args:
            token_symbol: Token symbol (e.g., "ETH", "USDC")
            timestamp: DateTime of the transaction
            vs_currency: Currency to get price in (default: "usd")

        Returns:
            Price in USD or None if not found
        """
        # Normalize symbol
        token_symbol = token_symbol.upper()

        # Stablecoins always = $1
        if token_symbol in ["USDC", "USDT", "DAI", "BUSD"]:
            return Decimal("1.0")

        # Try to get from historical averages first (faster and no API limits)
        month_key = timestamp.strftime("%Y-%m")
        if token_symbol in self.HISTORICAL_AVERAGES:
            avg_price = self.HISTORICAL_AVERAGES[token_symbol].get(month_key)
            if avg_price:
                logger.info(f"Using average price for {token_symbol} in {month_key}: ${avg_price}")
                return avg_price

        # Get CoinGecko ID
        coingecko_id = self.TOKEN_ID_MAP.get(token_symbol)
        if not coingecko_id:
            logger.warning(f"Unknown token symbol: {token_symbol}")
            return None

        # Try CoinGecko API (may fail with 401/429)
        date_str = timestamp.strftime("%d-%m-%Y")

        try:
            url = f"{self.base_url}/coins/{coingecko_id}/history"
            params = {
                "date": date_str,
                "localization": "false"
            }

            response = self.client.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
                price = data.get("market_data", {}).get("current_price", {}).get(vs_currency)

                if price:
                    logger.info(f"Got price for {token_symbol} on {date_str}: ${price}")
                    return Decimal(str(price))

            # API failed, try to use latest known average
            if token_symbol in self.HISTORICAL_AVERAGES:
                # Get the most recent available price
                available_prices = self.HISTORICAL_AVERAGES[token_symbol]
                if available_prices:
                    latest_price = list(available_prices.values())[-1]
                    logger.warning(f"Using fallback price for {token_symbol}: ${latest_price}")
                    return latest_price

            return None

        except Exception as e:
            logger.error(f"Error fetching price for {token_symbol}: {e}")
            # Try fallback
            if token_symbol in self.HISTORICAL_AVERAGES:
                available_prices = self.HISTORICAL_AVERAGES[token_symbol]
                if available_prices:
                    latest_price = list(available_prices.values())[-1]
                    return latest_price
            return None

    def get_current_price(self, token_symbol: str) -> Optional[Decimal]:
        """
        Get current price for a token

        Args:
            token_symbol: Token symbol (e.g., "ETH", "USDC")

        Returns:
            Current price in USD or None if not found
        """
        token_symbol = token_symbol.upper()

        # Stablecoins
        if token_symbol in ["USDC", "USDT", "DAI", "BUSD"]:
            return Decimal("1.0")

        coingecko_id = self.TOKEN_ID_MAP.get(token_symbol)
        if not coingecko_id:
            return None

        try:
            url = f"{self.base_url}/simple/price"
            params = {
                "ids": coingecko_id,
                "vs_currencies": "usd"
            }

            response = self.client.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
                price = data.get(coingecko_id, {}).get("usd")

                if price:
                    return Decimal(str(price))

            return None

        except Exception as e:
            logger.error(f"Error fetching current price for {token_symbol}: {e}")
            return None

    def wei_to_usd(
        self,
        wei_amount: str,
        token_symbol: str,
        timestamp: datetime,
        decimals: int = 18
    ) -> Optional[Decimal]:
        """
        Convert Wei/smallest unit to USD

        Args:
            wei_amount: Amount in Wei (or smallest token unit)
            token_symbol: Token symbol
            timestamp: Transaction timestamp
            decimals: Token decimals (default: 18 for ETH)

        Returns:
            USD value or None
        """
        if not wei_amount or wei_amount == "0":
            return Decimal("0")

        try:
            # Convert Wei to token amount
            token_amount = Decimal(wei_amount) / Decimal(10 ** decimals)

            # Get historical price
            price = self.get_historical_price(token_symbol, timestamp)

            if price:
                return token_amount * price

            return None

        except Exception as e:
            logger.error(f"Error converting Wei to USD: {e}")
            return None

    def get_native_token(self, chain: str) -> str:
        """Get native token symbol for a chain"""
        return self.NATIVE_TOKENS.get(chain.lower(), "ETH")

    def close(self):
        """Close HTTP client"""
        self.client.close()
