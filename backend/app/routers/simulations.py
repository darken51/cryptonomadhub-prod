from fastapi import APIRouter, Depends, HTTPException, Request, Response as FastAPIResponse
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.simulation import Simulation
from app.routers.auth import get_current_user
from app.services.tax_simulator import TaxSimulator
from app.services.pdf_generator import PDFGenerator
from app.middleware import limiter, get_rate_limit
from app.dependencies.license_check import require_simulation, require_pdf_export
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
import re

router = APIRouter(prefix="/simulations", tags=["Simulations"])


class SimulationRequest(BaseModel):
    current_country: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 country code")
    target_country: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 country code")
    short_term_gains: float = Field(default=0, ge=0, le=1_000_000_000, description="Short-term capital gains (USD)")
    long_term_gains: float = Field(default=0, ge=0, le=1_000_000_000, description="Long-term capital gains (USD)")

    @field_validator('current_country', 'target_country')
    @classmethod
    def validate_country_code(cls, v: str) -> str:
        """Validate country code format (uppercase, 2 letters)"""
        v = v.upper()
        if not re.match(r'^[A-Z]{2}$', v):
            raise ValueError('Country code must be 2 uppercase letters (ISO 3166-1 alpha-2)')
        return v

    @field_validator('target_country')
    @classmethod
    def validate_different_countries(cls, v: str, info) -> str:
        """Ensure target country is different from current country"""
        if 'current_country' in info.data and v.upper() == info.data['current_country'].upper():
            raise ValueError('Target country must be different from current country')
        return v


class SimulationResponse(BaseModel):
    id: int
    current_country: str
    target_country: str
    current_tax: float
    target_tax: float
    savings: float
    savings_percent: float
    considerations: List[str]
    risks: List[str]
    timeline: str
    explanation: dict  # Explain Decision feature


class CompareRequest(BaseModel):
    current_country: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 country code")
    target_countries: List[str] = Field(..., min_length=2, max_length=5, description="List of 2-5 country codes")
    short_term_gains: float = Field(default=0, ge=0, le=1_000_000_000, description="Short-term capital gains (USD)")
    long_term_gains: float = Field(default=0, ge=0, le=1_000_000_000, description="Long-term capital gains (USD)")

    @field_validator('current_country')
    @classmethod
    def validate_current_country(cls, v: str) -> str:
        """Validate country code format (uppercase, 2 letters)"""
        v = v.upper()
        if not re.match(r'^[A-Z]{2}$', v):
            raise ValueError('Country code must be 2 uppercase letters (ISO 3166-1 alpha-2)')
        return v

    @field_validator('target_countries')
    @classmethod
    def validate_target_countries(cls, v: List[str]) -> List[str]:
        """Validate target countries list"""
        # Normalize to uppercase
        v = [country.upper() for country in v]

        # Check format
        for country in v:
            if not re.match(r'^[A-Z]{2}$', country):
                raise ValueError(f'Invalid country code: {country}. Must be 2 uppercase letters')

        # Check for duplicates
        if len(v) != len(set(v)):
            raise ValueError('Duplicate countries in target_countries list')

        return v


class CountryComparison(BaseModel):
    country_code: str
    country_name: str
    flag_emoji: Optional[str] = None
    tax_amount: float
    savings: float
    savings_percent: float
    effective_rate: float
    # Tax breakdown
    short_term_tax: Optional[float] = None
    long_term_tax: Optional[float] = None
    short_term_rate: Optional[float] = None
    long_term_rate: Optional[float] = None
    # AI Analysis
    ai_analysis: Optional[dict] = None
    # Tax metadata
    holding_period_months: Optional[int] = None
    is_flat_tax: Optional[bool] = None
    is_progressive: Optional[bool] = None
    is_territorial: Optional[bool] = None
    exemption_threshold: Optional[float] = None
    exemption_threshold_currency: Optional[str] = None
    crypto_legal_status: Optional[str] = None
    source_url: Optional[str] = None
    crypto_notes: Optional[str] = None


