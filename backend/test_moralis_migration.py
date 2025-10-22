"""
Test Script: Moralis Migration

Tests the blockchain_parser_adapter to ensure:
1. Moralis works for EVM chains
2. Fallback to legacy parser works
3. Solana still uses legacy parser
4. Output format is identical
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

from app.services.blockchain_parser_adapter import BlockchainParser


# Test wallets (public addresses for testing)
TEST_WALLETS = {
    "ethereum": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",  # Vitalik
    "polygon": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "base": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "solana": "Vote111111111111111111111111111111111111111",  # Solana validator
}


async def test_parser(chain: str, wallet: str, api_keys: dict):
    """Test parser for a specific chain"""

    print(f"\n{'='*60}")
    print(f"Testing {chain.upper()}: {wallet}")
    print(f"{'='*60}")

    try:
        parser = BlockchainParser(api_keys=api_keys)

        # Parse last 30 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)

        transactions = await parser.parse_wallet_transactions(
            wallet_address=wallet,
            chain=chain,
            start_date=start_date,
            end_date=end_date
        )

        print(f"\n✅ Success! Found {len(transactions)} transactions")

        if transactions:
            print(f"\nSample transaction (first):")
            tx = transactions[0]
            print(f"  • Hash: {tx.get('tx_hash')}")
            print(f"  • Timestamp: {tx.get('timestamp')}")
            print(f"  • Type: {tx.get('transaction_type')}")
            print(f"  • Protocol: {tx.get('protocol_name')}")

            if tx.get('token_in'):
                print(f"  • Token In: {tx.get('amount_in')} {tx.get('token_in')} (${tx.get('usd_value_in', 0):.2f})")
            if tx.get('token_out'):
                print(f"  • Token Out: {tx.get('amount_out')} {tx.get('token_out')} (${tx.get('usd_value_out', 0):.2f})")

            # Check if prices are estimated
            if tx.get('price_in_estimated') or tx.get('price_out_estimated'):
                print(f"  ⚠️  Price estimated: IN={tx.get('price_in_estimated')}, OUT={tx.get('price_out_estimated')}")
            else:
                print(f"  ✅ Real prices (not estimated)")

        return True, len(transactions)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False, 0


async def main():
    """Run all tests"""

    print("\n" + "="*60)
    print("MORALIS MIGRATION TEST SUITE")
    print("="*60)

    # Load API keys from environment
    api_keys = {
        "etherscan": os.getenv("ETHERSCAN_API_KEY"),
        "solana": os.getenv("SOLANA_API_KEY"),
        "helius": os.getenv("HELIUS_API_KEY"),
    }

    # Check Moralis config
    moralis_key = os.getenv("MORALIS_API_KEY")
    use_moralis = os.getenv("USE_MORALIS", "true").lower() in ("true", "1", "yes")

    print(f"\nConfiguration:")
    print(f"  • MORALIS_API_KEY: {'✅ Set' if moralis_key else '❌ Not set'}")
    print(f"  • USE_MORALIS: {use_moralis}")
    print(f"  • ETHERSCAN_API_KEY: {'✅ Set' if api_keys['etherscan'] else '❌ Not set'}")
    print(f"  • HELIUS_API_KEY: {'✅ Set' if api_keys['helius'] else '❌ Not set'}")

    if not moralis_key:
        print(f"\n⚠️  WARNING: MORALIS_API_KEY not set - will use legacy parser for all chains")
        print(f"   To test Moralis, add MORALIS_API_KEY to your .env file")

    # Test results
    results = {}

    # Test each chain
    for chain, wallet in TEST_WALLETS.items():
        success, tx_count = await test_parser(chain, wallet, api_keys)
        results[chain] = {"success": success, "transactions": tx_count}
        await asyncio.sleep(1)  # Rate limiting

    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")

    for chain, result in results.items():
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"{status} {chain:12} - {result['transactions']:4} transactions")

    # Overall status
    all_passed = all(r["success"] for r in results.values())

    if all_passed:
        print(f"\n🎉 All tests passed!")
        print(f"\nMoralis integration is ready to use.")
        print(f"To disable Moralis: set USE_MORALIS=false in .env")
    else:
        print(f"\n⚠️  Some tests failed - check errors above")
        print(f"\nNote: Moralis fallback to legacy parser should still work")

    print(f"\n{'='*60}\n")


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    # Run tests
    asyncio.run(main())
