#!/usr/bin/env python3
"""
Reprocess an existing audit to create cost basis lots with source_audit_id

This script is useful for audits created BEFORE the auto-lot-creation feature
"""
import asyncio
import sys
from app.database import SessionLocal
from app.models.defi_protocol import DeFiAudit, DeFiTransaction
from app.services.defi_audit_service import DeFiAuditService

async def reprocess_audit(audit_id: int):
    """Reprocess an audit to create missing cost basis lots"""
    db = SessionLocal()

    try:
        # Get audit
        audit = db.query(DeFiAudit).filter(DeFiAudit.id == audit_id).first()

        if not audit:
            print(f"❌ Audit #{audit_id} not found")
            return False

        print(f"📊 Reprocessing Audit #{audit_id}")
        print(f"   User: {audit.user_id}")
        print(f"   Period: {audit.start_date.date()} to {audit.end_date.date()}")
        print(f"   Status: {audit.status}")
        print()

        # Get transactions for this audit
        transactions = db.query(DeFiTransaction).filter(
            DeFiTransaction.audit_id == audit_id
        ).all()

        print(f"🔍 Found {len(transactions)} transactions")

        if not transactions:
            print("⚠️  No transactions to process")
            return False

        # Initialize service
        service = DeFiAuditService(db)

        # Process each transaction to create lots
        created_count = 0
        skipped_count = 0

        for i, tx in enumerate(transactions, 1):
            print(f"\n[{i}/{len(transactions)}] Processing {tx.transaction_type.value if tx.transaction_type else 'unknown'}...")

            try:
                # Prepare transaction data
                tx_data = {
                    "tx_hash": tx.tx_hash,
                    "timestamp": tx.timestamp,
                    "chain": tx.chain,
                    "transaction_type": tx.transaction_type.value if tx.transaction_type else "unknown",
                    "token_in": tx.token_in,
                    "amount_in": float(tx.amount_in) if tx.amount_in else None,
                    "usd_value_in": float(tx.usd_value_in) if tx.usd_value_in else None,
                    "token_out": tx.token_out,
                    "amount_out": float(tx.amount_out) if tx.amount_out else None,
                    "usd_value_out": float(tx.usd_value_out) if tx.usd_value_out else None,
                }

                # Get wallet address (try to extract from tx or use default)
                wallet_address = "unknown"  # TODO: Store wallet in audit table

                # Create lots for token_in (acquisitions)
                if tx_data.get("token_in") and tx_data.get("amount_in") and tx_data.get("usd_value_in"):
                    if tx_data["amount_in"] > 0 and tx_data["usd_value_in"] > 0:
                        await service._create_acquisition_lot(
                            user_id=audit.user_id,
                            token=tx_data["token_in"],
                            chain=tx_data["chain"],
                            amount=tx_data["amount_in"],
                            price_usd=tx_data["usd_value_in"] / tx_data["amount_in"],
                            acquisition_date=tx_data["timestamp"],
                            transaction_type=tx_data["transaction_type"],
                            tx_hash=tx_data["tx_hash"],
                            wallet_address=wallet_address,
                            audit_id=audit_id  # ← KEY: Set audit_id!
                        )
                        print(f"  ✅ Created lot for {tx_data['amount_in']} {tx_data['token_in']}")
                        created_count += 1

                # Create lots for token_out (rewards, airdrops)
                if tx_data.get("token_out") and tx_data.get("amount_out") and tx_data.get("usd_value_out"):
                    is_pure_acquisition = not tx_data.get("token_in") or tx_data.get("amount_in", 0) == 0
                    is_swap = tx_data.get("token_in") and tx_data.get("token_in") != tx_data.get("token_out")

                    if (is_pure_acquisition or is_swap) and tx_data["amount_out"] > 0 and tx_data["usd_value_out"] > 0:
                        await service._create_acquisition_lot(
                            user_id=audit.user_id,
                            token=tx_data["token_out"],
                            chain=tx_data["chain"],
                            amount=tx_data["amount_out"],
                            price_usd=tx_data["usd_value_out"] / tx_data["amount_out"],
                            acquisition_date=tx_data["timestamp"],
                            transaction_type=tx_data["transaction_type"],
                            tx_hash=tx_data["tx_hash"],
                            wallet_address=wallet_address,
                            audit_id=audit_id  # ← KEY: Set audit_id!
                        )
                        print(f"  ✅ Created lot for {tx_data['amount_out']} {tx_data['token_out']}")
                        created_count += 1

                if created_count == 0:
                    print(f"  ⏭️  Skipped (no acquisitions)")
                    skipped_count += 1

            except Exception as e:
                print(f"  ❌ Error: {e}")
                import traceback
                traceback.print_exc()
                continue

        print(f"\n✅ Reprocessing complete!")
        print(f"   Created: {created_count} lots")
        print(f"   Skipped: {skipped_count} transactions")

        return True

    except Exception as e:
        print(f"\n❌ Reprocessing failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python reprocess_audit_create_lots.py <audit_id>")
        print("Example: python reprocess_audit_create_lots.py 39")
        exit(1)

    audit_id = int(sys.argv[1])
    success = asyncio.run(reprocess_audit(audit_id))
    exit(0 if success else 1)
