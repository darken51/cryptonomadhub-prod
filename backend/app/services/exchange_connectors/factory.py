"""
Exchange Connector Factory

Factory for creating exchange connector instances.
"""

from typing import Optional, Dict
import logging
from .base_connector import BaseExchangeConnector
from .binance_connector import BinanceConnector
from .coinbase_connector import CoinbaseConnector
from .kraken_connector import KrakenConnector
from .csv_importer import CSVImporter

logger = logging.getLogger(__name__)


class ExchangeConnectorFactory:
    """
    Exchange Connector Factory

    Creates the appropriate connector based on exchange name.
    """

    SUPPORTED_EXCHANGES = {
        "binance": BinanceConnector,
        "coinbase": CoinbaseConnector,
        "coinbase_pro": CoinbaseConnector,
        "kraken": KrakenConnector,
        "csv": CSVImporter,
        "generic": CSVImporter
    }

    @staticmethod
    def create(
        exchange: str,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        passphrase: Optional[str] = None,
        **kwargs
    ) -> BaseExchangeConnector:
        """
        Create exchange connector

        Args:
            exchange: Exchange name (binance, coinbase, kraken, csv)
            api_key: API key (not required for CSV)
            api_secret: API secret (not required for CSV)
            passphrase: API passphrase (required for Coinbase Pro)
            **kwargs: Additional parameters

        Returns:
            Exchange connector instance

        Raises:
            ValueError: If exchange is not supported

        Example:
            connector = ExchangeConnectorFactory.create(
                "binance",
                api_key="your_key",
                api_secret="your_secret"
            )
        """
        exchange = exchange.lower().strip()

        if exchange not in ExchangeConnectorFactory.SUPPORTED_EXCHANGES:
            raise ValueError(
                f"Unsupported exchange: {exchange}. "
                f"Supported: {', '.join(ExchangeConnectorFactory.SUPPORTED_EXCHANGES.keys())}"
            )

        connector_class = ExchangeConnectorFactory.SUPPORTED_EXCHANGES[exchange]

        # Handle CSV specially (no credentials needed)
        if exchange in ["csv", "generic"]:
            return connector_class(**kwargs)

        # Validate credentials
        if not api_key or not api_secret:
            raise ValueError(f"API key and secret required for {exchange}")

        # Coinbase Pro requires passphrase
        if exchange in ["coinbase", "coinbase_pro"]:
            if not passphrase:
                raise ValueError("Passphrase required for Coinbase Pro")
            return connector_class(api_key, api_secret, passphrase, **kwargs)

        # Other exchanges
        return connector_class(api_key, api_secret, **kwargs)

    @staticmethod
    def get_supported_exchanges() -> Dict[str, Dict]:
        """
        Get list of supported exchanges with metadata

        Returns:
            Dict mapping exchange name to metadata
        """
        return {
            "binance": {
                "name": "Binance",
                "requires_api_key": True,
                "requires_passphrase": False,
                "supported_features": ["trades", "deposits", "withdrawals", "balances"],
                "documentation": "https://binance-docs.github.io/apidocs/spot/en/"
            },
            "coinbase": {
                "name": "Coinbase Pro",
                "requires_api_key": True,
                "requires_passphrase": True,
                "supported_features": ["trades", "deposits", "withdrawals", "balances"],
                "documentation": "https://docs.pro.coinbase.com/"
            },
            "kraken": {
                "name": "Kraken",
                "requires_api_key": True,
                "requires_passphrase": False,
                "supported_features": ["trades", "deposits", "withdrawals", "balances"],
                "documentation": "https://docs.kraken.com/rest/"
            },
            "csv": {
                "name": "CSV Import (Generic)",
                "requires_api_key": False,
                "requires_passphrase": False,
                "supported_features": ["import"],
                "documentation": "Upload CSV file with transaction history"
            }
        }

    @staticmethod
    def validate_exchange(exchange: str) -> bool:
        """
        Check if exchange is supported

        Args:
            exchange: Exchange name

        Returns:
            True if supported
        """
        return exchange.lower() in ExchangeConnectorFactory.SUPPORTED_EXCHANGES

    @staticmethod
    async def test_connection(
        exchange: str,
        api_key: str,
        api_secret: str,
        passphrase: Optional[str] = None
    ) -> Dict:
        """
        Test exchange connection

        Args:
            exchange: Exchange name
            api_key: API key
            api_secret: API secret
            passphrase: Passphrase (if required)

        Returns:
            Dict with connection test results
        """
        try:
            connector = ExchangeConnectorFactory.create(
                exchange,
                api_key=api_key,
                api_secret=api_secret,
                passphrase=passphrase
            )

            # Test credentials
            valid = connector.validate_credentials()

            if not valid:
                return {
                    "success": False,
                    "message": "Invalid credentials"
                }

            # Fetch balances as additional test
            try:
                balances = await connector.fetch_balances()
                balance_count = len(balances)
            except:
                balance_count = 0

            return {
                "success": True,
                "message": "Connection successful",
                "balances_found": balance_count
            }

        except Exception as e:
            logger.error(f"Connection test failed for {exchange}: {e}")
            return {
                "success": False,
                "message": str(e)
            }
