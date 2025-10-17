from app.database import SessionLocal
from app.models.defi_protocol import DeFiTransaction
import json

db = SessionLocal()

# Get one DEPOSIT transaction with unknown token
tx = db.query(DeFiTransaction).filter(
    DeFiTransaction.audit_id == 40,
    DeFiTransaction.transaction_type == "deposit"
).filter(
    (DeFiTransaction.token_in == "?") |
    (DeFiTransaction.token_in == "...") |
    (DeFiTransaction.token_in == None) |
    (DeFiTransaction.token_in == "")
).first()

if tx:
    print(f"Transaction with unknown token:")
    print(f"  TX Hash: {tx.tx_hash}")
    print(f"  Chain: {tx.chain}")
    print(f"  Type: {tx.transaction_type.value if tx.transaction_type else 'None'}")
    print(f"  Token IN: {tx.token_in}")
    print(f"  Amount IN: {tx.amount_in}")
    print(f"  Token OUT: {tx.token_out}")
    print(f"  Amount OUT: {tx.amount_out}")
    print(f"\nRaw data:")
    if tx.raw_data:
        raw = tx.raw_data if isinstance(tx.raw_data, dict) else json.loads(tx.raw_data)
        for key, value in raw.items():
            print(f"  {key}: {value}")
else:
    print("No transaction found with '?' token")

db.close()
