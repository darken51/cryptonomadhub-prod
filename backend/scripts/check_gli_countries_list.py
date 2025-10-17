#!/usr/bin/env python3
"""
Check if we have all the countries from the GLI list provided by user
"""

from app.database import SessionLocal
from app.models.regulation import Regulation

# Countries list from GLI (provided by user)
GLI_COUNTRIES_LIST = {
    'AD': 'Andorra',
    'AR': 'Argentina',
    'AU': 'Australia',
    'AT': 'Austria',
    'BE': 'Belgium',
    'BM': 'Bermuda',
    'BR': 'Brazil',
    'VG': 'British Virgin Islands',
    'BG': 'Bulgaria',
    'CA': 'Canada',
    'KY': 'Cayman Islands',
    'CL': 'Chile',
    'CN': 'China',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'EE': 'Estonia',
    'FI': 'Finland',
    'FR': 'France',
    'DE': 'Germany',
    'GH': 'Ghana',
    'GI': 'Gibraltar',
    'GR': 'Greece',
    'GG': 'Guernsey',
    'HK': 'Hong Kong',
    'HU': 'Hungary',
    'IN': 'India',
    'ID': 'Indonesia',
    'IE': 'Ireland',
    'IL': 'Israel',
    'IT': 'Italy',
    'JP': 'Japan',
    'JE': 'Jersey',
    'KR': 'South Korea',
    'KW': 'Kuwait',
    'LB': 'Lebanon',
    'LI': 'Liechtenstein',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MO': 'Macau',
    'MW': 'Malawi',
    'MY': 'Malaysia',
    'MT': 'Malta',
    'MU': 'Mauritius',
    'MX': 'Mexico',
    'MA': 'Morocco',
    'NL': 'Netherlands',
    'NG': 'Nigeria',
    'MK': 'North Macedonia',
    'NO': 'Norway',
    'PK': 'Pakistan',
    'PH': 'Philippines',
    'PL': 'Poland',
    'PT': 'Portugal',
    'RO': 'Romania',
    'SA': 'Saudi Arabia',
    'SG': 'Singapore',
    'ZA': 'South Africa',
    'ES': 'Spain',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'TW': 'Taiwan',
    'TH': 'Thailand',
    'TR': 'Turkey',
    'UA': 'Ukraine',
    'AE': 'United Arab Emirates',
    'GB': 'United Kingdom',
    'US': 'United States',
    'ZM': 'Zambia'
}


def main():
    print("🔍 CHECKING GLI COUNTRIES LIST")
    print("=" * 80)

    db = SessionLocal()

    try:
        # Get all countries from our DB
        db_countries = {c.country_code: c for c in db.query(Regulation).all()}

        print(f"\n📊 GLI Countries List: {len(GLI_COUNTRIES_LIST)} countries")
        print(f"📊 Our Database: {len(db_countries)} countries\n")

        # Check which countries we have and which we're missing
        found = []
        missing = []

        for code, name in sorted(GLI_COUNTRIES_LIST.items()):
            if code in db_countries:
                found.append((code, name, db_countries[code].country_name))
            else:
                missing.append((code, name))

        # Display found countries
        print("=" * 80)
        print(f"✅ COUNTRIES WE HAVE ({len(found)}):")
        print("=" * 80)
        for code, gli_name, db_name in found:
            match_indicator = "✓" if gli_name.lower() == db_name.lower() else "≈"
            print(f"  {code:3} | {match_indicator} | {gli_name:40} -> {db_name}")

        # Display missing countries
        if missing:
            print("\n" + "=" * 80)
            print(f"❌ COUNTRIES WE'RE MISSING ({len(missing)}):")
            print("=" * 80)
            for code, name in missing:
                print(f"  {code:3} | {name}")
        else:
            print("\n" + "=" * 80)
            print("🎉 We have ALL countries from the GLI list!")
            print("=" * 80)

        # Summary
        print("\n" + "=" * 80)
        print("📝 SUMMARY")
        print("=" * 80)
        print(f"  GLI Countries: {len(GLI_COUNTRIES_LIST)}")
        print(f"  Found in our DB: {len(found)} ({len(found)*100//len(GLI_COUNTRIES_LIST)}%)")
        print(f"  Missing: {len(missing)}")

        # Extra countries in our DB
        gli_codes = set(GLI_COUNTRIES_LIST.keys())
        our_codes = set(db_countries.keys())
        extra = our_codes - gli_codes
        print(f"  Extra countries in our DB: {len(extra)}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
