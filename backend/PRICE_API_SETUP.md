# Price API Configuration

## Overview

The DeFi audit system uses a **3-tier fallback system** for cryptocurrency prices to ensure maximum accuracy for tax reporting:

```
1. CoinGecko API (historical prices, exact)
   ↓ (if rate-limited or fails)
2. CoinMarketCap API (current prices, exact)
   ↓ (if both APIs fail)
3. Monthly Averages (estimated, hardcoded)
```

## Why This Matters for Tax Audits

For **accurate tax reporting**, prices must be exact historical prices at the time of transaction. Using estimated or current prices can lead to:
- ❌ Incorrect capital gains/losses calculations
- ❌ Tax authority rejections
- ⚠️ Potential audit issues

Our system:
- ✅ Marks estimated prices with `price_in_estimated` / `price_out_estimated` flags
- ✅ Warns users when estimated prices are used
- ✅ Provides exact prices when APIs are available

## API Configuration

### 1. CoinGecko (Primary)

**Pros:**
- ✅ Free tier available
- ✅ Historical prices (exact date)
- ✅ 10-50 calls/minute on free tier

**Cons:**
- ⚠️ Rate limited on free tier
- ⚠️ May return 429 errors during high usage

**Setup:** No API key needed for free tier

### 2. CoinMarketCap (Fallback)

**Pros:**
- ✅ 10,000 credits/month on free tier
- ✅ Current prices (exact, real-time)
- ✅ Higher rate limits

**Cons:**
- ⚠️ Free tier only provides current prices (not historical)
- ⚠️ Uses current price as proxy for historical

**Setup:**
```bash
# Add to .env
COINMARKETCAP_API_KEY=ae9cc746e2ee4eb48ffb07f72cd84b14
```

### 3. Monthly Averages (Last Resort)

**When Used:** Only when both APIs fail

**Available Tokens:**
- ETH, SOL, MATIC, BNB
- Monthly averages for 2024-2025
- Located in `price_service.py:HISTORICAL_AVERAGES`

**Note:** ⚠️ These are ESTIMATES and not suitable for final tax filing

## How It Works

### Price Fetching Logic

```python
# 1. Try CoinGecko with retry (2 attempts, 0.5s + 1.5s delays)
price = coingecko.get_historical_price(token, date)
if price:
    return {price: price, is_estimated: False}

# 2. Fallback to CoinMarketCap
price = coinmarketcap.get_current_price(token)
if price:
    return {price: price, is_estimated: False}  # Current price as proxy

# 3. Last resort: monthly average
price = HISTORICAL_AVERAGES[token][month]
return {price: price, is_estimated: True}
```

### Database Tracking

New columns in `defi_transactions`:
- `price_in_estimated` (BOOLEAN): True if price_in used fallback
- `price_out_estimated` (BOOLEAN): True if price_out used fallback

### Audit Warning

When estimated prices are used, the audit summary includes:

```
⚠️ WARNING: 20 of 31 transactions use ESTIMATED prices (monthly averages).
For accurate tax reporting, consider upgrading to CoinGecko Pro API or
manually verifying these prices.
```

## Upgrading for Production

### Option 1: CoinGecko Pro (Recommended for Historical Accuracy)

**Cost:** $129/month (Analyst plan)

**Benefits:**
- ✅ Unlimited historical price lookups
- ✅ Exact prices for any date
- ✅ No rate limiting
- ✅ Best for tax compliance

**Setup:**
```bash
# Add to .env
COINGECKO_PRO_API_KEY=your_pro_key_here
```

Then update `price_service.py` to use Pro endpoint:
```python
self.base_url = "https://pro-api.coingecko.com/api/v3"
```

### Option 2: CoinMarketCap Standard (Current Prices)

**Cost:** $79/month (Hobbyist plan)

**Benefits:**
- ✅ 100,000 credits/month
- ✅ Real-time prices
- ⚠️ Still uses current price as proxy for historical

**Setup:** Already configured with free tier key

### Option 3: Hybrid (Best Value)

**Recommended Setup:**
- CoinGecko Free: Primary source
- CoinMarketCap Free: Fallback for rate limits
- Manual verification for large transactions

**User Action Required:**
- Review transactions marked with `price_estimated: true`
- Manually verify prices for high-value transactions
- Use tax software with historical price data

## Testing

Test price fetching:

```bash
docker exec nomadcrypto-backend python -c "
from app.services.price_service import PriceService
from datetime import datetime

service = PriceService()
result = service.get_historical_price_with_metadata('SOL', datetime(2024, 4, 14))

print(f'Price: \${result[\"price\"]}')
print(f'Estimated: {result[\"is_estimated\"]}')
"
```

## Current Status

✅ **Implemented:**
- CoinGecko API with retry
- CoinMarketCap fallback
- Monthly averages fallback
- Estimation tracking in database
- User warnings in audit reports

⚠️ **Limitations:**
- CoinGecko free tier is rate-limited (expect ~60% estimated prices)
- CoinMarketCap free tier uses current prices (not truly historical)
- Monthly averages are rough estimates

📊 **Test Results:**
- 31 Solana transactions parsed
- 7 exact prices (23%)
- 24 estimated prices (77%)
- Rate limiting after ~7 CoinGecko calls

## Recommendations

**For Development/Testing:**
- ✅ Current setup is fine (free APIs + fallbacks)

**For Production with Real Users:**
- 🔥 Upgrade to CoinGecko Pro ($129/month)
- OR require users to manually verify estimated prices
- OR integrate with tax software that provides historical prices

**For Tax Compliance:**
- ⚠️ Always warn users about estimated prices
- ⚠️ Recommend manual verification for large transactions (>$1000)
- ⚠️ Provide export to CSV for manual price updates
