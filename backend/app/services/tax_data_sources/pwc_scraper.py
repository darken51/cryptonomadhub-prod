"""
PwC Tax Summaries Scraper

Scrapes capital gains tax rates from PwC Worldwide Tax Summaries
https://taxsummaries.pwc.com/quick-charts/capital-gains-tax-cgt-rates

Coverage: 148 territories worldwide with official tax data
"""

import httpx
from bs4 import BeautifulSoup
from typing import Optional, Dict, List
import logging
import re
from .pwc_country_mapping import PWC_COUNTRY_MAPPING

logger = logging.getLogger(__name__)


class PwCScraper:
    """Scraper for PwC Tax Summaries"""

    BASE_URL = "https://taxsummaries.pwc.com"
    CGT_CHART_URL = f"{BASE_URL}/quick-charts/capital-gains-tax-cgt-rates"

    # Use complete mapping from pwc_country_mapping.py (148 territories)
    COUNTRY_MAPPING = PWC_COUNTRY_MAPPING

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": "Mozilla/5.0 (compatible; NomadCryptoHub/1.0)"}
        )

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    async def get_all_cgt_rates(self) -> List[Dict]:
        """
        Scrape all capital gains tax rates from PwC quick chart

        Returns:
            List of dicts with country data:
            [{
                'country_code': 'US',
                'country_name': 'United States',
                'cgt_rate': 0.20,
                'corporate_cgt': 0.21,
                'notes': 'Individual rate 0-20% depending on income',
                'source': 'PwC',
                'year': 2025
            }, ...]
        """
        try:
            logger.info(f"Fetching PwC CGT rates from {self.CGT_CHART_URL}")
            response = await self.client.get(self.CGT_CHART_URL)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'lxml')

            # Find the main table
            table = soup.find('table', {'class': 'table'}) or soup.find('table')

            if not table:
                logger.error("Could not find CGT rates table on PwC page")
                return []

            results = []
            rows = table.find_all('tr')[1:]  # Skip header row

            for row in rows:
                cols = row.find_all('td')
                if len(cols) < 3:
                    continue

                # Extract data
                country_name_raw = cols[0].get_text(strip=True)
                corporate_cgt_raw = cols[1].get_text(strip=True)
                individual_cgt_raw = cols[2].get_text(strip=True)

                # Clean country name - remove "(Last reviewed...)" part
                country_name_clean = re.sub(r'\(Last reviewed.*?\)', '', country_name_raw).strip()
                country_name = country_name_clean.lower().strip()

                # Map to ISO code
                country_code = self.COUNTRY_MAPPING.get(country_name)
                if not country_code:
                    logger.debug(f"No mapping for country: {country_name_raw}")
                    continue

                # Parse individual CGT rate (what we care about for crypto)
                cgt_rate, notes = self._parse_rate(individual_cgt_raw)

                # Parse corporate CGT
                corporate_cgt, corp_notes = self._parse_rate(corporate_cgt_raw)

                if notes and corp_notes:
                    notes = f"Individual: {notes}. Corporate: {corp_notes}"
                elif corp_notes:
                    notes = corp_notes

                result = {
                    'country_code': country_code,
                    'country_name': country_name_raw,
                    'cgt_rate': cgt_rate,
                    'corporate_cgt': corporate_cgt,
                    'notes': notes,
                    'source': 'PwC',
                    'year': 2025
                }

                results.append(result)
                logger.debug(f"Parsed {country_code}: CGT {cgt_rate}, Corp {corporate_cgt}")

            logger.info(f"Successfully scraped {len(results)} countries from PwC")
            return results

        except Exception as e:
            logger.error(f"Error scraping PwC CGT rates: {e}")
            return []

    def _parse_rate(self, rate_text: str) -> tuple[Optional[float], str]:
        """
        Parse rate from PwC text

        Examples:
            "15" -> (0.15, "")
            "10 or 20" -> (0.20, "10 or 20 depending on conditions")
            "Capital gains are subject to the normal CIT rate." -> (None, "Subject to CIT rate")
            "NA" -> (None, "Not applicable")
            "Exempt" -> (0.0, "Exempt")

        Returns:
            (rate as float or None, notes)
        """
        rate_text = rate_text.strip()

        # Check for NA
        if rate_text in ("NA", "N/A", "Not applicable", "-"):
            return (None, "Not applicable")

        # Check for exempt/exempted
        if "exempt" in rate_text.lower():
            return (0.0, "Exempted")

        # Check for "subject to normal rate"
        if "subject to the normal" in rate_text.lower():
            if "CIT" in rate_text or "corporate" in rate_text.lower():
                return (None, "Subject to corporate income tax rate")
            else:
                return (None, "Subject to personal income tax rate")

        # Try to extract numeric rate(s)
        numbers = re.findall(r'\b(\d+(?:\.\d+)?)\b', rate_text)

        if not numbers:
            # No numbers found - return note
            return (None, rate_text[:100] if rate_text else "")

        # If multiple numbers (e.g., "10 or 20"), take the highest
        rates = [float(n) for n in numbers]
        max_rate = max(rates)

        # Convert percentage to decimal
        rate_decimal = max_rate / 100.0

        # Create note if multiple rates or complex text
        notes = ""
        if len(rates) > 1:
            notes = f"Variable rate: {rate_text[:80]}"
        elif len(rate_text) > 10:
            # Long text, keep as note
            notes = rate_text[:100]

        return (rate_decimal, notes)

    async def get_country_rate(self, country_code: str) -> Optional[Dict]:
        """
        Get CGT rate for a specific country

        Returns:
            {
                'country_code': 'FR',
                'cgt_rate': 0.30,
                'notes': '...',
                'source': 'PwC',
                'year': 2025
            }
        """
        all_rates = await self.get_all_cgt_rates()

        for rate_data in all_rates:
            if rate_data['country_code'] == country_code.upper():
                return rate_data

        return None

    async def test_connection(self) -> Dict:
        """Test PwC scraper connectivity"""
        try:
            response = await self.client.get(self.CGT_CHART_URL)

            if response.status_code == 200:
                # Try parsing
                rates = await self.get_all_cgt_rates()
                return {
                    'status': 'success',
                    'countries_found': len(rates),
                    'message': f'PwC scraper working - {len(rates)} countries available'
                }
            else:
                return {
                    'status': 'error',
                    'message': f'HTTP {response.status_code}'
                }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }


async def fetch_pwc_rate(country_code: str) -> Optional[Dict]:
    """Convenience function to fetch single country"""
    scraper = PwCScraper()
    try:
        return await scraper.get_country_rate(country_code)
    finally:
        await scraper.close()