class CompareResponse(BaseModel):
    current_country: str
    current_country_name: str
    current_country_flag: Optional[str] = None
    current_tax: float
    current_effective_rate: float
    current_short_term_tax: float
    current_long_term_tax: float
    current_short_term_rate: float
    current_long_term_rate: float
    # Current country metadata
    current_ai_analysis: Optional[dict] = None
    current_holding_period_months: Optional[int] = None
    current_is_flat_tax: Optional[bool] = None
    current_is_progressive: Optional[bool] = None
    current_is_territorial: Optional[bool] = None
    current_exemption_threshold: Optional[float] = None
    current_exemption_threshold_currency: Optional[str] = None
    current_crypto_notes: Optional[str] = None
    current_source_url: Optional[str] = None
    # Comparison data
    comparisons: List[CountryComparison]
    short_term_gains: float
    long_term_gains: float
    total_gains: float
    recommendations: List[str] = []


@router.post("/residency", response_model=SimulationResponse)
@limiter.limit(get_rate_limit("simulations"))
async def simulate_residency_change(
    request: Request,
    response: FastAPIResponse,
    simulation_request: SimulationRequest,
    current_user: User = Depends(get_current_user),
    license_check = Depends(require_simulation),
    db: Session = Depends(get_db)
):
    """✅ PHASE 3.1: Simulate tax impact of residency change between two countries.

    Calculates crypto capital gains tax liability in current vs target jurisdiction,
    providing savings estimates, timeline, risks, and AI-powered explanations.

    Args:
        simulation_request (SimulationRequest): Simulation parameters including:
            - current_country (str): ISO 3166-1 alpha-2 code (e.g., "US", "FR")
            - target_country (str): ISO 3166-1 alpha-2 code
            - short_term_gains (float): Short-term capital gains in USD (0-1B)
            - long_term_gains (float): Long-term capital gains in USD (0-1B)
        current_user (User): Authenticated user from JWT token
        db (Session): Database session

    Returns:
        SimulationResponse: Tax comparison with fields:
            - current_tax (float): Tax in current country (USD)
            - target_tax (float): Tax in target country (USD)
            - savings (float): Absolute savings (USD)
            - savings_percent (float): Percentage savings
            - considerations (List[str]): Important factors to consider
            - risks (List[str]): Potential risks and drawbacks
            - timeline (str): Estimated timeline for relocation
            - explanation (dict): AI-generated explanation of calculation

    Raises:
        HTTPException: 404 if country not found in database
        HTTPException: 400 if validation fails

    Example:
        ```json
        POST /simulations/residency
        {
            "current_country": "US",
            "target_country": "PT",
            "short_term_gains": 50000,
            "long_term_gains": 100000
        }
        ```

    ⚠️ DISCLAIMER: This is NOT financial or legal advice.
    Results may contain errors. Consult licensed tax and legal professionals.
    """

    # Run simulation
    simulator = TaxSimulator(db)

    try:
        result, explanation = await simulator.simulate_residency_change(
            user_id=current_user.id,
            current_country=simulation_request.current_country,
            target_country=simulation_request.target_country,
            short_term_gains=simulation_request.short_term_gains,
            long_term_gains=simulation_request.long_term_gains
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Find saved simulation ID
    simulation = db.query(Simulation).filter(
        Simulation.user_id == current_user.id
    ).order_by(Simulation.created_at.desc()).first()

    return SimulationResponse(
        id=simulation.id if simulation else 0,
        current_country=result.current_country,
        target_country=result.target_country,
        current_tax=result.current_tax,
        target_tax=result.target_tax,
        savings=result.savings,
        savings_percent=result.savings_percent,
        considerations=result.considerations,
        risks=result.risks,
        timeline=result.timeline,
        explanation={
            "decision": explanation.decision,
            "reasoning": explanation.reasoning,
            "rules_applied": explanation.rules_applied,
            "assumptions": explanation.assumptions,
            "confidence": explanation.confidence,
            "sources": explanation.sources
        }
    )


@router.post("/compare", response_model=CompareResponse)
@limiter.limit(get_rate_limit("simulations"))
async def compare_countries(
    request: Request,
    response: FastAPIResponse,
    compare_request: CompareRequest,
    current_user: User = Depends(get_current_user),
    license_check = Depends(require_simulation),
    db: Session = Depends(get_db)
):
    """
    Compare tax impact across multiple countries

    ⚠️ DISCLAIMER: This is NOT financial or legal advice.
    Results may contain errors. Consult licensed professionals.
    """

    # Validation
    if len(compare_request.target_countries) < 2:
        raise HTTPException(status_code=400, detail="At least 2 target countries required")

    # Check tier-based country limit
    from app.services.license_service import LicenseService
    from app.models.license import LicenseTier

    license_service = LicenseService(db)
    license = license_service.get_user_license(current_user.id)

    max_countries = {
        LicenseTier.FREE: 2,
        LicenseTier.STARTER: 5,
        LicenseTier.PRO: 999,  # Unlimited
        LicenseTier.ENTERPRISE: 999
    }

    tier_limit = max_countries.get(license.tier, 2)

    if len(compare_request.target_countries) > tier_limit:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "tier_limit_exceeded",
                "message": f"Your {license.tier.value} plan allows comparing up to {tier_limit} countries. Upgrade to compare more.",
                "current_tier": license.tier.value,
                "tier_limit": tier_limit,
                "requested": len(compare_request.target_countries),
                "upgrade_url": "/pricing"
            }
        )

    # Calculate current country tax
    from app.models.regulation import Regulation
    current_reg = db.query(Regulation).filter(
        Regulation.country_code == compare_request.current_country
    ).first()

    if not current_reg:
        raise HTTPException(status_code=404, detail=f"Country {compare_request.current_country} not found")

    # Calculate current tax using same logic as TaxSimulator
    # Use crypto-specific rates if available, otherwise fall back to CGT rates
    current_short_rate = float(current_reg.crypto_short_rate if current_reg.crypto_short_rate is not None else current_reg.cgt_short_rate)
    current_long_rate = float(current_reg.crypto_long_rate if current_reg.crypto_long_rate is not None else current_reg.cgt_long_rate)

    current_tax_short = compare_request.short_term_gains * current_short_rate
    current_tax_long = compare_request.long_term_gains * current_long_rate
    current_tax = current_tax_short + current_tax_long

    # Calculate current effective rate
    total_gains = compare_request.short_term_gains + compare_request.long_term_gains
    current_effective_rate = (current_tax / total_gains * 100) if total_gains > 0 else 0

    # Get AI analysis for current country
    current_ai_analysis = None
    if hasattr(current_reg, 'ai_analysis') and current_reg.ai_analysis:
        current_ai_analysis = {
            "crypto_score": current_reg.ai_analysis.get("crypto_score"),
            "nomad_score": current_reg.ai_analysis.get("nomad_score"),
            "overall_score": current_reg.ai_analysis.get("overall_score")
        }

    # Calculate tax for each target country
    comparisons = []
    for country_code in compare_request.target_countries:
        try:
            target_reg = db.query(Regulation).filter(
                Regulation.country_code == country_code
            ).first()

            if not target_reg:
                continue  # Skip invalid countries

            # Skip countries where crypto is banned
            if target_reg.crypto_legal_status == 'banned':
                continue  # Silently skip banned countries from comparison

            # Use crypto-specific rates if available, otherwise fall back to CGT rates
            target_short_rate = float(target_reg.crypto_short_rate if target_reg.crypto_short_rate is not None else target_reg.cgt_short_rate)
            target_long_rate = float(target_reg.crypto_long_rate if target_reg.crypto_long_rate is not None else target_reg.cgt_long_rate)

            # Calculate target tax
            target_tax_short = compare_request.short_term_gains * target_short_rate
            target_tax_long = compare_request.long_term_gains * target_long_rate
            target_tax = target_tax_short + target_tax_long

            savings = current_tax - target_tax
            savings_percent = (savings / current_tax * 100) if current_tax > 0 else 0
            total_gains = compare_request.short_term_gains + compare_request.long_term_gains
            effective_rate = (target_tax / total_gains * 100) if total_gains > 0 else 0

            # Get AI analysis
            ai_analysis = None
            if hasattr(target_reg, 'ai_analysis') and target_reg.ai_analysis:
                ai_analysis = {
                    "crypto_score": target_reg.ai_analysis.get("crypto_score"),
                    "nomad_score": target_reg.ai_analysis.get("nomad_score"),
                    "overall_score": target_reg.ai_analysis.get("overall_score")
                }

            comparisons.append(CountryComparison(
                country_code=country_code,
                country_name=target_reg.country_name,
                flag_emoji=target_reg.flag_emoji,
                tax_amount=target_tax,
                savings=savings,
                savings_percent=savings_percent,
                effective_rate=effective_rate,
                # Tax breakdown
                short_term_tax=target_tax_short,
                long_term_tax=target_tax_long,
                short_term_rate=target_short_rate * 100,  # Convert to percentage
                long_term_rate=target_long_rate * 100,    # Convert to percentage
                # AI Analysis
                ai_analysis=ai_analysis,
                # Tax metadata
                holding_period_months=target_reg.holding_period_months,
                is_flat_tax=target_reg.is_flat_tax,
                is_progressive=target_reg.is_progressive,
                is_territorial=target_reg.is_territorial,
                exemption_threshold=target_reg.exemption_threshold,
                exemption_threshold_currency=target_reg.exemption_threshold_currency,
                crypto_legal_status=target_reg.crypto_legal_status,
                source_url=target_reg.source_url,
                crypto_notes=target_reg.crypto_notes
            ))
        except Exception as e:
            print(f"Error processing {country_code}: {e}")
            continue

    # Sort by savings (highest savings first)
    comparisons.sort(key=lambda x: x.savings, reverse=True)

    # Generate informational notes (not recommendations)
    recommendations = []

    # General disclaimer
    if len(comparisons) > 0:
        recommendations.append("ℹ️ Data provided for informational purposes only. Tax regulations change frequently and vary based on individual circumstances. This is not financial, tax, or legal advice.")
        recommendations.append("⚠️ Always consult licensed tax professionals and legal advisors in both your current and target jurisdictions before making any residency decisions.")

    return CompareResponse(
        current_country=compare_request.current_country,
        current_country_name=current_reg.country_name,
        current_country_flag=current_reg.flag_emoji,
        current_tax=current_tax,
        current_effective_rate=current_effective_rate,
        current_short_term_tax=current_tax_short,
        current_long_term_tax=current_tax_long,
        current_short_term_rate=current_short_rate * 100,  # Convert to percentage
        current_long_term_rate=current_long_rate * 100,    # Convert to percentage
        # Current country metadata
        current_ai_analysis=current_ai_analysis,
        current_holding_period_months=current_reg.holding_period_months,
        current_is_flat_tax=current_reg.is_flat_tax,
        current_is_progressive=current_reg.is_progressive,
        current_is_territorial=current_reg.is_territorial,
        current_exemption_threshold=current_reg.exemption_threshold,
        current_exemption_threshold_currency=current_reg.exemption_threshold_currency,
        current_crypto_notes=current_reg.crypto_notes,
        current_source_url=current_reg.source_url,
        # Comparison data
        comparisons=comparisons,
        short_term_gains=compare_request.short_term_gains,
        long_term_gains=compare_request.long_term_gains,
        total_gains=compare_request.short_term_gains + compare_request.long_term_gains,
        recommendations=recommendations
    )


