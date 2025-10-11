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

### Prochaines Actions
- Création backend (models, routers, services)
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
