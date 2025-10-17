#!/usr/bin/env python3
"""
Populate source_url for countries missing it
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.regulation import Regulation


# Countries with Koinly crypto tax guides
KOINLY_COUNTRIES = {
    'US': 'united-states', 'GB': 'united-kingdom', 'CA': 'canada',
    'AU': 'australia', 'DE': 'germany', 'FR': 'france', 'IT': 'italy',
    'ES': 'spain', 'NL': 'netherlands', 'BE': 'belgium', 'CH': 'switzerland',
    'AT': 'austria', 'SE': 'sweden', 'NO': 'norway', 'DK': 'denmark',
    'FI': 'finland', 'IE': 'ireland', 'PT': 'portugal', 'PL': 'poland',
    'CZ': 'czech-republic', 'GR': 'greece', 'IS': 'iceland',
    'JP': 'japan', 'SG': 'singapore', 'HK': 'hong-kong', 'IN': 'india',
    'NZ': 'new-zealand', 'ZA': 'south-africa', 'BR': 'brazil',
    'AR': 'argentina', 'MX': 'mexico', 'IL': 'israel', 'TR': 'turkey',
    'AE': 'united-arab-emirates', 'SA': 'saudi-arabia',
    'MY': 'malaysia', 'TH': 'thailand', 'PH': 'philippines',
    'ID': 'indonesia', 'VN': 'vietnam', 'KR': 'south-korea',
    'TW': 'taiwan', 'HR': 'croatia', 'BG': 'bulgaria', 'RO': 'romania',
    'LT': 'lithuania', 'LV': 'latvia', 'EE': 'estonia',
    'CY': 'cyprus', 'MT': 'malta', 'LU': 'luxembourg'
}

# PwC country codes
PWC_COUNTRIES = {
    'AL': 'albania', 'DZ': 'algeria', 'AO': 'angola', 'AR': 'argentina',
    'AM': 'armenia', 'AU': 'australia', 'AT': 'austria', 'AZ': 'azerbaijan',
    'BD': 'bangladesh', 'BE': 'belgium', 'BW': 'botswana', 'BR': 'brazil',
    'BG': 'bulgaria', 'CM': 'cameroon', 'CA': 'canada', 'TD': 'chad',
    'CN': 'china', 'CR': 'costa-rica', 'HR': 'croatia', 'CY': 'cyprus',
    'CZ': 'czech-republic', 'DK': 'denmark', 'EC': 'ecuador', 'EG': 'egypt',
    'SV': 'el-salvador', 'ET': 'ethiopia', 'FI': 'finland', 'FR': 'france',
    'GA': 'gabon', 'GE': 'georgia', 'DE': 'germany', 'GH': 'ghana',
    'GR': 'greece', 'GT': 'guatemala', 'GY': 'guyana', 'HN': 'honduras',
    'IS': 'iceland', 'IN': 'india', 'ID': 'indonesia', 'IE': 'ireland',
    'IL': 'israel', 'IT': 'italy', 'JM': 'jamaica', 'JP': 'japan',
    'KZ': 'kazakhstan', 'KE': 'kenya', 'LV': 'latvia', 'LB': 'lebanon',
    'LT': 'lithuania', 'MG': 'madagascar', 'MY': 'malaysia', 'MA': 'morocco',
    'MM': 'myanmar', 'NL': 'netherlands', 'NI': 'nicaragua', 'NG': 'nigeria',
    'NO': 'norway', 'PA': 'panama', 'PE': 'peru', 'PH': 'philippines',
    'PL': 'poland', 'PT': 'portugal', 'PR': 'puerto-rico', 'RW': 'rwanda',
    'SA': 'saudi-arabia', 'RS': 'serbia', 'SG': 'singapore', 'SK': 'slovakia',
    'SI': 'slovenia', 'ZA': 'south-africa', 'KR': 'korea-republic-of',
    'ES': 'spain', 'SE': 'sweden', 'CH': 'switzerland', 'TW': 'taiwan',
    'TZ': 'tanzania', 'TH': 'thailand', 'TR': 'turkey', 'UG': 'uganda',
    'AE': 'united-arab-emirates', 'GB': 'united-kingdom', 'US': 'united-states',
    'VN': 'vietnam'
}


def get_source_url(country_code: str) -> str:
    """
    Get appropriate source URL for country
    Priority: 1) Koinly (crypto-specific), 2) PwC Tax Summaries
    """
    code = country_code.upper()
    
    # Try Koinly first (crypto-specific)
    if code in KOINLY_COUNTRIES:
        return f"https://koinly.io/cryptocurrency-taxes/{KOINLY_COUNTRIES[code]}/"
    
    # Fallback to PwC
    if code in PWC_COUNTRIES:
        return f"https://taxsummaries.pwc.com/{PWC_COUNTRIES[code]}"
    
    # Fallback to Tax Foundation
    return "https://taxfoundation.org/data/all/global/capital-gains-tax-rates-by-country/"


def populate_sources():
    """Update all regulations without source_url"""
    db = SessionLocal()
    try:
        regulations = db.query(Regulation).filter(Regulation.source_url == None).all()

        updated = 0
        for reg in regulations:
            source_url = get_source_url(reg.country_code)
            reg.source_url = source_url
            updated += 1
            
            source_type = "Koinly" if reg.country_code in KOINLY_COUNTRIES else "PwC" if reg.country_code in PWC_COUNTRIES else "Tax Foundation"
            print(f"{reg.country_code} ({reg.country_name}) -> {source_type}")

        db.commit()
        print(f"\n✅ Updated {updated} countries with source URLs")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    populate_sources()
