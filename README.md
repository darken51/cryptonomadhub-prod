# NomadCrypto Hub

> **Plateforme SaaS mondiale pour optimisation fiscale crypto multi-juridictionnelle**

Assistant IA pour nomades digitaux et investisseurs crypto - Support 10+ pays avec simulations fiscales, audit DeFi temps réel, et génération de déclarations automatisées.

---

## 🎯 Statut Projet

- **Phase** : ✅ MVP COMPLET (Session 1)
- **Stack** : FastAPI + Next.js 15 + PostgreSQL + Ollama + Docker
- **Structure** : IBC Seychelles + Airwallex
- **Budget** : $2k-4k MVP
- **Commits** : 914ba99, 446f8a5, 7608d65, b7a2c73

---

## 📚 Documentation Complète

**IMPORTANT : Si Claude Code bug, lis ces fichiers pour reprendre le contexte :**

1. **[JOURNAL_DEVELOPPEMENT.md](JOURNAL_DEVELOPPEMENT.md)** - Historique global + prompt de reprise
2. **[CHANGELOG.md](CHANGELOG.md)** - Actions détaillées session par session
3. **[PLAN_COMPLET.md](PLAN_COMPLET.md)** - Architecture technique complète (2800 lignes)
4. **[CORRECTIFS_BLOQUANTS.md](CORRECTIFS_BLOQUANTS.md)** - Solutions Paddle, légal, compliance
5. **[SETUP_SEYCHELLES_AIRWALLEX.md](SETUP_SEYCHELLES_AIRWALLEX.md)** - Configuration IBC + banking
6. **[AMELIORATIONS_ROADMAP.md](AMELIORATIONS_ROADMAP.md)** - Features v1.1-v3.0

---

## 🚀 Quick Start

### Prérequis
- Docker & Docker Compose
- Git
- 8GB RAM minimum

### Installation

```bash
# Cloner le repo
cd /home/fred/cryptonomadhub

# Copier .env
cp .env.example .env
# ⚠️ Éditer .env avec tes vraies clés (Paddle, Airwallex)

# Lancer les services
docker-compose up -d

# Pull Ollama model
docker exec -it nomadcrypto-ollama ollama pull llama3.1:8b

# Vérifier
curl http://localhost:8000/health  # Backend
curl http://localhost:3000          # Frontend (quand créé)
```

### Accès
- **Backend API** : http://localhost:8000
- **API Docs** : http://localhost:8000/docs
- **Frontend** : http://localhost:3000
- **PostgreSQL** : localhost:5432
- **Redis** : localhost:6379

---

## 🏗️ Architecture

```
Client Browser
    ↓
Next.js 15 Frontend (port 3000)
    ↓ REST API
FastAPI Backend (port 8000)
    ↓
┌─────────┬─────────┬─────────┐
│PostgreSQL│  Redis │ Ollama  │
│  :5432  │  :6379 │ :11434  │
└─────────┴─────────┴─────────┘
```

### Services Docker
- **backend** : FastAPI + SQLAlchemy + Celery
- **frontend** : Next.js 15 (App Router) + TailwindCSS
- **postgres** : PostgreSQL 16 (données)
- **redis** : Cache + Celery queue
- **ollama** : Llama 3.1 8B (IA locale)
- **celery-worker** : Background tasks (audits DeFi)

---

## 📦 Fonctionnalités MVP

### v1.0 (✅ COMPLET)
- [x] Authentication (JWT + OAuth2)
- [x] Database models (User, Regulation, Simulation, FeatureFlags, AuditLog)
- [x] Regulations versioning (historique audit trail)
- [x] Simulateur résidence (10 pays : US, FR, PT, AE, AU, CA, DE, SG, GB, ES)
- [x] **Explain Decision** mode (transparence calculs)
- [x] Paddle payments integration (webhooks)
- [x] Disclaimers légaux renforcés (3 variants)
- [x] Feature flags (rollout graduel + A/B testing)
- [x] Frontend Next.js 15 complet (auth, dashboard, simulations)
- [x] Scripts installation et backup automatisés

### v1.1 (Post-MVP)
- [ ] Chat guidé conversationnel
- [ ] DeFi audit basique
- [ ] Multi-country comparison
- [ ] Export PDF reports

---

## 🔑 Variables d'Environnement Critiques

Voir `.env.example` pour liste complète. Essentiels :

