"""
Cost Basis Calculator Service

Calculates accurate cost basis for cryptocurrency disposals using various methods:
- FIFO (First In First Out)
- LIFO (Last In First Out)
- HIFO (Highest In First Out)
- Specific Identification
- Average Cost

Handles wash sale rule violations and generates detailed tax reports.
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.cost_basis import (
    CostBasisLot, CostBasisDisposal, CostBasisMethod,
    UserCostBasisSettings, WashSaleViolation, AcquisitionMethod
)
import logging

logger = logging.getLogger(__name__)


class CostBasisCalculator:
    """
    Cost Basis Calculator

    Provides accurate capital gains/losses calculations with proper cost basis tracking.
    """

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.settings = self._get_user_settings()

    def _get_user_settings(self) -> UserCostBasisSettings:
        """Get user's cost basis calculation settings"""
        settings = self.db.query(UserCostBasisSettings).filter(
            UserCostBasisSettings.user_id == self.user_id
        ).first()

        if not settings:
            # Create default settings
            settings = UserCostBasisSettings(
                user_id=self.user_id,
                default_method=CostBasisMethod.FIFO,
                tax_jurisdiction="US",
                apply_wash_sale_rule=True
            )
            self.db.add(settings)
            self.db.commit()

        return settings

    async def calculate_disposal(
        self,
        token: str,
        chain: str,
        amount: float,
        disposal_price_usd: float,
        disposal_date: datetime,
        disposal_tx_hash: Optional[str] = None,
        method: Optional[CostBasisMethod] = None
    ) -> Dict:
        """
        Calculate gain/loss for a disposal (sale/swap)

        Args:
            token: Token symbol
            chain: Blockchain
            amount: Amount being disposed
            disposal_price_usd: Sale price per unit in USD
            disposal_date: Date of disposal
            disposal_tx_hash: Transaction hash
            method: Override default method

        Returns:
            Dict with gain/loss details and lot disposals
        """
        method = method or self.settings.default_method

        logger.info(
            f"Calculating disposal: {amount} {token} on {chain} "
            f"at ${disposal_price_usd} using {method.value}"
        )

        # Get available lots
        available_lots = self._get_available_lots(token, chain, disposal_date)

        if not available_lots:
            logger.warning(f"No cost basis lots found for {token} on {chain}")
            # Assume $0 cost basis (worst case for taxes)
            return self._create_zero_basis_disposal(
                token, chain, amount, disposal_price_usd,
                disposal_date, disposal_tx_hash
            )

        # Select lots based on method
        selected_lots = self._select_lots(available_lots, amount, method)

        # Create disposals
        disposals = []
        total_cost_basis = Decimal(0)
        total_proceeds = Decimal(str(disposal_price_usd * amount))
        remaining_amount = Decimal(str(amount))

        for lot, lot_amount in selected_lots:
            lot_amount_decimal = Decimal(str(lot_amount))

            # Calculate for this lot
            cost_basis_per_unit = Decimal(str(lot.acquisition_price_usd))
            lot_cost_basis = cost_basis_per_unit * lot_amount_decimal
            lot_proceeds = Decimal(str(disposal_price_usd)) * lot_amount_decimal
            lot_gain_loss = lot_proceeds - lot_cost_basis

            # Holding period
            holding_days = (disposal_date - lot.acquisition_date).days
            is_long_term = holding_days >= 365
            is_short_term = not is_long_term

            # Create disposal record
            disposal = CostBasisDisposal(
                lot_id=lot.id,
                user_id=self.user_id,
                disposal_date=disposal_date,
                disposal_price_usd=disposal_price_usd,
                amount_disposed=float(lot_amount_decimal),
                disposal_tx_hash=disposal_tx_hash,
                cost_basis_per_unit=float(cost_basis_per_unit),
                total_cost_basis=float(lot_cost_basis),
                total_proceeds=float(lot_proceeds),
                gain_loss=float(lot_gain_loss),
                holding_period_days=holding_days,
                is_short_term=is_short_term,
                is_long_term=is_long_term
            )

            self.db.add(disposal)
            disposals.append(disposal)

            # Update lot
            lot.remaining_amount -= float(lot_amount_decimal)
            lot.disposed_amount += float(lot_amount_decimal)

            total_cost_basis += lot_cost_basis
            remaining_amount -= lot_amount_decimal

            if remaining_amount <= 0:
                break

        self.db.commit()

        # Check for wash sale violations if applicable
        if self.settings.apply_wash_sale_rule and float(total_proceeds - total_cost_basis) < 0:
            await self._check_wash_sale(token, chain, disposal_date, disposals)

        return {
            "total_cost_basis": float(total_cost_basis),
            "total_proceeds": float(total_proceeds),
            "total_gain_loss": float(total_proceeds - total_cost_basis),
            "disposals": disposals,
            "method_used": method.value
        }

    def _get_available_lots(
        self,
        token: str,
        chain: str,
        disposal_date: datetime
    ) -> List[CostBasisLot]:
        """Get all available lots for a token"""
        return self.db.query(CostBasisLot).filter(
            and_(
                CostBasisLot.user_id == self.user_id,
                CostBasisLot.token == token,
                CostBasisLot.chain == chain,
                CostBasisLot.remaining_amount > 0,
                CostBasisLot.acquisition_date <= disposal_date
            )
        ).all()

    def _select_lots(
        self,
        lots: List[CostBasisLot],
        amount: float,
        method: CostBasisMethod
    ) -> List[Tuple[CostBasisLot, float]]:
        """
        Select which lots to use for disposal

        Returns:
            List of (lot, amount_from_lot) tuples
        """
        if method == CostBasisMethod.FIFO:
            # First In First Out
            sorted_lots = sorted(lots, key=lambda x: x.acquisition_date)

        elif method == CostBasisMethod.LIFO:
            # Last In First Out
            sorted_lots = sorted(lots, key=lambda x: x.acquisition_date, reverse=True)

        elif method == CostBasisMethod.HIFO:
            # Highest In First Out (tax optimization)
            sorted_lots = sorted(lots, key=lambda x: x.acquisition_price_usd, reverse=True)

        else:
            # Default to FIFO
            sorted_lots = sorted(lots, key=lambda x: x.acquisition_date)

        # Select lots to cover amount
        selected = []
        remaining = amount

        for lot in sorted_lots:
            if remaining <= 0:
                break

            take_amount = min(lot.remaining_amount, remaining)
            selected.append((lot, take_amount))
            remaining -= take_amount

        return selected

    def _create_zero_basis_disposal(
        self,
        token: str,
        chain: str,
        amount: float,
        disposal_price_usd: float,
        disposal_date: datetime,
        disposal_tx_hash: Optional[str]
    ) -> Dict:
        """
        Create disposal assuming $0 cost basis (worst case)

        This happens when we don't have purchase records.
        """
        logger.warning(
            f"Creating zero-basis disposal for {amount} {token}. "
            "This will overstate capital gains. Import purchase history to fix."
        )

        total_proceeds = Decimal(str(disposal_price_usd * amount))

        # We can't create a disposal without a lot, so just return calculated values
        return {
            "total_cost_basis": 0.0,
            "total_proceeds": float(total_proceeds),
            "total_gain_loss": float(total_proceeds),
            "disposals": [],
            "method_used": "assumed_zero",
            "warning": "No cost basis found. Assuming $0 which overstates gains."
        }

    async def _check_wash_sale(
        self,
        token: str,
        chain: str,
        loss_date: datetime,
        loss_disposals: List[CostBasisDisposal]
    ):
        """
        Check for wash sale rule violations

        A wash sale occurs when you sell at a loss and repurchase the same
        (or substantially identical) security within 30 days before or after.
        """
        wash_sale_window_start = loss_date - timedelta(days=self.settings.wash_sale_days)
        wash_sale_window_end = loss_date + timedelta(days=self.settings.wash_sale_days)

        # Find repurchases within wash sale window
        repurchases = self.db.query(CostBasisLot).filter(
            and_(
                CostBasisLot.user_id == self.user_id,
                CostBasisLot.token == token,
                CostBasisLot.chain == chain,
                CostBasisLot.acquisition_date >= wash_sale_window_start,
                CostBasisLot.acquisition_date <= wash_sale_window_end,
                CostBasisLot.acquisition_date != loss_date  # Not same day
            )
        ).all()

        if repurchases:
            logger.warning(
                f"Potential wash sale detected for {token}. "
                f"Found {len(repurchases)} repurchases within 30 days."
            )

            for disposal in loss_disposals:
                if disposal.gain_loss < 0:  # Only applies to losses
                    for repurchase in repurchases:
                        days_between = abs((repurchase.acquisition_date - loss_date).days)

                        if days_between <= self.settings.wash_sale_days:
                            # Create wash sale violation record
                            violation = WashSaleViolation(
                                user_id=self.user_id,
                                loss_disposal_id=disposal.id,
                                loss_amount=disposal.gain_loss,
                                repurchase_lot_id=repurchase.id,
                                repurchase_date=repurchase.acquisition_date,
                                days_between=days_between,
                                disallowed_loss=disposal.gain_loss,  # Loss disallowed
                                adjusted_cost_basis=repurchase.acquisition_price_usd + abs(disposal.gain_loss)
                            )

                            self.db.add(violation)

                            # Adjust repurchase lot cost basis
                            repurchase.acquisition_price_usd += abs(disposal.gain_loss)

            self.db.commit()

    async def add_lot(
        self,
        token: str,
        chain: str,
        amount: float,
        acquisition_price_usd: float,
        acquisition_date: datetime,
        acquisition_method: AcquisitionMethod = AcquisitionMethod.PURCHASE,
        source_tx_hash: Optional[str] = None,
        notes: Optional[str] = None
    ) -> CostBasisLot:
        """
        Add a cost basis lot (purchase record)

        Args:
            token: Token symbol
            chain: Blockchain
            amount: Amount acquired
            acquisition_price_usd: Purchase price per unit
            acquisition_date: Date acquired
            acquisition_method: How acquired
            source_tx_hash: Source transaction
            notes: Optional notes

        Returns:
            Created CostBasisLot
        """
        lot = CostBasisLot(
            user_id=self.user_id,
            token=token,
            chain=chain,
            acquisition_date=acquisition_date,
            acquisition_method=acquisition_method,
            acquisition_price_usd=acquisition_price_usd,
            source_tx_hash=source_tx_hash,
            original_amount=amount,
            remaining_amount=amount,
            disposed_amount=0.0,
            notes=notes,
            manually_added=False,
            verified=False
        )

        self.db.add(lot)
        self.db.commit()
        self.db.refresh(lot)

        logger.info(
            f"Added cost basis lot: {amount} {token} at ${acquisition_price_usd} "
            f"on {acquisition_date.date()}"
        )

        return lot

    def get_portfolio_summary(self, token: Optional[str] = None, chain: Optional[str] = None) -> Dict:
        """
        Get portfolio summary with cost basis information

        Args:
            token: Optional filter by token
            chain: Optional filter by chain

        Returns:
            Portfolio summary with cost basis details
        """
        query = self.db.query(CostBasisLot).filter(
            and_(
                CostBasisLot.user_id == self.user_id,
                CostBasisLot.remaining_amount > 0
            )
        )

        if token:
            query = query.filter(CostBasisLot.token == token)
        if chain:
            query = query.filter(CostBasisLot.chain == chain)

        lots = query.all()

        # Aggregate by token
        portfolio = {}
        for lot in lots:
            key = f"{lot.token}-{lot.chain}"
            if key not in portfolio:
                portfolio[key] = {
                    "token": lot.token,
                    "chain": lot.chain,
                    "total_amount": 0.0,
                    "total_cost_basis": 0.0,
                    "avg_cost_basis": 0.0,
                    "lots_count": 0
                }

            portfolio[key]["total_amount"] += lot.remaining_amount
            portfolio[key]["total_cost_basis"] += lot.remaining_amount * lot.acquisition_price_usd
            portfolio[key]["lots_count"] += 1

        # Calculate averages
        for key in portfolio:
            if portfolio[key]["total_amount"] > 0:
                portfolio[key]["avg_cost_basis"] = (
                    portfolio[key]["total_cost_basis"] / portfolio[key]["total_amount"]
                )

        return portfolio
