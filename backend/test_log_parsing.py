"""
Test script to verify log parsing functionality
"""
import asyncio
import os
from app.services.blockchain_parser import BlockchainParser

async def test_log_parsing():
    """Test fetching and parsing transaction logs"""

    # Initialize parser with API keys from environment
    api_keys = {
        "etherscan": os.getenv("ETHERSCAN_API_KEY", "")
    }
    parser = BlockchainParser(api_keys)

    # Test with a known transaction from audit 40 (deposit with missing tokens)
    tx_hash = "0x1c1ef7c950b807cf7fa09a09271069d661fa17c5acccd3b6e1f18d0162b5ec9e"
    chain = "ethereum"

    print(f"Testing log parsing for transaction: {tx_hash}\n")

    # Fetch receipt
    print("1. Fetching transaction receipt...")
    receipt = await parser._fetch_transaction_receipt(tx_hash, chain)

    if not receipt:
        print("❌ Failed to fetch receipt")
        return

    print(f"✅ Receipt fetched, found {len(receipt.get('logs', []))} logs")

    # Parse logs
    print("\n2. Parsing Transfer events...")
    user_wallet = "0x7c360d127f2a7ec05ae76e551bf70c9737b43c9e"
    log_tokens = parser._parse_transfer_logs(receipt.get("logs", []), user_wallet)

    print(f"\nResults:")
    print(f"  token_in: {log_tokens.get('token_in')}")
    print(f"  amount_in: {log_tokens.get('amount_in')}")
    print(f"  token_out: {log_tokens.get('token_out')}")
    print(f"  amount_out: {log_tokens.get('amount_out')}")

    if log_tokens.get('token_in') or log_tokens.get('token_out'):
        print("\n✅ SUCCESS: Tokens identified from logs!")
    else:
        print("\n❌ No tokens found in logs")
        print("\nDebug: First 3 logs:")
        for i, log in enumerate(receipt.get("logs", [])[:3]):
            print(f"\nLog {i+1}:")
            print(f"  Address: {log.get('address')}")
            print(f"  Topics: {log.get('topics', [])[:2]}")

if __name__ == "__main__":
    asyncio.run(test_log_parsing())
