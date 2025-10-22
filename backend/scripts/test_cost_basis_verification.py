"""
Test de vérification Cost Basis en base de données
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.cost_basis import CostBasisLot, CostBasisDisposal
from sqlalchemy import inspect, text


def test_cost_basis_verification():
    """Vérification Cost Basis en DB"""

    db = SessionLocal()

    try:
        print("=" * 70)
        print(" TEST 9: Vérification Cost Basis".center(70))
        print("=" * 70)

        # Compter les lots
        total_lots = db.query(CostBasisLot).count()
        print(f"\nℹ️  Total lots: {total_lots}")

        # Compter les disposals
        total_disposals = db.query(CostBasisDisposal).count()
        print(f"ℹ️  Total disposals: {total_disposals}")

        # Vérifier les lots récents
        recent_lots = db.query(CostBasisLot).order_by(
            CostBasisLot.created_at.desc()
        ).limit(5).all()

        print(f"\n📦 Lots récents:")
        for lot in recent_lots:
            print(f"  • {lot.token}: {lot.original_amount} @ ${lot.acquisition_price_usd}")

        # Vérifier les types de colonnes (doivent être Numeric)
        inspector = inspect(db.bind)
        columns = inspector.get_columns('cost_basis_lots')

        print(f"\n🔢 Types de colonnes:")
        all_numeric = True
        for col in columns:
            if col['name'] in ['acquisition_price_usd', 'original_amount', 'remaining_amount', 'disposed_amount']:
                col_type = str(col['type'])
                is_numeric = 'NUMERIC' in col_type.upper()
                emoji = "✅" if is_numeric else "❌"
                print(f"  {emoji} {col['name']}: {col_type}")
                if not is_numeric:
                    all_numeric = False

        # Vérifier les contraintes CHECK
        result = db.execute(text("""
            SELECT constraint_name, check_clause
            FROM information_schema.check_constraints
            WHERE constraint_name LIKE 'check_%'
            ORDER BY constraint_name;
        """))

        print(f"\n🔒 Contraintes CHECK:")
        constraints = list(result)
        if constraints:
            for row in constraints:
                print(f"  ✅ {row[0]}: {row[1]}")
            print(f"\n✅ {len(constraints)} contraintes actives")
        else:
            print("  ⚠️  Aucune contrainte CHECK trouvée")

        # Vérifier qu'il n'y a plus de lots invalides
        invalid_lots = db.query(CostBasisLot).filter(
            CostBasisLot.acquisition_price_usd == 0
        ).count()

        print(f"\n🧹 Vérification nettoyage:")
        if invalid_lots == 0:
            print(f"  ✅ Aucun lot avec prix=0")
        else:
            print(f"  ❌ {invalid_lots} lots avec prix=0 trouvés!")

        # Vérifier les disposals avec tx_hash
        disposals_with_hash = db.query(CostBasisDisposal).filter(
            CostBasisDisposal.disposal_tx_hash != None
        ).count()

        print(f"\n🔗 Traçabilité:")
        print(f"  ℹ️  Disposals avec tx_hash: {disposals_with_hash}/{total_disposals}")

        # Résumé
        print("\n" + "=" * 70)
        if all_numeric and invalid_lots == 0 and len(constraints) >= 4:
            print("✅ VERIFICATION COST BASIS: TOUS LES TESTS PASSENT")
            return True
        else:
            print("⚠️  VERIFICATION COST BASIS: QUELQUES PROBLEMES DETECTES")
            return False

    except Exception as e:
        print(f"\n❌ Erreur vérification: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = test_cost_basis_verification()
    sys.exit(0 if success else 1)
