# 📚 GUIDE: Importer un Audit DeFi et Tester le Cost Basis

## 🎯 Objectif
Créer un audit DeFi avec Etherscan pour tester automatiquement la création des lots Cost Basis.

---

## 📋 MÉTHODES DISPONIBLES

### Méthode 1: Interface Web (Frontend) 🖥️

1. **Accéder au panel DeFi Audit**
   ```
   http://localhost:3001/defi-audit
   ```

2. **Créer un nouvel audit**
   - Cliquer sur "New Audit" ou "Créer un audit"
   - Entrer ton adresse Ethereum (0x...)
   - Sélectionner "ethereum" dans les chaînes
   - Définir la période (ex: 2024-01-01 à 2024-12-31)
   - Cliquer sur "Start Audit"

3. **Suivre la progression**
   - Une barre de progression s'affiche
   - Attendre que le status passe à "completed"

4. **Voir les résultats**
   - Transactions listées avec gain/loss
   - Export CSV/PDF disponible
   - Lots Cost Basis créés automatiquement en arrière-plan

---

### Méthode 2: API avec curl 🔧

```bash
# 1. Se connecter et obtenir un token
TOKEN=$(curl -s -X POST "http://localhost:8001/auth/login" \
  -d "username=e2etest@example.com" \
  -d "password=Test123456" \
  | jq -r '.access_token')

echo "Token: $TOKEN"

# 2. Créer l'audit avec ton adresse Ethereum
curl -X POST "http://localhost:8001/defi/audit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xTON_ADRESSE_ETHEREUM",
    "chains": ["ethereum"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'

# La réponse contient l'audit_id
# {"id": 53, "status": "completed", ...}

# 3. Vérifier le statut
AUDIT_ID=53
curl -X GET "http://localhost:8001/defi/audit/$AUDIT_ID/status" \
  -H "Authorization: Bearer $TOKEN"

# 4. Voir les détails
curl -X GET "http://localhost:8001/defi/audit/$AUDIT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Méthode 3: Script Python Automatisé 🐍

J'ai créé un script simple pour toi: `test_import_audit.py`

```bash
# Utilisation:
python3 test_import_audit.py "0xTON_ADRESSE_ETHEREUM"

# Exemple avec une vraie adresse:
python3 test_import_audit.py "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

Le script va:
1. ✅ Se connecter automatiquement
2. ✅ Créer l'audit
3. ✅ Attendre la complétion
4. ✅ Afficher les résultats
5. ✅ Vérifier les lots Cost Basis créés

---

## 🔍 VÉRIFIER LES LOTS COST BASIS CRÉÉS

### Option A: Via script Python
```bash
docker exec nomadcrypto-backend python scripts/test_cost_basis_verification.py
```

### Option B: Via base de données directement
```bash
docker exec -i nomadcrypto-postgres psql -U postgres cryptonomad << 'EOF'
-- Voir les derniers lots créés
SELECT
  id,
  token,
  original_amount,
  acquisition_price_usd,
  acquisition_date,
  acquisition_method
FROM cost_basis_lots
ORDER BY created_at DESC
LIMIT 10;

-- Voir les disposals créés
SELECT
  id,
  disposal_date,
  amount_disposed,
  disposal_price_usd,
  gain_loss
FROM cost_basis_disposals
ORDER BY disposal_date DESC
LIMIT 5;
EOF
```

---

## 📊 EXEMPLE COMPLET

### Test avec une adresse Ethereum réelle

```bash
# 1. Définir l'adresse à tester
ADDRESS="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

# 2. Lancer le test
python3 test_import_audit.py "$ADDRESS"

# 3. Le script affiche:
# ✅ Audit créé: ID=53
# ✅ 15 transactions trouvées
# ✅ 8 lots Cost Basis créés
# ✅ 3 disposals enregistrés
# ✅ Net Gain/Loss: $1,234.56

# 4. Vérifier en détail
docker exec nomadcrypto-backend python << 'EOF'
from app.database import SessionLocal
from app.models.cost_basis import CostBasisLot, CostBasisDisposal

db = SessionLocal()

# Compter les nouveaux lots
lots = db.query(CostBasisLot).filter(
    CostBasisLot.user_id == 24  # Ton user_id
).order_by(CostBasisLot.created_at.desc()).limit(10).all()

print("\n📦 Derniers lots créés:")
for lot in lots:
    print(f"  • {lot.token}: {lot.original_amount} @ ${lot.acquisition_price_usd}")
    print(f"    Method: {lot.acquisition_method.value}")
    print(f"    Remaining: {lot.remaining_amount}")
    print()

db.close()
EOF
```

