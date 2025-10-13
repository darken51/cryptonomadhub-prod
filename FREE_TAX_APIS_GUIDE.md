# 🆓 APIs Fiscales Gratuites - Guide Complet

## ✅ APIs 100% Gratuites

### 1. **World Bank Open Data API** ⭐ Recommandé
**URL**: https://api.worldbank.org/v2/
**Documentation**: https://datahelpdesk.worldbank.org/knowledgebase/articles/898599

**Avantages:**
- ✅ Totalement gratuit
- ✅ Pas de limite de requêtes
- ✅ Données officielles internationales
- ✅ JSON & XML

**Données disponibles:**
- Taxes sur revenus, profits et gains en capital (% du revenu)
- Taux d'imposition statutaires
- Données macro-économiques

**Exemple d'utilisation:**
```python
import httpx

async def get_tax_data_worldbank(country_code: str):
    """
    Récupère données fiscales World Bank

    country_code: ISO 2-letter code (US, FR, DE, etc.)
    """
    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/GC.TAX.YPKG.RV.ZS"
    params = {
        "format": "json",
        "date": "2020:2025",  # 5 dernières années
        "per_page": 100
    }

    response = await httpx.get(url, params=params)
    data = response.json()

    if len(data) > 1 and data[1]:
        latest = data[1][0]  # Données les plus récentes
        return {
            "country": latest["country"]["value"],
            "year": latest["date"],
            "tax_revenue_pct": latest["value"]
        }
    return None

# Usage
data = await get_tax_data_worldbank("US")
print(data)
# {'country': 'United States', 'year': '2023', 'tax_revenue_pct': 48.5}
```

**Indicateurs utiles:**
- `GC.TAX.YPKG.RV.ZS` - Taxes on income, profits and capital gains
- `GC.TAX.TOTL.GD.ZS` - Tax revenue (% of GDP)
- `IC.TAX.TOTL.CP.ZS` - Total tax rate

---

### 2. **OECD Data API** ⭐ Très Complet
**URL**: https://data.oecd.org/api/
**Explorer**: https://data-explorer.oecd.org

**Avantages:**
- ✅ Gratuit pour usage non-commercial
- ✅ Données très détaillées
- ✅ Format structuré (SDMX, JSON, XML)
- ✅ Mises à jour régulières

**Datasets fiscaux:**
- Personal income tax rates
- Corporate tax rates
- Tax revenues
- Tax wedges

**Exemple d'utilisation:**
```python
async def get_oecd_tax_rates():
    """
    Récupère taux d'imposition OECD
    """
    # URL de l'API OECD (format SDMX-JSON)
    url = "https://stats.oecd.org/SDMX-JSON/data/TABLE_I1/AUS+AUT+BEL+CAN+CHL+COL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA.CPITA.._T/all"

    response = await httpx.get(url)
    data = response.json()

    # Parser données SDMX
    observations = data["dataSets"][0]["observations"]

    return parse_oecd_observations(observations)
```

**Notes:**
- Format SDMX peut être complexe
- Nécessite parsing spécialisé
- Excellent pour données macro

---

### 3. **IMF Data API** (International Monetary Fund)
**URL**: https://data.imf.org/
**API**: https://datahelp.imf.org/knowledgebase/articles/667681

**Avantages:**
- ✅ Gratuit
- ✅ Données fiscales gouvernementales
- ✅ Couverture mondiale

**Limitations:**
- ⚠️ Pas de détails CGT spécifiques
- ⚠️ Focus sur données macro

---

### 4. **Tax Foundation Open Data** 🆕
**URL**: https://taxfoundation.org/data/
**Avantages:**
- ✅ Données CGT par pays
- ✅ Mises à jour annuelles
- ✅ Format tableau facilement parsable

**Note:** Pas d'API officielle, mais données téléchargeables en CSV/Excel

**Implémentation Web Scraping:**
```python
async def scrape_taxfoundation():
    """
    Scrape Tax Foundation pour données CGT
    """
    url = "https://taxfoundation.org/data/all/eu/capital-gains-tax-rates-europe/"

    response = await httpx.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Extraire tableau de données
    table = soup.find('table', class_='data-table')
    rows = table.find_all('tr')

    countries = []
    for row in rows[1:]:  # Skip header
        cols = row.find_all('td')
        countries.append({
            'country': cols[0].text.strip(),
            'cgt_rate': float(cols[1].text.strip('%')) / 100
        })

    return countries
```

---

### 5. **APIs Gouvernementales Directes** 🏛️

Plusieurs pays offrent des APIs publiques:

