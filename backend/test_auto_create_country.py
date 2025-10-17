"""
Test auto-creation of new countries
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
        # Check if NO (Norway) exists
        existing = db.query(Regulation).filter(Regulation.country_code == "NO").first()

        if existing:
            print(f"✅ Norway already exists: {existing.country_name}")
            print(f"   CGT Rate: {existing.cgt_short_rate}")
            print(f"   Sources: {existing.data_sources}")
            print(f"\n🧪 Testing UPDATE on existing country...")
        else:
            print(f"❌ Norway does NOT exist in database")
            print(f"🧪 Testing AUTO-CREATE for new country...")

        # Try to update/create NO
        aggregator = TaxDataAggregator(db)

        print(f"\n📊 Fetching data for Norway (NO)...")
        result = await aggregator.update_database("NO")

        print(f"\n✅ Result:")
        print(f"   Success: {result['success']}")
        print(f"   Action: {result.get('action', 'N/A')}")
        print(f"   Is New: {result.get('is_new', False)}")
        print(f"   Sources: {result.get('sources', [])}")
        print(f"   Confidence: {result.get('confidence', 0):.2%}")

        if result.get('error'):
            print(f"   Error: {result['error']}")

        # Verify in database
        print(f"\n🔍 Verification in database:")
        norway = db.query(Regulation).filter(Regulation.country_code == "NO").first()

        if norway:
            print(f"   ✅ Found: {norway.country_name}")
            print(f"   CGT Short: {norway.cgt_short_rate}")
            print(f"   CGT Long: {norway.cgt_long_rate}")
            print(f"   Crypto Short: {norway.crypto_short_rate}")
            print(f"   Crypto Long: {norway.crypto_long_rate}")
            print(f"   Data Sources: {norway.data_sources}")
            print(f"   Data Quality: {norway.data_quality}")
            print(f"   Updated: {norway.updated_at}")
        else:
            print(f"   ❌ NOT FOUND in database")

        await aggregator.close()

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(test())
