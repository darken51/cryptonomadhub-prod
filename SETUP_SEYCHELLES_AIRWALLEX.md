# Setup NomadCrypto Hub - Seychelles IBC + Airwallex

## ✅ Situation Actuelle

**Entité** : IBC Seychelles (déjà créée)
**Banking** : Airwallex (compte actif)

**Avantages Immédiats** :
- ✅ Structure légale : OK (responsabilité limitée)
- ✅ Banking international : OK (Airwallex supporte multi-devises)
- ✅ Coût setup : $0 (déjà payé)
- ✅ 0% tax corporate (Seychelles offshore)

---

## 💳 PAIEMENTS : Airwallex + Paddle Integration

### Option Recommandée : **Paddle avec Airwallex Payout**

#### Pourquoi Paddle reste optimal
- Airwallex **ne supporte PAS** les paiements récurrents SaaS directement
- Airwallex = bon pour **receiving payouts**, pas pour **subscription billing**
- Paddle gère :
  - Subscriptions auto-renew
  - Dunning (relance cartes expirées)
  - Taxes (TVA/GST) automatiques
  - PCI compliance
  - Chargebacks

#### Flow de Paiement

```
Client (n'importe où)
    ↓
Paddle checkout (carte bancaire)
    ↓
Paddle (Merchant of Record)
    - Collecte paiement
    - Déduit taxes (TVA/GST)
    - Déduit fees (5% + $0.50)
    ↓
Payout vers Airwallex (monthly)
    - Wire transfer USD/EUR
    - Fees Paddle→Airwallex : ~$10-20/transfer
    ↓
Airwallex account (ton IBC Seychelles)
    - Multi-devises (USD, EUR, GBP, AUD, etc.)
    - Conversion rates compétitifs
    - Withdraw vers bank locale ou Wise
```

#### Configuration Paddle → Airwallex

**1. Créer compte Paddle**
- Signup : paddle.com/signup
- Business type : "Software/SaaS"
- Entity : Ton IBC Seychelles (nom légal, registration number)
- Tax ID : Seychelles tax number (si applicable, sinon N/A)

**2. Setup Payout dans Paddle Dashboard**
```
Settings → Payout Settings
├── Method : Wire Transfer
├── Currency : USD (ou EUR selon préférence)
├── Bank Details :
│   ├── Account Holder : [Nom IBC]
│   ├── Bank Name : Airwallex Pte Ltd
│   ├── SWIFT/BIC : AIRWSGSG (Airwallex Singapore)
│   ├── Account Number : [Ton Airwallex USD account number]
│   └── Bank Address : 80 Robinson Road, Singapore 068898
├── Payout Frequency : Monthly (minimum $1,000)
└── Notes : "For [Nom IBC] revenue"
```

**3. Obtenir Airwallex Receiving Details**

Connecte-toi Airwallex :
```
Dashboard → Accounts → USD Global Account
└── Get Bank Details :
    ├── US routing number : 084xxxxxx
    ├── Account number : 12345678901
    ├── SWIFT : AIRWSGSG
    ├── Beneficiary : [Ton IBC name]
    └── Reference : "Paddle payouts"
```

**4. Vérification Paddle**
- Paddle enverra micro-deposit ($0.01-0.99) pour vérifier compte
- Confirmer montant dans Paddle dashboard
- Activation payout : 1-2 jours

---

## 🏦 ALTERNATIVE : Airwallex Direct (Si tu veux éviter Paddle fees)

### ⚠️ Attention : Complexe et non recommandé pour MVP

**Airwallex accepte** :
- API payments (one-time ou saved cards)
- **MAIS** : toi responsable de :
  - PCI compliance (TRÈS cher : $10k-50k/an audit)
  - Gestion taxes (TVA EU, GST AU, sales tax US) → nightmare
  - Chargebacks (dispute management manuel)
  - Dunning (recouvrement cartes expirées)

**Flow Airwallex Direct** :
```typescript
// Frontend : Airwallex Hosted Payment Page
import { loadAirwallex, redirectToCheckout } from 'airwallex-payment-elements';

await loadAirwallex({ env: 'prod', clientId: 'your_client_id' });

const checkout = await redirectToCheckout({
  mode: 'payment',
  amount: 20.00,
  currency: 'USD',
  customer: {
    email: user.email,
  },
  metadata: {
    subscription_plan: 'starter',
    user_id: user.id
  }
});
```

