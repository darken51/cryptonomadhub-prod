#!/usr/bin/env python3
"""
Debug script to check if audits created cost basis lots with source_audit_id
"""
from app.database import SessionLocal
from app.models.cost_basis import CostBasisLot
from app.models.defi_protocol import DeFiAudit

db = SessionLocal()

try:
    # Check audits
    audits = db.query(DeFiAudit).filter(DeFiAudit.status == 'completed').all()
    print(f'📊 Total completed audits: {len(audits)}')
    print()

    if audits:
        for audit in audits[:5]:
            print(f'Audit #{audit.id}:')
            print(f'  User: {audit.user_id}')
            print(f'  Period: {audit.start_date.date()} to {audit.end_date.date()}')
            print(f'  Transactions: {audit.total_transactions}')

            # Check if lots were created for this audit
            lots = db.query(CostBasisLot).filter(
                CostBasisLot.source_audit_id == audit.id
            ).all()
            print(f'  Cost Basis Lots created: {len(lots)}')

            if lots:
                total_value = 0
                for lot in lots[:5]:
                    value = float(lot.remaining_amount) * float(lot.acquisition_price_usd)
                    total_value += value
                    print(f'    - {lot.token}: {lot.remaining_amount:.4f} @ ${float(lot.acquisition_price_usd):.2f} (value: ${value:.2f})')
                if len(lots) > 5:
                    print(f'    ... and {len(lots) - 5} more lots')
                print(f'  Total value: ${total_value:.2f}')
            else:
                print('  ⚠️  No cost basis lots found for this audit!')
            print()
    else:
        print('❌ No completed audits found')

    # Check lots without audit_id (manual or old)
    manual_lots = db.query(CostBasisLot).filter(CostBasisLot.source_audit_id == None).all()
    print(f'\n📝 Manual/Old lots (no audit_id): {len(manual_lots)}')

    if manual_lots:
        print('\nSample manual lots:')
        for lot in manual_lots[:5]:
            print(f'  - {lot.token}: {lot.remaining_amount:.4f} @ ${float(lot.acquisition_price_usd):.2f}')

finally:
    db.close()
