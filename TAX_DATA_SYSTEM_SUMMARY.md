# Système de Mise à Jour Automatique des Données Fiscales

## ✅ Implémenté

### 1. Sources de Données (2/3 fonctionnelles)

#### ✅ Tax Foundation (Scraping web)
- **Couverture** : 29 pays européens
- **Données** : Taux de CGT (Capital Gains Tax)
- **Mise à jour** : Annuelle
- **Fichier** : `backend/app/services/tax_data_sources/taxfoundation_scraper.py`
- **URL** : https://taxfoundation.org/data/all/eu/capital-gains-tax-rates-europe/

#### ✅ World Bank API
- **Couverture** : ~200 pays
- **Données** : Taxes sur revenus/profits/plus-values (% des revenus)
- **Mise à jour** : Annuelle
- **Fichier** : `backend/app/services/tax_data_sources/worldbank_client.py`
- **API** : https://api.worldbank.org/v2

#### ⚠️ OECD API (À refaire)
- **Statut** : API migrée vers SDMX format
- **Action requise** : Utiliser la bibliothèque `sdmx1`
- **Couverture** : 38 pays membres OECD
- **Fichier** : `backend/app/services/tax_data_sources/oecd_client.py`
- **Note** : Documenté mais nécessite migration vers nouvelle API

### 2. Agrégation Intelligente

**Fichier** : `backend/app/services/tax_data_sources/aggregator.py`

**Priorité des sources** :
1. Tax Foundation (meilleur pour CGT)
2. OECD (fiable pour membres)
3. World Bank (contexte macro)

**Fonctionnalités** :
- Fusion automatique des données
- Score de confiance (0.0 - 1.0)
- Mise à jour database uniquement si changement > 0.1%
- Notifications automatiques

### 3. Automatisation Celery

**Fichiers** :
- `backend/app/tasks/celery_app.py` - Configuration
- `backend/app/tasks/tax_sync_tasks.py` - Tâches

**Tâches périodiques** :
- ✅ **Sync hebdomadaire** : Dimanche 3h UTC (tous les pays)
- ✅ **Check urgent quotidien** : Chaque jour 6h UTC (pays >365 jours)

**Tâches manuelles** :
- `sync_countries_task(country_codes)` - Sync pays spécifiques
- `test_sources_task()` - Test connectivité sources

### 4. Notifications Admin

**Fichiers** :
- `backend/app/models/admin_notification.py` - Modèle
- `backend/app/services/notification_service.py` - Service

**Types de notifications** :
- 🔄 `TAX_DATA_UPDATED` - Taux mis à jour
- ⏰ `URGENT_UPDATE` - Données >365 jours
- ❌ `SOURCE_FAILURE` - Source indisponible
- ✅ `SYNC_COMPLETED` - Sync terminé

**Endpoints** :
- `GET /admin/notifications` - Liste notifications
- `POST /admin/notifications/{id}/read` - Marquer comme lu
- `POST /admin/notifications/read-all` - Tout marquer comme lu

### 5. Endpoints Admin

**Monitoring** :
```bash
GET /admin/tax-data/freshness        # État fraîcheur données
GET /admin/tax-data/checklist        # Liste priorisée révisions
GET /admin/tax-data/report           # Rapport lisible
```

**Synchronisation** :
```bash
POST /admin/tax-data/sync            # Sync pays spécifiques
  Body: {"country_codes": ["FR", "DE", "US"]}

POST /admin/tax-data/sync-all        # Sync tous les pays
GET  /admin/tax-data/test-sources    # Test connectivité
```

## 📊 Résultats Tests

**Test réussi** : 5 pays synchronisés
- 🇫🇷 France : 30% → 34% ✅
- 🇩🇪 Allemagne : 45% → 26.4% ✅
- 🇵🇹 Portugal : 28% → 19.6% ✅
- 🇨🇭 Suisse : 0% (inchangé) ✅
- 🇺🇸 États-Unis : ❌ (pas dans Europe)

**Statistiques** :
- 3 mis à jour
- 1 inchangé
- 1 échec attendu

## 📝 Utilisation

### Synchronisation manuelle

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@test.com&password=admin123" \
  | jq -r '.access_token')

# 2. Sync pays spécifiques
curl -X POST http://localhost:8001/admin/tax-data/sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"country_codes": ["FR", "DE", "PT"]}'

