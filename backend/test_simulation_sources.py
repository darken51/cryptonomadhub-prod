"""
Test script to verify simulation sources are correct
"""
import asyncio
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.services.tax_simulator import TaxSimulator


async def test_simulation():
    db = SessionLocal()
    simulator = TaxSimulator(db)

    try:
        print("🧪 Testing simulation with France (FR) data...")
        print("=" * 60)

        # First, update FR data to ensure it has sources
        from app.services.tax_data_sources.aggregator import TaxDataAggregator
        aggregator = TaxDataAggregator(db)

        print("\n1️⃣ Updating France data...")
        fr_result = await aggregator.update_database("FR")
        print(f"   FR Sources: {fr_result.get('sources', [])}")
        await aggregator.close()

        # Now test simulation
        print("\n2️⃣ Running simulation US -> FR...")
        result, explanation = await simulator.simulate_residency_change(
            user_id=1,  # Dummy user
            current_country="US",
            target_country="FR",
            short_term_gains=10000,
            long_term_gains=5000
        )

        print(f"\n✅ Simulation Result:")
        print(f"   Decision: {explanation.decision}")
        print(f"   Confidence: {explanation.confidence:.2%}")

        print(f"\n📖 Rules Applied:")
        for rule in explanation.rules_applied:
            print(f"   - {rule['country']}: {rule['rule']}")
            print(f"     Source: {rule['source']}")

        print(f"\n🔗 Official Sources ({len(explanation.sources)} sources):")
        for i, source in enumerate(explanation.sources, 1):
            print(f"   {i}. {source}")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(test_simulation())
