from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.regulation import Regulation
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/regulations", tags=["Regulations"])


def extract_data_quality(regulation: Regulation) -> tuple[str, List[str]]:
    """
    Extract data quality and sources from regulation

    Returns:
        (quality_level, sources_list)
    """
    # Use existing data_quality and data_sources from DB if available
    if regulation.data_quality:
        quality = regulation.data_quality
    else:
        # Fallback: calculate from data
        notes = regulation.notes or ""
        high_quality_sources = ['PwC', 'Tax Foundation', 'KPMG', 'OECD', 'Koinly']
        sources_from_notes = [s for s in high_quality_sources if s in notes]

        # FIX: Check if CGT exists (including 0.0)
        has_cgt = regulation.cgt_short_rate is not None
        has_crypto = regulation.crypto_short_rate is not None
        has_sources = len(sources_from_notes) > 0

        if has_sources and (has_cgt or has_crypto):
            quality = 'high' if len(sources_from_notes) >= 2 else 'medium'
        elif has_cgt:
            quality = 'medium'
        elif not has_cgt and not has_crypto:
            quality = 'low'
        else:
            quality = 'unknown'

    # Use data_sources column if available, otherwise extract from notes
    if regulation.data_sources:
        sources = regulation.data_sources
    else:
        notes = regulation.notes or ""
        high_quality_sources = ['PwC', 'Tax Foundation', 'KPMG', 'OECD', 'Koinly']
        sources = [s for s in high_quality_sources if s in notes]

    return quality, sources


class RegulationResponse(BaseModel):
    country_code: str
    country_name: str
    flag_emoji: Optional[str] = None  # Country flag emoji (e.g., 🇺🇸, 🇫🇷)
    cgt_short_rate: float
    cgt_long_rate: float
    crypto_short_rate: Optional[float] = None
    crypto_long_rate: Optional[float] = None
    crypto_notes: Optional[str] = None
    staking_rate: Optional[float] = None
    mining_rate: Optional[float] = None

    # Structured crypto tax metadata
    holding_period_months: Optional[int] = None
    is_flat_tax: Optional[bool] = None
    is_progressive: Optional[bool] = None
    is_territorial: Optional[bool] = None
    crypto_specific: Optional[bool] = None
    long_term_discount_pct: Optional[float] = None
    exemption_threshold: Optional[float] = None
    exemption_threshold_currency: Optional[str] = None

    nft_treatment: Optional[str] = None
    residency_rule: Optional[str] = None
    defi_reporting: Optional[str] = None
    penalties_max: Optional[str] = None
    notes: Optional[str] = None
    updated_at: Optional[str] = None
    source_url: Optional[str] = None  # Source URL for tax data
    data_quality: Optional[str] = None  # 'high', 'medium', 'low', 'unknown'
    data_sources: Optional[List[str]] = None  # ['PwC', 'Koinly', etc.]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[RegulationResponse])
