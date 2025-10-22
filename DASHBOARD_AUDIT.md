# 📊 AUDIT COMPLET DU DASHBOARD - CryptoNomadHub

**Date:** 2025-10-18
**Auditeur:** Claude (UX/UI Expert)
**Projet:** CryptoNomadHub - Plateforme de gestion fiscale crypto pour nomades digitaux
**Objectif:** Réorganisation complète du dashboard utilisateur pour le rendre intuitif, efficace et professionnel

---

## PHASE 1: AUDIT COMPLET

### 1.1 INVENTAIRE DES FONCTIONNALITÉS

#### ✅ Fonctionnalités Principales (7)

| Fonctionnalité | Route | Description | Statut |
|---------------|-------|-------------|--------|
| **DeFi Audit** | `/defi-audit` | Analyse automatique de l'activité DeFi cross-chain (50+ blockchains) | 🟡 BETA |
| **Tax Optimizer** | `/tax-optimizer` | Stratégies d'optimisation fiscale (loss harvesting, holding period) | ✅ Actif |
| **Cost Basis Tracker** | `/cost-basis` | Suivi des lots d'achat (FIFO/LIFO/HIFO) avec wash sale detection | ✅ Actif |
| **Tax Simulator** | `/simulations/new` | Comparaison fiscale entre pays (160+ pays) | ✅ Actif |
| **Countries Database** | `/countries` | Base de données réglementaire (98 pays avec données fiscales) | ✅ Actif |
| **Chat AI Assistant** | `/chat` | Assistant conversationnel Claude AI avec persistence | ✅ Nouveau |
| **Crypto Tools** | `/tools` | Cartes crypto (RedotPay, Kast, Ultimo) et outils nomades | ✅ Actif |

#### ⚙️ Fonctionnalités Secondaires (8)

