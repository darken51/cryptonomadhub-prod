"""
Test API endpoints (temporary - for debugging)
"""
from fastapi import APIRouter
import os
import requests
from app.services.price_service import PriceService

router = APIRouter(prefix="/test", tags=["Testing"])

@router.get("/apis-status")
async def test_apis_status():
    """Test all API keys and services"""
    
    results = {}
    
    # 1. CoinGecko Pro
    coingecko_key = os.getenv("COINGECKO_API_KEY", "")
    if coingecko_key:
        try:
            headers = {"x-cg-pro-api-key": coingecko_key}
            r = requests.get("https://pro-api.coingecko.com/api/v3/ping", headers=headers, timeout=10)
            results["coingecko_pro"] = {
                "status": "✅ ACTIVE" if r.status_code == 200 else f"❌ ERROR {r.status_code}",
                "key_prefix": coingecko_key[:10] + "...",
                "response": r.json() if r.status_code == 200 else r.text[:100]
            }
        except Exception as e:
            results["coingecko_pro"] = {"status": f"❌ ERROR: {str(e)}"}
    else:
        results["coingecko_pro"] = {"status": "❌ NOT CONFIGURED"}
    
    # 2. Moralis
    moralis_key = os.getenv("MORALIS_API_KEY", "")
    results["moralis"] = {
        "status": "✅ CONFIGURED" if moralis_key else "❌ NOT CONFIGURED",
        "key_prefix": moralis_key[:10] + "..." if moralis_key else "N/A"
    }
    
    # 3. Helius (Solana)
    helius_key = os.getenv("HELIUS_API_KEY", "")
    results["helius"] = {
        "status": "✅ CONFIGURED" if helius_key else "❌ NOT CONFIGURED",
        "key_prefix": helius_key[:10] + "..." if helius_key else "N/A"
    }
    
    # 4. Test Price Service
    try:
        price_service = PriceService()
        eth_price = price_service.get_current_price("ETH")
        results["price_service"] = {
            "status": "✅ WORKING",
            "eth_price": f"${float(eth_price):.2f}" if eth_price else "N/A"
        }
    except Exception as e:
        results["price_service"] = {"status": f"❌ ERROR: {str(e)}"}
    
    return {
        "environment": os.getenv("ENVIRONMENT", "unknown"),
        "apis": results
    }
