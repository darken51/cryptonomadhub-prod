"""
Kraken Exchange Connector

Fetches transaction history from Kraken via API.
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import hmac
import hashlib
import base64
import urllib.parse
import time
import aiohttp
import logging
from .base_connector import BaseExchangeConnector

logger = logging.getLogger(__name__)


class KrakenConnector(BaseExchangeConnector):
    """
    Kraken Exchange Connector

    Supports Kraken Spot trading.
    """

    BASE_URL = "https://api.kraken.com"

    def __init__(self, api_key: str, api_secret: str, **kwargs):
        super().__init__(api_key, api_secret)
        self.base_url = kwargs.get("base_url", self.BASE_URL)

    def _generate_signature(self, urlpath: str, data: Dict, nonce: str) -> str:
        """Generate API-Sign header"""
        postdata = urllib.parse.urlencode(data)
        encoded = (nonce + postdata).encode('utf-8')
        message = urlpath.encode('utf-8') + hashlib.sha256(encoded).digest()

        mac = hmac.new(base64.b64decode(self.api_secret), message, hashlib.sha512)
        return base64.b64encode(mac.digest()).decode('utf-8')

    async def _request(self, endpoint: str, data: Optional[Dict] = None, private: bool = False) -> Dict:
        """Make API request"""
        url = f"{self.base_url}{endpoint}"

        if data is None:
            data = {}

        headers = {}

        if private:
            nonce = str(int(time.time() * 1000))
            data["nonce"] = nonce

            headers = {
                "API-Key": self.api_key,
                "API-Sign": self._generate_signature(endpoint, data, nonce)
            }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=data, headers=headers) as response:
                if response.status != 200:
                    text = await response.text()
                    logger.error(f"Kraken API error: {response.status} - {text}")
                    raise Exception(f"Kraken API error: {response.status}")

                result = await response.json()

                if result.get("error"):
                    raise Exception(f"Kraken API error: {result['error']}")

                return result.get("result", {})

    def validate_credentials(self) -> bool:
        """Validate API credentials"""
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            result = loop.run_until_complete(self._request("/0/private/Balance", private=True))
            return isinstance(result, dict)
        except:
            return False

    async def fetch_balances(self) -> Dict[str, float]:
        """Fetch current balances"""
        try:
            result = await self._request("/0/private/Balance", private=True)
            balances = {}

            for asset, balance in result.items():
                # Kraken uses special prefixes (X for crypto, Z for fiat)
                clean_asset = asset.replace("X", "").replace("Z", "")
                balance_float = float(balance)

                if balance_float > 0:
                    balances[clean_asset] = balance_float

            return balances

        except Exception as e:
            logger.error(f"Failed to fetch Kraken balances: {e}")
            return {}

    async def fetch_transactions(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[Dict]:
        """
        Fetch transaction history from Kraken

        Includes:
        - Trades
        - Deposits
        - Withdrawals
        """
        if start_date is None:
            start_date = datetime.utcnow() - timedelta(days=90)
        if end_date is None:
            end_date = datetime.utcnow()

        all_transactions = []

        try:
            # Fetch trades
            trades = await self._fetch_trades(start_date, end_date)
            all_transactions.extend(trades)

            # Fetch ledger (deposits/withdrawals)
            ledger_entries = await self._fetch_ledger(start_date, end_date)
            all_transactions.extend(ledger_entries)

            # Sort by timestamp
            all_transactions.sort(key=lambda x: x["timestamp"])

            return all_transactions[:limit]

        except Exception as e:
            logger.error(f"Failed to fetch Kraken transactions: {e}")
            return []

    async def _fetch_trades(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Fetch trade history"""
        try:
            data = {
                "start": int(start_date.timestamp()),
                "end": int(end_date.timestamp())
            }

            result = await self._request("/0/private/TradesHistory", data=data, private=True)
            trades = []

            for trade_id, trade in result.get("trades", {}).items():
                timestamp = datetime.fromtimestamp(trade["time"])

                # Parse pair (e.g., "XXBTZUSD" -> "BTC/USD")
                pair = trade["pair"]
                # Kraken pair parsing is complex, simplified here
                base = pair[:4].replace("X", "").replace("Z", "")
                quote = pair[4:].replace("X", "").replace("Z", "")

                is_buy = trade["type"] == "buy"

                trades.append({
                    "exchange": "kraken",
                    "transaction_id": f"kraken_{trade_id}",
                    "timestamp": timestamp,
                    "type": "trade",
                    "token_in": base if is_buy else quote,
                    "amount_in": float(trade["vol"]) if is_buy else float(trade["cost"]),
                    "token_out": quote if is_buy else base,
                    "amount_out": float(trade["cost"]) if is_buy else float(trade["vol"]),
                    "fee_token": quote,
                    "fee_amount": float(trade["fee"]),
                    "price_usd": float(trade["price"]) if quote == "USD" else 0,
                    "raw_data": trade
                })

            return trades

        except Exception as e:
            logger.error(f"Failed to fetch Kraken trades: {e}")
            return []

    async def _fetch_ledger(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Fetch ledger entries (deposits/withdrawals)"""
        try:
            data = {
                "start": int(start_date.timestamp()),
                "end": int(end_date.timestamp()),
                "type": "deposit,withdrawal"
            }

            result = await self._request("/0/private/Ledgers", data=data, private=True)
            ledger_entries = []

            for ledger_id, entry in result.get("ledger", {}).items():
                timestamp = datetime.fromtimestamp(entry["time"])
                asset = entry["asset"].replace("X", "").replace("Z", "")
                amount = abs(float(entry["amount"]))
                entry_type = entry["type"]

                if entry_type == "deposit":
                    ledger_entries.append({
                        "exchange": "kraken",
                        "transaction_id": f"kraken_deposit_{ledger_id}",
                        "timestamp": timestamp,
                        "type": "deposit",
                        "token_in": asset,
                        "amount_in": amount,
                        "token_out": None,
                        "amount_out": 0,
                        "fee_token": asset,
                        "fee_amount": float(entry.get("fee", 0)),
                        "price_usd": 0,
                        "raw_data": entry
                    })
                elif entry_type == "withdrawal":
                    ledger_entries.append({
                        "exchange": "kraken",
                        "transaction_id": f"kraken_withdrawal_{ledger_id}",
                        "timestamp": timestamp,
                        "type": "withdrawal",
                        "token_in": None,
                        "amount_in": 0,
                        "token_out": asset,
                        "amount_out": amount,
                        "fee_token": asset,
                        "fee_amount": float(entry.get("fee", 0)),
                        "price_usd": 0,
                        "raw_data": entry
                    })

            return ledger_entries

        except Exception as e:
            logger.error(f"Failed to fetch Kraken ledger: {e}")
            return []