**Problèmes** :
- Pas de gestion auto subscriptions (tu dois coder retry logic, emails, etc.)
- Taxes : toi responsable (chaque pays différent)
- Fees Airwallex : 2.9% + $0.30 (similaire Stripe) **MAIS** complexité x10

**Verdict** : Garde Paddle. Fees 5% valent la simplification massive.

---

## 📊 COMPARATIF COÛTS RÉELS

### Scénario : $10,000 MRR (100 users × $100/mois avg)

| Setup | Monthly Revenue | Paddle Fees | Airwallex Fees | Net | Complexity |
|-------|----------------|-------------|----------------|-----|------------|
| **Paddle → Airwallex** | $10,000 | -$550 (5.5%) | -$15 (payout) | **$9,435** | ⭐ Simple |
| Airwallex Direct | $10,000 | $0 | -$290 (2.9%) | $9,710 | ⭐⭐⭐⭐⭐ Nightmare |
| Différence | - | - | - | **+$275/mois** | **+100h dev/mois** |

**ROI** : Tu perds $275/mois mais sauves 100h+ (valeur $5k-10k). **Paddle gagne.**

---

## 💰 FISCALITÉ : Seychelles IBC

### Structure Optimale

**Revenue Flow** :
```
Clients worldwide
    ↓
Paddle (collecte $10k)
    ↓ (après taxes/fees)
Airwallex Seychelles IBC ($9,435)
    ↓
Tax Seychelles : 0% (offshore exempt)
    ↓
Withdraw :
├── Option A : Salaire à toi (taxé selon ta résidence personnelle)
├── Option B : Dividendes (0% Seychelles, taxé résidence)
└── Option C : Prêt actionnaire (non taxable, rembourser plus tard)
```

### Obligations Seychelles IBC

**Annual Requirements** :
- ✅ **Annual Return** : Filing avant anniversary (agent coût ~$800-1,200/an)
- ✅ **Registered Agent** : Obligatoire (déjà en place)
- ✅ **Registered Office** : Adresse Seychelles (via agent)
- ❌ **Audit** : PAS requis si revenue <$X (vérifier avec ton agent)
- ❌ **Tax Return** : PAS requis (offshore exempt)

**Accounting** :
- Pas d'obligation légale tenir comptes
- **MAIS recommandé** pour :
  - Tracking revenue/expenses
  - Valorisation si levée fonds
  - Prouver substance si challenge fiscal

**Coût Annual Maintenance** :
- Registered Agent : $800-1,200/an
- Renewal fee Seychelles Gov : $250/an
- **Total** : ~$1,000-1,500/an (déjà en cours normalement)

---

## 🌍 RÉSIDENCE FISCALE PERSONNELLE

### Important : Séparer IBC (société) vs Toi (individu)

**Seychelles IBC** :
- 0% tax corporate
- Profits restent dans société (non taxés)

**Toi personnellement** :
- Taxé selon **ta résidence fiscale personnelle**
- Quand tu retires argent IBC (salaire/dividendes) → taxable

### Options Résidence Zéro-Tax (pour toi)

Si tu veux extraire profits sans tax personnel :

**1. UAE (Dubai/Abu Dhabi)**
- 0% income tax personnel
- Visa résidence facile (Golden Visa $10k ou employment visa)
- Exigence : 183 jours/an présence (ou 90j avec substance)
- Coût : $5k-10k/an (visa + appartement)

**2. Portugal NHR (Non-Habitual Resident)**
- 0% tax sur dividendes étrangers (IBC Seychelles = étranger)
- 10 ans bénéfice
- Exigence : 183 jours/an + location/achat immobilier
- Coût : €15k-30k/an (logement Lisbonne/Porto)

**3. Nomade Permanent (Digital Nomad)**
- Rester <183j partout
- Aucune résidence fiscale **mais** :
  - Risque "flag theory" (pays origine peut réclamer tax)
  - Banques difficiles (besoin address proof)
  - Stress constant (tracking jours)

**4. Maurice (proche Seychelles)**
- 15% flat tax sur salaire/dividendes
- Résidence facile (occupation permit $1k/an)
- Traité fiscal Seychelles-Maurice (évite double tax)
- Coût : $10k-20k/an (logement + visa)

### Recommandation Personnelle

**Phase 1 (0-$50k/an revenue)** :
- Laisse profits dans IBC Seychelles (0% tax)
- Retire seulement minimum vital ($1k-2k/mois)
- Déclare dans pays résidence actuelle (ou optimise nomade)

**Phase 2 ($50k-200k/an)** :
- Setup résidence UAE ou Portugal NHR
- Retire dividendes 0% tax
- Lifestyle upgrade justifié

