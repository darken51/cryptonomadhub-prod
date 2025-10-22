# 🚀 Migration Moralis - Documentation

## Vue d'ensemble

Cette migration intègre l'API Moralis pour améliorer le parsing blockchain DeFi, tout en maintenant une compatibilité 100% backward avec le code existant.

### ✅ Ce qui a changé

- **Nouveau fichier**: `backend/app/services/blockchain_parser_adapter.py`
- **Modification**: `backend/app/services/defi_audit_service.py` (1 ligne)
- **Configuration**: Ajout de `MORALIS_API_KEY` et `USE_MORALIS` dans `.env`
- **Dependencies**: Ajout de `moralis==0.1.44` dans `requirements.txt`

### ✅ Ce qui n'a PAS changé

- Routes API
- Base de données
- Frontend
- Celery tasks
- Format des données
- Toute autre partie du système

---

## Architecture

```
DeFiAuditService
    ↓
BlockchainParserAdapter (nouveau)
    ├─→ Moralis API (EVM chains) - prioritaire
    ├─→ Legacy Parser (fallback automatique)
    └─→ Legacy Parser (Solana - Helius)
```

### Stratégie par chain

| Chain | Priorité | Fallback |
|-------|----------|----------|
| **Solana** | Legacy (Helius) | - |
| **EVM** (Ethereum, Polygon, etc.) | Moralis | Legacy (Etherscan) |

---

## Installation

### 1. Installer le package Moralis

```bash
cd /home/fred/cryptonomadhub/backend
pip install moralis==0.1.44

# Ou si vous utilisez un virtualenv:
source venv/bin/activate  # Linux/Mac
pip install moralis==0.1.44
```

### 2. Vérifier la configuration

Le fichier `.env` contient déjà:

```bash
MORALIS_API_KEY=eyJhbGci...  # ✅ Déjà configuré
USE_MORALIS=true             # ✅ Déjà configuré
```

### 3. Tester l'installation

```bash
cd /home/fred/cryptonomadhub/backend
python test_moralis_migration.py
```

**Résultat attendu:**
```
=========================================================
MORALIS MIGRATION TEST SUITE
=========================================================

Configuration:
  • MORALIS_API_KEY: ✅ Set
  • USE_MORALIS: true
  • ETHERSCAN_API_KEY: ✅ Set
  • HELIUS_API_KEY: ✅ Set

============================================================
Testing ETHEREUM: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
============================================================
[ADAPTER] Using Moralis for ethereum: 0x742...
[MORALIS] Parsed 15 transactions

✅ Success! Found 15 transactions
...

🎉 All tests passed!
```

---

## Utilisation

### Mode Normal (Moralis activé)

**Rien à faire!** Le système utilise automatiquement Moralis pour les EVM chains.

```python
# defi_audit_service.py
from app.services.blockchain_parser_adapter import BlockchainParser

parser = BlockchainParser(api_keys=api_keys)
txs = await parser.parse_wallet_transactions(wallet, "ethereum")
# → Utilise Moralis automatiquement
```

### Désactiver Moralis temporairement

```bash
# Dans .env
USE_MORALIS=false
```

```bash
# Ou via variable d'environnement
USE_MORALIS=false uvicorn app.main:app --reload
```

### Fallback automatique

Si Moralis échoue (API down, rate limit, etc.), le système bascule automatiquement sur le legacy parser:

```
[ADAPTER] Using Moralis for ethereum: 0x...
[ADAPTER] ⚠️  Moralis failed: Rate limit exceeded
[ADAPTER] Falling back to legacy parser...
[PARSER] Using legacy Etherscan API...
✅ Success!
```

---

## Avantages Moralis

### 1. Prix réels (non estimés)

**Avant (Legacy):**
```python
{
    "usd_value_in": 1000.0,
    "price_in_estimated": True,  # ⚠️ Moyenne mensuelle
}
```

**Après (Moralis):**
```python
{
    "usd_value_in": 1000.0,
    "price_in_estimated": False,  # ✅ Prix réel DEX
}
```

### 2. DeFi Positions automatiques

Moralis détecte automatiquement:
- Staking positions (Lido, Rocket Pool, etc.)
- LP tokens (Uniswap, Curve, etc.)
- Lending positions (Aave, Compound)
- **Unclaimed rewards** 🎁

```python
{
    "transaction_type": "stake",
    "protocol_name": "Lido",
    "amount_in": 1.5,
    "token_in": "ETH",
    "unclaimed_rewards_usd": 0.05,  # ✅ Bonus Moralis!
}
```

