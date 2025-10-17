"""
Coinbase Pro Exchange Connector

Fetches transaction history from Coinbase Pro via API.
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import hmac
import hashlib
import base64
import time
import aiohttp
import logging
from .base_connector import BaseExchangeConnector

logger = logging.getLogger(__name__)


class CoinbaseConnector(BaseExchangeConnector):
    """
    Coinbase Pro Exchange Connector

    Supports Coinbase Pro (not regular Coinbase).
    """

    BASE_URL = "https://api.pro.coinbase.com"

    def __init__(self, api_key: str, api_secret: str, passphrase: str, **kwargs):
        super().__init__(api_key, api_secret, passphrase)
        self.base_url = kwargs.get("base_url", self.BASE_URL)

    def _generate_signature(self, timestamp: str, method: str, path: str, body: str = "") -> str:
        """Generate CB-ACCESS-SIGN header"""
        message = timestamp + method + path + body
        hmac_key = base64.b64decode(self.api_secret)
        signature = hmac.new(hmac_key, message.encode('utf-8'), hashlib.sha256)
        return base64.b64encode(signature.digest()).decode('utf-8')

    async def _request(self, method: str, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """Make authenticated API request"""
        url = f"{self.base_url}{endpoint}"
        timestamp = str(time.time())

        signature = self._generate_signature(timestamp, method, endpoint)

        headers = {
            "CB-ACCESS-KEY": self.api_key,
            "CB-ACCESS-SIGN": signature,
            "CB-ACCESS-TIMESTAMP": timestamp,
            "CB-ACCESS-PASSPHRASE": self.passphrase,
            "Content-Type": "application/json"
        }

        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, params=params, headers=headers) as response:
                if response.status != 200:
                    text = await response.text()
                    logger.error(f"Coinbase API error: {response.status} - {text}")
                    raise Exception(f"Coinbase API error: {response.status}")

                return await response.json()

    def validate_credentials(self) -> bool:
        """Validate API credentials"""
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            result = loop.run_until_complete(self._request("GET", "/accounts"))
            return isinstance(result, list)
        except:
            return False

    async def fetch_balances(self) -> Dict[str, float]:
        """Fetch current balances"""
        try:
            accounts = await self._request("GET", "/accounts")
            balances = {}

            for account in accounts:
                currency = account["currency"]
                balance = float(account["balance"])

                if balance > 0:
                    balances[currency] = balance

            return balances

        except Exception as e:
            logger.error(f"Failed to fetch Coinbase balances: {e}")
            return {}

    async def fetch_transactions(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[Dict]:
        """
        Fetch transaction history from Coinbase Pro

        Includes:
        - Trades (fills)
        - Deposits
        - Withdrawals
        """
        if start_date is None:
            start_date = datetime.utcnow() - timedelta(days=90)
        if end_date is None:
            end_date = datetime.utcnow()

        all_transactions = []

        try:
            # Fetch fills (trades)
            fills = await self._fetch_fills(start_date, end_date)
            all_transactions.extend(fills)

            # Fetch transfers (deposits/withdrawals)
            transfers = await self._fetch_transfers(start_date, end_date)
            all_transactions.extend(transfers)

            # Sort by timestamp
            all_transactions.sort(key=lambda x: x["timestamp"])

            return all_transactions[:limit]

        except Exception as e:
            logger.error(f"Failed to fetch Coinbase transactions: {e}")
            return []

    async def _fetch_fills(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Fetch trade fills"""
        try:
            # Coinbase uses pagination
            fills = []
            page = 1
            max_pages = 10

            while page <= max_pages:
                params = {
                    "limit": 100,
                    "before": page * 100
                }

                response = await self._request("GET", "/fills", params=params)

                if not response:
                    break

                for fill in response:
                    created_at = datetime.fromisoformat(fill["created_at"].replace('Z', '+00:00'))

                    if created_at < start_date:
                        break
                    if created_at > end_date:
                        continue

                    # Parse product (e.g., "BTC-USD")
                    product_parts = fill["product_id"].split("-")
                    base_currency = product_parts[0]
                    quote_currency = product_parts[1]

                    is_buy = fill["side"] == "buy"

                    fills.append({
                        "exchange": "coinbase",
                        "transaction_id": f"coinbase_{fill['trade_id']}",
                        "timestamp": created_at,
                        "type": "trade",
                        "token_in": base_currency if is_buy else quote_currency,
                        "amount_in": float(fill["size"]) if is_buy else float(fill["size"]) * float(fill["price"]),
                        "token_out": quote_currency if is_buy else base_currency,
                        "amount_out": float(fill["size"]) * float(fill["price"]) if is_buy else float(fill["size"]),
                        "fee_token": quote_currency,
                        "fee_amount": float(fill["fee"]),
                        "price_usd": float(fill["price"]) if quote_currency == "USD" else 0,
                        "raw_data": fill
                    })

                page += 1

            return fills

        except Exception as e:
            logger.error(f"Failed to fetch Coinbase fills: {e}")
            return []

    async def _fetch_transfers(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Fetch deposits and withdrawals"""
        try:
            accounts = await self._request("GET", "/accounts")
            transfers = []

            for account in accounts[:20]:  # Limit to 20 most active accounts
                account_id = account["id"]
                currency = account["currency"]

                try:
                    # Fetch account transfers
                    account_transfers = await self._request("GET", f"/accounts/{account_id}/transfers")

                    for transfer in account_transfers:
                        created_at = datetime.fromisoformat(transfer["created_at"].replace('Z', '+00:00'))

                        if created_at < start_date or created_at > end_date:
                            continue

                        transfer_type = transfer["type"]
                        amount = float(transfer["amount"])

                        if transfer_type == "deposit":
                            transfers.append({
                                "exchange": "coinbase",
                                "transaction_id": f"coinbase_deposit_{transfer['id']}",
                                "timestamp": created_at,
                                "type": "deposit",
                                "token_in": currency,
                                "amount_in": amount,
                                "token_out": None,
                                "amount_out": 0,
                                "fee_token": None,
                                "fee_amount": 0,
                                "price_usd": 0,
                                "raw_data": transfer
                            })
                        elif transfer_type == "withdraw":
                            transfers.append({
                                "exchange": "coinbase",
                                "transaction_id": f"coinbase_withdrawal_{transfer['id']}",
                                "timestamp": created_at,
                                "type": "withdrawal",
                                "token_in": None,
                                "amount_in": 0,
                                "token_out": currency,
                                "amount_out": amount,
                                "fee_token": currency,
                                "fee_amount": float(transfer.get("fee", 0)),
                                "price_usd": 0,
                                "raw_data": transfer
                            })

                    # Rate limiting
                    await asyncio.sleep(0.2)

                except Exception as e:
                    logger.warning(f"Failed to fetch transfers for account {account_id}: {e}")
                    continue

            return transfers

        except Exception as e:
            logger.error(f"Failed to fetch Coinbase transfers: {e}")
            return []
