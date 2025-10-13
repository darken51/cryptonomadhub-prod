"""
Script to recalculate tax obligations for all transactions

Applies FIFO accounting to calculate capital gains/losses
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.defi_protocol import DeFiTransaction, DeFiAudit
from app.services.tax_calculator import TaxCalculator
from datetime import datetime

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://nomad:nomad123@postgres:5432/nomadcrypto")

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def recalculate_taxes_for_user(user_id: int):
    """Recalculate taxes for a specific user"""

    db = SessionLocal()
    tax_calc = TaxCalculator()

    try:
        # Get all transactions for user, ordered by timestamp (FIFO)
        transactions = db.query(DeFiTransaction).filter(
            DeFiTransaction.user_id == user_id
        ).order_by(DeFiTransaction.timestamp).all()

        print(f"Processing {len(transactions)} transactions for user {user_id}")

        for i, tx in enumerate(transactions):
            try:
                # Prepare transaction data
                tx_data = {
                    "transaction_type": tx.transaction_type.value if tx.transaction_type else "unknown",
                    "timestamp": tx.timestamp,
                    "token_in": tx.token_in,
                    "amount_in": float(tx.amount_in) if tx.amount_in else 0,
                    "token_out": tx.token_out,
                    "amount_out": float(tx.amount_out) if tx.amount_out else 0,
                    "usd_value_in": float(tx.usd_value_in) if tx.usd_value_in else 0,
                    "usd_value_out": float(tx.usd_value_out) if tx.usd_value_out else 0,
                    "gas_fee_usd": float(tx.gas_fee_usd) if tx.gas_fee_usd else 0,
                    "value": tx.raw_data.get("value", "0") if tx.raw_data else "0"
                }

                # Calculate tax implications
                tax_result = tax_calc.process_transaction(tx_data)

                # Update transaction
                tx.tax_category = tax_result.get("tax_category", "unknown")
                tx.gain_loss_usd = tax_result.get("gain_loss_usd")
                tx.holding_period_days = tax_result.get("holding_period_days")

                # Commit every 20 transactions
                if i % 20 == 0:
                    db.commit()
                    print(f"Progress: {i}/{len(transactions)} transactions processed")

            except Exception as e:
                print(f"Error processing transaction {tx.tx_hash}: {e}")
                continue

        # Final commit
        db.commit()

        # Get tax summary
        summary = tax_calc.get_summary()

        print(f"\n✅ Tax calculation complete!")
        print(f"  - Short-term gains: ${summary['short_term_gains']:.2f}")
        print(f"  - Long-term gains: ${summary['long_term_gains']:.2f}")
        print(f"  - Ordinary income: ${summary['ordinary_income']:.2f}")
        print(f"  - Total fees: ${summary['total_fees']:.2f}")

        # Update all audits for this user
        audits = db.query(DeFiAudit).filter(DeFiAudit.user_id == user_id).all()

        for audit in audits:
            # Recalculate audit statistics
            audit_txs = db.query(DeFiTransaction).filter(
                DeFiTransaction.audit_id == audit.id
            ).all()

            short_term = sum(
                tx.gain_loss_usd or 0
                for tx in audit_txs
                if tx.tax_category == "capital_gains" and (tx.holding_period_days or 0) < 365
            )
            long_term = sum(
                tx.gain_loss_usd or 0
                for tx in audit_txs
                if tx.tax_category == "capital_gains" and (tx.holding_period_days or 0) >= 365
            )
            income = sum(tx.gain_loss_usd or 0 for tx in audit_txs if tx.tax_category == "income")

            total_gains = sum(tx.gain_loss_usd or 0 for tx in audit_txs if (tx.gain_loss_usd or 0) > 0)
            total_losses = abs(sum(tx.gain_loss_usd or 0 for tx in audit_txs if (tx.gain_loss_usd or 0) < 0))

            audit.short_term_gains = short_term
            audit.long_term_gains = long_term
            audit.ordinary_income = income
            audit.total_gains_usd = total_gains
            audit.total_losses_usd = total_losses

        db.commit()
        print(f"\n✅ Updated {len(audits)} audits")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    user_id = int(sys.argv[1]) if len(sys.argv) > 1 else 13

    print(f"🔄 Recalculating taxes for user {user_id}...")
    recalculate_taxes_for_user(user_id)
