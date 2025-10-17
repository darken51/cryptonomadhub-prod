from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.regulation import Regulation
from app.models.country_analysis import CountryAnalysis
from app.services.country_analysis_ai import CountryAnalysisAI
from pydantic import BaseModel
from typing import List, Optional
import logging

router = APIRouter(prefix="/regulations", tags=["Regulations"])
logger = logging.getLogger(__name__)


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
    crypto_legal_status: Optional[str] = None  # 'legal', 'banned', 'restricted', 'unclear'
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

    # AI Analysis (optional, included when include_analysis=true)
    ai_analysis: Optional[dict] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[RegulationResponse])
async def get_all_regulations(
    db: Session = Depends(get_db),
    crypto_only: bool = False,
    reliable_only: bool = False,
    include_analysis: bool = False
):
    """
    Get all country tax regulations

    Args:
        crypto_only: If True, only return countries with crypto-specific data
        reliable_only: If True, only return countries with verified CGT data from trusted sources
        include_analysis: If True, include AI analysis scores (crypto_score, nomad_score, overall_score)

    Returns:
        List of all regulations with optional AI analysis scores
    """
    query = db.query(Regulation)

    if crypto_only:
        query = query.filter(Regulation.crypto_short_rate.isnot(None))

    regulations = query.all()

    # Get all analyses if requested
    analyses_dict = {}
    if include_analysis:
        analyses = db.query(CountryAnalysis).all()
        analyses_dict = {a.country_code: a for a in analyses}

    # Convert to response format
    result = []
    for reg in regulations:
        quality, sources = extract_data_quality(reg)

        # Skip if reliable_only and quality is low/unknown
        if reliable_only and quality in ['low', 'unknown']:
            continue

        response_data = {
            "country_code": reg.country_code,
            "country_name": reg.country_name,
            "flag_emoji": reg.flag_emoji,
            "cgt_short_rate": float(reg.cgt_short_rate),
            "cgt_long_rate": float(reg.cgt_long_rate),
            "crypto_short_rate": float(reg.crypto_short_rate) if reg.crypto_short_rate else None,
            "crypto_long_rate": float(reg.crypto_long_rate) if reg.crypto_long_rate else None,
            "crypto_notes": reg.crypto_notes,
            "crypto_legal_status": reg.crypto_legal_status,
            "staking_rate": float(reg.staking_rate) if reg.staking_rate else None,
            "mining_rate": float(reg.mining_rate) if reg.mining_rate else None,
            "holding_period_months": reg.holding_period_months,
            "is_flat_tax": bool(reg.is_flat_tax) if reg.is_flat_tax is not None else None,
            "is_progressive": bool(reg.is_progressive) if reg.is_progressive is not None else None,
            "is_territorial": bool(reg.is_territorial) if reg.is_territorial is not None else None,
            "crypto_specific": bool(reg.crypto_specific) if reg.crypto_specific is not None else None,
            "long_term_discount_pct": float(reg.long_term_discount_pct) if reg.long_term_discount_pct else None,
            "exemption_threshold": float(reg.exemption_threshold) if reg.exemption_threshold else None,
            "exemption_threshold_currency": reg.exemption_threshold_currency,
            "nft_treatment": reg.nft_treatment,
            "residency_rule": reg.residency_rule,
            "defi_reporting": reg.defi_reporting,
            "penalties_max": reg.penalties_max,
            "notes": reg.notes,
            "updated_at": str(reg.updated_at) if reg.updated_at else None,
            "source_url": reg.source_url,
            "data_quality": quality,
            "data_sources": sources if sources else None
        }

        # Add AI analysis if requested
        if include_analysis and reg.country_code in analyses_dict:
            analysis = analyses_dict[reg.country_code]
            response_data["ai_analysis"] = analysis.to_dict()

        result.append(RegulationResponse(**response_data))

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


# ============================================
# COUNTRY AI ANALYSIS ENDPOINTS
# ============================================

class CountryAnalysisResponse(BaseModel):
    """AI-generated country analysis"""
    country_code: str
    crypto_score: int
    nomad_score: int
    overall_score: int
    crypto_analysis: str
    nomad_analysis: str
    key_advantages: List[str]
    key_disadvantages: List[str]
    best_for: List[str]
    crypto_score_breakdown: dict
    nomad_score_breakdown: dict
    generated_at: str
    expires_at: str
    confidence: float
    generation_duration_ms: Optional[int] = None

    class Config:
        from_attributes = True


@router.get("/{country_code}/analysis", response_model=CountryAnalysisResponse)
async def get_country_analysis(
    country_code: str,
    db: Session = Depends(get_db)
):
    """
    Get AI-generated analysis for a country (crypto + nomad scores)

    Returns cached analysis if available and not expired (30 days).
    Auto-generates analysis if not found or expired.

    No manual refresh button - analysis auto-updates when expired.
    """
    try:
        country_code = country_code.upper()

        # Check if country exists
        regulation = db.query(Regulation).filter_by(country_code=country_code).first()
        if not regulation:
            raise HTTPException(status_code=404, detail=f"Country {country_code} not found")

        # Check for existing analysis
        analysis = db.query(CountryAnalysis).filter_by(country_code=country_code).first()

        # Check if expired or doesn't exist
        if not analysis or analysis.is_expired:
            logger.info(f"Generating analysis for {country_code} (expired or missing)")

            # Generate new analysis
            ai_service = CountryAnalysisAI()
            analysis_data = await ai_service.analyze_country(db, country_code, force_refresh=True)

            return CountryAnalysisResponse(**analysis_data)

        # Return cached analysis
        logger.info(f"Returning cached analysis for {country_code} (expires in {analysis.days_until_expiry} days)")
        return CountryAnalysisResponse(**analysis.to_dict())

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting analysis for {country_code}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(e)}")


async def _batch_analyze_background(country_codes: List[str], db: Session):
    """Background task for batch analysis"""
    ai_service = CountryAnalysisAI()
    results = await ai_service.batch_analyze_countries(db, country_codes, force_refresh=True)
    logger.info(f"Batch analysis complete: {len(results)} countries processed")
    return results


@router.post("/batch-analyze")
async def batch_analyze_countries(
    country_codes: List[str],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Analyze multiple countries in batch

    Runs in background to avoid timeout.
    Use for initial population or bulk refresh.

    Example:
    ```json
    {
        "country_codes": ["US", "FR", "PT", "AE", "SG"]
    }
    ```
    """
    # Verify countries exist
    existing_countries = db.query(Regulation.country_code).filter(
        Regulation.country_code.in_([c.upper() for c in country_codes])
    ).all()
    existing_codes = [c[0] for c in existing_countries]

    invalid_codes = [c for c in country_codes if c.upper() not in existing_codes]
    if invalid_codes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid country codes: {', '.join(invalid_codes)}"
        )

    # Start background task
    background_tasks.add_task(_batch_analyze_background, [c.upper() for c in country_codes], db)

    return {
        "message": f"Started batch analysis for {len(country_codes)} countries",
        "countries": [c.upper() for c in country_codes],
        "status": "processing"
    }


