# 📖 GUIDE UTILISATEUR - FONCTIONNALITÉS FISCALES

**CryptoNomadHub - Tax Features**
**Version:** 2.0
**Dernière mise à jour:** 18 Octobre 2025

---

## 🎯 INTRODUCTION

Ce guide vous explique comment utiliser toutes les fonctionnalités fiscales de CryptoNomadHub, notamment :
- ✅ Tax Jurisdiction (Résidence fiscale)
- ✅ Tax Optimizer (Optimisation fiscale)
- ✅ Cost Basis Calculator (Calcul de coût de base)
- ✅ Interactive Tax Calculator (Calculateur interactif)

---

## 🌍 TAX JURISDICTION - OÙ TROUVER ?

### ❓ C'est quoi ?

Votre **tax jurisdiction** (résidence fiscale) détermine :
- Les taux d'imposition applicables (short-term / long-term)
- Les règles fiscales spécifiques (wash sale rule, holding period)
- Les calculs dans Tax Optimizer, Cost Basis, etc.

### 📍 OÙ LA DÉFINIR ?

#### **Option 1: Page Settings (RECOMMANDÉ)**

1. Cliquez sur votre **avatar/nom** en haut à droite
2. Sélectionnez **"Settings"**
3. Scrollez jusqu'à la section **"Tax Jurisdiction"** (icône 📍 verte)
4. Cliquez sur le **dropdown** pour sélectionner votre pays
5. Vérifiez les **taux affichés** (short-term / long-term)
6. Cliquez sur **"Save Jurisdiction"**

✅ **Avantages:**
- Interface complète avec explications
- Affichage des taux en temps réel
- Sauvegarde dans tous les modules

---

#### **Option 2: Depuis Tax Optimizer**

1. Allez sur **"/tax-optimizer"**
2. En haut de la page, vous verrez un **badge**:
   - 🔴 **"Tax Jurisdiction Not Set"** (rouge) si non défini
   - 🟢 **"🇫🇷 France"** (avec drapeau) si défini
3. Cliquez sur le **badge** ou sur **"Set Now"**
4. Sélectionnez votre pays dans le dropdown
5. Cliquez sur **"Save"**

✅ **Avantages:**
- Accès rapide depuis Tax Optimizer
- Refresh automatique de l'analyse

---

### 🗺️ PAYS DISPONIBLES

**150+ pays supportés**, incluant :

#### Pays 0% crypto tax:
- 🇵🇹 **Portugal** (0% individuel)
- 🇦🇪 **UAE (Dubai)** (0% général)
- 🇧🇭 **Bahrain** (0%)
- 🇧🇲 **Bermuda** (0%)
- 🇰🇾 **Cayman Islands** (0%)

#### Pays avec taux modérés:
- 🇨🇭 **Switzerland** (Cantonal, ~7-13%)
- 🇩🇪 **Germany** (0% si hold >1 an)
- 🇸🇬 **Singapore** (0% pour individus)
- 🇲🇹 **Malta** (0-35%)

#### Pays avec taux élevés:
- 🇺🇸 **USA** (37% short / 20% long)
- 🇫🇷 **France** (30% flat)
- 🇬🇧 **UK** (20-45%)
- 🇯🇵 **Japan** (15-55%)

---

## 💰 TAX OPTIMIZER - COMMENT L'UTILISER ?

### 📊 Fonctionnalités

Le Tax Optimizer vous aide à :
1. **Tax Loss Harvesting** - Identifier les pertes à réaliser pour réduire vos impôts
2. **Optimal Timing** - Calculer le meilleur moment pour vendre (short-term vs long-term)
3. **Wash Sale Avoidance** (US uniquement) - Éviter la règle des 30 jours
4. **Holding Period Tracking** - Suivre les lots proches du long-term (365 jours)

### 🎯 Flow complet

#### **Étape 1: Définir votre juridiction**

**IMPORTANT:** Avant toute analyse, définissez votre tax jurisdiction (voir section précédente).

