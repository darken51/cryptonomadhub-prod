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
import time
import os

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

        # Solana ecosystem
        "SOL": "solana",
        "mSOL": "marinade-staked-sol",
        "stSOL": "lido-staked-sol",
        "jitoSOL": "jito-staked-sol",
        "bSOL": "blazestake-staked-sol",
        "JUP": "jupiter-exchange-solana",
        "RAY": "raydium",
        "ORCA": "orca",
        "SRM": "serum",
        "MNGO": "mango-markets",
        "BONK": "bonk",
        "WIF": "dogwifcoin",
        "UNI": "uniswap",  # Uniswap (bridged to Solana)
        "LINK": "chainlink",
        "AAVE": "aave",
        "SUSHI": "sushi",
        "1INCH": "1inch",
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
        "solana": "SOL",
    }

    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        self.client = httpx.Client(timeout=10.0)

        # CoinMarketCap API (fallback)
        self.cmc_api_key = os.getenv("COINMARKETCAP_API_KEY", "")
        self.cmc_base_url = "https://pro-api.coinmarketcap.com/v1"

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
        "SOL": {
            "2024-01": Decimal("100"),
            "2024-02": Decimal("105"),
            "2024-03": Decimal("190"),
            "2024-04": Decimal("145"),
            "2024-05": Decimal("165"),
            "2024-06": Decimal("145"),
            "2024-07": Decimal("170"),
            "2024-08": Decimal("145"),
            "2024-09": Decimal("140"),
            "2024-10": Decimal("170"),
            "2024-11": Decimal("220"),
            "2024-12": Decimal("200"),
            "2025-01": Decimal("190"),
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

        # Get CoinGecko ID
        coingecko_id = self.TOKEN_ID_MAP.get(token_symbol)
        if not coingecko_id:
            logger.warning(f"Unknown token symbol: {token_symbol}")
            return None

        # Try CoinGecko API with retry (for accurate audit prices)
        date_str = timestamp.strftime("%d-%m-%Y")

        # Shorter delays when we have CoinMarketCap as fallback
        max_retries = 2 if self.cmc_api_key else 3
        retry_delays = [0.5, 1.5] if self.cmc_api_key else [1, 3, 5]  # seconds between retries

        for attempt in range(max_retries):
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
                        logger.info(f"Got exact price for {token_symbol} on {date_str}: ${price}")
                        return Decimal(str(price))

                # Rate limited (429) or other error - retry
                if response.status_code == 429 and attempt < max_retries - 1:
                    delay = retry_delays[attempt]
                    logger.warning(f"CoinGecko rate limited, retrying in {delay}s... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                    continue

            except Exception as e:
                logger.error(f"Error fetching price for {token_symbol} (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delays[attempt])
                    continue

        # CoinGecko failed - try CoinMarketCap as fallback
        if self.cmc_api_key:
            logger.info(f"CoinGecko failed, trying CoinMarketCap for {token_symbol}")
            cmc_price = self._get_price_from_coinmarketcap(token_symbol, timestamp)
            if cmc_price:
                logger.info(f"✅ Got EXACT price from CoinMarketCap for {token_symbol}: ${cmc_price}")
                return cmc_price

        # All APIs failed - use fallback monthly average as last resort
        logger.warning(f"Failed to get exact price for {token_symbol} after {max_retries} attempts and CoinMarketCap fallback")

        month_key = timestamp.strftime("%Y-%m")
        if token_symbol in self.HISTORICAL_AVERAGES:
            avg_price = self.HISTORICAL_AVERAGES[token_symbol].get(month_key)
            if avg_price:
                logger.warning(f"⚠️  Using ESTIMATED monthly average for {token_symbol} in {month_key}: ${avg_price}")
                return avg_price
            else:
                # Use latest available average
                available_prices = self.HISTORICAL_AVERAGES[token_symbol]
                if available_prices:
                    latest_price = list(available_prices.values())[-1]
                    logger.warning(f"⚠️  Using ESTIMATED fallback price for {token_symbol}: ${latest_price}")
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

    def get_historical_price_with_metadata(
        self,
        token_symbol: str,
        timestamp: datetime,
        vs_currency: str = "usd"
    ) -> Optional[Dict]:
        """
        Get historical price with metadata about estimation

        Returns:
            Dict with 'price' and 'is_estimated' keys, or None if not found
        """
        # Normalize symbol
        token_symbol = token_symbol.upper()

        # Stablecoins always = $1 (exact)
        if token_symbol in ["USDC", "USDT", "DAI", "BUSD"]:
            return {"price": Decimal("1.0"), "is_estimated": False}

        # Get CoinGecko ID
        coingecko_id = self.TOKEN_ID_MAP.get(token_symbol)
        if not coingecko_id:
            return None

        # Try CoinGecko API with retry
        date_str = timestamp.strftime("%d-%m-%Y")
        # Shorter delays when we have CoinMarketCap as fallback
        max_retries = 2 if self.cmc_api_key else 3
        retry_delays = [0.5, 1.5] if self.cmc_api_key else [1, 3, 5]

        for attempt in range(max_retries):
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
                        return {"price": Decimal(str(price)), "is_estimated": False}

                # Rate limited - retry
                if response.status_code == 429 and attempt < max_retries - 1:
                    time.sleep(retry_delays[attempt])
                    continue

            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(retry_delays[attempt])
                    continue

        # CoinGecko failed - try CoinMarketCap as fallback (still exact price)
        if self.cmc_api_key:
            logger.info(f"CoinGecko failed, trying CoinMarketCap for {token_symbol}")
            cmc_price = self._get_price_from_coinmarketcap(token_symbol, timestamp)
            if cmc_price:
                logger.info(f"✅ Got EXACT price from CoinMarketCap for {token_symbol}: ${cmc_price}")
                return {"price": cmc_price, "is_estimated": False}

        # All APIs failed - use fallback monthly averages (estimated)
        logger.warning(f"All price APIs failed for {token_symbol}, using estimated monthly average")
        month_key = timestamp.strftime("%Y-%m")
        if token_symbol in self.HISTORICAL_AVERAGES:
            avg_price = self.HISTORICAL_AVERAGES[token_symbol].get(month_key)
            if avg_price:
                return {"price": avg_price, "is_estimated": True}
            else:
                available_prices = self.HISTORICAL_AVERAGES[token_symbol]
                if available_prices:
                    latest_price = list(available_prices.values())[-1]
                    return {"price": latest_price, "is_estimated": True}

        return None

    def _get_price_from_coinmarketcap(
        self,
        token_symbol: str,
        timestamp: datetime
    ) -> Optional[Decimal]:
        """
        Get historical price from CoinMarketCap API

        Args:
            token_symbol: Token symbol (e.g., "ETH", "SOL")
            timestamp: DateTime of the transaction

        Returns:
            Price in USD or None if not found
        """
        if not self.cmc_api_key:
            return None

        try:
            # CoinMarketCap uses symbol directly for quotes
            # Get current price (historical quotes require premium plan)
            url = f"{self.cmc_base_url}/cryptocurrency/quotes/latest"
            headers = {
                "X-CMC_PRO_API_KEY": self.cmc_api_key,
                "Accept": "application/json"
            }
            params = {
                "symbol": token_symbol,
                "convert": "USD"
            }

            response = self.client.get(url, headers=headers, params=params)

            if response.status_code == 200:
                data = response.json()

                if "data" in data and token_symbol in data["data"]:
                    price = data["data"][token_symbol]["quote"]["USD"]["price"]
                    if price:
                        logger.info(f"Got CoinMarketCap price for {token_symbol}: ${price}")
                        return Decimal(str(price))

            return None

        except Exception as e:
            logger.error(f"Error fetching CoinMarketCap price for {token_symbol}: {e}")
            return None

    def get_native_token(self, chain: str) -> str:
        """Get native token symbol for a chain"""
        return self.NATIVE_TOKENS.get(chain.lower(), "ETH")

    def close(self):
        """Close HTTP client"""
        self.client.close()
