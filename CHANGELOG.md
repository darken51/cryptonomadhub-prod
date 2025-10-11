# Changelog - NomadCrypto Hub

Historique détaillé de toutes les actions de développement.

---

## Session 1 - 2025-01-11 23:50 UTC - Setup Initial

### Fichiers de Documentation
- [CREATE] `JOURNAL_DEVELOPPEMENT.md` - Historique global projet
- [CREATE] `CHANGELOG.md` - Ce fichier (actions détaillées)

### Infrastructure & Configuration
- [GIT] Initialisation repository
- [CREATE] `.gitignore` - Exclusions Python/Node/Docker
- [CREATE] Structure complète (backend/frontend/scripts/docs/snapshots)
- [CREATE] `docker-compose.yml` - Services backend/frontend/postgres/redis/ollama/celery
- [CREATE] `.env.example` - Variables environnement complètes (Paddle/Airwallex)
- [GIT] Commit "feat: initial project structure" (914ba99)

### Backend Core
- [CREATE] Models : User, Regulation, RegulationHistory, Simulation, FeatureFlag, AuditLog
- [CREATE] `backend/app/main.py` - FastAPI app avec health check
- [CREATE] `backend/app/config.py` - Settings avec Paddle/Airwallex
- [CREATE] `backend/app/database.py` - SQLAlchemy setup
- [CREATE] `backend/app/utils/security.py` - JWT + bcrypt

### Backend Services
- [CREATE] `backend/app/services/tax_simulator.py` - TaxSimulator avec Explain Decision
- [CREATE] `backend/app/services/paddle_handler.py` - PaddleHandler (webhook signature)
- [CREATE] `backend/app/services/feature_flags.py` - FeatureFlagService (A/B testing)

### Backend Routers
- [CREATE] `backend/app/routers/auth.py` - Register, login, JWT
- [CREATE] `backend/app/routers/simulations.py` - POST /residency, GET /history
- [CREATE] `backend/app/routers/paddle_webhook.py` - POST /webhook (Paddle events)
- [GIT] Commit "feat: backend core - models, services, routers" (446f8a5)

### Scripts
- [CREATE] `scripts/seed-regulations.py` - 10 pays MVP avec données 2025 officielles
- [CREATE] `scripts/install.sh` - Installation automatisée (Docker, migrations, seed, Ollama)
- [CREATE] `scripts/backup.sh` - Backup PostgreSQL avec compression (rétention 30 jours)
- [GIT] Commit "feat: add installation and backup scripts" (7608d65)

### Prochaines Actions
- Création frontend (Next.js 15)
- Tests d'intégration backend
- Migrations Alembic

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
