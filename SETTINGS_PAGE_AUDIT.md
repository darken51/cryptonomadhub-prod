# Settings Page - Audit Complet

**Date:** 2025-10-19
**Page:** `/app/settings/page.tsx`

---

## 📊 État Actuel - 7 Sections

### ✅ **1. Profile Section** (Lignes 336-396)
**Fonctionnalités:**
- Full Name
- Email
- Save button

**Verdict:** ✅ **GARDER** - Essentiel
**Backend:** `/users/profile` (PUT)
**Statut:** Fonctionnel

---

### ✅ **2. Password Section** (Lignes 398-499)
**Fonctionnalités:**
- Current Password (avec toggle eye)
- New Password (avec toggle eye)
- Confirm Password (avec toggle eye)
- Validation min 8 caractères

**Verdict:** ✅ **GARDER** - Essentiel pour sécurité
**Backend:** `/users/change-password` (POST)
**Statut:** Fonctionnel
**Améliorations possibles:**
- [ ] Afficher force du mot de passe (weak/medium/strong)
- [ ] Suggestions de mot de passe fort
- [ ] Historique des derniers changements

---

### ⭐ **3. Tax Jurisdiction Section** (Lignes 501-531)
**Fonctionnalités:**
- JurisdictionSelector (167 pays)
- Auto-détection de devise

**Verdict:** ⭐ **ESSENTIEL** - Pilier du système multi-devises
**Backend:** `/cost-basis/settings` (PUT)
**Statut:** Fonctionnel et récemment amélioré

**✅ Améliorations déjà faites:**
- Boîte cliquable pour changer juridiction
- Liste auto-collapse après sélection
- Barre de recherche

**🆕 Améliorations suggérées:**
- [ ] **Afficher la devise détectée** - Badge montrant "🇩🇿 Algeria → Dinar Algérien (DZD)"
- [ ] **Preview des taux d'imposition** - Montrer short-term/long-term rates
- [ ] **Dernière modification** - Date de dernier changement de juridiction
- [ ] **Warning si changement** - Alerter que ça affecte tous les calculs existants

---

### ⚠️ **4. Preferences Section** (Lignes 533-610) - **PROBLÈME DÉTECTÉ**

**Fonctionnalités actuelles:**
- ❌ **Default Currency** (Lignes 549-567) - **REDONDANT !**
- ✅ Language Switcher
- ✅ Theme (System/Light/Dark)

**Verdict:** ⚠️ **À MODIFIER** - Supprimer le sélecteur de devise

### 🔴 **PROBLÈME : Default Currency est REDONDANT**

**Pourquoi c'est un problème :**
```
Tax Jurisdiction (Algeria) → Auto-détecte DZD ✅
       VS
Default Currency → Permet de choisir USD/EUR/GBP ❌

→ CONFLIT ! Quelle devise afficher ?
```

**Impact actuel :**
- Le sélecteur de devise ne fait rien (la devise est basée sur juridiction)
- Confusion pour l'utilisateur
- Code inutile

**Solution :**
```diff
- Default Currency selector
+ Renommer section en "Display Preferences"
+ Garder uniquement Language + Theme
```

**Backend:** `/users/preferences` (PUT)
**Statut:** ⚠️ Partiellement obsolète

---

### ✅ **5. Notifications Section** (Lignes 612-688)
**Fonctionnalités:**
- Email Notifications
- Product Updates
- Marketing Emails

**Verdict:** ✅ **GARDER** - Utile pour engagement
**Backend:** `/users/notifications` (PUT)
**Statut:** ⚠️ Probablement pas implémenté côté backend

**À vérifier:**
- [ ] Le backend envoie-t-il vraiment des emails ?
- [ ] Intégration avec service d'emailing (SendGrid, Mailgun) ?

**Améliorations suggérées:**
- [ ] **Fréquence des notifications** - Daily/Weekly digest
- [ ] **Slack/Discord webhooks** (futur)
- [ ] **Tax deadline reminders** - Alertes avant fin d'année fiscale

---

### ✅ **6. Subscription Section** (Lignes 690-724)
**Fonctionnalités:**
- Affichage plan actuel (Free Tier)
- Bouton Upgrade vers /pricing

**Verdict:** ✅ **GARDER** - Important pour monétisation
**Statut:** Fonctionnel (statique)

**Améliorations suggérées:**
- [ ] **Usage metrics** - "You've used 15/100 audits this month"
- [ ] **Feature comparison** - Tableau Free vs Pro vs Enterprise
- [ ] **Billing history** - Pour utilisateurs payants
- [ ] **Payment method** - Ajouter/modifier carte de crédit

---

### ✅ **7. Danger Zone** (Lignes 726-771)
**Fonctionnalités:**
- Delete Account avec confirmation "DELETE"

**Verdict:** ✅ **GARDER** - Requis GDPR
**Backend:** `/users/account` (DELETE)
**Statut:** Fonctionnel

**Améliorations suggérées:**
- [ ] **Export data before delete** - Bouton "Download my data" (GDPR)
- [ ] **Raison de départ** - Survey optionnel
- [ ] **Soft delete** - 30 jours de grace period avant suppression définitive