async def get_all_regulations(
    db: Session = Depends(get_db),
    crypto_only: bool = False,
    reliable_only: bool = False
):
    """
    Get all country tax regulations

    Args:
        crypto_only: If True, only return countries with crypto-specific data
        reliable_only: If True, only return countries with verified CGT data from trusted sources

    Returns:
        List of all regulations with crypto-specific rates when available
    """
    query = db.query(Regulation)

    if crypto_only:
        # Filter for countries that have crypto-specific data
        query = query.filter(Regulation.crypto_short_rate.isnot(None))

    regulations = query.all()

    # Convert to response format and filter for reliable data if requested
    result = []
    for reg in regulations:
        quality, sources = extract_data_quality(reg)

        # Skip if reliable_only and quality is low/unknown
        if reliable_only and quality in ['low', 'unknown']:
            continue

        result.append(RegulationResponse(
            country_code=reg.country_code,
            country_name=reg.country_name,
            flag_emoji=reg.flag_emoji,
            cgt_short_rate=float(reg.cgt_short_rate),
            cgt_long_rate=float(reg.cgt_long_rate),
            crypto_short_rate=float(reg.crypto_short_rate) if reg.crypto_short_rate else None,
            crypto_long_rate=float(reg.crypto_long_rate) if reg.crypto_long_rate else None,
            crypto_notes=reg.crypto_notes,
            staking_rate=float(reg.staking_rate) if reg.staking_rate else None,
            mining_rate=float(reg.mining_rate) if reg.mining_rate else None,
            # Structured crypto tax metadata
            holding_period_months=reg.holding_period_months,
            is_flat_tax=bool(reg.is_flat_tax) if reg.is_flat_tax is not None else None,
            is_progressive=bool(reg.is_progressive) if reg.is_progressive is not None else None,
            is_territorial=bool(reg.is_territorial) if reg.is_territorial is not None else None,
            crypto_specific=bool(reg.crypto_specific) if reg.crypto_specific is not None else None,
            long_term_discount_pct=float(reg.long_term_discount_pct) if reg.long_term_discount_pct else None,
            exemption_threshold=float(reg.exemption_threshold) if reg.exemption_threshold else None,
            exemption_threshold_currency=reg.exemption_threshold_currency,
            nft_treatment=reg.nft_treatment,
            residency_rule=reg.residency_rule,
            defi_reporting=reg.defi_reporting,
            penalties_max=reg.penalties_max,
            notes=reg.notes,
            updated_at=str(reg.updated_at) if reg.updated_at else None,
            source_url=reg.source_url,
            data_quality=quality,
            data_sources=sources if sources else None
        ))

    return result


@router.get("/{country_code}", response_model=RegulationResponse)
async def get_regulation(
    country_code: str,
    db: Session = Depends(get_db)
):
    """
    Get tax regulation for a specific country

    Returns crypto-specific rates when available
    """
    regulation = db.query(Regulation).filter(
        Regulation.country_code == country_code.upper()
    ).first()

    if not regulation:
        raise HTTPException(status_code=404, detail=f"Country {country_code} not found")

    quality, sources = extract_data_quality(regulation)

    return RegulationResponse(
        country_code=regulation.country_code,
        country_name=regulation.country_name,
        flag_emoji=regulation.flag_emoji,
        cgt_short_rate=float(regulation.cgt_short_rate),
        cgt_long_rate=float(regulation.cgt_long_rate),
        crypto_short_rate=float(regulation.crypto_short_rate) if regulation.crypto_short_rate else None,
        crypto_long_rate=float(regulation.crypto_long_rate) if regulation.crypto_long_rate else None,
        crypto_notes=regulation.crypto_notes,
        staking_rate=float(regulation.staking_rate) if regulation.staking_rate else None,
        mining_rate=float(regulation.mining_rate) if regulation.mining_rate else None,
        # Structured crypto tax metadata
        holding_period_months=regulation.holding_period_months,
        is_flat_tax=bool(regulation.is_flat_tax) if regulation.is_flat_tax is not None else None,
        is_progressive=bool(regulation.is_progressive) if regulation.is_progressive is not None else None,
        is_territorial=bool(regulation.is_territorial) if regulation.is_territorial is not None else None,
        crypto_specific=bool(regulation.crypto_specific) if regulation.crypto_specific is not None else None,
        long_term_discount_pct=float(regulation.long_term_discount_pct) if regulation.long_term_discount_pct else None,
        exemption_threshold=float(regulation.exemption_threshold) if regulation.exemption_threshold else None,
        exemption_threshold_currency=regulation.exemption_threshold_currency,
        nft_treatment=regulation.nft_treatment,
        residency_rule=regulation.residency_rule,
        defi_reporting=regulation.defi_reporting,
        penalties_max=regulation.penalties_max,
        notes=regulation.notes,
        updated_at=str(regulation.updated_at) if regulation.updated_at else None,
        source_url=regulation.source_url,
        data_quality=quality,
        data_sources=sources if sources else None
    )
