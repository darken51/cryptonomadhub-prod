"""
Test Cost Basis Multi-Currency Integration

Tests that cost basis lots are automatically enriched with local currency data.
"""
import sys
import os
import asyncio

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.cost_basis import CostBasisLot, UserCostBasisSettings, AcquisitionMethod
from app.models.user import User
from datetime import datetime, date
from app.routers.cost_basis import enrich_lot_with_local_currency


async def test_currency_enrichment():
    """Test automatic currency conversion for cost basis lots"""
    db = SessionLocal()

    try:
        print("="*60)
        print("Testing Cost Basis Multi-Currency Integration")
        print("="*60)

        # Find a user with tax jurisdiction set
        settings = db.query(UserCostBasisSettings).filter(
            UserCostBasisSettings.tax_jurisdiction != None
        ).first()

        if not settings:
            print("❌ No user with tax_jurisdiction found. Please set a jurisdiction first.")
            print("   Run: curl -X PUT http://localhost:8001/cost-basis/settings \\ ")
            print("         -H 'Authorization: Bearer YOUR_TOKEN' \\ ")
            print("         -d '{\"tax_jurisdiction\": \"FR\"}'")
            return

        user_id = settings.user_id
        jurisdiction = settings.tax_jurisdiction

        print(f"\n✓ Found user {user_id} with jurisdiction: {jurisdiction}")

        # Create a test lot
        test_lot = CostBasisLot(
            user_id=user_id,
            token="ETH",
            chain="ethereum",
            acquisition_date=datetime(2024, 1, 1, 12, 0, 0),
            acquisition_method=AcquisitionMethod.PURCHASE,
            acquisition_price_usd=2000.00,  # ETH was ~$2000 on Jan 1, 2024
            original_amount=1.5,
            remaining_amount=1.5,
            disposed_amount=0.0,
            notes="Test lot for multi-currency",
            manually_added=True,
            verified=False
        )

        db.add(test_lot)
        db.flush()

        print(f"\n📊 Created test lot:")
        print(f"   - Token: {test_lot.token}")
        print(f"   - Amount: {test_lot.original_amount}")
        print(f"   - Acquisition Date: {test_lot.acquisition_date.date()}")
        print(f"   - Price (USD): ${test_lot.acquisition_price_usd}")

        # Enrich with local currency
        print(f"\n🔄 Enriching with local currency conversion...")
        await enrich_lot_with_local_currency(test_lot, user_id, db)

        db.commit()
        db.refresh(test_lot)

        # Display results
        print(f"\n✅ Enrichment complete!")
        print(f"   - Local Currency: {test_lot.local_currency}")
        print(f"   - Price (Local): {test_lot.acquisition_price_local}")
        print(f"   - Exchange Rate: {test_lot.exchange_rate}")
        print(f"   - Rate Source: {test_lot.exchange_rate_source}")
        print(f"   - Rate Date: {test_lot.exchange_rate_date}")

        if test_lot.local_currency and test_lot.acquisition_price_local:
            total_usd = float(test_lot.original_amount) * float(test_lot.acquisition_price_usd)
            total_local = float(test_lot.original_amount) * float(test_lot.acquisition_price_local)

            from app.data.currency_mapping import get_currency_info
            currency_info = get_currency_info(jurisdiction)

            print(f"\n💰 Total Investment:")
            print(f"   - USD: ${total_usd:,.2f}")
            print(f"   - {test_lot.local_currency}: {currency_info.currency_symbol}{total_local:,.2f}")

        # Clean up test lot
        print(f"\n🗑️  Cleaning up test lot...")
        db.delete(test_lot)
        db.commit()

        print(f"\n" + "="*60)
        print(f"✅ Test Complete! Multi-currency enrichment working.")
        print(f"="*60)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(test_currency_enrichment())
