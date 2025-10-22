#!/usr/bin/env python3
"""
Script de développement pour vérifier manuellement un utilisateur.

Usage:
    python verify_user_dev.py test@example.com
"""

import sys
from app.database import SessionLocal
from app.models.user import User


def verify_user(email: str):
    """Vérifier un utilisateur en développement"""
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"❌ Utilisateur {email} non trouvé")
            return False

        if user.email_verified:
            print(f"✅ Utilisateur {email} déjà vérifié")
            return True

        # Vérifier l'utilisateur
        user.email_verified = True
        user.verification_token = None
        user.verification_token_expires = None
        db.commit()

        print(f"✅ Utilisateur {email} vérifié avec succès!")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Vérifié: {user.email_verified}")

        return True

    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_user_dev.py <email>")
        print("Example: python verify_user_dev.py test@example.com")
        sys.exit(1)

    email = sys.argv[1]
    success = verify_user(email)
    sys.exit(0 if success else 1)
