"""
Tax Optimizer Service

Analyzes portfolio for tax optimization opportunities including:
- Tax loss harvesting suggestions
- Optimal sell timing
- Short-term vs long-term holding optimization
- Wash sale rule avoidance

Features:
- Unrealized gains/losses analysis
- Tax savings calculator
- Wash sale compliance
- Multi-lot optimization
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.cost_basis import CostBasisLot, UserCostBasisSettings
from app.models.regulation import Regulation
from app.models.user import User
from app.services.enhanced_price_service import EnhancedPriceService
from app.config import settings
import redis
import json
import logging

logger = logging.getLogger(__name__)


class TaxOptimizer:
    """
    Tax Optimization Service
    
    Provides suggestions for minimizing tax liability through:
    - Tax loss harvesting
    - Optimal holding periods
    - Wash sale avoidance
    """

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.price_service = EnhancedPriceService(db)
        self.redis_client = redis.Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True
        )
        self.settings = self._get_user_settings()

    def _get_user_settings(self) -> UserCostBasisSettings:
        """Get user's tax settings, using User.current_country if not set"""
        settings = self.db.query(UserCostBasisSettings).filter(
            UserCostBasisSettings.user_id == self.user_id
        ).first()

        if not settings:
            # Get user's country from profile
            user = self.db.query(User).filter(User.id == self.user_id).first()
            user_country = user.current_country if user and user.current_country else None

            # Default to US only if no country is set
            # TODO: In production, prompt user to set their jurisdiction instead
            tax_jurisdiction = user_country if user_country else "US"

            # Check if wash sale rule applies (US only)
            apply_wash_sale = (tax_jurisdiction == "US")

            settings = UserCostBasisSettings(
                user_id=self.user_id,
                default_method="fifo",
                tax_jurisdiction=tax_jurisdiction,
                apply_wash_sale_rule=apply_wash_sale
            )
            self.db.add(settings)
            self.db.commit()

            logger.info(f"Created tax settings for user {self.user_id} with jurisdiction {tax_jurisdiction}")

        return settings

    async def analyze_portfolio(self) -> Dict:
        """
        Comprehensive portfolio analysis for tax optimization

        Returns:
            Dict with:
            - unrealized_gains: Total unrealized gains
            - unrealized_losses: Total unrealized losses
            - loss_harvesting_opportunities: List of suggestions
            - total_potential_savings: Estimated tax savings
            - short_term_to_long_term: Lots approaching long-term status
        """
        logger.info(f"Analyzing portfolio for user {self.user_id}")

        # Get all active lots
        lots = self.db.query(CostBasisLot).filter(
            and_(
                CostBasisLot.user_id == self.user_id,
                CostBasisLot.remaining_amount > 0
            )
        ).all()

        if not lots:
            return {
                "unrealized_gains": 0.0,
                "unrealized_losses": 0.0,
                "loss_harvesting_opportunities": [],
                "total_potential_savings": 0.0,
                "short_term_to_long_term": []
            }

        # Calculate unrealized gains/losses
        unrealized_data = await self._calculate_unrealized(lots)

        # Find loss harvesting opportunities
        loss_harvest_ops = await self._find_loss_harvesting(unrealized_data["lots_with_unrealized"])

        # Find lots approaching long-term status
        short_to_long = self._find_short_term_to_long_term(lots)

        # Calculate total potential tax savings
        total_savings = self._calculate_total_savings(loss_harvest_ops)

        return {
            "unrealized_gains": unrealized_data["total_gains"],
            "unrealized_losses": abs(unrealized_data["total_losses"]),
            "loss_harvesting_opportunities": loss_harvest_ops,
            "total_potential_savings": total_savings,
            "short_term_to_long_term": short_to_long,
            "analysis_date": datetime.utcnow().isoformat()
        }

    async def _calculate_unrealized(self, lots: List[CostBasisLot]) -> Dict:
        """Calculate unrealized gains/losses for all lots"""
        total_gains = 0.0
        total_losses = 0.0
        lots_with_unrealized = []

        # Get holding period requirement for this jurisdiction
        required_holding_days = self._get_holding_period_days()

        for lot in lots:
            # Get current price
            current_price = await self.price_service.get_current_price(lot.token, lot.chain)

            if not current_price:
                logger.warning(f"Could not get current price for {lot.token}")
                continue

            # Calculate unrealized
            cost_basis = float(lot.remaining_amount) * float(lot.acquisition_price_usd)
            current_value = float(lot.remaining_amount) * float(current_price)
            unrealized = current_value - cost_basis
            unrealized_percent = (unrealized / cost_basis * 100) if cost_basis > 0 else 0

            holding_period_days = (datetime.utcnow() - lot.acquisition_date).days

            lot_data = {
                "lot_id": lot.id,
                "token": lot.token,
                "chain": lot.chain,
                "amount": lot.remaining_amount,
                "acquisition_price": lot.acquisition_price_usd,
                "current_price": current_price,
                "cost_basis": cost_basis,
                "current_value": current_value,
                "unrealized_gain_loss": unrealized,
                "unrealized_percent": unrealized_percent,
                "acquisition_date": lot.acquisition_date.isoformat(),
                "holding_period_days": holding_period_days,
                "is_long_term": holding_period_days >= required_holding_days
            }

            lots_with_unrealized.append(lot_data)

            if unrealized > 0:
                total_gains += unrealized
            else:
                total_losses += unrealized

        return {
            "total_gains": total_gains,
            "total_losses": total_losses,
            "lots_with_unrealized": lots_with_unrealized
        }

    async def _find_loss_harvesting(self, lots_data: List[Dict]) -> List[Dict]:
        """
        Find tax loss harvesting opportunities

        Criteria:
        - Lot has unrealized loss
        - Selling would result in tax benefit
        - No wash sale violation if sold
        """
        opportunities = []

        # Get tax rate based on jurisdiction
        tax_rates = self._get_tax_rates()

        for lot_data in lots_data:
            if lot_data["unrealized_gain_loss"] >= 0:
                continue  # Only interested in losses

            # Calculate tax savings
            loss_amount = abs(lot_data["unrealized_gain_loss"])
            
            if lot_data["is_long_term"]:
                tax_rate = tax_rates["long_term"]
            else:
                tax_rate = tax_rates["short_term"]

            tax_savings = loss_amount * tax_rate

            # Check for potential wash sale violation
            wash_sale_warning = await self._check_wash_sale_risk(
                lot_data["token"],
                lot_data["chain"]
            )

            opportunities.append({
                "lot_id": lot_data["lot_id"],
                "token": lot_data["token"],
                "chain": lot_data["chain"],
                "amount": lot_data["amount"],
                "unrealized_loss": loss_amount,
                "tax_savings": tax_savings,
                "holding_period_days": lot_data["holding_period_days"],
                "is_long_term": lot_data["is_long_term"],
                "current_price": lot_data["current_price"],
                "cost_basis": lot_data["cost_basis"],
                "action": "sell",
                "priority": "high" if tax_savings > 1000 else "medium" if tax_savings > 100 else "low",
                "wash_sale_warning": wash_sale_warning,
                "notes": f"Selling would generate ${loss_amount:.2f} loss, saving ${tax_savings:.2f} in taxes"
            })

        # Sort by tax savings (highest first)
        opportunities.sort(key=lambda x: x["tax_savings"], reverse=True)

        return opportunities

    def _find_short_term_to_long_term(self, lots: List[CostBasisLot]) -> List[Dict]:
        """
        Find lots approaching long-term capital gains status

        Returns lots that will become long-term in the next 30 days
        """
        approaching_long_term = []
        now = datetime.utcnow()

        # Get holding period requirement for this jurisdiction
        required_holding_days = self._get_holding_period_days()

        for lot in lots:
            holding_days = (now - lot.acquisition_date).days
            days_to_long_term = required_holding_days - holding_days

            if 0 < days_to_long_term <= 30:
                approaching_long_term.append({
                    "lot_id": lot.id,
                    "token": lot.token,
                    "chain": lot.chain,
                    "amount": lot.remaining_amount,
                    "acquisition_date": lot.acquisition_date.isoformat(),
                    "holding_days": holding_days,
                    "days_to_long_term": days_to_long_term,
                    "long_term_date": (lot.acquisition_date + timedelta(days=required_holding_days)).isoformat(),
                    "recommendation": f"Wait {days_to_long_term} days for long-term capital gains rate"
                })

        # Sort by days to long-term (soonest first)
        approaching_long_term.sort(key=lambda x: x["days_to_long_term"])

        return approaching_long_term

    async def _check_wash_sale_risk(self, token: str, chain: str) -> Optional[str]:
        """
        Check if selling would trigger wash sale rule

        Returns warning message if risk detected
        """
        if not self.settings.apply_wash_sale_rule:
            return None

        # Check for recent purchases (within 30 days)
        recent_date = datetime.utcnow() - timedelta(days=30)

        recent_purchases = self.db.query(CostBasisLot).filter(
            and_(
                CostBasisLot.user_id == self.user_id,
                CostBasisLot.token == token,
                CostBasisLot.chain == chain,
                CostBasisLot.acquisition_date >= recent_date
            )
        ).count()

        if recent_purchases > 0:
            return f"Warning: {recent_purchases} purchase(s) of {token} in last 30 days. Selling at loss may trigger wash sale rule."

        return None

    def _get_holding_period_days(self) -> int:
        """
        Get required holding period for long-term classification from database

        Returns number of days required for long-term status based on jurisdiction
        Defaults to 365 days if not specified in database
        """
        jurisdiction = self.settings.tax_jurisdiction or "US"

        # Query regulation from database
        regulation = self.db.query(Regulation).filter(
            Regulation.country_code == jurisdiction
        ).first()

        if regulation and regulation.holding_period_months:
            # Convert months to days (approximate)
            days = regulation.holding_period_months * 30
            logger.debug(f"Using holding period for {jurisdiction}: {days} days ({regulation.holding_period_months} months)")
            return days

        # Default to 365 days (most common international standard)
        logger.debug(f"No holding period specified for {jurisdiction}, using default 365 days")
        return 365

    def _get_tax_rates(self) -> Dict[str, float]:
        """
        Get tax rates from database based on jurisdiction

        Uses Redis cache to avoid repeated DB queries (1 hour TTL)

        Returns dict with short_term and long_term rates
        Uses crypto-specific rates if available, otherwise falls back to general CGT rates
        """
        jurisdiction = self.settings.tax_jurisdiction or "US"
        cache_key = f"tax_rates:{jurisdiction}"

        # Try Redis cache first
        cached = self.redis_client.get(cache_key)
        if cached:
            logger.debug(f"Redis cache hit for tax rates: {jurisdiction}")
            return json.loads(cached)

        # Query regulation from database
        regulation = self.db.query(Regulation).filter(
            Regulation.country_code == jurisdiction
        ).first()

        if not regulation:
            logger.warning(f"No regulation found for jurisdiction '{jurisdiction}', defaulting to US rates")
            # Try to get US rates as fallback
            regulation = self.db.query(Regulation).filter(
                Regulation.country_code == "US"
            ).first()

        if not regulation:
            # Ultimate fallback - hardcoded US rates
            logger.error("No regulations found in database, using hardcoded US rates")
            return {"short_term": 0.37, "long_term": 0.20}

        # Use crypto-specific rates if available, otherwise fall back to general CGT rates
        short_rate = float(regulation.crypto_short_rate) if regulation.crypto_short_rate is not None else float(regulation.cgt_short_rate)
        long_rate = float(regulation.crypto_long_rate) if regulation.crypto_long_rate is not None else float(regulation.cgt_long_rate)

        logger.debug(f"Using tax rates for {jurisdiction}: short={short_rate}, long={long_rate}")

        rates = {
            "short_term": short_rate,
            "long_term": long_rate
        }

        # Cache for 1 hour (3600 seconds)
        self.redis_client.setex(cache_key, 3600, json.dumps(rates))

        return rates

    def _calculate_total_savings(self, opportunities: List[Dict]) -> float:
        """Calculate total potential tax savings from all opportunities"""
        return sum(op["tax_savings"] for op in opportunities)

    async def get_optimal_sell_timing(
        self,
        token: str,
        chain: str,
        amount: Optional[float] = None
    ) -> Dict:
        """
        Get optimal timing for selling a specific token

        Args:
            token: Token symbol
            chain: Blockchain
            amount: Optional specific amount to sell

        Returns:
            Optimization suggestions with timing
        """
        lots = self.db.query(CostBasisLot).filter(
            and_(
                CostBasisLot.user_id == self.user_id,
                CostBasisLot.token == token,
                CostBasisLot.chain == chain,
                CostBasisLot.remaining_amount > 0
            )
        ).order_by(CostBasisLot.acquisition_date).all()

        if not lots:
            return {"error": "No lots found for this token"}

        # Get current price
        current_price = await self.price_service.get_current_price(token, chain)
        if not current_price:
            return {"error": "Could not fetch current price"}

        suggestions = []
        tax_rates = self._get_tax_rates()
        required_holding_days = self._get_holding_period_days()

        for lot in lots:
            holding_days = (datetime.utcnow() - lot.acquisition_date).days
            is_long_term = holding_days >= required_holding_days
            days_to_long_term = max(0, required_holding_days - holding_days)

            unrealized = (current_price - lot.acquisition_price_usd) * lot.remaining_amount
            
            if is_long_term:
                tax_rate = tax_rates["long_term"]
                timing = "Sell now (long-term rate applies)"
            else:
                tax_rate = tax_rates["short_term"]
                short_term_tax = unrealized * tax_rates["short_term"]
                long_term_tax = unrealized * tax_rates["long_term"]
                savings_if_wait = short_term_tax - long_term_tax

                if savings_if_wait > 100:  # Significant savings
                    timing = f"Wait {days_to_long_term} days (save ${savings_if_wait:.2f} in taxes)"
                else:
                    timing = "Sell now or wait for long-term"

            suggestions.append({
                "lot_id": lot.id,
                "amount": lot.remaining_amount,
                "acquisition_date": lot.acquisition_date.isoformat(),
                "holding_days": holding_days,
                "is_long_term": is_long_term,
                "days_to_long_term": days_to_long_term,
                "unrealized_gain_loss": unrealized,
                "estimated_tax": unrealized * tax_rate if unrealized > 0 else 0,
                "timing_recommendation": timing
            })

        return {
            "token": token,
            "chain": chain,
            "current_price": current_price,
            "total_lots": len(lots),
            "suggestions": suggestions
        }