# 3. Voir notifications
curl -X GET http://localhost:8001/admin/notifications?unread_only=true \
  -H "Authorization: Bearer $TOKEN"
```

### Via Celery (programmé)

```bash
# Voir les logs Celery
docker logs nomadcrypto-celery -f

# Tester manuellement une tâche
docker exec nomadcrypto-backend python3 -c "
from app.tasks.tax_sync_tasks import test_sources_task
result = test_sources_task()
print(result)
"
```

## 🔮 Sources Additionnelles Disponibles

### 1. Trading Economics API
- **URL** : https://tradingeconomics.com/api/
- **Couverture** : 196 pays, 20M indicateurs
- **Données disponibles** : Capital Gains Tax Rate by Country
- **Pricing** : API payante (pas de tier gratuit identifié)
- **Implémentation** : Nécessite API key payante

### 2. KPMG Tax Tables
- **URL** : https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2025/global-withholding-taxes-guide-2024-kpmg.pdf
- **Couverture** : 127 juridictions
- **Format** : PDF (nécessite parsing PDF)
- **Mise à jour** : Annuelle
- **Implémentation** :
  - Scraper PDF avec `PyPDF2` ou `pdfplumber`
  - Parser tableaux
  - Mapper noms pays → codes ISO

### 3. PwC Worldwide Tax Summaries
- **URL** : https://taxsummaries.pwc.com/
- **Couverture** : Global
- **Format** : Pages HTML structurées
- **Mise à jour** : Continue
- **Implémentation** :
  - Scraper BeautifulSoup
  - Navigation par pays
  - Extraction sections "Capital gains"

## 🏗️ Architecture

```
backend/app/
├── models/
│   └── admin_notification.py          # Modèle notifications
├── services/
│   ├── notification_service.py        # Service notifications
│   ├── tax_data_monitor.py           # Monitoring fraîcheur
│   └── tax_data_sources/
│       ├── worldbank_client.py        # ✅ World Bank API
│       ├── taxfoundation_scraper.py   # ✅ Tax Foundation scraping
│       ├── oecd_client.py             # ⚠️ OECD (à migrer)
│       └── aggregator.py              # ✅ Fusion intelligente
├── tasks/
│   ├── celery_app.py                  # ✅ Config Celery
│   └── tax_sync_tasks.py              # ✅ Tâches périodiques
└── routers/
    └── admin.py                        # ✅ Endpoints admin
```

## 📈 Métriques

**Couverture actuelle** :
- 29 pays (Tax Foundation Europe)
- ~200 pays (World Bank - données macro)

**Performance** :
- Sync 5 pays : ~10-15 secondes
- Sync 43 pays : ~2-3 minutes

**Fiabilité** :
- World Bank : ✅ Opérationnel
- Tax Foundation : ✅ Opérationnel
- OECD : ❌ Nécessite migration

## 🚀 Prochaines Étapes Recommandées

1. **Court terme** :
   - Créer migration SQL pour table `admin_notifications`
   - Tester sync hebdomadaire automatique
   - Ajouter endpoint pour déclencher sync urgent

2. **Moyen terme** :
   - Migrer OECD vers SDMX API (`sdmx1` library)
   - Ajouter scraper KPMG PDF
   - Ajouter scraper PwC Tax Summaries

3. **Long terme** :
   - Dashboard admin pour visualiser notifications
   - Historique des changements de taux
   - Alertes email/Slack pour admins
   - Export CSV des données

## 🐛 Debugging

### Logs Celery
```bash
docker logs nomadcrypto-celery --tail 100 -f
```

### Test sources manuellement
```bash
docker exec nomadcrypto-backend python3 -c "
import asyncio
from app.services.tax_data_sources.taxfoundation_scraper import TaxFoundationScraper

async def test():
    scraper = TaxFoundationScraper()
    data = await scraper.scrape_europe_rates()
    print(f'Trouvé {len(data)} pays')
    await scraper.close()

asyncio.run(test())
"
```

### Vérifier base de données
```bash
# Via API
curl -X GET http://localhost:8001/admin/tax-data/freshness \
  -H "Authorization: Bearer $TOKEN"
```

## 📚 Documentation

- Guide maintenance : `/GUIDE_MAINTENANCE_TAX_DATA.md`
- APIs gratuites : `/FREE_TAX_APIS_GUIDE.md`
- Ce résumé : `/TAX_DATA_SYSTEM_SUMMARY.md`
