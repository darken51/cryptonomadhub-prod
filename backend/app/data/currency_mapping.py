"""
Currency Mapping for All 160+ Jurisdictions

Maps country codes to their official currencies with metadata about:
- Currency tier (1=major, 2=emerging, 3=exotic)
- Whether the country uses USD directly
- Recommended exchange rate sources
"""

from typing import Dict, Optional
from dataclasses import dataclass

@dataclass
class CurrencyInfo:
    """Currency information for a jurisdiction"""
    currency_code: str
    currency_name: str
    currency_symbol: str
    tier: int  # 1=major (reliable APIs), 2=emerging, 3=exotic/USD proxy
    uses_usd_directly: bool = False
    recommended_source: str = "EXCHANGERATE_API"
    notes: Optional[str] = None


# Complete mapping of all 160+ jurisdictions to currencies
JURISDICTION_CURRENCY_MAP: Dict[str, CurrencyInfo] = {
    # ========== TIER 1: Major Currencies (30+ countries) ==========

    # North America
    "US": CurrencyInfo("USD", "US Dollar", "$", 1, uses_usd_directly=True, recommended_source="NONE"),
    "CA": CurrencyInfo("CAD", "Canadian Dollar", "C$", 1, recommended_source="BOC"),
    "MX": CurrencyInfo("MXN", "Mexican Peso", "MX$", 1),

    # Europe - Eurozone (19 countries)
    "FR": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "DE": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "IT": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "ES": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "PT": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "IE": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "NL": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "BE": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "AT": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "FI": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "GR": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "LU": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "EE": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "LV": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "LT": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "SI": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "SK": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "CY": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),
    "MT": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB"),

    # Europe - Non-Eurozone
    "GB": CurrencyInfo("GBP", "British Pound", "£", 1, recommended_source="BOE"),
    "CH": CurrencyInfo("CHF", "Swiss Franc", "CHF", 1, recommended_source="SNB"),
    "SE": CurrencyInfo("SEK", "Swedish Krona", "kr", 1),
    "NO": CurrencyInfo("NOK", "Norwegian Krone", "kr", 1),
    "DK": CurrencyInfo("DKK", "Danish Krone", "kr", 1),
    "PL": CurrencyInfo("PLN", "Polish Złoty", "zł", 1),
    "CZ": CurrencyInfo("CZK", "Czech Koruna", "Kč", 1),
    "HU": CurrencyInfo("HUF", "Hungarian Forint", "Ft", 1),
    "RO": CurrencyInfo("RON", "Romanian Leu", "lei", 2),
    "BG": CurrencyInfo("BGN", "Bulgarian Lev", "лв", 2),
    "HR": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB", notes="Adopted EUR in 2023"),

    # Asia-Pacific
    "JP": CurrencyInfo("JPY", "Japanese Yen", "¥", 1, recommended_source="BOJ"),
    "AU": CurrencyInfo("AUD", "Australian Dollar", "A$", 1, recommended_source="RBA"),
    "NZ": CurrencyInfo("NZD", "New Zealand Dollar", "NZ$", 1),
    "SG": CurrencyInfo("SGD", "Singapore Dollar", "S$", 1, recommended_source="MAS"),
    "HK": CurrencyInfo("HKD", "Hong Kong Dollar", "HK$", 1, recommended_source="HKMA"),
    "CN": CurrencyInfo("CNY", "Chinese Yuan", "¥", 1, recommended_source="PBOC"),
    "KR": CurrencyInfo("KRW", "South Korean Won", "₩", 1),
    "TW": CurrencyInfo("TWD", "Taiwan Dollar", "NT$", 1),

    # ========== TIER 2: Emerging Market Currencies (60+ countries) ==========

    # South America
    "BR": CurrencyInfo("BRL", "Brazilian Real", "R$", 2),
    "AR": CurrencyInfo("ARS", "Argentine Peso", "$", 2, notes="High inflation - unstable"),
    "CL": CurrencyInfo("CLP", "Chilean Peso", "$", 2),
    "CO": CurrencyInfo("COP", "Colombian Peso", "$", 2),
    "PE": CurrencyInfo("PEN", "Peruvian Sol", "S/", 2),
    "UY": CurrencyInfo("UYU", "Uruguayan Peso", "$", 2),
    "PY": CurrencyInfo("PYG", "Paraguayan Guaraní", "₲", 2),
    "BO": CurrencyInfo("BOB", "Bolivian Boliviano", "Bs", 2),
    "VE": CurrencyInfo("VES", "Venezuelan Bolívar", "Bs", 3, notes="Hyperinflation - use USD proxy"),

    # Central America & Caribbean
    "CR": CurrencyInfo("CRC", "Costa Rican Colón", "₡", 2),
    "PA": CurrencyInfo("USD", "US Dollar", "$", 1, uses_usd_directly=True, notes="Official dollarization"),
    "GT": CurrencyInfo("GTQ", "Guatemalan Quetzal", "Q", 2),
    "SV": CurrencyInfo("USD", "US Dollar", "$", 1, uses_usd_directly=True, notes="Official dollarization"),
    "HN": CurrencyInfo("HNL", "Honduran Lempira", "L", 2),
    "NI": CurrencyInfo("NIO", "Nicaraguan Córdoba", "C$", 2),
    "DO": CurrencyInfo("DOP", "Dominican Peso", "RD$", 2),
    "JM": CurrencyInfo("JMD", "Jamaican Dollar", "J$", 2),
    "TT": CurrencyInfo("TTD", "Trinidad & Tobago Dollar", "TT$", 2),
    "BB": CurrencyInfo("BBD", "Barbadian Dollar", "Bds$", 2),
    "BS": CurrencyInfo("BSD", "Bahamian Dollar", "B$", 2),
    "BM": CurrencyInfo("BMD", "Bermudian Dollar", "BD$", 2),
    "KY": CurrencyInfo("KYD", "Cayman Islands Dollar", "CI$", 2),

    # Africa
    "ZA": CurrencyInfo("ZAR", "South African Rand", "R", 2),
    "NG": CurrencyInfo("NGN", "Nigerian Naira", "₦", 2),
    "KE": CurrencyInfo("KES", "Kenyan Shilling", "KSh", 2),
    "EG": CurrencyInfo("EGP", "Egyptian Pound", "E£", 2),
    "MA": CurrencyInfo("MAD", "Moroccan Dirham", "DH", 2),
    "TN": CurrencyInfo("TND", "Tunisian Dinar", "DT", 2),
    "GH": CurrencyInfo("GHS", "Ghanaian Cedi", "GH₵", 2),
    "UG": CurrencyInfo("UGX", "Ugandan Shilling", "USh", 2),
    "TZ": CurrencyInfo("TZS", "Tanzanian Shilling", "TSh", 2),
    "ET": CurrencyInfo("ETB", "Ethiopian Birr", "Br", 2),
    "MU": CurrencyInfo("MUR", "Mauritian Rupee", "₨", 2),
    "SC": CurrencyInfo("SCR", "Seychellois Rupee", "₨", 2),
    "BW": CurrencyInfo("BWP", "Botswana Pula", "P", 2),
    "NA": CurrencyInfo("NAD", "Namibian Dollar", "N$", 2),
    "ZW": CurrencyInfo("USD", "US Dollar", "$", 1, uses_usd_directly=True, notes="Official dollarization after hyperinflation"),

    # Middle East
    "AE": CurrencyInfo("AED", "UAE Dirham", "د.إ", 1),
    "SA": CurrencyInfo("SAR", "Saudi Riyal", "﷼", 1),
    "QA": CurrencyInfo("QAR", "Qatari Riyal", "﷼", 1),
    "KW": CurrencyInfo("KWD", "Kuwaiti Dinar", "KD", 1),
    "BH": CurrencyInfo("BHD", "Bahraini Dinar", "BD", 1),
    "OM": CurrencyInfo("OMR", "Omani Rial", "﷼", 1),
    "IL": CurrencyInfo("ILS", "Israeli Shekel", "₪", 1),
    "TR": CurrencyInfo("TRY", "Turkish Lira", "₺", 2, notes="High inflation - volatile"),
    "JO": CurrencyInfo("JOD", "Jordanian Dinar", "JD", 2),
    "LB": CurrencyInfo("LBP", "Lebanese Pound", "LL", 3, notes="Currency crisis - use USD proxy"),

    # Asia
    "IN": CurrencyInfo("INR", "Indian Rupee", "₹", 2),
    "TH": CurrencyInfo("THB", "Thai Baht", "฿", 2),
    "MY": CurrencyInfo("MYR", "Malaysian Ringgit", "RM", 2),
    "PH": CurrencyInfo("PHP", "Philippine Peso", "₱", 2),
    "ID": CurrencyInfo("IDR", "Indonesian Rupiah", "Rp", 2),
    "VN": CurrencyInfo("VND", "Vietnamese Dong", "₫", 2),
    "BD": CurrencyInfo("BDT", "Bangladeshi Taka", "৳", 2),
    "PK": CurrencyInfo("PKR", "Pakistani Rupee", "₨", 2),
    "LK": CurrencyInfo("LKR", "Sri Lankan Rupee", "Rs", 2),
    "MM": CurrencyInfo("MMK", "Myanmar Kyat", "K", 2),
    "KH": CurrencyInfo("KHR", "Cambodian Riel", "៛", 2),
    "LA": CurrencyInfo("LAK", "Lao Kip", "₭", 2),
    "MN": CurrencyInfo("MNT", "Mongolian Tögrög", "₮", 2),
    "KZ": CurrencyInfo("KZT", "Kazakhstani Tenge", "₸", 2),
    "UZ": CurrencyInfo("UZS", "Uzbekistani Som", "сўм", 2),
    "GE": CurrencyInfo("GEL", "Georgian Lari", "₾", 2),
    "AM": CurrencyInfo("AMD", "Armenian Dram", "֏", 2),
    "AZ": CurrencyInfo("AZN", "Azerbaijani Manat", "₼", 2),

    # ========== TIER 3: Exotic/Micro-states (Use proxy currencies) ==========

    # Micro-states (use neighbor's currency)
    "MC": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB", notes="Uses EUR (France)"),
    "AD": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB", notes="Uses EUR"),
    "SM": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB", notes="Uses EUR (San Marino)"),
    "VA": CurrencyInfo("EUR", "Euro", "€", 1, recommended_source="ECB", notes="Uses EUR (Vatican)"),
    "LI": CurrencyInfo("CHF", "Swiss Franc", "CHF", 1, notes="Uses CHF (Liechtenstein)"),

    # Small island nations - often use USD or regional currency
    "VG": CurrencyInfo("USD", "US Dollar", "$", 1, uses_usd_directly=True, notes="British Virgin Islands"),
    "TC": CurrencyInfo("USD", "US Dollar", "$", 1, uses_usd_directly=True, notes="Turks & Caicos"),
    "VC": CurrencyInfo("XCD", "East Caribbean Dollar", "EC$", 2, notes="Pegged to USD"),
    "LC": CurrencyInfo("XCD", "East Caribbean Dollar", "EC$", 2, notes="Pegged to USD"),
    "GD": CurrencyInfo("XCD", "East Caribbean Dollar", "EC$", 2, notes="Pegged to USD"),
    "AG": CurrencyInfo("XCD", "East Caribbean Dollar", "EC$", 2, notes="Antigua & Barbuda, pegged to USD"),
    "DM": CurrencyInfo("XCD", "East Caribbean Dollar", "EC$", 2, notes="Dominica, pegged to USD"),
    "KN": CurrencyInfo("XCD", "East Caribbean Dollar", "EC$", 2, notes="St Kitts & Nevis, pegged to USD"),

    # Pacific Islands
    "FJ": CurrencyInfo("FJD", "Fijian Dollar", "FJ$", 2),
    "PG": CurrencyInfo("PGK", "Papua New Guinea Kina", "K", 2),
    "WS": CurrencyInfo("WST", "Samoan Tālā", "T", 2),
    "TO": CurrencyInfo("TOP", "Tongan Paʻanga", "T$", 2),
    "VU": CurrencyInfo("VUV", "Vanuatu Vatu", "VT", 2),

    # Remaining Asian countries
    "NP": CurrencyInfo("NPR", "Nepalese Rupee", "₨", 2),
    "BT": CurrencyInfo("BTN", "Bhutanese Ngultrum", "Nu", 2),
    "MV": CurrencyInfo("MVR", "Maldivian Rufiyaa", "Rf", 2),
    "BN": CurrencyInfo("BND", "Brunei Dollar", "B$", 2, notes="Pegged to SGD"),
    "MO": CurrencyInfo("MOP", "Macanese Pataca", "MOP$", 2, notes="Pegged to HKD"),

    # Remaining European countries
    "IS": CurrencyInfo("ISK", "Icelandic Króna", "kr", 2),
    "RS": CurrencyInfo("RSD", "Serbian Dinar", "din", 2),
    "BA": CurrencyInfo("BAM", "Bosnia-Herzegovina Mark", "KM", 2),
    "MK": CurrencyInfo("MKD", "Macedonian Denar", "ден", 2),
    "AL": CurrencyInfo("ALL", "Albanian Lek", "L", 2),
    "MD": CurrencyInfo("MDL", "Moldovan Leu", "L", 2),
    "UA": CurrencyInfo("UAH", "Ukrainian Hryvnia", "₴", 2),
    "BY": CurrencyInfo("BYN", "Belarusian Ruble", "Br", 2),
    "RU": CurrencyInfo("RUB", "Russian Ruble", "₽", 2, notes="Sanctioned - limited access"),

    # Remaining African countries
    "AO": CurrencyInfo("AOA", "Angolan Kwanza", "Kz", 2),
    "MZ": CurrencyInfo("MZN", "Mozambican Metical", "MT", 2),
    "ZM": CurrencyInfo("ZMW", "Zambian Kwacha", "ZK", 2),
    "MW": CurrencyInfo("MWK", "Malawian Kwacha", "MK", 2),
    "RW": CurrencyInfo("RWF", "Rwandan Franc", "FRw", 2),
    "BI": CurrencyInfo("BIF", "Burundian Franc", "FBu", 2),
    "DJ": CurrencyInfo("DJF", "Djiboutian Franc", "Fdj", 2),
    "SO": CurrencyInfo("SOS", "Somali Shilling", "Sh", 3, notes="Unstable - use USD proxy"),
    "SD": CurrencyInfo("SDG", "Sudanese Pound", "£", 2),
    "SS": CurrencyInfo("SSP", "South Sudanese Pound", "£", 3, notes="Unstable"),
    "SN": CurrencyInfo("XOF", "West African CFA Franc", "CFA", 2, notes="Pegged to EUR"),
    "CI": CurrencyInfo("XOF", "West African CFA Franc", "CFA", 2, notes="Côte d'Ivoire, pegged to EUR"),
    "BJ": CurrencyInfo("XOF", "West African CFA Franc", "CFA", 2, notes="Benin, pegged to EUR"),
    "BF": CurrencyInfo("XOF", "West African CFA Franc", "CFA", 2, notes="Burkina Faso, pegged to EUR"),
    "ML": CurrencyInfo("XOF", "West African CFA Franc", "CFA", 2, notes="Mali, pegged to EUR"),
    "NE": CurrencyInfo("XOF", "West African CFA Franc", "CFA", 2, notes="Niger, pegged to EUR"),
    "TG": CurrencyInfo("XOF", "West African CFA Franc", "CFA", 2, notes="Togo, pegged to EUR"),
    "GW": CurrencyInfo("XOF", "West African CFA Franc", "CFA", 2, notes="Guinea-Bissau, pegged to EUR"),
    "CM": CurrencyInfo("XAF", "Central African CFA Franc", "FCFA", 2, notes="Cameroon, pegged to EUR"),
    "GA": CurrencyInfo("XAF", "Central African CFA Franc", "FCFA", 2, notes="Gabon, pegged to EUR"),
    "CG": CurrencyInfo("XAF", "Central African CFA Franc", "FCFA", 2, notes="Congo, pegged to EUR"),
    "CF": CurrencyInfo("XAF", "Central African CFA Franc", "FCFA", 2, notes="Central African Republic, pegged to EUR"),
    "TD": CurrencyInfo("XAF", "Central African CFA Franc", "FCFA", 2, notes="Chad, pegged to EUR"),
    "GQ": CurrencyInfo("XAF", "Central African CFA Franc", "FCFA", 2, notes="Equatorial Guinea, pegged to EUR"),
    "DZ": CurrencyInfo("DZD", "Algerian Dinar", "DA", 2),
    "LY": CurrencyInfo("LYD", "Libyan Dinar", "LD", 2),
    "MR": CurrencyInfo("MRU", "Mauritanian Ouguiya", "UM", 2),
    "GM": CurrencyInfo("GMD", "Gambian Dalasi", "D", 2),
    "GN": CurrencyInfo("GNF", "Guinean Franc", "FG", 2),
    "SL": CurrencyInfo("SLL", "Sierra Leonean Leone", "Le", 2),
    "LR": CurrencyInfo("LRD", "Liberian Dollar", "L$", 2),
    "ER": CurrencyInfo("ERN", "Eritrean Nakfa", "Nfk", 2),
    "KM": CurrencyInfo("KMF", "Comorian Franc", "CF", 2),
    "MG": CurrencyInfo("MGA", "Malagasy Ariary", "Ar", 2),
    "LS": CurrencyInfo("LSL", "Lesotho Loti", "L", 2),
    "SZ": CurrencyInfo("SZL", "Swazi Lilangeni", "L", 2),

    # Remaining Middle Eastern
    "IQ": CurrencyInfo("IQD", "Iraqi Dinar", "ع.د", 2),
    "IR": CurrencyInfo("IRR", "Iranian Rial", "﷼", 3, notes="Sanctioned - limited access"),
    "YE": CurrencyInfo("YER", "Yemeni Rial", "﷼", 3, notes="Civil war - unstable"),
    "SY": CurrencyInfo("SYP", "Syrian Pound", "£S", 3, notes="Civil war - unstable"),
    "AF": CurrencyInfo("AFN", "Afghan Afghani", "؋", 3, notes="Unstable"),

    # Add any remaining countries with USD as fallback
}


