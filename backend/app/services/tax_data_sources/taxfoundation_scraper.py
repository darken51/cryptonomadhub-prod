"""
Tax Foundation Data Scraper

Scrapes capital gains tax rates from Tax Foundation
https://taxfoundation.org/data/
"""

import httpx
from bs4 import BeautifulSoup
from typing import Optional, Dict, List
import logging
import re

logger = logging.getLogger(__name__)


class TaxFoundationScraper:
    """Scraper for Tax Foundation CGT data"""

    URLS = {
        "europe": "https://taxfoundation.org/data/all/eu/capital-gains-tax-rates-europe/",
        "global": "https://taxfoundation.org/data/all/global/capital-gains-tax-rates-by-country/"
    }

    # Country code mapping (Tax Foundation name -> ISO code)
    COUNTRY_MAPPING = {
        "United States": "US",
        "United Kingdom": "GB",
        "France": "FR",
        "Germany": "DE",
        "Spain": "ES",
        "Italy": "IT",
        "Netherlands": "NL",
        "Belgium": "BE",
        "Switzerland": "CH",
        "Austria": "AT",
        "Sweden": "SE",
        "Norway": "NO",
        "Denmark": "DK",
        "Finland": "FI",
        "Ireland": "IE",
        "Portugal": "PT",
        "Greece": "GR",
        "Poland": "PL",
        "Czech Republic": "CZ",
        "Hungary": "HU",
        "Luxembourg": "LU",
        "Australia": "AU",
        "Canada": "CA",
        "Japan": "JP",
        "South Korea": "KR",
        "Singapore": "SG",
        "Hong Kong": "HK",
        "New Zealand": "NZ",
        "Mexico": "MX",
        "Chile": "CL",
        "Brazil": "BR",
        "Argentina": "AR",
        "Colombia": "CO",
        "India": "IN",
        "China": "CN",
        "Israel": "IL",
        "Turkey": "TR",
        "South Africa": "ZA",
        "Estonia": "EE",
        "Latvia": "LV",
        "Lithuania": "LT",
        "Slovenia": "SI",
        "Slovakia": "SK",
        "Romania": "RO",
        "Bulgaria": "BG",
        "Croatia": "HR",
    }

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; NomadCryptoHub/1.0)"
            }
        )

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    async def scrape_europe_rates(self) -> List[Dict]:
        """
        Scrape European CGT rates

        Returns list of {country_code, country_name, cgt_rate, year, source}
        """
        try:
            logger.info("Scraping Tax Foundation Europe data")

            response = await self.client.get(self.URLS["europe"])
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'lxml')

            # Find the data table
            table = soup.find('table')
            if not table:
                logger.error("Could not find data table on Tax Foundation Europe page")
                return []

            results = []
            rows = table.find_all('tr')[1:]  # Skip header

            for row in rows:
                cols = row.find_all('td')
                if len(cols) < 2:
                    continue

                country_name_raw = cols[0].text.strip()
                rate_text = cols[1].text.strip()

                # Extract country name (remove ISO code in parentheses if present)
                # e.g., "Austria (AT)" -> "Austria"
                country_name = re.sub(r'\s*\([A-Z]{2}\)\s*$', '', country_name_raw).strip()

                # Parse rate (e.g., "26.0%", "0%", "Varies")
                rate = self._parse_rate(rate_text)

                if rate is not None and country_name in self.COUNTRY_MAPPING:
                    results.append({
                        "country_code": self.COUNTRY_MAPPING[country_name],
                        "country_name": country_name,
                        "cgt_rate": rate,
                        "source": "Tax Foundation",
                        "year": 2025,  # Updated annually
                        "notes": rate_text if "Varies" in rate_text or "Exempt" in rate_text else None
                    })

            logger.info(f"Scraped {len(results)} European countries from Tax Foundation")
            return results

        except Exception as e:
            logger.error(f"Error scraping Tax Foundation Europe: {e}")
            return []

    async def get_country_rate(self, country_code: str) -> Optional[Dict]:
        """
        Get CGT rate for a specific country

        Args:
            country_code: ISO 2-letter code

        Returns:
            {
                'country_code': 'FR',
                'country_name': 'France',
                'cgt_rate': 0.30,
                'source': 'Tax Foundation',
                'year': 2025
            }
        """
        try:
            # First try Europe data
            europe_data = await self.scrape_europe_rates()

            for country in europe_data:
                if country["country_code"] == country_code.upper():
                    return country

            logger.warning(f"Country {country_code} not found in Tax Foundation data")
            return None

        except Exception as e:
            logger.error(f"Error getting country rate for {country_code}: {e}")
            return None

    def _parse_rate(self, rate_text: str) -> Optional[float]:
        """
        Parse rate from text

        Examples:
            "26.0%" -> 0.26
            "0%" -> 0.0
            "Varies" -> None
            "Exempt" -> 0.0
        """
        try:
            rate_text = rate_text.strip()

            # Handle special cases
            if "Exempt" in rate_text or "No tax" in rate_text:
                return 0.0

            if "Varies" in rate_text or "N/A" in rate_text:
                return None

            # Extract percentage
            match = re.search(r'(\d+\.?\d*)\s*%', rate_text)
            if match:
                return float(match.group(1)) / 100

            # Try direct float parse
            return float(rate_text.replace('%', '').strip()) / 100

        except Exception as e:
            logger.warning(f"Could not parse rate '{rate_text}': {e}")
            return None

    async def scrape_all_available(self) -> Dict[str, Dict]:
        """
        Scrape all available data

        Returns:
            {
                'US': {'cgt_rate': 0.20, 'year': 2025, ...},
                'FR': {'cgt_rate': 0.30, 'year': 2025, ...},
                ...
            }
        """
        try:
            all_data = {}

            # Scrape Europe
            europe_data = await self.scrape_europe_rates()
            for country in europe_data:
                all_data[country["country_code"]] = country

            logger.info(f"Scraped total {len(all_data)} countries from Tax Foundation")
            return all_data

        except Exception as e:
            logger.error(f"Error scraping all Tax Foundation data: {e}")
            return {}

    async def test_connection(self) -> bool:
        """Test if Tax Foundation website is accessible"""
        try:
            response = await self.client.get(self.URLS["europe"], timeout=10.0)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Tax Foundation connection test failed: {e}")
            return False


# Helper function
async def fetch_taxfoundation_rate(country_code: str) -> Optional[Dict]:
    """Convenience function to fetch CGT rate"""
    scraper = TaxFoundationScraper()
    try:
        return await scraper.get_country_rate(country_code)
    finally:
        await scraper.close()
