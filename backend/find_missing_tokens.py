from app.database import SessionLocal
from app.models.defi_protocol import DeFiTransaction
import json

db = SessionLocal()

# Get all transactions from recent audits
txs = db.query(DeFiTransaction).filter(
    DeFiTransaction.audit_id >= 38
).all()

print(f"=== ANALYSE DES TOKENS MANQUANTS ===\n")
print(f"Total transactions analysées: {len(txs)}\n")

# Find unknown tokens
unknown_tokens = {}
for tx in txs:
    if tx.raw_data:
        raw = tx.raw_data if isinstance(tx.raw_data, dict) else json.loads(tx.raw_data)

        # Check if token_in is unknown
        if tx.token_in == "?" or tx.token_in == "..." or not tx.token_in:
            # Try to find contract address in raw data
            if "from_address" in raw or "to_address" in raw:
                key = f"{tx.chain}_{tx.tx_hash[:10]}"
                unknown_tokens[key] = {
                    "tx_hash": tx.tx_hash,
                    "chain": tx.chain,
                    "timestamp": tx.timestamp,
                    "type": tx.transaction_type.value if tx.transaction_type else "unknown",
                    "direction": "IN",
                    "raw_from": raw.get("from_address", ""),
                    "raw_to": raw.get("to_address", "")
                }

        # Check if token_out is unknown
        if tx.token_out == "?" or tx.token_out == "..." or not tx.token_out:
            key = f"{tx.chain}_{tx.tx_hash[:10]}_out"
            unknown_tokens[key] = {
                "tx_hash": tx.tx_hash,
                "chain": tx.chain,
                "timestamp": tx.timestamp,
                "type": tx.transaction_type.value if tx.transaction_type else "unknown",
                "direction": "OUT",
                "raw_from": raw.get("from_address", ""),
                "raw_to": raw.get("to_address", "")
            }

print(f"Tokens inconnus trouvés: {len(unknown_tokens)}\n")

# Group by chain
by_chain = {}
for key, info in unknown_tokens.items():
    chain = info["chain"]
    if chain not in by_chain:
        by_chain[chain] = []
    by_chain[chain].append(info)

for chain, tokens in sorted(by_chain.items()):
    print(f"\n{'='*80}")
    print(f"CHAIN: {chain.upper()}")
    print(f"{'='*80}")
    print(f"Tokens manquants: {len(tokens)}\n")

    for token in tokens[:5]:  # Show first 5
        print(f"TX: {token['tx_hash'][:16]}...")
        print(f"  Type: {token['type']} ({token['direction']})")
        print(f"  Date: {token['timestamp']}")
        print(f"  From: {token['raw_from'][:42]}")
        print(f"  To: {token['raw_to'][:42]}")
        print()

# Now check for tokens that HAVE names but no USD values
print(f"\n{'='*80}")
print(f"TOKENS IDENTIFIÉS MAIS SANS USD VALUE")
print(f"{'='*80}\n")

txs_with_token_no_usd = []
for tx in txs:
    # Token IN identified but no USD value
    if tx.token_in and tx.token_in not in ["?", "..."] and not tx.usd_value_in:
        txs_with_token_no_usd.append({
            "tx_hash": tx.tx_hash[:16],
            "chain": tx.chain,
            "token": tx.token_in,
            "direction": "IN",
            "amount": tx.amount_in
        })

    # Token OUT identified but no USD value
    if tx.token_out and tx.token_out not in ["?", "..."] and not tx.usd_value_out:
        txs_with_token_no_usd.append({
            "tx_hash": tx.tx_hash[:16],
            "chain": tx.chain,
            "token": tx.token_out,
            "direction": "OUT",
            "amount": tx.amount_out
        })

print(f"Transactions avec token identifié mais pas de USD value: {len(txs_with_token_no_usd)}\n")

# Group by token
by_token = {}
for tx in txs_with_token_no_usd:
    token = tx["token"]
    if token not in by_token:
        by_token[token] = []
    by_token[token].append(tx)

for token, txs_list in sorted(by_token.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"Token: {token}")
    print(f"  Occurrences: {len(txs_list)}")
    print(f"  Chains: {', '.join(set([t['chain'] for t in txs_list]))}")
    print(f"  Example: {txs_list[0]['tx_hash']}... ({txs_list[0]['amount']} {token})")
    print()

db.close()