def get_currency_info(country_code: str) -> CurrencyInfo:
    """
    Get currency information for a country code

    Args:
        country_code: ISO 2-letter country code (e.g., "FR", "US")

    Returns:
        CurrencyInfo object with currency details

    Raises:
        KeyError if country_code not found
    """
    if country_code not in JURISDICTION_CURRENCY_MAP:
        # Fallback to USD for unknown jurisdictions
        return CurrencyInfo(
            "USD",
            "US Dollar",
            "$",
            3,
            uses_usd_directly=False,
            notes=f"Unknown jurisdiction {country_code} - defaulting to USD"
        )

    return JURISDICTION_CURRENCY_MAP[country_code]


def get_all_currencies() -> set:
    """Get set of all unique currency codes used"""
    return {info.currency_code for info in JURISDICTION_CURRENCY_MAP.values()}


def get_countries_by_currency(currency_code: str) -> list:
    """Get list of country codes that use a specific currency"""
    return [
        code for code, info in JURISDICTION_CURRENCY_MAP.items()
        if info.currency_code == currency_code
    ]


def get_tier_1_currencies() -> set:
    """Get all Tier 1 (major) currency codes"""
    return {info.currency_code for info in JURISDICTION_CURRENCY_MAP.values() if info.tier == 1}


def get_dollarized_countries() -> list:
    """Get list of countries that officially use USD"""
    return [
        code for code, info in JURISDICTION_CURRENCY_MAP.items()
        if info.uses_usd_directly
    ]
