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


class CompareResponse(BaseModel):
    current_country: str
    current_tax: float
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
    db: Session = Depends(get_db)
):
    """
    Simulate tax impact of residency change

    ⚠️ DISCLAIMER: This is NOT financial or legal advice.
    Results may contain errors. Consult licensed professionals.
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
    if len(compare_request.target_countries) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 target countries allowed")

    # Calculate current country tax
    from app.models.regulation import Regulation
    current_reg = db.query(Regulation).filter(
        Regulation.country_code == compare_request.current_country
    ).first()

    if not current_reg:
        raise HTTPException(status_code=404, detail=f"Country {compare_request.current_country} not found")

    # Calculate current tax using same logic as TaxSimulator
    current_tax_short = compare_request.short_term_gains * float(current_reg.cgt_short_rate)
    current_tax_long = compare_request.long_term_gains * float(current_reg.cgt_long_rate)
    current_tax = current_tax_short + current_tax_long

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

            # Calculate target tax
            target_tax_short = compare_request.short_term_gains * float(target_reg.cgt_short_rate)
            target_tax_long = compare_request.long_term_gains * float(target_reg.cgt_long_rate)
            target_tax = target_tax_short + target_tax_long

            savings = current_tax - target_tax
            savings_percent = (savings / current_tax * 100) if current_tax > 0 else 0
            total_gains = compare_request.short_term_gains + compare_request.long_term_gains
            effective_rate = (target_tax / total_gains * 100) if total_gains > 0 else 0

            comparisons.append(CountryComparison(
                country_code=country_code,
                country_name=target_reg.country_name,
                flag_emoji=target_reg.flag_emoji,
                tax_amount=target_tax,
                savings=savings,
                savings_percent=savings_percent,
                effective_rate=effective_rate
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
        current_tax=current_tax,
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