**Phase 3 ($200k+/an)** :
- Conseiller fiscal pro (Big 4)
- Possiblement restructuration (holding)

---

## 🔒 COMPLIANCE AMÉLIORÉE

### Seychelles IBC + SaaS = Substance Requirements

**Risque** : Pays clients (EU/US) peuvent challenger :
- "IBC Seychelles = fake, pas de substance réelle"
- "Tu opères depuis [pays X], profits doivent être taxés ici"

**Mitigation** :

**1. Prouver Substance Seychelles**
- ✅ Registered office : OK (via agent)
- ✅ Director résidant : Nomme directeur local Seychelles ($500-1k/an)
- ✅ Board meetings : 1-2/an à Seychelles (minutes écrites)
- ❌ Employees Seychelles : Pas nécessaire pour SaaS digital

**2. Documentation Opérationnelle**
- Serveurs : Héberge sur cloud neutre (AWS Ireland, DO Singapore)
- Contracts : Tous signés par IBC Seychelles (pas toi perso)
- Invoices : Paddle émet au nom de Paddle (eux = MoR), puis paye ton IBC
- Emails : Use @nomadcrypto.com (domaine enregistré IBC)

**3. Éviter Permanent Establishment (PE)**
- Ne PAS dire "j'opère depuis [pays X]"
- Remote work itinérant (coworking, cafés, Airbnb)
- Pas de bureau fixe dans pays high-tax

**Conseil** : Si challenge, ton argument :
```
"IBC Seychelles opère plateforme cloud.
Services fournis par Paddle (MoR Ireland).
Direction/contrôle depuis Seychelles (director meetings).
Employé remote travaille itinérant (digital nomad)."
```

---

## 📄 SETUP LÉGAL AVEC IBC EXISTANTE

### Documents à Mettre à Jour

**1. Memorandum & Articles of Association**
- Vérifier "Objects" clause inclut :
  - "Software development and licensing"
  - "Provision of information services"
  - "Online platform operation"
- Si absent : amend via agent ($200-500)

**2. Shareholder Resolution**
```
RESOLUTION OF [IBC NAME]

Date: [Date]

WHEREAS the Company intends to operate a software-as-a-service
platform named "NomadCrypto Hub" providing tax information tools;

BE IT RESOLVED THAT:
1. The Company is authorized to enter into agreements with
   Paddle.com Markets Ltd for payment processing services.

2. The Company is authorized to engage in software development,
   data processing, and related services.

3. [Ton nom], Director, is authorized to execute all necessary
   agreements and contracts.

Signed: _______________________
        [Ton nom], Director
```

**3. Service Agreement (toi ↔ IBC)**

Si tu es employé/consultant IBC (pour justifier salaire) :

```
CONSULTING AGREEMENT

Between: [IBC Name] ("Company")
And: [Ton nom] ("Consultant")

Services: Software development, platform management, customer support
Fee: $X/month (ou % revenue)
Term: Ongoing
Governing Law: Seychelles
```

**Pourquoi** : Justifie paiements IBC → toi (salary/fees vs dividends)

---

## 💻 CONFIGURATION TECHNIQUE PADDLE + AIRWALLEX

### Backend Integration

**1. Variables .env**
```bash
# Paddle
PADDLE_VENDOR_ID=123456
PADDLE_AUTH_CODE=your_auth_code
PADDLE_PUBLIC_KEY=pk_live_...
PADDLE_WEBHOOK_SECRET=whsec_...

# Business Info (Seychelles IBC)
COMPANY_NAME="[Ton IBC Legal Name]"
COMPANY_NUMBER="[Seychelles Registration Number]"
COMPANY_ADDRESS="[Registered Office Address Seychelles]"
COMPANY_COUNTRY="SC"  # Seychelles

# Airwallex (optionnel si tu veux API direct future)
AIRWALLEX_CLIENT_ID=your_client_id
AIRWALLEX_API_KEY=your_api_key
```

