from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.simulation import Simulation
from app.routers.auth import get_current_user
from app.services.tax_simulator import TaxSimulator
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/simulations", tags=["Simulations"])


class SimulationRequest(BaseModel):
    target_country: str
    short_term_gains: float = 0
    long_term_gains: float = 0


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


@router.post("/residency", response_model=SimulationResponse)
async def simulate_residency_change(
    request: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulate tax impact of residency change

    ⚠️ DISCLAIMER: This is NOT financial or legal advice.
    Results may contain errors. Consult licensed professionals.
    """

    # Get user's current country
    current_country = current_user.current_country or "US"

    # Run simulation
    simulator = TaxSimulator(db)

    try:
        result, explanation = await simulator.simulate_residency_change(
            user_id=current_user.id,
            current_country=current_country,
            target_country=request.target_country,
            short_term_gains=request.short_term_gains,
            long_term_gains=request.long_term_gains
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


@router.get("/history")
async def get_simulation_history(
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
async def get_simulation(
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
