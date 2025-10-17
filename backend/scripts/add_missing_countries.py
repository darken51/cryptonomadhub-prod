#!/usr/bin/env python3
"""
Add the 3 missing countries from GLI list: Guernsey, Macau, Malawi
"""

from app.database import SessionLocal
from app.models.regulation import Regulation
from datetime import datetime

COUNTRIES_TO_ADD = [
    {
        'country_code': 'GG',
        'country_name': 'Guernsey',
        'flag_emoji': '🇬🇬',
        'cgt_short_rate': 0.0,
        'cgt_long_rate': 0.0,
        'crypto_short_rate': 0.0,
        'crypto_long_rate': 0.0,
        'crypto_notes': '0% capital gains tax on crypto. No CGT in Guernsey. Income tax at 20% flat rate does not apply to capital gains. Tax haven for crypto investors.',
        'notes': 'Guernsey: No capital gains tax on any assets including crypto. Flat 20% income tax only applies to income, not capital gains. Updated 2025-10-17.',
        'source_url': 'https://www.careyolsen.com/insights/briefings/summary-certain-key-aspects-guernsey-taxation-law',
        'data_quality': 'high',
        'data_sources': ['Carey Olsen Law', 'Freeman Law'],
        'crypto_legal_status': 'legal'
    },
    {
        'country_code': 'MO',
        'country_name': 'Macau',
        'flag_emoji': '🇲🇴',
        'cgt_short_rate': 0.12,
        'cgt_long_rate': 0.12,
        'crypto_short_rate': 0.12,
        'crypto_long_rate': 0.12,
        'crypto_notes': '12% profits tax on crypto gains. No specific CGT - falls under complementary tax. Progressive rates up to 12% max.',
        'notes': 'Macau: 12% profits tax (complementary tax) on crypto gains. No specific capital gains tax. Crypto treatment unclear, falls under general profits tax. Updated 2025-10-17.',
        'source_url': 'https://taxsummaries.pwc.com/macau-sar',
        'data_quality': 'medium',
        'data_sources': ['PwC Tax Summaries', 'MdME Law'],
        'crypto_legal_status': 'unclear'
    },
    {
        'country_code': 'MW',
        'country_name': 'Malawi',
        'flag_emoji': '🇲🇼',
        'cgt_short_rate': 0.20,
        'cgt_long_rate': 0.20,
        'crypto_short_rate': None,
        'crypto_long_rate': None,
        'crypto_notes': 'Crypto not recognized as legal tender. No clear tax rate. Estimated 20% based on general income tax. RBM warns against crypto trading.',
        'notes': 'Malawi: Crypto taxation unclear. Not legal tender. Investors expected to pay taxes but no specific rate defined. Estimated 20% based on general tax rates. Updated 2025-10-17.',
        'source_url': 'https://www.faceofmalawi.com/2022/12/28/complete-details-about-cryptocurrency-regulations/',
        'data_quality': 'low',
        'data_sources': ['Face of Malawi', 'Reserve Bank of Malawi'],
        'crypto_legal_status': 'unclear'
    }
]


def main():
    print("➕ ADDING MISSING COUNTRIES TO DATABASE")
    print("=" * 80)

    db = SessionLocal()
    added_count = 0
    skipped_count = 0

    try:
        for country_data in COUNTRIES_TO_ADD:
            code = country_data['country_code']
            name = country_data['country_name']

            # Check if country already exists
            existing = db.query(Regulation).filter(Regulation.country_code == code).first()

            if existing:
                print(f"\n⚠️  {code} ({name}) already exists - SKIPPING")
                skipped_count += 1
                continue

            print(f"\n✅ Adding {code} ({name})")
            print(f"   CGT: {country_data['cgt_short_rate']*100:.1f}% / {country_data['cgt_long_rate']*100:.1f}%")
            if country_data['crypto_short_rate'] is not None:
                print(f"   Crypto: {country_data['crypto_short_rate']*100:.1f}% / {country_data['crypto_long_rate']*100:.1f}%")
            else:
                print(f"   Crypto: No specific rate")
            print(f"   Quality: {country_data['data_quality']}")

            # Create new regulation entry
            new_country = Regulation(**country_data)
            db.add(new_country)
            db.commit()

            added_count += 1
            print(f"   ✓ Successfully added!")

        print("\n" + "=" * 80)
        print("📊 SUMMARY")
        print("=" * 80)
        print(f"  ✅ Countries added: {added_count}")
        print(f"  ⏭️  Countries skipped: {skipped_count}")
        print(f"  📝 Total processed: {len(COUNTRIES_TO_ADD)}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
