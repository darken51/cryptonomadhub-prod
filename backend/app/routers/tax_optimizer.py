"""
Tax Optimizer Endpoints

API routes for tax optimization and tax-loss harvesting opportunities.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User
from app.models.cost_basis import CostBasisLot
from app.models.tax_opportunity import (
    TaxOpportunity,
    TaxOptimizationSettings,
    OpportunityType,
    OpportunityStatus
)
from app.routers.auth import get_current_user
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tax-optimizer", tags=["Tax Optimizer"])


# Pydantic models
class OpportunityResponse(BaseModel):
    id: int
    opportunity_type: str
    status: str
    token: str
    chain: str
    current_amount: float
    current_value_usd: float
    unrealized_gain_loss: float
    unrealized_gain_loss_percent: float
    potential_savings: float
    recommended_action: str
    action_description: str
    deadline: Optional[str]
    confidence_score: float
    risk_level: str
    created_at: str


class AnalysisResponse(BaseModel):
    total_opportunities: int
    potential_tax_savings: float
    opportunities: List[OpportunityResponse]
    portfolio_summary: dict
    recommendations: List[str]


class ExecuteOpportunityRequest(BaseModel):
    opportunity_id: int = Field(..., gt=0, description="Opportunity ID must be positive")
    amount: Optional[float] = Field(None, gt=0, le=1_000_000_000, description="Amount in tokens")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")


@router.get("/analyze", response_model=AnalysisResponse)
async def analyze_tax_optimization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze user's portfolio for tax optimization opportunities

    Identifies:
    - Tax-loss harvesting opportunities
    - Assets close to long-term capital gains threshold
    - Optimal timing for sales
    - Wash sale risk
    """

    # Get user's cost basis lots
    lots = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == current_user.id,
        CostBasisLot.remaining_amount > 0
    ).all()

    if not lots:
        return AnalysisResponse(
            total_opportunities=0,
            potential_tax_savings=0.0,
            opportunities=[],
            portfolio_summary={
                "total_lots": 0,
                "total_value_usd": 0.0,
                "total_unrealized_gain_loss": 0.0
            },
            recommendations=["Add cost basis lots to start tracking opportunities"]
        )

    # Get or create settings
    settings = db.query(TaxOptimizationSettings).filter(
        TaxOptimizationSettings.user_id == current_user.id
    ).first()

    if not settings:
        settings = TaxOptimizationSettings(
            user_id=current_user.id,
            enable_tax_loss_harvesting=True,
            enable_timing_optimization=True,
            min_opportunity_savings=100.0
        )
        db.add(settings)
        db.commit()

    # Calculate opportunities
    opportunities = []
    total_value = 0.0
    total_unrealized_gl = 0.0

    # Tax rates (mock - should come from user settings or regulations)
    short_term_rate = settings.capital_gains_rate_short or 0.37  # 37% federal
    long_term_rate = settings.capital_gains_rate_long or 0.20  # 20% federal

    current_time = datetime.utcnow()
    tax_year_end = datetime(current_time.year, 12, 31, 23, 59, 59)
    days_until_year_end = (tax_year_end - current_time).days

    # Get price service for real-time prices
    from app.services.price_service import PriceService
    price_service = PriceService()

    # Cache prices per token to avoid repeated API calls
    price_cache = {}

    for lot in lots:
        # Get current price (use cache to avoid repeated calls)
        if lot.token not in price_cache:
            current_price_decimal = price_service.get_current_price(lot.token)
            if current_price_decimal:
                price_cache[lot.token] = float(current_price_decimal)
            else:
                # Fallback to acquisition price if unavailable
                price_cache[lot.token] = lot.acquisition_price_usd

        current_price = price_cache[lot.token]
        current_value = lot.remaining_amount * current_price
        cost_basis = lot.remaining_amount * lot.acquisition_price_usd
        unrealized_gl = current_value - cost_basis
        unrealized_gl_percent = (unrealized_gl / cost_basis * 100) if cost_basis > 0 else 0

        total_value += current_value
        total_unrealized_gl += unrealized_gl

        # Check for tax-loss harvesting opportunity
        if unrealized_gl < 0 and settings.enable_tax_loss_harvesting:
            # Loss exists - can harvest
            potential_savings = abs(unrealized_gl) * short_term_rate

            if potential_savings >= settings.min_opportunity_savings:
                # Check if opportunity already exists
                existing = db.query(TaxOpportunity).filter(
                    TaxOpportunity.user_id == current_user.id,
                    TaxOpportunity.token == lot.token,
                    TaxOpportunity.chain == lot.chain,
                    TaxOpportunity.status == OpportunityStatus.ACTIVE,
                    TaxOpportunity.opportunity_type == OpportunityType.TAX_LOSS_HARVEST
                ).first()

                if not existing:
                    opp = TaxOpportunity(
                        user_id=current_user.id,
                        opportunity_type=OpportunityType.TAX_LOSS_HARVEST,
                        status=OpportunityStatus.ACTIVE,
                        token=lot.token,
                        token_address=lot.token_address,
                        chain=lot.chain,
                        current_amount=lot.remaining_amount,
                        current_price_usd=current_price,
                        cost_basis_per_unit=lot.acquisition_price_usd,
                        current_value_usd=current_value,
                        unrealized_gain_loss=unrealized_gl,
                        unrealized_gain_loss_percent=unrealized_gl_percent,
                        potential_savings=potential_savings,
                        tax_year=current_time.year,
                        recommended_action=f"Sell {lot.remaining_amount:.4f} {lot.token} to harvest ${abs(unrealized_gl):,.2f} loss",
                        action_description=(
                            f"You have an unrealized loss of ${abs(unrealized_gl):,.2f} ({unrealized_gl_percent:.1f}%) on {lot.token}. "
                            f"By selling now, you can offset up to ${potential_savings:,.2f} in gains from other assets. "
                            f"You can repurchase after 30 days to avoid wash sale rules."
                        ),
                        deadline=tax_year_end,
                        confidence_score=0.9,
                        risk_level="low",
                        related_lot_ids=str(lot.id),
                        expires_at=tax_year_end
                    )
                    db.add(opp)
                    opportunities.append(opp)

        # Check for long-term threshold opportunity
        holding_period_days = (current_time - lot.acquisition_date).days
        if holding_period_days < 365 and settings.enable_timing_optimization:
            days_to_long_term = 365 - holding_period_days

            # Only show if close to threshold (within 60 days)
            if days_to_long_term <= 60 and unrealized_gl > 0:
                # Calculate savings from waiting
                short_term_tax = unrealized_gl * short_term_rate
                long_term_tax = unrealized_gl * long_term_rate
                savings_by_waiting = short_term_tax - long_term_tax

                if savings_by_waiting >= settings.min_opportunity_savings:
                    existing = db.query(TaxOpportunity).filter(
                        TaxOpportunity.user_id == current_user.id,
                        TaxOpportunity.token == lot.token,
                        TaxOpportunity.chain == lot.chain,
                        TaxOpportunity.status == OpportunityStatus.ACTIVE,
                        TaxOpportunity.opportunity_type == OpportunityType.LONG_TERM_WAIT
                    ).first()

                    if not existing:
                        long_term_date = lot.acquisition_date + timedelta(days=365)
                        opp = TaxOpportunity(
                            user_id=current_user.id,
                            opportunity_type=OpportunityType.LONG_TERM_WAIT,
                            status=OpportunityStatus.ACTIVE,
                            token=lot.token,
                            token_address=lot.token_address,
                            chain=lot.chain,
                            current_amount=lot.remaining_amount,
                            current_price_usd=current_price,
                            cost_basis_per_unit=lot.acquisition_price_usd,
                            current_value_usd=current_value,
                            unrealized_gain_loss=unrealized_gl,
                            unrealized_gain_loss_percent=unrealized_gl_percent,
                            potential_savings=savings_by_waiting,
                            tax_year=current_time.year,
                            recommended_action=f"Wait {days_to_long_term} days before selling {lot.token}",
                            action_description=(
                                f"Your {lot.token} will qualify for long-term capital gains in {days_to_long_term} days "
                                f"(on {long_term_date.strftime('%Y-%m-%d')}). By waiting, you'll save ${savings_by_waiting:,.2f} "
                                f"in taxes ({short_term_rate*100:.0f}% vs {long_term_rate*100:.0f}% rate)."
                            ),
                            deadline=long_term_date,
                            confidence_score=0.85,
                            risk_level="low",
                            related_lot_ids=str(lot.id),
                            expires_at=long_term_date + timedelta(days=7)
                        )
                        db.add(opp)
                        opportunities.append(opp)

    db.commit()

    # Get all active opportunities
    all_opportunities = db.query(TaxOpportunity).filter(
        TaxOpportunity.user_id == current_user.id,
        TaxOpportunity.status == OpportunityStatus.ACTIVE,
        TaxOpportunity.expires_at > current_time
    ).order_by(desc(TaxOpportunity.potential_savings)).all()

    opportunities_list = []
    total_potential_savings = 0.0

    for opp in all_opportunities:
        opportunities_list.append(OpportunityResponse(
            id=opp.id,
            opportunity_type=opp.opportunity_type.value,
            status=opp.status.value,
            token=opp.token,
            chain=opp.chain,
            current_amount=opp.current_amount,
            current_value_usd=opp.current_value_usd,
            unrealized_gain_loss=opp.unrealized_gain_loss,
            unrealized_gain_loss_percent=opp.unrealized_gain_loss_percent,
            potential_savings=opp.potential_savings,
            recommended_action=opp.recommended_action,
            action_description=opp.action_description,
            deadline=opp.deadline.isoformat() if opp.deadline else None,
            confidence_score=opp.confidence_score,
            risk_level=opp.risk_level,
            created_at=opp.created_at.isoformat()
        ))
        total_potential_savings += opp.potential_savings

    # Generate recommendations
    recommendations = []
    if total_potential_savings > 1000:
        recommendations.append(f"You could save ${total_potential_savings:,.2f} in taxes by executing these opportunities")
    if days_until_year_end < 60:
        recommendations.append(f"Only {days_until_year_end} days left in the tax year - act soon to harvest losses")
    if len(opportunities_list) == 0:
        recommendations.append("No immediate tax optimization opportunities found")
        recommendations.append("Continue monitoring - opportunities appear as market conditions change")

    return AnalysisResponse(
        total_opportunities=len(opportunities_list),
        potential_tax_savings=total_potential_savings,
        opportunities=opportunities_list,
        portfolio_summary={
            "total_lots": len(lots),
            "total_value_usd": total_value,
            "total_unrealized_gain_loss": total_unrealized_gl
        },
        recommendations=recommendations
    )


