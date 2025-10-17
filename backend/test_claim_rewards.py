"""
Test claim_rewards transaction
"""
import asyncio
import os
from app.services.blockchain_parser import BlockchainParser

async def test_claim_rewards():
    """Test claim_rewards parsing"""

    api_keys = {
        "etherscan": os.getenv("ETHERSCAN_API_KEY", "")
    }
    parser = BlockchainParser(api_keys)

    # Test with a claim_rewards transaction from audit 40
    tx_hash = "0x99bf783d388360df61f94c225060727739be3dc23dfed5d1154320ef028f5c09"
    chain = "base"
    user_wallet = "0x7c360d127f2a7ec05ae76e551bf70c9737b43c9e"

    print(f"Testing claim_rewards for: {tx_hash}\n")

    # Fetch receipt and parse
    receipt = await parser._fetch_transaction_receipt(tx_hash, chain)

    if receipt:
        print(f"✅ Receipt fetched, {len(receipt.get('logs', []))} logs")
        log_tokens = parser._parse_transfer_logs(receipt.get("logs", []), user_wallet)

        print(f"\nParsed tokens:")
        print(f"  token_in: {log_tokens.get('token_in')} (amount: {log_tokens.get('amount_in')})")
        print(f"  token_out: {log_tokens.get('token_out')} (amount: {log_tokens.get('amount_out')})")

        if log_tokens.get('token_in') or log_tokens.get('token_out'):
            print("\n✅ SUCCESS!")
        else:
            print("\n❌ No tokens found")
    else:
        print("❌ Failed to fetch receipt")

if __name__ == "__main__":
    asyncio.run(test_claim_rewards())
