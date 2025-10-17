"""
DeFi Audit Service

Orchestrates complete DeFi activity audit for users
"""

from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.defi_protocol import (
    DeFiAudit, DeFiTransaction, DeFiProtocol,
    TransactionType, ProtocolType
)
from app.models.user import User
from app.models.cost_basis import CostBasisLot, CostBasisDisposal
from app.services.blockchain_parser import BlockchainParser
from app.services.defi_connectors import DeFiConnectorFactory
import logging
import json

logger = logging.getLogger(__name__)


def convert_datetime_to_string(obj: Any) -> Any:
    """
    Recursively convert datetime objects to ISO format strings in dicts/lists

    This is needed because PostgreSQL JSON columns can't store Python datetime objects
    """
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: convert_datetime_to_string(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_datetime_to_string(item) for item in obj]
    else:
        return obj


class DeFiAuditService:
    """
    Complete DeFi audit service

    Workflow:
    1. Fetch transactions from blockchain
    2. Parse and categorize each transaction
    3. Calculate tax implications
    4. Generate comprehensive report
    """

    def __init__(self, db: Session):
        self.db = db
        # Initialize blockchain parser with API keys
        # Single Etherscan API key works for 50+ EVM chains
        # Solana uses separate Helius API key
        from app.config import settings
        api_keys = {
            "etherscan": settings.ETHERSCAN_API_KEY,
            "solana": settings.SOLANA_API_KEY
        }
        self.parser = BlockchainParser(api_keys=api_keys)

    async def create_audit(
        self,
        user_id: int,
        wallet_address: str,
        chains: List[str],
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> DeFiAudit:
        """
        Create new DeFi audit for user

        Args:
            user_id: User ID
            wallet_address: Wallet address to audit
            chains: List of blockchains to scan
            start_date: Start of audit period (default: 1 year ago)
            end_date: End of audit period (default: today)

        Returns:
            DeFiAudit instance
        """
        # Default date range: last tax year
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=365)
        if not end_date:
            end_date = datetime.utcnow()

        # Create audit record
        audit = DeFiAudit(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            chains=chains,
            status="processing"
        )
        self.db.add(audit)
        self.db.commit()
        self.db.refresh(audit)

        logger.info(f"Created DeFi audit {audit.id} for user {user_id}")

        # Start processing (in background in production)
        try:
            await self._process_audit(audit, wallet_address)
        except Exception as e:
            audit.status = "failed"
            audit.error_message = str(e)
            self.db.commit()
            logger.error(f"Audit {audit.id} failed: {e}")
            raise

        return audit

    async def _process_audit(self, audit: DeFiAudit, wallet_address: str):
        """Process audit - parse transactions and calculate taxes"""

        print(f"=== AUDIT PROCESSING STARTED ===")
        print(f"Audit ID: {audit.id}")
        print(f"Wallet: {wallet_address}")
        print(f"Chains: {audit.chains}")
        print(f"Date range: {audit.start_date} to {audit.end_date}")
        logger.info(f"=== Starting audit processing for audit {audit.id} ===")
        logger.info(f"Wallet: {wallet_address}, Chains: {audit.chains}")
        logger.info(f"Date range: {audit.start_date} to {audit.end_date}")

        all_transactions = []

        # Scan each blockchain
        print(f"About to scan {len(audit.chains)} chains")
        for chain in audit.chains:
            print(f"Scanning chain: {chain}")
            logger.info(f"Scanning {chain} for wallet {wallet_address}")

            # Parse transactions
            print(f"Calling parser.parse_wallet_transactions...")
            txs = await self.parser.parse_wallet_transactions(
                wallet_address=wallet_address,
                chain=chain,
                start_date=audit.start_date,
                end_date=audit.end_date
            )
            print(f"Parser returned {len(txs)} transactions")

            # Categorize and save each transaction
            print(f"Processing {len(txs)} transactions for chain {chain}...")
            for tx in txs:
                defi_tx = await self._process_transaction(tx, audit.id, audit.user_id)
                if defi_tx:
                    all_transactions.append(defi_tx)
                    print(f"Transaction added: {tx.get('tx_hash')}")
                else:
                    print(f"Transaction skipped: {tx.get('tx_hash')}")

        print(f"Total transactions to save: {len(all_transactions)}")
        # Calculate summary statistics
        summary = self._calculate_summary(all_transactions)

        # Update audit with results
        audit.total_transactions = len(all_transactions)
        audit.total_volume_usd = summary["total_volume_usd"]
        audit.total_gains_usd = summary["total_gains_usd"]
        audit.total_losses_usd = summary["total_losses_usd"]
        audit.total_fees_usd = summary["total_fees_usd"]
        audit.short_term_gains = summary["short_term_gains"]
        audit.long_term_gains = summary["long_term_gains"]
        audit.ordinary_income = summary["ordinary_income"]
        audit.protocols_used = summary["protocols_breakdown"]
        audit.result_summary = summary["detailed_breakdown"]
        audit.status = "completed"
        audit.completed_at = datetime.utcnow()

        self.db.commit()

        logger.info(f"Audit {audit.id} completed: {len(all_transactions)} transactions processed")

    async def _process_transaction(
        self,
        tx_data: Dict,
        audit_id: int,
        user_id: int
    ) -> Optional[DeFiTransaction]:
        """
        Process single transaction

        Args:
            tx_data: Raw transaction data
            audit_id: Parent audit ID
            user_id: User ID who owns this transaction

        Returns:
            DeFiTransaction instance or None
        """
        # Get or create protocol
        protocol = self._get_or_create_protocol(
            name=tx_data.get("protocol_name"),
            protocol_type=tx_data.get("protocol_type"),
            chain=tx_data.get("chain")
        )

        # Use protocol-specific connector to parse details
        connector = DeFiConnectorFactory.get_connector(
            protocol_name=tx_data.get("protocol_name", ""),
            chain=tx_data.get("chain", "ethereum")
        )

        # Determine tax category
        tax_info = self._categorize_tax_treatment(
            transaction_type=tx_data.get("transaction_type"),
            protocol_type=tx_data.get("protocol_type")
        )

        # For income transactions (staking, rewards), set gain_loss to the value received
        if tax_info.get("category") == "income" and not tax_info.get("gain_loss"):
            # Use the value of tokens received as the taxable income
            tax_info["gain_loss"] = tx_data.get("usd_value_out", 0)

        # For capital gains transactions (swaps, sells), calculate using cost basis if available
        if tax_info.get("category") == "capital_gains" and tx_data.get("token_out") and tx_data.get("amount_out"):
            cost_basis_result = self._calculate_gain_loss_with_cost_basis(
                user_id=user_id,
                token_out=tx_data.get("token_out"),
                amount_out=tx_data.get("amount_out"),
                usd_value_out=tx_data.get("usd_value_out", 0),
                timestamp=tx_data.get("timestamp")
            )

            if cost_basis_result:
                tax_info["gain_loss"] = cost_basis_result["gain_loss"]
                tax_info["holding_period_days"] = cost_basis_result["holding_period_days"]
                print(f"[COST BASIS] Calculated gain/loss: ${cost_basis_result['gain_loss']:.2f} using {cost_basis_result['method']} method")

        # Create transaction record
        # Convert datetime objects to strings for JSON storage
        raw_data_clean = convert_datetime_to_string(tx_data)

        # Check if transaction already exists (by tx_hash)
        tx_hash = tx_data.get("tx_hash")
        existing_tx = self.db.query(DeFiTransaction).filter(
            DeFiTransaction.tx_hash == tx_hash
        ).first()

        if existing_tx:
            # Transaction already exists, link it to this audit
            print(f"[DEBUG] Transaction {tx_hash} already exists, linking to audit {audit_id}...")
            existing_tx.audit_id = audit_id
            self.db.commit()
            return existing_tx

        print(f"[DEBUG] Creating new transaction {tx_hash}...")

        defi_tx = DeFiTransaction(
            user_id=user_id,
            protocol_id=protocol.id if protocol else None,
            audit_id=audit_id,
            tx_hash=tx_hash,
            chain=tx_data.get("chain"),
            block_number=tx_data.get("block_number"),
            timestamp=tx_data.get("timestamp"),
            transaction_type=self._map_transaction_type(tx_data.get("transaction_type")),
            tax_category=tax_info["category"],
            token_in=tx_data.get("token_in"),
            amount_in=tx_data.get("amount_in"),
            token_out=tx_data.get("token_out"),
            amount_out=tx_data.get("amount_out"),
            usd_value_in=tx_data.get("usd_value_in"),
            usd_value_out=tx_data.get("usd_value_out"),
            gas_fee_usd=tx_data.get("gas_fee_usd"),
            protocol_fee_usd=tx_data.get("protocol_fee_usd"),
            gain_loss_usd=tax_info.get("gain_loss"),
            holding_period_days=tax_info.get("holding_period_days"),
            raw_data=raw_data_clean,
            manually_verified="pending"
        )

        self.db.add(defi_tx)
        self.db.commit()

        return defi_tx

    def _get_or_create_protocol(
        self,
        name: str,
        protocol_type: str,
        chain: str
    ) -> Optional[DeFiProtocol]:
        """Get existing protocol or create new one"""

        # For "Unknown" protocols, make name unique per chain
        unique_name = f"{name} ({chain})" if name == "Unknown" else name

        # Check if exists
        protocol = self.db.query(DeFiProtocol).filter(
            DeFiProtocol.name == unique_name
        ).first()

        if protocol:
            return protocol

        # Create new
        protocol = DeFiProtocol(
            name=unique_name,
            protocol_type=self._map_protocol_type(protocol_type),
            chain=chain,
            supported="active"
        )
        self.db.add(protocol)
        self.db.commit()

        return protocol

    def _map_protocol_type(self, type_str: str) -> ProtocolType:
        """Map string to ProtocolType enum"""
        type_lower = type_str.lower()
        if "dex" in type_lower or "swap" in type_lower:
            return ProtocolType.DEX
        elif "lend" in type_lower or "aave" in type_lower or "compound" in type_lower:
            return ProtocolType.LENDING
        elif "yield" in type_lower:
            return ProtocolType.YIELD
        elif "stake" in type_lower or "staking" in type_lower:
            return ProtocolType.STAKING
        elif "pool" in type_lower or "liquidity" in type_lower:
            return ProtocolType.LIQUIDITY_POOL
        else:
            return ProtocolType.OTHER

    def _map_transaction_type(self, type_str: str) -> TransactionType:
        """Map string to TransactionType enum"""
        type_lower = type_str.lower()

        if "swap" in type_lower:
            return TransactionType.SWAP
        elif "provide" in type_lower or "add_liquidity" in type_lower:
            return TransactionType.PROVIDE_LIQUIDITY
        elif "remove" in type_lower or "remove_liquidity" in type_lower:
            return TransactionType.REMOVE_LIQUIDITY
        elif "stake" in type_lower and "unstake" not in type_lower:
            return TransactionType.STAKE
        elif "unstake" in type_lower:
            return TransactionType.UNSTAKE
        elif "lend" in type_lower or "deposit" in type_lower:
            return TransactionType.LEND
        elif "borrow" in type_lower:
            return TransactionType.BORROW
        elif "repay" in type_lower:
            return TransactionType.REPAY
        elif "claim" in type_lower or "reward" in type_lower:
            return TransactionType.CLAIM_REWARDS
        elif "withdraw" in type_lower:
            return TransactionType.WITHDRAW
        else:
            return TransactionType.DEPOSIT

    def _categorize_tax_treatment(
        self,
        transaction_type: str,
        protocol_type: str
    ) -> Dict:
        """
        Categorize tax treatment for transaction

        Returns:
            Dict with category, taxable status, notes
        """
        type_lower = transaction_type.lower()

        if "swap" in type_lower:
            return {
                "category": "capital_gains",
                "taxable": True,
                "notes": "Token swap is taxable event"
            }

        elif "provide_liquidity" in type_lower or "add_liquidity" in type_lower:
            return {
                "category": "capital_gains",
                "taxable": True,
                "notes": "Providing liquidity may trigger taxable event"
            }

        elif "remove_liquidity" in type_lower:
            return {
                "category": "capital_gains",
                "taxable": True,
                "notes": "Removing liquidity + fees earned are taxable"
            }

        elif "claim_rewards" in type_lower or "reward" in type_lower:
            return {
                "category": "income",
                "taxable": True,
                "notes": "Rewards are taxable as income"
            }

        elif "lend" in type_lower or "deposit" in type_lower:
            return {
                "category": "non_taxable",
                "taxable": False,
                "notes": "Depositing is not taxable. Interest earned later is taxable."
            }

        elif "withdraw" in type_lower and protocol_type == "lending":
            return {
                "category": "income",
                "taxable": True,
                "notes": "Interest earned is taxable income"
            }

        elif "borrow" in type_lower or "repay" in type_lower:
            return {
                "category": "non_taxable",
                "taxable": False,
                "notes": "Borrowing and repayment are not taxable"
            }

        else:
            return {
                "category": "unknown",
                "taxable": False,
                "notes": "Tax treatment unclear, consult advisor"
            }

    def _calculate_summary(self, transactions: List[DeFiTransaction]) -> Dict:
        """Calculate summary statistics for audit"""

        total_volume = Decimal(0)
        total_gains = Decimal(0)
        total_losses = Decimal(0)
        total_fees = Decimal(0)
        short_term_gains = Decimal(0)
        long_term_gains = Decimal(0)
        ordinary_income = Decimal(0)

        protocols_breakdown = {}

        for tx in transactions:
            # Volume
            if tx.usd_value_in:
                total_volume += Decimal(tx.usd_value_in)

            # Fees
            if tx.gas_fee_usd:
                total_fees += Decimal(tx.gas_fee_usd)
            if tx.protocol_fee_usd:
                total_fees += Decimal(tx.protocol_fee_usd)

            # Gains/losses by category
            if tx.gain_loss_usd and tx.tax_category == "capital_gains":
                gain = Decimal(tx.gain_loss_usd)
                if gain > 0:
                    total_gains += gain
                    # Determine short vs long term
                    if tx.holding_period_days and tx.holding_period_days > 365:
                        long_term_gains += gain
                    else:
                        short_term_gains += gain
                else:
                    total_losses += abs(gain)

            # Income from staking/rewards - use usd_value_out (tokens received)
            elif tx.tax_category == "income":
                # For income transactions (staking, rewards, interest), use the value of tokens received
                if tx.gain_loss_usd:
                    ordinary_income += Decimal(tx.gain_loss_usd)
                elif tx.usd_value_out:
                    # If gain_loss_usd is not set, use the value of tokens received
                    ordinary_income += Decimal(tx.usd_value_out)

            # Protocol breakdown
            if tx.protocol:
                protocol_name = tx.protocol.name
                if protocol_name not in protocols_breakdown:
                    protocols_breakdown[protocol_name] = {
                        "transactions": 0,
                        "volume_usd": 0
                    }
                protocols_breakdown[protocol_name]["transactions"] += 1
                if tx.usd_value_in:
                    protocols_breakdown[protocol_name]["volume_usd"] += float(tx.usd_value_in)

        return {
            "total_volume_usd": float(total_volume),
            "total_gains_usd": float(total_gains),
            "total_losses_usd": float(total_losses),
            "total_fees_usd": float(total_fees),
            "short_term_gains": float(short_term_gains),
            "long_term_gains": float(long_term_gains),
            "ordinary_income": float(ordinary_income),
            "protocols_breakdown": protocols_breakdown,
            "detailed_breakdown": {
                "net_capital_gains": float(total_gains - total_losses),
                "total_taxable_income": float(ordinary_income),
                "total_fees_paid": float(total_fees)
            }
        }

    async def get_audit_report(self, audit_id: int) -> Optional[Dict]:
        """
        Get complete audit report

        Args:
            audit_id: Audit ID

        Returns:
            Complete audit report dict
        """
        audit = self.db.query(DeFiAudit).filter(DeFiAudit.id == audit_id).first()

        if not audit:
            return None

        # Get all transactions
        transactions = self.db.query(DeFiTransaction).filter(
            DeFiTransaction.audit_id == audit_id
        ).all()

        return {
            "audit_id": audit.id,
            "status": audit.status,
            "period": {
                "start": audit.start_date.isoformat(),
                "end": audit.end_date.isoformat()
            },
            "chains": audit.chains,
            "summary": {
                "total_transactions": audit.total_transactions,
                "total_volume_usd": audit.total_volume_usd,
                "total_gains_usd": audit.total_gains_usd,
                "total_losses_usd": audit.total_losses_usd,
                "total_fees_usd": audit.total_fees_usd,
                "short_term_gains": audit.short_term_gains,
                "long_term_gains": audit.long_term_gains,
                "ordinary_income": audit.ordinary_income
            },
            "protocols_used": audit.protocols_used,
            "transactions": [self._serialize_transaction(tx) for tx in transactions],
            "recommendations": self._generate_recommendations(audit)
        }

    def _serialize_transaction(self, tx: DeFiTransaction) -> Dict:
        """Serialize transaction to dict"""
        # Calculate transaction value (for volume calculations)
        # Use the maximum of in/out values, or the one that exists
        value_usd = 0.0
        if tx.usd_value_in and tx.usd_value_out:
            value_usd = max(float(tx.usd_value_in), float(tx.usd_value_out))
        elif tx.usd_value_in:
            value_usd = float(tx.usd_value_in)
        elif tx.usd_value_out:
            value_usd = float(tx.usd_value_out)

        return {
            "id": tx.id,
            "tx_hash": tx.tx_hash,
            "chain": tx.chain,
            "timestamp": tx.timestamp.isoformat(),
            "protocol": tx.protocol.name if tx.protocol else None,
            "type": tx.transaction_type.value,
            "tax_category": tx.tax_category,
            "token_in": tx.token_in,
            "amount_in": float(tx.amount_in) if tx.amount_in else None,
            "token_out": tx.token_out,
            "amount_out": float(tx.amount_out) if tx.amount_out else None,
            "usd_value_in": float(tx.usd_value_in) if tx.usd_value_in else None,
            "usd_value_out": float(tx.usd_value_out) if tx.usd_value_out else None,
            "value_usd": value_usd,  # Total transaction value for volume breakdown
            "gain_loss_usd": float(tx.gain_loss_usd) if tx.gain_loss_usd else None,
            "fee_usd": float(tx.gas_fee_usd or 0) + float(tx.protocol_fee_usd or 0)
        }

    def _generate_recommendations(self, audit: DeFiAudit) -> List[str]:
        """Generate tax optimization recommendations"""

        recommendations = []

        # Check for unrealized losses (tax loss harvesting opportunity)
        if audit.total_losses_usd > 0:
            recommendations.append(
                f"You have ${audit.total_losses_usd:.2f} in realized losses. "
                "Consider tax loss harvesting strategies to offset gains."
            )

        # Check short vs long term ratio
        if audit.short_term_gains > audit.long_term_gains * 2:
            recommendations.append(
                "Most of your gains are short-term (higher tax rate). "
                "Consider holding assets longer for long-term capital gains treatment."
            )

        # High fee warning
        if audit.total_fees_usd > audit.total_gains_usd * 0.1:
            recommendations.append(
                f"You paid ${audit.total_fees_usd:.2f} in fees (>10% of gains). "
                "Consider optimizing transaction timing and gas costs."
            )

        return recommendations

    def _calculate_gain_loss_with_cost_basis(
        self,
        user_id: int,
        token_out: str,
        amount_out: float,
        usd_value_out: float,
        timestamp: datetime
    ) -> Optional[Dict]:
        """
        Calculate gain/loss using cost basis lots (FIFO method)

        Args:
            user_id: User ID
            token_out: Token being sold/swapped
            amount_out: Amount of token
            usd_value_out: USD value received
            timestamp: Transaction timestamp

        Returns:
            Dict with cost_basis, gain_loss, holding_period_days or None if no lots found
        """
        if not token_out or not amount_out or amount_out <= 0:
            return None

        # Find available cost basis lots for this token (FIFO = oldest first)
        lots = self.db.query(CostBasisLot).filter(
            CostBasisLot.user_id == user_id,
            CostBasisLot.token == token_out.upper(),
            CostBasisLot.remaining_amount > 0
        ).order_by(CostBasisLot.acquisition_date.asc()).all()

        if not lots:
            # No cost basis found - assume $0 cost basis (worst case for taxes)
            return {
                "cost_basis": 0.0,
                "gain_loss": usd_value_out,  # All proceeds are gain
                "holding_period_days": 0,
                "method": "assumed_zero"
            }

        # Calculate using FIFO
        remaining_to_sell = amount_out
        total_cost_basis = 0.0
        oldest_acquisition_date = None

        for lot in lots:
            if remaining_to_sell <= 0:
                break

            # How much can we take from this lot?
            amount_from_lot = min(remaining_to_sell, lot.remaining_amount)

            # Calculate cost basis for this portion
            cost_for_portion = amount_from_lot * lot.acquisition_price_usd
            total_cost_basis += cost_for_portion

            # Track oldest acquisition date for holding period
            if oldest_acquisition_date is None:
                oldest_acquisition_date = lot.acquisition_date

            # Update remaining
            remaining_to_sell -= amount_from_lot

            # Create disposal record
            disposal = CostBasisDisposal(
                user_id=user_id,
                lot_id=lot.id,
                disposal_date=timestamp,
                disposal_method="fifo",
                amount_disposed=amount_from_lot,
                disposal_price_usd=usd_value_out / amount_out if amount_out > 0 else 0,
                proceeds_usd=amount_from_lot * (usd_value_out / amount_out) if amount_out > 0 else 0,
                cost_basis_usd=cost_for_portion,
                gain_loss_usd=(amount_from_lot * (usd_value_out / amount_out) if amount_out > 0 else 0) - cost_for_portion
            )
            self.db.add(disposal)

            # Update lot
            lot.remaining_amount -= amount_from_lot
            lot.disposed_amount += amount_from_lot

        self.db.commit()

        # Calculate gain/loss
        gain_loss = usd_value_out - total_cost_basis

        # Calculate holding period
        holding_period_days = 0
        if oldest_acquisition_date:
            holding_period_days = (timestamp - oldest_acquisition_date).days

        return {
            "cost_basis": total_cost_basis,
            "gain_loss": gain_loss,
            "holding_period_days": holding_period_days,
            "method": "fifo"
        }
