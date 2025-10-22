"""
Populate currency data in regulations table from currency_mapping.py

This script updates all existing countries in the regulations table with their
corresponding currency information from the currency_mapping.
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.regulation import Regulation
from app.data.currency_mapping import JURISDICTION_CURRENCY_MAP, get_currency_info


def populate_currency_data():
    """Populate currency information for all countries in regulations table"""
    db = SessionLocal()

    try:
        # Get all regulations
        regulations = db.query(Regulation).all()

        updated_count = 0
        missing_count = 0

        print(f"Processing {len(regulations)} countries...")

        for regulation in regulations:
            country_code = regulation.country_code

            # Get currency info from mapping
            currency_info = get_currency_info(country_code)

            if currency_info:
                # Update regulation with currency data
                regulation.currency_code = currency_info.currency_code
                regulation.currency_name = currency_info.currency_name
                regulation.currency_symbol = currency_info.currency_symbol
                regulation.currency_tier = currency_info.tier
                regulation.uses_usd_directly = currency_info.uses_usd_directly
                regulation.recommended_exchange_source = currency_info.recommended_source

                updated_count += 1
                print(f"✓ {country_code} ({regulation.country_name}): {currency_info.currency_code} ({currency_info.currency_symbol})")
            else:
                missing_count += 1
                print(f"✗ {country_code} ({regulation.country_name}): No currency mapping found")

        # Commit all changes
        db.commit()

        print("\n" + "="*60)
        print(f"✅ Currency data population complete!")
        print(f"   - Updated: {updated_count} countries")
        print(f"   - Missing: {missing_count} countries")
        print("="*60)

    except Exception as e:
        print(f"❌ Error populating currency data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    populate_currency_data()
