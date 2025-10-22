"""
Script pour nettoyer les lots de cost basis invalides

Supprime les lots avec:
- Prix d'acquisition = 0
- Token = "..." (symbole non résolu)
- Token vide ou invalide
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.cost_basis import CostBasisLot
from sqlalchemy import or_


def cleanup_invalid_lots():
    """Nettoie les lots invalides"""
    db = SessionLocal()

    try:
        # Identifier les lots avec prix = 0
        invalid_price_lots = db.query(CostBasisLot).filter(
            CostBasisLot.acquisition_price_usd == 0
        ).all()

        # Identifier les lots avec token "..." ou invalide
        invalid_token_lots = db.query(CostBasisLot).filter(
            or_(
                CostBasisLot.token == "...",
                CostBasisLot.token.like("...%"),
                CostBasisLot.token == "",
                CostBasisLot.token.is_(None)
            )
        ).all()

        # Combiner les deux listes (éviter les doublons)
        all_invalid_lots = list(set(invalid_price_lots + invalid_token_lots))

        if not all_invalid_lots:
            print("✅ Aucun lot invalide trouvé!")
            return

        print(f"🔍 {len(all_invalid_lots)} lots invalides trouvés:\n")

        # Afficher les lots avant suppression
        for lot in all_invalid_lots:
            print(f"  Lot #{lot.id}:")
            print(f"    User ID: {lot.user_id}")
            print(f"    Token: {lot.token}")
            print(f"    Amount: {lot.original_amount}")
            print(f"    Price: ${lot.acquisition_price_usd}")
            print(f"    Date: {lot.acquisition_date}")
            print()

        # Demander confirmation
        confirm = input(f"❓ Supprimer ces {len(all_invalid_lots)} lots invalides? (yes/no): ")

        if confirm.lower() != 'yes':
            print("❌ Nettoyage annulé")
            return

        # Supprimer les lots
        deleted_count = 0
        for lot in all_invalid_lots:
            db.delete(lot)
            deleted_count += 1

        db.commit()

        print(f"\n✅ {deleted_count} lots invalides supprimés avec succès!")

        # Vérifier qu'il ne reste plus de lots invalides
        remaining_invalid = db.query(CostBasisLot).filter(
            or_(
                CostBasisLot.acquisition_price_usd == 0,
                CostBasisLot.token == "...",
                CostBasisLot.token.like("...%")
            )
        ).count()

        if remaining_invalid == 0:
            print("✅ Plus aucun lot invalide dans la base!")
        else:
            print(f"⚠️  Il reste encore {remaining_invalid} lots invalides")

    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🧹 Nettoyage des lots de cost basis invalides\n")
    print("=" * 60)
    cleanup_invalid_lots()
    print("=" * 60)
