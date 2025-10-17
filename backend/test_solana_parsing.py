"""
Test Solana transaction parsing with Solscan Public API
"""
import asyncio
import os
from app.services.blockchain_parser import BlockchainParser

async def test_solana_parsing():
    """Test Solana transaction parsing"""

    api_keys = {
        "solana": os.getenv("SOLANA_API_KEY", ""),
        "helius": os.getenv("HELIUS_API_KEY", "")
    }
    parser = BlockchainParser(api_keys)

    # Test wallet from user's audit
    wallet_address = "CqPedhYiu5Gc5z1JxiJT171Be9akcYF1qeXYYf15pNX1"

    print(f"Testing Solana parsing for: {wallet_address}\n")

    # Parse transactions
    transactions = await parser._parse_solana_transactions(wallet_address)

    print(f"\n✅ Found {len(transactions)} transactions")

    if transactions:
        print("\nFirst 5 transactions:")
        for i, tx in enumerate(transactions[:5]):
            print(f"\n{i+1}. {tx.get('tx_hash', '')[:16]}...")
            print(f"   Type: {tx.get('transaction_type')}")
            print(f"   Token in: {tx.get('token_in')} ({tx.get('amount_in')})")
            print(f"   Token out: {tx.get('token_out')} ({tx.get('amount_out')})")
            print(f"   USD in: ${tx.get('usd_value_in')}")
            print(f"   USD out: ${tx.get('usd_value_out')}")
            print(f"   Timestamp: {tx.get('timestamp')}")
    else:
        print("\n❌ No transactions found - check API key and wallet address")

if __name__ == "__main__":
    asyncio.run(test_solana_parsing())