| Fonctionnalité | Route | Description |
|---------------|-------|-------------|
| **Settings** | `/settings` | Profil, mot de passe, juridiction fiscale, préférences |
| **Simulation History** | `/simulations/history` | Historique des simulations fiscales |
| **Simulation Compare** | `/simulations/compare` | Comparaison multi-pays (jusqu'à 5 pays) |
| **Cost Basis Review** | `/cost-basis/review` | Révision des lots non vérifiés |
| **Wash Sales** | `/cost-basis/wash-sales` | Détection des ventes fictives (règle IRS 30 jours) |
| **NFT Tracker** | `/nft` | Suivi des transactions NFT |
| **Yield Positions** | `/yield` | Suivi des positions de staking/yield |
| **Wallets** | `/wallets` | Gestion des portefeuilles |

#### 📊 Statistiques/KPIs Disponibles

**Simulations Fiscales:**
- Nombre total de simulations
- Économies potentielles totales ($)
- Nombre de pays comparés
- Dernières simulations (top 5)

**DeFi Portfolio:**
- Valeur totale du portefeuille ($)
- Gains/pertes non réalisés ($)
- Responsabilité fiscale estimée ($)
- Nombre de lots de cost basis

**Cost Basis:**
- Nombre total de lots
- Cost basis total ($)
- Nombre de tokens uniques
- Cost basis moyen
- Lots non vérifiés
- Wash sales détectées

**DeFi Audit:**
- Nombre total d'audits
- Transactions totales
- Volume total ($)
- Gains/pertes nets ($)
- Frais totaux ($)

**Tax Optimizer:**
- Opportunités d'optimisation (nombre)
- Économies fiscales potentielles ($)
- Valeur du portfolio ($)
- Gains/pertes non réalisés ($)

#### 🎬 Actions Possibles

**Navigation:**
- Créer nouvelle simulation
- Créer comparaison multi-pays
- Démarrer DeFi audit
- Analyser portfolio (Tax Optimizer)
- Ajouter lot de cost basis
- Importer CSV (cost basis)
- Exporter rapports (PDF, CSV, IRS Form 8949)
- Ouvrir chat AI
- Voir historique
- Modifier paramètres

**Gestion:**
- Définir juridiction fiscale
- Changer méthode cost basis (FIFO/LIFO/HIFO)
- Vérifier lots non confirmés
- Supprimer audits/simulations
- Gérer wallets
- Modifier profil

#### 👤 États Utilisateur

**Identifiés:**
- Free Tier (tous les utilisateurs actuellement)
- Premium (plan prévu mais pas encore implémenté via Paddle)
- Nouveau (0 audits, 0 simulations)
- Actif (>1 audit ou simulation)
- Configuré (juridiction fiscale définie)
- Non-configuré (juridiction fiscale manquante)

---

### 1.2 ANALYSE DE L'EXPÉRIENCE UTILISATEUR ACTUELLE

#### 🎨 État du Dashboard Actuel (`/dashboard`)

**Ce que l'utilisateur voit en arrivant:**

1. **Hero Banner Violet/Fuchsia**
   - Message: "Your Dashboard" + "Welcome Back!"
   - CTA: "New Simulation"
   - Très visible mais générique

2. **4 Cards de Stats (Grid 4 colonnes)**
   - Simulations (nombre)
   - Potential Savings ($)
   - Countries Compared (nombre)
   - Portfolio Value ($ - gradient violet/fuchsia)

3. **10 Action Cards (Grid 3 colonnes)**
   - Chat AI (gradient violet → fuchsia) [NEW badge]
   - New Simulation (blanc)
   - Compare Countries (gradient orange → rouge) [NEW badge]
   - DeFi Audit (gradient emerald → teal) [NEW badge]
   - Tax Optimizer (gradient violet → fuchsia) [NEW badge]
   - Cost Basis Tracking (gradient rose → pink) [NEW badge]
   - Crypto Cards & Tools (gradient yellow → orange)
   - Countries (blanc)
   - History (blanc)
   - Settings (blanc, gris)

4. **2 Cards de Stats Détaillées (Grid 2 colonnes)**
   - Tax Residency Stats (blanc, 2x2 grid interne)
   - DeFi Portfolio Stats (gradient violet → fuchsia, 2x2 grid interne)

5. **2 Charts (si données disponibles)**
   - Portfolio Token Distribution (Pie chart)
   - Cost Basis vs Current Value (Bar chart)

6. **Recent Simulations** (si disponibles)
   - Liste des 5 dernières simulations
   - Affiche: pays source → pays cible, économies

7. **Disclaimer** (jaune/orange)
   - Rappel : pas de conseil financier

#### 📉 Problèmes Identifiés (UX Pain Points)

**🔴 CRITIQUES:**

1. **Hiérarchie visuelle floue**
   - Trop de "NEW" badges (6 sur 10 cards!) → dilue l'impact
   - Pas de différenciation claire entre actions primaires et secondaires
   - Le hero banner pousse l'utilisateur vers "New Simulation" mais ce n'est peut-être pas le plus important

2. **Surcharge d'information**
   - 10 action cards affichées d'un coup = paralysie du choix
   - Stats dispersées (4 cards en haut + 2 cards détaillées au milieu)
   - Pas de priorisation claire

3. **Empty States ignorés**
   - Nouveau utilisateur (0 audits, 0 simulations) voit les MÊMES cards avec des stats à "$0"
   - Aucun onboarding
   - Aucune guidance sur "par où commencer"

4. **Incohérence de design**
   - Action cards mélangent 3 styles:
     * Gradient coloré (5 cards)
     * Blanc/neutre (5 cards)
   - Pas de logique apparente dans le choix des couleurs

5. **Données manquantes critiques**
   - Juridiction fiscale: mentionnée dans "Tax Residency Stats" comme "Free Tier" mais pas mise en avant
   - Utilisateur peut ne pas savoir qu'il DOIT configurer sa juridiction fiscale pour des calculs précis
   - Charts n'apparaissent QUE si données disponibles → pas d'explanation si vides

**🟡 MODÉRÉS:**

6. **Navigation peu claire**
   - "Countries" vs "Compare Countries" → confusion
   - "New Simulation" (hero) vs "New Simulation" (card) → redondance
   - Chat AI noyé parmi les autres cards alors qu'il pourrait aider

7. **Manque de contexte**
   - Stats sans explication (ex: "Countries Compared: 5" → et alors?)
   - Pas d'insights ("Vous êtes dans le top 10% des utilisateurs")
   - Pas de recommandations ("Astuce: Vérifiez vos 12 lots non confirmés")

8. **Responsive discutable**
   - Grid 3 colonnes → 1 colonne sur mobile = BEAUCOUP de scroll
   - Hero banner occupe beaucoup d'espace sur mobile

**🟢 MINEURS:**

9. **Charts conditionnels**
   - Charts n'apparaissent que si données → manque de skeleton ou empty state

10. **Manque de quick actions**
    - Pas de shortcuts clavier
    - Pas d'actions rapides (ex: "Repeat last simulation")

#### 🛤️ Parcours Utilisateur Actuel

**Nouveau Utilisateur (First Time):**
1. Arrive sur dashboard
2. Voit 10 cards + stats à $0
3. ??? (confusion - par où commencer?)
4. Clique probablement sur "New Simulation" (CTA hero)
5. Découvre qu'il faut remplir un formulaire
6. Pas de guidance sur quels pays choisir

**Score: 3/10** (Frustrant, pas d'onboarding)

**Utilisateur Actif (Returning):**
1. Arrive sur dashboard
2. Doit scroller pour voir "Recent Simulations"
3. Stats en haut sont statiques (pas d'insights)
4. Doit chercher l'action qu'il veut faire parmi 10 cards
5. Pas de "Continue where you left off"

**Score: 5/10** (Fonctionnel mais pas optimal)

---

### 1.3 ANALYSE DES DONNÉES UTILISATEUR

#### 🗂️ Données Affichables

**Profil Utilisateur:**
- ✅ Email
- ✅ Nom complet (optionnel)
- ✅ Plan (Free Tier / Premium)
- ✅ Pays actuel (si défini)
- ✅ Juridiction fiscale (CRITIQUE - pas assez mise en avant!)
- ✅ Méthode cost basis (FIFO/LIFO/HIFO)

**Wallets Connectés:**
- ❌ PAS AFFICHÉ sur dashboard actuel
- ✅ Données disponibles en DB (UserWallet model)
- Devrait afficher: nombre de wallets, chains

**Audits DeFi:**
- ✅ Nombre total
- ✅ Statut (processing, completed, failed)
- ✅ Dernière date
- ✅ Transactions totales
- ✅ Volume ($)
- ❌ MAIS: Pas affiché clairement sur dashboard (seulement dans stats DeFi Portfolio)

**Simulations Fiscales:**
- ✅ Nombre
- ✅ Économies totales
- ✅ Pays comparés
- ✅ 5 dernières simulations
- ✅ Dates

**Tax Opportunities (Tax Optimizer):**
- ❌ PAS AFFICHÉ sur dashboard actuel
- ✅ Données disponibles: économies potentielles, opportunités
- **CRITIQUE:** Devrait être en avant pour alerter l'utilisateur!

**Cost Basis:**
- ✅ Nombre de lots
- ✅ Valeur totale
- ✅ Tokens uniques
- ✅ Cost basis moyen
- ✅ Charts (pie + bar)
- ❌ MANQUE: Lots non vérifiés (alerte importante!)
- ❌ MANQUE: Wash sales (alerte critique pour US users!)

**Transactions NFT/Yield:**
- ❌ PAS AFFICHÉ sur dashboard
- ✅ Routes existent (/nft, /yield)
- Stats inconnues

**Conversations Chat AI:**
- ❌ PAS AFFICHÉ sur dashboard
- ✅ Persistance implémentée (récemment ajoutée)
- Pourrait afficher: dernières conversations

---

## RÉSUMÉ DES FINDINGS - PROBLÈMES MAJEURS

### 🚨 Top 5 Problèmes Critiques

1. **Aucun onboarding pour nouveaux utilisateurs**
   - Empty states ignorés
   - Pas de guidance "first steps"
   - Utilisateur perdu face à 10 options

2. **Juridiction fiscale pas assez mise en avant**
   - CRITIQUE pour tous les calculs
   - Cachée dans settings
   - Mentionnée seulement comme "Free Tier" dans stats

3. **Trop de choix sans priorisation**
   - 10 action cards au même niveau
   - 6 badges "NEW" → perd son sens
   - Pas de hiérarchie claire

4. **Alertes importantes invisibles**
   - Tax opportunities (économies potentielles) cachées
   - Lots non vérifiés (cost basis à corriger) non affichés
   - Wash sales (violations fiscales) non alertées sur dashboard

5. **Pas d'insights, que des chiffres**
   - Stats brutes sans contexte
   - Pas de comparaison (vs mois dernier, vs moyenne)
   - Pas de recommandations personnalisées

---

## RECOMMANDATIONS D'AMÉLIORATION

### 💡 Quick Wins (Faciles à implémenter)

1. **Ajouter section "Quick Actions" pour utilisateurs actifs**
   - "Repeat Last Simulation"
   - "View Latest Audit"
   - "Continue Chat"

2. **Améliorer hero banner avec personnalisation**
   - "Welcome back, {name}!"
   - Afficher juridiction fiscale si définie
   - Sinon: alerte "⚠️ Set your tax jurisdiction for accurate calculations"

3. **Réduire badges "NEW"**
   - Garder seulement 1-2 features vraiment nouvelles
   - Ou utiliser badges différents ("BETA", "POPULAR", "RECOMMENDED")

4. **Ajouter alertes/notifications**
   - Card dédiée "Action Required"
   - Afficher: lots non vérifiés, wash sales, juridiction manquante

5. **Empty states pour nouveaux utilisateurs**
   - Hero avec "Get Started: 3 Steps"
   - Step 1: Set tax jurisdiction
   - Step 2: Connect wallet OR Start simulation
   - Step 3: Review your first report

### 🏗️ Refonte Complète (3 concepts suivront)

➡️ Voir section "PHASE 2: CONCEPTS DE DASHBOARD"

---

**Fichiers analysés pour cet audit:**
- ✅ `/frontend/app/dashboard/page.tsx` (Dashboard actuel)
- ✅ `/frontend/app/**/page.tsx` (Toutes les pages principales)
- ✅ `/backend/app/routers/*.py` (Routes API backend)
- ✅ `/backend/app/models/*.py` (Modèles de données)

**Tokens utilisés:** ~160K/200K
**Prochaine étape:** Proposer 3 concepts de dashboard (Conservateur, Moderne, Innovant)

---

## PHASE 2: CONCEPTS DE DASHBOARD

### Introduction

Après l'audit complet, je propose **3 concepts de dashboard distincts**, chacun avec une philosophie différente. Chaque concept répond aux problèmes identifiés dans l'audit, mais avec des approches différentes.

**Les 3 concepts :**
- 🟦 **Concept A - "Conservateur"** : Améliorations incrémentales, garde la structure actuelle
- 🟨 **Concept B - "Moderne"** : Réorganisation complète, dashboard par sections intelligentes
- 🟥 **Concept C - "Innovant"** : Dashboard adaptatif piloté par IA et contexte utilisateur

---

## 🟦 CONCEPT A - "CONSERVATEUR" (Évolution Progressive)

### 📋 Philosophie

**Approche :** Améliorer l'existant sans révolutionner
**Pour qui :** Utilisateurs actuels habitués au layout, équipe avec ressources limitées
**Effort :** 🟢 Faible (2-3 jours)
**Risque :** 🟢 Minimal

### 🎯 Changements Principaux

1. **Ajouter une section "Alerts & Actions Required"** en haut
2. **Réduire le nombre de badges "NEW"** (garder seulement Chat AI)
3. **Améliorer le hero banner** avec personnalisation
4. **Ajouter empty states** pour nouveaux utilisateurs
5. **Hiérarchiser visuellement** les action cards (primaires vs secondaires)

### 🖼️ Wireframe Textuel (Conservateur)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔔 ALERTS BAR (si alertes présentes)                           │
│                                                                 │
│ ⚠️ Action Required:                                            │
│ • Set your tax jurisdiction for accurate calculations          │
│ • 12 cost basis lots need verification                         │
│ • 3 wash sale warnings detected                                │
│                                                      [Dismiss]  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HERO BANNER (gradient violet → fuchsia)                        │
│                                                                 │
│ Welcome back, {name}! 👋                                       │
│ Tax Residence: {country} 🇫🇷 [Change]                         │
│                                                                 │
│ [New Simulation] [Continue Chat]                               │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ STATS OVERVIEW (Grid 4 colonnes)                               │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │    42    │ │ $12,450  │ │    8     │ │ $145,320 │        │
│  │Simulations│ │Potential │ │Countries │ │Portfolio │        │
│  │          │ │ Savings  │ │Compared  │ │  Value   │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ QUICK ACTIONS (Section nouvelle - Grid 2x2)                    │
│                                                                 │
│  ┌─────────────────────┐ ┌─────────────────────┐             │
│  │ 🔍 Repeat Last      │ │ 💬 Continue Chat    │             │
│  │    Simulation       │ │                     │             │
│  └─────────────────────┘ └─────────────────────┘             │
│  ┌─────────────────────┐ ┌─────────────────────┐             │
│  │ 📊 View Latest      │ │ ⚙️ Complete Setup   │             │
│  │    Audit            │ │                     │             │
│  └─────────────────────┘ └─────────────────────┘             │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ PRIMARY FEATURES (Grid 3 colonnes - avec gradients)            │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ 💬 Chat AI   │ │ 🔍 DeFi      │ │ 💰 Tax       │          │
│  │   Assistant  │ │   Audit      │ │  Optimizer   │          │
│  │   [NEW]      │ │   [BETA]     │ │              │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ 📈 New       │ │ 🌍 Compare   │ │ 📊 Cost      │          │
│  │  Simulation  │ │  Countries   │ │   Basis      │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ SECONDARY FEATURES (Grid 4 colonnes - blanc/gris)              │
│                                                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                 │
│  │ 🎴     │ │ 🌍     │ │ 📜     │ │ ⚙️     │                 │
│  │Crypto  │ │Count-  │ │History │ │Settings│                 │
│  │Tools   │ │ries DB │ │        │ │        │                 │
│  └────────┘ └────────┘ └────────┘ └────────┘                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ RECENT ACTIVITY                                                 │
│                                                                 │
│  🇺🇸 USA → 🇵🇹 Portugal  |  Saved $8,450  |  2 days ago     │
│  🇨🇦 Canada → 🇦🇪 UAE    |  Saved $12,200 |  5 days ago     │
│  🇫🇷 France → 🇨🇭 Swiss  |  Saved $3,800  |  1 week ago     │
│                                                [View All]       │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ DISCLAIMER                                                      │
└────────────────────────────────────────────────────────────────┘
```

### 🔑 Décisions de Design

**✅ Ce qui change :**
1. **Alerts bar** : Affiche alertes critiques (juridiction manquante, lots non vérifiés, wash sales)
2. **Hero personnalisé** : Nom utilisateur + juridiction fiscale visible + actions principales
3. **Section "Quick Actions"** : Accès rapide aux actions contextuelles (nouveau)
4. **Réorganisation cards** : PRIMARY (6 cards gradient) vs SECONDARY (4 cards blanc)
5. **Badge "NEW" unique** : Seulement Chat AI garde le badge
6. **Empty state** : Si utilisateur nouveau, hero devient "Get Started: 3 Steps"

**❌ Ce qui reste identique :**
- Structure globale (hero → stats → cards → activity)
- Grid layout (3 colonnes)
- Couleurs et gradients actuels
- Composants existants (pas de refonte)

### ⚖️ Avantages / Inconvénients

**✅ Avantages :**
- ✅ Rapide à implémenter (2-3 jours)
- ✅ Aucun breaking change
- ✅ Utilisateurs actuels pas perdus
- ✅ Résout les alertes critiques (juridiction, wash sales)
- ✅ Améliore onboarding nouveaux utilisateurs

**❌ Inconvénients :**
- ❌ Ne résout pas totalement la surcharge d'information
- ❌ Structure reste rigide (pas adaptatif)
- ❌ Pas de différenciation forte vs concurrents
- ❌ Charts et stats détaillées toujours en bas (scroll nécessaire)

### 📊 Score UX Attendu

- **Nouveau utilisateur :** 6/10 → 📈 **8/10** (+2)
- **Utilisateur actif :** 5/10 → 📈 **7/10** (+2)

---

## 🟨 CONCEPT B - "MODERNE" (Dashboard par Sections)

### 📋 Philosophie

**Approche :** Réorganisation complète en sections logiques type "fintech moderne"
**Pour qui :** Utilisateurs crypto avertis, besoin de dashboard professionnel
**Effort :** 🟡 Moyen (1-2 semaines)
**Risque :** 🟡 Modéré (changement important mais patterns éprouvés)

### 🎯 Changements Principaux

1. **Navigation par onglets** : Overview / Tax Planning / Portfolio / Alerts
2. **Sidebar persistante** : Quick access + navigation
3. **Sections intelligentes** : Auto-collapse selon contexte
4. **Charts interactifs** : Plus visibles, avec drill-down
5. **Dashboard "command center"** : Tout accessible sans scroll

### 🖼️ Wireframe Textuel (Moderne)

```
┌──┬───────────────────────────────────────────────────────────────┐
│  │ HEADER BAR                                                    │
│  │ CryptoNomadHub  [🔍 Search] [🔔 3] [👤 Fred] [⚙️]          │
│S ├───────────────────────────────────────────────────────────────┤
│I │ NAVIGATION TABS                                               │
│D │ ┌─────────┬──────────┬───────────┬─────────┐                │
│E │ │Overview │Tax Plan  │Portfolio  │ Alerts  │                │
│B │ └─────────┴──────────┴───────────┴─────────┘                │
│A ├───────────────────────────────────────────────────────────────┤
│R │                                                               │
│  │ ┌──────────────────────────────────────────────────────┐    │
│📊│ │ HERO SECTION (Contextuel par onglet)                 │    │
│  │ │                                                       │    │
│💬│ │ Good afternoon, Fred! 👋                             │    │
│  │ │ 🇫🇷 Tax Residence: France (2025)          [Change]  │    │
│🔍│ │                                                       │    │
│  │ │ ┌──────────┐ ┌──────────┐ ┌──────────┐             │    │
│⚙️│ │ │💰$145.3K │ │📈+12.4K  │ │⚠️ 3      │             │    │
││ │ │Portfolio │ │Unrealized│ │Alerts    │             │    │
│  │ │ Value    │ │  Gains   │ │          │             │    │
│  │ │ └──────────┘ └──────────┘ └──────────┘             │    │
│  │ └──────────────────────────────────────────────────────┘    │
│  │                                                               │
│  │ ┌────────────────────┐ ┌─────────────────────────────┐     │
│  │ │ 🎯 QUICK ACTIONS   │ │ 🚨 ACTION REQUIRED          │     │
│  │ │                    │ │                             │     │
│  │ │ [New Simulation]   │ │ ⚠️ Set tax jurisdiction    │     │
│  │ │ [Run DeFi Audit]   │ │ ⚠️ 12 lots need review     │     │
│  │ │ [Ask AI]           │ │ ⚠️ 3 wash sale warnings    │     │
│  │ │ [Compare Countries]│ │                    [Fix Now]│     │
│  │ └────────────────────┘ └─────────────────────────────┘     │
│  │                                                               │
│  │ ┌───────────────────────────────────────────────────────┐   │
│  │ │ 📊 PORTFOLIO OVERVIEW                                 │   │
│  │ │                                                       │   │
│  │ │ ┌──────────────┐ ┌──────────────────────────────┐   │   │
│  │ │ │ Token Distri-│ │ Cost Basis vs Value          │   │   │
│  │ │ │ bution (Pie) │ │ (Bar Chart)                  │   │   │
│  │ │ │              │ │                              │   │   │
│  │ │ │   ETH 45%    │ │ ████████  $82K (cost)       │   │   │
│  │ │ │   BTC 30%    │ │ ██████████ $98K (value)     │   │   │
│  │ │ │   SOL 15%    │ │                              │   │   │
│  │ │ │   Others 10% │ │ Unrealized: +$16K (19.5%)   │   │   │
│  │ │ └──────────────┘ └──────────────────────────────┘   │   │
│  │ └───────────────────────────────────────────────────────┘   │
│  │                                                               │
│  │ ┌───────────────────────────────────────────────────────┐   │
│  │ │ 💡 TAX OPPORTUNITIES (Tax Optimizer)                  │   │
│  │ │                                                       │   │
│  │ │ 🎯 5 opportunities found • Potential savings: $8,200  │   │
│  │ │                                                       │   │
│  │ │ 1. Loss Harvesting: Sell SOL (-$2.1K) → Save $630   │   │
│  │ │ 2. Hold ETH 18 more days → Long-term rate           │   │
│  │ │ 3. Rebalance to USDC → Realize $1.2K losses         │   │
│  │ │                                       [View All]      │   │
│  │ └───────────────────────────────────────────────────────┘   │
│  │                                                               │
│  │ ┌───────────────────────────────────────────────────────┐   │
│  │ │ 📜 RECENT ACTIVITY                                    │   │
│  │ │                                                       │   │
│  │ │ Today                                                 │   │
│  │ │ • Chat conversation: "How to optimize Portugal tax"  │   │
│  │ │ • DeFi Audit completed: 1,247 transactions           │   │
│  │ │                                                       │   │
│  │ │ Yesterday                                             │   │
│  │ │ • Simulation: USA → Portugal (saved $8.4K)          │   │
│  │ │ • Added 8 cost basis lots (ETH)                      │   │
│  │ │                                       [View All]      │   │
│  │ └───────────────────────────────────────────────────────┘   │
└──┴───────────────────────────────────────────────────────────────┘
```

### 🔑 Décisions de Design

**✅ Innovations Majeures :**

1. **Sidebar persistante** (gauche)
   - Navigation principale (Dashboard, Chat, DeFi Audit, Settings)
   - Icons uniquement (collapsed par défaut)
   - Expand au hover

2. **Navigation par onglets** (Overview / Tax Planning / Portfolio / Alerts)
   - **Overview** : Vue globale (wireframe ci-dessus)
   - **Tax Planning** : Simulations + stratégies + comparaisons pays
   - **Portfolio** : Cost basis + lots + wash sales + NFT + yield
   - **Alerts** : Toutes les actions requises + opportunités

3. **Hero contextuel**
   - Change selon l'onglet actif
   - Stats pertinentes au contexte
   - Actions rapides adaptées

4. **Sections "cards"**
   - Quick Actions (toujours visibles)
   - Action Required (si alertes)
   - Portfolio Overview (charts)
   - Tax Opportunities (si disponibles)
   - Recent Activity (timeline)

5. **Smart empty states**
   - Nouveau utilisateur : Hero devient "Setup Guide" 3 étapes
   - Pas de simulations : Card "Create Your First Simulation"
   - Pas d'audit : Card "Connect Wallet & Run Audit"

6. **Charts interactifs**
   - Pie chart cliquable → drill down par token
   - Bar chart hover → détails par lot
   - Export button visible

### 📐 Layout Specs

**Desktop (>1024px) :**
- Sidebar: 64px (collapsed) / 240px (expanded)
- Main content: Remaining width
- Grid: 2-3 colonnes selon section
- Cards: Auto-height avec max-height + scroll interne

**Tablet (640-1024px) :**
- Sidebar: Bottom bar (fixed)
- Grid: 2 colonnes
- Cards: Stack verticalement

**Mobile (<640px) :**
- Full width
- Hamburger menu
- Cards: 1 colonne

### ⚖️ Avantages / Inconvénients

**✅ Avantages :**
- ✅ Dashboard "command center" moderne
- ✅ Navigation claire par contexte (onglets)
- ✅ Toutes les infos importantes visible sans scroll
- ✅ Charts et opportunités mises en avant
- ✅ Pattern éprouvé (Coinbase, Robinhood, etc.)
- ✅ Scalable (facile d'ajouter onglets)

**❌ Inconvénients :**
- ❌ Effort développement moyen (1-2 semaines)
- ❌ Utilisateurs actuels doivent s'adapter
- ❌ Sidebar = espace écran réduit
- ❌ Plus de composants à créer

### 📊 Score UX Attendu

- **Nouveau utilisateur :** 6/10 → 📈 **9/10** (+3)
- **Utilisateur actif :** 5/10 → 📈 **9/10** (+4)

---

## 🟥 CONCEPT C - "INNOVANT" (Dashboard Adaptatif IA)

### 📋 Philosophie

**Approche :** Dashboard qui s'adapte dynamiquement au contexte et besoins de l'utilisateur
**Pour qui :** Utilisateurs avancés, early adopters, besoin de personnalisation maximale
**Effort :** 🔴 Élevé (2-4 semaines)
**Risque :** 🔴 Élevé (innovation = risque, mais différenciation forte)

### 🎯 Changements Principaux

1. **Dashboard adaptatif** : Sections qui changent selon le profil utilisateur
2. **AI Copilot intégré** : Claude suggère actions et insights directement sur dashboard
3. **Widgets personnalisables** : Utilisateur choisit ce qu'il voit
4. **Smart notifications** : Pas de section "Alerts" statique, mais notifications contextuelles inline
5. **Timeline intelligente** : Activité + recommandations mélangées

### 🖼️ Wireframe Textuel (Innovant)

```
┌────────────────────────────────────────────────────────────────┐
│ HEADER SMART                                                    │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 💬 Ask me anything about your taxes...    [Mic] [Search] │  │
│ │ Claude AI copilot active                                  │  │
│ └──────────────────────────────────────────────────────────┘  │
│ CryptoNomadHub  🇫🇷 France  [🔔 3]  [👤 Fred]  [⚙️]        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 🎯 SMART HERO (Adaptatif selon profil)                         │
│                                                                 │
│ Good afternoon, Fred! 👋                                       │
│                                                                 │
│ 💡 Claude suggests:                                            │
│ "You have $8.2K in tax savings available. Run Tax Optimizer?" │
│                     [Yes, optimize] [Tell me more] [Dismiss]   │
│                                                                 │
│ Your dashboard is configured for: 🏖️ Digital Nomad - France  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 📊 ADAPTIVE WIDGETS ZONE                                        │
│                                                                 │
│ ┌──────────────────────────┐ ┌─────────────────────────────┐  │
│ │ 💰 PORTFOLIO SNAPSHOT    │ │ 🚨 PRIORITY ACTIONS         │  │
│ │                          │ │                             │  │
│ │ Total Value: $145,320    │ │ 1. ⚠️ Review 12 cost basis │  │
│ │ Unrealized: +$12,400 ↑   │ │    lots (5 min)      [Fix] │  │
│ │ Tax Liability: -$3,720   │ │                             │  │
│ │                          │ │ 2. 💡 Loss harvesting SOL  │  │
│ │ ┌───────┐ ┌───────┐     │ │    Save $630         [View] │  │
│ │ │ ETH   │ │ BTC   │     │ │                             │  │
│ │ │ 45%   │ │ 30%   │     │ │ 3. 📅 ETH long-term in 18  │  │
│ │ └───────┘ └───────┘     │ │    days            [Remind] │  │
│ │                          │ │                             │  │
│ │ [Expand]     [Customize] │ │ [+Add custom action]        │  │
│ └──────────────────────────┘ └─────────────────────────────┘  │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 🗺️ TAX STRATEGY ROADMAP (Timeline)                        │  │
│ │                                                            │  │
│ │ NOW ────○────────○────────○────────────── DEC 2025       │  │
│ │         │        │        │                               │  │
│ │    Review    Hold ETH  File Taxes                         │  │
│ │    Lots      18 days   (France)                           │  │
│ │                                                            │  │
│ │ Claude's insight: "Consider UAE residency before Dec?"    │  │
│ │                                         [Explore]          │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ┌──────────────────────────┐ ┌─────────────────────────────┐  │
│ │ 🎬 QUICK LAUNCH          │ │ 📈 RECENT & RECOMMENDED     │  │
│ │                          │ │                             │  │
│ │ [🔍 DeFi Audit]          │ │ Today                       │  │
│ │ [💬 Chat AI]             │ │ • Audit: 1.2K txs ✅        │  │
│ │ [📊 New Simulation]      │ │                             │  │
│ │ [🌍 Compare Countries]   │ │ Yesterday                   │  │
│ │ [💰 Tax Optimizer]       │ │ • Simulation: USA→PT ✅     │  │
│ │                          │ │                             │  │
│ │ Last used: DeFi Audit    │ │ 💡 Recommended              │  │
│ │           (2 hours ago)  │ │ • Compare UAE vs Portugal  │  │
│ │                          │ │ • Review NFT transactions  │  │
│ │ [Customize order]        │ │                             │  │
│ └──────────────────────────┘ └─────────────────────────────┘  │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 💬 CLAUDE COPILOT CHAT (Collapsed)                        │  │
│ │                                                            │  │
│ │ Ask me about tax strategies, country comparisons, or...   │  │
│ │ [Expand chat]                               [3 messages]  │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ [+ Add Widget] [Customize Layout] [Reset to Default]           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ SMART FOOTER                                                    │
│ 🤖 Dashboard auto-updated 2 min ago • Claude suggestions: 3    │
└────────────────────────────────────────────────────────────────┘
```

### 🔑 Décisions de Design

**✅ Innovations Radicales :**

1. **AI Copilot Intégré (Claude)**
   - Search bar intelligent en haut (comme ChatGPT)
   - Suggestions proactives dans Smart Hero
   - Insights contextuels dans chaque widget
   - Chat collapsed en bas du dashboard (expand au clic)
   - Auto-analyse du portfolio avec recommandations

2. **Widgets Adaptifs**
   - Utilisateur peut ajouter/supprimer/réorganiser les widgets
   - Widgets disponibles :
     * Portfolio Snapshot
     * Priority Actions
     * Tax Strategy Roadmap (timeline)
     * Quick Launch
     * Recent & Recommended
     * Cost Basis Summary
     * Simulation Comparison
     * Country Heatmap
     * Custom widgets (API)
   - Drag & drop pour réorganiser
   - Sauvegardé en DB (UserDashboardLayout model)

3. **Smart Hero Contextuel**
   - **Nouveau utilisateur** : "Let's get you started! 3 steps to optimize your taxes"
   - **Utilisateur sans juridiction** : Alert priority + bouton direct
   - **Utilisateur actif** : Claude suggestions basées sur portfolio
   - **Utilisateur avec opportunités** : Tax savings proactif
   - **Utilisateur en attente** : "Your DeFi audit is processing... (45%)"

4. **Priority Actions Dynamiques**
   - Calculées par IA selon :
     * Alertes critiques (juridiction, wash sales)
     * Opportunités fiscales (loss harvesting)
     * Deadlines (long-term holding)
     * Actions incomplètes (lots non vérifiés)
   - Triées par impact ($) + urgence
   - Actions custom ajoutables par user

5. **Tax Strategy Roadmap**
   - Timeline visuelle avec étapes clés
   - Events automatiques : holding periods, tax deadlines
   - Events manuels : déménagement prévu, vente planifiée
   - Claude insights sur timeline
   - Intégration calendrier (iCal export)

6. **Profils Dashboard Pré-configurés**
   - 🏖️ **Digital Nomad** : Focus comparaisons pays, résidence fiscale
   - 💼 **Trader Actif** : Focus cost basis, wash sales, daily P&L
   - 📊 **HODLer Long Terme** : Focus portfolio value, long-term gains
   - 🏢 **Crypto Business** : Focus business income, DeFi yield as income
   - Utilisateur choisit profil au premier login

### 🎨 Design System Unique

**Couleurs Adaptatives :**
- Mode light/dark automatique selon heure
- Thème couleur selon profil :
  * Nomad → Warm (orange/yellow)
  * Trader → Cool (blue/cyan)
  * HODLer → Balanced (purple/green)

**Micro-interactions :**
- Widgets pulse légèrement si nouvelle alerte
- Smart Hero change de suggestion toutes les 10s (rotation)
- Priority Actions avec countdown si deadline
- Charts avec animations fluides

**Glassmorphism:**
- Widgets avec backdrop-blur
- Overlay subtil
- Look moderne/premium

### 🧠 Backend Nécessaire

**Nouveaux Endpoints API :**

```
POST /dashboard/layout          # Sauvegarder layout user
GET  /dashboard/layout          # Récupérer layout user
GET  /dashboard/suggestions     # Claude AI suggestions
GET  /dashboard/priority-actions # Actions triées par priorité
POST /dashboard/profile         # Set dashboard profile (Nomad/Trader/etc)
GET  /dashboard/timeline        # Tax strategy roadmap events
POST /dashboard/timeline/event  # Add custom event
```

**Nouveaux Modèles DB :**

```python
class UserDashboardLayout(BaseModel):
    user_id: int
    widgets: List[WidgetConfig]  # [{"type": "portfolio", "position": 1, "size": "medium"}]
    profile: str  # "nomad" | "trader" | "hodler" | "business"

class DashboardSuggestion(BaseModel):
    user_id: int
    suggestion_type: str  # "tax_opportunity" | "action_required" | "insight"
    title: str
    description: str
    cta_text: str
    cta_link: str
    priority: int
    created_at: datetime
    dismissed: bool
```

### ⚖️ Avantages / Inconvénients

**✅ Avantages :**
- ✅ **Différenciation forte** vs concurrents (personne n'a ça)
- ✅ **UX personnalisée** : Dashboard unique par utilisateur
- ✅ **AI-first** : Claude au centre de l'expérience
- ✅ **Scalable** : Facile d'ajouter nouveaux widgets
- ✅ **Engagement** : Users reviennent pour voir suggestions
- ✅ **Premium justifié** : Features avancées pour plan payant
- ✅ **Wow factor** : Démo impressionnante pour investisseurs/users

**❌ Inconvénients :**
- ❌ **Complexité développement** : 2-4 semaines (widgets, IA, layout)
- ❌ **Coût API Claude** : Suggestions = appels API (utiliser cache!)
- ❌ **Risque UX** : Trop innovant = users perdus? (A/B test nécessaire)
- ❌ **Maintenance** : Plus de composants = plus de bugs potentiels
- ❌ **Performance** : Widgets dynamiques = plus de requêtes API

### 📊 Score UX Attendu

- **Nouveau utilisateur :** 6/10 → 📈 **10/10** (+4)
- **Utilisateur actif :** 5/10 → 📈 **10/10** (+5)

### 🎁 Bonus Features (Phase 2 de Concept C)

Si temps/budget disponible :

1. **Dashboard Sharing** : Partager son dashboard (read-only) avec comptable
2. **Mobile App** : Dashboard adaptatif devient app React Native
3. **Widget Marketplace** : Users créent/partagent des widgets custom
4. **Voice Commands** : "Claude, show me tax opportunities" → widget s'affiche
5. **Collaboration** : Multi-user dashboard pour couples/business partners

---

## 📊 COMPARAISON DES 3 CONCEPTS

### Tableau Récapitulatif

| Critère | 🟦 Conservateur | 🟨 Moderne | 🟥 Innovant |
|---------|----------------|-----------|-------------|
| **Effort Dev** | 🟢 2-3 jours | 🟡 1-2 semaines | 🔴 2-4 semaines |
| **Risque** | 🟢 Minimal | 🟡 Modéré | 🔴 Élevé |
| **Différenciation** | ⭐⭐☆☆☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐⭐ |
| **UX Nouveau User** | 8/10 | 9/10 | 10/10 |
| **UX User Actif** | 7/10 | 9/10 | 10/10 |
| **Scalabilité** | ⭐⭐☆☆☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐⭐ |
| **Maintenance** | 🟢 Facile | 🟡 Moyenne | 🔴 Complexe |
| **Breaking Changes** | ❌ Aucun | ⚠️ Navigation | ⚠️ Structure complète |
| **Mobile Ready** | ✅ Oui | ✅ Oui | ✅ Oui |
| **A11y Ready** | ✅ Oui | ✅ Oui | ⚠️ Nécessite audit |

### Recommandation par Situation

**Choisir Concept A (Conservateur) si :**
- ✅ Besoin de livrer rapidement (< 1 semaine)
- ✅ Budget limité
- ✅ Utilisateurs actuels ne doivent pas être perturbés
- ✅ Équipe dev réduite
- ✅ Phase de test/validation du marché

**Choisir Concept B (Moderne) si :**
- ✅ Besoin d'un dashboard professionnel compétitif
- ✅ Budget moyen disponible
- ✅ Utilisateurs crypto avertis
- ✅ Patterns éprouvés souhaités (Coinbase-like)
- ✅ Volonté de se différencier modérément

**Choisir Concept C (Innovant) si :**
- ✅ Besoin de différenciation FORTE vs concurrents
- ✅ Budget conséquent disponible
- ✅ Early adopters / power users cible
- ✅ AI-first comme valeur ajoutée clé
- ✅ Volonté d'innover et prendre des risques
- ✅ Potentiel de levée de fonds (wow factor)
- ✅ Plan Premium à justifier

### 🎯 Ma Recommandation Personnelle

**Pour CryptoNomadHub, je recommande : 🟨 CONCEPT B (Moderne)**

**Pourquoi ?**

1. **Bon compromis effort/impact**
   - 1-2 semaines = livrable en sprint raisonnable
   - UX improvement significatif (+4 points)
   - Patterns éprouvés = risque maîtrisé

2. **Aligné avec le marché**
   - Users crypto attendent un dashboard "fintech moderne"
   - Concurrents (Koinly, CoinTracking) ont ce type de dashboard
   - Onglets = standard de l'industrie

3. **Scalable**
   - Facile d'ajouter onglets (Yield, NFT, etc.)
   - Structure claire pour features futures
   - Maintenance raisonnable

4. **Quick wins intégrés**
   - Alerts visibles (section dédiée)
   - Charts mis en avant
   - Tax opportunities affichées
   - Empty states pour onboarding

5. **Permet évolution vers Concept C**
   - Concept B = fondation solide
   - Ajouter IA/widgets plus tard
   - Migration progressive possible

**Plan recommandé :**

**Phase 1 (Immédiat) :** Concept B - Dashboard Moderne
- Sprint 1: Structure + Navigation (3-4 jours)
- Sprint 2: Widgets + Onglets (3-4 jours)
- Sprint 3: Polish + Mobile (2-3 jours)

**Phase 2 (Q2 2025) :** Enrichir Concept B
- Ajouter Claude suggestions (Concept C)
- Ajouter Timeline roadmap (Concept C)
- Améliorer charts interactifs

**Phase 3 (Q3 2025) :** Évolution vers Concept C
- Widgets personnalisables
- Dashboard adaptatif
- AI copilot intégré

---

## 🎬 PROCHAINES ÉTAPES

**À ce stade, j'attends ta décision :**

1. **Quel concept choisis-tu ?**
   - 🟦 Concept A (Conservateur)
   - 🟨 Concept B (Moderne) ⭐ Recommandé
   - 🟥 Concept C (Innovant)
   - 🎨 Hybride (mix de concepts)

2. **Une fois le concept choisi, je produirai :**
   - ✅ **Phase 3 : Spécifications Techniques Détaillées**
     * Liste complète des composants React
     * Props TypeScript pour chaque composant
     * Endpoints API nécessaires (nouveaux + existants)
     * Modèles de données (DB schemas)
     * Design tokens (couleurs, spacing, typography)

   - ✅ **Phase 4 : Recommandations Spécifiques**
     * Onboarding flow détaillé (step by step)
     * Empty states pour chaque cas
     * Loading states (skeletons)
     * Error states
     * Responsive breakpoints exacts
     * Accessibility checklist (WCAG 2.1 AA)

   - ✅ **Phase 5 : Plan d'Implémentation**
     * Tasks numérotées avec dépendances
     * Ordre d'exécution optimal
     * Estimation de complexité par task
     * Fichiers à créer/modifier/supprimer
     * Breaking changes identifiés
     * Strategy de migration (si nécessaire)
     * Testing plan

3. **Modifications/Ajustements souhaités ?**
   - Des éléments à ajouter aux concepts ?
   - Des contraintes techniques à considérer ?
   - Des préférences de design ?

**Note :** Aucun code ne sera écrit avant ta validation explicite du concept choisi et des spécifications détaillées.

---

**Fin de Phase 2 - Concepts de Dashboard**

---

## PHASE 3: SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES (Concept B)

**Concept choisi :** 🟨 **Concept B - "Moderne"** (Dashboard par Sections)

### Introduction

Cette section détaille toutes les spécifications techniques nécessaires pour implémenter le Concept B. Elle couvre :
- Architecture des composants React/Next.js
- Props TypeScript pour chaque composant
- Endpoints API backend (nouveaux + existants)
- Modèles de données et schémas DB
- Design system complet
- États et transitions

---

## 🏗️ ARCHITECTURE GLOBALE

### Structure des Dossiers

```
frontend/
├── app/
│   └── dashboard/
│       ├── page.tsx                    # Page principale (refonte)
│       ├── layout.tsx                  # Layout avec sidebar
│       └── [tab]/
│           └── page.tsx                # Pages par onglet (overview, tax-planning, portfolio, alerts)
├── components/
│   └── dashboard/
│       ├── layout/
│       │   ├── DashboardSidebar.tsx    # Sidebar persistante
│       │   ├── DashboardHeader.tsx     # Header avec search/notifications
│       │   └── TabNavigation.tsx       # Navigation par onglets
│       ├── hero/
│       │   ├── HeroSection.tsx         # Hero contextuel
│       │   └── HeroStats.tsx           # Stats cards dans hero
│       ├── sections/
│       │   ├── QuickActionsSection.tsx # Quick actions
│       │   ├── ActionRequiredSection.tsx # Alertes
│       │   ├── PortfolioOverviewSection.tsx # Charts portfolio
│       │   ├── TaxOpportunitiesSection.tsx # Tax optimizer
│       │   └── RecentActivitySection.tsx # Activity timeline
│       ├── cards/
│       │   ├── StatCard.tsx            # Card de statistique
│       │   ├── ActionCard.tsx          # Card d'action rapide
│       │   ├── AlertCard.tsx           # Card d'alerte
│       │   └── ActivityCard.tsx        # Card d'activité
│       ├── charts/
│       │   ├── TokenDistributionChart.tsx # Pie chart
│       │   ├── CostBasisChart.tsx      # Bar chart
│       │   └── ChartSkeleton.tsx       # Loading state
│       └── empty-states/
│           ├── NewUserEmptyState.tsx   # Premier usage
│           ├── NoSimulationsEmptyState.tsx
│           └── NoAuditsEmptyState.tsx

backend/
├── app/
│   ├── routers/
│   │   └── dashboard.py                # Nouveau router dashboard
│   └── models/
│       └── dashboard_activity.py       # Nouveau model activity
```

---

## 📦 COMPOSANTS REACT

### 1. Layout Components

#### `DashboardSidebar.tsx`

```typescript
// frontend/components/dashboard/layout/DashboardSidebar.tsx

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react'

interface SidebarItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface DashboardSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function DashboardSidebar({ collapsed = true, onToggle }: DashboardSidebarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()

  const isExpanded = !collapsed || isHovered

  const items: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'chat',
      label: 'Chat AI',
      href: '/chat',
      icon: MessageSquare,
      badge: 3 // Unread messages
    },
    {
      id: 'defi-audit',
      label: 'DeFi Audit',
      href: '/defi-audit',
      icon: Search
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ]

  return (
    <motion.aside
      className="dashboard-sidebar"
      initial={{ width: 64 }}
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar-header">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="sidebar-logo">CryptoNomadHub</h2>
          </motion.div>
        )}
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    className="sidebar-item-label"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && (
                <motion.div
                  className="sidebar-item-indicator"
                  layoutId="sidebar-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item">
          <LogOut className="w-5 h-5" />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  )
}
```

**Props TypeScript:**
```typescript
interface DashboardSidebarProps {
  collapsed?: boolean      // Sidebar collapsed par défaut
  onToggle?: () => void    // Callback toggle collapse
}
```

**Styles CSS (Tailwind):**
```css
.dashboard-sidebar {
  @apply fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-40;
}

.sidebar-header {
  @apply h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800;
}

.sidebar-logo {
  @apply text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent;
}

.sidebar-nav {
  @apply flex-1 py-4 space-y-1 px-2;
}

.sidebar-item {
  @apply relative flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors;
}

.sidebar-item.active {
  @apply bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400;
}

.sidebar-item-icon {
  @apply relative flex-shrink-0;
}

.sidebar-badge {
  @apply absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center;
}

.sidebar-item-indicator {
  @apply absolute left-0 top-0 bottom-0 w-1 bg-violet-600 rounded-r-full;
}

.sidebar-footer {
  @apply border-t border-gray-200 dark:border-gray-800 p-2;
}
```

---

#### `TabNavigation.tsx`

```typescript
// frontend/components/dashboard/layout/TabNavigation.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface Tab {
  id: string
  label: string
  href: string
  count?: number  // Badge count (e.g., alerts)
}

