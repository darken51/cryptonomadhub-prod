"""
World Bank Open Data API Client

Free API for global tax data
https://datahelpdesk.worldbank.org/knowledgebase/articles/898599
"""

import httpx
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)


class WorldBankClient:
    """Client for World Bank Open Data API"""

    BASE_URL = "https://api.worldbank.org/v2"

    # Tax-related indicators
    INDICATORS = {
        "tax_income_profits": "GC.TAX.YPKG.RV.ZS",  # Taxes on income, profits, capital gains (% revenue)
        "tax_revenue_gdp": "GC.TAX.TOTL.GD.ZS",     # Tax revenue (% of GDP)
        "total_tax_rate": "IC.TAX.TOTL.CP.ZS",      # Total tax rate (% of commercial profits)
    }

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    async def get_tax_data(self, country_code: str) -> Optional[Dict]:
        """
        Fetch tax data for a country

        Args:
            country_code: ISO 2-letter country code (US, FR, DE, etc.)

        Returns:
            {
                'country_code': 'US',
                'country_name': 'United States',
                'year': 2023,
                'tax_income_profits_pct': 48.5,
                'tax_revenue_gdp_pct': 27.1,
                'total_tax_rate_pct': 36.6,
                'source': 'World Bank'
            }
        """
        try:
            logger.info(f"Fetching World Bank data for {country_code}")

            # Fetch tax on income/profits/capital gains
            indicator = self.INDICATORS["tax_income_profits"]
            url = f"{self.BASE_URL}/country/{country_code}/indicator/{indicator}"

            params = {
                "format": "json",
                "date": "2020:2025",  # Last 5 years
                "per_page": 100
            }

            response = await self.client.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            # World Bank returns [metadata, data]
            if len(data) < 2 or not data[1]:
                logger.warning(f"No data found for {country_code}")
                return None

            # Get most recent non-null value
            for record in data[1]:
                if record.get("value") is not None:
                    return {
                        "country_code": country_code.upper(),
                        "country_name": record["country"]["value"],
                        "year": int(record["date"]),
                        "tax_income_profits_pct": float(record["value"]),
                        "source": "World Bank",
                        "indicator": indicator
                    }

            logger.warning(f"All values null for {country_code}")
            return None

        except httpx.HTTPError as e:
            logger.error(f"World Bank API error for {country_code}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error fetching World Bank data for {country_code}: {e}")
            return None

    async def get_multiple_indicators(self, country_code: str) -> Optional[Dict]:
        """
        Fetch multiple tax indicators for a country

        Returns more comprehensive data
        """
        try:
            all_data = {}

            for indicator_name, indicator_code in self.INDICATORS.items():
                url = f"{self.BASE_URL}/country/{country_code}/indicator/{indicator_code}"
                params = {"format": "json", "date": "2020:2025", "per_page": 10}

                response = await self.client.get(url, params=params)

                if response.status_code == 200:
                    data = response.json()
                    if len(data) > 1 and data[1]:
                        for record in data[1]:
                            if record.get("value") is not None:
                                all_data[indicator_name] = {
                                    "value": float(record["value"]),
                                    "year": int(record["date"])
                                }
                                break

            if all_data:
                return {
                    "country_code": country_code.upper(),
                    "source": "World Bank",
                    "indicators": all_data
                }

            return None

        except Exception as e:
            logger.error(f"Error fetching multiple indicators for {country_code}: {e}")
            return None

    async def test_connection(self) -> bool:
        """Test if World Bank API is accessible"""
        try:
            url = f"{self.BASE_URL}/country/US/indicator/GC.TAX.YPKG.RV.ZS"
            params = {"format": "json", "per_page": 1}

            response = await self.client.get(url, params=params)
            return response.status_code == 200

        except Exception as e:
            logger.error(f"World Bank connection test failed: {e}")
            return False


# Helper function for easy usage
async def fetch_worldbank_tax_data(country_code: str) -> Optional[Dict]:
    """Convenience function to fetch tax data"""
    client = WorldBankClient()
    try:
        return await client.get_tax_data(country_code)
    finally:
        await client.close()
