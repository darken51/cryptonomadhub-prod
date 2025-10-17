#!/usr/bin/env python3
"""
Fix broken URLs by replacing them with Global Legal Insights URLs when available
"""

import requests
from app.database import SessionLocal
from app.models.regulation import Regulation
from typing import Dict, Optional

# Countries with 404 errors from the verification report
BROKEN_404_COUNTRIES = {
    'FR': 'France',
    'JO': 'Jordan',
    'AT': 'Austria',
    'LT': 'Lithuania',
    'LI': 'Liechtenstein',
    'JE': 'Jersey',
    'IQ': 'Iraq',
    'CD': 'Congo (DRC)',
    'KY': 'Cayman Islands',
    'GI': 'Gibraltar',
    'BY': 'Belarus'
}

# Map country codes to their GLI URL format
# Format: https://www.globallegalinsights.com/practice-areas/blockchain-cryptocurrency-laws-and-regulations/{country}/
GLI_BASE = "https://www.globallegalinsights.com/practice-areas/blockchain-cryptocurrency-laws-and-regulations"

# Country name to URL slug mapping (some countries have different slugs)
COUNTRY_SLUG_MAP = {
    'FR': 'france',
    'JO': 'jordan',
    'AT': 'austria',
    'LT': 'lithuania',
    'LI': 'liechtenstein',
    'JE': 'jersey',
    'IQ': 'iraq',
    'CD': 'congo-drc',
    'KY': 'cayman-islands',
    'GI': 'gibraltar',
    'BY': 'belarus'
}


def check_gli_url_exists(country_slug: str) -> Optional[str]:
    """Check if Global Legal Insights has a page for this country"""
    url = f"{GLI_BASE}/{country_slug}/"

    try:
        response = requests.head(url, timeout=10, allow_redirects=True)
        if response.status_code == 200:
            print(f"  ✅ GLI page found: {url}")
            return url
        else:
            print(f"  ❌ GLI page not found (status {response.status_code})")
            return None
    except Exception as e:
        print(f"  ❌ Error checking GLI: {e}")
        return None


def update_country_source(db, country_code: str, new_url: str) -> bool:
    """Update the source URL for a country"""
    try:
        country = db.query(Regulation).filter(Regulation.country_code == country_code).first()
        if not country:
            print(f"  ⚠️  Country {country_code} not found in database")
            return False

        old_url = country.source_url
        country.source_url = new_url
        db.commit()

        print(f"  ✅ Updated {country_code}")
        print(f"     Old: {old_url[:80]}...")
        print(f"     New: {new_url}")
        return True

    except Exception as e:
        print(f"  ❌ Error updating {country_code}: {e}")
        db.rollback()
        return False


def main():
    print("🔧 FIXING BROKEN URLs WITH GLOBAL LEGAL INSIGHTS")
    print("=" * 80)

    db = SessionLocal()
    updated_count = 0
    not_found_count = 0

    try:
        for country_code, country_name in BROKEN_404_COUNTRIES.items():
            print(f"\n[{country_code}] {country_name}")

            # Get the country slug
            slug = COUNTRY_SLUG_MAP.get(country_code)
            if not slug:
                print(f"  ⚠️  No slug mapping found")
                not_found_count += 1
                continue

            # Check if GLI has this country
            gli_url = check_gli_url_exists(slug)

            if gli_url:
                # Update the database
                if update_country_source(db, country_code, gli_url):
                    updated_count += 1
            else:
                not_found_count += 1

        print("\n" + "=" * 80)
        print("📊 SUMMARY")
        print("=" * 80)
        print(f"✅ URLs updated: {updated_count}")
        print(f"❌ Not found on GLI: {not_found_count}")
        print(f"📝 Total processed: {len(BROKEN_404_COUNTRIES)}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
