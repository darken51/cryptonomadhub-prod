"""
Seed additional countries for NomadCrypto Hub
Total: 30+ new countries (40+ total)

Categories:
- Asia: Malaysia, Thailand, Indonesia, Philippines, Hong Kong, Taiwan, Japan, South Korea, Vietnam
- Tax Havens: Mauritius, Seychelles, Switzerland, Andorra, Luxembourg, Monaco, Liechtenstein
- South America: Brazil, Argentina, Chile, Colombia, Uruguay, Panama
- Middle East & Africa: Bahrain, Qatar, Oman, South Africa
- Europe: Italy, Netherlands, Sweden, Norway, Denmark, Belgium, Ireland, Czech Republic

Run: python scripts/seed-additional-countries.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.regulation import Regulation, RegulationHistory
from datetime import date

# Create tables
Base.metadata.create_all(bind=engine)

ADDITIONAL_COUNTRIES = [
    # === ASIA ===
    {
        "country_code": "MY",
        "country_name": "Malaysia",
        "cgt_short_rate": 0.00,  # No CGT for individuals
        "cgt_long_rate": 0.00,
        "staking_rate": 0.28,  # If business income
        "mining_rate": 0.28,
        "nft_treatment": "zero_cgt_personal",
        "residency_rule": "183 days or employment in Malaysia",
        "treaty_countries": ["SG", "TH", "ID", "AU", "GB"],
        "defi_reporting": "Minimal - no specific regulations",
        "penalties_max": "RM 200,000 penalty",
        "notes": "Zero CGT for personal investment. Very crypto-friendly. MM2H visa program available. Business income 24-28%.",
        "source_url": "https://www.hasil.gov.my"
    },
    {
        "country_code": "TH",
        "country_name": "Thailand",
        "cgt_short_rate": 0.15,  # Withholding tax
        "cgt_long_rate": 0.15,
        "staking_rate": 0.35,  # Progressive tax
        "mining_rate": 0.35,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days in tax year",
        "treaty_countries": ["MY", "SG", "US", "GB"],
        "defi_reporting": "Yes - tax return required",
        "penalties_max": "THB 200,000 + 5 years prison",
        "notes": "15% withholding tax on crypto gains. Progressive rates 0-35%. Digital Nomad Visa available.",
        "source_url": "https://www.rd.go.th"
    },
    {
        "country_code": "ID",
        "country_name": "Indonesia",
        "cgt_short_rate": 0.025,  # 0.1% transaction + 2.4% gain
        "cgt_long_rate": 0.025,
        "staking_rate": 0.35,
        "mining_rate": 0.35,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days",
        "treaty_countries": ["MY", "SG", "AU"],
        "defi_reporting": "Yes - new regulations 2024",
        "penalties_max": "IDR 1B penalty",
        "notes": "0.1% transaction tax + 2.4% on gains = 2.5% effective. New crypto regulations 2024. VAT exempt.",
        "source_url": "https://www.pajak.go.id"
    },
    {
        "country_code": "PH",
        "country_name": "Philippines",
        "cgt_short_rate": 0.35,  # Income tax
        "cgt_long_rate": 0.35,
        "staking_rate": 0.35,
        "mining_rate": 0.35,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days",
        "treaty_countries": ["US", "SG", "AU"],
        "defi_reporting": "Yes - BIR reporting required",
        "penalties_max": "PHP 500,000 penalty",
        "notes": "High tax 35% on crypto. Treated as ordinary income. Capital gains tax option 15% for some assets.",
        "source_url": "https://www.bir.gov.ph"
    },
    {
        "country_code": "HK",
        "country_name": "Hong Kong",
        "cgt_short_rate": 0.00,  # No CGT
        "cgt_long_rate": 0.00,
        "staking_rate": 0.165,  # If business income (profits tax)
        "mining_rate": 0.165,
        "nft_treatment": "zero_cgt",
        "residency_rule": "Ordinarily resident or 180+ days",
        "treaty_countries": ["Over 40 treaties"],
        "defi_reporting": "Minimal for personal investment",
        "penalties_max": "HKD 50,000 penalty",
        "notes": "No CGT for personal investment! Business profits 16.5%. Very crypto-friendly regulatory environment.",
        "source_url": "https://www.ird.gov.hk"
    },
    {
        "country_code": "TW",
        "country_name": "Taiwan",
        "cgt_short_rate": 0.20,  # Separated income tax
        "cgt_long_rate": 0.20,
        "staking_rate": 0.40,  # Progressive income
        "mining_rate": 0.40,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days",
        "treaty_countries": ["Limited"],
        "defi_reporting": "Yes - NTA reporting",
        "penalties_max": "TWD 150,000 penalty",
        "notes": "20% separated tax or progressive 5-40%. Crypto businesses regulated. Gold Card visa for professionals.",
        "source_url": "https://www.ntbt.gov.tw"
    },
    {
        "country_code": "JP",
        "country_name": "Japan",
        "cgt_short_rate": 0.55,  # Max progressive rate
        "cgt_long_rate": 0.55,
        "staking_rate": 0.55,
        "mining_rate": 0.55,
        "nft_treatment": "miscellaneous_income",
        "residency_rule": "Tax resident if >1 year or domicile",
        "treaty_countries": ["US", "GB", "AU", "SG"],
        "defi_reporting": "Yes - strict NTA reporting",
        "penalties_max": "¥10M + 10 years prison",
        "notes": "Very high tax! Progressive 5-55%. Crypto = miscellaneous income, not capital gains. Strict enforcement.",
        "source_url": "https://www.nta.go.jp"
    },
    {
        "country_code": "KR",
        "country_name": "South Korea",
        "cgt_short_rate": 0.22,  # 22% crypto-specific tax (from 2025)
        "cgt_long_rate": 0.22,
        "staking_rate": 0.45,
        "mining_rate": 0.45,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days or domicile",
        "treaty_countries": ["US", "JP", "CN"],
        "defi_reporting": "Yes - NTS reporting mandatory",
        "penalties_max": "KRW 30M penalty",
        "notes": "22% crypto tax from 2025 (delayed). ₩2.5M annual exemption. Strict KYC via exchanges.",
        "source_url": "https://www.nts.go.kr"
    },
    {
        "country_code": "VN",
        "country_name": "Vietnam",
        "cgt_short_rate": 0.20,  # Capital gains tax
        "cgt_long_rate": 0.20,
        "staking_rate": 0.35,
        "mining_rate": 0.35,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days",
        "treaty_countries": ["SG", "TH", "MY"],
        "defi_reporting": "Limited - regulations developing",
        "penalties_max": "VND 200M penalty",
        "notes": "20% CGT. Crypto legal but not encouraged. Banking restrictions. Digital Nomad scene growing.",
        "source_url": "https://www.gdt.gov.vn"
    },

    # === TAX HAVENS ===
    {
        "country_code": "MU",
        "country_name": "Mauritius",
        "cgt_short_rate": 0.00,  # No CGT
        "cgt_long_rate": 0.00,
        "staking_rate": 0.00,
        "mining_rate": 0.15,  # If business
        "nft_treatment": "zero_tax",
        "residency_rule": "183 days or premium visa",
        "treaty_countries": ["Over 45 treaties"],
        "defi_reporting": "Minimal",
        "penalties_max": "MUR 500,000 penalty",
        "notes": "ZERO tax on crypto! IBC-friendly. Premium Visa available. Strong treaty network. Banking excellent.",
        "source_url": "https://www.mra.mu"
    },
    {
        "country_code": "SC",
        "country_name": "Seychelles",
        "cgt_short_rate": 0.00,
        "cgt_long_rate": 0.00,
        "staking_rate": 0.00,
        "mining_rate": 0.00,
        "nft_treatment": "zero_tax",
        "residency_rule": "Special permit (investment)",
        "treaty_countries": ["Limited but growing"],
        "defi_reporting": "None",
        "penalties_max": "None specific",
        "notes": "ZERO tax jurisdiction! IBC paradise. Popular for crypto companies. Residence by investment $100k+.",
        "source_url": "https://www.src.gov.sc"
    },
    {
        "country_code": "CH",
        "country_name": "Switzerland",
        "cgt_short_rate": 0.00,  # Wealth tax instead
        "cgt_long_rate": 0.00,
        "staking_rate": 0.40,  # If professional trader
        "mining_rate": 0.40,
        "nft_treatment": "wealth_tax",
        "residency_rule": "183 days",
        "treaty_countries": ["Extensive network"],
        "defi_reporting": "Yes - wealth declaration required",
        "penalties_max": "CHF 100,000 penalty",
        "notes": "No CGT for private wealth! Wealth tax 0.3-1% on holdings. Crypto Valley (Zug). Professional traders taxed.",
        "source_url": "https://www.estv.admin.ch"
    },
    {
        "country_code": "AD",
        "country_name": "Andorra",
        "cgt_short_rate": 0.00,  # No CGT
        "cgt_long_rate": 0.00,
        "staking_rate": 0.10,  # Max income tax
        "mining_rate": 0.10,
        "nft_treatment": "zero_cgt",
        "residency_rule": "Passive residence (investment €600k)",
        "treaty_countries": ["ES", "FR", "PT"],
        "defi_reporting": "Minimal",
        "penalties_max": "€50,000 penalty",
        "notes": "Zero CGT! 10% max income tax. Passive residence €600k investment. Between France/Spain.",
        "source_url": "https://www.impostos.ad"
    },
    {
        "country_code": "LU",
        "country_name": "Luxembourg",
        "cgt_short_rate": 0.425,  # <6 months speculation tax
        "cgt_long_rate": 0.00,   # >6 months exempt!
        "staking_rate": 0.42,
        "mining_rate": 0.42,
        "nft_treatment": "capital_gain",
        "residency_rule": "Domicile or 6 months+",
        "treaty_countries": ["Extensive EU network"],
        "defi_reporting": "Yes - tax return required",
        "penalties_max": "€25,000 penalty",
        "notes": "0% CGT if held >6 months! Holding period key. Banking hub. High living costs.",
        "source_url": "https://impotsdirects.public.lu"
    },
    {
        "country_code": "MC",
        "country_name": "Monaco",
        "cgt_short_rate": 0.00,
        "cgt_long_rate": 0.00,
        "staking_rate": 0.00,
        "mining_rate": 0.00,
        "nft_treatment": "zero_tax",
        "residency_rule": "Residence permit (€500k deposit)",
        "treaty_countries": ["FR (special regime)"],
        "defi_reporting": "None for residents",
        "penalties_max": "None",
        "notes": "ZERO income tax! Except French nationals. Residence €500k+ proof of means. Ultra high cost of living.",
        "source_url": "https://en.gouv.mc"
    },
    {
        "country_code": "LI",
        "country_name": "Liechtenstein",
        "cgt_short_rate": 0.00,
        "cgt_long_rate": 0.00,
        "staking_rate": 0.125,  # Max income tax
        "mining_rate": 0.125,
        "nft_treatment": "zero_cgt",
        "residency_rule": "Quota system (50/year)",
        "treaty_countries": ["CH, AT"],
        "defi_reporting": "Wealth declaration",
        "penalties_max": "CHF 50,000",
        "notes": "Zero CGT! 12.5% max income. Residence quota very limited (50/year). Wealth tax model.",
        "source_url": "https://www.steuerverwaltung.li"
    },

    # === SOUTH AMERICA ===
    {
        "country_code": "BR",
        "country_name": "Brazil",
        "cgt_short_rate": 0.15,  # <R$35k exempt
        "cgt_long_rate": 0.15,
        "staking_rate": 0.275,  # Progressive
        "mining_rate": 0.275,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days",
        "treaty_countries": ["AR", "CL", "UY"],
        "defi_reporting": "Yes - RFB reporting mandatory",
        "penalties_max": "R$ 500,000 + prison",
        "notes": "15% CGT. Monthly sales <R$35k exempt. Must report all holdings. Strict enforcement from 2024.",
        "source_url": "https://www.gov.br/receitafederal"
    },
    {
        "country_code": "AR",
        "country_name": "Argentina",
        "cgt_short_rate": 0.15,
        "cgt_long_rate": 0.15,
        "staking_rate": 0.35,
        "mining_rate": 0.35,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days",
        "treaty_countries": ["BR", "CL", "UY"],
        "defi_reporting": "Yes - AFIP reporting",
        "penalties_max": "ARS 10M penalty",
        "notes": "15% CGT. High inflation complicates calculations. Crypto adoption high due to peso instability.",
        "source_url": "https://www.afip.gob.ar"
    },
    {
        "country_code": "CL",
        "country_name": "Chile",
        "cgt_short_rate": 0.40,  # If habitual trading
        "cgt_long_rate": 0.00,   # If occasional
        "staking_rate": 0.40,
        "mining_rate": 0.40,
        "nft_treatment": "depends_frequency",
        "residency_rule": "183 days or economic ties",
        "treaty_countries": ["BR", "AR", "UY", "US"],
        "defi_reporting": "Yes - SII reporting",
        "penalties_max": "CLP 50M penalty",
        "notes": "0% if occasional investor! 40% if habitual trader. Distinction critical. Digital Nomad Visa available.",
        "source_url": "https://www.sii.cl"
    },
    {
        "country_code": "CO",
        "country_name": "Colombia",
        "cgt_short_rate": 0.39,  # Progressive
        "cgt_long_rate": 0.39,
        "staking_rate": 0.39,
        "mining_rate": 0.39,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days",
        "treaty_countries": ["CH, ES, CA"],
        "defi_reporting": "Yes - DIAN reporting",
        "penalties_max": "COP 200M penalty",
        "notes": "39% max tax. Progressive rates. Digital Nomad Visa popular. Medellín crypto-friendly scene.",
        "source_url": "https://www.dian.gov.co"
    },
    {
        "country_code": "UY",
        "country_name": "Uruguay",
        "cgt_short_rate": 0.12,  # IRNR on foreign income
        "cgt_long_rate": 0.00,   # If Uruguayan source exempt
        "staking_rate": 0.25,
        "mining_rate": 0.25,
        "nft_treatment": "depends_source",
        "residency_rule": "183 days",
        "treaty_countries": ["AR, BR, CH, DE"],
        "defi_reporting": "Yes - DGI reporting",
        "penalties_max": "UYU 500,000 penalty",
        "notes": "Territorial tax! Foreign crypto gains exempt. Uruguayan-source 12%. Tax residency certificate process.",
        "source_url": "https://www.dgi.gub.uy"
    },
    {
        "country_code": "PA",
        "country_name": "Panama",
        "cgt_short_rate": 0.00,  # Territorial tax
        "cgt_long_rate": 0.00,
        "staking_rate": 0.00,   # If foreign source
        "mining_rate": 0.25,    # If Panama-source
        "nft_treatment": "territorial",
        "residency_rule": "Friendly Nations Visa",
        "treaty_countries": ["Limited"],
        "defi_reporting": "Minimal for foreign income",
        "penalties_max": "USD 5,000",
        "notes": "Territorial tax! Foreign crypto gains tax-free. Friendly Nations Visa easy. Banking hub. USD currency.",
        "source_url": "https://www.dgi.gob.pa"
    },

    # === MIDDLE EAST & AFRICA ===
    {
        "country_code": "BH",
        "country_name": "Bahrain",
        "cgt_short_rate": 0.00,
        "cgt_long_rate": 0.00,
        "staking_rate": 0.00,
        "mining_rate": 0.00,
        "nft_treatment": "zero_tax",
        "residency_rule": "Work permit or investment",
        "treaty_countries": ["Growing network"],
        "defi_reporting": "None",
        "penalties_max": "None specific",
        "notes": "ZERO tax! Crypto-friendly regulations. Fintech hub. Lower cost than UAE. Self-sponsorship visa available.",
        "source_url": "https://www.nbr.gov.bh"
    },
    {
        "country_code": "QA",
        "country_name": "Qatar",
        "cgt_short_rate": 0.00,
        "cgt_long_rate": 0.00,
        "staking_rate": 0.00,
        "mining_rate": 0.00,
        "nft_treatment": "zero_tax",
        "residency_rule": "Employment or investment",
        "treaty_countries": ["Extensive"],
        "defi_reporting": "None",
        "penalties_max": "None",
        "notes": "ZERO tax! Wealthy nation. Residence via employment. High cost of living. Limited crypto adoption.",
        "source_url": "https://portal.www.gov.qa"
    },
    {
        "country_code": "OM",
        "country_name": "Oman",
        "cgt_short_rate": 0.00,
        "cgt_long_rate": 0.00,
        "staking_rate": 0.00,
        "mining_rate": 0.15,  # If business
        "nft_treatment": "zero_tax",
        "residency_rule": "Employment or business",
        "treaty_countries": ["GCC countries"],
        "defi_reporting": "Minimal",
        "penalties_max": "OMR 10,000",
        "notes": "Zero personal income tax! Developing crypto regulations. Investment visa available. Stable Gulf nation.",
        "source_url": "https://tms.taxoman.gov.om"
    },
    {
        "country_code": "ZA",
        "country_name": "South Africa",
        "cgt_short_rate": 0.18,  # Effective (40% inclusion)
        "cgt_long_rate": 0.18,
        "staking_rate": 0.45,
        "mining_rate": 0.45,
        "nft_treatment": "capital_gain",
        "residency_rule": "Ordinarily resident test",
        "treaty_countries": ["Extensive network"],
        "defi_reporting": "Yes - SARS reporting",
        "penalties_max": "R 800,000 + prison",
        "notes": "18% effective CGT (40% inclusion × 45% rate). Annual exemption R40,000. SARS strict on crypto.",
        "source_url": "https://www.sars.gov.za"
    },

    # === EUROPE (Additional) ===
    {
        "country_code": "IT",
        "country_name": "Italy",
        "cgt_short_rate": 0.26,
        "cgt_long_rate": 0.26,
        "staking_rate": 0.43,
        "mining_rate": 0.43,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days or domicile",
        "treaty_countries": ["Extensive EU"],
        "defi_reporting": "Yes - Agenzia Entrate",
        "penalties_max": "€50,000 + prison",
        "notes": "26% flat tax on crypto. €2,000 annual exemption. RW declaration for foreign holdings. 7% flat tax regime possible.",
        "source_url": "https://www.agenziaentrate.gov.it"
    },
    {
        "country_code": "NL",
        "country_name": "Netherlands",
        "cgt_short_rate": 0.32,  # Box 3 presumed return
        "cgt_long_rate": 0.32,
        "staking_rate": 0.495,  # Box 1 income
        "mining_rate": 0.495,
        "nft_treatment": "wealth_tax",
        "residency_rule": "Substantial interest test",
        "treaty_countries": ["Extensive"],
        "defi_reporting": "Yes - Belastingdienst",
        "penalties_max": "€25,000 penalty",
        "notes": "Box 3 wealth tax ~32% on presumed returns. Not actual gains! Complex system. Crypto = savings/investments.",
        "source_url": "https://www.belastingdienst.nl"
    },
    {
        "country_code": "SE",
        "country_name": "Sweden",
        "cgt_short_rate": 0.30,  # Capital income
        "cgt_long_rate": 0.30,
        "staking_rate": 0.30,
        "mining_rate": 0.57,  # Business income
        "nft_treatment": "capital_gain",
        "residency_rule": "Substantial connection",
        "treaty_countries": ["Nordic + EU"],
        "defi_reporting": "Yes - Skatteverket",
        "penalties_max": "SEK 500,000 penalty",
        "notes": "30% flat tax on capital gains. Business mining 57%. K4 form declaration. Exit tax on emigration.",
        "source_url": "https://www.skatteverket.se"
    },
    {
        "country_code": "NO",
        "country_name": "Norway",
        "cgt_short_rate": 0.22,  # Capital income
        "cgt_long_rate": 0.22,
        "staking_rate": 0.22,
        "mining_rate": 0.22,
        "nft_treatment": "capital_gain",
        "residency_rule": "Domicile or 183+ days",
        "treaty_countries": ["Nordic + extensive"],
        "defi_reporting": "Yes - Skatteetaten",
        "penalties_max": "NOK 500,000 penalty",
        "notes": "22% flat tax on capital gains. Wealth tax 1.1% additional. Strict reporting. Oil-rich nation.",
        "source_url": "https://www.skatteetaten.no"
    },
    {
        "country_code": "DK",
        "country_name": "Denmark",
        "cgt_short_rate": 0.42,  # Capital income up to DKK 61,000
        "cgt_long_rate": 0.42,
        "staking_rate": 0.42,
        "mining_rate": 0.42,
        "nft_treatment": "capital_gain",
        "residency_rule": "Full tax liability if domicile",
        "treaty_countries": ["Nordic + EU"],
        "defi_reporting": "Yes - SKAT",
        "penalties_max": "DKK 500,000 penalty",
        "notes": "42% tax on capital gains. High tax nation. Strict digital reporting. Crypto = shares treatment.",
        "source_url": "https://www.skat.dk"
    },
    {
        "country_code": "BE",
        "country_name": "Belgium",
        "cgt_short_rate": 0.33,  # If speculation (professional)
        "cgt_long_rate": 0.00,   # If good father (private wealth)
        "staking_rate": 0.33,
        "mining_rate": 0.33,
        "nft_treatment": "depends_classification",
        "residency_rule": "Domicile or economic center",
        "treaty_countries": ["Extensive EU"],
        "defi_reporting": "Yes - if professional",
        "penalties_max": "€25,000 penalty",
        "notes": "0% if 'good father' (private wealth management)! 33% if speculation. Classification key. Unclear rules.",
        "source_url": "https://finances.belgium.be"
    },
    {
        "country_code": "IE",
        "country_name": "Ireland",
        "cgt_short_rate": 0.33,
        "cgt_long_rate": 0.33,
        "staking_rate": 0.40,
        "mining_rate": 0.40,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days or 280 days over 2 years",
        "treaty_countries": ["Extensive"],
        "defi_reporting": "Yes - Revenue reporting",
        "penalties_max": "€50,000 penalty",
        "notes": "33% CGT. €1,270 annual exemption. Tech hub (Dublin). English-speaking. Remittance basis for non-domiciled.",
        "source_url": "https://www.revenue.ie"
    },
    {
        "country_code": "CZ",
        "country_name": "Czech Republic",
        "cgt_short_rate": 0.15,  # If <3 years or >€100k/year
        "cgt_long_rate": 0.00,   # If >3 years + <€100k/year
        "staking_rate": 0.15,
        "mining_rate": 0.15,
        "nft_treatment": "capital_gain",
        "residency_rule": "183 days or center of interests",
        "treaty_countries": ["EU network"],
        "defi_reporting": "Yes - tax return",
        "penalties_max": "CZK 500,000 penalty",
        "notes": "0% CGT if held >3 years AND gains <€100k/year! Otherwise 15%. Prague crypto-friendly.",
        "source_url": "https://www.financnisprava.cz"
    },
]


def seed_additional_countries():
    """Seed additional countries to reach 40+ total"""
    db = SessionLocal()

    try:
        print("🌍 Seeding additional 30+ countries...")
        print("")

        added_count = 0
        skipped_count = 0

        for reg_data in ADDITIONAL_COUNTRIES:
            # Check if exists
            existing = db.query(Regulation).filter_by(
                country_code=reg_data["country_code"]
            ).first()

            if existing:
                print(f"⚠️  {reg_data['country_code']} ({reg_data['country_name']}) already exists, skipping")
                skipped_count += 1
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
                valid_to=None,
                source_url=reg_data["source_url"]
            )
            db.add(history)

            print(f"✅ Added {reg_data['country_code']} - {reg_data['country_name']}")
            added_count += 1

        db.commit()

        print("")
        print(f"🎉 Successfully added {added_count} new countries!")
        print(f"⏭️  Skipped {skipped_count} existing countries")
        print("")

        # Show summary by region
        total = db.query(Regulation).count()
        print(f"📊 Total countries in database: {total}")
        print("")
        print("Regions added:")
        print("  • Asia: MY, TH, ID, PH, HK, TW, JP, KR, VN (9)")
        print("  • Tax Havens: MU, SC, CH, AD, LU, MC, LI (7)")
        print("  • South America: BR, AR, CL, CO, UY, PA (6)")
        print("  • Middle East & Africa: BH, QA, OM, ZA (4)")
        print("  • Europe: IT, NL, SE, NO, DK, BE, IE, CZ (8)")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_additional_countries()