**2. Paddle Webhook Handler**
```python
# backend/app/routers/paddle_webhook.py
from fastapi import APIRouter, Request, HTTPException
import hmac
import hashlib
import json

router = APIRouter(prefix="/paddle", tags=["payments"])

@router.post("/webhook")
async def paddle_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Paddle subscription events"""

    # Get payload
    body = await request.body()
    signature = request.headers.get('Paddle-Signature')

    # Verify signature (security critical)
    if not verify_paddle_signature(body, signature):
        raise HTTPException(403, "Invalid signature")

    payload = await request.json()
    event_type = payload.get('alert_name')

    # Handle events
    if event_type == 'subscription_created':
        # New subscription
        user_id = json.loads(payload['passthrough'])['user_id']
        plan_id = payload['subscription_plan_id']

        # Update user license
        license = db.query(License).filter_by(user_id=user_id).first()
        if not license:
            license = License(user_id=user_id)
            db.add(license)

        license.paddle_subscription_id = payload['subscription_id']
        license.tier = get_tier_from_plan_id(plan_id)
        license.status = 'active'
        license.expires_at = payload['next_bill_date']

        db.commit()

    elif event_type == 'subscription_updated':
        # Plan change
        subscription_id = payload['subscription_id']
        license = db.query(License).filter_by(
            paddle_subscription_id=subscription_id
        ).first()

        if license:
            license.tier = get_tier_from_plan_id(payload['subscription_plan_id'])
            license.expires_at = payload['next_bill_date']
            db.commit()

    elif event_type == 'subscription_cancelled':
        # Cancellation
        subscription_id = payload['subscription_id']
        license = db.query(License).filter_by(
            paddle_subscription_id=subscription_id
        ).first()

        if license:
            license.status = 'cancelled'
            license.cancels_at = payload['cancellation_effective_date']
            db.commit()

    elif event_type == 'subscription_payment_succeeded':
        # Successful payment
        # Log for accounting
        audit = AuditLog(
            user_id=get_user_from_subscription(payload['subscription_id']),
            action='payment_received',
            details={
                'amount': payload['sale_gross'],
                'currency': payload['currency'],
                'receipt_url': payload['receipt_url']
            }
        )
        db.add(audit)
        db.commit()

    elif event_type == 'subscription_payment_failed':
        # Failed payment - notify user
        # Paddle handles dunning automatically
        pass

    return {"status": "ok"}

def verify_paddle_signature(body: bytes, signature: str) -> bool:
    """Verify Paddle webhook signature"""
    public_key = os.getenv('PADDLE_PUBLIC_KEY')

    # Paddle uses ksort on parameters
    # Vérification via leur library recommandée
    from paddle import Webhook
    return Webhook.verify(body, signature, public_key)

def get_tier_from_plan_id(plan_id: str) -> str:
    """Map Paddle plan ID to tier"""
    mapping = {
        os.getenv('PADDLE_PLAN_STARTER'): 'starter',
        os.getenv('PADDLE_PLAN_PRO'): 'pro',
        os.getenv('PADDLE_PLAN_ENTERPRISE'): 'enterprise'
    }
    return mapping.get(str(plan_id), 'free')
```

**3. Frontend Checkout**
```typescript
// frontend/components/PricingCheckout.tsx
import { initializePaddle } from '@paddle/paddle-js';

export function CheckoutButton({ planId, planName, price }: Props) {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    initializePaddle({
      environment: 'production',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!
    }).then((paddleInstance) => {
      setPaddle(paddleInstance);
    });
  }, []);

  const openCheckout = () => {
    paddle?.Checkout.open({
      items: [{ priceId: planId, quantity: 1 }],
      customer: {
        email: user.email,
      },
      customData: {
        user_id: user.id,
        plan_name: planName
      },
      successUrl: `${window.location.origin}/dashboard?payment=success`,
    });
  };

  return (
    <button onClick={openCheckout} className="...">
      Subscribe to {planName} - ${price}/mo
    </button>
  );
}
```

---

## 📊 ACCOUNTING SIMPLIFIÉ

### Track Revenue (pour toi)

**Minimal Required** :
```
Spreadsheet mensuel :
├── Revenue Paddle (gross) : $10,000
├── Paddle fees : -$550
├── Net received Airwallex : $9,450
├── Expenses :
│   ├── Servers (AWS) : -$200
│   ├── APIs (Ollama cloud) : -$100
│   ├── Agent Seychelles : -$100
│   └── Outils (Figma, etc.) : -$50
├── Profit net : $9,000
└── Retained in IBC : $9,000 (0% tax)
```

**Tools** :
- Google Sheets : Gratuit
- Wave Accounting : Gratuit, multi-devises
- Xero : $30/mois (si tu veux pro)

### Withdrawal Strategy

**Optimisé Tax** :
```
Mensuel :
├── Revenue IBC : $9,000
├── Withdraw toi :
│   ├── Salary : $2,000 (taxé selon résidence)
│   └── Reste IBC : $7,000 (accumule)
└── Annuel : $84k accumulé IBC (0% tax Seychelles)

Puis 1x/an :
└── Dividends : $84k → résidence 0% tax (UAE/PT NHR)
```

