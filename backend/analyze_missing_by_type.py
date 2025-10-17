from app.database import SessionLocal
from app.models.defi_protocol import DeFiTransaction
import json
from collections import defaultdict

db = SessionLocal()

# Get all transactions from audit 40
txs = db.query(DeFiTransaction).filter(
    DeFiTransaction.audit_id == 40
).all()

print(f"=== ANALYSIS OF MISSING TOKENS BY TYPE ===\n")

# Count missing tokens by transaction type
missing_by_type = defaultdict(int)

for tx in txs:
    tx_type = tx.transaction_type.value if tx.transaction_type else "unknown"

    # Check if any token is missing
    has_missing = False
    if not tx.token_in or tx.token_in in ["?", "..."]:
        has_missing = True
    if not tx.token_out or tx.token_out in ["?", "..."]:
        has_missing = True

    if has_missing:
        missing_by_type[tx_type] += 1

print("Missing tokens by transaction type:")
for tx_type, count in sorted(missing_by_type.items(), key=lambda x: x[1], reverse=True):
    print(f"  {tx_type}: {count}")

print(f"\n{'='*60}")
print("BREAKDOWN: claim_rewards transactions")
print(f"{'='*60}\n")

claim_rewards_txs = db.query(DeFiTransaction).filter(
    DeFiTransaction.audit_id == 40,
    DeFiTransaction.transaction_type == "claim_rewards"
).all()

claim_missing_in = 0
claim_missing_out = 0
claim_both_ok = 0

for tx in claim_rewards_txs:
    if not tx.token_in or tx.token_in in ["?", "..."]:
        claim_missing_in += 1
    if not tx.token_out or tx.token_out in ["?", "..."]:
        claim_missing_out += 1
    if tx.token_in and tx.token_out and tx.token_in not in ["?", "..."] and tx.token_out not in ["?", "..."]:
        claim_both_ok += 1

print(f"Total claim_rewards transactions: {len(claim_rewards_txs)}")
print(f"  Missing token_in: {claim_missing_in}")
print(f"  Missing token_out: {claim_missing_out}")
print(f"  Both tokens OK: {claim_both_ok}")

print(f"\n{'='*60}")
print("BREAKDOWN: deposit transactions")
print(f"{'='*60}\n")

deposit_txs = db.query(DeFiTransaction).filter(
    DeFiTransaction.audit_id == 40,
    DeFiTransaction.transaction_type == "deposit"
).all()

deposit_missing_in = 0
deposit_missing_out = 0
deposit_both_ok = 0

for tx in deposit_txs:
    if not tx.token_in or tx.token_in in ["?", "..."]:
        deposit_missing_in += 1
    if not tx.token_out or tx.token_out in ["?", "..."]:
        deposit_missing_out += 1
    if tx.token_in and tx.token_out and tx.token_in not in ["?", "..."] and tx.token_out not in ["?", "..."]:
        deposit_both_ok += 1

print(f"Total deposit transactions: {len(deposit_txs)}")
print(f"  Missing token_in: {deposit_missing_in}")
print(f"  Missing token_out: {deposit_missing_out}")
print(f"  Both tokens OK: {deposit_both_ok}")

db.close()
