"""
KPMG Global Withholding Taxes Guide Scraper

Scrapes capital gains tax data from KPMG PDF guide
https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2025/global-withholding-taxes-guide-2024-kpmg.pdf

Coverage: 127 jurisdictions
"""

import httpx
import pdfplumber
import re
import io
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)


class KPMGScraper:
    """Scraper for KPMG Global Withholding Taxes Guide"""

    PDF_URL = "https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2025/global-withholding-taxes-guide-2024-kpmg.pdf"

    # Country name to ISO code mapping (top 50 countries)
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
        "Korea": "KR",
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
        "Malta": "MT",
        "Cyprus": "CY",
        "Iceland": "IS",
        "Thailand": "TH",
        "Malaysia": "MY",
        "Indonesia": "ID",
        "Philippines": "PH",
        "Vietnam": "VN",
        "United Arab Emirates": "AE",
        "Saudi Arabia": "SA",
        "Qatar": "QA",
        "Kuwait": "KW",
        "Bahrain": "BH",
        "Oman": "OM",
        "Egypt": "EG",
        "Morocco": "MA",
        "Nigeria": "NG",
        "Kenya": "KE",
        "Ghana": "GH",
        "Tanzania": "TZ",
        "Uganda": "UG",
        "Pakistan": "PK",
        "Bangladesh": "BD",
        "Sri Lanka": "LK",
        "Panama": "PA",
        "Costa Rica": "CR",
        "Uruguay": "UY",
        "Peru": "PE",
        "Venezuela": "VE",
        "Ecuador": "EC",
        "Bolivia": "BO",
        "Paraguay": "PY",
        "Puerto Rico": "PR",
        "Bermuda": "BM",
        "Cayman Islands": "KY",
        "British Virgin Islands": "VG",
        "Bahamas": "BS",
        "Barbados": "BB",
        "Jamaica": "JM",
        "Trinidad and Tobago": "TT",
        "Guernsey": "GG",
        "Jersey": "JE",
        "Isle of Man": "IM",
        "Monaco": "MC",
        "Liechtenstein": "LI",
        "Andorra": "AD",
        "San Marino": "SM",
        "Vatican City": "VA",
    }

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=60.0,
            headers={"User-Agent": "Mozilla/5.0 (compatible; NomadCryptoHub/1.0)"}
        )

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    async def download_pdf(self) -> Optional[bytes]:
        """Download KPMG PDF guide"""
        try:
            logger.info("Downloading KPMG PDF guide...")
            response = await self.client.get(self.PDF_URL)
            response.raise_for_status()

            logger.info(f"Downloaded {len(response.content) / 1024 / 1024:.2f} MB PDF")
            return response.content

        except Exception as e:
            logger.error(f"Error downloading KPMG PDF: {e}")
            return None

    def extract_country_data(self, pdf_bytes: bytes) -> List[Dict]:
        """
        Extract capital gains tax data from PDF

        Returns:
            List of {country_code, country_name, cgt_rate, year, source, notes}
        """
        try:
            results = []

            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                logger.info(f"Parsing PDF with {len(pdf.pages)} pages")

                for page_num, page in enumerate(pdf.pages):
                    text = page.extract_text()

                    if not text:
                        continue

                    # Look for country headers
                    # KPMG format typically has country name in bold/large font
                    # followed by tax information

                    lines = text.split('\n')

                    for i, line in enumerate(lines):
                        # Check if line is a country name
                        country_name = self._extract_country_name(line)

                        if country_name:
                            # Look ahead for capital gains information
                            context = '\n'.join(lines[i:min(i+20, len(lines))])

                            cgt_info = self._extract_cgt_rate(context)

                            if cgt_info:
                                country_code = self.COUNTRY_MAPPING.get(country_name)

                                if country_code:
                                    results.append({
                                        'country_code': country_code,
                                        'country_name': country_name,
                                        'cgt_rate': cgt_info['rate'],
                                        'year': 2024,
                                        'source': 'KPMG',
                                        'notes': cgt_info.get('notes', '')
                                    })

            logger.info(f"Extracted data for {len(results)} countries from KPMG")
            return results

        except Exception as e:
            logger.error(f"Error parsing KPMG PDF: {e}")
            return []

    def _extract_country_name(self, line: str) -> Optional[str]:
        """Extract country name if line contains one"""
        line = line.strip()

        # Check if line matches a known country
        for country_name in self.COUNTRY_MAPPING.keys():
            if country_name.lower() in line.lower() and len(line) < 50:
                return country_name

        return None

    def _extract_cgt_rate(self, text: str) -> Optional[Dict]:
        """
        Extract capital gains tax rate from text

        Returns: {'rate': float, 'notes': str}
        """
        text_lower = text.lower()

        # Look for capital gains keywords
        if 'capital gain' not in text_lower and 'capital tax' not in text_lower:
            return None

        # Common patterns:
        # "capital gains: 20%"
        # "capital gains tax rate of 25%"
        # "capital gains are taxed at 30%"

        patterns = [
            r'capital\s+gain[s]?\s+(?:tax\s+)?(?:rate\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*%',
            r'capital\s+gain[s]?\s+(?:are\s+)?taxed\s+at\s+(\d+(?:\.\d+)?)\s*%',
            r'(\d+(?:\.\d+)?)\s*%\s+(?:on\s+)?capital\s+gain',
        ]

        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                rate = float(match.group(1)) / 100

                # Extract notes (next 50 chars after match)
                start_pos = match.end()
                notes = text[start_pos:start_pos + 100].strip()

                return {
                    'rate': rate,
                    'notes': notes[:200]  # Limit notes length
                }

        # Check for exempt/zero tax
        if 'exempt' in text_lower or 'no tax' in text_lower or '0%' in text:
            return {
                'rate': 0.0,
                'notes': 'Exempt from capital gains tax'
            }

        return None

    async def get_all_countries(self) -> Dict[str, Dict]:
        """
        Get capital gains tax data for all countries

        Returns:
            {
                'US': {'cgt_rate': 0.20, 'year': 2024, ...},
                'FR': {'cgt_rate': 0.30, 'year': 2024, ...},
                ...
            }
        """
        try:
            # Download PDF
            pdf_bytes = await self.download_pdf()

            if not pdf_bytes:
                return {}

            # Extract data
            countries_list = self.extract_country_data(pdf_bytes)

            # Convert to dict
            countries_dict = {}
            for country in countries_list:
                countries_dict[country['country_code']] = country

            logger.info(f"KPMG scraper found {len(countries_dict)} countries")
            return countries_dict

        except Exception as e:
            logger.error(f"Error in KPMG get_all_countries: {e}")
            return {}

    async def get_country_rate(self, country_code: str) -> Optional[Dict]:
        """Get CGT rate for specific country"""
        all_countries = await self.get_all_countries()
        return all_countries.get(country_code.upper())

    async def test_connection(self) -> bool:
        """Test if KPMG PDF is accessible"""
        try:
            response = await self.client.head(self.PDF_URL, timeout=10.0)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"KPMG connection test failed: {e}")
            return False


# Helper function
async def fetch_kpmg_rate(country_code: str) -> Optional[Dict]:
    """Convenience function to fetch KPMG tax rate"""
    scraper = KPMGScraper()
    try:
        return await scraper.get_country_rate(country_code)
    finally:
        await scraper.close()
