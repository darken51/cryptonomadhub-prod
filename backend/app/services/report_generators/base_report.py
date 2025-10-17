"""
Base Report Generator

Abstract base class for all report generators.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class BaseReportGenerator(ABC):
    """
    Base Report Generator

    Provides common functionality for tax report generation.
    """

    def __init__(self, user_id: int, tax_year: int, jurisdiction: str = "US"):
        """
        Initialize report generator

        Args:
            user_id: User ID
            tax_year: Tax year (e.g., 2024)
            jurisdiction: Tax jurisdiction (US, FR, DE, etc.)
        """
        self.user_id = user_id
        self.tax_year = tax_year
        self.jurisdiction = jurisdiction
        self.report_date = datetime.utcnow()

    @abstractmethod
    async def generate(self, db, data: Dict) -> bytes:
        """
        Generate report

        Args:
            db: Database session
            data: Report data (transactions, gains/losses, etc.)

        Returns:
            Report content as bytes
        """
        pass

    async def fetch_report_data(self, db) -> Dict:
        """
        Fetch all data needed for report

        Returns:
            Dict with:
            - disposals: List of cost basis disposals
            - summary: Gain/loss summary
            - short_term: Short-term transactions
            - long_term: Long-term transactions
            - wash_sales: Wash sale violations
        """
        from app.services.cost_basis_calculator import CostBasisCalculator

        calculator = CostBasisCalculator(db, self.user_id)

        # Get portfolio summary
        portfolio = await calculator.get_portfolio_summary()

        # Get all disposals for tax year
        start_date = datetime(self.tax_year, 1, 1)
        end_date = datetime(self.tax_year, 12, 31, 23, 59, 59)

        from app.models.cost_basis import CostBasisDisposal, WashSaleViolation
        from sqlalchemy import and_

        disposals = db.query(CostBasisDisposal).filter(
            and_(
                CostBasisDisposal.user_id == self.user_id,
                CostBasisDisposal.disposal_date >= start_date,
                CostBasisDisposal.disposal_date <= end_date
            )
        ).all()

        # Get wash sales
        wash_sales = db.query(WashSaleViolation).filter(
            and_(
                WashSaleViolation.user_id == self.user_id,
                WashSaleViolation.sale_date >= start_date,
                WashSaleViolation.sale_date <= end_date
            )
        ).all()

        # Categorize by holding period
        short_term = []
        long_term = []
        total_short_term_gain = 0.0
        total_short_term_loss = 0.0
        total_long_term_gain = 0.0
        total_long_term_loss = 0.0

        for disposal in disposals:
            disposal_dict = {
                "id": disposal.id,
                "token": disposal.token,
                "chain": disposal.chain,
                "amount": disposal.amount_disposed,
                "acquisition_date": disposal.acquisition_date,
                "disposal_date": disposal.disposal_date,
                "cost_basis": disposal.cost_basis,
                "proceeds": disposal.proceeds,
                "gain_loss": disposal.gain_loss,
                "holding_period_days": (disposal.disposal_date - disposal.acquisition_date).days,
                "is_long_term": disposal.is_long_term,
                "wash_sale_loss_disallowed": disposal.wash_sale_loss_disallowed or 0.0
            }

            if disposal.is_long_term:
                long_term.append(disposal_dict)
                if disposal.gain_loss > 0:
                    total_long_term_gain += disposal.gain_loss
                else:
                    total_long_term_loss += abs(disposal.gain_loss)
            else:
                short_term.append(disposal_dict)
                if disposal.gain_loss > 0:
                    total_short_term_gain += disposal.gain_loss
                else:
                    total_short_term_loss += abs(disposal.gain_loss)

        return {
            "user_id": self.user_id,
            "tax_year": self.tax_year,
            "jurisdiction": self.jurisdiction,
            "report_date": self.report_date,
            "portfolio": portfolio,
            "disposals": disposals,
            "short_term": short_term,
            "long_term": long_term,
            "wash_sales": [
                {
                    "id": ws.id,
                    "token": ws.token,
                    "sale_date": ws.sale_date,
                    "sale_amount": ws.sale_amount,
                    "loss_amount": ws.loss_amount,
                    "repurchase_date": ws.repurchase_date,
                    "repurchase_amount": ws.repurchase_amount
                }
                for ws in wash_sales
            ],
            "summary": {
                "total_disposals": len(disposals),
                "short_term_transactions": len(short_term),
                "long_term_transactions": len(long_term),
                "short_term_gain": total_short_term_gain,
                "short_term_loss": total_short_term_loss,
                "short_term_net": total_short_term_gain - total_short_term_loss,
                "long_term_gain": total_long_term_gain,
                "long_term_loss": total_long_term_loss,
                "long_term_net": total_long_term_gain - total_long_term_loss,
                "total_gain": total_short_term_gain + total_long_term_gain,
                "total_loss": total_short_term_loss + total_long_term_loss,
                "net_gain_loss": (total_short_term_gain + total_long_term_gain) - (total_short_term_loss + total_long_term_loss),
                "wash_sales_count": len(wash_sales)
            }
        }

    def format_currency(self, amount: float) -> str:
        """Format amount as currency"""
        return f"${amount:,.2f}"

    def format_date(self, date: datetime) -> str:
        """Format date as MM/DD/YYYY"""
        return date.strftime("%m/%d/%Y")

    def get_tax_rate(self, is_long_term: bool) -> float:
        """Get tax rate based on jurisdiction and holding period"""
        # Simplified tax rates
        rates = {
            "US": {"short_term": 0.37, "long_term": 0.20},
            "FR": {"short_term": 0.30, "long_term": 0.30},
            "DE": {"short_term": 0.26, "long_term": 0.0},
            "UK": {"short_term": 0.20, "long_term": 0.20},
            "PT": {"short_term": 0.28, "long_term": 0.28},
            "CA": {"short_term": 0.50, "long_term": 0.25},
            "AU": {"short_term": 0.45, "long_term": 0.225},
        }

        jurisdiction_rates = rates.get(self.jurisdiction, rates["US"])
        return jurisdiction_rates["long_term"] if is_long_term else jurisdiction_rates["short_term"]
