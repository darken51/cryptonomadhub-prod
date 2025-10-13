"""
Script to decode existing transactions using contract ABIs

Extracts token addresses, amounts, and operation details from transaction input data
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.defi_protocol import DeFiTransaction
from app.services.transaction_decoder import TransactionDecoder
from decimal import Decimal

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://nomad:nomad123@postgres:5432/nomadcrypto")

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def decode_existing_transactions(user_id: int = None):
    """Decode all transactions that don't have token data"""

    db = SessionLocal()
    decoder = TransactionDecoder()

    try:
        # Get transactions to decode
        query = db.query(DeFiTransaction)

        if user_id:
            query = query.filter(DeFiTransaction.user_id == user_id)

        # Only decode transactions without token data
        transactions = query.filter(
            DeFiTransaction.token_in == None
        ).all()

        print(f"Found {len(transactions)} transactions to decode")

        decoded_count = 0
        skipped_count = 0

        for i, tx in enumerate(transactions):
            try:
                # Get input data from raw_data
                raw_data = tx.raw_data

                # Input data can be nested in different ways
                input_data = None
                value = "0"

                if isinstance(raw_data, dict):
                    # Try direct access
                    input_data = raw_data.get("input")
                    value = raw_data.get("value", "0")

                    # If not found, try nested raw_data
                    if not input_data:
                        inner_raw = raw_data.get("raw_data", {})
                        if isinstance(inner_raw, dict):
                            input_data = inner_raw.get("input")
                            value = inner_raw.get("value", value)

                if not input_data or len(input_data) < 10:
                    skipped_count += 1
                    continue

                # Decode the transaction
                decoded = decoder.decode_transaction(input_data, value)

                if "error" in decoded:
                    # Unknown method signature - skip
                    skipped_count += 1
                    continue

                # Extract token and amount data
                operation = decoded.get("operation")

                if operation == "swap":
                    tx.token_in = decoded.get("token_in")
                    tx.token_out = decoded.get("token_out")
                    tx.amount_in = Decimal(str(decoded.get("amount_in", 0))) if decoded.get("amount_in") else None
                    tx.amount_out = Decimal(str(decoded.get("amount_out_min", 0))) if decoded.get("amount_out_min") else None

                    # Store token addresses in raw_data
                    if "token_in_address" in decoded:
                        if "decoded_data" not in tx.raw_data:
                            tx.raw_data["decoded_data"] = {}
                        tx.raw_data["decoded_data"]["token_in_address"] = decoded["token_in_address"]
                        tx.raw_data["decoded_data"]["token_out_address"] = decoded["token_out_address"]
                        tx.raw_data["decoded_data"]["path"] = decoded.get("path", [])

                    decoded_count += 1

                elif operation == "wrap":
                    # Wrapping ETH to WETH
                    tx.token_in = decoded.get("token_in", "ETH")
                    tx.token_out = decoded.get("token_out", "WETH")
                    tx.amount_in = Decimal(str(decoded.get("amount_in", 0))) if decoded.get("amount_in") else None
                    tx.amount_out = tx.amount_in  # 1:1 wrap

                    decoded_count += 1

                elif operation == "unwrap":
                    # Unwrapping WETH to ETH
                    tx.token_in = decoded.get("token_in", "WETH")
                    tx.token_out = decoded.get("token_out", "ETH")
                    tx.amount_in = Decimal(str(decoded.get("amount_in", 0))) if decoded.get("amount_in") else None
                    tx.amount_out = tx.amount_in  # 1:1 unwrap

                    decoded_count += 1

                elif operation == "stake":
                    # Staking tokens
                    tx.token_in = decoded.get("token_in")
                    tx.amount_in = Decimal(str(decoded.get("amount_in", 0))) if decoded.get("amount_in") else None
                    # For staking, token_out would be the staking receipt token (if any)

                    decoded_count += 1

                elif operation == "transfer":
                    # For ERC20 transfers, we know the token from the contract address
                    recipient = decoded.get("recipient")
                    amount = decoded.get("amount")

                    # The 'to' address is the contract (token) address
                    contract_address = tx.raw_data.get("to", "").lower()
                    token_symbol = decoder._get_token_symbol(contract_address)

                    tx.token_out = token_symbol
                    tx.amount_out = Decimal(str(amount)) if amount else None

                    decoded_count += 1

                elif operation == "approve":
                    # Approvals don't move tokens, just authorization
                    pass

                # Commit every 20 transactions
                if i % 20 == 0:
                    db.commit()
                    print(f"Progress: {i}/{len(transactions)} - Decoded: {decoded_count}, Skipped: {skipped_count}")

            except Exception as e:
                print(f"Error decoding transaction {tx.tx_hash}: {e}")
                continue

        # Final commit
        db.commit()

        print(f"\n✅ Decoding complete!")
        print(f"  - Decoded: {decoded_count} transactions")
        print(f"  - Skipped: {skipped_count} transactions")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    user_id = int(sys.argv[1]) if len(sys.argv) > 1 else None

    if user_id:
        print(f"🔄 Decoding transactions for user {user_id}...")
    else:
        print("🔄 Decoding all transactions...")

    decode_existing_transactions(user_id)