#### **🇺🇸 États-Unis - IRS**
- **URL**: https://www.irs.gov/statistics
- **Format**: CSV, PDF (pas d'API REST)
- **Données**: Tax rates, brackets, historical data

#### **🇬🇧 Royaume-Uni - HMRC**
- **URL**: https://www.gov.uk/government/statistics
- **Format**: Open data portal
- **Données**: Tax rates, statistics

#### **🇫🇷 France - Impots.gouv**
- **URL**: https://www.impots.gouv.fr/portail/statistiques
- **Format**: PDF, Excel
- **Note**: Pas d'API structurée

#### **🇩🇪 Allemagne - BMF**
- **URL**: https://www.bundesfinanzministerium.de
- **Format**: Publications PDF

---

## 🔄 Stratégie d'Implémentation Recommandée

### **Phase 1: Données de Base (Gratuit)**

1. **World Bank API** pour données macro
2. **OECD Stats** pour taux officiels
3. **Web scraping** Tax Foundation pour CGT

```python
# backend/app/services/tax_api_client.py

class TaxDataAggregator:
    """Agrège données de sources gratuites"""

    async def fetch_country_data(self, country_code: str):
        """Fetch from multiple free sources"""

        # Source 1: World Bank
        wb_data = await self.fetch_worldbank(country_code)

        # Source 2: OECD
        oecd_data = await self.fetch_oecd(country_code)

        # Source 3: Tax Foundation (scraping)
        tf_data = await self.scrape_taxfoundation(country_code)

        # Merge et valider
        return self.merge_sources(wb_data, oecd_data, tf_data)
```

### **Phase 2: Automation (Gratuit)**

```python
# Cron job quotidien
@app.on_event("startup")
@repeat_every(seconds=60*60*24)  # Daily
async def sync_tax_data():
    """Sync data from free APIs daily"""

    aggregator = TaxDataAggregator()

    for country in ALL_COUNTRIES:
        try:
            data = await aggregator.fetch_country_data(country.code)

            if data_has_changed(country, data):
                update_database(country, data)
                notify_admin(f"Updated {country.name}")
        except Exception as e:
            log_error(f"Failed to sync {country.code}: {e}")
```

---

## 💰 APIs Payantes (Pour Référence)

### **TaxJar API**
- **Prix**: $20-100/mois
- **Couverture**: USA uniquement
- **Qualité**: Excellente, temps réel

### **Avalara API**
- **Prix**: Sur devis
- **Couverture**: Internationale
- **Qualité**: Enterprise-grade

### **Thomson Reuters ONESOURCE**
- **Prix**: $$$$$ (très cher)
- **Couverture**: 190+ pays
- **Qualité**: Professional

---

## 📊 Comparaison Rapide

| API | Gratuit | CGT Détails | Mise à jour | Difficulté |
|-----|---------|-------------|-------------|-----------|
| **World Bank** | ✅ Oui | ⚠️ Macro | Annuelle | ⭐⭐ Facile |
| **OECD** | ✅ Oui | ✅ Oui | Trimestrielle | ⭐⭐⭐ Moyen |
| **IMF** | ✅ Oui | ❌ Non | Annuelle | ⭐⭐⭐ Moyen |
| **Tax Foundation** | ✅ Oui | ✅ Excellent | Annuelle | ⭐⭐⭐⭐ Scraping |
| **Gov Direct** | ✅ Oui | ✅ Officiel | Variable | ⭐⭐⭐⭐⭐ Très difficile |

---

## 🎯 Recommandation Finale

Pour **NomadCrypto Hub MVP**:

1. **Maintenant**: Mise à jour manuelle trimestrielle (Option actuelle)
2. **Court terme (3 mois)**: Scraping Tax Foundation automatisé
3. **Moyen terme (6 mois)**: Intégration OECD API
4. **Long terme (12 mois)**: API payante si volume utilisateurs justifie

**Coût estimé**: $0/mois pour 90% des besoins

---

## 🔗 Ressources

- [World Bank API Docs](https://datahelpdesk.worldbank.org/knowledgebase/topics/125589)
- [OECD Data API Guide](https://data.oecd.org/api/)
- [Tax Foundation Data](https://taxfoundation.org/data/)
- [IMF Data Portal](https://data.imf.org/)

---

## 📝 Notes Importantes

⚠️ **Limitations APIs Gratuites:**
- Données macro, pas toujours détail CGT
- Mises à jour annuelles (pas temps réel)
- Nécessite validation manuelle
- Peut nécessiter parsing complexe

✅ **Avantages:**
- $0 de coût
- Données officielles
- Couverture mondiale
- Suffisant pour MVP

🎯 **Conseil**: Combiner APIs gratuites + validation manuelle = meilleur rapport qualité/prix pour MVP.