@router.get("/history")
@limiter.limit(get_rate_limit("read_only"))
async def get_simulation_history(
    request: Request,
    response: FastAPIResponse,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's simulation history"""

    simulations = db.query(Simulation).filter(
        Simulation.user_id == current_user.id
    ).order_by(Simulation.created_at.desc()).limit(50).all()

    return {
        "simulations": [sim.to_dict() for sim in simulations],
        "count": len(simulations)
    }


@router.get("/{simulation_id}")
@limiter.limit(get_rate_limit("read_only"))
async def get_simulation(
    request: Request,
    response: FastAPIResponse,
    simulation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific simulation by ID"""

    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.user_id == current_user.id
    ).first()

    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    return simulation.to_dict()


@router.get("/{simulation_id}/export/pdf")
@limiter.limit(get_rate_limit("simulations"))
async def export_simulation_pdf(
    request: Request,
    response: FastAPIResponse,
    simulation_id: int,
    current_user: User = Depends(get_current_user),
    license_check = Depends(require_pdf_export),
    db: Session = Depends(get_db)
):
    """
    Export simulation as PDF report

    Returns a professional PDF report with:
    - Tax comparison
    - Regulation details
    - Considerations & risks
    - Legal disclaimers
    """

    # Get simulation
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.user_id == current_user.id
    ).first()

    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    # Prepare simulation data
    simulation_data = simulation.to_dict()

    # User info
    user_info = {
        "email": current_user.email,
        "name": current_user.email.split('@')[0]  # Use email prefix as name
    }

    try:
        # Generate HTML
        html_content = PDFGenerator.generate_simulation_report(
            simulation_data=simulation_data,
            user_info=user_info
        )

        # Convert to PDF
        pdf_bytes = await PDFGenerator.html_to_pdf(html_content)

        # Generate filename
        filename = f"tax_simulation_{simulation.current_country}_to_{simulation.target_country}_{simulation_id}.pdf"

        # Return PDF
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF: {str(e)}"
        )