---

## 🆕 Sections Manquantes - À Ajouter

### **8. Cost Basis Settings** ⭐ PRIORITÉ HAUTE

**Pourquoi c'est important :**
- Actuellement, pas de config pour méthode de calcul
- L'utilisateur ne peut pas choisir FIFO vs LIFO vs HIFO

**Fonctionnalités à ajouter :**
```tsx
<section>
  <h2>Cost Basis Settings</h2>

  <select name="default_method">
    <option value="fifo">FIFO (First In First Out) - Default</option>
    <option value="lifo">LIFO (Last In First Out)</option>
    <option value="hifo">HIFO (Highest In First Out)</option>
    <option value="specific_id">Specific Identification</option>
  </select>

  <p>Determines which lots are sold first for tax calculations</p>

  <toggle name="wash_sale_tracking">
    <label>Enable Wash Sale Tracking (US only)</label>
  </toggle>

  <toggle name="staking_as_income">
    <label>Treat staking rewards as ordinary income</label>
  </toggle>
</section>
```

**Backend:** `/cost-basis/settings` déjà existe, juste étendre

---

### **9. Data & Privacy** 🔒 PRIORITÉ MOYENNE

**Fonctionnalités :**
```tsx
<section>
  <h2>Data & Privacy</h2>

  <button>📥 Export All Data (CSV/JSON)</button>
  <p>Download all your transactions, lots, and settings</p>

  <button>📊 Download Tax Report (PDF)</button>
  <p>Generate comprehensive tax report for filing</p>

  <toggle name="data_retention">
    <label>Auto-delete data after 7 years (tax retention period)</label>
  </toggle>

  <button>🗑️ Clear Transaction Cache</button>
  <p>Remove cached blockchain data (keeps your lots)</p>
</section>
```

**Backend à créer :** `/users/export-data`, `/users/clear-cache`

---

### **10. Security** 🔐 PRIORITÉ MOYENNE

**Fonctionnalités :**
```tsx
<section>
  <h2>Security</h2>

  <div>
    <h3>Two-Factor Authentication (2FA)</h3>
    <button>Enable 2FA</button>
    <p>Add extra security with authenticator app</p>
  </div>

  <div>
    <h3>Active Sessions</h3>
    <ul>
      <li>🖥️ Chrome on Windows - Paris, FR - Active now</li>
      <li>📱 Safari on iPhone - Paris, FR - 2 hours ago</li>
    </ul>
    <button>Revoke All Sessions</button>
  </div>

  <div>
    <h3>Login History</h3>
    <table>
      <tr><td>2025-10-19 14:30</td><td>Paris, FR</td><td>✅ Success</td></tr>
      <tr><td>2025-10-18 09:15</td><td>Paris, FR</td><td>✅ Success</td></tr>
    </table>
  </div>
</section>
```

**Backend à créer :** `/auth/sessions`, `/auth/enable-2fa`

---

### **11. API & Integrations** 🔌 PRIORITÉ BASSE (futur)

**Fonctionnalités :**
```tsx
<section>
  <h2>API & Integrations</h2>

  <div>
    <h3>API Keys</h3>
    <button>Generate New API Key</button>
    <ul>
      <li>sk_live_abc123... (Created Oct 10) <button>Revoke</button></li>
    </ul>
  </div>

  <div>
    <h3>Webhooks</h3>
    <input placeholder="https://your-server.com/webhook" />
    <select>
      <option>New transaction detected</option>
      <option>Audit completed</option>
      <option>Tax opportunity found</option>
    </select>
  </div>

  <div>
    <h3>Connected Exchanges</h3>
    <button>🔗 Connect Coinbase</button>
    <button>🔗 Connect Binance</button>
    <button>🔗 Connect Kraken</button>
  </div>
</section>
```

---

### **12. Advanced Settings** ⚙️ PRIORITÉ BASSE

**Fonctionnalités :**
```tsx
<section>
  <h2>Advanced Settings</h2>

  <toggle name="debug_mode">
    <label>Enable Debug Mode</label>
    <p>Show additional logs and error details</p>
  </toggle>

  <toggle name="beta_features">
    <label>Enable Beta Features</label>
    <p>Access experimental features (may be unstable)</p>
  </toggle>

  <select name="decimal_precision">
    <option value="2">2 decimals (default)</option>
    <option value="4">4 decimals</option>
    <option value="8">8 decimals (for satoshis)</option>
  </select>

  <select name="date_format">
    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
    <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
  </select>
</section>
```

---

## 📋 Plan d'Action - Priorisation

### 🔥 **IMMÉDIAT** (Aujourd'hui)

1. **Supprimer "Default Currency" du Preferences**
   - Ligne 549-567 à supprimer
   - Renommer section en "Display Preferences"
   - Mettre à jour backend si nécessaire

2. **Améliorer Tax Jurisdiction Section**
   - Afficher devise détectée : "🇩🇿 Algeria → DZD (Dinar Algérien)"
   - Ajouter warning si changement de juridiction

