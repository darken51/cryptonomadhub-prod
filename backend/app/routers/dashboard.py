"""
Dashboard Endpoints

API routes for the dashboard overview and activity tracking.
Aggregates data from multiple sources for a unified dashboard view.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models.user import User
from app.models.dashboard_activity import DashboardActivity
from app.models.defi_protocol import DeFiAudit
from app.models.cost_basis import CostBasisLot, WashSaleViolation
from app.models.tax_opportunity import TaxOpportunity, OpportunityStatus
from app.models.chat import ChatConversation
from app.models.regulation import Regulation
from app.routers.auth import get_current_user
from app.dependencies.exchange_rate import get_exchange_rate_service
from app.schemas.dashboard import (
    DashboardOverview,
    DashboardStats,
    DashboardAlert,
    DashboardActivityResponse,
    TaxOpportunityResponse,
    PortfolioSummary,
    TokenHolding,
    CreateActivityRequest,
    DismissAlertRequest,
    AlertType,
    AlertCategory,
    ActivityType
)
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ========== Helper Functions ==========

async def _get_user_stats(db: Session, user_id: int) -> DashboardStats:
    """Calculate dashboard statistics for a user"""

    # Count simulations (if table exists - placeholder for now)
    total_simulations = 0
    active_simulations = 0

    # Count DeFi audits
    total_audits = db.query(DeFiAudit).filter(DeFiAudit.user_id == user_id).count()

    last_audit = db.query(DeFiAudit).filter(
        DeFiAudit.user_id == user_id
    ).order_by(desc(DeFiAudit.created_at)).first()

    last_audit_date = last_audit.created_at.isoformat() if last_audit else None

    # Get portfolio data from cost basis lots
    lots = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == user_id,
        CostBasisLot.remaining_amount > 0
    ).all()

    total_portfolio_value = 0.0
    portfolio_cost_basis = 0.0

    # Calculate portfolio value
    from app.services.price_service import PriceService
    price_service = PriceService()

    for lot in lots:
        current_price_decimal = price_service.get_current_price(lot.token)
        if current_price_decimal:
            current_price = float(current_price_decimal)
        else:
            current_price = float(lot.acquisition_price_usd)

        lot_value = float(lot.remaining_amount) * current_price
        lot_cost = float(lot.remaining_amount) * float(lot.acquisition_price_usd)

        total_portfolio_value += lot_value
        portfolio_cost_basis += lot_cost

    unrealized_gains = total_portfolio_value - portfolio_cost_basis
    unrealized_gains_percentage = (unrealized_gains / portfolio_cost_basis * 100) if portfolio_cost_basis > 0 else 0

    # Tax opportunities
    active_opportunities = db.query(TaxOpportunity).filter(
        TaxOpportunity.user_id == user_id,
        TaxOpportunity.status == OpportunityStatus.ACTIVE
    ).all()

    potential_tax_savings = sum(float(opp.potential_savings) for opp in active_opportunities)
    tax_loss_harvesting_opportunities = len([o for o in active_opportunities if o.opportunity_type.value == 'tax_loss_harvest'])

    # Unverified lots count
    unverified_lots_count = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == user_id,
        CostBasisLot.verified == False,
        CostBasisLot.remaining_amount > 0
    ).count()

    # Wash sale warnings
    wash_sale_warnings_count = db.query(WashSaleViolation).filter(
        WashSaleViolation.user_id == user_id
    ).count()

    # User profile checks - get tax jurisdiction from cost basis settings
    from app.models.user import User as UserModel
    from app.models.cost_basis import UserCostBasisSettings

    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    # Get tax jurisdiction from UserCostBasisSettings (primary source)
    cost_basis_settings = db.query(UserCostBasisSettings).filter(
        UserCostBasisSettings.user_id == user_id
    ).first()

    tax_jurisdiction = None
    if cost_basis_settings and cost_basis_settings.tax_jurisdiction:
        tax_jurisdiction = cost_basis_settings.tax_jurisdiction
    elif user and user.current_country:
        # Fallback to user profile if not set in cost basis settings
        tax_jurisdiction = user.current_country

    # Check if user has wallets/audits
    has_wallets = total_audits > 0

    # Onboarding complete if user has tax jurisdiction and at least one activity
    onboarding_complete = bool(tax_jurisdiction and (total_audits > 0 or total_simulations > 0))

    # Get exchange rate and currency info for local currency display
    exchange_rate = None
    local_currency = None
    currency_symbol = None
    potential_tax_savings_local = None

    if tax_jurisdiction:
        try:
            # Get currency info from regulation
            regulation = db.query(Regulation).filter(
                Regulation.country_code == tax_jurisdiction
            ).first()

            if regulation and regulation.currency_code:
                local_currency = regulation.currency_code
                currency_symbol = regulation.currency_symbol

                # Get exchange rate (USD to local currency)
                exchange_service = get_exchange_rate_service()
                rate, source = await exchange_service.get_exchange_rate(
                    from_currency="USD",
                    to_currency=local_currency
                )
                if rate:
                    exchange_rate = float(rate)
                    potential_tax_savings_local = potential_tax_savings * exchange_rate
        except Exception as e:
            logger.warning(f"Could not get exchange rate for jurisdiction: {e}")

    return DashboardStats(
        total_simulations=total_simulations,
        active_simulations=active_simulations,
        total_audits=total_audits,
        last_audit_date=last_audit_date,
        total_portfolio_value=total_portfolio_value,
        portfolio_cost_basis=portfolio_cost_basis,
        unrealized_gains=unrealized_gains,
        unrealized_gains_percentage=unrealized_gains_percentage,
        potential_tax_savings=potential_tax_savings,
        potential_tax_savings_local=potential_tax_savings_local,
        tax_loss_harvesting_opportunities=tax_loss_harvesting_opportunities,
        unverified_lots_count=unverified_lots_count,
        wash_sale_warnings_count=wash_sale_warnings_count,
        tax_jurisdiction=tax_jurisdiction,
        has_wallets=has_wallets,
        onboarding_complete=onboarding_complete,
        local_currency=local_currency,
        currency_symbol=currency_symbol
    )


def _get_user_alerts(db: Session, user_id: int, stats: DashboardStats) -> List[DashboardAlert]:
    """Generate dashboard alerts for a user"""
    alerts = []

    # CRITICAL: No tax jurisdiction set
    if not stats.tax_jurisdiction:
        alerts.append(DashboardAlert(
            id="no-tax-jurisdiction",
            type=AlertType.CRITICAL,
            category=AlertCategory.TAX,
            title="Tax Jurisdiction Required",
            message="Set your tax jurisdiction to get personalized tax optimization recommendations.",
            action_label="Set Jurisdiction",
            action_url="/settings#tax-jurisdiction",
            dismissible=False
        ))

    # CRITICAL: Unverified cost basis lots
    if stats.unverified_lots_count > 0:
        alerts.append(DashboardAlert(
            id="unverified-lots",
            type=AlertType.CRITICAL,
            category=AlertCategory.TAX,
            title=f"{stats.unverified_lots_count} Unverified Transaction{'s' if stats.unverified_lots_count > 1 else ''}",
            message="Review and verify your imported transactions to ensure accurate tax calculations.",
            action_label="Review Now",
            action_url="/cost-basis",
            dismissible=True
        ))

    # WARNING: Wash sale violations
    if stats.wash_sale_warnings_count > 0:
        alerts.append(DashboardAlert(
            id="wash-sales",
            type=AlertType.WARNING,
            category=AlertCategory.TAX,
            title=f"{stats.wash_sale_warnings_count} Wash Sale Warning{'s' if stats.wash_sale_warnings_count > 1 else ''}",
            message="You may have wash sale violations that could disallow tax loss deductions.",
            action_label="View Details",
            action_url="/cost-basis#wash-sales",
            dismissible=True
        ))

    # OPPORTUNITY: Tax loss harvesting
    if stats.tax_loss_harvesting_opportunities > 0:
        alerts.append(DashboardAlert(
            id="tax-opportunities",
            type=AlertType.SUCCESS,
            category=AlertCategory.OPPORTUNITY,
            title=f"{stats.tax_loss_harvesting_opportunities} Tax Saving Opportunit{'ies' if stats.tax_loss_harvesting_opportunities > 1 else 'y'}",
            message=f"Potential savings: ${stats.potential_tax_savings:,.2f}. Take action before year-end.",
            action_label="Optimize Now",
            action_url="/tax-optimizer",
            dismissible=True
        ))

    # INFO: No audits yet (for new users)
    if stats.total_audits == 0 and stats.tax_jurisdiction:
        alerts.append(DashboardAlert(
            id="no-audits",
            type=AlertType.INFO,
            category=AlertCategory.SYSTEM,
            title="Run Your First DeFi Audit",
            message="Import your wallet transactions to track cost basis and find tax savings.",
            action_label="Start Audit",
            action_url="/defi-audit",
            dismissible=True
        ))

    return alerts


def _get_recent_activities(db: Session, user_id: int, limit: int = 10) -> List[DashboardActivityResponse]:
    """Get recent user activities"""
    activities = db.query(DashboardActivity).filter(
        DashboardActivity.user_id == user_id
    ).order_by(desc(DashboardActivity.created_at)).limit(limit).all()

    return [
        DashboardActivityResponse(
            id=activity.id,
            activity_type=ActivityType(activity.activity_type),
            activity_id=activity.activity_id,
            title=activity.title,
            subtitle=activity.subtitle,
            metadata=activity.metadata,
            created_at=activity.created_at.isoformat()
        )
        for activity in activities
    ]


def _get_tax_opportunities(db: Session, user_id: int, limit: int = 5) -> List[TaxOpportunityResponse]:
    """Get active tax opportunities"""
    opportunities = db.query(TaxOpportunity).filter(
        TaxOpportunity.user_id == user_id,
        TaxOpportunity.status == OpportunityStatus.ACTIVE
    ).order_by(desc(TaxOpportunity.potential_savings)).limit(limit).all()

    return [
        TaxOpportunityResponse(
            id=opp.id,
            opportunity_type=opp.opportunity_type.value,
            title=f"{opp.opportunity_type.value.replace('_', ' ').title()}: {opp.token}",
            description=opp.action_description or "Tax optimization opportunity detected",
            potential_savings=float(opp.potential_savings),
            status=opp.status.value,
            token=opp.token,
            chain=opp.chain,
            amount=float(opp.current_amount),
            current_gain_loss=float(opp.unrealized_gain_loss),
            recommended_action=opp.recommended_action or "Review opportunity",
            deadline=opp.deadline.isoformat() if opp.deadline else None,
            created_at=opp.created_at.isoformat()
        )
        for opp in opportunities
    ]


async def _get_portfolio_summary(db: Session, user_id: int) -> Optional[PortfolioSummary]:
    """Get portfolio summary"""
    lots = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == user_id,
        CostBasisLot.remaining_amount > 0
    ).all()

    if not lots:
        return None

    # Get exchange rate and currency info
    from app.models.cost_basis import UserCostBasisSettings

    cost_basis_settings = db.query(UserCostBasisSettings).filter(
        UserCostBasisSettings.user_id == user_id
    ).first()

    exchange_rate = None
    local_currency = None
    currency_symbol = None

    if cost_basis_settings and cost_basis_settings.tax_jurisdiction:
        try:
            # Get currency info from regulation
            regulation = db.query(Regulation).filter(
                Regulation.country_code == cost_basis_settings.tax_jurisdiction
            ).first()

            if regulation and regulation.currency_code:
                local_currency = regulation.currency_code
                currency_symbol = regulation.currency_symbol

                # Get exchange rate (USD to local currency)
                exchange_service = get_exchange_rate_service()
                rate, source = await exchange_service.get_exchange_rate(
                    from_currency="USD",
                    to_currency=local_currency
                )
                if rate:
                    exchange_rate = float(rate)
        except Exception as e:
            logger.warning(f"Could not get exchange rate for jurisdiction: {e}")

    # Calculate portfolio metrics
    from app.services.price_service import PriceService
    price_service = PriceService()

    total_value = 0.0
    total_cost = 0.0
    token_holdings: Dict[str, Dict] = {}
    chains = set()

    for lot in lots:
        current_price_decimal = price_service.get_current_price(lot.token)
        if current_price_decimal:
            current_price = float(current_price_decimal)
        else:
            current_price = float(lot.acquisition_price_usd)

        lot_value = float(lot.remaining_amount) * current_price
        lot_cost = float(lot.remaining_amount) * float(lot.acquisition_price_usd)

        total_value += lot_value
        total_cost += lot_cost
        chains.add(lot.chain)

        # Aggregate by token
        key = f"{lot.token}_{lot.chain}"
        if key not in token_holdings:
            token_holdings[key] = {
                "token": lot.token,
                "chain": lot.chain,
                "amount": 0.0,
                "value_usd": 0.0,
                "cost_basis": 0.0
            }

        token_holdings[key]["amount"] += float(lot.remaining_amount)
        token_holdings[key]["value_usd"] += lot_value
        token_holdings[key]["cost_basis"] += lot_cost

    # Sort by value and get top holdings
    sorted_holdings = sorted(token_holdings.values(), key=lambda x: x["value_usd"], reverse=True)

    top_holdings = []
    for holding in sorted_holdings[:5]:  # Top 5 holdings
        unrealized_gl = holding["value_usd"] - holding["cost_basis"]
        percentage = (holding["value_usd"] / total_value * 100) if total_value > 0 else 0

        # Calculate local currency values
        value_local = holding["value_usd"] * exchange_rate if exchange_rate else None
        cost_basis_local = holding["cost_basis"] * exchange_rate if exchange_rate else None
        unrealized_gl_local = unrealized_gl * exchange_rate if exchange_rate else None

        top_holdings.append(TokenHolding(
            token=holding["token"],
            chain=holding["chain"],
            amount=holding["amount"],
            value_usd=holding["value_usd"],
            cost_basis=holding["cost_basis"],
            unrealized_gain_loss=unrealized_gl,
            percentage_of_portfolio=percentage,
            value_local=value_local,
            cost_basis_local=cost_basis_local,
            unrealized_gain_loss_local=unrealized_gl_local,
            local_currency=local_currency,
            currency_symbol=currency_symbol
        ))

    unrealized_gains = total_value - total_cost
    unrealized_gains_pct = (unrealized_gains / total_cost * 100) if total_cost > 0 else 0

    # Calculate local currency totals
    total_value_local = total_value * exchange_rate if exchange_rate else None
    total_cost_local = total_cost * exchange_rate if exchange_rate else None
    unrealized_gains_local = unrealized_gains * exchange_rate if exchange_rate else None

    return PortfolioSummary(
        total_value_usd=total_value,
        total_cost_basis=total_cost,
        total_unrealized_gains=unrealized_gains,
        unrealized_gains_percentage=unrealized_gains_pct,
        top_holdings=top_holdings,
        chains_count=len(chains),
        tokens_count=len(token_holdings),
        last_updated=datetime.utcnow().isoformat(),
        total_value_local=total_value_local,
        total_cost_basis_local=total_cost_local,
        total_unrealized_gains_local=unrealized_gains_local,
        local_currency=local_currency,
        currency_symbol=currency_symbol
    )


# ========== API Endpoints ==========

@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete dashboard overview

    Returns all data needed to render the dashboard:
    - Statistics (portfolio, audits, simulations)
    - Alerts (critical issues, opportunities)
    - Recent activities (timeline)
    - Tax opportunities
    - Portfolio summary
    """
    try:
        # Get all dashboard data
        stats = await _get_user_stats(db, current_user.id)
        alerts = _get_user_alerts(db, current_user.id, stats)
        activities = _get_recent_activities(db, current_user.id, limit=10)
        tax_opportunities = _get_tax_opportunities(db, current_user.id, limit=5)
        portfolio = await _get_portfolio_summary(db, current_user.id)

        return DashboardOverview(
            stats=stats,
            alerts=alerts,
            activities=activities,
            tax_opportunities=tax_opportunities,
            portfolio=portfolio
        )
    except Exception as e:
        logger.error(f"Error getting dashboard overview for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error loading dashboard")


