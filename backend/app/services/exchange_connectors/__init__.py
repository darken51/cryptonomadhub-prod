"""
Exchange Connectors Package

Provides connectors to fetch transaction history from major exchanges.

Supported Exchanges:
- Binance
- Coinbase Pro
- Kraken
- Generic CSV Import

Features:
- Automatic transaction sync
- Rate limiting
- Error handling
- Transaction normalization
"""

from .base_connector import BaseExchangeConnector
from .binance_connector import BinanceConnector
from .coinbase_connector import CoinbaseConnector
from .kraken_connector import KrakenConnector
from .csv_importer import CSVImporter
from .factory import ExchangeConnectorFactory

__all__ = [
    "BaseExchangeConnector",
    "BinanceConnector",
    "CoinbaseConnector",
    "KrakenConnector",
    "CSVImporter",
    "ExchangeConnectorFactory",
]
