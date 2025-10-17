"""
Shared tax calculation utilities

Provides reusable functions for tax calculations across the application.
"""

from decimal import Decimal
from typing import Tuple
from app.models.regulation import Regulation


def calculate_tax(
    regulation: Regulation,
    short_term_gains: float,
    long_term_gains: float
) -> Tuple[float, float, float]:
    """
    Calculate tax for given regulation and gains.

    Uses crypto-specific rates if available, otherwise falls back to general CGT rates.

    Args:
        regulation: Regulation object with tax rates
        short_term_gains: Short-term capital gains (held <1 year)
        long_term_gains: Long-term capital gains (held >1 year)

    Returns:
        Tuple of (short_term_tax, long_term_tax, total_tax)

    Example:
        >>> reg = Regulation(crypto_short_rate=0.28, crypto_long_rate=0.28)
        >>> short_tax, long_tax, total = calculate_tax(reg, 10000, 50000)
        >>> total
        16800.0
    """
    # Use crypto-specific rates if available, otherwise fallback to CGT
    short_rate = float(regulation.crypto_short_rate) if regulation.crypto_short_rate is not None else float(regulation.cgt_short_rate)
    long_rate = float(regulation.crypto_long_rate) if regulation.crypto_long_rate is not None else float(regulation.cgt_long_rate)

    # Calculate individual components
    short_term_tax = short_term_gains * short_rate
    long_term_tax = long_term_gains * long_rate
    total_tax = short_term_tax + long_term_tax

    return (short_term_tax, long_term_tax, total_tax)


def get_effective_rate(regulation: Regulation) -> Tuple[float, float]:
    """
    Get effective tax rates for a regulation.

    Returns crypto-specific rates if available, otherwise general CGT rates.

    Args:
        regulation: Regulation object

    Returns:
        Tuple of (short_term_rate, long_term_rate)
    """
    short_rate = float(regulation.crypto_short_rate) if regulation.crypto_short_rate is not None else float(regulation.cgt_short_rate)
    long_rate = float(regulation.crypto_long_rate) if regulation.crypto_long_rate is not None else float(regulation.cgt_long_rate)

    return (short_rate, long_rate)


def calculate_savings(
    current_tax: float,
    target_tax: float
) -> Tuple[float, float]:
    """
    Calculate tax savings and percentage.

    Args:
        current_tax: Tax in current country
        target_tax: Tax in target country

    Returns:
        Tuple of (savings_amount, savings_percent)

    Note:
        Positive savings = lower tax in target country
        Negative savings = higher tax in target country
    """
    savings = current_tax - target_tax

    # Avoid division by zero
    if current_tax == 0:
        savings_percent = 0 if target_tax == 0 else -100
    else:
        savings_percent = (savings / current_tax) * 100

    return (savings, savings_percent)


def calculate_confidence_score(regulation: Regulation) -> float:
    """
    Calculate composite confidence score for regulation data.

    Factors:
    - Data freshness (40%): How recently was data updated
    - Source quality (30%): Quality of data sources (KPMG, IRS, etc.)
    - Data completeness (20%): How many fields are populated
    - Treaty coverage (10%): Whether treaty data exists

    Args:
        regulation: Regulation object

    Returns:
        Float between 0.3 and 1.0 (minimum 30% confidence)

    Example:
        >>> reg = Regulation(updated_at=datetime.now(), data_sources=["KPMG", "IRS"])
        >>> score = calculate_confidence_score(reg)
        >>> 0.3 <= score <= 1.0
        True
    """
    from datetime import datetime

    # 1. DATA FRESHNESS (40% weight)
    if regulation.updated_at:
        days_old = (datetime.utcnow() - regulation.updated_at.replace(tzinfo=None)).days
    else:
        days_old = 365  # Assume 1 year old if no date

    freshness_score = max(0, 1.0 - (days_old / 365))  # 0-1.0

    # 2. SOURCE QUALITY (30% weight)
    high_quality_sources = {'KPMG', 'IRS', 'HMRC', 'Tax Foundation', 'PWC', 'Deloitte', 'EY', 'PricewaterhouseCoopers'}
    medium_quality_sources = {'government', 'official', 'revenue', 'inland revenue', 'treasury'}

    source_score = 0.5  # Default medium quality
    if regulation.data_sources:
        sources_str = ' '.join(regulation.data_sources).lower()
        if any(source.lower() in sources_str for source in high_quality_sources):
            source_score = 1.0  # High quality
        elif any(source.lower() in sources_str for source in medium_quality_sources):
            source_score = 0.75  # Good quality
        else:
            source_score = 0.5  # Medium quality

    # 3. DATA COMPLETENESS (20% weight)
    fields_to_check = [
        regulation.cgt_short_rate is not None,
        regulation.cgt_long_rate is not None,
        regulation.crypto_notes is not None,
        regulation.residency_rule is not None,
        regulation.defi_reporting is not None,
        regulation.crypto_legal_status is not None,
    ]
    completeness_score = sum(fields_to_check) / len(fields_to_check)

    # 4. TREATY COVERAGE (10% weight)
    treaty_score = 1.0 if (regulation.treaty_countries and len(regulation.treaty_countries) > 0) else 0.5

    # COMPOSITE SCORE
    confidence = (
        0.4 * freshness_score +
        0.3 * source_score +
        0.2 * completeness_score +
        0.1 * treaty_score
    )

    # Ensure minimum 30% confidence
    return max(0.3, confidence)
