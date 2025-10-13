"""
Regulation History Service - Versioning et snapshots des régulations fiscales

Ce service gère:
- Création de snapshots historiques lors des mises à jour
- Récupération de régulations valides à une date donnée
- Audit trail pour compliance légale
"""

from datetime import datetime, date
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.regulation import Regulation, RegulationHistory


class RegulationHistoryService:
    """Service pour gérer l'historique des régulations"""

    @staticmethod
    async def snapshot_current_to_history(
        country_code: str,
        db: Session,
        verified_by: Optional[int] = None,
        change_notes: Optional[str] = None
    ) -> Optional[RegulationHistory]:
        """
        Crée un snapshot historique de la régulation actuelle

        Args:
            country_code: Code du pays (ex: FR, US)
            db: Session SQLAlchemy
            verified_by: ID de l'utilisateur qui a vérifié
            change_notes: Notes sur les changements

        Returns:
            RegulationHistory: Le snapshot créé, ou None si pas de régulation
        """

        # Récupérer la régulation actuelle
        current = db.query(Regulation).filter_by(country_code=country_code).first()

        if not current:
            return None

        # Fermer le snapshot précédent (si existe)
        previous_snapshot = db.query(RegulationHistory).filter(
            and_(
                RegulationHistory.country_code == country_code,
                RegulationHistory.valid_to == None
            )
        ).first()

        if previous_snapshot:
            # Marquer comme terminé
            previous_snapshot.valid_to = date.today()
            db.commit()

        # Créer nouveau snapshot
        history = RegulationHistory(
            country_code=country_code,

            # Copier tous les taux
            cgt_short_rate=current.cgt_short_rate,
            cgt_long_rate=current.cgt_long_rate,
            staking_rate=current.staking_rate,
            mining_rate=current.mining_rate,

            # Copier les règles
            nft_treatment=current.nft_treatment,
            residency_rule=current.residency_rule,
            treaty_countries=current.treaty_countries,
            defi_reporting=current.defi_reporting,
            penalties_max=current.penalties_max,
            notes=current.notes,

            # Metadata
            valid_from=date.today(),
            valid_to=None,  # Ouvert (version actuelle)
            created_at=datetime.utcnow(),
            source_url=current.source_url,
            verified_by=verified_by,
            change_notes=change_notes or "Automatic snapshot from regulations table"
        )

        db.add(history)
        db.commit()
        db.refresh(history)

        return history

    @staticmethod
    async def get_regulation_at_date(
        country_code: str,
        target_date: date,
        db: Session
    ) -> Optional[RegulationHistory]:
        """
        Récupère la régulation valide à une date spécifique

        Args:
            country_code: Code du pays
            target_date: Date cible
            db: Session SQLAlchemy

        Returns:
            RegulationHistory: La régulation valide à cette date
        """

        regulation = db.query(RegulationHistory).filter(
            and_(
                RegulationHistory.country_code == country_code,
                RegulationHistory.valid_from <= target_date,
                or_(
                    RegulationHistory.valid_to > target_date,
                    RegulationHistory.valid_to == None  # Version actuelle
                )
            )
        ).first()

        return regulation

    @staticmethod
    async def get_regulation_history(
        country_code: str,
        db: Session,
        limit: int = 10
    ) -> list[RegulationHistory]:
        """
        Récupère l'historique complet des régulations d'un pays

        Args:
            country_code: Code du pays
            db: Session SQLAlchemy
            limit: Nombre maximum de versions à retourner

        Returns:
            Liste de RegulationHistory, du plus récent au plus ancien
        """

        history = db.query(RegulationHistory).filter(
            RegulationHistory.country_code == country_code
        ).order_by(
            RegulationHistory.valid_from.desc()
        ).limit(limit).all()

        return history

    @staticmethod
    def create_regulation_snapshot_dict(regulation: Regulation) -> dict:
        """
        Crée un dictionnaire snapshot d'une régulation pour stockage JSONB

        Utilisé pour sauvegarder les regulations dans les simulations

        Args:
            regulation: L'objet Regulation

        Returns:
            dict: Snapshot complet de la régulation
        """

        return {
            "country_code": regulation.country_code,
            "country_name": regulation.country_name,

            # Taux
            "cgt_short_rate": float(regulation.cgt_short_rate) if regulation.cgt_short_rate else None,
            "cgt_long_rate": float(regulation.cgt_long_rate) if regulation.cgt_long_rate else None,
            "crypto_short_rate": float(regulation.crypto_short_rate) if regulation.crypto_short_rate else None,
            "crypto_long_rate": float(regulation.crypto_long_rate) if regulation.crypto_long_rate else None,
            "staking_rate": float(regulation.staking_rate) if regulation.staking_rate else None,
            "mining_rate": float(regulation.mining_rate) if regulation.mining_rate else None,

            # Règles
            "nft_treatment": regulation.nft_treatment,
            "residency_rule": regulation.residency_rule,
            "treaty_countries": regulation.treaty_countries,
            "defi_reporting": regulation.defi_reporting,
            "penalties_max": regulation.penalties_max,
            "notes": regulation.notes,

            # Metadata
            "updated_at": regulation.updated_at.isoformat() if regulation.updated_at else None,
            "source_url": regulation.source_url
        }
