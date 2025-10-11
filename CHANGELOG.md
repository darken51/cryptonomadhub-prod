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

### Frontend Complete
- [CREATE] `frontend/app/layout.tsx` - Root layout avec AuthProvider et ToastProvider
- [CREATE] `frontend/app/globals.css` - TailwindCSS avec animations custom
- [CREATE] `frontend/app/page.tsx` - Landing page avec hero et features
- [CREATE] `frontend/app/auth/login/page.tsx` - Page de connexion
- [CREATE] `frontend/app/auth/register/page.tsx` - Inscription avec disclaimer modal obligatoire
- [CREATE] `frontend/app/dashboard/page.tsx` - Dashboard utilisateur avec stats
- [CREATE] `frontend/app/simulations/new/page.tsx` - Formulaire simulation + résultats
- [CREATE] `frontend/components/LegalDisclaimer.tsx` - 3 variants (compact, prominent, modal)
- [CREATE] `frontend/components/SimulationExplainer.tsx` - Explain Decision UI expandable
- [CREATE] `frontend/components/providers/AuthProvider.tsx` - Context Auth JWT
- [CREATE] `frontend/components/providers/ToastProvider.tsx` - Notifications toast
- [CREATE] `frontend/tailwind.config.ts` - Config TailwindCSS
- [CREATE] `frontend/tsconfig.json` - TypeScript config
- [CREATE] `frontend/next.config.js` - Next.js config
- [CREATE] `frontend/.env.example` - API URL
- [GIT] Commit "feat: complete frontend Next.js 15 application" (b7a2c73)

### MVP Complet ✅
**Backend**: Models, Services (TaxSimulator, PaddleHandler, FeatureFlags), Routers (Auth, Simulations, Paddle webhook)
**Frontend**: Next.js 15 App Router, Auth pages, Dashboard, Simulation UI, Explain Decision
**Scripts**: seed-regulations.py (10 pays), install.sh, backup.sh
**Compliance**: Legal disclaimers partout, Regulation History versioning, Audit logs

### Prochaines Actions (Post-MVP)
- Migrations Alembic (backend/alembic/)
- Tests d'intégration (pytest backend, Playwright frontend)
- Déploiement production (Fly.io/Railway/Render)
- Paddle webhooks testing
- Ollama integration pour AI suggestions
- API DeFi audit (Etherscan, BSCScan)

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
