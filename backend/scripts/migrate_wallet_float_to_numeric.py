#!/usr/bin/env python3
"""
Migrate Float to Numeric(20,10) in wallet-related tables

Fixes Bug #2 and #3: Precision issues with Float in financial calculations
"""
from app.database import SessionLocal
from sqlalchemy import text

def migrate_wallet_tables():
    db = SessionLocal()

    try:
        print("🔄 Starting Float→Numeric migration for wallet tables...")

        # Bug #2: InterWalletTransfer
        print("\n📦 Migrating inter_wallet_transfers...")

        columns_to_migrate = {
            'inter_wallet_transfers': ['amount', 'confidence_score'],
            'consolidated_balances': [
                'total_amount',
                'total_value_usd',
                'avg_cost_basis',
                'unrealized_gain_loss',
                'unrealized_gain_loss_percent'
            ]
        }

        for table, columns in columns_to_migrate.items():
            print(f"\n  Table: {table}")
            for column in columns:
                try:
                    # Check if column exists and is Float
                    check_query = text(f"""
                        SELECT data_type
                        FROM information_schema.columns
                        WHERE table_name = '{table}'
                        AND column_name = '{column}'
                    """)
                    result = db.execute(check_query).fetchone()

                    if result and 'double' in str(result[0]).lower():
                        print(f"    Migrating {column}...")

                        # Alter column type
                        alter_query = text(f"""
                            ALTER TABLE {table}
                            ALTER COLUMN {column} TYPE NUMERIC(20, 10)
                            USING {column}::NUMERIC(20, 10)
                        """)
                        db.execute(alter_query)
                        db.commit()
                        print(f"      ✅ {column}: Float → Numeric(20,10)")
                    else:
                        print(f"      ⏭️  {column}: Already migrated or not Float")

                except Exception as e:
                    if "does not exist" in str(e):
                        print(f"      ⏭️  {column}: Column doesn't exist")
                    else:
                        print(f"      ❌ {column}: {e}")
                        db.rollback()

        print("\n✅ Migration complete!")
        print("\n📊 Verification:")

        # Verify migrations
        for table in columns_to_migrate.keys():
            verify_query = text(f"""
                SELECT column_name, data_type, numeric_precision, numeric_scale
                FROM information_schema.columns
                WHERE table_name = '{table}'
                AND data_type = 'numeric'
                ORDER BY column_name
            """)
            results = db.execute(verify_query).fetchall()

            if results:
                print(f"\n  {table}:")
                for row in results:
                    print(f"    {row[0]}: NUMERIC({row[2]},{row[3]})")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

    return True


if __name__ == "__main__":
    success = migrate_wallet_tables()
    exit(0 if success else 1)
