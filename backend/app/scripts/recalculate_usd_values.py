"""
Script to recalculate USD values for existing transactions

This will update all transactions with historical prices from CoinGecko
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.defi_protocol import DeFiTransaction
from app.services.price_service import PriceService
from datetime import datetime
from decimal import Decimal
import json

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://nomad:nomad123@postgres:5432/nomadcrypto")

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def recalculate_transaction_values():
    """Recalculate USD values for all transactions"""

    db = SessionLocal()
    price_service = PriceService()

    try:
        # Get all transactions without USD values
        transactions = db.query(DeFiTransaction).filter(
            DeFiTransaction.usd_value_in == None
        ).all()

        print(f"Found {len(transactions)} transactions to update")

        updated_count = 0
        failed_count = 0

        for i, tx in enumerate(transactions):
            try:
                # Get native token for chain
                native_token = price_service.get_native_token(tx.chain)

                # Get value from raw_data (nested structure)
                raw_data = tx.raw_data
                value = raw_data.get("value", "0")

                # Gas data is in raw_data->raw_data (nested)
                inner_raw_data = raw_data.get("raw_data", {})
                gas_used = inner_raw_data.get("gasUsed")
                gas_price = inner_raw_data.get("gasPrice")

                # Calculate USD value
                if value and value != "0":
                    usd_value = price_service.wei_to_usd(
                        wei_amount=value,
                        token_symbol=native_token,
                        timestamp=tx.timestamp,
                        decimals=18
                    )

                    if usd_value:
                        tx.usd_value_in = float(usd_value)

                # Calculate gas fees in USD
                if gas_used and gas_price:
                    try:
                        total_gas_wei = str(int(gas_used) * int(gas_price))
                        gas_fee_usd = price_service.wei_to_usd(
                            wei_amount=total_gas_wei,
                            token_symbol=native_token,
                            timestamp=tx.timestamp,
                            decimals=18
                        )

                        if gas_fee_usd:
                            tx.gas_fee_usd = float(gas_fee_usd)
                    except Exception as e:
                        # Fallback: estimate gas fee
                        # Average gas price * gas used = total cost
                        # Then convert to USD
                        pass

                updated_count += 1

                # Commit every 10 transactions to avoid memory issues
                if i % 10 == 0:
                    db.commit()
                    print(f"Progress: {i}/{len(transactions)} transactions processed")

            except Exception as e:
                print(f"Error processing transaction {tx.tx_hash}: {e}")
                failed_count += 1
                continue

        # Final commit
        db.commit()

        print(f"\n✅ Update complete!")
        print(f"  - Updated: {updated_count} transactions")
        print(f"  - Failed: {failed_count} transactions")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()

    finally:
        price_service.close()
        db.close()


if __name__ == "__main__":
    print("🔄 Starting USD value recalculation...")
    recalculate_transaction_values()