### 3. Meilleure détection de protocoles

Le legacy parser connaît ~50 protocoles hardcodés.
Moralis reconnaît **2000+ protocoles** automatiquement.

---

## Coûts

### Free Tier (Actuel)
- **40,000 CU/jour** (≈ 1,200,000 CU/mois)
- Suffisant pour **~8,500 audits/mois**
- **$0/mois**

### Pro Tier (si besoin)
- **100M CU/mois**
- Suffisant pour **~700,000 audits/mois**
- **$49/mois**

### Calcul par audit

Un audit typique consomme:
```
get_wallet_history()           = 25 CU
get_defi_positions_summary()   = 50 CU
get_wallet_token_transfers()   = 5 CU
get_token_price() x 20 tokens  = 60 CU
--------------------------------
Total                          ≈ 140 CU
```

**Exemples:**
- 100 users × 5 audits/mois = **70,000 CU** → FREE tier ✅
- 1,000 users × 10 audits/mois = **1.4M CU** → Pro $49 ✅

---

## Monitoring

### Vérifier quel parser est utilisé

Cherchez dans les logs:

```bash
# Moralis utilisé
[ADAPTER] Using Moralis for ethereum: 0x...
[MORALIS] Parsed 25 transactions

# Legacy utilisé (fallback)
[ADAPTER] Moralis failed: Connection error
[ADAPTER] Falling back to legacy parser...

# Solana (toujours legacy)
[ADAPTER] Using legacy parser for Solana: Vote111...
```

### Dashboard Moralis

Consultez votre usage sur:
https://admin.moralis.io/web3apis

- Requêtes utilisées
- Rate limits
- Erreurs

---

## Rollback (si nécessaire)

### Option 1: Désactiver Moralis

```bash
# .env
USE_MORALIS=false
```

Redémarrez le serveur → utilise legacy parser pour tout.

### Option 2: Rollback complet

```bash
# Revenir à l'ancien import
cd /home/fred/cryptonomadhub/backend/app/services
nano defi_audit_service.py

# Ligne 17: Changer
from app.services.blockchain_parser_adapter import BlockchainParser
# → En
from app.services.blockchain_parser import BlockchainParser
```

---

## Troubleshooting

### Erreur: `No module named 'moralis'`

```bash
pip install moralis==0.1.44
```

### Moralis API errors

**Rate limit dépassé:**
```
[MORALIS] Error: Rate limit exceeded
[ADAPTER] Falling back to legacy parser...
```
→ Le fallback fonctionne automatiquement

**Clé API invalide:**
```
[MORALIS] Error: Invalid API key
```
→ Vérifiez `MORALIS_API_KEY` dans `.env`

### Legacy parser toujours utilisé

Vérifiez:
1. `MORALIS_API_KEY` est set dans `.env`
2. `USE_MORALIS=true` dans `.env`
3. Package `moralis` est installé

```bash
python -c "import moralis; print('✅ Moralis installed')"
```

---

## FAQ

### Q: Mes données existantes sont-elles affectées?
**R:** Non. La migration n'affecte que le parsing des nouvelles transactions.

### Q: Le frontend doit-il être modifié?
**R:** Non. Le format des données est identique.

### Q: Puis-je continuer d'utiliser le legacy parser?
**R:** Oui! Set `USE_MORALIS=false` ou supprimez `MORALIS_API_KEY`.

### Q: Solana utilise Moralis?
**R:** Non. Solana utilise toujours Helius (votre setup actuel qui fonctionne bien).

### Q: Que se passe-t-il si Moralis est down?
**R:** Fallback automatique vers le legacy parser. Zero downtime.

### Q: Les prix sont-ils toujours exacts?
**R:** Oui! Moralis utilise des prix DEX réels. Bien mieux que les estimations mensuelles du legacy parser.

---

## Support

**Problème avec Moralis:**
- Dashboard: https://admin.moralis.io
- Docs: https://docs.moralis.io
- Support: support@moralis.io

**Problème avec l'adapter:**
- Vérifier les logs: `[ADAPTER]`, `[MORALIS]`
- Tester: `python test_moralis_migration.py`
- Rollback: Set `USE_MORALIS=false`

---

## Changelog

### 2025-10-18 - Migration initiale
- ✅ Ajout `blockchain_parser_adapter.py`
- ✅ Integration Moralis API
- ✅ Fallback automatique vers legacy
- ✅ Tests ajoutés
- ✅ Documentation complète

---

**Status:** ✅ Production Ready
**Impact:** Zéro breaking changes
**Rollback:** Possible en 1 minute
