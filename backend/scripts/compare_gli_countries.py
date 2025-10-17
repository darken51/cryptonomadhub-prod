#!/usr/bin/env python3
"""
Compare GLI countries with our database to find missing ones
"""

from app.database import SessionLocal
from app.models.regulation import Regulation

# Countries found on GLI (manually filtered from scrape results)
GLI_COUNTRIES = {
    'australia': 'Australia',
    'austria': 'Austria',
    'bermuda': 'Bermuda',
    'brazil': 'Brazil',
    'british-virgin-islands': 'British Virgin Islands',
    'canada': 'Canada',
    'cayman-islands': 'Cayman Islands',
    'cyprus': 'Cyprus',
    'estonia': 'Estonia',
    'france': 'France',
    'gibraltar': 'Gibraltar',
    'greece': 'Greece',
    'hong-kong': 'Hong Kong',
    'india': 'India',
    'ireland': 'Ireland',
    'israel': 'Israel',
    'italy': 'Italy',
    'japan': 'Japan',
    'liechtenstein': 'Liechtenstein',
    'lithuania': 'Lithuania',
    'mexico': 'Mexico',
    'netherlands': 'Netherlands',
    'norway': 'Norway',
    'poland': 'Poland',
    'portugal': 'Portugal',
    'romania': 'Romania',
    'singapore': 'Singapore',
    'spain': 'Spain',
    'sweden': 'Sweden',
    'switzerland': 'Switzerland',
    'taiwan': 'Taiwan',
    'thailand': 'Thailand',
    'turkey-turkiye': 'Turkey',
    'usa': 'United States',
    'united-kingdom': 'United Kingdom'
}

# Map GLI country names to our database country names
GLI_TO_DB_MAP = {
    'British Virgin Islands': 'British Virgin Islands',
    'Hong Kong': 'Hong Kong',
    'Turkey': 'Turkey',
    'United States': 'United States',
    'United Kingdom': 'United Kingdom',
}


def main():
    print("🔍 COMPARING GLI COUNTRIES WITH DATABASE")
    print("=" * 80)

    db = SessionLocal()

    try:
        # Get all countries from our DB
        db_countries = db.query(Regulation).all()
        db_country_names = {c.country_name for c in db_countries}
        db_country_codes = {c.country_code for c in db_countries}

        print(f"\n📊 Our Database: {len(db_countries)} countries")
        print(f"📊 GLI Website: {len(GLI_COUNTRIES)} countries\n")

        # Find countries we have that GLI also has
        matched = []
        for slug, gli_name in GLI_COUNTRIES.items():
            # Try direct match
            found = False
            for db_country in db_countries:
                if (db_country.country_name.lower() == gli_name.lower() or
                    gli_name.lower() in db_country.country_name.lower() or
                    db_country.country_name.lower() in gli_name.lower()):
                    matched.append((gli_name, db_country.country_name, db_country.country_code))
                    found = True
                    break

        print("=" * 80)
        print(f"✅ COUNTRIES ON GLI THAT WE HAVE ({len(matched)}):")
        print("=" * 80)
        for gli, db, code in sorted(matched, key=lambda x: x[0]):
            print(f"  {code:3} | {db:40} -> {gli}")

        # Find countries on GLI that we DON'T have
        matched_gli_names = {m[0].lower() for m in matched}
        missing = []
        for slug, gli_name in GLI_COUNTRIES.items():
            if gli_name.lower() not in matched_gli_names:
                missing.append((slug, gli_name))

        print("\n" + "=" * 80)
        print(f"❌ COUNTRIES ON GLI THAT WE'RE MISSING ({len(missing)}):")
        print("=" * 80)
        if missing:
            for slug, name in sorted(missing, key=lambda x: x[1]):
                gli_url = f"https://www.globallegalinsights.com/practice-areas/blockchain-cryptocurrency-laws-and-regulations/{slug}/"
                print(f"  • {name:40} -> {gli_url}")
        else:
            print("  🎉 None! We have all GLI countries!")

        print("\n" + "=" * 80)
        print("📝 SUMMARY")
        print("=" * 80)
        print(f"  Our DB: {len(db_countries)} countries")
        print(f"  GLI: {len(GLI_COUNTRIES)} countries")
        print(f"  Matched: {len(matched)}")
        print(f"  Missing from our DB: {len(missing)}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
