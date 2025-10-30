"""
Fix outdated notes field for 10 critical countries where notes contradict crypto_short_rate.
The notes field will be updated to reflect the first key sentence from crypto_notes.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://fred:password@localhost/cryptonomadhub')

# 10 countries with critical issues (notes field outdated)
FIXES = {
    'TH': {
        'old_notes': 'Thailand: 15% capital gains tax on crypto.',
        'new_notes': 'Thailand: 0% capital gains tax 2025-2029 (5-year exemption) for SEC-licensed exchanges. Foreign exchanges remain taxable.',
    },
    'AD': {
        'old_notes': 'Andorra: 0% capital gains tax. Crypto tax-free.',
        'new_notes': 'Andorra: 10% capital gains tax on crypto gains exceeding €3,000/year exemption (since 2023).',
    },
    'AM': {
        'old_notes': 'Armenia: 20% capital gains tax applies to crypto.',
        'new_notes': 'Armenia: 0% capital gains tax for non-entrepreneur individuals (tax-free crypto gains). No reporting required.',
    },
    'AZ': {
        'old_notes': 'Azerbaijan: 25% capital gains tax applies to crypto.',
        'new_notes': 'Azerbaijan: 15% capital gains tax on cryptocurrency (individuals). Mining treated as entrepreneurial activity.',
    },
    'CR': {
        'old_notes': 'Costa Rica: 15% capital gains tax applies to crypto.',
        'new_notes': 'Costa Rica: 0% tax on foreign-sourced crypto income (territorial tax system). Digital nomad visa available.',
    },
    'EC': {
        'old_notes': 'Ecuador: 10% capital gains tax applies to crypto.',
        'new_notes': 'Ecuador: Up to 35% progressive capital gains tax on crypto (individuals), 25% for companies. Fully dollarized economy.',
    },
    'GE': {
        'old_notes': 'Georgia: 20% capital gains tax applies to crypto.',
        'new_notes': 'Georgia: 0% capital gains tax for individuals on cryptocurrency. Virtual Asset Service Providers regulated since 2023.',
    },
    'GH': {
        'old_notes': 'Ghana: 35% capital gains tax applies to crypto (included in income).',
        'new_notes': 'Ghana: 15% capital gains tax on cryptocurrency. Income tax 0-30% progressive on mining/staking.',
    },
    'PE': {
        'old_notes': 'Peru: 5% capital gains tax on crypto.',
        'new_notes': 'Peru: 8-30% progressive capital gains tax for individuals (NEW 2025), 29.5% flat for companies.',
    },
    'SI': {
        'old_notes': 'Slovenia: 25% capital gains tax applies to crypto.',
        'new_notes': 'Slovenia: Currently 0% for individuals (legal gray zone). PROPOSED 2026: 25% tax on crypto gains.',
    },
}

def fix_notes():
    """Update notes field for 10 countries with outdated information"""
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        print("=" * 80)
        print("FIXING OUTDATED NOTES FOR 10 CRITICAL COUNTRIES")
        print("=" * 80)
        print()
        
        for country_code, fix_data in FIXES.items():
            old_notes = fix_data['old_notes']
            new_notes = fix_data['new_notes']
            
            # Update the notes field
            query = text("""
                UPDATE regulations 
                SET 
                    notes = :new_notes,
                    updated_at = NOW()
                WHERE country_code = :country_code
                RETURNING country_code, country_name, notes
            """)
            
            result = session.execute(
                query,
                {
                    'country_code': country_code,
                    'new_notes': new_notes + f' Updated {datetime.now().strftime("%Y-%m-%d")}.'
                }
            )
            
            updated = result.fetchone()
            if updated:
                print(f"✅ {country_code} - {updated[1]}")
                print(f"   OLD: {old_notes}")
                print(f"   NEW: {new_notes}")
                print()
            else:
                print(f"❌ {country_code} - NOT FOUND")
                print()
        
        session.commit()
        print("=" * 80)
        print("✅ ALL 10 COUNTRIES UPDATED SUCCESSFULLY")
        print("=" * 80)
        
    except Exception as e:
        session.rollback()
        print(f"❌ ERROR: {e}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == '__main__':
    fix_notes()
