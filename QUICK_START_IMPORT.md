# 🚀 QUICK START - Importer un Audit DeFi

## 3 Façons de Tester en 30 Secondes

### 1️⃣ Interface Web (Le plus simple)

```bash
# Ouvrir ton navigateur:
http://localhost:3001/defi-audit

# Puis:
1. Cliquer "New Audit"
2. Coller ton adresse Ethereum (0x...)
3. Sélectionner "ethereum"
4. Cliquer "Start Audit"
5. Attendre 10-30 secondes
6. ✅ Voir les résultats + Cost Basis créés automatiquement!
```

---

### 2️⃣ Script Python Automatisé (Recommandé)

```bash
# Avec TON adresse Ethereum:
python3 test_import_audit.py "0xTON_ADRESSE_ICI"

# Exemple avec une adresse de test:
python3 test_import_audit.py "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

# Avec Solana:
python3 test_import_audit.py "FNShLm9K4cFBvjf18VL8j3o4ZmD7HvkWBWDX5ztpT1WQ" --chain solana
```

Le script fait TOUT automatiquement:
- ✅ Se connecte
- ✅ Crée l'audit
- ✅ Attend la fin
- ✅ Affiche les résultats
- ✅ Vérifie les lots Cost Basis

---

### 3️⃣ Commande curl Simple

```bash
# 1. Obtenir un token
TOKEN=$(python3 -c "
import requests
r = requests.post('http://localhost:8001/auth/login',
    data={'username': 'e2etest@example.com', 'password': 'Test123456'})
print(r.json()['access_token'])
")

# 2. Créer l'audit (remplace TON_ADRESSE)
curl -X POST "http://localhost:8001/defi/audit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xTON_ADRESSE",
    "chains": ["ethereum"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'

# 3. Note l'audit_id dans la réponse, puis:
AUDIT_ID=53

# 4. Voir les résultats
curl -s "http://localhost:8001/defi/audit/$AUDIT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## 🎯 Exemples d'Adresses pour Tester

### Ethereum - Beaucoup d'activité DeFi
```bash
python3 test_import_audit.py "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

### Ethereum - Adresse Vitalik (beaucoup de txs!)
```bash
python3 test_import_audit.py "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
```

### Solana - Adresse de test
```bash
python3 test_import_audit.py "FNShLm9K4cFBvjf18VL8j3o4ZmD7HvkWBWDX5ztpT1WQ" --chain solana
```

---

## 📊 Que se passe-t-il automatiquement?

1. **Parsing des transactions**
   - Récupère toutes les transactions de l'adresse
   - Identifie les swaps, rewards, transfers

2. **Création des lots Cost Basis** (automatique!)
   ```
   Chaque token reçu → Nouveau lot créé
   Ex: Swap 1 ETH → 2000 USDC
     → Lot: 2000 USDC @ $1.00
   ```

3. **Calcul FIFO** (automatique!)
   ```
   Chaque token vendu → Consomme lots (FIFO)
   Ex: Swap 1000 USDC → 0.5 ETH
     → Consomme 1000 USDC du lot le plus ancien
     → Calcule le gain/loss
   ```

4. **Résultats visibles**
   - Transactions avec gain/loss
   - Export CSV/PDF
   - Lots Cost Basis en DB

---

## ✅ Vérifier les Lots Créés

```bash
# Voir les lots Cost Basis créés
docker exec nomadcrypto-backend python << 'EOF'
from app.database import SessionLocal
from app.models.cost_basis import CostBasisLot

db = SessionLocal()
lots = db.query(CostBasisLot).order_by(
    CostBasisLot.created_at.desc()
).limit(5).all()

print("\n📦 Derniers lots Cost Basis:")
for lot in lots:
    print(f"  • {lot.token}: {lot.original_amount} @ ${lot.acquisition_price_usd}")
    print(f"    Method: {lot.acquisition_method.value}")
    print(f"    Date: {lot.acquisition_date}")

db.close()
EOF
```

---

## 🆘 Problème?

### "No transactions found"
```bash
# Vérifie que l'adresse a des transactions DeFi sur cette chaîne
# Essaie une période plus large: --start-date "2020-01-01"
```

### Script ne fonctionne pas
```bash
# Vérifie que le backend tourne:
docker ps | grep backend

# Vérifie que tu as les dépendances:
pip3 install requests
```

### Besoin d'aide?
```bash
python3 test_import_audit.py --help

# Ou lis le guide complet:
cat GUIDE_IMPORT_AUDIT_DEFI.md
```

---

## 🎉 C'est tout!

**En 1 commande, tu peux:**
- ✅ Importer un audit DeFi complet
- ✅ Créer tous les lots Cost Basis automatiquement
- ✅ Calculer les gains/pertes avec FIFO
- ✅ Exporter en CSV/PDF

**Essaie maintenant:**
```bash
python3 test_import_audit.py "TON_ADRESSE_ETHEREUM"
```