interface TabNavigationProps {
  tabs: Tab[]
}

export function TabNavigation({ tabs }: TabNavigationProps) {
  const pathname = usePathname()

  return (
    <div className="tab-navigation">
      <div className="tab-list">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`tab-item ${isActive ? 'active' : ''}`}
            >
              <span className="tab-label">{tab.label}</span>
              {tab.count && tab.count > 0 && (
                <span className="tab-badge">{tab.count}</span>
              )}

              {isActive && (
                <motion.div
                  className="tab-indicator"
                  layoutId="tab-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Usage
const DASHBOARD_TABS: Tab[] = [
  { id: 'overview', label: 'Overview', href: '/dashboard' },
  { id: 'tax-planning', label: 'Tax Planning', href: '/dashboard/tax-planning' },
  { id: 'portfolio', label: 'Portfolio', href: '/dashboard/portfolio' },
  { id: 'alerts', label: 'Alerts', href: '/dashboard/alerts', count: 3 }
]
```

**Props TypeScript:**
```typescript
interface Tab {
  id: string
  label: string
  href: string
  count?: number
}

interface TabNavigationProps {
  tabs: Tab[]
}
```

**Styles:**
```css
.tab-navigation {
  @apply border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900;
}

.tab-list {
  @apply flex gap-1 px-6;
}

.tab-item {
  @apply relative px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-2;
}

.tab-item.active {
  @apply text-violet-600 dark:text-violet-400;
}

.tab-badge {
  @apply px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full;
}

.tab-indicator {
  @apply absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600;
}
```

---

#### `DashboardHeader.tsx`

```typescript
// frontend/components/dashboard/layout/DashboardHeader.tsx

import { Search, Bell, User, Settings } from 'lucide-react'
import { useState } from 'react'

interface Notification {
  id: string
  type: 'alert' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface DashboardHeaderProps {
  userName?: string
  notifications?: Notification[]
  onSearch?: (query: string) => void
}

export function DashboardHeader({ userName, notifications = [], onSearch }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions, countries, features..."
            className="search-input"
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>

        <div className="header-actions">
          <button
            className="header-action-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          <button className="header-action-btn">
            <Settings className="w-5 h-5" />
          </button>

          <div className="header-user">
            <div className="user-avatar">
              <User className="w-4 h-4" />
            </div>
            <span className="user-name">{userName || 'User'}</span>
          </div>
        </div>
      </div>

      {showNotifications && (
        <NotificationDropdown
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </header>
  )
}
```

**Props TypeScript:**
```typescript
interface Notification {
  id: string
  type: 'alert' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface DashboardHeaderProps {
  userName?: string
  notifications?: Notification[]
  onSearch?: (query: string) => void
}
```

---

### 2. Hero Components

#### `HeroSection.tsx`

```typescript
// frontend/components/dashboard/hero/HeroSection.tsx

import { motion } from 'framer-motion'
import { MapPin, Edit2 } from 'lucide-react'
import { HeroStats } from './HeroStats'

interface HeroSectionProps {
  userName?: string
  taxJurisdiction?: {
    code: string
    name: string
    flag: string
  }
  stats: {
    portfolioValue: number
    unrealizedGains: number
    alertsCount: number
  }
  onChangeTaxJurisdiction?: () => void
}

export function HeroSection({
  userName,
  taxJurisdiction,
  stats,
  onChangeTaxJurisdiction
}: HeroSectionProps) {
  const timeOfDay = getTimeOfDay()
  const greeting = `Good ${timeOfDay}, ${userName || 'there'}! 👋`

  return (
    <motion.section
      className="hero-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="hero-content">
        <h1 className="hero-greeting">{greeting}</h1>

        {taxJurisdiction ? (
          <div className="hero-jurisdiction">
            <MapPin className="w-4 h-4" />
            <span className="jurisdiction-flag">{taxJurisdiction.flag}</span>
            <span className="jurisdiction-text">
              Tax Residence: {taxJurisdiction.name} ({new Date().getFullYear()})
            </span>
            <button
              className="jurisdiction-change-btn"
              onClick={onChangeTaxJurisdiction}
            >
              <Edit2 className="w-3 h-3" />
              Change
            </button>
          </div>
        ) : (
          <div className="hero-warning">
            <AlertTriangle className="w-5 h-5" />
            <span>⚠️ Set your tax jurisdiction for accurate calculations</span>
            <button
              className="btn-primary"
              onClick={onChangeTaxJurisdiction}
            >
              Set Now
            </button>
          </div>
        )}

        <HeroStats stats={stats} />
      </div>
    </motion.section>
  )
}

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}
```

**Props TypeScript:**
```typescript
interface HeroSectionProps {
  userName?: string
  taxJurisdiction?: {
    code: string      // "FR", "US", "PT", etc.
    name: string      // "France"
    flag: string      // "🇫🇷"
  }
  stats: {
    portfolioValue: number
    unrealizedGains: number
    alertsCount: number
  }
  onChangeTaxJurisdiction?: () => void
}
```

---

#### `HeroStats.tsx`

```typescript
// frontend/components/dashboard/hero/HeroStats.tsx

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'

interface Stat {
  label: string
  value: string | number
  change?: {
    value: number
    direction: 'up' | 'down'
  }
  type: 'currency' | 'number' | 'alert'
}

interface HeroStatsProps {
  stats: {
    portfolioValue: number
    unrealizedGains: number
    alertsCount: number
  }
}

export function HeroStats({ stats }: HeroStatsProps) {
  const statCards: Stat[] = [
    {
      label: 'Portfolio Value',
      value: stats.portfolioValue,
      type: 'currency'
    },
    {
      label: 'Unrealized Gains',
      value: stats.unrealizedGains,
      change: {
        value: 12.4,
        direction: stats.unrealizedGains > 0 ? 'up' : 'down'
      },
      type: 'currency'
    },
    {
      label: 'Alerts',
      value: stats.alertsCount,
      type: 'alert'
    }
  ]

  return (
    <div className="hero-stats">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="stat-header">
            <span className="stat-label">{stat.label}</span>
            {stat.change && (
              <span className={`stat-change ${stat.change.direction}`}>
                {stat.change.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stat.change.value}%
              </span>
            )}
          </div>

          <div className="stat-value">
            {stat.type === 'currency' ? (
              <>
                <DollarSign className="stat-icon" />
                {formatCurrency(stat.value as number)}
              </>
            ) : stat.type === 'alert' ? (
              <>
                <AlertCircle className="stat-icon text-red-500" />
                {stat.value}
              </>
            ) : (
              stat.value
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
```

---

### 3. Section Components

#### `QuickActionsSection.tsx`

```typescript
// frontend/components/dashboard/sections/QuickActionsSection.tsx

import { motion } from 'framer-motion'
import { FileText, Search, MessageSquare, Globe } from 'lucide-react'
import Link from 'next/link'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  variant: 'primary' | 'secondary'
}

export function QuickActionsSection() {
  const actions: QuickAction[] = [
    {
      id: 'new-simulation',
      label: 'New Simulation',
      description: 'Compare tax rates',
      icon: FileText,
      href: '/simulations/new',
      variant: 'primary'
    },
    {
      id: 'defi-audit',
      label: 'Run DeFi Audit',
      description: 'Analyze transactions',
      icon: Search,
      href: '/defi-audit',
      variant: 'primary'
    },
    {
      id: 'chat',
      label: 'Ask AI',
      description: 'Get tax advice',
      icon: MessageSquare,
      href: '/chat',
      variant: 'primary'
    },
    {
      id: 'compare',
      label: 'Compare Countries',
      description: 'Multi-country analysis',
      icon: Globe,
      href: '/simulations/compare',
      variant: 'secondary'
    }
  ]

  return (
    <section className="dashboard-section">
      <h2 className="section-title">🎯 Quick Actions</h2>

      <div className="quick-actions-grid">
        {actions.map((action, index) => {
          const Icon = action.icon

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={action.href}
                className={`quick-action-card ${action.variant}`}
              >
                <div className="action-icon">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="action-content">
                  <h3 className="action-label">{action.label}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
```

**Props TypeScript:**
```typescript
interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  variant: 'primary' | 'secondary'
}
```

---

#### `ActionRequiredSection.tsx`

```typescript
// frontend/components/dashboard/sections/ActionRequiredSection.tsx

import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  action: {
    label: string
    href: string
  }
}

interface ActionRequiredSectionProps {
  alerts: Alert[]
  onDismiss?: (alertId: string) => void
}

export function ActionRequiredSection({ alerts, onDismiss }: ActionRequiredSectionProps) {
  if (alerts.length === 0) return null

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <section className="dashboard-section">
      <h2 className="section-title">🚨 Action Required</h2>

      <div className="alerts-container">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            className={`alert-card alert-${alert.type}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="alert-icon">
              {getAlertIcon(alert.type)}
            </div>

            <div className="alert-content">
              <h3 className="alert-title">{alert.title}</h3>
              <p className="alert-message">{alert.message}</p>
            </div>

            <div className="alert-actions">
              <Link href={alert.action.href} className="btn-primary">
                {alert.action.label}
              </Link>
              {onDismiss && (
                <button
                  className="btn-ghost"
                  onClick={() => onDismiss(alert.id)}
                >
                  Dismiss
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

**Props TypeScript:**
```typescript
interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  action: {
    label: string
    href: string
  }
}

interface ActionRequiredSectionProps {
  alerts: Alert[]
  onDismiss?: (alertId: string) => void
}
```

---

#### `PortfolioOverviewSection.tsx`

```typescript
// frontend/components/dashboard/sections/PortfolioOverviewSection.tsx

import { motion } from 'framer-motion'
import { TokenDistributionChart } from '../charts/TokenDistributionChart'
import { CostBasisChart } from '../charts/CostBasisChart'

interface PortfolioData {
  tokens: Array<{
    symbol: string
    percentage: number
    value: number
    color: string
  }>
  costBasis: {
    totalCost: number
    currentValue: number
    unrealizedGainLoss: number
    gainLossPercentage: number
  }
}

interface PortfolioOverviewSectionProps {
  data: PortfolioData
  isLoading?: boolean
}

export function PortfolioOverviewSection({ data, isLoading }: PortfolioOverviewSectionProps) {
  if (isLoading) {
    return (
      <section className="dashboard-section">
        <h2 className="section-title">📊 Portfolio Overview</h2>
        <div className="charts-grid">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-section">
      <h2 className="section-title">📊 Portfolio Overview</h2>

      <div className="charts-grid">
        <motion.div
          className="chart-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="chart-title">Token Distribution</h3>
          <TokenDistributionChart tokens={data.tokens} />
        </motion.div>

        <motion.div
          className="chart-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="chart-title">Cost Basis vs Value</h3>
          <CostBasisChart data={data.costBasis} />
        </motion.div>
      </div>
    </section>
  )
}
```

**Props TypeScript:**
```typescript
interface PortfolioData {
  tokens: Array<{
    symbol: string
    percentage: number
    value: number
    color: string
  }>
  costBasis: {
    totalCost: number
    currentValue: number
    unrealizedGainLoss: number
    gainLossPercentage: number
  }
}

interface PortfolioOverviewSectionProps {
  data: PortfolioData
  isLoading?: boolean
}
```

---

#### `TaxOpportunitiesSection.tsx`

```typescript
// frontend/components/dashboard/sections/TaxOpportunitiesSection.tsx

import { motion } from 'framer-motion'
import { Target, TrendingDown, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface TaxOpportunity {
  id: string
  type: 'loss_harvesting' | 'holding_period' | 'rebalance'
  title: string
  description: string
  potentialSavings: number
  action: {
    label: string
    href: string
  }
}

interface TaxOpportunitiesSectionProps {
  opportunities: TaxOpportunity[]
  totalSavings: number
}

export function TaxOpportunitiesSection({ opportunities, totalSavings }: TaxOpportunitiesSectionProps) {
  if (opportunities.length === 0) return null

  const getOpportunityIcon = (type: TaxOpportunity['type']) => {
    switch (type) {
      case 'loss_harvesting':
        return <TrendingDown className="w-5 h-5" />
      case 'holding_period':
        return <Clock className="w-5 h-5" />
      case 'rebalance':
        return <Target className="w-5 h-5" />
    }
  }

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">💡 Tax Opportunities</h2>
        <div className="section-meta">
          <Target className="w-4 h-4" />
          <span>{opportunities.length} opportunities found</span>
          <span className="separator">•</span>
          <span className="text-green-600 font-semibold">
            Potential savings: ${totalSavings.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="opportunities-list">
        {opportunities.slice(0, 3).map((opportunity, index) => (
          <motion.div
            key={opportunity.id}
            className="opportunity-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="opportunity-icon">
              {getOpportunityIcon(opportunity.type)}
            </div>

            <div className="opportunity-content">
              <div className="opportunity-header">
                <span className="opportunity-index">{index + 1}.</span>
                <h3 className="opportunity-title">{opportunity.title}</h3>
              </div>
              <p className="opportunity-description">{opportunity.description}</p>
            </div>

            <div className="opportunity-savings">
              <DollarSign className="w-4 h-4" />
              <span className="savings-amount">
                Save ${opportunity.potentialSavings.toLocaleString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {opportunities.length > 3 && (
        <Link href="/tax-optimizer" className="btn-secondary w-full mt-4">
          View All {opportunities.length} Opportunities
        </Link>
      )}
    </section>
  )
}
```

**Props TypeScript:**
```typescript
interface TaxOpportunity {
  id: string
  type: 'loss_harvesting' | 'holding_period' | 'rebalance'
  title: string
  description: string
  potentialSavings: number
  action: {
    label: string
    href: string
  }
}

interface TaxOpportunitiesSectionProps {
  opportunities: TaxOpportunity[]
  totalSavings: number
}
```

---

#### `RecentActivitySection.tsx`

```typescript
// frontend/components/dashboard/sections/RecentActivitySection.tsx

import { motion } from 'framer-motion'
import { MessageSquare, Search, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Activity {
  id: string
  type: 'chat' | 'audit' | 'simulation' | 'cost_basis'
  title: string
  subtitle?: string
  timestamp: string
  status?: 'completed' | 'processing' | 'failed'
  href?: string
}

interface RecentActivitySectionProps {
  activities: Activity[]
}

export function RecentActivitySection({ activities }: RecentActivitySectionProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-4 h-4" />
      case 'audit':
        return <Search className="w-4 h-4" />
      case 'simulation':
        return <FileText className="w-4 h-4" />
      case 'cost_basis':
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const groupedActivities = groupByDate(activities)

  return (
    <section className="dashboard-section">
      <h2 className="section-title">📜 Recent Activity</h2>

      <div className="activity-timeline">
        {Object.entries(groupedActivities).map(([date, items]) => (
          <div key={date} className="activity-group">
            <div className="activity-date">{date}</div>

            {items.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="activity-icon-container">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="activity-content">
                  {activity.href ? (
                    <Link href={activity.href} className="activity-title-link">
                      {activity.title}
                    </Link>
                  ) : (
                    <span className="activity-title">{activity.title}</span>
                  )}
                  {activity.subtitle && (
                    <span className="activity-subtitle">{activity.subtitle}</span>
                  )}
                </div>

                {activity.status && (
                  <div className={`activity-status status-${activity.status}`}>
                    {activity.status === 'completed' && '✅'}
                    {activity.status === 'processing' && '⏳'}
                    {activity.status === 'failed' && '❌'}
                  </div>
                )}

                <span className="activity-timestamp">{activity.timestamp}</span>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <Link href="/history" className="btn-secondary w-full mt-4">
        View All Activity
      </Link>
    </section>
  )
}

function groupByDate(activities: Activity[]): Record<string, Activity[]> {
  // Group activities by "Today", "Yesterday", date
  // Implementation omitted for brevity
  return {}
}
```

**Props TypeScript:**
```typescript
interface Activity {
  id: string
  type: 'chat' | 'audit' | 'simulation' | 'cost_basis'
  title: string
  subtitle?: string
  timestamp: string
  status?: 'completed' | 'processing' | 'failed'
  href?: string
}

interface RecentActivitySectionProps {
  activities: Activity[]
}
```

---

### 4. Empty State Components

#### `NewUserEmptyState.tsx`

```typescript
// frontend/components/dashboard/empty-states/NewUserEmptyState.tsx

import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Step {
  number: number
  title: string
  description: string
  action: {
    label: string
    href: string
  }
  completed: boolean
}

interface NewUserEmptyStateProps {
  steps: Step[]
}

export function NewUserEmptyState({ steps }: NewUserEmptyStateProps) {
  const completedCount = steps.filter(s => s.completed).length

  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="empty-state-header">
        <h2 className="empty-state-title">Welcome to CryptoNomadHub! 🎉</h2>
        <p className="empty-state-description">
          Get started with these simple steps to optimize your crypto taxes
        </p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          {completedCount} of {steps.length} steps completed
        </span>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            className={`step-card ${step.completed ? 'completed' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="step-number-container">
              {step.completed ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <span className="step-number">{step.number}</span>
              )}
            </div>

            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>

            {!step.completed && (
              <Link href={step.action.href} className="step-action-btn">
                {step.action.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Usage example
const NEW_USER_STEPS: Step[] = [
  {
    number: 1,
    title: 'Set Your Tax Jurisdiction',
    description: 'Tell us where you file taxes for accurate calculations',
    action: { label: 'Set Jurisdiction', href: '/settings#tax-jurisdiction' },
    completed: false
  },
  {
    number: 2,
    title: 'Connect Wallet or Run Audit',
    description: 'Import your transactions to analyze your crypto activity',
    action: { label: 'Run DeFi Audit', href: '/defi-audit' },
    completed: false
  },
  {
    number: 3,
    title: 'Create Your First Simulation',
    description: 'Compare tax rates between countries and discover savings',
    action: { label: 'New Simulation', href: '/simulations/new' },
    completed: false
  }
]
```

**Props TypeScript:**
```typescript
interface Step {
  number: number
  title: string
  description: string
  action: {
    label: string
    href: string
  }
  completed: boolean
}

interface NewUserEmptyStateProps {
  steps: Step[]
}
```

---

## 🎨 DESIGN SYSTEM

### Design Tokens

```typescript
// frontend/lib/design-tokens.ts

export const designTokens = {
  colors: {
    // Brand colors
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',  // Main violet
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',  // Main fuchsia
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    // Neutrals
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
}
```

### Gradients

```typescript
// frontend/lib/gradients.ts

export const gradients = {
  primary: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
  primaryHover: 'bg-gradient-to-r from-violet-700 to-fuchsia-700',

  // Feature-specific gradients
  defiAudit: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  taxOptimizer: 'bg-gradient-to-r from-violet-500 to-fuchsia-500',
  costBasis: 'bg-gradient-to-r from-rose-500 to-pink-500',
  comparison: 'bg-gradient-to-r from-orange-500 to-red-500',
  chat: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',

  // Semantic gradients
  success: 'bg-gradient-to-r from-green-500 to-emerald-500',
  warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  error: 'bg-gradient-to-r from-red-500 to-pink-500',
}
```

---

## 🔌 API ENDPOINTS

### Endpoints Existants (à utiliser)

```typescript
// Déjà disponibles dans le backend

GET  /api/user/profile                    // User profile + tax jurisdiction
GET  /api/simulations/residency           // Liste simulations
GET  /api/defi/audits                     // Liste audits DeFi
GET  /api/cost-basis/portfolio            // Portfolio summary
GET  /api/cost-basis/lots                 // Cost basis lots
GET  /api/cost-basis/lots/unverified      // Lots non vérifiés
GET  /api/cost-basis/wash-sale-warnings   // Wash sale warnings
GET  /api/chat/conversations              // Liste conversations chat
GET  /api/tax-optimizer/opportunities     // Tax opportunities (à créer si n'existe pas)
```

### Nouveaux Endpoints Nécessaires

```python
# backend/app/routers/dashboard.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.models.user import User
from app.models.dashboard_activity import DashboardActivity
from app.schemas.dashboard import (
    DashboardOverview,
    DashboardStats,
    AlertResponse,
    ActivityResponse
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get complete dashboard overview
    Returns: stats, alerts, recent activity, tax opportunities
    """
    # Gather all data
    portfolio = await get_portfolio_summary(db, current_user.id)
    alerts = await get_user_alerts(db, current_user.id)
    activities = await get_recent_activities(db, current_user.id, limit=10)
    tax_opportunities = await get_tax_opportunities(db, current_user.id)

    return DashboardOverview(
        stats=DashboardStats(
            portfolio_value=portfolio.total_value_usd,
            unrealized_gains=portfolio.unrealized_gain_loss,
            alerts_count=len([a for a in alerts if not a.dismissed]),
            simulations_count=get_simulations_count(db, current_user.id),
            audits_count=get_audits_count(db, current_user.id)
        ),
        alerts=alerts,
        activities=activities,
        tax_opportunities=tax_opportunities,
        portfolio=portfolio
    )

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics only"""
    # Implementation
    pass

@router.get("/alerts", response_model=List[AlertResponse])
async def get_user_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    include_dismissed: bool = Query(False)
):
    """
    Get all alerts for user
    Types: missing_jurisdiction, unverified_lots, wash_sales, tax_opportunities
    """
    alerts = []

    # Check missing tax jurisdiction
    if not current_user.tax_jurisdiction:
        alerts.append(AlertResponse(
            id="alert_jurisdiction",
            type="critical",
            title="Set Your Tax Jurisdiction",
            message="Tax calculations require your jurisdiction to be accurate",
            action={"label": "Set Now", "href": "/settings#tax-jurisdiction"},
            created_at=datetime.utcnow().isoformat()
        ))

    # Check unverified lots
    unverified_count = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == current_user.id,
        CostBasisLot.verified == False
    ).count()

    if unverified_count > 0:
        alerts.append(AlertResponse(
            id="alert_unverified_lots",
            type="warning",
            title=f"{unverified_count} Cost Basis Lots Need Review",
            message="Verify your cost basis lots for accurate tax calculations",
            action={"label": "Review Now", "href": "/cost-basis/review"},
            created_at=datetime.utcnow().isoformat()
        ))

    # Check wash sales
    wash_sales = db.query(WashSaleWarning).filter(
        WashSaleWarning.user_id == current_user.id,
        WashSaleWarning.resolved == False
    ).count()

    if wash_sales > 0:
        alerts.append(AlertResponse(
            id="alert_wash_sales",
            type="critical",
            title=f"{wash_sales} Wash Sale Warnings Detected",
            message="Review transactions that may violate the 30-day wash sale rule",
            action={"label": "View Warnings", "href": "/cost-basis/wash-sales"},
            created_at=datetime.utcnow().isoformat()
        ))

    return alerts

@router.post("/alerts/{alert_id}/dismiss")
async def dismiss_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dismiss an alert"""
    # Save dismissal in user preferences or separate table
    # Implementation
    pass

@router.get("/activity", response_model=List[ActivityResponse])
async def get_recent_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, le=100),
    offset: int = Query(0)
):
    """Get recent user activity (audits, simulations, chat, cost basis)"""

    activities = []

    # Get recent simulations
    simulations = db.query(Simulation).filter(
        Simulation.user_id == current_user.id
    ).order_by(Simulation.created_at.desc()).limit(5).all()

    for sim in simulations:
        activities.append(ActivityResponse(
            id=f"sim_{sim.id}",
            type="simulation",
            title=f"Simulation: {sim.source_country} → {sim.target_country}",
            subtitle=f"Saved ${sim.potential_savings_usd:,.0f}",
            timestamp=sim.created_at.isoformat(),
            status="completed",
            href=f"/simulations/{sim.id}"
        ))

    # Get recent audits
    audits = db.query(DeFiAudit).filter(
        DeFiAudit.user_id == current_user.id
    ).order_by(DeFiAudit.created_at.desc()).limit(5).all()

    for audit in audits:
        activities.append(ActivityResponse(
            id=f"audit_{audit.id}",
            type="audit",
            title=f"DeFi Audit: {audit.total_transactions:,} transactions",
            subtitle=f"Volume: ${audit.total_volume_usd:,.0f}",
            timestamp=audit.created_at.isoformat(),
            status=audit.status,
            href=f"/defi-audit/{audit.id}"
        ))

    # Get recent chat conversations
    conversations = db.query(ChatConversation).filter(
        ChatConversation.user_id == current_user.id
    ).order_by(ChatConversation.updated_at.desc()).limit(5).all()

    for conv in conversations:
        activities.append(ActivityResponse(
            id=f"chat_{conv.id}",
            type="chat",
            title=f"Chat: {conv.title or 'New conversation'}",
            timestamp=conv.updated_at.isoformat(),
            href=f"/chat?conversation_id={conv.id}"
        ))

    # Sort by timestamp and limit
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    return activities[offset:offset+limit]

@router.post("/activity/log")
async def log_activity(
    activity_type: str,
    activity_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Log a user activity (for analytics)"""
    # Implementation
    pass
```

### Schemas Pydantic

```python
# backend/app/schemas/dashboard.py

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class DashboardStats(BaseModel):
    portfolio_value: float
    unrealized_gains: float
    alerts_count: int
    simulations_count: int
    audits_count: int

class AlertResponse(BaseModel):
    id: str
    type: str  # "critical" | "warning" | "info"
    title: str
    message: str
    action: Dict[str, str]  # {"label": "...", "href": "..."}
    created_at: str
    dismissed: bool = False

class ActivityResponse(BaseModel):
    id: str
    type: str  # "chat" | "audit" | "simulation" | "cost_basis"
    title: str
    subtitle: Optional[str] = None
    timestamp: str
    status: Optional[str] = None  # "completed" | "processing" | "failed"
    href: Optional[str] = None

class TaxOpportunityResponse(BaseModel):
    id: str
    type: str  # "loss_harvesting" | "holding_period" | "rebalance"
    title: str
    description: str
    potential_savings: float
    action: Dict[str, str]

class PortfolioSummary(BaseModel):
    total_value_usd: float
    total_cost_basis: float
    unrealized_gain_loss: float
    tokens: List[Dict[str, Any]]

class DashboardOverview(BaseModel):
    stats: DashboardStats
    alerts: List[AlertResponse]
    activities: List[ActivityResponse]
    tax_opportunities: List[TaxOpportunityResponse]
    portfolio: PortfolioSummary
```

---

## 🗄️ MODÈLES DE DONNÉES

### Nouveau Model: DashboardActivity

```python
# backend/app/models/dashboard_activity.py

from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import BaseModel

class DashboardActivity(BaseModel):
    """Log user activities for dashboard timeline"""
    __tablename__ = "dashboard_activities"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    activity_type = Column(String, nullable=False)  # chat, audit, simulation, cost_basis
    activity_id = Column(String, nullable=True)  # Reference ID (simulation_id, audit_id, etc)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)  # Additional data
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="dashboard_activities")

# Add to User model
class User(BaseModel):
    # ... existing fields
    dashboard_activities = relationship("DashboardActivity", back_populates="user", cascade="all, delete-orphan")
```

### Migration SQL

```sql
-- Create dashboard_activities table

CREATE TABLE dashboard_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dashboard_activities_user_id ON dashboard_activities(user_id);
CREATE INDEX idx_dashboard_activities_created_at ON dashboard_activities(created_at DESC);
CREATE INDEX idx_dashboard_activities_user_created ON dashboard_activities(user_id, created_at DESC);
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

```typescript
// frontend/lib/responsive.ts

export const breakpoints = {
  mobile: '< 640px',
  tablet: '640px - 1024px',
  desktop: '> 1024px'
}

export const sidebarBehavior = {
  mobile: 'hidden (hamburger menu)',
  tablet: 'bottom nav bar (fixed)',
  desktop: 'left sidebar (64px collapsed, 240px expanded)'
}

export const gridLayouts = {
  mobile: '1 column (full width)',
  tablet: '2 columns',
  desktop: '2-3 columns'
}
```

### Media Queries (Tailwind)

```css
/* Mobile (< 640px) */
.dashboard-sidebar {
  @apply hidden;
}

.tab-navigation {
  @apply overflow-x-auto;
}

.quick-actions-grid {
  @apply grid-cols-1 gap-3;
}

.charts-grid {
  @apply grid-cols-1 gap-4;
}

/* Tablet (640px - 1024px) */
@media (min-width: 640px) {
  .quick-actions-grid {
    @apply grid-cols-2;
  }

  .charts-grid {
    @apply grid-cols-1;
  }
}

/* Desktop (> 1024px) */
@media (min-width: 1024px) {
  .dashboard-sidebar {
    @apply block;
  }

  .quick-actions-grid {
    @apply grid-cols-2;
  }

  .charts-grid {
    @apply grid-cols-2;
  }

  .dashboard-main {
    @apply ml-16; /* Sidebar width collapsed */
  }
}
```

---

**Fin de Phase 3 - Spécifications Techniques**

---

## PHASE 4: RECOMMANDATIONS SPÉCIFIQUES

### Introduction

Cette phase détaille les patterns d'interaction, états, flows et accessibilité pour garantir une expérience utilisateur optimale et inclusive.

---

## 🚀 ONBOARDING FLOW

### Flow Complet pour Nouveaux Utilisateurs

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 0: First Login (après inscription)                     │
├─────────────────────────────────────────────────────────────┤
│ • Redirect automatique vers /dashboard                      │
│ • Dashboard détecte: user.simulations_count == 0            │
│                      user.audits_count == 0                 │
│                      user.tax_jurisdiction == null          │
│ • Affiche: NewUserEmptyState avec 3 steps                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Set Tax Jurisdiction ⚠️ CRITIQUE                   │
├─────────────────────────────────────────────────────────────┤
│ User clique: "Set Jurisdiction"                            │
│   → Redirect: /settings#tax-jurisdiction                    │
│   → Modal s'ouvre avec JurisdictionSelector                │
│                                                             │
│ User sélectionne pays:                                      │
│   1. Recherche par nom ou code (autocomplete)              │
│   2. Sélectionne dans liste (groupé par région)            │
│   3. Confirme: "Set as Tax Residence"                      │
│                                                             │
│ Backend:                                                    │
│   POST /api/user/profile { "tax_jurisdiction": "FR" }      │
│                                                             │
│ Success:                                                    │
│   → Toast: "Tax jurisdiction set to France 🇫🇷"           │
│   → Redirect: /dashboard                                   │
│   → Step 1 marqué "completed" ✅                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Connect Wallet OR Run Audit                        │
├─────────────────────────────────────────────────────────────┤
│ User clique: "Run DeFi Audit"                              │
│   → Redirect: /defi-audit                                  │
│                                                             │
│ User remplit formulaire:                                    │
│   1. Wallet address (EVM ou Solana)                        │
│   2. Sélectionne blockchains (multi-select)                │
│   3. Date range (optionnel)                                │
│   4. Clique: "Start Audit"                                 │
│                                                             │
│ Backend:                                                    │
│   POST /api/defi/audit { wallet, chains, date_range }      │
│   → Audit créé avec status: "processing"                   │
│                                                             │
│ Frontend:                                                   │
│   → Redirect: /defi-audit/{audit_id}                       │
│   → Affiche: Progress bar avec status                      │
│   → Polling: GET /api/defi/audit/{id}/status (every 3s)    │
│                                                             │
│ Quand status == "completed":                                │
│   → Affiche résultats (transactions, volume, gains/pertes) │
│   → Step 2 marqué "completed" ✅                           │
│   → Redirect: /dashboard (automatique après 5s)            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Create First Simulation                            │
├─────────────────────────────────────────────────────────────┤
│ User clique: "New Simulation"                              │
│   → Redirect: /simulations/new                             │
│                                                             │
│ User remplit formulaire:                                    │
│   1. Source country (pré-rempli avec tax_jurisdiction)     │
│   2. Target country (sélection dans liste 160+ pays)       │
│   3. Short-term gains (optionnel)                          │
│   4. Long-term gains (optionnel)                           │
│   5. Clique: "Compare"                                     │
│                                                             │
│ Backend:                                                    │
│   POST /api/simulations/residency { source, target, ... }  │
│                                                             │
│ Frontend:                                                   │
│   → Affiche résultats comparison                           │
│   → Visual bars (source vs target tax rates)               │
│   → Potential savings highlighted                          │
│   → CTA: "Save Simulation"                                 │
│                                                             │
│ User clique: "Save Simulation"                             │
│   → Simulation enregistrée en DB                           │
│   → Step 3 marqué "completed" ✅                           │
│   → Redirect: /dashboard                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ ONBOARDING COMPLETE 🎉                                      │
├─────────────────────────────────────────────────────────────┤
│ Dashboard affiche maintenant:                               │
│   • Hero avec juridiction fiscale visible                   │
│   • Stats réelles (portfolio, simulations, audits)         │
│   • Recent activity (simulation + audit)                    │
│   • Alerts si nécessaires (unverified lots, etc.)          │
│   • Plus de NewUserEmptyState                              │
│                                                             │
│ Confetti animation + Toast:                                │
│   "🎉 Onboarding complete! Your dashboard is ready"        │
└─────────────────────────────────────────────────────────────┘
```

### Onboarding Variants

**Variant A: User saute des steps**
```typescript
// Si user clique ailleurs pendant onboarding
const onboardingProgress = {
  step1_completed: user.tax_jurisdiction !== null,
  step2_completed: user.audits_count > 0,
  step3_completed: user.simulations_count > 0
}

// Afficher progress partial
if (!allStepsCompleted(onboardingProgress)) {
  // Afficher banner sticky en haut du dashboard
  <OnboardingProgressBanner progress={onboardingProgress} />
}
```

**Variant B: User revient après plusieurs jours**
```typescript
// Si user revient et onboarding incomplet
if (daysSinceSignup > 3 && !allStepsCompleted) {
  // Afficher modal "Welcome back! Complete your setup"
  <OnboardingReminderModal />
}
```

---

## 🎭 EMPTY STATES

### 1. New User Empty State

**Trigger:** `user.simulations_count == 0 && user.audits_count == 0`

**Composant:** `NewUserEmptyState` (déjà spécifié en Phase 3)

**Content:**
- Title: "Welcome to CryptoNomadHub! 🎉"
- Description: "Get started with these simple steps to optimize your crypto taxes"
- 3 steps avec progress bar
- Visual: Illustration onboarding (optionnel)

---

### 2. No Simulations Empty State

**Trigger:** Onglet "Tax Planning" + `user.simulations_count == 0`

**Composant:**
```typescript
// frontend/components/dashboard/empty-states/NoSimulationsEmptyState.tsx

export function NoSimulationsEmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <FileText className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="empty-state-title">No Simulations Yet</h2>
      <p className="empty-state-description">
        Compare tax rates between countries to find the best jurisdiction for your crypto taxes
      </p>
      <div className="empty-state-actions">
        <Link href="/simulations/new" className="btn-primary">
          Create Your First Simulation
        </Link>
        <Link href="/simulations/compare" className="btn-secondary">
          Compare Multiple Countries
        </Link>
      </div>
      <div className="empty-state-help">
        <p className="text-sm text-gray-500">
          Not sure where to start?{' '}
          <Link href="/chat" className="text-violet-600 hover:underline">
            Ask our AI assistant
          </Link>
        </p>
      </div>
    </div>
  )
}
```

---

### 3. No Audits Empty State

**Trigger:** Dashboard "Overview" + `user.audits_count == 0`

**Composant:**
```typescript
// frontend/components/dashboard/empty-states/NoAuditsEmptyState.tsx

export function NoAuditsEmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Search className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="empty-state-title">No DeFi Audits Yet</h2>
      <p className="empty-state-description">
        Analyze your on-chain transactions across 50+ blockchains to track your crypto activity
      </p>
      <div className="empty-state-features">
        <ul className="feature-list">
          <li>✅ Multi-chain support (EVM + Solana)</li>
          <li>✅ Automatic transaction categorization</li>
          <li>✅ Tax liability calculation</li>
          <li>✅ Export to CSV/PDF</li>
        </ul>
      </div>
      <Link href="/defi-audit" className="btn-primary">
        Run Your First Audit
      </Link>
    </div>
  )
}
```

---

### 4. No Cost Basis Lots Empty State

**Trigger:** Onglet "Portfolio" + `cost_basis_lots.length == 0`

**Composant:**
```typescript
export function NoCostBasisEmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Wallet className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="empty-state-title">No Cost Basis Lots</h2>
      <p className="empty-state-description">
        Track your crypto purchases to accurately calculate gains and losses
      </p>
      <div className="empty-state-actions">
        <Link href="/cost-basis/add" className="btn-primary">
          Add Manual Lot
        </Link>
        <button className="btn-secondary">
          Import from CSV
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Or run a DeFi Audit to automatically import your transactions
      </p>
    </div>
  )
}
```

---

### 5. No Alerts Empty State

**Trigger:** Onglet "Alerts" + `alerts.length == 0`

**Composant:**
```typescript
export function NoAlertsEmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      <h2 className="empty-state-title">All Clear! 🎉</h2>
      <p className="empty-state-description">
        No action required. Your account is in good shape.
      </p>
      <div className="empty-state-suggestions">
        <h3 className="font-semibold mb-2">Suggested Actions:</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/tax-optimizer" className="text-violet-600 hover:underline">
              Check for tax optimization opportunities
            </Link>
          </li>
          <li>
            <Link href="/simulations/new" className="text-violet-600 hover:underline">
              Explore tax benefits in other countries
            </Link>
          </li>
          <li>
            <Link href="/chat" className="text-violet-600 hover:underline">
              Ask AI about tax strategies
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
```

---

### 6. No Tax Opportunities Empty State

**Trigger:** `tax_opportunities.length == 0`

**Composant:**
```typescript
export function NoTaxOpportunitiesEmptyState() {
  return (
    <div className="empty-state-inline">
      <Target className="w-8 h-8 text-gray-400" />
      <div>
        <h3 className="font-semibold">No Opportunities Found</h3>
        <p className="text-sm text-gray-500">
          Your portfolio is already optimized. Check back later or add more transactions.
        </p>
      </div>
    </div>
  )
}
```

---

### 7. No Recent Activity Empty State

**Trigger:** `activities.length == 0`

**Composant:**
```typescript
export function NoActivityEmptyState() {
  return (
    <div className="empty-state-inline">
      <Activity className="w-8 h-8 text-gray-400" />
      <div>
        <h3 className="font-semibold">No Recent Activity</h3>
        <p className="text-sm text-gray-500">
          Your activity will appear here as you use CryptoNomadHub
        </p>
      </div>
    </div>
  )
}
```

---

## ⏳ LOADING STATES

### 1. Dashboard Overview Loading

**Pattern: Skeleton Screens**

```typescript
// frontend/components/dashboard/skeletons/DashboardSkeleton.tsx

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton animate-pulse">
      {/* Hero Skeleton */}
      <div className="hero-skeleton">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="section-skeleton mt-8">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="section-skeleton mt-8">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}
```

**Usage:**
```typescript
export default function DashboardPage() {
  const { data, isLoading } = useDashboardOverview()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return <Dashboard data={data} />
}
```

---

### 2. Chart Loading

**Pattern: Spinner + Message**

```typescript
export function ChartSkeleton() {
  return (
    <div className="chart-skeleton">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading chart data...</p>
        </div>
      </div>
    </div>
  )
}
```

---

### 3. Table Loading (Activity Timeline)

**Pattern: Skeleton Rows**

```typescript
export function ActivitySkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="activity-skeleton space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  )
}
```

---

### 4. Stats Loading

**Pattern: Shimmer Effect**

```typescript
export function StatsSkeleton() {
  return (
    <div className="stats-skeleton grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="stat-card-skeleton bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer h-24 rounded"
        />
      ))}
    </div>
  )
}

// CSS for shimmer
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
  background-size: 1000px 100%;
}
```

---

### 5. Button Loading State

**Pattern: Spinner + Disabled**

```typescript
interface ButtonProps {
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ loading, children, onClick, ...props }: ButtonProps) {
  return (
    <button
      className="btn-primary"
      disabled={loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Usage
<Button loading={isSubmitting} onClick={handleSubmit}>
  Create Simulation
</Button>
```

---

### 6. Progressive Loading (Lazy Load Sections)

**Pattern: Intersection Observer**

```typescript
export function DashboardOverview() {
  return (
    <div className="dashboard-overview">
      <HeroSection {...heroData} />
      <QuickActionsSection />

      {/* Load below-fold content lazily */}
      <LazyLoad offset={200}>
        <PortfolioOverviewSection {...portfolioData} />
      </LazyLoad>

      <LazyLoad offset={200}>
        <TaxOpportunitiesSection {...opportunitiesData} />
      </LazyLoad>

      <LazyLoad offset={200}>
        <RecentActivitySection {...activitiesData} />
      </LazyLoad>
    </div>
  )
}
```

---

## ❌ ERROR STATES

### 1. API Error (Network Failure)

**Pattern: Error Boundary + Retry**

```typescript
// frontend/components/dashboard/ErrorBoundary.tsx

export function DashboardError({ error, retry }: { error: Error, retry: () => void }) {
  return (
    <div className="error-state">
      <div className="error-icon">
        <AlertTriangle className="w-16 h-16 text-red-500" />
      </div>
      <h2 className="error-title">Failed to Load Dashboard</h2>
      <p className="error-message">
        {error.message || "An unexpected error occurred"}
      </p>
      <div className="error-actions">
        <button onClick={retry} className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
        <Link href="/" className="btn-secondary">
          Go to Home
        </Link>
      </div>
      <details className="error-details">
        <summary className="text-sm text-gray-500 cursor-pointer">
          Technical Details
        </summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
          {error.stack}
        </pre>
      </details>
    </div>
  )
}
```

**Usage:**
```typescript
export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardOverview()

  if (error) {
    return <DashboardError error={error} retry={refetch} />
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return <Dashboard data={data} />
}
```

---

### 2. Partial Error (Section Failed)

**Pattern: Inline Error with Retry**

```typescript
export function SectionError({ title, retry }: { title: string, retry: () => void }) {
  return (
    <div className="section-error">
      <AlertCircle className="w-5 h-5 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-medium">Failed to load {title}</p>
        <button onClick={retry} className="text-sm text-violet-600 hover:underline">
          Try again
        </button>
      </div>
    </div>
  )
}

// Usage in PortfolioOverviewSection
export function PortfolioOverviewSection() {
  const { data, error, refetch } = usePortfolioData()

  if (error) {
    return <SectionError title="Portfolio Overview" retry={refetch} />
  }

  return <PortfolioCharts data={data} />
}
```

---

### 3. No Data vs Error

**Important: Distinguer entre "No Data" (empty state) et "Error"**

```typescript
// ✅ GOOD: Clear distinction
if (error) {
  return <ErrorState />
}

if (!data || data.length === 0) {
  return <EmptyState />
}

return <DataView data={data} />

// ❌ BAD: Confusing
if (!data) {
  return <EmptyState />  // Ambiguous: is it loading, error, or truly empty?
}
```

---

### 4. Form Validation Errors

**Pattern: Inline + Toast**

```typescript
export function SimulationForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: FormData) => {
    const newErrors: Record<string, string> = {}

    if (!data.sourceCountry) {
      newErrors.sourceCountry = "Source country is required"
    }

    if (!data.targetCountry) {
      newErrors.targetCountry = "Target country is required"
    }

    if (data.sourceCountry === data.targetCountry) {
      newErrors.targetCountry = "Target country must be different from source"
    }

    return newErrors
  }

  const handleSubmit = async (data: FormData) => {
    const validationErrors = validate(data)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error("Please fix the errors before submitting")
      return
    }

    // Submit...
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Source Country</label>
        <CountrySelect
          value={sourceCountry}
          onChange={setSourceCountry}
          error={errors.sourceCountry}
        />
        {errors.sourceCountry && (
          <p className="form-error">{errors.sourceCountry}</p>
        )}
      </div>
      {/* ... */}
    </form>
  )
}
```

---

## 📱 RESPONSIVE BREAKPOINTS EXACTS

### Breakpoints Tailwind

```typescript
// tailwind.config.js

module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile → Tablet
      'md': '768px',   // Tablet
      'lg': '1024px',  // Tablet → Desktop
      'xl': '1280px',  // Desktop large
      '2xl': '1536px', // Desktop extra large
    }
  }
}
```

### Layout Behavior by Breakpoint

| Breakpoint | Sidebar | Tabs | Grid (Actions) | Grid (Charts) | Hero |
|------------|---------|------|----------------|---------------|------|
| **< 640px** (Mobile) | Hidden (hamburger) | Horizontal scroll | 1 col | 1 col | Stack vertical |
| **640px - 1024px** (Tablet) | Bottom nav | Full width | 2 col | 1 col | 2 col stats |
| **> 1024px** (Desktop) | Left sidebar (64px) | Full width | 2 col | 2 col | 3 col stats |
| **> 1280px** (Desktop XL) | Left sidebar (64px) | Full width | 3 col | 2 col | 3 col stats |

### Component-Specific Responsive Rules

```typescript
// DashboardSidebar
<aside className="
  hidden lg:flex                    // Hidden mobile, visible desktop
  w-16 lg:w-16 hover:lg:w-60       // Width: 64px collapsed, 240px expanded
  fixed left-0 top-0 h-screen      // Fixed position
  transition-all duration-200      // Smooth transitions
">

// TabNavigation
<nav className="
  overflow-x-auto lg:overflow-visible  // Scroll mobile, full desktop
  scrollbar-hide                       // Hide scrollbar
">

// Hero Stats
<div className="
  grid grid-cols-1 gap-4           // 1 col mobile
  sm:grid-cols-2 sm:gap-6          // 2 col tablet
  lg:grid-cols-3 lg:gap-6          // 3 col desktop
">

// Quick Actions
<div className="
  grid grid-cols-1 gap-3           // 1 col mobile
  sm:grid-cols-2 sm:gap-4          // 2 col tablet
  lg:grid-cols-2 lg:gap-6          // 2 col desktop (intentional)
  xl:grid-cols-3 xl:gap-6          // 3 col desktop XL
">

// Charts Grid
<div className="
  grid grid-cols-1 gap-4           // 1 col mobile/tablet
  lg:grid-cols-2 lg:gap-6          // 2 col desktop
">

// Dashboard Main Content
<main className="
  w-full px-4 py-6                 // Full width mobile
  sm:px-6 sm:py-8                  // Tablet padding
  lg:ml-16 lg:px-8 lg:py-10        // Desktop: offset sidebar
">
```

---

## ♿ ACCESSIBILITY (WCAG 2.1 AA)

### Checklist Complet

#### 1. Keyboard Navigation

```typescript
// ✅ All interactive elements accessible via keyboard

// Tab order logical
<nav>
  <a href="/dashboard" tabIndex={0}>Dashboard</a>
  <a href="/chat" tabIndex={0}>Chat AI</a>
  <a href="/defi-audit" tabIndex={0}>DeFi Audit</a>
</nav>

// Skip to main content link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault()
          openSearch()
          break
        case 'd':
          e.preventDefault()
          router.push('/dashboard')
          break
      }
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

---

#### 2. Screen Reader Support

```typescript
// ✅ ARIA labels, roles, live regions

// Button with aria-label
<button aria-label="Open notifications" aria-expanded={showNotifications}>
  <Bell className="w-5 h-5" />
  {unreadCount > 0 && (
    <span className="sr-only">{unreadCount} unread notifications</span>
  )}
</button>

// Loading state announcement
<div aria-live="polite" aria-atomic="true">
  {isLoading && <span className="sr-only">Loading dashboard data...</span>}
</div>

// Form fields with labels
<label htmlFor="source-country" className="form-label">
  Source Country
</label>
<select id="source-country" aria-required="true" aria-invalid={!!errors.sourceCountry}>
  <option value="">Select country</option>
  {/* ... */}
</select>
{errors.sourceCountry && (
  <p id="source-country-error" role="alert" className="form-error">
    {errors.sourceCountry}
  </p>
)}

// Status messages
<div role="status" aria-live="polite">
  {alert && <Alert {...alert} />}
</div>

// Navigation landmark
<nav aria-label="Main navigation">
  <DashboardSidebar />
</nav>

// Main content landmark
<main id="main-content" aria-label="Dashboard content">
  <Dashboard />
</main>
```

---

#### 3. Color Contrast (WCAG AA: 4.5:1)

```typescript
// ✅ All text meets contrast requirements

// Color contrast checker (online tools):
// - WebAIM Contrast Checker
// - Coolors Contrast Checker

// Good contrast examples:
const colors = {
  // Text on white background
  textPrimary: '#111827',      // gray-900 (15.8:1) ✅
  textSecondary: '#4b5563',    // gray-600 (7.5:1) ✅
  textTertiary: '#6b7280',     // gray-500 (4.9:1) ✅

  // Text on dark background
  textOnDark: '#f9fafb',       // gray-50 (16.1:1) ✅

  // Links
  linkPrimary: '#7e22ce',      // violet-700 (5.2:1) ✅
  linkHover: '#6b21a8',        // violet-800 (6.8:1) ✅

  // Buttons
  buttonPrimary: '#9333ea',    // violet-600 (4.6:1 on white text) ✅
  buttonDisabled: '#9ca3af',   // gray-400 (avoid for text) ⚠️
}

// ❌ BAD: Low contrast
<p className="text-gray-400">Important text</p>  // 2.5:1 ratio

// ✅ GOOD: High contrast
<p className="text-gray-600">Important text</p>  // 7.5:1 ratio
```

---

#### 4. Focus Indicators

```css
/* ✅ Visible focus indicators */

/* Global focus style */
*:focus {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
}

/* Custom focus for buttons */
.btn:focus-visible {
  @apply ring-2 ring-violet-600 ring-offset-2;
}

/* Custom focus for links */
a:focus-visible {
  @apply outline-none ring-2 ring-violet-600 ring-offset-2 rounded;
}

/* Skip removing outline unless providing alternative */
/* ❌ BAD */
button:focus {
  outline: none;  /* No alternative provided */
}

/* ✅ GOOD */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.5);
}
```

---

#### 5. Semantic HTML

```typescript
// ✅ Use semantic elements

// ❌ BAD
<div className="header">
  <div className="nav">
    <div className="link">Dashboard</div>
  </div>
</div>

// ✅ GOOD
<header>
  <nav aria-label="Main navigation">
    <a href="/dashboard">Dashboard</a>
  </nav>
</header>

// Headings hierarchy (h1 → h2 → h3, no skips)
<main>
  <h1>Dashboard</h1>
  <section>
    <h2>Quick Actions</h2>
    <div>...</div>
  </section>
  <section>
    <h2>Portfolio Overview</h2>
    <div>
      <h3>Token Distribution</h3>
      {/* ... */}
    </div>
  </section>
</main>
```

---

#### 6. Alternative Text for Images/Icons

```typescript
// ✅ Icons with text labels or aria-labels

// Icon with visible label
<button>
  <Search className="w-4 h-4" />
  <span>Search</span>
</button>

// Icon-only button with aria-label
<button aria-label="Close modal">
  <X className="w-4 h-4" />
</button>

// Decorative icon (hidden from screen readers)
<div>
  <Sparkles aria-hidden="true" className="w-4 h-4" />
  <span>Premium Feature</span>
</div>

// Charts with descriptions
<div role="img" aria-label="Token distribution pie chart showing ETH 45%, BTC 30%, SOL 15%, Others 10%">
  <PieChart data={tokens} />
</div>
```

---

#### 7. Form Accessibility

```typescript
// ✅ Complete form accessibility

<form onSubmit={handleSubmit} aria-label="Create simulation">
  <fieldset>
    <legend className="text-lg font-semibold mb-4">
      Tax Simulation Details
    </legend>

    {/* Input with label and error */}
    <div className="form-field">
      <label htmlFor="source-country" className="form-label">
        Source Country <span aria-label="required">*</span>
      </label>
      <select
        id="source-country"
        name="sourceCountry"
        aria-required="true"
        aria-invalid={!!errors.sourceCountry}
        aria-describedby={errors.sourceCountry ? "source-country-error" : undefined}
      >
        <option value="">Select a country</option>
        {/* ... */}
      </select>
      {errors.sourceCountry && (
        <p id="source-country-error" role="alert" className="form-error">
          <AlertCircle aria-hidden="true" className="w-4 h-4" />
          {errors.sourceCountry}
        </p>
      )}
    </div>

    {/* Submit button with loading state */}
    <button
      type="submit"
      disabled={isSubmitting}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 aria-hidden="true" className="animate-spin" />
          <span>Creating simulation...</span>
        </>
      ) : (
        'Create Simulation'
      )}
    </button>
  </fieldset>
</form>
```

---

#### 8. Motion & Animation

```typescript
// ✅ Respect prefers-reduced-motion

// CSS
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// Framer Motion
import { useReducedMotion } from 'framer-motion'

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    >
      {children}
    </motion.div>
  )
}
```

---

#### 9. Minimum Touch Target Size

```css
/* ✅ Minimum 44x44px clickable area (WCAG 2.1 Level AAA) */

/* All buttons and links */
.btn,
a.clickable {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Icon buttons */
.icon-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Small text links get padding */
a.text-sm {
  padding: 8px 4px;  /* Increases click area */
}
```

---

#### 10. Language Declaration

```html
<!-- ✅ Declare language -->
<html lang="en">
  <head>
    <title>CryptoNomadHub - Dashboard</title>
  </head>
  <body>
    <!-- Content in French -->
    <section lang="fr">
      <h2>Bienvenue sur votre tableau de bord</h2>
    </section>
  </body>
</html>
```

---

### Accessibility Testing Checklist

```markdown
## Manual Testing

- [ ] Navigate entire dashboard using only keyboard (Tab, Enter, Escape, Arrows)
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Verify all interactive elements have visible focus indicators
- [ ] Check color contrast with browser extension (WAVE, Axe DevTools)
- [ ] Test with browser zoom at 200%
- [ ] Test with prefers-reduced-motion enabled
- [ ] Verify all forms can be completed with keyboard only
- [ ] Check that all images/icons have appropriate alt text or aria-labels

## Automated Testing

- [ ] Run axe-core accessibility tests
- [ ] Run Lighthouse accessibility audit (score > 90)
- [ ] Use pa11y for automated WCAG checks
- [ ] Test with keyboard navigation automation (playwright)

## Tools

- Chrome: Lighthouse, axe DevTools, WAVE
- Firefox: Accessibility Inspector
- Screen Readers: NVDA (Windows), VoiceOver (Mac), JAWS
- Color: WebAIM Contrast Checker
- Automation: axe-core, pa11y, cypress-axe
```

---

**Fin de Phase 4 - Recommandations Spécifiques**

---

## PHASE 5: PLAN D'IMPLÉMENTATION

### Introduction

Cette phase finale fournit le plan d'exécution complet pour implémenter le Concept B. Chaque tâche est numérotée, estimée en complexité, et ordonnée selon les dépendances.

---

## 📋 RÉSUMÉ EXÉCUTIF

### Métriques Globales

| Métrique | Valeur |
|----------|--------|
| **Tâches totales** | 45 |
| **Durée estimée** | 8-12 jours (1-2 semaines) |
| **Complexité moyenne** | Moyenne |
| **Breaking changes** | Minimal (routing uniquement) |
| **Fichiers à créer** | ~25 composants + 3 API files |
| **Fichiers à modifier** | 5 existants |
| **Migration nécessaire** | Non (pas de changement DB) |

---

## 🎯 SPRINTS PROPOSÉS

### Sprint 1: Backend & Infrastructure (2-3 jours)
- Tasks 1-10: Setup backend, API, models
- Livrable: API dashboard fonctionnelle

### Sprint 2: Layout & Navigation (2-3 jours)
- Tasks 11-20: Sidebar, header, tabs, layout
- Livrable: Structure navigable

### Sprint 3: Sections & Content (3-4 jours)
- Tasks 21-35: Hero, quick actions, sections, charts
- Livrable: Dashboard complet avec données

### Sprint 4: Polish & Testing (1-2 jours)
- Tasks 36-45: Empty states, loading, errors, a11y, tests
- Livrable: Dashboard production-ready

---

## 📝 TASKS DÉTAILLÉES

### 🔧 SPRINT 1: Backend & Infrastructure

#### Task 1: Créer modèle DashboardActivity
**Fichier:** `backend/app/models/dashboard_activity.py`
**Type:** CREATE
**Complexité:** 🟢 Facile (30 min)
**Dépendances:** Aucune

**Actions:**
```python
# Créer le fichier avec le modèle SQLAlchemy
# Ajouter relationship au User model
```

**Test:**
```bash
# Vérifier que le modèle s'importe sans erreur
python -c "from app.models.dashboard_activity import DashboardActivity"
```

---

#### Task 2: Créer migration DB pour dashboard_activities
**Fichier:** `backend/migrations/versions/XXX_add_dashboard_activities.py`
**Type:** CREATE
**Complexité:** 🟢 Facile (15 min)
**Dépendances:** Task 1

**Actions:**
```bash
# Créer migration avec Alembic
cd backend
alembic revision --autogenerate -m "Add dashboard_activities table"
alembic upgrade head
```

**Vérification:**
```sql
-- Se connecter à PostgreSQL
\dt dashboard_activities
\d dashboard_activities
```

---

#### Task 3: Créer schemas Pydantic dashboard
**Fichier:** `backend/app/schemas/dashboard.py`
**Type:** CREATE
**Complexité:** 🟢 Facile (30 min)
**Dépendances:** Aucune

**Actions:**
```python
# Créer tous les schemas:
# - DashboardStats
# - AlertResponse
# - ActivityResponse
# - TaxOpportunityResponse
# - PortfolioSummary
# - DashboardOverview
```

---

#### Task 4: Créer router dashboard.py
**Fichier:** `backend/app/routers/dashboard.py`
**Type:** CREATE
**Complexité:** 🟡 Moyen (2h)
**Dépendances:** Task 3

**Actions:**
```python
# Créer endpoints:
# - GET /dashboard/overview
# - GET /dashboard/stats
# - GET /dashboard/alerts
# - GET /dashboard/activity
# - POST /dashboard/alerts/{id}/dismiss
# - POST /dashboard/activity/log
```

**Test:**
```bash
# Tester chaque endpoint avec curl
curl -X GET http://localhost:8001/api/dashboard/overview \
  -H "Authorization: Bearer $TOKEN"
```

---

#### Task 5: Implémenter get_user_alerts()
**Fichier:** `backend/app/routers/dashboard.py`
**Type:** MODIFY
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Task 4

**Actions:**
- Vérifier tax_jurisdiction manquant
- Compter unverified cost basis lots
- Compter wash sale warnings
- Retourner liste AlertResponse

---

#### Task 6: Implémenter get_recent_activities()
**Fichier:** `backend/app/routers/dashboard.py`
**Type:** MODIFY
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Task 4

**Actions:**
- Query simulations récentes
- Query audits récents
- Query conversations chat
- Merger et trier par timestamp

---

#### Task 7: Implémenter get_tax_opportunities()
**Fichier:** `backend/app/routers/dashboard.py` ou `backend/app/services/tax_optimizer.py`
**Type:** CREATE/MODIFY
**Complexité:** 🟡 Moyen (1.5h)
**Dépendances:** Task 4

**Actions:**
- Analyser cost basis lots pour loss harvesting
- Détecter holding periods proches long-term
- Suggérer rebalancing opportunités
- Calculer potential savings

---

#### Task 8: Enregistrer router dans main.py
**Fichier:** `backend/app/main.py`
**Type:** MODIFY
**Complexité:** 🟢 Facile (5 min)
**Dépendances:** Task 4

**Actions:**
```python
from app.routers import dashboard

app.include_router(dashboard.router, prefix="/api")
```

---

#### Task 9: Créer tests unitaires backend
**Fichiers:** `backend/tests/test_dashboard_router.py`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Tasks 4-7

**Actions:**
```python
# Tests pour:
# - GET /dashboard/overview (avec et sans données)
# - GET /dashboard/alerts (différents cas)
# - GET /dashboard/activity
# - Validation schemas Pydantic
```

**Run:**
```bash
pytest backend/tests/test_dashboard_router.py -v
```

---

#### Task 10: Documentation API Swagger
**Fichier:** `backend/app/routers/dashboard.py`
**Type:** MODIFY
**Complexité:** 🟢 Facile (30 min)
**Dépendances:** Task 4

**Actions:**
- Ajouter docstrings détaillées pour chaque endpoint
- Exemples de réponses
- Tags appropriés

**Vérification:**
```
http://localhost:8001/docs#/dashboard
```

---

### 🎨 SPRINT 2: Layout & Navigation

#### Task 11: Créer design-tokens.ts
**Fichier:** `frontend/lib/design-tokens.ts`
**Type:** CREATE
**Complexité:** 🟢 Facile (20 min)
**Dépendances:** Aucune

**Actions:**
- Copier design tokens depuis Phase 3
- Export const designTokens

---

#### Task 12: Créer gradients.ts
**Fichier:** `frontend/lib/gradients.ts`
**Type:** CREATE
**Complexité:** 🟢 Facile (10 min)
**Dépendances:** Aucune

---

#### Task 13: Créer DashboardSidebar component
**Fichier:** `frontend/components/dashboard/layout/DashboardSidebar.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1.5h)
**Dépendances:** Aucune

**Actions:**
- Implémenter avec Framer Motion
- Hover expansion
- Active state avec layoutId
- Mobile: hidden

**Test:**
- Vérifier hover expansion
- Tester navigation
- Responsive mobile/desktop

---

#### Task 14: Créer TabNavigation component
**Fichier:** `frontend/components/dashboard/layout/TabNavigation.tsx`
**Type:** CREATE
**Complexité:** 🟢 Facile (45 min)
**Dépendances:** Aucune

**Actions:**
- Tabs avec motion indicator
- Badge count
- Responsive scroll

---

#### Task 15: Créer DashboardHeader component
**Fichier:** `frontend/components/dashboard/layout/DashboardHeader.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Aucune

**Actions:**
- Search bar
- Notifications dropdown
- User menu

---

#### Task 16: Créer dashboard layout.tsx
**Fichier:** `frontend/app/dashboard/layout.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Tasks 13-15

**Actions:**
```typescript
export default function DashboardLayout({ children }) {
  return (
    <>
      <DashboardSidebar />
      <div className="dashboard-container">
        <DashboardHeader />
        <TabNavigation tabs={DASHBOARD_TABS} />
        <main className="dashboard-main">{children}</main>
      </div>
    </>
  )
}
```

---

#### Task 17: Créer pages onglets
**Fichiers:**
- `frontend/app/dashboard/page.tsx` (Overview)
- `frontend/app/dashboard/tax-planning/page.tsx`
- `frontend/app/dashboard/portfolio/page.tsx`
- `frontend/app/dashboard/alerts/page.tsx`

**Type:** CREATE
**Complexité:** 🟢 Facile (1h total)
**Dépendances:** Task 16

**Actions:**
- Créer structure de base pour chaque onglet
- Placeholder content temporaire

---

#### Task 18: Créer hook useDashboardOverview
**Fichier:** `frontend/hooks/useDashboardOverview.ts`
**Type:** CREATE
**Complexité:** 🟢 Facile (30 min)
**Dépendances:** Aucune

**Actions:**
```typescript
export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/overview')
      return res.json()
    }
  })
}
```

---

#### Task 19: Configurer React Query Provider
**Fichier:** `frontend/app/providers.tsx`
**Type:** MODIFY
**Complexité:** 🟢 Facile (15 min)
**Dépendances:** Aucune

**Actions:**
- Wrap app avec QueryClientProvider
- Configure staleTime, cacheTime

---

#### Task 20: Test navigation complète
**Type:** TEST
**Complexité:** 🟢 Facile (30 min)
**Dépendances:** Tasks 13-17

**Actions:**
- Naviguer entre tous les onglets
- Vérifier sidebar responsive
- Tester keyboard navigation
- Vérifier active states

---

### 🎯 SPRINT 3: Sections & Content

#### Task 21: Créer HeroSection component
**Fichier:** `frontend/components/dashboard/hero/HeroSection.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Aucune

---

#### Task 22: Créer HeroStats component
**Fichier:** `frontend/components/dashboard/hero/HeroStats.tsx`
**Type:** CREATE
**Complexité:** 🟢 Facile (45 min)
**Dépendances:** Aucune

---

#### Task 23: Créer QuickActionsSection
**Fichier:** `frontend/components/dashboard/sections/QuickActionsSection.tsx`
**Type:** CREATE
**Complexité:** 🟢 Facile (45 min)
**Dépendances:** Aucune

---

#### Task 24: Créer ActionRequiredSection
**Fichier:** `frontend/components/dashboard/sections/ActionRequiredSection.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Task 18 (données alerts)

**Actions:**
- Afficher alerts depuis API
- Dismiss functionality
- Icons conditionnels selon type

---

#### Task 25: Créer PortfolioOverviewSection
**Fichier:** `frontend/components/dashboard/sections/PortfolioOverviewSection.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Tasks 26-27

---

#### Task 26: Créer TokenDistributionChart
**Fichier:** `frontend/components/dashboard/charts/TokenDistributionChart.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1.5h)
**Dépendances:** Aucune

**Actions:**
- Utiliser recharts ou chart.js
- Pie chart responsive
- Tooltips
- Legend

**Install:**
```bash
npm install recharts
```

---

#### Task 27: Créer CostBasisChart
**Fichier:** `frontend/components/dashboard/charts/CostBasisChart.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1.5h)
**Dépendances:** Aucune

**Actions:**
- Bar chart comparatif
- Cost basis vs Current value
- Gain/loss highlight

---

#### Task 28: Créer TaxOpportunitiesSection
**Fichier:** `frontend/components/dashboard/sections/TaxOpportunitiesSection.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Task 18

---

#### Task 29: Créer RecentActivitySection
**Fichier:** `frontend/components/dashboard/sections/RecentActivitySection.tsx`
**Type:** CREATE
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Task 18

**Actions:**
- Timeline component
- Group by date (Today, Yesterday, etc.)
- Icons par type d'activité

---

#### Task 30: Assembler dashboard/page.tsx (Overview)
**Fichier:** `frontend/app/dashboard/page.tsx`
**Type:** MODIFY
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Tasks 21-29

**Actions:**
```typescript
export default function DashboardOverview() {
  const { data, isLoading, error } = useDashboardOverview()

  if (isLoading) return <DashboardSkeleton />
  if (error) return <DashboardError error={error} />

  // Detect new user
  const isNewUser = data.stats.simulations_count === 0 &&
                    data.stats.audits_count === 0

  if (isNewUser) {
    return <NewUserEmptyState />
  }

  return (
    <>
      <HeroSection {...} />
      <QuickActionsSection />
      {data.alerts.length > 0 && <ActionRequiredSection alerts={data.alerts} />}
      <PortfolioOverviewSection data={data.portfolio} />
      {data.tax_opportunities.length > 0 && <TaxOpportunitiesSection {...} />}
      <RecentActivitySection activities={data.activities} />
    </>
  )
}
```

---

#### Task 31: Implémenter onglet Tax Planning
**Fichier:** `frontend/app/dashboard/tax-planning/page.tsx`
**Type:** MODIFY
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Tasks précédentes

**Actions:**
- Liste simulations avec stats
- Button "New Simulation"
- Filter/sort options

---

#### Task 32: Implémenter onglet Portfolio
**Fichier:** `frontend/app/dashboard/portfolio/page.tsx`
**Type:** MODIFY
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Tasks précédentes

**Actions:**
- Cost basis lots table
- Charts détaillés
- Wash sale warnings section

---

#### Task 33: Implémenter onglet Alerts
**Fichier:** `frontend/app/dashboard/alerts/page.tsx`
**Type:** MODIFY
**Complexité:** 🟢 Facile (45 min)
**Dépendances:** Task 24

**Actions:**
- Liste complète des alerts
- Filter par type
- Bulk dismiss

---

#### Task 34: Ajouter transitions Framer Motion
**Fichiers:** Tous les components sections
**Type:** MODIFY
**Complexité:** 🟢 Facile (1h)
**Dépendances:** Tasks 21-33

**Actions:**
- Ajouter initial/animate props
- Stagger animations
- Respect prefers-reduced-motion

---

#### Task 35: Test données réelles end-to-end
**Type:** TEST
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Tasks 1-34

**Actions:**
- Créer user test avec données complètes
- Vérifier tous les onglets
- Vérifier tous les states (loading, error, success)

---

### ✨ SPRINT 4: Polish & Testing

#### Task 36: Créer tous les empty states
**Fichiers:**
- `frontend/components/dashboard/empty-states/NewUserEmptyState.tsx`
- `frontend/components/dashboard/empty-states/NoSimulationsEmptyState.tsx`
- `frontend/components/dashboard/empty-states/NoAuditsEmptyState.tsx`
- `frontend/components/dashboard/empty-states/NoCostBasisEmptyState.tsx`
- `frontend/components/dashboard/empty-states/NoAlertsEmptyState.tsx`

**Type:** CREATE
**Complexité:** 🟡 Moyen (2h total)
**Dépendances:** Aucune

---

#### Task 37: Créer tous les loading states
**Fichiers:**
- `frontend/components/dashboard/skeletons/DashboardSkeleton.tsx`
- `frontend/components/dashboard/skeletons/ChartSkeleton.tsx`
- `frontend/components/dashboard/skeletons/ActivitySkeleton.tsx`
- `frontend/components/dashboard/skeletons/StatsSkeleton.tsx`

**Type:** CREATE
**Complexité:** 🟢 Facile (1h total)
**Dépendances:** Aucune

---

#### Task 38: Créer error states
**Fichiers:**
- `frontend/components/dashboard/errors/DashboardError.tsx`
- `frontend/components/dashboard/errors/SectionError.tsx`

**Type:** CREATE
**Complexité:** 🟢 Facile (30 min)
**Dépendances:** Aucune

---

#### Task 39: Implémenter tous les empty/loading/error states
**Fichiers:** Tous les page.tsx et sections
**Type:** MODIFY
**Complexité:** 🟡 Moyen (1.5h)
**Dépendances:** Tasks 36-38

**Actions:**
- Ajouter conditions pour chaque state
- Tester chaque path

---

#### Task 40: Accessibility audit & fixes
**Type:** TEST + FIX
**Complexité:** 🟡 Moyen (2h)
**Dépendances:** Toutes les tasks précédentes

**Actions:**
- Run Lighthouse audit (target score >90)
- Run axe-core tests
- Fix all issues found
- Test keyboard navigation
- Test screen reader (NVDA/VoiceOver)

**Checklist:**
```bash
# Lighthouse
npm run lighthouse

# axe-core
npm run test:a11y

# Manual
- [ ] Tab through entire dashboard
- [ ] Test with screen reader
- [ ] Verify focus indicators
- [ ] Check color contrast
- [ ] Test at 200% zoom
```

---

#### Task 41: Responsive testing & fixes
**Type:** TEST + FIX
**Complexité:** 🟡 Moyen (1.5h)
**Dépendances:** Toutes les tasks précédentes

**Actions:**
```markdown
Test sur:
- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px)
- [ ] Desktop XL (1920px)

Vérifier:
- [ ] Sidebar behavior
- [ ] Tabs scroll
- [ ] Grids adapt correctly
- [ ] Charts responsive
- [ ] Touch targets 44x44px minimum
```

---

#### Task 42: Performance optimization
**Type:** OPTIMIZE
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Toutes les tasks précédentes

**Actions:**
- Lazy load below-fold content
- Optimize images/icons
- Code splitting par route
- Memoize expensive computations
- Debounce API calls

**Metrics cibles:**
- Lighthouse Performance > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s

---

#### Task 43: Créer tests E2E Playwright
**Fichier:** `frontend/tests/e2e/dashboard.spec.ts`
**Type:** CREATE
**Complexité:** 🟡 Moyen (2h)
**Dépendances:** Toutes les tasks précédentes

**Actions:**
```typescript
test('Dashboard overview loads for authenticated user', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.locator('h1')).toContainText('Good')
  await expect(page.locator('[data-testid="hero-stats"]')).toBeVisible()
})

test('Navigate between tabs', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('text=Tax Planning')
  await expect(page).toHaveURL('/dashboard/tax-planning')
})

test('New user sees onboarding', async ({ page }) => {
  // Mock empty data
  await page.goto('/dashboard')
  await expect(page.locator('text=Welcome to CryptoNomadHub')).toBeVisible()
})
```

**Run:**
```bash
npx playwright test
```

---

#### Task 44: Documentation utilisateur
**Fichier:** `DASHBOARD_USER_GUIDE.md`
**Type:** CREATE
**Complexité:** 🟢 Facile (1h)
**Dépendances:** Toutes les tasks précédentes

**Actions:**
- Guide pour nouveaux utilisateurs
- Explication de chaque section
- Screenshots
- FAQ

---

#### Task 45: Code review & cleanup
**Type:** REVIEW
**Complexité:** 🟡 Moyen (1h)
**Dépendances:** Toutes les tasks précédentes

**Actions:**
- Revoir tous les composants
- Supprimer console.logs
- Vérifier imports inutilisés
- Formatter avec Prettier
- Linter avec ESLint
- Type check avec TypeScript

**Commands:**
```bash
npm run lint
npm run type-check
npm run format
```

---

## 🔄 MIGRATION STRATEGY

### Pas de Migration Nécessaire ✅

**Bonne nouvelle:** Aucune migration de données n'est nécessaire car :

1. **Base de données :**
   - Nouvelle table `dashboard_activities` ajoutée (pas de modification des existantes)
   - Toutes les données utilisateur préservées
   - Aucun breaking change dans les models existants

2. **Routes :**
   - Nouveau router `/api/dashboard/*` ajouté
   - Toutes les routes existantes fonctionnent toujours
   - Breaking change: `/dashboard` route frontend (voir ci-dessous)

3. **Frontend :**
   - Nouvelle structure de dashboard
   - Ancienne page `/dashboard` remplacée
   - **Action requise :** Redirection si users ont bookmarké l'ancien dashboard

### Changements Breaking

#### 1. Route Frontend `/dashboard`

**Avant :**
```
/dashboard → Page dashboard simple (ancienne version)
```

**Après :**
```
/dashboard → Nouveau dashboard avec layout + onglets
/dashboard/tax-planning → Nouvel onglet
/dashboard/portfolio → Nouvel onglet
/dashboard/alerts → Nouvel onglet
```

**Mitigation :** Aucune action nécessaire (simple remplacement)

---

#### 2. Composants dashboard supprimés

**Fichiers à supprimer (après validation que nouveau dashboard fonctionne) :**
```bash
# Backup d'abord
mv frontend/app/dashboard/page.tsx frontend/app/dashboard/page.tsx.backup

# Supprimer après vérification (Sprint 4, Task 45)
rm frontend/app/dashboard/page.tsx.backup
```

---

## ⚠️ RISQUES & CONTINGENCES

### Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| API lente (>2s) | Moyenne | Élevé | Ajouter loading states, cache, pagination |
| Charts ne s'affichent pas | Faible | Moyen | Fallback vers tableau, skeleton pendant load |
| Mobile layout cassé | Faible | Élevé | Tests responsive obligatoires (Task 41) |
| A11y non-conforme | Moyenne | Élevé | Audit obligatoire (Task 40) avant deploy |
| Trop de requêtes API | Moyenne | Moyen | Combiner dans `/dashboard/overview` |
| User confus (nouveau layout) | Moyenne | Moyen | Tooltip tours, documentation, feedback button |

---

## 📊 CRITÈRES DE SUCCÈS

### Métriques Techniques

- [ ] **Performance**
  - Lighthouse Performance > 90
  - FCP < 1.5s
  - TTI < 3s
  - No layout shifts (CLS < 0.1)

- [ ] **Accessibilité**
  - Lighthouse Accessibility > 90
  - axe-core: 0 violations
  - Keyboard navigation complète
  - Screen reader compatible

- [ ] **Qualité Code**
  - TypeScript: 0 errors
  - ESLint: 0 errors
  - Test coverage > 80%
  - All E2E tests pass

### Métriques UX

- [ ] **Nouveau utilisateur**
  - Peut compléter onboarding en < 5 min
  - Comprend où cliquer (heatmap)
  - Score UX target: 8/10

- [ ] **Utilisateur actif**
  - Trouve info en < 3 clics
  - Charge dashboard en < 2s
  - Score UX target: 9/10

- [ ] **Responsive**
  - Fonctionne sur mobile (>375px)
  - Fonctionne sur tablet
  - Fonctionne sur desktop

---

## 🚀 DÉPLOIEMENT

### Checklist Pre-Deployment

```bash
# Backend
cd backend
pytest -v                              # All tests pass
alembic upgrade head                   # Migration applied
python -m app.main                     # Server starts

# Frontend
cd frontend
npm run type-check                     # No TypeScript errors
npm run lint                           # No ESLint errors
npm run build                          # Build succeeds
npm run test                           # All tests pass
npx playwright test                    # E2E tests pass

# Integration
curl http://localhost:8001/api/dashboard/overview  # API responds
open http://localhost:3001/dashboard              # Frontend loads
```

---

### Stratégie de Déploiement

**Option 1: Blue-Green Deployment (Recommandé)**
1. Déployer nouveau dashboard sur route `/dashboard-v2`
2. Tester en production avec users beta
3. Basculer `/dashboard` → nouveau dashboard
4. Garder ancien en `/dashboard-v1` (fallback 7 jours)

**Option 2: Feature Flag**
```typescript
// Frontend
const useNewDashboard = useFeatureFlag('new-dashboard')

export default function Dashboard() {
  if (useNewDashboard) {
    return <NewDashboard />
  }
  return <OldDashboard />
}
```

**Option 3: Direct Replacement (Plus simple)**
1. Backup ancien dashboard
2. Deploy nouveau dashboard
3. Monitor errors 24h
4. Rollback si issues critiques

---

### Rollback Plan

Si problèmes critiques après déploiement :

```bash
# 1. Rollback frontend
git revert <commit-hash>
npm run build && deploy

# 2. Rollback backend (si nécessaire)
cd backend
alembic downgrade -1
git revert <commit-hash>
deploy

# 3. Restore old dashboard (si backup)
mv frontend/app/dashboard/page.tsx.backup frontend/app/dashboard/page.tsx
```

---

## 📈 POST-LAUNCH

### Monitoring (Première Semaine)

**Metrics à surveiller:**
- [ ] API `/dashboard/overview` latency < 500ms (p95)
- [ ] Error rate < 1%
- [ ] User engagement (time on dashboard)
- [ ] Bounce rate dashboard < 10%
- [ ] Mobile usage rate

**Tools:**
- Sentry (errors)
- Google Analytics (engagement)
- Lighthouse CI (performance)
- Hotjar (heatmaps, recordings)

---

### Feedback Collection

**Semaine 1-2:**
- Ajouter feedback button sur dashboard
- Survey popup (non-intrusive) : "How do you like the new dashboard?" (1-5 stars)
- Monitor support tickets dashboard-related

**Semaine 3-4:**
- Analyser feedback
- Identifier top 3 pain points
- Planifier itération v1.1

---

### Itération v1.1 (Optionnel - 1 mois après v1.0)

**Basé sur feedback users:**
- Ajouter features manquantes
- Fix UX issues identifiés
- Optimize performance si nécessaire
- Ajouter tooltips/tours si confusion

---

## 📁 FICHIERS À CRÉER/MODIFIER/SUPPRIMER

### Fichiers à CRÉER (25 nouveaux)

**Backend (7 fichiers):**
```
backend/app/models/dashboard_activity.py
backend/app/schemas/dashboard.py
backend/app/routers/dashboard.py
backend/migrations/versions/XXX_add_dashboard_activities.py
backend/tests/test_dashboard_router.py
backend/app/services/tax_optimizer.py (si n'existe pas)
backend/app/services/dashboard_utils.py
```

**Frontend Components (18 fichiers):**
```
frontend/lib/design-tokens.ts
frontend/lib/gradients.ts
frontend/hooks/useDashboardOverview.ts

frontend/components/dashboard/layout/
  - DashboardSidebar.tsx
  - DashboardHeader.tsx
  - TabNavigation.tsx

frontend/components/dashboard/hero/
  - HeroSection.tsx
  - HeroStats.tsx

frontend/components/dashboard/sections/
  - QuickActionsSection.tsx
  - ActionRequiredSection.tsx
  - PortfolioOverviewSection.tsx
  - TaxOpportunitiesSection.tsx
  - RecentActivitySection.tsx

frontend/components/dashboard/charts/
  - TokenDistributionChart.tsx
  - CostBasisChart.tsx
  - ChartSkeleton.tsx

frontend/components/dashboard/empty-states/
  - NewUserEmptyState.tsx
  - NoSimulationsEmptyState.tsx
  - NoAuditsEmptyState.tsx
  - NoCostBasisEmptyState.tsx
  - NoAlertsEmptyState.tsx

frontend/components/dashboard/skeletons/
  - DashboardSkeleton.tsx
  - ActivitySkeleton.tsx
  - StatsSkeleton.tsx

frontend/components/dashboard/errors/
  - DashboardError.tsx
  - SectionError.tsx
```

---

### Fichiers à MODIFIER (5 fichiers)

```
backend/app/main.py                    # Register dashboard router
backend/app/models/user.py             # Add dashboard_activities relationship

frontend/app/dashboard/layout.tsx      # NEW layout avec sidebar
frontend/app/dashboard/page.tsx        # REPLACE avec nouveau dashboard
frontend/app/providers.tsx             # Add QueryClientProvider
```

---

### Fichiers à SUPPRIMER (1 fichier - après validation)

```
frontend/app/dashboard/page.tsx.backup  # Ancien dashboard (backup seulement)
```

---

## ✅ VALIDATION FINALE

### Avant de Commencer le Code

**Checklist de validation :**

- [ ] User a validé le Concept B choisi
- [ ] User a lu et approuvé les spécifications techniques (Phase 3)
- [ ] User a lu et approuvé les recommandations (Phase 4)
- [ ] User comprend le plan d'implémentation (Phase 5)
- [ ] User accepte la durée estimée (8-12 jours)
- [ ] User accepte les breaking changes minimaux
- [ ] Environnement dev fonctionnel (backend + frontend)
- [ ] Base de données accessible
- [ ] Tests actuels passent

---

## 🎯 COMMANDE DE LANCEMENT

**Une fois validé, je procéderai dans cet ordre :**

```bash
# Phase 1: Backend Setup (Tasks 1-10)
# ✅ Créer models, schemas, routers
# ✅ Tester API endpoints
# ✅ Documentation Swagger

# Phase 2: Layout & Navigation (Tasks 11-20)
# ✅ Créer sidebar, header, tabs
# ✅ Setup routing
# ✅ Test navigation

# Phase 3: Content & Sections (Tasks 21-35)
# ✅ Créer hero, sections, charts
# ✅ Assembler dashboard pages
# ✅ Test avec données réelles

# Phase 4: Polish & Testing (Tasks 36-45)
# ✅ Empty/loading/error states
# ✅ Accessibility audit
# ✅ Performance optimization
# ✅ E2E tests
# ✅ Code review
```

---

**FIN DE PHASE 5 - Plan d'Implémentation**

**FIN DU DOCUMENT D'AUDIT COMPLET**

---

## 📝 RÉCAPITULATIF FINAL

### Ce qui a été livré

✅ **Phase 1 : Audit Complet**
- Inventaire exhaustif de 15 fonctionnalités
- Analyse de 10 problèmes UX critiques
- Parcours utilisateur documenté
- Données disponibles identifiées

✅ **Phase 2 : 3 Concepts de Dashboard**
- Concept A : Conservateur (2-3 jours, UX 7-8/10)
- **Concept B : Moderne (1-2 semaines, UX 9/10)** ⭐ CHOISI
- Concept C : Innovant (2-4 semaines, UX 10/10) → Sauvegardé comme roadmap premium

✅ **Phase 3 : Spécifications Techniques**
- 15+ composants React documentés avec code complet
- Props TypeScript détaillées
- 6 nouveaux endpoints API backend
- Nouveau model DB + migration SQL
- Design system complet (tokens, gradients, typography)
- Responsive specs (mobile/tablet/desktop)

✅ **Phase 4 : Recommandations Spécifiques**
- Onboarding flow complet (3 steps)
- 7 empty states différents
- 6 loading states (skeletons, spinners)
- Error handling patterns
- Responsive breakpoints exacts
- Accessibility checklist WCAG 2.1 AA complet

✅ **Phase 5 : Plan d'Implémentation**
- 45 tasks détaillées et numérotées
- 4 sprints organisés (8-12 jours total)
- Estimation de complexité par task
- Dépendances identifiées
- 25 fichiers à créer, 5 à modifier
- Breaking changes documentés
- Migration strategy (aucune migration nécessaire ✅)
- Critères de succès définis
- Plan de déploiement + rollback

---

### Métriques du Projet

| Métrique | Valeur |
|----------|--------|
| **Pages d'audit** | 70+ pages |
| **Composants spécifiés** | 25+ |
| **Endpoints API** | 6 nouveaux |
| **Tasks d'implémentation** | 45 |
| **Durée estimée** | 8-12 jours |
| **UX improvement attendu** | +4 points (5/10 → 9/10) |
| **Breaking changes** | Minimal (routing uniquement) |

---

### Prochaine Étape

**🎯 Attente de validation utilisateur pour commencer l'implémentation**

**Questions à confirmer :**
1. ✅ Concept B validé ?
2. ✅ Timing acceptable (1-2 semaines) ?
3. ✅ Breaking changes acceptés ?
4. ✅ Prêt à commencer le code ?

**Si tout est validé, je commence par :**
→ **Task 1 : Créer modèle DashboardActivity** (Backend Sprint 1)