### ⭐ **PRIORITÉ HAUTE** (Cette semaine)

3. **Ajouter Cost Basis Settings Section**
   - Default method (FIFO/LIFO/HIFO)
   - Wash sale tracking toggle
   - Staking treatment toggle

4. **Vérifier backend Notifications**
   - Est-ce que `/users/notifications` existe ?
   - Implémentation email réelle ou juste DB ?

### 📊 **PRIORITÉ MOYENNE** (Ce mois)

5. **Ajouter Data & Privacy Section**
   - Export all data (CSV/JSON)
   - Download tax report (PDF)
   - Data retention settings

6. **Ajouter Security Section**
   - 2FA enablement
   - Active sessions management
   - Login history

### 🔮 **FUTUR** (Q1 2026)

7. **API & Integrations**
   - API keys generation
   - Webhooks
   - Exchange connections

8. **Advanced Settings**
   - Debug mode
   - Beta features
   - Format preferences

---

## 🛠️ Modifications Techniques Requises

### **1. Supprimer Default Currency**

```tsx
// AVANT (Lignes 549-567)
<div>
  <label>Default Currency</label>
  <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}>
    <option value="USD">USD - US Dollar</option>
    <option value="EUR">EUR - Euro</option>
    // ... etc
  </select>
</div>

// APRÈS
// ❌ SUPPRIMER COMPLÈTEMENT
```

### **2. Renommer Preferences Section**

```tsx
// AVANT
<h2>Preferences</h2>
<p>Customize your experience</p>

// APRÈS
<h2>Display Preferences</h2>
<p>Customize how information is displayed</p>
```

### **3. Améliorer Tax Jurisdiction**

```tsx
// APRÈS Tax Jurisdiction selector
{taxJurisdiction && (
  <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200">
    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
      💱 Your currency: <strong>{currencyCode} ({currencySymbol} {currencyName})</strong>
    </p>
    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
      All financial data will be displayed in {currencyName} with USD reference
    </p>
  </div>
)}
```

### **4. Ajouter Cost Basis Settings Section**

**Nouveau composant :** `/components/CostBasisSettings.tsx`

```tsx
export function CostBasisSettings() {
  const [defaultMethod, setDefaultMethod] = useState('fifo')
  const [washSaleTracking, setWashSaleTracking] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <label>Default Cost Basis Method</label>
        <select value={defaultMethod} onChange={...}>
          <option value="fifo">FIFO - First In First Out</option>
          <option value="lifo">LIFO - Last In First Out</option>
          <option value="hifo">HIFO - Highest In First Out</option>
          <option value="specific_id">Specific Identification</option>
        </select>
        <p className="text-xs text-slate-500">
          Determines which cryptocurrency units are sold first for tax purposes
        </p>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={washSaleTracking} onChange={...} />
        <span>Enable Wash Sale Tracking (US only)</span>
      </label>
    </div>
  )
}
```

---

## 📊 Résumé - État vs Idéal

| Section | État Actuel | Verdict | Action |
|---------|-------------|---------|--------|
| Profile | ✅ Fonctionnel | GARDER | - |
| Password | ✅ Fonctionnel | GARDER | Ajouter force indicator |
| Tax Jurisdiction | ✅ Fonctionnel | **ESSENTIEL** | Afficher devise détectée |
| Preferences | ⚠️ Redondant | MODIFIER | Supprimer Default Currency |
| Notifications | ⚠️ Incomplet | GARDER | Vérifier backend |
| Subscription | ✅ Fonctionnel | GARDER | Ajouter usage metrics |
| Danger Zone | ✅ Fonctionnel | GARDER | Ajouter export data |
| **Cost Basis Settings** | ❌ Manquant | **À CRÉER** | Priorité haute |
| **Data & Privacy** | ❌ Manquant | À CRÉER | Priorité moyenne |
| **Security (2FA)** | ❌ Manquant | À CRÉER | Priorité moyenne |
| **API & Integrations** | ❌ Manquant | À CRÉER | Futur |

---

## 🎯 Recommandation Finale

### **Actions Immédiates (Aujourd'hui) :**

1. ✂️ **SUPPRIMER** le sélecteur "Default Currency" (lignes 549-567)
2. ✏️ **RENOMMER** "Preferences" → "Display Preferences"
3. ✨ **AMÉLIORER** Tax Jurisdiction avec badge de devise détectée

### **Prochaines Étapes (Cette semaine) :**

4. ➕ **AJOUTER** Cost Basis Settings section
5. ✅ **VÉRIFIER** que le backend Notifications fonctionne

### **Roadmap (Moyen terme) :**

6. Ajouter Data Export & Privacy
7. Ajouter 2FA & Security
8. Ajouter API & Integrations (futur monétisation)

---

**Conclusion :** La page Settings est fonctionnelle mais a 1 redondance critique (Default Currency) et manque de settings essentiels pour Cost Basis. Les modifications suggérées amélioreront significativement l'UX et éviteront la confusion.