---

## 🎯 CHECKLIST SETUP FINAL

### Légal (1 semaine)
- [ ] Vérifier IBC objects clause inclut software/SaaS
- [ ] Shareholder resolution autorisant Paddle
- [ ] Service agreement toi ↔ IBC (si salary)
- [ ] ToS/Privacy policy ($500 template ou $2k avocat)

### Paiements (3-5 jours)
- [ ] ✅ Signup Paddle avec détails IBC Seychelles
- [ ] Obtenir Airwallex USD account details
- [ ] Configurer payout Paddle → Airwallex
- [ ] Créer 3 plans pricing dans Paddle dashboard
- [ ] Tester sandbox Paddle

### Technique (2-3 semaines)
- [ ] Intégrer Paddle SDK backend (webhook handler)
- [ ] Intégrer Paddle.js frontend (checkout)
- [ ] Tester flow complet (sandbox)
- [ ] Migrer production

### Compliance (ongoing)
- [ ] Disclaimers partout (déjà prévu plan original)
- [ ] GDPR endpoints (export/delete)
- [ ] Cookie consent banner
- [ ] Annual Seychelles IBC filing (via agent)

---

## 💰 BUDGET TOTAL RÉVISÉ

| Item | Coût |
|------|------|
| **IBC Seychelles** | ✅ $0 (déjà payé) |
| **Airwallex** | ✅ $0 (compte actif) |
| **Paddle setup** | $0 (fees seulement 5%+$0.50) |
| **ToS/Privacy** | $500-2,000 |
| **Assurance E&O** | $0 (beta) → $2,500 (public) |
| **Annual IBC maintenance** | $1,000-1,500 (déjà en cours) |
| **Dev time** | 3-4 mois (ou $30k freelance) |
| **TOTAL NOUVEAU** | **$500-4,500** (vs $8k-10k précédent) |

**Économie** : $4k-6k grâce IBC+Airwallex existants ! 🎉

---

## 🚀 TIMELINE RÉVISÉ

| Semaine | Action |
|---------|--------|
| **1** | Signup Paddle + ToS/Privacy (template $500) |
| **2** | Config Paddle→Airwallex + test payout |
| **3-4** | Intégration technique (backend webhook) |
| **5-14** | Dev MVP (plan original) |
| **15** | Beta 50 users |
| **16** | Assurance E&O + public launch |

**Total** : 16 semaines (4 mois) → **Launch public Q2 2025** si start maintenant

---

## ✅ AVANTAGES SETUP SEYCHELLES + AIRWALLEX

1. ✅ **0% corporate tax** (vs 3% Maurice, 9% UAE)
2. ✅ **Banking déjà actif** (pas de galère ouverture compte)
3. ✅ **Multi-devises Airwallex** (USD/EUR/GBP reçus sans conversion forcée)
4. ✅ **Confidentialité** (shareholders pas publics vs UK/US)
5. ✅ **Coût faible** ($1k/an vs $5k UAE)
6. ✅ **Flexibilité** (nomade, pas de visa/résidence requis)

## ⚠️ RISQUES À GÉRER

1. ⚠️ **Réputation "offshore"** → Mitiger :
   - Marketing focus "global SaaS" (pas mention Seychelles)
   - Paddle = face client (Ireland entity)
   - Terms : "Operated by [IBC name], payments via Paddle"

2. ⚠️ **Substance challenge** → Mitiger :
   - Director local Seychelles ($500/an)
   - Board minutes annuels
   - Contracts signés IBC (pas toi perso)

3. ⚠️ **Tax résidence personnelle** → Mitiger :
   - Optimise ta résidence (UAE/PT NHR si $100k+/an)
   - Ou nomade <183j partout (risqué mais possible)

---

## 🎯 VERDICT FINAL

**Setup actuel (IBC Seychelles + Airwallex) = EXCELLENT pour ce projet**

**Pourquoi** :
- Structure légale : ✅
- Banking international : ✅
- 0% tax corporate : ✅
- Coût minimal : ✅
- Compatible Paddle : ✅

**Seul ajustement** : Paddle comme payment gateway (vs Stripe impossible).

**Prochaine étape** : Signup Paddle today avec détails IBC, pendant que tu finalises ToS.

---

**Tu es mieux setup que 90% des founders SaaS.** Let's build! 🚀
