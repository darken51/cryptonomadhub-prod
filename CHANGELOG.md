# Changelog - NomadCrypto Hub

Historique détaillé de toutes les actions de développement.

---

## Session 1 - 2025-01-11 23:50 UTC - Setup Initial

### Fichiers de Documentation
- [CREATE] `JOURNAL_DEVELOPPEMENT.md` - Historique global projet
- [CREATE] `CHANGELOG.md` - Ce fichier (actions détaillées)

### Actions Complétées
- [GIT] Initialisation repository
- [CREATE] `.gitignore` - Exclusions Python/Node/Docker
- [CREATE] Structure complète (backend/frontend/scripts/docs/snapshots)
- [CREATE] `docker-compose.yml` - Services backend/frontend/postgres/redis/ollama/celery
- [CREATE] `.env.example` - Variables environnement complètes (Paddle/Airwallex)

- [CREATE] Backend models : User, Regulation, RegulationHistory, Simulation, FeatureFlag, AuditLog
- [CREATE] `backend/app/main.py` - FastAPI app avec health check
- [CREATE] `backend/app/config.py` - Settings avec Paddle/Airwallex
- [CREATE] `backend/app/database.py` - SQLAlchemy setup
- [GIT] Commit initial "feat: initial project structure" (commit 914ba99)

### Prochaines Actions
- Création backend services et routers
- Création frontend (Next.js 15)
- Scripts (seed, install, backup)

---

**Format des entrées** :
```
[ACTION] fichier - Description
```

**Actions possibles** :
- CREATE : Nouveau fichier
- MODIFY : Modification fichier existant
- DELETE : Suppression fichier
- MOVE : Déplacement/rename
- GIT : Action git (commit, branch, etc.)