@router.get("/alerts", response_model=List[DashboardAlert])
async def get_dashboard_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard alerts only

    Returns alerts for critical issues and opportunities.
    Useful for checking alerts independently of full dashboard load.
    """
    stats = _get_user_stats(db, current_user.id)
    return _get_user_alerts(db, current_user.id, stats)


@router.get("/activities", response_model=List[DashboardActivityResponse])
async def get_dashboard_activities(
    limit: int = 20,
    activity_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard activities (timeline)

    Args:
        limit: Maximum number of activities to return (default 20)
        activity_type: Filter by activity type (optional)

    Returns recent user activities for the dashboard timeline.
    """
    query = db.query(DashboardActivity).filter(
        DashboardActivity.user_id == current_user.id
    )

    if activity_type:
        query = query.filter(DashboardActivity.activity_type == activity_type)

    activities = query.order_by(desc(DashboardActivity.created_at)).limit(limit).all()

    return [
        DashboardActivityResponse(
            id=activity.id,
            activity_type=ActivityType(activity.activity_type),
            activity_id=activity.activity_id,
            title=activity.title,
            subtitle=activity.subtitle,
            metadata=activity.metadata,
            created_at=activity.created_at.isoformat()
        )
        for activity in activities
    ]


@router.post("/activities", response_model=DashboardActivityResponse)
async def create_dashboard_activity(
    request: CreateActivityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new dashboard activity

    Used to log user actions for the dashboard timeline.
    Called by other services when important events occur.
    """
    activity = DashboardActivity(
        user_id=current_user.id,
        activity_type=request.activity_type.value,
        activity_id=request.activity_id,
        title=request.title,
        subtitle=request.subtitle,
        activity_metadata=request.metadata
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return DashboardActivityResponse(
        id=activity.id,
        activity_type=ActivityType(activity.activity_type),
        activity_id=activity.activity_id,
        title=activity.title,
        subtitle=activity.subtitle,
        metadata=activity.metadata,
        created_at=activity.created_at.isoformat()
    )


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics only

    Returns stats without alerts, activities, or opportunities.
    Useful for quick stats refresh without full dashboard reload.
    """
    return _get_user_stats(db, current_user.id)


@router.post("/alerts/dismiss")
async def dismiss_alert(
    request: DismissAlertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dismiss a dashboard alert

    Marks an alert as dismissed so it won't show again.
    Currently stores dismissals in user preferences (future enhancement).
    """
    # TODO: Implement alert dismissal persistence in user preferences
    # For now, just acknowledge the dismissal
    logger.info(f"User {current_user.id} dismissed alert: {request.alert_id}")

    return {"success": True, "message": "Alert dismissed"}
