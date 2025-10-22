"""
Dashboard Pydantic Schemas

API request/response models for the dashboard endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ========== Enums ==========

class AlertType(str, Enum):
    """Alert severity levels"""
    CRITICAL = "critical"  # Red - Requires immediate action
    WARNING = "warning"    # Orange - Should review soon
    INFO = "info"         # Blue - Informational
    SUCCESS = "success"   # Green - Positive notification


class AlertCategory(str, Enum):
    """Alert categories for filtering"""
    TAX = "tax"                     # Tax-related alerts
    COMPLIANCE = "compliance"        # Regulatory compliance
    PORTFOLIO = "portfolio"          # Portfolio warnings
    OPPORTUNITY = "opportunity"      # Tax optimization opportunities
    SYSTEM = "system"               # System notifications


class ActivityType(str, Enum):
    """Activity types for the timeline"""
    CHAT = "chat"
    DEFI_AUDIT = "defi_audit"
    SIMULATION = "simulation"
    COST_BASIS = "cost_basis"
    TAX_OPPORTUNITY = "tax_opportunity"
    SETTINGS = "settings"


# ========== Activity Schemas ==========

class DashboardActivityResponse(BaseModel):
    """Single activity item for the dashboard timeline"""
    id: int
    activity_type: ActivityType
    activity_id: Optional[str] = None
    title: str
    subtitle: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: str  # ISO format

    class Config:
        from_attributes = True


# ========== Alert Schemas ==========

class DashboardAlert(BaseModel):
    """Dashboard alert/notification"""
    id: str  # Unique identifier
    type: AlertType
    category: AlertCategory
    title: str
    message: str
    action_label: Optional[str] = None  # CTA button text
    action_url: Optional[str] = None    # Where to navigate
    dismissible: bool = True
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# ========== Stats Schemas ==========

class DashboardStats(BaseModel):
    """Main dashboard statistics"""
    # Simulations
    total_simulations: int = 0
    active_simulations: int = 0

    # DeFi Audits
    total_audits: int = 0
    last_audit_date: Optional[str] = None

    # Portfolio
    total_portfolio_value: float = 0
    portfolio_cost_basis: float = 0
    unrealized_gains: float = 0
    unrealized_gains_percentage: float = 0

    # Tax
    potential_tax_savings: float = 0
    potential_tax_savings_local: Optional[float] = None
    tax_loss_harvesting_opportunities: int = 0
    unverified_lots_count: int = 0
    wash_sale_warnings_count: int = 0

    # User Profile
    tax_jurisdiction: Optional[str] = None
    has_wallets: bool = False
    onboarding_complete: bool = False

    # Currency metadata
    local_currency: Optional[str] = None
    currency_symbol: Optional[str] = None


# ========== Portfolio Schemas ==========

class TokenHolding(BaseModel):
    """Individual token holding"""
    token: str
    chain: str
    amount: float
    value_usd: float
    cost_basis: float
    unrealized_gain_loss: float
    percentage_of_portfolio: float
    # Local currency fields
    value_local: Optional[float] = None
    cost_basis_local: Optional[float] = None
    unrealized_gain_loss_local: Optional[float] = None
    local_currency: Optional[str] = None  # Currency code (e.g., "EUR", "GBP")
    currency_symbol: Optional[str] = None


class PortfolioSummary(BaseModel):
    """Portfolio overview"""
    total_value_usd: float
    total_cost_basis: float
    total_unrealized_gains: float
    unrealized_gains_percentage: float
    top_holdings: List[TokenHolding]
    chains_count: int
    tokens_count: int
    last_updated: Optional[str] = None
    # Local currency fields
    total_value_local: Optional[float] = None
    total_cost_basis_local: Optional[float] = None
    total_unrealized_gains_local: Optional[float] = None
    local_currency: Optional[str] = None  # Currency code (e.g., "EUR", "GBP")
    currency_symbol: Optional[str] = None


# ========== Tax Opportunity Schemas ==========

class TaxOpportunityResponse(BaseModel):
    """Tax optimization opportunity"""
    id: int
    opportunity_type: str  # 'tax_loss_harvest', 'long_term_gains', etc.
    title: str
    description: str
    potential_savings: float
    status: str  # 'active', 'completed', 'expired'
    token: str
    chain: str
    amount: float
    current_gain_loss: float
    recommended_action: str
    deadline: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


# ========== Main Dashboard Response ==========

class DashboardOverview(BaseModel):
    """
    Complete dashboard overview response

    This is the main response for the /dashboard/overview endpoint.
    Contains all data needed to render the dashboard.
    """
    stats: DashboardStats
    alerts: List[DashboardAlert]
    activities: List[DashboardActivityResponse]
    tax_opportunities: List[TaxOpportunityResponse]
    portfolio: Optional[PortfolioSummary] = None

    class Config:
        from_attributes = True


# ========== Request Schemas ==========

class CreateActivityRequest(BaseModel):
    """Request to create a dashboard activity"""
    activity_type: ActivityType
    activity_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=500)
    metadata: Optional[Dict[str, Any]] = None


class DismissAlertRequest(BaseModel):
    """Request to dismiss an alert"""
    alert_id: str