Sans juridiction définie:
- ❌ Calculs incorrects
- ❌ Taux par défaut (US)
- ❌ Résultats non pertinents

---

#### **Étape 2: Analyser votre portefeuille**

1. Allez sur **"/tax-optimizer"**
2. Vérifiez que votre juridiction est affichée (badge en haut)
3. Cliquez sur **"Refresh Analysis"**
4. Attendez ~2-5 secondes (analyse en cours)

**L'analyse affiche:**
- 📊 **Portfolio Value** - Valeur totale
- 📈 **Unrealized Gain/Loss** - Plus/moins-values latentes
- 💵 **Potential Tax Savings** - Économies possibles
- 🎯 **Opportunities** - Nombre d'opportunités détectées

---

#### **Étape 3: Explorer les opportunités**

Chaque opportunité affiche:
- **Token** (ex: ETH, BTC)
- **Chain** (ethereum, polygon, etc.)
- **Unrealized G/L** - Plus/moins-value
- **Potential Savings** - Économie fiscale si réalisé
- **Confidence** - Score de confiance (0-100%)
- **Risk Level** - Faible/Moyen/Élevé
- **Recommended Action** - Action suggérée

**Types d'opportunités:**
1. **Tax Loss Harvest** - Vendre à perte pour réduire impôts
2. **Timing Optimization** - Attendre X jours pour long-term
3. **Short to Long-Term** - Lots proches des 365 jours

---

#### **Étape 4: Timing Calculator**

Pour calculer le meilleur moment de vente:

1. Cliquez sur l'onglet **"Timing Calculator"**
2. Entrez:
   - **Token Symbol** (ex: ETH)
   - **Chain** (ethereum, polygon, etc.)
3. Cliquez sur **"Calculate"**

**Résultat:**
- Liste de tous vos lots (par acquisition)
- Holding days (jours détenus)
- Status: Short-term / Long-term
- Days to long-term (si short-term)
- Estimated tax (impôt estimé)
- **Timing recommendation** (action suggérée)

**Exemples de recommandations:**
- ✅ "Hold 45 more days for long-term rate (save $2,500)"
- ✅ "Already long-term, sell when profitable"
- ✅ "Sell now to harvest loss (-$1,200 tax savings)"

---

## 📘 COST BASIS CALCULATOR

### 📍 Où ?

