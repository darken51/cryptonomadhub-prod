"""
Koinly Crypto Tax Guide Scraper

Scrapes cryptocurrency-specific tax rates from Koinly guides
https://koinly.io/guides/

Coverage: Major crypto-friendly countries with specific crypto tax rules
"""

import httpx
from bs4 import BeautifulSoup
from typing import Optional, Dict, List
import logging
import re

logger = logging.getLogger(__name__)


class KoinlyCryptoScraper:
    """Scraper for Koinly cryptocurrency tax guides"""

    BASE_URL = "https://koinly.io/guides"

    # Country guides available on Koinly
    COUNTRY_GUIDES = {
        "US": "crypto-tax-us",
        "GB": "crypto-tax-uk",
        "DE": "crypto-tax-germany",
        "FR": "crypto-tax-france",
        "ES": "crypto-tax-spain",
        "IT": "crypto-tax-italy",
        "NL": "crypto-tax-netherlands",
        "BE": "crypto-tax-belgium",
        "CH": "crypto-tax-switzerland",
        "AT": "crypto-tax-austria",
        "SE": "crypto-tax-sweden",
        "NO": "crypto-tax-norway",
        "DK": "crypto-tax-denmark",
        "FI": "crypto-tax-finland",
        "IE": "crypto-tax-ireland",
        "PT": "crypto-tax-portugal",
        "AU": "crypto-tax-australia",
        "CA": "crypto-tax-canada",
        "NZ": "crypto-tax-new-zealand",
        "SG": "crypto-tax-singapore",
        "HK": "crypto-tax-hong-kong",
        "JP": "crypto-tax-japan",
        "KR": "crypto-tax-south-korea",
        "IN": "crypto-tax-india",
        "AE": "crypto-tax-uae",
        "BR": "crypto-tax-brazil",
        "MX": "crypto-tax-mexico",
        "AR": "crypto-tax-argentina",
        "ZA": "crypto-tax-south-africa",
        "TR": "crypto-tax-turkey",
        "PL": "crypto-tax-poland",
        "CZ": "crypto-tax-czech-republic",
        "GR": "crypto-tax-greece",
        "RO": "crypto-tax-romania",
    }

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": "Mozilla/5.0 (compatible; NomadCryptoHub/1.0)"}
        )

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    async def scrape_country_guide(self, country_code: str) -> Optional[Dict]:
        """
        Scrape crypto tax guide for a specific country

        Returns:
            {
                'country_code': 'PT',
                'crypto_short_rate': 0.0,
                'crypto_long_rate': 0.0,
                'crypto_notes': 'Individuals: 0% if held personally...',
                'source': 'Koinly',
                'year': 2025
            }
        """
        try:
            guide_slug = self.COUNTRY_GUIDES.get(country_code.upper())

            if not guide_slug:
                logger.warning(f"No Koinly guide found for {country_code}")
                return None

            url = f"{self.BASE_URL}/{guide_slug}/"
            logger.info(f"Scraping Koinly guide: {url}")

            response = await self.client.get(url)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'lxml')

            # Extract tax rates and rules
            crypto_data = self._parse_guide_content(soup, country_code)

            if crypto_data:
                logger.info(f"✓ Extracted crypto tax data for {country_code}")
                return crypto_data

            return None

        except Exception as e:
            logger.error(f"Error scraping Koinly guide for {country_code}: {e}")
            return None

    def _parse_guide_content(self, soup: BeautifulSoup, country_code: str) -> Optional[Dict]:
        """Parse guide content to extract crypto tax rates"""

        # Get all text content
        content = soup.get_text().lower()

        # Extract rates
        short_term_rate = self._extract_short_term_rate(content)
        long_term_rate = self._extract_long_term_rate(content)

        # Extract special notes
        notes = self._extract_crypto_notes(soup, country_code)

        if short_term_rate is not None or notes:
            return {
                'country_code': country_code.upper(),
                'crypto_short_rate': short_term_rate,
                'crypto_long_rate': long_term_rate,
                'crypto_notes': notes,
                'source': 'Koinly',
                'year': 2025
            }

        return None

    def _extract_short_term_rate(self, content: str) -> Optional[float]:
        """Extract short-term crypto tax rate"""

        # Patterns for short-term rates
        patterns = [
            r'short[-\s]term.*?(\d+(?:\.\d+)?)\s*%',
            r'less than (?:one year|12 months|1 year).*?(\d+(?:\.\d+)?)\s*%',
            r'held for less.*?(\d+(?:\.\d+)?)\s*%',
        ]

        for pattern in patterns:
            match = re.search(pattern, content)
            if match:
                return float(match.group(1)) / 100

        # Check for tax-free status
        if 'not taxed' in content or 'tax-free' in content or 'exempt' in content:
            return 0.0

        return None

    def _extract_long_term_rate(self, content: str) -> Optional[float]:
        """Extract long-term crypto tax rate"""

        # Patterns for long-term rates
        patterns = [
            r'long[-\s]term.*?(\d+(?:\.\d+)?)\s*%',
            r'more than (?:one year|12 months|1 year).*?(\d+(?:\.\d+)?)\s*%',
            r'held for more.*?(\d+(?:\.\d+)?)\s*%',
            r'held (?:over|longer than) (?:one year|1 year|12 months).*?(\d+(?:\.\d+)?)\s*%',
        ]

        for pattern in patterns:
            match = re.search(pattern, content)
            if match:
                return float(match.group(1)) / 100

        # Check for specific country rules
        if 'germany' in content and 'one year' in content and ('0%' in content or 'exempt' in content):
            return 0.0  # Germany: 0% if held >1 year

        if 'portugal' in content and 'individual' in content and ('0%' in content or 'not taxed' in content):
            return 0.0  # Portugal: 0% for individuals

        return None

    def _extract_crypto_notes(self, soup: BeautifulSoup, country_code: str) -> str:
        """Extract important notes about crypto taxation"""

        notes = []

        # Look for key information sections
        key_sections = soup.find_all(['p', 'li', 'div'], class_=re.compile(r'(highlight|important|note|summary)', re.I))

        for section in key_sections[:5]:  # Limit to first 5 relevant sections
            text = section.get_text().strip()

            # Check for important keywords
            if any(keyword in text.lower() for keyword in ['crypto', 'bitcoin', 'held', 'year', 'exempt', 'trading', 'individual', 'company']):
                notes.append(text[:200])  # Limit length

        # Add country-specific known rules
        country_specific = self._get_country_specific_notes(country_code)
        if country_specific:
            notes.insert(0, country_specific)

        return " | ".join(notes[:3])  # Max 3 notes

    def _get_country_specific_notes(self, country_code: str) -> str:
        """Known crypto tax rules by country"""

        rules = {
            "DE": "0% if crypto held >1 year. <1 year: taxed as income (up to 45%)",
            "PT": "0% for individuals holding personally. 28% for companies or trading",
            "CH": "0% for private investors. Companies: regular income tax",
            "SG": "0% capital gains. Income tax if trading business",
            "BE": "33% if speculative/frequent trading. 0% if occasional",
            "NL": "Box 3 wealth tax: ~1.5% on crypto holdings value",
            "IT": "26% on crypto gains >€2,000. Flat rate regardless of holding period",
            "FR": "30% flat tax (PFU) regardless of holding period",
            "ES": "19-26% progressive rate on crypto gains",
            "AE": "0% personal income tax including crypto",
            "HK": "0% capital gains tax. Only if trading business",
            "MY": "0% capital gains tax on crypto",
            "TH": "0% if held as investment. 15% if trading business",
        }

        return rules.get(country_code, "")

    async def scrape_all_guides(self) -> Dict[str, Dict]:
        """
        Scrape all available country guides

        Returns:
            {
                'PT': {'crypto_short_rate': 0.0, ...},
                'DE': {'crypto_short_rate': 0.45, ...},
                ...
            }
        """
        results = {}

        logger.info(f"Scraping {len(self.COUNTRY_GUIDES)} Koinly crypto guides...")

        for country_code in self.COUNTRY_GUIDES.keys():
            try:
                data = await self.scrape_country_guide(country_code)
                if data:
                    results[country_code] = data
            except Exception as e:
                logger.error(f"Error scraping {country_code}: {e}")
                continue

        logger.info(f"Koinly scraper found crypto data for {len(results)} countries")
        return results

    async def get_country_crypto_rate(self, country_code: str) -> Optional[Dict]:
        """Get crypto tax rate for specific country"""
        return await self.scrape_country_guide(country_code)

    async def test_connection(self) -> bool:
        """Test if Koinly is accessible"""
        try:
            response = await self.client.head(self.BASE_URL, timeout=10.0)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Koinly connection test failed: {e}")
            return False


# Helper function
async def fetch_crypto_rate(country_code: str) -> Optional[Dict]:
    """Convenience function to fetch crypto tax rate"""
    scraper = KoinlyCryptoScraper()
    try:
        return await scraper.get_country_crypto_rate(country_code)
    finally:
        await scraper.close()
