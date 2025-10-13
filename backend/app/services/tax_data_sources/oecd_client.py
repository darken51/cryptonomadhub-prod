"""
OECD Data API Client

Free API for OECD member countries tax data
https://data.oecd.org/api/

NOTE: OECD migrated to new SDMX API in 2023-2024
Old stats.oecd.org URLs now return 301
TODO: Migrate to sdmx1 library for new API
For now, OECD data is disabled
"""

import httpx
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)


class OECDClient:
    """Client for OECD Data API"""

    BASE_URL = "https://stats.oecd.org/SDMX-JSON/data"

    # OECD country codes (ISO 3-letter)
    OECD_COUNTRIES = {
        "AUS", "AUT", "BEL", "CAN", "CHL", "COL", "CZE", "DNK", "EST",
        "FIN", "FRA", "DEU", "GRC", "HUN", "ISL", "IRL", "ISR", "ITA",
        "JPN", "KOR", "LVA", "LTU", "LUX", "MEX", "NLD", "NZL", "NOR",
        "POL", "PRT", "SVK", "SVN", "ESP", "SWE", "CHE", "TUR", "GBR", "USA"
    }

    # ISO 2-letter to 3-letter mapping
    ISO2_TO_ISO3 = {
        "AU": "AUS", "AT": "AUT", "BE": "BEL", "CA": "CAN", "CL": "CHL",
        "CO": "COL", "CZ": "CZE", "DK": "DNK", "EE": "EST", "FI": "FIN",
        "FR": "FRA", "DE": "DEU", "GR": "GRC", "HU": "HUN", "IS": "ISL",
        "IE": "IRL", "IL": "ISR", "IT": "ITA", "JP": "JPN", "KR": "KOR",
        "LV": "LVA", "LT": "LTU", "LU": "LUX", "MX": "MEX", "NL": "NLD",
        "NZ": "NZL", "NO": "NOR", "PL": "POL", "PT": "PRT", "SK": "SVK",
        "SI": "SVN", "ES": "ESP", "SE": "SWE", "CH": "CHE", "TR": "TUR",
        "GB": "GBR", "US": "USA"
    }

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    def _get_iso3_code(self, country_code: str) -> Optional[str]:
        """Convert ISO 2-letter to 3-letter code"""
        return self.ISO2_TO_ISO3.get(country_code.upper())

    async def get_tax_rates(self, country_code: str) -> Optional[Dict]:
        """
        Fetch tax rates from OECD

        Args:
            country_code: ISO 2-letter code

        Returns:
            {
                'country_code': 'US',
                'country_name': 'United States',
                'personal_income_tax': 0.37,
                'corporate_tax': 0.21,
                'source': 'OECD',
                'year': 2024
            }
        """
        try:
            iso3_code = self._get_iso3_code(country_code)
            if not iso3_code:
                logger.warning(f"{country_code} not an OECD member or mapping not found")
                return None

            logger.info(f"Fetching OECD data for {country_code} ({iso3_code})")

            # OECD Tax Database - Personal Income Tax
            # Note: OECD API format is complex SDMX-JSON
            # For MVP, we'll use a simplified approach

            # TABLE_I1 = Personal income tax rates
            url = f"{self.BASE_URL}/TABLE_I1/{iso3_code}.CPITA.._T/all"

            response = await self.client.get(url, params={"format": "json"})

            if response.status_code != 200:
                logger.warning(f"OECD API returned {response.status_code} for {country_code}")
                return None

            data = response.json()

            # Parse SDMX-JSON (simplified)
            if "dataSets" not in data or not data["dataSets"]:
                return None

            observations = data["dataSets"][0].get("observations", {})

            if observations:
                # Get latest observation
                latest_key = list(observations.keys())[0]
                latest_value = observations[latest_key][0]

                return {
                    "country_code": country_code.upper(),
                    "iso3_code": iso3_code,
                    "personal_income_tax_top": float(latest_value) / 100 if latest_value else None,
                    "source": "OECD",
                    "year": 2024,  # OECD typically latest year
                    "note": "Top marginal rate from OECD TABLE_I1"
                }

            return None

        except httpx.HTTPError as e:
            logger.error(f"OECD API HTTP error for {country_code}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error fetching OECD data for {country_code}: {e}")
            return None

    async def is_oecd_member(self, country_code: str) -> bool:
        """Check if country is OECD member"""
        iso3_code = self._get_iso3_code(country_code)
        return iso3_code in self.OECD_COUNTRIES if iso3_code else False

    async def get_oecd_members_list(self) -> list:
        """Get list of OECD member ISO 2-letter codes"""
        return [code for code, iso3 in self.ISO2_TO_ISO3.items() if iso3 in self.OECD_COUNTRIES]

    async def test_connection(self) -> bool:
        """Test if OECD API is accessible"""
        try:
            # Test with US data
            url = f"{self.BASE_URL}/TABLE_I1/USA.CPITA.._T/all"
            response = await self.client.get(url, params={"format": "json"}, timeout=10.0)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"OECD connection test failed: {e}")
            return False


# Helper function
async def fetch_oecd_tax_rates(country_code: str) -> Optional[Dict]:
    """Convenience function to fetch OECD tax rates"""
    client = OECDClient()
    try:
        return await client.get_tax_rates(country_code)
    finally:
        await client.close()
