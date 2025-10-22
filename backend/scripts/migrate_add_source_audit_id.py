#!/usr/bin/env python3
"""
Add source_audit_id column to cost_basis_lots table

Enables tracking which DeFi audit created each cost basis lot.
This allows audit-scoped tax optimization analysis.
"""
from app.database import SessionLocal
from sqlalchemy import text

def migrate_add_source_audit_id():
    db = SessionLocal()

    try:
        print("🔄 Adding source_audit_id column to cost_basis_lots...")

        # Check if column already exists
        check_query = text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'cost_basis_lots'
            AND column_name = 'source_audit_id'
        """)
        result = db.execute(check_query).fetchone()

        if result:
            print("✅ source_audit_id column already exists")
            return True

        # Add source_audit_id column
        alter_query = text("""
            ALTER TABLE cost_basis_lots
            ADD COLUMN source_audit_id INTEGER
        """)
        db.execute(alter_query)
        db.commit()
        print("✅ Added source_audit_id column")

        # Create index on source_audit_id
        index_query = text("""
            CREATE INDEX IF NOT EXISTS ix_cost_basis_lots_source_audit_id
            ON cost_basis_lots (source_audit_id)
        """)
        db.execute(index_query)
        db.commit()
        print("✅ Created index on source_audit_id")

        # Add foreign key constraint
        try:
            fk_query = text("""
                ALTER TABLE cost_basis_lots
                ADD CONSTRAINT fk_cost_basis_lots_audit_id
                FOREIGN KEY (source_audit_id) REFERENCES defi_audits(id)
                ON DELETE SET NULL
            """)
            db.execute(fk_query)
            db.commit()
            print("✅ Added foreign key constraint to defi_audits")
        except Exception as e:
            print(f"⚠️  Foreign key constraint might already exist or table defi_audits not found: {e}")
            # Continue anyway - the column will still work

        # Verify
        verify_query = text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'cost_basis_lots'
            AND column_name = 'source_audit_id'
        """)
        result = db.execute(verify_query).fetchone()

        if result:
            print(f"\n📊 Verification:")
            print(f"  Column: {result[0]}")
            print(f"  Type: {result[1]}")
            print(f"  Nullable: {result[2]}")

        print("\n✅ Migration complete!")
        print("\n💡 Next steps:")
        print("  1. DeFi Audit service will now set source_audit_id when creating lots")
        print("  2. Tax Optimizer can filter by audit_id for audit-scoped analysis")
        print("  3. Existing lots (source_audit_id=NULL) will continue to work")

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
    success = migrate_add_source_audit_id()
    exit(0 if success else 1)
