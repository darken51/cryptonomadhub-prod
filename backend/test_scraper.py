"""
Test script to verify data sources are being saved correctly
"""
import asyncio
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.services.tax_data_sources.aggregator import TaxDataAggregator


async def test_scraper():
    db = SessionLocal()
    aggregator = TaxDataAggregator(db)

    try:
        print("🔍 Testing scraper for France (FR)...")
        result = await aggregator.update_database("FR")

        print(f"\n✅ Result: {result}")

        if result['success']:
            print(f"   Action: {result.get('action')}")
            print(f"   Sources: {result.get('sources', [])}")
            print(f"   Confidence: {result.get('confidence')}")

        # Verify database
        from app.models.regulation import Regulation
        fr_reg = db.query(Regulation).filter(Regulation.country_code == "FR").first()
        if fr_reg:
            print(f"\n📊 Database verification:")
            print(f"   Country: {fr_reg.country_name}")
            print(f"   CGT Rate: {fr_reg.cgt_short_rate}")
            print(f"   Data Sources: {fr_reg.data_sources}")
            print(f"   Data Quality: {fr_reg.data_quality}")
            print(f"   Notes: {fr_reg.notes[:200] if fr_reg.notes else 'None'}...")

    finally:
        await aggregator.close()
        db.close()


if __name__ == "__main__":
    asyncio.run(test_scraper())
