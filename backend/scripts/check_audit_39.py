#!/usr/bin/env python3
"""
Check audit #39 to see why it has transactions but no cost basis lots
"""
from app.database import SessionLocal
from app.models.cost_basis import CostBasisLot
from app.models.defi_protocol import DeFiAudit, DeFiTransaction

db = SessionLocal()

try:
    # Get audit #39
    audit = db.query(DeFiAudit).filter(DeFiAudit.id == 39).first()

    if not audit:
        print("❌ Audit #39 not found")
        exit(1)

    print(f"📊 Audit #{audit.id}")
    print(f"   User ID: {audit.user_id}")
    print(f"   Status: {audit.status}")
    print(f"   Period: {audit.start_date.date()} to {audit.end_date.date()}")
    print(f"   Transactions: {audit.total_transactions}")
    print(f"   Created: {audit.created_at}")
    print(f"   Completed: {audit.completed_at}")
    print()

    # Check transactions for this audit
    transactions = db.query(DeFiTransaction).filter(
        DeFiTransaction.audit_id == 39
    ).all()

    print(f"🔍 Found {len(transactions)} transactions in database")
    print()

    if transactions:
        print("Sample transactions:")
        for tx in transactions[:5]:
            print(f"  - {tx.transaction_type.value if tx.transaction_type else 'unknown'}: ", end="")
            if tx.token_in:
                print(f"{tx.amount_in} {tx.token_in} → ", end="")
            if tx.token_out:
                print(f"{tx.amount_out} {tx.token_out}", end="")
            print(f" (${tx.usd_value_in or tx.usd_value_out or 0:.2f})")
        print()

    # Check if lots exist for this audit
    lots_with_audit_id = db.query(CostBasisLot).filter(
        CostBasisLot.source_audit_id == 39
    ).all()

    print(f"💼 Lots with source_audit_id=39: {len(lots_with_audit_id)}")

    # Check if lots exist for this user (might be created without audit_id)
    all_user_lots = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == audit.user_id
    ).all()

    print(f"💼 Total lots for user #{audit.user_id}: {len(all_user_lots)}")

    if all_user_lots:
        # Check how many have audit_id vs NULL
        with_audit = sum(1 for lot in all_user_lots if lot.source_audit_id is not None)
        without_audit = sum(1 for lot in all_user_lots if lot.source_audit_id is None)
        print(f"   - With audit_id: {with_audit}")
        print(f"   - Without audit_id (manual/old): {without_audit}")

    print()
    print("🔎 Diagnosis:")
    if transactions and not lots_with_audit_id:
        print("   ⚠️  This audit has transactions but NO lots were created!")
        print("   Possible causes:")
        print("   1. Audit was created BEFORE the auto-lot-creation feature")
        print("   2. All transactions were sells/sends (no acquisitions)")
        print("   3. Error during lot creation (check logs)")
        print()
        print("💡 Solution: Re-run this audit to create lots with audit_id")
    elif not transactions:
        print("   ❌ No transactions found in database (data issue)")
    else:
        print("   ✅ Lots exist for this audit")

finally:
    db.close()
