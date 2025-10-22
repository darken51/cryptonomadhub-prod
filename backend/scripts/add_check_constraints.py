"""
Script to add CHECK constraints to cost_basis_lots table
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text


def add_constraints():
    """Add CHECK constraints to cost_basis_lots"""
    print("🔒 Adding CHECK constraints to cost_basis tables...")
    print("=" * 60)

    with engine.connect() as conn:
        try:
            # Check if constraints already exist
            print("\n📊 Checking existing constraints...")

            result = conn.execute(text("""
                SELECT constraint_name
                FROM information_schema.table_constraints
                WHERE table_name = 'cost_basis_lots'
                AND constraint_type = 'CHECK';
            """))

            existing_constraints = [row[0] for row in result]
            print(f"   Existing constraints: {existing_constraints if existing_constraints else 'None'}")

            # Add remaining_amount >= 0 constraint
            if 'check_remaining_positive' not in existing_constraints:
                print("\n➕ Adding check_remaining_positive constraint...")
                conn.execute(text("""
                    ALTER TABLE cost_basis_lots
                    ADD CONSTRAINT check_remaining_positive
                    CHECK (remaining_amount >= 0);
                """))
                conn.commit()
                print("   ✅ Added check_remaining_positive")
            else:
                print("\n   ⏭️  check_remaining_positive already exists")

            # Add disposed_amount >= 0 constraint
            if 'check_disposed_positive' not in existing_constraints:
                print("\n➕ Adding check_disposed_positive constraint...")
                conn.execute(text("""
                    ALTER TABLE cost_basis_lots
                    ADD CONSTRAINT check_disposed_positive
                    CHECK (disposed_amount >= 0);
                """))
                conn.commit()
                print("   ✅ Added check_disposed_positive")
            else:
                print("\n   ⏭️  check_disposed_positive already exists")

            # Add original_amount > 0 constraint
            if 'check_original_positive' not in existing_constraints:
                print("\n➕ Adding check_original_positive constraint...")
                conn.execute(text("""
                    ALTER TABLE cost_basis_lots
                    ADD CONSTRAINT check_original_positive
                    CHECK (original_amount > 0);
                """))
                conn.commit()
                print("   ✅ Added check_original_positive")
            else:
                print("\n   ⏭️  check_original_positive already exists")

            # Add acquisition_price_usd >= 0 constraint
            if 'check_price_positive' not in existing_constraints:
                print("\n➕ Adding check_price_positive constraint...")
                conn.execute(text("""
                    ALTER TABLE cost_basis_lots
                    ADD CONSTRAINT check_price_positive
                    CHECK (acquisition_price_usd >= 0);
                """))
                conn.commit()
                print("   ✅ Added check_price_positive")
            else:
                print("\n   ⏭️  check_price_positive already exists")

            # Verify all constraints
            print("\n" + "=" * 60)
            print("📊 Verifying all constraints...")

            result = conn.execute(text("""
                SELECT
                    constraint_name,
                    check_clause
                FROM information_schema.check_constraints
                WHERE constraint_name IN (
                    'check_remaining_positive',
                    'check_disposed_positive',
                    'check_original_positive',
                    'check_price_positive'
                )
                ORDER BY constraint_name;
            """))

            print("\n✅ Active CHECK constraints:")
            for row in result:
                print(f"   {row[0]}: {row[1]}")

            print("\n" + "=" * 60)
            print("✅ All constraints added successfully!")
            print("=" * 60)

        except Exception as e:
            print(f"\n❌ Failed to add constraints: {e}")
            conn.rollback()
            raise


if __name__ == "__main__":
    add_constraints()
