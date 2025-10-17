"""
International Tax Service

Tax rules and calculations for multiple jurisdictions.

Supported Countries:
- United States (US)
- France (FR)
- Germany (DE)
- United Kingdom (UK)
- Portugal (PT)
- Canada (CA)
- Australia (AU)

Features:
- Country-specific holding periods
- Capital gains rates by jurisdiction
- Crypto-to-crypto taxable events
- FIFO requirements
- Tax-free thresholds
"""

from typing import Dict, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class InternationalTax:
    """
    International Tax Rules Engine
    
    Provides tax calculations and guidance for multiple jurisdictions.
    """

    # Tax rules by country
    TAX_RULES = {
        "US": {
            "name": "United States",
            "currency": "USD",
            "short_term_threshold_days": 365,
            "long_term_threshold_days": 365,
            "short_term_rate": 0.37,  # Top federal rate
            "long_term_rate": 0.20,   # Top LTCG rate
            "crypto_to_crypto_taxable": True,
            "cost_basis_method_required": "Any (FIFO recommended)",
            "tax_free_threshold": 0,
            "notes": "Short-term gains taxed as ordinary income. State taxes additional."
        },
        "FR": {
            "name": "France",
            "currency": "EUR",
            "short_term_threshold_days": 0,
            "long_term_threshold_days": 0,
            "flat_tax_rate": 0.30,  # PFU (Prélèvement Forfaitaire Unique)
            "crypto_to_crypto_taxable": False,  # Only crypto-to-fiat
            "cost_basis_method_required": "FIFO",
            "tax_free_threshold": 305,  # €305 annual allowance
            "notes": "30% flat tax (PFU) or progressive income tax + 17.2% social charges"
        },
        "DE": {
            "name": "Germany",
            "currency": "EUR",
            "short_term_threshold_days": 365,
            "long_term_threshold_days": 365,
            "short_term_rate": 0.45,  # Top income tax rate
            "long_term_rate": 0.0,    # Tax-free after 1 year!
            "crypto_to_crypto_taxable": True,
            "cost_basis_method_required": "FIFO",
            "tax_free_threshold": 600,  # €600 annual allowance
            "notes": "Tax-free if held >1 year. Special rules for staking (10 years)"
        },
        "UK": {
            "name": "United Kingdom",
            "currency": "GBP",
            "short_term_threshold_days": 0,
            "long_term_threshold_days": 0,
            "capital_gains_rate": 0.20,  # Higher rate
            "basic_rate": 0.10,
            "crypto_to_crypto_taxable": True,
            "cost_basis_method_required": "Same Day / Bed & Breakfast / Section 104",
            "tax_free_threshold": 6000,  # £6,000 annual CGT allowance (2023/24)
            "notes": "Complex pooling rules. No holding period distinction."
        },
        "PT": {
            "name": "Portugal",
            "currency": "EUR",
            "short_term_threshold_days": 365,
            "long_term_threshold_days": 365,
            "short_term_rate": 0.28,   # If held <1 year and frequent trading
            "long_term_rate": 0.0,     # Tax-free for individuals (non-professional)
            "crypto_to_crypto_taxable": False,
            "cost_basis_method_required": "Any",
            "tax_free_threshold": 0,
            "notes": "Generally tax-free for individuals. Business/professional traders taxed."
        },
        "CA": {
            "name": "Canada",
            "currency": "CAD",
            "short_term_threshold_days": 0,
            "long_term_threshold_days": 0,
            "inclusion_rate": 0.50,  # 50% of gains included in income
            "top_federal_rate": 0.33,
            "effective_rate": 0.165,  # 50% * 33%
            "crypto_to_crypto_taxable": True,
            "cost_basis_method_required": "ACB (Adjusted Cost Base)",
            "tax_free_threshold": 0,
            "notes": "50% inclusion rate. Provincial taxes additional."
        },
        "AU": {
            "name": "Australia",
            "currency": "AUD",
            "short_term_threshold_days": 365,
            "long_term_threshold_days": 365,
            "short_term_rate": 0.45,  # Top marginal rate
            "long_term_discount": 0.50,  # 50% CGT discount after 12 months
            "effective_long_term_rate": 0.225,  # 50% * 45%
            "crypto_to_crypto_taxable": True,
            "cost_basis_method_required": "Any (FIFO recommended)",
            "tax_free_threshold": 18200,  # Tax-free threshold (income)
            "notes": "50% CGT discount if held >12 months"
        }
    }

    def __init__(self, jurisdiction: str = "US"):
        """
        Initialize with tax jurisdiction

        Args:
            jurisdiction: Country code (US, FR, DE, UK, PT, CA, AU)
        """
        self.jurisdiction = jurisdiction.upper()
        
        if self.jurisdiction not in self.TAX_RULES:
            logger.warning(f"Unknown jurisdiction {jurisdiction}, defaulting to US")
            self.jurisdiction = "US"
        
        self.rules = self.TAX_RULES[self.jurisdiction]

    def calculate_tax(
        self,
        capital_gain: float,
        holding_period_days: int,
        is_crypto_to_crypto: bool = False
    ) -> Dict:
        """
        Calculate tax on capital gain

        Args:
            capital_gain: Capital gain amount
            holding_period_days: Days held
            is_crypto_to_crypto: Whether it's crypto-to-crypto trade

        Returns:
            Tax calculation details
        """
        # Check if transaction is taxable
        if is_crypto_to_crypto and not self.rules.get("crypto_to_crypto_taxable", True):
            return {
                "jurisdiction": self.jurisdiction,
                "capital_gain": capital_gain,
                "tax_owed": 0,
                "effective_rate": 0,
                "notes": "Crypto-to-crypto not taxable in this jurisdiction"
            }

        # Determine if long-term or short-term
        long_term_threshold = self.rules.get("long_term_threshold_days", 365)
        is_long_term = holding_period_days >= long_term_threshold

        # Calculate tax based on jurisdiction
        if self.jurisdiction == "US":
            rate = self.rules["long_term_rate"] if is_long_term else self.rules["short_term_rate"]
            tax = capital_gain * rate if capital_gain > 0 else 0
            
        elif self.jurisdiction == "FR":
            rate = self.rules["flat_tax_rate"]
            tax = capital_gain * rate if capital_gain > 0 else 0
            
        elif self.jurisdiction == "DE":
            if is_long_term:
                tax = 0  # Tax-free!
                rate = 0
            else:
                rate = self.rules["short_term_rate"]
                tax = capital_gain * rate if capital_gain > 0 else 0
                
        elif self.jurisdiction == "UK":
            rate = self.rules["capital_gains_rate"]
            tax = capital_gain * rate if capital_gain > 0 else 0
            
        elif self.jurisdiction == "PT":
            if is_long_term or not is_crypto_to_crypto:
                tax = 0  # Tax-free for individuals
                rate = 0
            else:
                rate = self.rules["short_term_rate"]
                tax = capital_gain * rate if capital_gain > 0 else 0
                
        elif self.jurisdiction == "CA":
            inclusion_rate = self.rules["inclusion_rate"]
            taxable_amount = capital_gain * inclusion_rate
            rate = self.rules["top_federal_rate"]
            tax = taxable_amount * rate if capital_gain > 0 else 0
            
        elif self.jurisdiction == "AU":
            if is_long_term:
                discount = self.rules["long_term_discount"]
                taxable_amount = capital_gain * (1 - discount)
                rate = self.rules["short_term_rate"]
                tax = taxable_amount * rate if capital_gain > 0 else 0
            else:
                rate = self.rules["short_term_rate"]
                tax = capital_gain * rate if capital_gain > 0 else 0
        else:
            rate = 0.20  # Default
            tax = capital_gain * rate if capital_gain > 0 else 0

        return {
            "jurisdiction": self.jurisdiction,
            "capital_gain": capital_gain,
            "holding_period_days": holding_period_days,
            "is_long_term": is_long_term,
            "tax_rate": rate if 'rate' in locals() else 0,
            "tax_owed": tax,
            "currency": self.rules["currency"],
            "notes": self.rules.get("notes", "")
        }

    def get_holding_period_requirement(self) -> Dict:
        """Get holding period requirements for jurisdiction"""
        return {
            "jurisdiction": self.jurisdiction,
            "short_term_threshold_days": self.rules.get("short_term_threshold_days", 0),
            "long_term_threshold_days": self.rules.get("long_term_threshold_days", 365),
            "benefit": "Lower tax rate" if self.jurisdiction in ["US", "DE", "AU"] else "N/A"
        }

    def is_crypto_to_crypto_taxable(self) -> bool:
        """Check if crypto-to-crypto trades are taxable"""
        return self.rules.get("crypto_to_crypto_taxable", True)

    def get_tax_free_threshold(self) -> float:
        """Get annual tax-free threshold if applicable"""
        return self.rules.get("tax_free_threshold", 0)

    def get_recommended_cost_basis_method(self) -> str:
        """Get recommended cost basis method for jurisdiction"""
        return self.rules.get("cost_basis_method_required", "FIFO")

    def get_all_jurisdictions(self) -> Dict:
        """Get summary of all supported jurisdictions"""
        summary = {}
        for code, rules in self.TAX_RULES.items():
            summary[code] = {
                "name": rules["name"],
                "currency": rules["currency"],
                "crypto_to_crypto_taxable": rules.get("crypto_to_crypto_taxable", True),
                "tax_free_threshold": rules.get("tax_free_threshold", 0),
                "long_term_benefit": rules.get("long_term_threshold_days", 0) > 0
            }
        return summary

    def compare_jurisdictions(self, capital_gain: float, holding_days: int) -> Dict:
        """
        Compare tax liability across all jurisdictions

        Useful for tax planning and understanding different regimes
        """
        comparison = {}
        
        for code in self.TAX_RULES.keys():
            temp_calc = InternationalTax(code)
            result = temp_calc.calculate_tax(capital_gain, holding_days)
            comparison[code] = {
                "country": self.TAX_RULES[code]["name"],
                "tax_owed": result["tax_owed"],
                "effective_rate": result["tax_owed"] / capital_gain if capital_gain > 0 else 0,
                "currency": result["currency"]
            }
        
        return comparison
