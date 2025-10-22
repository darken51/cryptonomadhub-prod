#!/usr/bin/env python3
"""
Script pour créer un utilisateur de développement déjà vérifié.

Usage:
    python create_dev_user.py
"""

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import hash_password
from sqlalchemy.exc import IntegrityError


def create_dev_user():
    """Créer un utilisateur de développement"""
    db = SessionLocal()

    email = "dev@test.com"
    password = "DevPassword123"

    try:
        # Vérifier si l'utilisateur existe déjà
        existing = db.query(User).filter(User.email == email).first()

        if existing:
            print(f"✅ Utilisateur {email} existe déjà")
            print(f"   Mise à jour du mot de passe et vérification...")

            # Mettre à jour
            existing.password_hash = hash_password(password)
            existing.email_verified = True
            existing.verification_token = None
            existing.verification_token_expires = None
            db.commit()

            print(f"✅ Utilisateur mis à jour!")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            return

        # Créer nouvel utilisateur
        new_user = User(
            email=email,
            password_hash=hash_password(password),
            email_verified=True,  # Déjà vérifié pour dev
            verification_token=None,
            verification_token_expires=None
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print(f"✅ Utilisateur de développement créé!")
        print(f"   ID: {new_user.id}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Vérifié: {new_user.email_verified}")
        print()
        print(f"🔐 Credentials pour se connecter:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")

    except IntegrityError as e:
        print(f"❌ Erreur d'intégrité: {e}")
        db.rollback()

    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    create_dev_user()
