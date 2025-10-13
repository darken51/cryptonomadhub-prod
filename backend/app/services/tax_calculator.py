"""
Tax Calculator Service

Calculates capital gains/losses and tax categorization for crypto transactions
Uses FIFO (First In First Out) accounting method
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class TaxCalculator:
    """
    Calculate crypto tax obligations using FIFO method

    Tracks:
    - Capital gains/losses (short-term vs long-term)
    - Ordinary income (staking, rewards, airdrops)
    - Cost basis tracking per token
    """

    def __init__(self):
        # Track holdings: {token_symbol: [(quantity, cost_basis, date_acquired), ...]}
        self.holdings = defaultdict(list)

        # Track total stats
        self.short_term_gains = Decimal(0)
        self.long_term_gains = Decimal(0)
        self.ordinary_income = Decimal(0)
        self.total_fees = Decimal(0)

    def process_transaction(self, tx_data: Dict) -> Dict:
        """
        Process a single transaction and calculate tax implications

        Args:
            tx_data: Transaction data with type, tokens, amounts, USD values

        Returns:
            Dict with tax categorization and gain/loss
        """
        tx_type = tx_data.get("transaction_type", "").lower()
        timestamp = tx_data.get("timestamp")

        # Initialize result
        result = {
            "tax_category": "unknown",
            "gain_loss_usd": None,
            "holding_period_days": None
        }

        # Handle different transaction types
        if tx_type in ["swap", "exchange", "trade"]:
            # Swap = Sell token_in, Buy token_out
            result = self._process_swap(tx_data)

        elif tx_type in ["provide_liquidity", "add_liquidity"]:
            # Add liquidity = Buy LP tokens with token_in
            result = self._process_liquidity_add(tx_data)

        elif tx_type in ["remove_liquidity", "withdraw"]:
            # Remove liquidity = Sell LP tokens for tokens
            result = self._process_liquidity_remove(tx_data)

        elif tx_type in ["deposit", "lend", "stake"]:
            # Deposit = Buy interest-bearing token
            result = self._process_deposit(tx_data)

        elif tx_type in ["borrow"]:
            # Borrow = Non-taxable event (incurred debt)
            result["tax_category"] = "non_taxable"

        elif tx_type in ["repay"]:
            # Repay = Non-taxable (paying debt)
            result["tax_category"] = "non_taxable"

        elif tx_type in ["claim_rewards", "claim"]:
            # Rewards = Ordinary income
            result = self._process_rewards(tx_data)

        elif tx_type in ["transfer", "token_transfer"]:
            # Simple transfer (could be buy/sell)
            result = self._process_transfer(tx_data)

        elif tx_type in ["token_approval", "approve"]:
            # Approval = Non-taxable
            result["tax_category"] = "non_taxable"

        else:
            # Unknown transaction type
            result["tax_category"] = "unknown"

        # Track fees
        gas_fee = tx_data.get("gas_fee_usd", 0)
        if gas_fee:
            self.total_fees += Decimal(str(gas_fee))

        return result

    def _process_swap(self, tx_data: Dict) -> Dict:
        """Process a swap/trade transaction"""
        token_in = tx_data.get("token_in", "ETH")  # Token sold
        token_out = tx_data.get("token_out", "USDC")  # Token bought
        amount_in = tx_data.get("amount_in", 0)
        amount_out = tx_data.get("amount_out", 0)
        usd_value_in = Decimal(str(tx_data.get("usd_value_in", 0)))
        usd_value_out = Decimal(str(tx_data.get("usd_value_out", 0)))
        timestamp = tx_data.get("timestamp")

        # Selling token_in
        if amount_in and amount_in > 0:
            gain_loss, holding_days = self._calculate_capital_gain(
                token=token_in,
                amount_sold=Decimal(str(amount_in)),
                sale_price_usd=usd_value_in,
                sale_date=timestamp
            )

            # Track gains
            if holding_days and holding_days >= 365:
                self.long_term_gains += gain_loss
            else:
                self.short_term_gains += gain_loss

            tax_category = "capital_gains"

            # Add token_out to holdings
            if amount_out and amount_out > 0:
                cost_basis = usd_value_in if usd_value_in else usd_value_out
                self._add_to_holdings(
                    token=token_out,
                    amount=Decimal(str(amount_out)),
                    cost_basis_usd=cost_basis,
                    date_acquired=timestamp
                )

            return {
                "tax_category": tax_category,
                "gain_loss_usd": float(gain_loss),
                "holding_period_days": holding_days
            }

        return {"tax_category": "capital_gains", "gain_loss_usd": 0, "holding_period_days": 0}

    def _process_transfer(self, tx_data: Dict) -> Dict:
        """Process a simple transfer"""
        value = tx_data.get("value", "0")
        usd_value = Decimal(str(tx_data.get("usd_value_in", 0)))

        # If it's a purchase (receiving crypto)
        if value != "0" and usd_value > 0:
            # This is a buy - add to holdings
            native_token = "ETH"  # Should get from chain
            self._add_to_holdings(
                token=native_token,
                amount=Decimal(str(value)) / Decimal("1e18"),  # Convert Wei
                cost_basis_usd=usd_value,
                date_acquired=tx_data.get("timestamp")
            )
            return {"tax_category": "non_taxable", "gain_loss_usd": None, "holding_period_days": None}

        return {"tax_category": "unknown", "gain_loss_usd": None, "holding_period_days": None}

    def _process_deposit(self, tx_data: Dict) -> Dict:
        """Process deposit/lending/staking"""
        # Depositing is like buying an interest-bearing token
        # Not a taxable event, but track the position
        return {"tax_category": "non_taxable", "gain_loss_usd": None, "holding_period_days": None}

    def _process_liquidity_add(self, tx_data: Dict) -> Dict:
        """Process adding liquidity"""
        # Adding liquidity = buying LP tokens (non-taxable)
        return {"tax_category": "non_taxable", "gain_loss_usd": None, "holding_period_days": None}

    def _process_liquidity_remove(self, tx_data: Dict) -> Dict:
        """Process removing liquidity"""
        # Removing liquidity = selling LP tokens (taxable)
        usd_value = Decimal(str(tx_data.get("usd_value_out", 0)))

        # This is a disposal event
        return {
            "tax_category": "capital_gains",
            "gain_loss_usd": 0,  # Need more data to calculate
            "holding_period_days": 0
        }

    def _process_rewards(self, tx_data: Dict) -> Dict:
        """Process reward claims (staking rewards, etc)"""
        # Rewards are ordinary income at the time received
        usd_value = Decimal(str(tx_data.get("usd_value_out", 0)))

        if usd_value > 0:
            self.ordinary_income += usd_value

        return {
            "tax_category": "income",
            "gain_loss_usd": float(usd_value),
            "holding_period_days": 0
        }

    def _calculate_capital_gain(
        self,
        token: str,
        amount_sold: Decimal,
        sale_price_usd: Decimal,
        sale_date: datetime
    ) -> Tuple[Decimal, Optional[int]]:
        """
        Calculate capital gain/loss using FIFO

        Returns:
            (gain_loss_usd, holding_period_days)
        """
        if token not in self.holdings or not self.holdings[token]:
            # No cost basis - assume 0 (worst case for user)
            return (sale_price_usd, 0)

        total_gain_loss = Decimal(0)
        remaining_to_sell = amount_sold
        holding_days = None

        # FIFO: Sell oldest holdings first
        while remaining_to_sell > 0 and self.holdings[token]:
            quantity, cost_basis, date_acquired = self.holdings[token][0]

            if quantity <= remaining_to_sell:
                # Sell entire lot
                cost_per_unit = cost_basis / quantity if quantity > 0 else Decimal(0)
                sale_per_unit = sale_price_usd / amount_sold if amount_sold > 0 else Decimal(0)

                lot_gain = (sale_per_unit - cost_per_unit) * quantity
                total_gain_loss += lot_gain

                # Calculate holding period
                if date_acquired:
                    days_held = (sale_date - date_acquired).days
                    if holding_days is None:
                        holding_days = days_held

                remaining_to_sell -= quantity
                self.holdings[token].pop(0)
            else:
                # Partial sale of this lot
                cost_per_unit = cost_basis / quantity if quantity > 0 else Decimal(0)
                sale_per_unit = sale_price_usd / amount_sold if amount_sold > 0 else Decimal(0)

                lot_gain = (sale_per_unit - cost_per_unit) * remaining_to_sell
                total_gain_loss += lot_gain

                # Calculate holding period
                if date_acquired:
                    days_held = (sale_date - date_acquired).days
                    if holding_days is None:
                        holding_days = days_held

                # Update remaining quantity in lot
                new_quantity = quantity - remaining_to_sell
                new_cost_basis = cost_per_unit * new_quantity
                self.holdings[token][0] = (new_quantity, new_cost_basis, date_acquired)

                remaining_to_sell = Decimal(0)

        return (total_gain_loss, holding_days or 0)

    def _add_to_holdings(
        self,
        token: str,
        amount: Decimal,
        cost_basis_usd: Decimal,
        date_acquired: datetime
    ):
        """Add a token purchase to holdings"""
        if amount > 0:
            self.holdings[token].append((amount, cost_basis_usd, date_acquired))

    def get_summary(self) -> Dict:
        """Get tax summary"""
        return {
            "short_term_gains": float(self.short_term_gains),
            "long_term_gains": float(self.long_term_gains),
            "ordinary_income": float(self.ordinary_income),
            "total_fees": float(self.total_fees),
            "total_gains": float(self.short_term_gains + self.long_term_gains),
            "total_losses": float(min(self.short_term_gains + self.long_term_gains, 0))
        }
