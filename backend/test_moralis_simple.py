"""
Simple Moralis Test - Tests only Moralis API directly
No dependencies on legacy code
"""

import asyncio
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment
load_dotenv()

async def test_moralis_api():
    """Test Moralis API directly"""

    print("\n" + "="*60)
    print("MORALIS API - SIMPLE TEST")
    print("="*60)

    # Check config
    moralis_key = os.getenv("MORALIS_API_KEY")

    if not moralis_key:
        print("\n❌ MORALIS_API_KEY not set in .env")
        return False

    print(f"\n✅ MORALIS_API_KEY found: {moralis_key[:20]}...")

    # Import Moralis
    try:
        from moralis import evm_api
        print("✅ Moralis module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import moralis: {e}")
        return False

    # Test wallet (USDC contract - always has activity)
    test_wallet = "0xdac17f958d2ee523a2206206994597c13d831ec7"  # Tether USDT contract
    chain_id = "0x1"  # Ethereum

    print(f"\n📍 Testing wallet: {test_wallet}")
    print(f"📍 Chain: Ethereum (0x1)")

    # Test 1: Get wallet history
    print(f"\n{'='*60}")
    print("TEST 1: Get Wallet History")
    print(f"{'='*60}")

    try:
        result = evm_api.wallets.get_wallet_history(
            api_key=moralis_key,
            params={
                "chain": chain_id,
                "address": test_wallet,
                "limit": 5,
                "order": "DESC",
            }
        )

        txs = result.get('result', [])
        print(f"✅ Success! Found {len(txs)} transactions")

        if txs:
            print(f"\nSample transaction:")
            tx = txs[0]
            print(f"  • Hash: {tx.get('hash')}")
            print(f"  • Block: {tx.get('block_number')}")
            print(f"  • Timestamp: {tx.get('block_timestamp')}")
            print(f"  • Category: {tx.get('category')}")
            print(f"  • Value: {tx.get('value', 0)} wei")
            print(f"  • Value USD: ${tx.get('value_usd', 0)}")

    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    # Test 2: Get DeFi positions
    print(f"\n{'='*60}")
    print("TEST 2: Get DeFi Positions")
    print(f"{'='*60}")

    try:
        defi_result = evm_api.wallets.get_defi_positions_summary(
            api_key=moralis_key,
            params={
                "chain": chain_id,
                "address": test_wallet,
            }
        )

        positions = defi_result.get('result', [])
        print(f"✅ Success! Found {len(positions)} DeFi positions")

        if positions:
            print(f"\nSample position:")
            pos = positions[0]
            print(f"  • Protocol: {pos.get('protocol_name')}")
            print(f"  • Type: {pos.get('position_type')}")
            print(f"  • USD Value: ${pos.get('position_usd_value', 0)}")
            print(f"  • Unclaimed Rewards: ${pos.get('unclaimed_usd_value', 0)}")

    except Exception as e:
        # DeFi positions might not be available for all wallets
        print(f"⚠️  Note: {e}")
        print(f"   (DeFi positions may not be available for this wallet)")

    # Test 3: Get token price
    print(f"\n{'='*60}")
    print("TEST 3: Get Token Price")
    print(f"{'='*60}")

    usdc_address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"  # USDC

    try:
        price_result = evm_api.token.get_token_price(
            api_key=moralis_key,
            params={
                "chain": chain_id,
                "address": usdc_address,
            }
        )

        price = price_result.get('usdPrice', 0)
        print(f"✅ Success! USDC Price: ${price}")

    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Moralis API is working correctly!")
    print(f"✅ Wallet history: OK")
    print(f"✅ Token prices: OK")
    print(f"\n🎉 Moralis integration ready!")
    print(f"{'='*60}\n")

    return True


if __name__ == "__main__":
    success = asyncio.run(test_moralis_api())
    exit(0 if success else 1)
