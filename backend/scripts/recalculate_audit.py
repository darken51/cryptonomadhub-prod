"""
Recalculer un audit existant avec les corrections Cost Basis
"""
import sys
import os
import asyncio

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.defi_protocol import DeFiAudit, DeFiTransaction
from app.models.cost_basis import CostBasisLot
from app.services.defi_audit_service import DeFiAuditService


async def recalculate_audit(audit_id: int):
    """Recalculer l'audit avec les nouvelles règles Cost Basis"""
    db = SessionLocal()

    try:
        # Trouver l'audit
        audit = db.query(DeFiAudit).filter(DeFiAudit.id == audit_id).first()
        if not audit:
            print(f"❌ Audit {audit_id} non trouvé")
            return False

        print(f"\n🔄 Recalcul de l'audit #{audit_id}")
        print(f"   User: {audit.user_id}")
        print(f"   Transactions: {audit.total_transactions}")

        # Récupérer toutes les transactions
        transactions = db.query(DeFiTransaction).filter(
            DeFiTransaction.audit_id == audit_id
        ).all()

        print(f"\n📝 {len(transactions)} transactions à retraiter")

        # Créer service
        service = DeFiAuditService(db)

        # Pour chaque transaction, créer les lots Cost Basis manquants
        lots_created = 0
        for i, tx in enumerate(transactions, 1):
            print(f"\n  Transaction {i}/{len(transactions)}:")
            print(f"    Type: {tx.transaction_type}")
            print(f"    Token Out: {tx.token_out} ({tx.amount_out})")
            print(f"    USD Out: ${tx.usd_value_out}")

            # Créer lot pour token_out si nécessaire
            if tx.token_out and tx.amount_out and tx.usd_value_out:
                # Vérifier si lot existe déjà
                existing_lot = db.query(CostBasisLot).filter(
                    CostBasisLot.user_id == audit.user_id,
                    CostBasisLot.token == tx.token_out.upper(),
                    CostBasisLot.source_tx_hash == tx.tx_hash
                ).first()

                if not existing_lot:
                    try:
                        await service._create_acquisition_lot(
                            user_id=audit.user_id,
                            token=tx.token_out,
                            chain=tx.chain,
                            amount=float(tx.amount_out),
                            price_usd=float(tx.usd_value_out) / float(tx.amount_out) if tx.amount_out > 0 else 0,
                            acquisition_date=tx.timestamp,
                            transaction_type=tx.transaction_type.value if tx.transaction_type else "unknown",
                            tx_hash=tx.tx_hash
                        )
                        print(f"    ✅ Lot créé pour {tx.amount_out} {tx.token_out}")
                        lots_created += 1
                    except Exception as e:
                        print(f"    ❌ Erreur création lot: {e}")
                else:
                    print(f"    ⏭️  Lot existe déjà")

        # Recalculer le summary
        print(f"\n📊 Recalcul du summary...")
        summary = service._calculate_summary(transactions)

        # Mettre à jour l'audit
        audit.total_volume_usd = summary["total_volume_usd"]
        audit.total_gains_usd = summary["total_gains_usd"]
        audit.total_losses_usd = summary["total_losses_usd"]
        audit.total_fees_usd = summary["total_fees_usd"]
        audit.short_term_gains = summary["short_term_gains"]
        audit.long_term_gains = summary["long_term_gains"]
        audit.ordinary_income = summary["ordinary_income"]

        db.commit()

        print(f"\n✅ Audit recalculé avec succès!")
        print(f"\n📈 Résultats:")
        print(f"   Volume: ${audit.total_volume_usd:,.2f}")
        print(f"   Ordinary Income: ${audit.ordinary_income:,.2f}")
        print(f"   Lots créés: {lots_created}")

        return True

    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    audit_id = int(sys.argv[1]) if len(sys.argv) > 1 else 53

    print(f"🔄 Recalcul de l'audit #{audit_id}...")
    success = asyncio.run(recalculate_audit(audit_id))
    sys.exit(0 if success else 1)