**"/cost-basis"** - Calcule votre coût de base (prix d'acquisition moyen)

### ⚙️ Paramètres

Dans Settings → Cost Basis (ou depuis la page Cost Basis):

**1. Cost Basis Method:**
- **FIFO** (First In First Out) - Par défaut, le plus ancien d'abord
- **LIFO** (Last In First Out) - Le plus récent d'abord
- **HIFO** (Highest In First Out) - Le plus cher d'abord
- **Average Cost** - Prix moyen

**2. Tax Jurisdiction:**
- Utilise la juridiction définie dans Settings
- Affecte les calculs de tax rates

**3. Wash Sale Rule:**
- ✅ Activé **automatiquement** si juridiction = US
- ❌ Désactivé pour toutes les autres juridictions
- ⚠️ Wash sale = règle des 30 jours (ne pas racheter <30j après vente à perte)

---

## 🧮 INTERACTIVE TAX CALCULATOR

### 📍 Où ?

**Homepage** (page d'accueil) - Section "Calculate Your Potential Savings"

### 🎯 Utilisation

1. **Current Country** - Sélectionnez votre pays actuel
2. **Target Country** - Sélectionnez le pays cible (ex: Portugal)
3. **Crypto Gains (USD)** - Montant de vos gains ($100,000 par défaut)
4. Résultat instantané:
   - **Current Tax** - Impôt pays actuel
   - **New Tax** - Impôt pays cible
   - **Potential Savings** - Économies si migration

**Exemple:**
```
From: 🇺🇸 USA → To: 🇵🇹 Portugal
Amount: $100,000
Current Tax: $20,000 (20%)
New Tax: $0 (0%)
💰 Savings: $20,000
```

---

## ❓ TOOLTIPS ÉDUCATIFS

Lorsque vous voyez un terme souligné avec un **?** (icône), passez la souris dessus pour voir:

### 📚 Tooltips disponibles:

#### 1. **Wash Sale Rule**
- Définition: Règle des 30 jours (US uniquement)
- Lien: IRS Publication 550

#### 2. **Holding Period**
- Définition: Période de détention pour long-term (365 jours)
- Lien: Investopedia

#### 3. **Tax Loss Harvesting**
- Définition: Vendre à perte pour réduire impôts
- Lien: Investopedia

#### 4. **Capital Gains**
- Définition: Plus-value (short-term vs long-term)
- Lien: Investopedia

**Où les trouver ?**
- Page Tax Optimizer → Section "Tax Optimization Strategies"

---

## ⚠️ DISCLAIMERS

### 🔴 IMPORTANT - À LIRE

**Tous les outils fiscaux affichent des disclaimers:**

#### **Variant Compact** (1 ligne)
```
⚠️ For informational purposes only. Not tax advice.
Consult a licensed tax professional.
```

**Où:** Footer du calculateur interactif, Tax Optimizer

#### **Variant Default** (Alert box)
```
⚠️ This tool provides estimates for informational purposes only.

Tax laws are complex and vary by jurisdiction.
This is NOT professional tax advice. Always consult with
a licensed tax professional or CPA before making any
financial decisions. You are solely responsible for
your tax obligations.

Data accuracy not guaranteed. Tax rates may change.
```

**Où:** Tax Optimizer page (bas de page)

#### **Variant Detailed** (Full legal notice)
```
Tax Optimization Tool - Informational Only

NOT Tax Advice
Your Responsibility
No Guarantees
```

**Où:** À venir dans une section dédiée

---

## 🔐 SÉCURITÉ & CONFIDENTIALITÉ

### ✅ Garanties

- 🔒 Toutes les routes requièrent **authentification**
- 🔐 Données chiffrées en **transit** (HTTPS)
- 👤 Accès **limité** à vos propres données
- 🚫 **Aucun secret** hardcodé dans le code
- 📊 Montants **non loggés** (confidentialité)

### ❌ Nous ne partageons JAMAIS:

- Vos montants de transactions
- Votre juridiction fiscale
- Vos calculs d'impôts
- Vos wallet addresses

---

## 🎓 BONNES PRATIQUES

### 1. **Définir la juridiction en premier**

❌ **Mauvais flow:**
```
1. Aller sur Tax Optimizer
2. Cliquer "Refresh Analysis"
3. Résultats incorrects (défaut US)
```

✅ **Bon flow:**
```
1. Settings → Tax Jurisdiction → Sélectionner pays
2. Aller sur Tax Optimizer
3. Cliquer "Refresh Analysis"
4. Résultats corrects
```

---

### 2. **Vérifier les taux affichés**

Lors de la sélection de votre juridiction, **vérifiez toujours** que les taux affichés correspondent à votre pays:

**Exemple Portugal:**
```
Short-term rate: 0.0%
Long-term rate: 0.0%
Notes: 0% for individuals holding personally (not professional trading).
      28% flat rate if considered professional activity.
```

Si les taux semblent incorrects → **Contactez le support**

---

### 3. **Mettre à jour régulièrement**

Les lois fiscales changent. Vérifiez que:
- Votre juridiction est toujours correcte
- Les taux sont à jour (date affichée dans disclaimer)
- Vous consultez un professionnel pour décisions importantes

---

### 4. **Utiliser le Timing Calculator**

Avant de vendre un token:
1. Vérifiez s'il est short-term ou long-term
2. Calculez les jours restants avant long-term
3. Évaluez si attendre pourrait économiser des impôts

**Exemple:**
```
Lot #1234: ETH
Holding days: 320 days
Status: Short-term (45 days to long-term)
Estimated tax if sold now: $3,700 (37%)
Estimated tax if sold in 45 days: $2,000 (20%)
💡 Savings if waiting: $1,700
```

---

### 5. **Consulter un professionnel**

⚠️ **TOUJOURS consulter un CPA ou tax advisor** avant:
- Décisions financières importantes
- Migration fiscale internationale
- Ventes importantes (>$10,000)
- Situations complexes (multiple juridictions, etc.)

**Nos outils sont informatifs uniquement. Pas des conseils fiscaux.**

---

## 🆘 FAQ

### Q1: Je ne vois pas le badge de juridiction sur Tax Optimizer

**R:** Vérifiez que vous êtes connecté. Le badge s'affiche en haut de la page, juste sous le titre. S'il n'apparaît pas, essayez de rafraîchir la page (F5).

---

### Q2: Comment changer ma juridiction après l'avoir définie ?

**R:** Allez dans Settings → Tax Jurisdiction → Cliquez sur le dropdown → Sélectionnez nouveau pays → Save Jurisdiction.

Le changement est **immédiat** et affecte tous les modules.

---

### Q3: Wash sale rule s'applique même si je suis en France ?

**R:** ❌ Non. La wash sale rule est **US-only**. Si votre juridiction ≠ US, elle est automatiquement désactivée.

Pour vérifier: Settings → Cost Basis Settings → "apply_wash_sale_rule" doit être False.

---

### Q4: Les taux affichés sont incorrects pour mon pays

**R:** Contactez le support avec:
1. Code pays (ex: FR, PT, US)
2. Taux affichés actuellement
3. Taux corrects (avec source officielle)

Nous mettons à jour la database régulièrement.

---

### Q5: Puis-je avoir plusieurs juridictions ?

**R:** ❌ Non, une seule juridiction active à la fois. Si vous avez des obligations fiscales dans plusieurs pays, consultez un tax advisor pour savoir laquelle utiliser (généralement: résidence fiscale principale).

---

### Q6: Les calculs sont-ils 100% précis ?

**R:** ⚠️ **Non**. Les calculs sont des **estimations** basées sur:
- Taux généraux (peuvent varier selon votre situation)
- Règles simplifiées (cas complexes non couverts)
- Données utilisateur (erreurs possibles dans transactions)

**TOUJOURS vérifier avec un professionnel** avant décisions importantes.

---

### Q7: Où trouver la documentation API ?

**R:** API Swagger disponible sur:
```
http://localhost:8001/docs (développement)
https://api.cryptonomadhub.com/docs (production)
```

---

## 📞 SUPPORT

### 🐛 Reporter un bug

**Email:** support@cryptonomadhub.com
**GitHub Issues:** github.com/cryptonomadhub/issues

**Informations à inclure:**
- Page concernée
- Étapes pour reproduire
- Screenshot si possible
- Juridiction utilisée

---

### 💡 Suggérer une fonctionnalité

**Email:** features@cryptonomadhub.com

---

### 📚 Plus de ressources

- **Blog:** cryptonomadhub.com/blog
- **Video Tutorials:** youtube.com/cryptonomadhub
- **Community Discord:** discord.gg/cryptonomadhub

---

## 🚀 PROCHAINES FONCTIONNALITÉS

**En développement:**
- 📊 Dashboard fiscal annuel
- 📄 Export PDF des rapports fiscaux
- 🔔 Alertes timing (X jours avant long-term)
- 🌐 Support de plus de juridictions
- 🤖 AI tax advisor chatbot

**Restez informé:** Newsletter → Settings → Notifications → Product Updates ✅

---

**Dernière mise à jour:** 18 Octobre 2025
**Version:** 2.0
**Auteur:** CryptoNomadHub Team

---

⚠️ **Disclaimer:** Ce guide est fourni à titre informatif uniquement. Il ne constitue pas un conseil fiscal, juridique ou financier. Consultez toujours un professionnel qualifié avant de prendre des décisions financières.