---

## 🎯 CE QUI SE PASSE AUTOMATIQUEMENT

Quand tu crées un audit DeFi:

### 1. Parsing des Transactions
```
Etherscan → Backend → Parse chaque transaction
```

### 2. Création des Lots (Acquisitions)
```
Pour chaque acquisition (swap, reward, transfer_in):
  ✅ Nouveau lot Cost Basis créé
  ✅ Token, montant, prix enregistrés
  ✅ Méthode (swap/airdrop/mining) enregistrée
```

### 3. Consommation FIFO (Disposals)
```
Pour chaque vente/swap sortant:
  ✅ Sélection du lot le plus ancien (FIFO)
  ✅ Calcul du gain/loss
  ✅ Création du disposal
  ✅ Mise à jour du remaining_amount
```

---

## 🧪 TESTER AVEC DIFFÉRENTES ADRESSES

### Adresse avec beaucoup de swaps
```bash
python3 test_import_audit.py "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
# → Beaucoup de lots Cost Basis créés
```

### Adresse avec peu de transactions
```bash
python3 test_import_audit.py "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
# → Quelques lots seulement
```

### Adresse Solana
```bash
python3 test_import_audit.py "FNShLm9K4cFBvjf18VL8j3o4ZmD7HvkWBWDX5ztpT1WQ" --chain solana
```

---

## 📝 FICHIERS UTILES

### Scripts de test
- `test_import_audit.py` - Script automatisé d'import
- `test_defi_audit_e2e.py` - Test end-to-end complet
- `backend/scripts/test_cost_basis_verification.py` - Vérification DB

### Logs
```bash
# Voir les logs du backend pendant l'audit
docker logs -f nomadcrypto-backend | grep -i "cost.basis\|fifo"

# Exemples de logs attendus:
# [COST BASIS] Created lot: 1.5 ETH at $2500.00 via swap
# [FIFO] Consuming 0.5 ETH from lot 123
# [COST BASIS] Disposal created: gain of $150.00
```

---

## ⚠️ NOTES IMPORTANTES

### Données de test vs Production
- Pour les tests, utilise un compte de test
- Les lots Cost Basis sont créés automatiquement
- Aucune action manuelle nécessaire

### Limites API
- Etherscan: 5 calls/seconde (gratuit)
- CoinGecko: 10-50 calls/minute
- Helius (Solana): Dépend de ton plan

### Délai de traitement
- Adresse avec 10 transactions: ~5 secondes
- Adresse avec 100 transactions: ~30 secondes
- Adresse avec 1000 transactions: ~5 minutes

---

## 🆘 PROBLÈMES COURANTS

### "No transactions found"
```
Causes possibles:
- Adresse sans activité DeFi
- Période trop restrictive
- Chaîne incorrecte
```

### "Price not found"
```
Solution:
- Les prix sont estimés avec moyennes mensuelles si nécessaire
- Flag price_estimated = true dans la transaction
```

### "Cost basis = $0"
```
Cause:
- Première vente avant import des achats
- Warning visible dans les résultats
```

---

## ✅ CHECKLIST DE TEST

Avant de tester:
- [ ] Backend running (`docker ps | grep backend`)
- [ ] Compte utilisateur créé
- [ ] Adresse Ethereum valide (0x... 42 caractères)
- [ ] Clés API configurées (Etherscan, CoinGecko)

Après le test:
- [ ] Audit complété (status = "completed")
- [ ] Transactions visibles
- [ ] Lots Cost Basis créés
- [ ] Calculs de gain/loss corrects
- [ ] Export CSV/PDF fonctionnel

---

**Prêt à tester?** Utilise le script Python ou l'interface web! 🚀
