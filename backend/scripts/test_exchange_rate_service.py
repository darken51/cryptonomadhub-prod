"""
Test Exchange Rate Service

Simple script to test the multi-currency exchange rate service.
"""
import sys
import os
import asyncio
from datetime import date, datetime, timedelta
from decimal import Decimal

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.dependencies import get_exchange_rate_service


async def test_exchange_rates():
    """Test various exchange rate scenarios"""
    service = get_exchange_rate_service()

    print("="*60)
    print("Testing Multi-Currency Exchange Rate Service")
    print("="*60)

    # Test 1: Current rate (USD -> EUR)
    print("\n📊 Test 1: Current Rate (USD → EUR)")
    rate, source = await service.get_exchange_rate("USD", "EUR")
    if rate:
        print(f"✓ 1 USD = {rate:.4f} EUR (Source: {source})")
        # Convert $1000
        converted = await service.convert_amount(Decimal("1000"), "USD", "EUR")
        print(f"  $1,000 = €{converted:.2f}")
    else:
        print(f"✗ Failed to get rate")

    # Test 2: Historical rate (USD -> EUR, 1 year ago)
    print("\n📊 Test 2: Historical Rate (USD → EUR, 1 year ago)")
    historical_date = date.today() - timedelta(days=365)
    rate, source = await service.get_exchange_rate("USD", "EUR", historical_date)
    if rate:
        print(f"✓ 1 USD = {rate:.4f} EUR on {historical_date} (Source: {source})")
    else:
        print(f"✗ Failed to get historical rate")

    # Test 3: Same currency
    print("\n📊 Test 3: Same Currency (USD → USD)")
    rate, source = await service.get_exchange_rate("USD", "USD")
    print(f"✓ 1 USD = {rate} USD (Source: {source})")

    # Test 4: Major currencies (GBP, JPY, CHF)
    print("\n📊 Test 4: Multiple Major Currencies")
    currencies = ["EUR", "GBP", "JPY", "CHF", "AUD", "CAD"]
    rates = await service.get_multi_currency_rates("USD", currencies)
    for currency, rate in rates.items():
        if rate:
            print(f"✓ 1 USD = {rate:.4f} {currency}")

    # Test 5: Exotic currencies
    print("\n📊 Test 5: Exotic Currencies (via USD proxy)")
    test_pairs = [
        ("USD", "BRL"),  # Brazilian Real
        ("USD", "INR"),  # Indian Rupee
        ("USD", "ZAR"),  # South African Rand
    ]
    for from_curr, to_curr in test_pairs:
        rate, source = await service.get_exchange_rate(from_curr, to_curr)
        if rate:
            print(f"✓ 1 {from_curr} = {rate:.4f} {to_curr} (Source: {source})")

    # Test 6: Eurozone countries
    print("\n📊 Test 6: Eurozone Countries (all should use EUR)")
    eurozone = ["FR", "DE", "ES", "IT", "PT"]
    for country_code in eurozone:
        from app.data.currency_mapping import get_currency_info
        info = get_currency_info(country_code)
        if info:
            print(f"✓ {country_code}: {info.currency_code} ({info.currency_symbol})")

    # Test 7: Cache performance
    print("\n📊 Test 7: Cache Performance")
    import time

    # First call (no cache)
    start = time.time()
    rate1, source1 = await service.get_exchange_rate("USD", "EUR", date(2024, 1, 1))
    time1 = (time.time() - start) * 1000

    # Second call (should be cached)
    start = time.time()
    rate2, source2 = await service.get_exchange_rate("USD", "EUR", date(2024, 1, 1))
    time2 = (time.time() - start) * 1000

    print(f"✓ First call:  {time1:.2f}ms (Source: {source1})")
    print(f"✓ Second call: {time2:.2f}ms (Source: {source2})")
    print(f"  Speedup: {time1/time2:.1f}x faster")

    # Test 8: Cross-currency conversion (EUR -> GBP through USD)
    print("\n📊 Test 8: Cross-Currency (EUR → GBP)")
    rate, source = await service.get_exchange_rate("EUR", "GBP")
    if rate:
        print(f"✓ 1 EUR = {rate:.4f} GBP (Source: {source})")
        converted = await service.convert_amount(Decimal("1000"), "EUR", "GBP")
        print(f"  €1,000 = £{converted:.2f}")

    print("\n" + "="*60)
    print("✅ Exchange Rate Service Tests Complete!")
    print("="*60)

    await service.close()


if __name__ == "__main__":
    asyncio.run(test_exchange_rates())
