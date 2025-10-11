"""
Seed regulations database with 10 MVP countries

Sources (2025 data):
- US: IRS.gov
- FR: impots.gouv.fr
- PT: AT (Autoridade Tributária)
- AE: UAE Federal Tax Authority
- AU: ATO.gov.au
- CA: CRA.gc.ca
- DE: Bundesministerium der Finanzen
- SG: IRAS Singapore
- GB: HMRC.gov.uk
- ES: Agencia Tributaria

Run: python scripts/seed-regulations.py
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.regulation import Regulation, RegulationHistory
from datetime import datetime, date

# Create tables
Base.metadata.create_all(bind=engine)

REGULATIONS_MVP = [
    {
        "country_code": "US",
        "country_name": "United States",
        "cgt_short_rate": 0.37,  # Max ordinary income rate
        "cgt_long_rate": 0.20,   # >1 year holding
        "staking_rate": 0.37,
        "mining_rate": 0.37,
        "nft_treatment": "collectible",
        "residency_rule": "Citizenship-based taxation worldwide",
        "treaty_countries": ["CA", "GB", "FR", "DE", "AU", "JP"],
        "defi_reporting": "Yes - IRS Form 1099-DA from 2025",
        "penalties_max": "Felony - $250k + 5 years prison",
        "notes": "FATCA applies. Exit tax for renunciation ($2,350 + tax on unrealized gains >$700k).",
        "source_url": "https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions"
    },
    {
        "country_code": "FR",
        "country_name": "France",
        "cgt_short_rate": 0.30,  # Flat tax (PFU)
        "cgt_long_rate": 0.30,
        "staking_rate": 0.30,
        "mining_rate": 0.30,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days or economic center",
        "treaty_countries": ["US", "GB", "DE", "ES", "IT", "BE"],
        "defi_reporting": "Yes - Annual crypto declaration mandatory",
        "penalties_max": "€10,000 + 5 years prison",
        "notes": "Flat tax 30% (12.8% income + 17.2% social). Exemption <€305 gains/year. Professional traders higher rates.",
        "source_url": "https://www.impots.gouv.fr/portail/particulier/questions/je-possede-des-bitcoins-comment-dois-je-les-declarer"
    },
    {
        "country_code": "PT",
        "country_name": "Portugal",
        "cgt_short_rate": 0.28,  # If professional activity
        "cgt_long_rate": 0.00,   # Personal investment EXEMPT!
        "staking_rate": 0.28,
        "mining_rate": 0.28,
        "nft_treatment": "exempt_if_personal",
        "residency_rule": "183 days or habitual residence",
        "treaty_countries": ["US", "FR", "GB", "ES", "BR"],
        "defi_reporting": "Minimal for personal use",
        "penalties_max": "€5,000 penalty",
        "notes": "NHR (Non-Habitual Resident) regime: 10 years 0% on foreign income. Personal crypto gains tax-free. Professional = 28%.",
        "source_url": "https://info.portaldasfinancas.gov.pt"
    },
    {
        "country_code": "AE",
        "country_name": "United Arab Emirates",
        "cgt_short_rate": 0.00,  # Zero tax
        "cgt_long_rate": 0.00,
        "staking_rate": 0.00,
        "mining_rate": 0.00,
        "nft_treatment": "zero_tax",
        "residency_rule": "183 days or residence visa",
        "treaty_countries": ["Limited"],
        "defi_reporting": "No reporting required",
        "penalties_max": "None specific to crypto",
        "notes": "Dubai/Abu Dhabi crypto-friendly. No income tax. Golden Visa available ($10k+). Substance required (residence, utilities).",
        "source_url": "https://u.ae/en/information-and-services/finance-and-investment/taxation"
    },
    {
        "country_code": "AU",
        "country_name": "Australia",
        "cgt_short_rate": 0.47,  # Max marginal rate
        "cgt_long_rate": 0.235,  # 50% discount after 12 months
        "staking_rate": 0.47,
        "mining_rate": 0.47,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days or domicile test",
        "treaty_countries": ["US", "GB", "NZ", "SG"],
        "defi_reporting": "Yes - ATO CGT schedule mandatory",
        "penalties_max": "AUD $210,000 + 10 years prison",
        "notes": "50% CGT discount for holdings >12 months. Progressive rates 19-47%. ATO actively monitors crypto.",
        "source_url": "https://www.ato.gov.au/general/gen/tax-treatment-of-crypto-currencies-in-australia---specifically-bitcoin/"
    },
    {
        "country_code": "CA",
        "country_name": "Canada",
        "cgt_short_rate": 0.2675,  # 50% inclusion × 53.5% rate
        "cgt_long_rate": 0.2675,   # Same (no holding period distinction)
        "staking_rate": 0.535,     # Business income
        "mining_rate": 0.535,
        "nft_treatment": "capital_gain",
        "residency_rule": "Significant residential ties",
        "treaty_countries": ["US", "GB", "FR", "AU"],
        "defi_reporting": "Yes - CRA T1 Schedule 3",
        "penalties_max": "CAD $100,000 + 5 years",
        "notes": "50% capital gains inclusion rate. Day traders = business income (full tax). No distinction short/long term.",
        "source_url": "https://www.canada.ca/en/revenue-agency/programs/about-canada-revenue-agency-cra/compliance/digital-currency.html"
    },
    {
        "country_code": "DE",
        "country_name": "Germany",
        "cgt_short_rate": 0.45,  # If <1 year holding
        "cgt_long_rate": 0.00,   # EXEMPT after 1 year!
        "staking_rate": 0.45,    # 10-year holding for exempt
        "mining_rate": 0.45,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days or habitual abode",
        "treaty_countries": ["US", "FR", "GB"],
        "defi_reporting": "Yes - Tax declaration required",
        "penalties_max": "€50,000 + 5 years",
        "notes": "1-year holding = tax-free! Staking/lending rewards need 10 years for exempt. €600 annual exemption.",
        "source_url": "https://www.bundesfinanzministerium.de"
    },
    {
        "country_code": "SG",
        "country_name": "Singapore",
        "cgt_short_rate": 0.00,  # No capital gains tax
        "cgt_long_rate": 0.00,
        "staking_rate": 0.22,    # If business income
        "mining_rate": 0.22,
        "nft_treatment": "zero_cgt",
        "residency_rule": "183 days or employment/business",
        "treaty_countries": ["Over 100 treaties"],
        "defi_reporting": "Minimal unless business activity",
        "penalties_max": "SGD $10,000 penalty",
        "notes": "No CGT for personal investment. Business income taxed 17-22%. Very crypto-friendly jurisdiction.",
        "source_url": "https://www.iras.gov.sg/taxes/individual-income-tax"
    },
    {
        "country_code": "GB",
        "country_name": "United Kingdom",
        "cgt_short_rate": 0.20,  # Higher rate
        "cgt_long_rate": 0.20,
        "staking_rate": 0.45,    # Income tax top rate
        "mining_rate": 0.45,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days or only home in UK",
        "treaty_countries": ["US", "EU countries"],
        "defi_reporting": "Yes - Self Assessment mandatory",
        "penalties_max": "£10,000 + 7 years prison",
        "notes": "£3,000 annual CGT allowance (2025/26). 10% lower rate up to £50k income. 20% higher rate above.",
        "source_url": "https://www.gov.uk/government/publications/tax-on-cryptoassets"
    },
    {
        "country_code": "ES",
        "country_name": "Spain",
        "cgt_short_rate": 0.26,  # Savings income progressive
        "cgt_long_rate": 0.26,
        "staking_rate": 0.47,    # General income
        "mining_rate": 0.47,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days",
        "treaty_countries": ["US", "FR", "PT"],
        "defi_reporting": "Yes - Modelo 720 for foreign assets >€50k",
        "penalties_max": "€150,000 penalty (Modelo 720 non-compliance)",
        "notes": "Progressive rates 19-26% on savings/capital gains. Modelo 720 strict reporting (severe penalties).",
        "source_url": "https://sede.agenciatributaria.gob.es"
    }
]


def seed_regulations():
    """Seed regulations table with MVP countries"""
    db = SessionLocal()

    try:
        print("🌱 Seeding regulations database...")

        for reg_data in REGULATIONS_MVP:
            # Check if exists
            existing = db.query(Regulation).filter_by(
                country_code=reg_data["country_code"]
            ).first()

            if existing:
                print(f"⚠️  {reg_data['country_code']} already exists, skipping")
                continue

            # Create regulation
            regulation = Regulation(**reg_data)
            db.add(regulation)

            # Also create historical snapshot
            history = RegulationHistory(
                country_code=reg_data["country_code"],
                cgt_short_rate=reg_data["cgt_short_rate"],
                cgt_long_rate=reg_data["cgt_long_rate"],
                staking_rate=reg_data["staking_rate"],
                mining_rate=reg_data["mining_rate"],
                nft_treatment=reg_data["nft_treatment"],
                residency_rule=reg_data["residency_rule"],
                treaty_countries=reg_data["treaty_countries"],
                defi_reporting=reg_data["defi_reporting"],
                penalties_max=reg_data["penalties_max"],
                notes=reg_data["notes"],
                valid_from=date.today(),
                valid_to=None,  # Current version
                source_url=reg_data["source_url"]
            )
            db.add(history)

            print(f"✅ Added {reg_data['country_code']} - {reg_data['country_name']}")

        db.commit()
        print(f"\n🎉 Successfully seeded {len(REGULATIONS_MVP)} countries!")
        print("\nCountries available:")
        for reg in REGULATIONS_MVP:
            print(f"  • {reg['country_code']} - {reg['country_name']}")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_regulations()
