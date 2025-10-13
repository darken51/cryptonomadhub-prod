"""
Tax Data Sources Package

Data sources for tax information:
- World Bank API (macro data)
- Tax Foundation (Europe scraping)
- OECD API (members data - needs migration)
- KPMG PDF (127 countries)
- Koinly (crypto-specific rates)
"""

from .worldbank_client import WorldBankClient, fetch_worldbank_tax_data
from .taxfoundation_scraper import TaxFoundationScraper, fetch_taxfoundation_rate
from .oecd_client import OECDClient, fetch_oecd_tax_rates
from .kpmg_scraper import KPMGScraper, fetch_kpmg_rate
from .koinly_crypto_scraper import KoinlyCryptoScraper, fetch_crypto_rate
from .pwc_scraper import PwCScraper, fetch_pwc_rate
from .aggregator import TaxDataAggregator

__all__ = [
    'WorldBankClient',
    'TaxFoundationScraper',
    'OECDClient',
    'KPMGScraper',
    'KoinlyCryptoScraper',
    'PwCScraper',
    'TaxDataAggregator',
    'fetch_worldbank_tax_data',
    'fetch_taxfoundation_rate',
    'fetch_oecd_tax_rates',
    'fetch_kpmg_rate',
    'fetch_crypto_rate',
    'fetch_pwc_rate',
]
