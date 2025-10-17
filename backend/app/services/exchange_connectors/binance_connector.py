"""
Binance Exchange Connector

Fetches transaction history from Binance via API.
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import hmac
import hashlib
import time
import aiohttp
import logging
from .base_connector import BaseExchangeConnector

logger = logging.getLogger(__name__)


class BinanceConnector(BaseExchangeConnector):
    """
    Binance Exchange Connector

    Supports Binance Spot trading history.
    """

    BASE_URL = "https://api.binance.com"

    def __init__(self, api_key: str, api_secret: str, **kwargs):
        super().__init__(api_key, api_secret)
        self.base_url = kwargs.get("base_url", self.BASE_URL)

    def _generate_signature(self, query_string: str) -> str:
        """Generate HMAC SHA256 signature"""
        return hmac.new(
            self.api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    async def _request(self, method: str, endpoint: str, params: Optional[Dict] = None, signed: bool = False) -> Dict:
        """Make authenticated API request"""
        url = f"{self.base_url}{endpoint}"
        headers = {"X-MBX-APIKEY": self.api_key}

        if params is None:
            params = {}

        if signed:
            params["timestamp"] = int(time.time() * 1000)
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            params["signature"] = self._generate_signature(query_string)

        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, params=params, headers=headers) as response:
                if response.status != 200:
                    text = await response.text()
                    logger.error(f"Binance API error: {response.status} - {text}")
                    raise Exception(f"Binance API error: {response.status}")

                return await response.json()

    def validate_credentials(self) -> bool:
        """Validate API credentials"""
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            result = loop.run_until_complete(self._request("GET", "/api/v3/account", signed=True))
            return "balances" in result
        except:
            return False

    async def fetch_balances(self) -> Dict[str, float]:
        """Fetch current balances"""
        try:
            account = await self._request("GET", "/api/v3/account", signed=True)
            balances = {}

            for balance in account.get("balances", []):
                asset = balance["asset"]
                free = float(balance["free"])
                locked = float(balance["locked"])
                total = free + locked

                if total > 0:
                    balances[asset] = total

            return balances

        except Exception as e:
            logger.error(f"Failed to fetch Binance balances: {e}")
            return {}

    async def fetch_transactions(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[Dict]:
        """
        Fetch trade history from Binance

        Binance API limitations:
        - Max 500 trades per request
        - Max 3 months of history per request
        """
        if start_date is None:
            start_date = datetime.utcnow() - timedelta(days=90)
        if end_date is None:
            end_date = datetime.utcnow()

        all_transactions = []

        try:
            # Get all trading pairs
            symbols = await self._get_trading_symbols()

            for symbol in symbols[:50]:  # Limit to 50 most popular pairs
                try:
                    trades = await self._fetch_trades_for_symbol(symbol, start_date, end_date)
                    all_transactions.extend(trades)

                    # Rate limiting
                    await asyncio.sleep(0.1)

                except Exception as e:
                    logger.warning(f"Failed to fetch trades for {symbol}: {e}")
                    continue

            # Fetch deposits
            deposits = await self._fetch_deposits(start_date, end_date)
            all_transactions.extend(deposits)

            # Fetch withdrawals
            withdrawals = await self._fetch_withdrawals(start_date, end_date)
            all_transactions.extend(withdrawals)

            # Sort by timestamp
            all_transactions.sort(key=lambda x: x["timestamp"])

            return all_transactions[:limit]

        except Exception as e:
            logger.error(f"Failed to fetch Binance transactions: {e}")
            return []

    async def _get_trading_symbols(self) -> List[str]:
        """Get list of trading symbols"""
        try:
            exchange_info = await self._request("GET", "/api/v3/exchangeInfo")
            symbols = [s["symbol"] for s in exchange_info.get("symbols", []) if s["status"] == "TRADING"]
            return symbols
        except:
            # Fallback to common pairs
            return [
                "BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "DOGEUSDT",
                "XRPUSDT", "DOTUSDT", "UNIUSDT", "LTCUSDT", "LINKUSDT"
            ]

    async def _fetch_trades_for_symbol(
        self,
        symbol: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict]:
        """Fetch trades for specific symbol"""
        params = {
            "symbol": symbol,
            "startTime": int(start_date.timestamp() * 1000),
            "endTime": int(end_date.timestamp() * 1000),
            "limit": 1000
        }

        try:
            trades = await self._request("GET", "/api/v3/myTrades", params=params, signed=True)
            normalized = []

            for trade in trades:
                normalized.append({
                    "exchange": "binance",
                    "transaction_id": f"binance_{trade['id']}",
                    "timestamp": datetime.fromtimestamp(trade["time"] / 1000),
                    "type": "trade",
                    "token_in": trade["quoteAsset"] if trade["isBuyer"] else trade["baseAsset"],
                    "amount_in": float(trade["qty"]) if not trade["isBuyer"] else float(trade["quoteQty"]),
                    "token_out": trade["baseAsset"] if trade["isBuyer"] else trade["quoteAsset"],
                    "amount_out": float(trade["qty"]) if trade["isBuyer"] else float(trade["quoteQty"]),
                    "fee_token": trade["commissionAsset"],
                    "fee_amount": float(trade["commission"]),
                    "price_usd": float(trade["price"]),
                    "raw_data": trade
                })

            return normalized

        except Exception as e:
            logger.warning(f"Failed to fetch trades for {symbol}: {e}")
            return []

    async def _fetch_deposits(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Fetch deposit history"""
        params = {
            "startTime": int(start_date.timestamp() * 1000),
            "endTime": int(end_date.timestamp() * 1000)
        }

        try:
            response = await self._request("GET", "/sapi/v1/capital/deposit/hisrec", params=params, signed=True)
            deposits = []

            for deposit in response:
                if deposit["status"] == 1:  # Success
                    deposits.append({
                        "exchange": "binance",
                        "transaction_id": f"binance_deposit_{deposit['txId']}",
                        "timestamp": datetime.fromtimestamp(deposit["insertTime"] / 1000),
                        "type": "deposit",
                        "token_in": deposit["coin"],
                        "amount_in": float(deposit["amount"]),
                        "token_out": None,
                        "amount_out": 0,
                        "fee_token": None,
                        "fee_amount": 0,
                        "price_usd": 0,
                        "raw_data": deposit
                    })

            return deposits

        except Exception as e:
            logger.error(f"Failed to fetch deposits: {e}")
            return []

    async def _fetch_withdrawals(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Fetch withdrawal history"""
        params = {
            "startTime": int(start_date.timestamp() * 1000),
            "endTime": int(end_date.timestamp() * 1000)
        }

        try:
            response = await self._request("GET", "/sapi/v1/capital/withdraw/history", params=params, signed=True)
            withdrawals = []

            for withdrawal in response:
                if withdrawal["status"] == 6:  # Completed
                    withdrawals.append({
                        "exchange": "binance",
                        "transaction_id": f"binance_withdrawal_{withdrawal['id']}",
                        "timestamp": datetime.fromtimestamp(withdrawal["applyTime"] / 1000),
                        "type": "withdrawal",
                        "token_in": None,
                        "amount_in": 0,
                        "token_out": withdrawal["coin"],
                        "amount_out": float(withdrawal["amount"]),
                        "fee_token": withdrawal["coin"],
                        "fee_amount": float(withdrawal.get("transactionFee", 0)),
                        "price_usd": 0,
                        "raw_data": withdrawal
                    })

            return withdrawals

        except Exception as e:
            logger.error(f"Failed to fetch withdrawals: {e}")
            return []
