"""
Tax Optimizer Endpoints

API routes for tax optimization and tax-loss harvesting opportunities.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User
from app.models.cost_basis import CostBasisLot, UserCostBasisSettings
from app.models.tax_opportunity import (
    TaxOpportunity,
    TaxOptimizationSettings,
    OpportunityType,
    OpportunityStatus
)
from app.routers.auth import get_current_user
from app.dependencies import get_exchange_rate_service
from app.dependencies.license_check import require_pro_tier
from app.data.currency_mapping import get_currency_info
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tax-optimizer", tags=["Tax Optimizer"])


# Helper function to get current exchange rate for user's jurisdiction
async def get_user_exchange_rate(user_id: int, db: Session) -> tuple[Optional[str], Optional[str], Optional[float]]:
    """
    Get user's local currency and current exchange rate.

    Returns:
        Tuple of (currency_code, currency_symbol, exchange_rate) or (None, None, None)
    """
    try:
        # Get user's tax jurisdiction
        settings = db.query(UserCostBasisSettings).filter(
            UserCostBasisSettings.user_id == user_id
        ).first()

        if not settings or not settings.tax_jurisdiction:
            return None, None, None

        jurisdiction = settings.tax_jurisdiction
        currency_info = get_currency_info(jurisdiction)

        if not currency_info:
            return None, None, None

        # Skip if USD jurisdiction
        if currency_info.uses_usd_directly:
            return "USD", "$", 1.0

        # Get current exchange rate
        exchange_service = get_exchange_rate_service()
        rate, source = await exchange_service.get_exchange_rate(
            from_currency="USD",
            to_currency=currency_info.currency_code
        )

        if rate is None:
            return None, None, None

        await exchange_service.close()

        return currency_info.currency_code, currency_info.currency_symbol, float(rate)

    except Exception as e:
        logger.error(f"Error getting exchange rate for user {user_id}: {e}")
        return None, None, None


# Pydantic models
class OpportunityResponse(BaseModel):
    id: int
    opportunity_type: str
    status: str
    token: str
    chain: str
    current_amount: float

    # USD values (original)
    current_value_usd: float
    unrealized_gain_loss: float
    unrealized_gain_loss_percent: float
    potential_savings: float

    # Local currency values (multi-currency support)
    current_value_local: Optional[float] = None
    unrealized_gain_loss_local: Optional[float] = None
    potential_savings_local: Optional[float] = None

    recommended_action: str
    action_description: str
    deadline: Optional[str]
    confidence_score: float
    risk_level: str
    created_at: str
    is_stub: bool = False  # Indicates example/preview data for non-PRO users


class AnalysisResponse(BaseModel):
    total_opportunities: int

    # USD values (original)
    potential_tax_savings: float

    # Local currency values (multi-currency support)
    local_currency: Optional[str] = None
    currency_symbol: Optional[str] = None
    potential_tax_savings_local: Optional[float] = None
    exchange_rate: Optional[float] = None

    opportunities: List[OpportunityResponse]
    portfolio_summary: dict
    recommendations: List[str]
    is_stub: bool = False  # Indicates example/preview data for non-PRO users


class ExecuteOpportunityRequest(BaseModel):
    opportunity_id: int = Field(..., gt=0, description="Opportunity ID must be positive")
    amount: Optional[float] = Field(None, gt=0, le=1_000_000_000, description="Amount in tokens")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")


@router.get("/analyze", response_model=AnalysisResponse)
async def analyze_tax_optimization(
    audit_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze user's portfolio for tax optimization opportunities

    Args:
        audit_id: Optional DeFi audit ID to scope analysis to specific audit

    Identifies:
    - Tax-loss harvesting opportunities
    - Assets close to long-term capital gains threshold
    - Optimal timing for sales
    - Wash sale risk

    If audit_id is provided, only analyzes cost basis lots from that audit.
    Otherwise, analyzes all lots (default behavior).

    ⚠️ FREE/STARTER tier: Returns example data for preview
    """

    # Check user's tier - FREE/STARTER get preview data
    from app.services.license_service import LicenseService
    from app.models.license import LicenseTier

    license_service = LicenseService(db)
    license = license_service.get_user_license(current_user.id)

    # FREE/STARTER tier gets example data
    if license.tier in [LicenseTier.FREE, LicenseTier.STARTER]:
        current_time = datetime.utcnow()
        return AnalysisResponse(
            total_opportunities=2,
            potential_tax_savings=3250.0,
            opportunities=[
                OpportunityResponse(
                    id=0,
                    opportunity_type="tax_loss_harvest",
                    status="active",
                    token="ETH",
                    chain="ethereum",
                    current_amount=5.0,
                    current_value_usd=10000.0,
                    unrealized_gain_loss=-2500.0,
                    unrealized_gain_loss_percent=-20.0,
                    potential_savings=925.0,
                    recommended_action="Sell 5.0000 ETH to harvest $2,500.00 loss",
                    action_description=(
                        "You have an unrealized loss of $2,500.00 (-20.0%) on ETH. "
                        "By selling now, you can offset up to $925.00 in gains from other assets. "
                        "You can repurchase after 30 days to avoid wash sale rules. "
                        "⚠️ This is example data - Upgrade to PRO to see your real portfolio opportunities."
                    ),
                    deadline=(datetime(current_time.year, 12, 31, 23, 59, 59)).isoformat(),
                    confidence_score=0.9,
                    risk_level="low",
                    created_at=current_time.isoformat(),
                    is_stub=True
                ),
                OpportunityResponse(
                    id=0,
                    opportunity_type="long_term_wait",
                    status="active",
                    token="BTC",
                    chain="bitcoin",
                    current_amount=0.5,
                    current_value_usd=22500.0,
                    unrealized_gain_loss=7500.0,
                    unrealized_gain_loss_percent=50.0,
                    potential_savings=2325.0,
                    recommended_action="Wait 45 days before selling BTC",
                    action_description=(
                        "Your BTC will qualify for long-term capital gains in 45 days. "
                        "By waiting, you'll save $2,325.00 in taxes (37% vs 20% rate). "
                        "⚠️ This is example data - Upgrade to PRO to see your real portfolio opportunities."
                    ),
                    deadline=(current_time + timedelta(days=45)).isoformat(),
                    confidence_score=0.85,
                    risk_level="low",
                    created_at=current_time.isoformat(),
                    is_stub=True
                )
            ],
            portfolio_summary={
                "total_lots": 2,
                "total_value_usd": 32500.0,
                "total_unrealized_gain_loss": 5000.0
            },
            recommendations=[
                "⚠️ This is example data to demonstrate Tax Optimizer features",
                "🔒 Upgrade to PRO to unlock AI-powered tax optimization for your real portfolio",
                "💡 PRO users get personalized tax-loss harvesting, timing optimization, and wash sale detection"
            ],
            is_stub=True
        )

    # Get user's cost basis lots
    lots_query = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == current_user.id,
        CostBasisLot.remaining_amount > 0
    )

    # Filter by audit_id if provided
    if audit_id is not None:
        lots_query = lots_query.filter(CostBasisLot.source_audit_id == audit_id)
        logger.info(f"Analyzing tax opportunities for audit #{audit_id}")

    lots = lots_query.all()

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
        current_value = float(lot.remaining_amount) * float(current_price)
        cost_basis = float(lot.remaining_amount) * float(lot.acquisition_price_usd)
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

    # Get user's currency and exchange rate
    local_currency, currency_symbol, exchange_rate = await get_user_exchange_rate(current_user.id, db)

    opportunities_list = []
    total_potential_savings = 0.0

    for opp in all_opportunities:
        # Convert to local currency if available
        current_value_local = None
        unrealized_gl_local = None
        potential_savings_local = None

        if exchange_rate:
            current_value_local = float(opp.current_value_usd) * exchange_rate
            unrealized_gl_local = float(opp.unrealized_gain_loss) * exchange_rate
            potential_savings_local = float(opp.potential_savings) * exchange_rate

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
            current_value_local=current_value_local,
            unrealized_gain_loss_local=unrealized_gl_local,
            potential_savings_local=potential_savings_local,
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

    # Calculate local currency values
    potential_tax_savings_local = None
    if exchange_rate:
        potential_tax_savings_local = total_potential_savings * exchange_rate

    return AnalysisResponse(
        total_opportunities=len(opportunities_list),
        potential_tax_savings=total_potential_savings,
        local_currency=local_currency,
        currency_symbol=currency_symbol,
        potential_tax_savings_local=potential_tax_savings_local,
        exchange_rate=exchange_rate,
        opportunities=opportunities_list,
        portfolio_summary={
            "total_lots": len(lots),
            "total_value_usd": total_value,
            "total_unrealized_gain_loss": total_unrealized_gl,
            "total_value_local": float(total_value * exchange_rate) if exchange_rate else None,
            "total_unrealized_gain_loss_local": float(total_unrealized_gl * exchange_rate) if exchange_rate else None
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
    """
    Get tax optimization opportunities for user

    ⚠️ FREE/STARTER tier: Returns example data for preview
    """

    # Check user's tier - FREE/STARTER get preview data
    from app.services.license_service import LicenseService
    from app.models.license import LicenseTier

    license_service = LicenseService(db)
    license = license_service.get_user_license(current_user.id)

    # FREE/STARTER tier gets example data
    if license.tier in [LicenseTier.FREE, LicenseTier.STARTER]:
        current_time = datetime.utcnow()
        return [
            OpportunityResponse(
                id=0,
                opportunity_type="tax_loss_harvest",
                status="active",
                token="ETH",
                chain="ethereum",
                current_amount=5.0,
                current_value_usd=10000.0,
                unrealized_gain_loss=-2500.0,
                unrealized_gain_loss_percent=-20.0,
                potential_savings=925.0,
                recommended_action="Sell 5.0000 ETH to harvest $2,500.00 loss",
                action_description=(
                    "You have an unrealized loss of $2,500.00 (-20.0%) on ETH. "
                    "By selling now, you can offset up to $925.00 in gains from other assets. "
                    "⚠️ This is example data - Upgrade to PRO to see your real portfolio opportunities."
                ),
                deadline=(datetime(current_time.year, 12, 31, 23, 59, 59)).isoformat(),
                confidence_score=0.9,
                risk_level="low",
                created_at=current_time.isoformat(),
                is_stub=True
            ),
            OpportunityResponse(
                id=0,
                opportunity_type="long_term_wait",
                status="active",
                token="BTC",
                chain="bitcoin",
                current_amount=0.5,
                current_value_usd=22500.0,
                unrealized_gain_loss=7500.0,
                unrealized_gain_loss_percent=50.0,
                potential_savings=2325.0,
                recommended_action="Wait 45 days before selling BTC",
                action_description=(
                    "Your BTC will qualify for long-term capital gains in 45 days. "
                    "By waiting, you'll save $2,325.00 in taxes (37% vs 20% rate). "
                    "⚠️ This is example data - Upgrade to PRO to see your real portfolio opportunities."
                ),
                deadline=(current_time + timedelta(days=45)).isoformat(),
                confidence_score=0.85,
                risk_level="low",
                created_at=current_time.isoformat(),
                is_stub=True
            )
        ]
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

    # Validate tax_jurisdiction if being updated
    if "tax_jurisdiction" in settings_update:
        from app.models.regulation import Regulation
        country_code = settings_update["tax_jurisdiction"].upper()

        regulation = db.query(Regulation).filter(
            Regulation.country_code == country_code
        ).first()

        if not regulation:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid country code: {country_code}. Tax jurisdiction not supported."
            )

        settings_update["tax_jurisdiction"] = country_code

    # Update fields
    for key, value in settings_update.items():
        if hasattr(settings, key):
            setattr(settings, key, value)

    db.commit()

    return {"message": "Settings updated successfully"}
