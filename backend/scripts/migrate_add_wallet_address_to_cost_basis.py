#!/usr/bin/env python3
"""
Add wallet_address column to cost_basis_lots table

Fixes Bug #7: Enables proper wallet-specific cost basis tracking
"""
from app.database import SessionLocal
from sqlalchemy import text

def migrate_add_wallet_address():
    db = SessionLocal()

    try:
        print("🔄 Adding wallet_address column to cost_basis_lots...")

        # Check if column already exists
        check_query = text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'cost_basis_lots'
            AND column_name = 'wallet_address'
        """)
        result = db.execute(check_query).fetchone()

        if result:
            print("✅ wallet_address column already exists")
            return True

        # Add wallet_address column
        alter_query = text("""
            ALTER TABLE cost_basis_lots
            ADD COLUMN wallet_address VARCHAR(255)
        """)
        db.execute(alter_query)
        db.commit()
        print("✅ Added wallet_address column")

        # Create index on wallet_address
        index_query = text("""
            CREATE INDEX IF NOT EXISTS ix_cost_basis_lots_wallet_address
            ON cost_basis_lots (wallet_address)
        """)
        db.execute(index_query)
        db.commit()
        print("✅ Created index on wallet_address")

        # Verify
        verify_query = text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'cost_basis_lots'
            AND column_name = 'wallet_address'
        """)
        result = db.execute(verify_query).fetchone()

        if result:
            print(f"\n📊 Verification:")
            print(f"  Column: {result[0]}")
            print(f"  Type: {result[1]}")
            print(f"  Nullable: {result[2]}")

        print("\n✅ Migration complete!")
        return True

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = migrate_add_wallet_address()
    exit(0 if success else 1)
