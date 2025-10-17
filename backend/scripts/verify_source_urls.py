"""
Verify all source_url entries in regulations table
Checks for 404s, timeouts, redirects, and SSL errors

Usage: python scripts/verify_source_urls.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from urllib.parse import urlparse
from app.database import SessionLocal
from app.models.regulation import Regulation
import time
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# Configure requests with retries
session = requests.Session()
retry = Retry(
    total=2,
    read=2,
    connect=2,
    backoff_factor=0.3,
    status_forcelist=(500, 502, 504)
)
adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)
session.mount('https://', adapter)

TIMEOUT = 10  # seconds

def check_url(url: str, country_code: str, country_name: str) -> dict:
    """Check if URL is accessible"""
    result = {
        'country_code': country_code,
        'country_name': country_name,
        'url': url,
        'status': 'unknown',
        'status_code': None,
        'error': None,
        'redirect_url': None
    }

    if not url or url.strip() == '':
        result['status'] = 'empty'
        return result

    try:
        # Add headers to mimic browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        response = session.head(url, timeout=TIMEOUT, headers=headers, allow_redirects=True)

        # If HEAD fails, try GET
        if response.status_code >= 400:
            response = session.get(url, timeout=TIMEOUT, headers=headers, allow_redirects=True)

        result['status_code'] = response.status_code

        if response.status_code == 200:
            result['status'] = 'ok'
        elif response.status_code == 404:
            result['status'] = '404'
        elif response.status_code == 403:
            result['status'] = 'forbidden'
        elif response.status_code >= 500:
            result['status'] = 'server_error'
        else:
            result['status'] = f'http_{response.status_code}'

        # Check for redirects
        if response.history:
            result['redirect_url'] = response.url
            if urlparse(url).netloc != urlparse(response.url).netloc:
                result['status'] = 'redirect_different_domain'

    except requests.exceptions.SSLError as e:
        result['status'] = 'ssl_error'
        result['error'] = str(e)[:100]
    except requests.exceptions.Timeout:
        result['status'] = 'timeout'
        result['error'] = 'Request timed out'
    except requests.exceptions.ConnectionError as e:
        result['status'] = 'connection_error'
        result['error'] = str(e)[:100]
    except requests.exceptions.TooManyRedirects:
        result['status'] = 'too_many_redirects'
        result['error'] = 'Too many redirects'
    except Exception as e:
        result['status'] = 'error'
        result['error'] = str(e)[:100]

    return result


def main():
    db = SessionLocal()

    try:
        print("🔍 VERIFYING SOURCE URLs FOR ALL COUNTRIES")
        print("=" * 80)
        print()

        # Get all regulations with source_url
        regulations = db.query(Regulation).all()
        total = len(regulations)

        results = {
            'ok': [],
            '404': [],
            'timeout': [],
            'ssl_error': [],
            'connection_error': [],
            'forbidden': [],
            'server_error': [],
            'redirect_different_domain': [],
            'empty': [],
            'error': []
        }

        print(f"Checking {total} countries...\n")

        for i, reg in enumerate(regulations, 1):
            if not reg.source_url:
                results['empty'].append({
                    'country_code': reg.country_code,
                    'country_name': reg.country_name,
                    'url': None
                })
                print(f"[{i}/{total}] {reg.country_code:3} {reg.country_name:30} ⚪ NO URL")
                continue

            print(f"[{i}/{total}] {reg.country_code:3} {reg.country_name:30} ", end='', flush=True)

            result = check_url(reg.source_url, reg.country_code, reg.country_name)
            status = result['status']

            # Add to appropriate category
            if status in results:
                results[status].append(result)
            else:
                results['error'].append(result)

            # Print status
            if status == 'ok':
                print("✅ OK")
            elif status == '404':
                print("❌ 404 NOT FOUND")
            elif status == 'timeout':
                print("⏱️  TIMEOUT")
            elif status == 'ssl_error':
                print("🔒 SSL ERROR")
            elif status == 'connection_error':
                print("🔌 CONNECTION ERROR")
            elif status == 'forbidden':
                print("🚫 403 FORBIDDEN")
            elif status == 'server_error':
                print("⚠️  SERVER ERROR")
            elif status == 'redirect_different_domain':
                print(f"🔄 REDIRECT to {urlparse(result['redirect_url']).netloc}")
            else:
                print(f"❓ {status.upper()}")

            # Rate limiting
            time.sleep(0.3)

        print()
        print("=" * 80)
        print("📊 SUMMARY REPORT")
        print("=" * 80)
        print()

        print(f"✅ Working URLs:                {len(results['ok'])} ({len(results['ok'])/total*100:.1f}%)")
        print(f"❌ 404 Not Found:               {len(results['404'])}")
        print(f"⏱️  Timeout:                     {len(results['timeout'])}")
        print(f"🔒 SSL Errors:                  {len(results['ssl_error'])}")
        print(f"🔌 Connection Errors:           {len(results['connection_error'])}")
        print(f"🚫 Forbidden (403):             {len(results['forbidden'])}")
        print(f"⚠️  Server Errors (5xx):        {len(results['server_error'])}")
        print(f"🔄 Redirects (different domain): {len(results['redirect_different_domain'])}")
        print(f"⚪ No URL:                      {len(results['empty'])}")
        print(f"❓ Other Errors:                {len(results['error'])}")
        print()

        # Detailed problematic URLs
        problematic = []
        for category in ['404', 'timeout', 'ssl_error', 'connection_error', 'server_error']:
            problematic.extend(results[category])

        if problematic:
            print()
            print("=" * 80)
            print("🚨 PROBLEMATIC URLs REQUIRING ATTENTION")
            print("=" * 80)
            print()

            for result in problematic:
                print(f"{result['country_code']:3} | {result['country_name']:30} | {result['status']:20}")
                print(f"     URL: {result['url']}")
                if result['error']:
                    print(f"     Error: {result['error']}")
                print()

        # Countries with no URL
        if results['empty']:
            print()
            print("=" * 80)
            print("⚪ COUNTRIES WITH NO SOURCE URL")
            print("=" * 80)
            print()
            for result in results['empty']:
                print(f"  • {result['country_code']} - {result['country_name']}")

        # Redirects to different domains
        if results['redirect_different_domain']:
            print()
            print("=" * 80)
            print("🔄 URLS REDIRECTING TO DIFFERENT DOMAINS")
            print("=" * 80)
            print()
            for result in results['redirect_different_domain']:
                print(f"{result['country_code']:3} | {result['country_name']:30}")
                print(f"     Original: {result['url']}")
                print(f"     Redirects to: {result['redirect_url']}")
                print()

        print()
        print("=" * 80)
        print("✅ URL verification complete!")
        print("=" * 80)

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