```bash
# Database
DATABASE_URL=postgresql://nomad:password@localhost:5432/nomadcrypto

# Security
SECRET_KEY=your-super-secret-key-min-32-chars

# Paddle (Paiements - PAS Stripe car bloqué MU/SC)
PADDLE_VENDOR_ID=12345
PADDLE_AUTH_CODE=from_dashboard
PADDLE_WEBHOOK_SECRET=webhook_secret

# Airwallex (Banking - Payout destination)
AIRWALLEX_ACCOUNT_USD=your_account_number

# IBC Seychelles
COMPANY_NAME="Your IBC Legal Name"
COMPANY_NUMBER="Registration #"
```

---

## 🧪 Développement

### Structure Backend

```
backend/
├── app/
│   ├── main.py              # FastAPI app ✅
│   ├── config.py            # Settings (Paddle/Airwallex) ✅
│   ├── database.py          # SQLAlchemy setup ✅
│   ├── models/              # ✅ COMPLET
│   │   ├── user.py          # User model
│   │   ├── regulation.py    # Regulation + RegulationHistory
│   │   ├── simulation.py    # Simulation avec snapshots
│   │   ├── feature_flag.py  # Feature flags
│   │   └── audit_log.py     # Audit trail GDPR
│   ├── routers/             # ✅ COMPLET
│   │   ├── auth.py          # Register, login, JWT
│   │   ├── simulations.py   # POST /residency + history
│   │   └── paddle_webhook.py # Paddle events
│   ├── services/            # ✅ COMPLET
│   │   ├── tax_simulator.py # TaxSimulator + Explain Decision
│   │   ├── paddle_handler.py # Webhook verification
│   │   └── feature_flags.py # A/B testing
│   ├── utils/               # ✅
│   │   └── security.py      # JWT + bcrypt
│   └── tasks/               # TODO (Celery - post-MVP)
├── requirements.txt         # ✅
└── Dockerfile              # ✅
```

### Commandes Utiles

```bash
# Logs
docker-compose logs -f backend

# Shell dans container
docker exec -it nomadcrypto-backend bash

# Database migrations (à venir)
docker exec -it nomadcrypto-backend alembic upgrade head

# Tests (à venir)
docker exec -it nomadcrypto-backend pytest
```

---

## 📊 Historique Git

```bash
# Voir commits
git log --oneline

# État actuel
git status

# Dernier commit
git show HEAD
```

**Commits actuels** :
- `914ba99` - feat: initial project structure
- `446f8a5` - feat: backend core - models, services, routers
- `7608d65` - feat: add installation and backup scripts
- `b7a2c73` - feat: complete frontend Next.js 15 application

---

## 🚨 En Cas de Bug Claude Code

### Prompt de Reprise

```
Je développe NomadCrypto Hub (SaaS crypto tax multi-pays).

Lis ces fichiers pour contexte complet :
1. /home/fred/cryptonomadhub/JOURNAL_DEVELOPPEMENT.md
2. /home/fred/cryptonomadhub/CHANGELOG.md

Dernière action : [voir CHANGELOG.md]
Dernier commit git : b7a2c73 (MVP complet)

Continue le développement.
```

### Fichiers Critiques à Lire
1. `JOURNAL_DEVELOPPEMENT.md` - Contexte global
2. `CHANGELOG.md` - Actions détaillées
3. `git log` - Historique commits

---

## 💡 Décisions Architecturales Clés

### Pourquoi Paddle vs Stripe ?
- Stripe bloqué Maurice/Seychelles
- Paddle = Merchant of Record (gère taxes global)
- Payout direct vers Airwallex
- Fees 5% acceptable vs complexité alternative

### Pourquoi Regulations History ?
- **CRITIQUE** pour compliance légale
- Audit trail : simulations mars 2024 restent valides même si rules changent
- Snapshot complet regulations dans chaque simulation
- Table `regulations_history` avec `valid_from`/`valid_to`

### Pourquoi Feature Flags ?
- Rollout graduel pays par pays
- A/B testing (10% users nouvelle feature)
- Kill switch instantané si bug
- Beta testers early access

---

## 📞 Support & Contact

- **Issues** : Voir JOURNAL_DEVELOPPEMENT.md section "Comment Reprendre"
- **Docs** : PLAN_COMPLET.md
- **Architecture** : SETUP_SEYCHELLES_AIRWALLEX.md

---

## 📄 License

Propriétaire - IBC Seychelles

---

**Dernière mise à jour** : 2025-10-11 (Session 1 - MVP complet ✅)
