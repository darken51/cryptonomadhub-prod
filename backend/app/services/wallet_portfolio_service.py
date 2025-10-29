"""
Wallet Portfolio Service

Manages wallet portfolio calculations, snapshots, and historical tracking.
"""

import logging
from typing import Dict, List, Optional
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_

from app.models.user_wallet import UserWallet
from app.models.wallet_snapshot import WalletSnapshot
from app.models.wallet_value_history import WalletValueHistory
from app.models.cost_basis import CostBasisLot, UserCostBasisSettings
from app.models.regulation import Regulation
from app.services.multi_chain_balance_service import MultiChainBalanceService
from app.services.price_service import PriceService
from app.dependencies.exchange_rate import get_exchange_rate_service

logger = logging.getLogger(__name__)


class WalletPortfolioService:
    """Service for wallet portfolio calculations and tracking"""

    def __init__(self, db: Session):
        self.db = db
        self.balance_service = MultiChainBalanceService()
        self.price_service = PriceService()

    async def calculate_wallet_value(
        self,
        wallet_id: int,
        user_id: int
    ) -> Dict[str, any]:
        """
        Calculate current value of a wallet

        Args:
            wallet_id: Wallet ID
            user_id: User ID

        Returns:
            {
                "total_value_usd": Decimal,
                "total_cost_basis": Decimal,
                "total_unrealized_gain_loss": Decimal,
                "unrealized_gain_loss_percent": Decimal,
                "positions": [],
                "total_tokens": int,
                "total_chains": int
            }
        """
        import time
        start_time = time.time()

        wallet = self.db.query(UserWallet).filter(
            UserWallet.id == wallet_id,
            UserWallet.user_id == user_id
        ).first()

        if not wallet:
            raise ValueError(f"Wallet {wallet_id} not found")

        # Get on-chain balances
        balance_start = time.time()
        balances = await self.balance_service.get_wallet_balances(
            wallet.wallet_address,
            wallet.chain
        )
        balance_time = time.time() - balance_start
        logger.info(f"[PERF] Wallet {wallet_id} - Balance fetch: {balance_time:.2f}s")

        # ⚡ PERFORMANCE: Collect all tokens first, then batch fetch prices
        positions = []
        total_value_usd = Decimal("0")
        total_cost_basis = Decimal("0")

        # Collect all token symbols
        all_tokens = []
        native_balance = balances.get("native_balance", Decimal("0"))
        chain_symbol = None

        if native_balance > 0:
            chain_symbol = self._get_chain_native_symbol(wallet.chain)
            all_tokens.append(chain_symbol)

        for token in balances.get("tokens", []):
            if token.get("balance_formatted", Decimal("0")) > 0:
                all_tokens.append(token.get("symbol", "UNKNOWN"))

        # ⚡ BATCH FETCH: Get ALL prices in ONE API call
        price_start = time.time()
        token_prices = self.price_service.get_current_prices_batch(all_tokens)
        price_time = time.time() - price_start
        logger.info(f"[PERF] Wallet {wallet_id} - Price fetch for {len(all_tokens)} tokens: {price_time:.2f}s")

        # Native token
        if native_balance > 0 and chain_symbol:
            native_price = token_prices.get(chain_symbol) or Decimal("0")

            native_value = native_balance * native_price
            native_cost = await self._get_cost_basis(
                user_id,
                chain_symbol,
                wallet.chain,
                native_balance
            )

            total_value_usd += native_value
            total_cost_basis += native_cost

            positions.append({
                "token": chain_symbol,
                "token_address": None,
                "chain": wallet.chain,
                "amount": float(native_balance),
                "price_usd": float(native_price),
                "value_usd": float(native_value),
                "cost_basis": float(native_cost),
                "unrealized_gain_loss": float(native_value - native_cost)
            })

        # ERC20/SPL tokens
        for token in balances.get("tokens", []):
            balance = token.get("balance_formatted", Decimal("0"))
            if balance <= 0:
                continue

            symbol = token.get("symbol", "UNKNOWN")
            price = token_prices.get(symbol) or Decimal("0")

            value_usd = balance * price
            cost_basis = await self._get_cost_basis(
                user_id,
                symbol,
                wallet.chain,
                balance
            )

            total_value_usd += value_usd
            total_cost_basis += cost_basis

            positions.append({
                "token": symbol,
                "token_address": token.get("token_address"),
                "chain": wallet.chain,
                "amount": float(balance),
                "price_usd": float(price),
                "value_usd": float(value_usd),
                "cost_basis": float(cost_basis),
                "unrealized_gain_loss": float(value_usd - cost_basis)
            })

        total_unrealized_gain_loss = total_value_usd - total_cost_basis
        unrealized_gain_loss_percent = (
            (total_unrealized_gain_loss / total_cost_basis * 100)
            if total_cost_basis > 0
            else Decimal("0")
        )

        total_time = time.time() - start_time
        logger.info(f"[PERF] Wallet {wallet_id} - TOTAL calculation time: {total_time:.2f}s")

        return {
            "total_value_usd": total_value_usd,
            "total_cost_basis": total_cost_basis,
            "total_unrealized_gain_loss": total_unrealized_gain_loss,
            "unrealized_gain_loss_percent": unrealized_gain_loss_percent,
            "positions": positions,
            "total_tokens": len(positions),
            "total_chains": 1
        }

    async def create_snapshot(
        self,
        wallet_id: int,
        user_id: int,
        snapshot_date: Optional[datetime] = None
    ) -> WalletSnapshot:
        """
        Create a wallet snapshot

        Args:
            wallet_id: Wallet ID
            user_id: User ID
            snapshot_date: Date for snapshot (default: now)

        Returns:
            WalletSnapshot instance
        """
        if snapshot_date is None:
            snapshot_date = datetime.utcnow()

        # Calculate current value
        portfolio = await self.calculate_wallet_value(wallet_id, user_id)

        # Get currency info
        local_currency_data = await self._get_local_currency_data(user_id)

        # Create snapshot
        snapshot = WalletSnapshot(
            user_id=user_id,
            wallet_id=wallet_id,
            snapshot_date=snapshot_date,
            total_value_usd=portfolio["total_value_usd"],
            total_cost_basis=portfolio["total_cost_basis"],
            total_unrealized_gain_loss=portfolio["total_unrealized_gain_loss"],
            unrealized_gain_loss_percent=portfolio["unrealized_gain_loss_percent"],
            positions=portfolio["positions"],
            total_tokens=portfolio["total_tokens"],
            total_chains=portfolio["total_chains"],
            **local_currency_data
        )

        self.db.add(snapshot)
        self.db.commit()
        self.db.refresh(snapshot)

        logger.info(f"Created snapshot for wallet {wallet_id}: ${portfolio['total_value_usd']}")

        return snapshot

    async def calculate_24h_change(
        self,
        wallet_id: int,
        user_id: int
    ) -> Dict[str, any]:
        """
        Calculate 24h change for a wallet

        Args:
            wallet_id: Wallet ID
            user_id: User ID

        Returns:
            {
                "current_value_usd": Decimal,
                "previous_value_usd": Decimal,
                "change_24h_usd": Decimal,
                "change_24h_percent": Decimal
            }
        """
        # Get current value
        current_portfolio = await self.calculate_wallet_value(wallet_id, user_id)
        current_value = current_portfolio["total_value_usd"]

        # Get snapshot from 24h ago
        yesterday = datetime.utcnow() - timedelta(hours=24)
        previous_snapshot = self.db.query(WalletSnapshot).filter(
            WalletSnapshot.wallet_id == wallet_id,
            WalletSnapshot.snapshot_date <= yesterday
        ).order_by(desc(WalletSnapshot.snapshot_date)).first()

        if previous_snapshot:
            previous_value = Decimal(previous_snapshot.total_value_usd)
        else:
            # No history, use current as baseline
            previous_value = current_value

        change_24h_usd = current_value - previous_value
        change_24h_percent = (
            (change_24h_usd / previous_value * 100)
            if previous_value > 0
            else Decimal("0")
        )

        return {
            "current_value_usd": current_value,
            "previous_value_usd": previous_value,
            "change_24h_usd": change_24h_usd,
            "change_24h_percent": change_24h_percent
        }

    async def get_consolidated_portfolio(
        self,
        user_id: int
    ) -> Dict[str, any]:
        """
        Get consolidated portfolio across ALL user wallets

        Args:
            user_id: User ID

        Returns:
            Aggregated portfolio data
        """
        import time
        start_time = time.time()
        logger.info(f"[PERF] User {user_id} - Starting consolidated portfolio calculation")

        wallets = self.db.query(UserWallet).filter(
            UserWallet.user_id == user_id,
            UserWallet.is_active == True
        ).all()

        logger.info(f"[PERF] User {user_id} - Found {len(wallets)} active wallets")

        if not wallets:
            return {
                "total_value_usd": Decimal("0"),
                "total_cost_basis": Decimal("0"),
                "total_unrealized_gain_loss": Decimal("0"),
                "unrealized_gain_loss_percent": Decimal("0"),
                "wallets": [],
                "total_positions": [],
                "total_tokens": 0,
                "total_chains": 0
            }

        total_value_usd = Decimal("0")
        total_cost_basis = Decimal("0")
        wallets_data = []
        all_positions = {}  # {token_symbol: aggregated_data}
        chains_set = set()

        # ⚡ PERFORMANCE: Calculate ALL wallets in PARALLEL instead of sequential loop
        import asyncio
        parallel_start = time.time()
        wallet_tasks = [
            self.calculate_wallet_value(wallet.id, user_id)
            for wallet in wallets
        ]
        wallet_portfolios = await asyncio.gather(*wallet_tasks, return_exceptions=True)
        parallel_time = time.time() - parallel_start
        logger.info(f"[PERF] User {user_id} - Parallel wallet calculations: {parallel_time:.2f}s")

        for wallet, wallet_portfolio in zip(wallets, wallet_portfolios):
            # Skip failed wallets
            if isinstance(wallet_portfolio, Exception):
                logger.error(f"Error calculating wallet {wallet.id}: {wallet_portfolio}")
                continue

            try:

                total_value_usd += wallet_portfolio["total_value_usd"]
                total_cost_basis += wallet_portfolio["total_cost_basis"]

                wallets_data.append({
                    "id": wallet.id,
                    "name": wallet.wallet_name,
                    "address": wallet.wallet_address,
                    "chain": wallet.chain,
                    "value_usd": float(wallet_portfolio["total_value_usd"]),
                    "unrealized_gain_loss": float(wallet_portfolio["total_unrealized_gain_loss"]),
                    "positions": wallet_portfolio["positions"]
                })

                chains_set.add(wallet.chain)

                # Aggregate positions
                for position in wallet_portfolio["positions"]:
                    token = position["token"]
                    if token not in all_positions:
                        all_positions[token] = {
                            "token": token,
                            "total_amount": 0,
                            "total_value_usd": 0,
                            "total_cost_basis": 0,
                            "chains": set()
                        }

                    all_positions[token]["total_amount"] += position["amount"]
                    all_positions[token]["total_value_usd"] += position["value_usd"]
                    all_positions[token]["total_cost_basis"] += position["cost_basis"]
                    all_positions[token]["chains"].add(position["chain"])

            except Exception as e:
                logger.error(f"Error calculating wallet {wallet.id}: {e}")
                continue

        # Format total positions
        total_positions = [
            {
                "token": pos["token"],
                "total_amount": pos["total_amount"],
                "total_value_usd": pos["total_value_usd"],
                "total_cost_basis": pos["total_cost_basis"],
                "unrealized_gain_loss": pos["total_value_usd"] - pos["total_cost_basis"],
                "chains": list(pos["chains"])
            }
            for pos in all_positions.values()
        ]

        total_unrealized_gain_loss = total_value_usd - total_cost_basis
        unrealized_gain_loss_percent = (
            (total_unrealized_gain_loss / total_cost_basis * 100)
            if total_cost_basis > 0
            else Decimal("0")
        )

        total_time = time.time() - start_time
        logger.info(f"[PERF] User {user_id} - TOTAL consolidated portfolio time: {total_time:.2f}s")

        return {
            "total_value_usd": total_value_usd,
            "total_cost_basis": total_cost_basis,
            "total_unrealized_gain_loss": total_unrealized_gain_loss,
            "unrealized_gain_loss_percent": unrealized_gain_loss_percent,
            "wallets": wallets_data,
            "total_positions": total_positions,
            "total_tokens": len(all_positions),
            "total_chains": len(chains_set)
        }

    # Helper methods

    async def _get_token_price(self, symbol: str) -> Decimal:
        """Get current token price in USD"""
        try:
            price = self.price_service.get_current_price(symbol)
            return Decimal(str(price)) if price else Decimal("0")
        except Exception as e:
            logger.warning(f"Failed to get price for {symbol}: {e}")
            return Decimal("0")

    async def _get_cost_basis(
        self,
        user_id: int,
        token: str,
        chain: str,
        amount: Decimal
    ) -> Decimal:
        """Get cost basis from CostBasisLots"""
        lots = self.db.query(CostBasisLot).filter(
            CostBasisLot.user_id == user_id,
            CostBasisLot.token == token.upper(),
            CostBasisLot.chain == chain.lower(),
            CostBasisLot.remaining_amount > 0
        ).order_by(CostBasisLot.acquisition_date).all()

        if not lots:
            return Decimal("0")

        total_cost = Decimal("0")
        remaining = amount

        for lot in lots:
            if remaining <= 0:
                break

            lot_amount = min(Decimal(str(lot.remaining_amount)), remaining)
            lot_cost = lot_amount * Decimal(str(lot.acquisition_price_usd))
            total_cost += lot_cost
            remaining -= lot_amount

        return total_cost

    async def _get_local_currency_data(self, user_id: int) -> Dict[str, any]:
        """Get local currency conversion data"""
        cost_basis_settings = self.db.query(UserCostBasisSettings).filter(
            UserCostBasisSettings.user_id == user_id
        ).first()

        if not cost_basis_settings or not cost_basis_settings.tax_jurisdiction:
            return {
                "total_value_local": None,
                "total_cost_basis_local": None,
                "total_unrealized_gain_loss_local": None,
                "local_currency": None,
                "currency_symbol": None,
                "exchange_rate": None
            }

        regulation = self.db.query(Regulation).filter(
            Regulation.country_code == cost_basis_settings.tax_jurisdiction
        ).first()

        if not regulation or not regulation.currency_code:
            return {
                "total_value_local": None,
                "total_cost_basis_local": None,
                "total_unrealized_gain_loss_local": None,
                "local_currency": None,
                "currency_symbol": None,
                "exchange_rate": None
            }

        try:
            exchange_service = get_exchange_rate_service()
            rate, source = await exchange_service.get_exchange_rate(
                from_currency="USD",
                to_currency=regulation.currency_code
            )

            if rate:
                return {
                    "total_value_local": None,  # Will be calculated
                    "total_cost_basis_local": None,
                    "total_unrealized_gain_loss_local": None,
                    "local_currency": regulation.currency_code,
                    "currency_symbol": regulation.currency_symbol,
                    "exchange_rate": rate
                }
        except Exception as e:
            logger.warning(f"Failed to get exchange rate: {e}")

        return {
            "total_value_local": None,
            "total_cost_basis_local": None,
            "total_unrealized_gain_loss_local": None,
            "local_currency": None,
            "currency_symbol": None,
            "exchange_rate": None
        }

    def _get_chain_native_symbol(self, chain: str) -> str:
        """Get native token symbol for a chain"""
        NATIVE_SYMBOLS = {
            "ethereum": "ETH",
            "polygon": "MATIC",
            "bsc": "BNB",
            "arbitrum": "ETH",
            "optimism": "ETH",
            "avalanche": "AVAX",
            "base": "ETH",
            "fantom": "FTM",
            "solana": "SOL",
            "bitcoin": "BTC",
        }
        return NATIVE_SYMBOLS.get(chain.lower(), "ETH")
