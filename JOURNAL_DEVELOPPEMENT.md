# Journal de Développement - NomadCrypto Hub

**Projet** : SaaS crypto tax multi-juridictions pour nomades digitaux
**Démarré** : 2025-01-11
**Structure** : IBC Seychelles + Airwallex
**Budget MVP** : $2k-4k
**Timeline** : 4 mois

---

## 📚 Documents de Référence (LIRE EN CAS DE REPRISE)

1. **PLAN_COMPLET.md** (2800 lignes) - Architecture technique complète
2. **CORRECTIFS_BLOQUANTS.md** - Paddle vs Stripe, légal, compliance
3. **SETUP_SEYCHELLES_AIRWALLEX.md** - Configuration IBC + banking
4. **AMELIORATIONS_ROADMAP.md** - Features avancées v1.1-v3.0
5. **CHANGELOG.md** - Actions détaillées session par session

---

## 🎯 Décisions Architecturales

- **Stack** : FastAPI + Next.js 15 + PostgreSQL + Ollama (Llama 3.1) + Docker
- **Paiements** : Paddle (MoR) → Airwallex (Stripe impossible MU/SC)
- **Pays MVP** : 10 (US, FR, PT, AE, AU, CA, DE, SG, GB, ES)
- **Features v1.0** : Explain Decision, Regulations History, Feature Flags

---

## 📋 État Global

**Dernière session** : Session 1 - 2025-01-11
**Statut actuel** : ✅ Génération code initial en cours
**Prochaine étape** : Tests locaux + seed database

---

## 🔄 Comment Reprendre en Cas de Bug Claude

1. Ouvrir nouveau chat Claude Code
2. Dire : "Je développe NomadCrypto Hub. Lis /home/fred/cryptonomadhub/JOURNAL_DEVELOPPEMENT.md et /home/fred/cryptonomadhub/CHANGELOG.md pour contexte complet"
3. Spécifier : "Dernière action dans CHANGELOG.md était [X]. Continue depuis là."
4. Claude reprend avec historique complet

---

**Dernière mise à jour** : 2025-01-11 23:52 UTC
