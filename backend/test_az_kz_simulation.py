"""
Test AZ -> KZ simulation (user's example)
"""
import asyncio
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.services.tax_simulator import TaxSimulator
from app.services.tax_data_sources.aggregator import TaxDataAggregator


async def test():
    db = SessionLocal()

    try:
        # Update both countries first
        aggregator = TaxDataAggregator(db)

        print("📊 Updating AZ and KZ data...\n")

        az_result = await aggregator.update_database("AZ")
        print(f"AZ update: {az_result.get('action', 'no update')}")
        if az_result.get('sources'):
            print(f"   Sources: {az_result['sources']}")

        kz_result = await aggregator.update_database("KZ")
        print(f"KZ update: {kz_result.get('action', 'no update')}")
        if kz_result.get('sources'):
            print(f"   Sources: {kz_result['sources']}")

        await aggregator.close()

        # Run simulation
        print("\n🧪 Simulating AZ -> KZ...")
        simulator = TaxSimulator(db)

        result, explanation = await simulator.simulate_residency_change(
            user_id=1,
            current_country="AZ",
            target_country="KZ",
            short_term_gains=10000,
            long_term_gains=0
        )

        print(f"\n✅ Decision: {explanation.decision}")
        print(f"   Savings: ${result.savings:,.0f}")
        print(f"   Confidence: {explanation.confidence:.0%}")

        print(f"\n📖 Rules Applied:")
        for rule in explanation.rules_applied:
            print(f"   {rule['country']}: {rule['rule']}")
            print(f"   Source: {rule['source']}")

        print(f"\n🔗 Official Sources:")
        for i, source in enumerate(explanation.sources, 1):
            print(f"   {i}. {source}")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(test())