@router.get("/opportunities", response_model=List[OpportunityResponse])
async def get_tax_opportunities(
    opportunity_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tax optimization opportunities for user"""
    query = db.query(TaxOpportunity).filter(
        TaxOpportunity.user_id == current_user.id
    )

    if opportunity_type:
        try:
            opp_type = OpportunityType(opportunity_type.lower())
            query = query.filter(TaxOpportunity.opportunity_type == opp_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid opportunity_type")

    if status:
        try:
            opp_status = OpportunityStatus(status.lower())
            query = query.filter(TaxOpportunity.status == opp_status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
    else:
        # Default: only active opportunities
        query = query.filter(TaxOpportunity.status == OpportunityStatus.ACTIVE)

    opportunities = query.order_by(desc(TaxOpportunity.potential_savings)).all()

    return [
        OpportunityResponse(
            id=opp.id,
            opportunity_type=opp.opportunity_type.value,
            status=opp.status.value,
            token=opp.token,
            chain=opp.chain,
            current_amount=opp.current_amount,
            current_value_usd=opp.current_value_usd,
            unrealized_gain_loss=opp.unrealized_gain_loss,
            unrealized_gain_loss_percent=opp.unrealized_gain_loss_percent,
            potential_savings=opp.potential_savings,
            recommended_action=opp.recommended_action,
            action_description=opp.action_description,
            deadline=opp.deadline.isoformat() if opp.deadline else None,
            confidence_score=opp.confidence_score,
            risk_level=opp.risk_level,
            created_at=opp.created_at.isoformat()
        )
        for opp in opportunities
    ]


@router.post("/opportunities/{opportunity_id}/dismiss")
async def dismiss_opportunity(
    opportunity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dismiss a tax opportunity"""
    opp = db.query(TaxOpportunity).filter(
        TaxOpportunity.id == opportunity_id,
        TaxOpportunity.user_id == current_user.id
    ).first()

    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    opp.status = OpportunityStatus.DISMISSED
    db.commit()

    return {"message": "Opportunity dismissed"}


@router.get("/settings")
async def get_tax_optimizer_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's tax optimization settings"""
    settings = db.query(TaxOptimizationSettings).filter(
        TaxOptimizationSettings.user_id == current_user.id
    ).first()

    if not settings:
        settings = TaxOptimizationSettings(
            user_id=current_user.id,
            enable_tax_loss_harvesting=True,
            enable_timing_optimization=True,
            min_opportunity_savings=100.0
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return {
        "enable_tax_loss_harvesting": settings.enable_tax_loss_harvesting,
        "enable_timing_optimization": settings.enable_timing_optimization,
        "enable_wash_sale_alerts": settings.enable_wash_sale_alerts,
        "min_opportunity_savings": settings.min_opportunity_savings,
        "max_risk_level": settings.max_risk_level,
        "tax_jurisdiction": settings.tax_jurisdiction,
        "marginal_tax_rate": settings.marginal_tax_rate,
        "capital_gains_rate_short": settings.capital_gains_rate_short,
        "capital_gains_rate_long": settings.capital_gains_rate_long,
        "notify_on_opportunities": settings.notify_on_opportunities
    }


@router.put("/settings")
async def update_tax_optimizer_settings(
    settings_update: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's tax optimization settings"""
    settings = db.query(TaxOptimizationSettings).filter(
        TaxOptimizationSettings.user_id == current_user.id
    ).first()

    if not settings:
        settings = TaxOptimizationSettings(user_id=current_user.id)
        db.add(settings)

    # Update fields
    for key, value in settings_update.items():
        if hasattr(settings, key):
            setattr(settings, key, value)

    db.commit()

    return {"message": "Settings updated successfully"}
