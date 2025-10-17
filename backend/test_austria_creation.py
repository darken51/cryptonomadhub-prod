"""
Test creation of Austria which has Tax Foundation data
"""
import asyncio
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.services.tax_data_sources.aggregator import TaxDataAggregator
from app.models.regulation import Regulation


async def test():
    db = SessionLocal()

    try:
        # Temporarily delete Austria to test creation
        test_country = "AT"  # Austria - should have Tax Foundation data

        print(f"🗑️  Temporarily deleting {test_country} (Austria) for testing...")
        db.query(Regulation).filter(Regulation.country_code == test_country).delete()
        db.commit()

        # Verify it's gone
        exists = db.query(Regulation).filter(Regulation.country_code == test_country).first()
        if exists:
            print(f"   ❌ Failed to delete {test_country}")
            return
        else:
            print(f"   ✅ {test_country} deleted successfully")

        # Now try to scrape it - should auto-create
        print(f"\n📊 Fetching data for {test_country} (should auto-create with Tax Foundation data)...")
        aggregator = TaxDataAggregator(db)

        result = await aggregator.update_database(test_country)

        print(f"\n✅ Result:")
        print(f"   Success: {result['success']}")
        print(f"   Action: {result.get('action', 'N/A')}")
        print(f"   Is New: {result.get('is_new', False)}")
        print(f"   Sources: {result.get('sources', [])}")
        print(f"   Confidence: {result.get('confidence', 0):.2%}")
        print(f"   New Rate: {result.get('new_rate', 'N/A')}")

        if result.get('error'):
            print(f"   ❌ Error: {result['error']}")
        elif result.get('is_new'):
            print(f"   ✅ NEW COUNTRY AUTO-CREATED!")
        else:
            print(f"   ℹ️  Country was updated")

        # Verify in database
        print(f"\n🔍 Verification in database:")
        country = db.query(Regulation).filter(Regulation.country_code == test_country).first()

        if country:
            print(f"   ✅ Found: {country.country_name}")
            print(f"   CGT Short: {float(country.cgt_short_rate) * 100:.1f}%")
            print(f"   CGT Long: {float(country.cgt_long_rate) * 100:.1f}%")
            print(f"   Crypto Short: {float(country.crypto_short_rate) * 100:.1f}% " if country.crypto_short_rate else "   Crypto Short: None")
            print(f"   Crypto Long: {float(country.crypto_long_rate) * 100:.1f}% " if country.crypto_long_rate else "   Crypto Long: None")
            print(f"   Data Sources: {country.data_sources}")
            print(f"   Data Quality: {country.data_quality}")
            print(f"   Notes: {country.notes[:150] if country.notes else 'None'}...")
        else:
            print(f"   ❌ NOT FOUND - auto-creation failed!")

        await aggregator.close()

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(test())
