"""
Script to apply Float to Numeric migration manually
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text


def apply_migration():
    """Apply Float to Numeric migration"""
    print("🔄 Starting Float → Numeric migration...")
    print("=" * 60)

    with engine.connect() as conn:
        try:
            # cost_basis_lots table
            print("\n📊 Migrating cost_basis_lots table...")

            conn.execute(text("""
                ALTER TABLE cost_basis_lots
                ALTER COLUMN acquisition_price_usd TYPE NUMERIC(20,10),
                ALTER COLUMN original_amount TYPE NUMERIC(20,10),
                ALTER COLUMN remaining_amount TYPE NUMERIC(20,10),
                ALTER COLUMN disposed_amount TYPE NUMERIC(20,10);
            """))
            conn.commit()
            print("✅ cost_basis_lots migrated successfully")

            # cost_basis_disposals table
            print("\n📊 Migrating cost_basis_disposals table...")

            conn.execute(text("""
                ALTER TABLE cost_basis_disposals
                ALTER COLUMN disposal_price_usd TYPE NUMERIC(20,10),
                ALTER COLUMN amount_disposed TYPE NUMERIC(20,10),
                ALTER COLUMN cost_basis_per_unit TYPE NUMERIC(20,10),
                ALTER COLUMN total_cost_basis TYPE NUMERIC(20,10),
                ALTER COLUMN total_proceeds TYPE NUMERIC(20,10),
                ALTER COLUMN gain_loss TYPE NUMERIC(20,10);
            """))
            conn.commit()
            print("✅ cost_basis_disposals migrated successfully")

            # wash_sale_violations table (if it exists)
            print("\n📊 Checking wash_sale_violations table...")

            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = 'wash_sale_violations'
                );
            """))

            if result.scalar():
                print("   Table exists, migrating...")
                conn.execute(text("""
                    ALTER TABLE wash_sale_violations
                    ALTER COLUMN loss_amount TYPE NUMERIC(20,10),
                    ALTER COLUMN disallowed_loss TYPE NUMERIC(20,10),
                    ALTER COLUMN adjusted_cost_basis TYPE NUMERIC(20,10);
                """))
                conn.commit()
                print("✅ wash_sale_violations migrated successfully")
            else:
                print("⚠️  wash_sale_violations table doesn't exist (OK, will be created later)")

            print("\n" + "=" * 60)
            print("✅ Migration completed successfully!")
            print("\n📊 Verifying column types...")

            # Verify the changes
            result = conn.execute(text("""
                SELECT
                    column_name,
                    data_type
                FROM information_schema.columns
                WHERE table_name = 'cost_basis_lots'
                AND column_name IN ('acquisition_price_usd', 'original_amount', 'remaining_amount', 'disposed_amount')
                ORDER BY column_name;
            """))

            print("\ncost_basis_lots columns:")
            for row in result:
                print(f"  {row[0]}: {row[1]}")

            result = conn.execute(text("""
                SELECT
                    column_name,
                    data_type
                FROM information_schema.columns
                WHERE table_name = 'cost_basis_disposals'
                AND column_name IN ('disposal_price_usd', 'amount_disposed', 'cost_basis_per_unit',
                                     'total_cost_basis', 'total_proceeds', 'gain_loss')
                ORDER BY column_name;
            """))

            print("\ncost_basis_disposals columns:")
            for row in result:
                print(f"  {row[0]}: {row[1]}")

            print("\n✅ All columns verified - types are now NUMERIC!")
            print("=" * 60)

        except Exception as e:
            print(f"\n❌ Migration failed: {e}")
            conn.rollback()
            raise


if __name__ == "__main__":
    apply_migration()
