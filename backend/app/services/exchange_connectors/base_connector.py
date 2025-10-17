"""
Base Exchange Connector

Abstract base class for all exchange connectors.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class BaseExchangeConnector(ABC):
    """
    Base Exchange Connector

    Provides common functionality for exchange integrations.
    """

    def __init__(self, api_key: str, api_secret: str, passphrase: Optional[str] = None):
        """
        Initialize connector

        Args:
            api_key: Exchange API key
            api_secret: Exchange API secret
            passphrase: Exchange passphrase (if required)
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.passphrase = passphrase
        self.exchange_name = self.__class__.__name__.replace("Connector", "")

    @abstractmethod
    async def fetch_transactions(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[Dict]:
        """
        Fetch transactions from exchange

        Args:
            start_date: Start date for transaction history
            end_date: End date for transaction history
            limit: Maximum number of transactions to fetch

        Returns:
            List of normalized transaction dicts
        """
        pass

    @abstractmethod
    async def fetch_balances(self) -> Dict[str, float]:
        """
        Fetch current balances from exchange

        Returns:
            Dict mapping token symbol to balance amount
        """
        pass

    @abstractmethod
    def validate_credentials(self) -> bool:
        """
        Validate API credentials

        Returns:
            True if credentials are valid
        """
        pass

    def normalize_transaction(self, raw_tx: Dict) -> Dict:
        """
        Normalize raw exchange transaction to standard format

        Standard format:
        {
            "exchange": "binance",
            "transaction_id": "12345",
            "timestamp": datetime,
            "type": "trade|deposit|withdrawal|fee",
            "token_in": "BTC",
            "amount_in": 0.5,
            "token_out": "USDT",
            "amount_out": 25000.0,
            "fee_token": "BNB",
            "fee_amount": 0.001,
            "price_usd": 50000.0,
            "raw_data": {...}
        }

        Args:
            raw_tx: Raw transaction from exchange API

        Returns:
            Normalized transaction dict
        """
        # This method should be overridden by specific connectors
        # but provides a default implementation
        return {
            "exchange": self.exchange_name.lower(),
            "transaction_id": raw_tx.get("id", ""),
            "timestamp": self._parse_timestamp(raw_tx.get("time", raw_tx.get("timestamp"))),
            "type": self._normalize_type(raw_tx.get("type", "")),
            "token_in": raw_tx.get("asset_in", raw_tx.get("currency", "")),
            "amount_in": float(raw_tx.get("amount_in", 0)),
            "token_out": raw_tx.get("asset_out", ""),
            "amount_out": float(raw_tx.get("amount_out", 0)),
            "fee_token": raw_tx.get("fee_currency", ""),
            "fee_amount": float(raw_tx.get("fee", 0)),
            "price_usd": float(raw_tx.get("price_usd", 0)),
            "raw_data": raw_tx
        }

    def _parse_timestamp(self, timestamp) -> datetime:
        """Parse various timestamp formats to datetime"""
        if isinstance(timestamp, datetime):
            return timestamp
        elif isinstance(timestamp, (int, float)):
            # Unix timestamp (milliseconds or seconds)
            if timestamp > 1e10:  # Milliseconds
                return datetime.fromtimestamp(timestamp / 1000)
            else:  # Seconds
                return datetime.fromtimestamp(timestamp)
        elif isinstance(timestamp, str):
            # ISO format
            try:
                return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except:
                return datetime.utcnow()
        else:
            return datetime.utcnow()

    def _normalize_type(self, tx_type: str) -> str:
        """Normalize transaction type"""
        tx_type = tx_type.lower()

        type_mapping = {
            "buy": "trade",
            "sell": "trade",
            "trade": "trade",
            "deposit": "deposit",
            "withdrawal": "withdrawal",
            "withdraw": "withdrawal",
            "fee": "fee",
            "commission": "fee",
            "staking": "staking_reward",
            "reward": "staking_reward",
            "airdrop": "airdrop"
        }

        return type_mapping.get(tx_type, "unknown")

    async def sync_to_database(
        self,
        db,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        Sync transactions to database

        Args:
            db: Database session
            user_id: User ID
            start_date: Start date
            end_date: End date

        Returns:
            Sync summary with counts
        """
        logger.info(f"Syncing {self.exchange_name} transactions for user {user_id}")

        try:
            # Fetch transactions
            transactions = await self.fetch_transactions(start_date, end_date)

            # Import to cost basis system
            from app.services.cost_basis_calculator import CostBasisCalculator
            calculator = CostBasisCalculator(db, user_id)

            imported_count = 0
            skipped_count = 0
            error_count = 0

            for tx in transactions:
                try:
                    # Check if transaction already exists
                    existing = db.query(ExchangeTransaction).filter(
                        ExchangeTransaction.user_id == user_id,
                        ExchangeTransaction.exchange == tx["exchange"],
                        ExchangeTransaction.transaction_id == tx["transaction_id"]
                    ).first()

                    if existing:
                        skipped_count += 1
                        continue

                    # Save to database
                    exchange_tx = ExchangeTransaction(
                        user_id=user_id,
                        exchange=tx["exchange"],
                        transaction_id=tx["transaction_id"],
                        timestamp=tx["timestamp"],
                        type=tx["type"],
                        token_in=tx.get("token_in"),
                        amount_in=tx.get("amount_in", 0),
                        token_out=tx.get("token_out"),
                        amount_out=tx.get("amount_out", 0),
                        fee_token=tx.get("fee_token"),
                        fee_amount=tx.get("fee_amount", 0),
                        price_usd=tx.get("price_usd", 0),
                        raw_data=tx.get("raw_data")
                    )
                    db.add(exchange_tx)

                    # Create cost basis lot for acquisitions
                    if tx["type"] in ["trade", "deposit"] and tx.get("token_in"):
                        await calculator.create_lot(
                            token=tx["token_in"],
                            chain="exchange",
                            amount=tx["amount_in"],
                            acquisition_price_usd=tx.get("price_usd", 0),
                            acquisition_date=tx["timestamp"],
                            acquisition_tx_hash=tx["transaction_id"]
                        )

                    imported_count += 1

                except Exception as e:
                    logger.error(f"Error importing transaction {tx.get('transaction_id')}: {e}")
                    error_count += 1

            db.commit()

            return {
                "exchange": self.exchange_name,
                "imported": imported_count,
                "skipped": skipped_count,
                "errors": error_count,
                "total": len(transactions)
            }

        except Exception as e:
            logger.error(f"Failed to sync {self.exchange_name} transactions: {e}")
            raise


# Exchange Transaction Model (should be in models, but defined here for reference)
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class ExchangeTransaction(Base):
    """Exchange Transaction Model"""
    __tablename__ = "exchange_transactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    exchange = Column(String(50), nullable=False, index=True)
    transaction_id = Column(String(255), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    type = Column(String(50), nullable=False)

    token_in = Column(String(50))
    amount_in = Column(Float, default=0)
    token_out = Column(String(50))
    amount_out = Column(Float, default=0)

    fee_token = Column(String(50))
    fee_amount = Column(Float, default=0)

    price_usd = Column(Float)
    raw_data = Column(JSON)

    created_at = Column(DateTime, server_default="now()")

    # Relationships
    user = relationship("User", back_populates="exchange_transactions")
