#!/usr/bin/env python3
"""
Scrape all countries from Global Legal Insights blockchain page
"""

import requests
from bs4 import BeautifulSoup
import re

GLI_URL = "https://www.globallegalinsights.com/practice-areas/blockchain-cryptocurrency-laws-and-regulations"


def scrape_gli_countries():
    """Scrape the list of countries from GLI"""
    print("🔍 Scraping Global Legal Insights for available countries...")
    print(f"URL: {GLI_URL}\n")

    try:
        response = requests.get(GLI_URL, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Find all country links (they typically have a specific pattern)
        countries = set()

        # Method 1: Find links in the blockchain/cryptocurrency section
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')

            # Check if it's a country page
            if '/blockchain-cryptocurrency-laws-and-regulations/' in href:
                # Extract country slug from URL
                match = re.search(r'/blockchain-cryptocurrency-laws-and-regulations/([^/]+)/?$', href)
                if match:
                    country_slug = match.group(1)
                    country_name = link.get_text(strip=True)

                    # Skip if it's not a valid country name
                    if country_name and len(country_name) > 2 and country_name != 'Blockchain & Cryptocurrency Laws and Regulations':
                        countries.add((country_slug, country_name))

        # Sort countries by name
        sorted_countries = sorted(countries, key=lambda x: x[1])

        print(f"✅ Found {len(sorted_countries)} countries on GLI:\n")
        print("=" * 80)

        for slug, name in sorted_countries:
            print(f"  • {name:40} ({slug})")

        print("\n" + "=" * 80)
        print(f"\n📊 Total countries: {len(sorted_countries)}")

        return sorted_countries

    except Exception as e:
        print(f"❌ Error scraping GLI: {e}")
        return []


if __name__ == "__main__":
    scrape_gli_countries()
