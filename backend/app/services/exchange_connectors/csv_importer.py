"""
CSV Importer

Import transactions from CSV files (generic format).
"""

from typing import List, Dict, Optional
from datetime import datetime
import csv
import io
import logging
from .base_connector import BaseExchangeConnector

logger = logging.getLogger(__name__)


class CSVImporter(BaseExchangeConnector):
    """
    CSV Transaction Importer

    Supports generic CSV format and common exchange export formats.

    Expected CSV columns:
    - Date/Timestamp (required)
    - Type (trade, deposit, withdrawal, etc.)
    - Token In / Buy Asset
    - Amount In / Buy Amount
    - Token Out / Sell Asset
    - Amount Out / Sell Amount
    - Fee Token / Fee Currency
    - Fee Amount
    - Price (USD)
    """

    def __init__(self, **kwargs):
        # CSV importer doesn't need API credentials
        super().__init__(api_key="", api_secret="")
        self.csv_content = kwargs.get("csv_content", "")
        self.csv_file = kwargs.get("csv_file")
        self.exchange_name = kwargs.get("exchange_name", "generic")

    def validate_credentials(self) -> bool:
        """CSV importer doesn't require credentials"""
        return True

    async def fetch_balances(self) -> Dict[str, float]:
        """CSV importer doesn't support balance fetching"""
        return {}

    async def fetch_transactions(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 10000
    ) -> List[Dict]:
        """
        Import transactions from CSV

        Args:
            start_date: Filter transactions after this date
            end_date: Filter transactions before this date
            limit: Maximum transactions to import

        Returns:
            List of normalized transactions
        """
        try:
            # Get CSV content
            if self.csv_file:
                content = self.csv_file.read().decode('utf-8')
            else:
                content = self.csv_content

            # Parse CSV
            reader = csv.DictReader(io.StringIO(content))
            transactions = []

            for row in reader:
                try:
                    tx = self._parse_csv_row(row)

                    # Filter by date
                    if start_date and tx["timestamp"] < start_date:
                        continue
                    if end_date and tx["timestamp"] > end_date:
                        continue

                    transactions.append(tx)

                except Exception as e:
                    logger.warning(f"Failed to parse CSV row: {e}")
                    continue

            logger.info(f"Imported {len(transactions)} transactions from CSV")
            return transactions[:limit]

        except Exception as e:
            logger.error(f"Failed to import CSV: {e}")
            return []

    def _parse_csv_row(self, row: Dict) -> Dict:
        """
        Parse a single CSV row

        Supports multiple column name formats
        """
        # Normalize column names (case-insensitive)
        row_lower = {k.lower().strip(): v.strip() for k, v in row.items()}

        # Parse timestamp
        timestamp = self._parse_csv_timestamp(row_lower)

        # Parse type
        tx_type = self._parse_csv_type(row_lower)

        # Parse tokens and amounts
        token_in = row_lower.get("token in") or row_lower.get("buy asset") or row_lower.get("currency in") or ""
        amount_in = float(row_lower.get("amount in") or row_lower.get("buy amount") or row_lower.get("quantity in") or 0)

        token_out = row_lower.get("token out") or row_lower.get("sell asset") or row_lower.get("currency out") or ""
        amount_out = float(row_lower.get("amount out") or row_lower.get("sell amount") or row_lower.get("quantity out") or 0)

        # Parse fees
        fee_token = row_lower.get("fee token") or row_lower.get("fee currency") or row_lower.get("fee asset") or ""
        fee_amount = float(row_lower.get("fee amount") or row_lower.get("fee") or 0)

        # Parse price
        price_usd = float(row_lower.get("price") or row_lower.get("price usd") or row_lower.get("usd price") or 0)

        # Generate transaction ID
        tx_id = f"{self.exchange_name}_csv_{timestamp.timestamp()}_{token_in}_{token_out}"

        return {
            "exchange": self.exchange_name,
            "transaction_id": tx_id,
            "timestamp": timestamp,
            "type": tx_type,
            "token_in": token_in,
            "amount_in": amount_in,
            "token_out": token_out,
            "amount_out": amount_out,
            "fee_token": fee_token,
            "fee_amount": fee_amount,
            "price_usd": price_usd,
            "raw_data": row
        }

    def _parse_csv_timestamp(self, row: Dict) -> datetime:
        """Parse timestamp from various formats"""
        # Try different column names
        timestamp_str = (
            row.get("date") or
            row.get("timestamp") or
            row.get("time") or
            row.get("datetime") or
            row.get("created at") or
            ""
        )

        if not timestamp_str:
            return datetime.utcnow()

        # Try different date formats
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M:%S.%f",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%d",
            "%m/%d/%Y %H:%M:%S",
            "%m/%d/%Y",
            "%d/%m/%Y %H:%M:%S",
            "%d/%m/%Y"
        ]

        for fmt in formats:
            try:
                return datetime.strptime(timestamp_str, fmt)
            except:
                continue

        # Try ISO format
        try:
            return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        except:
            pass

        logger.warning(f"Could not parse timestamp: {timestamp_str}")
        return datetime.utcnow()

    def _parse_csv_type(self, row: Dict) -> str:
        """Parse transaction type"""
        type_str = (
            row.get("type") or
            row.get("transaction type") or
            row.get("operation") or
            ""
        ).lower()

        type_mapping = {
            "buy": "trade",
            "sell": "trade",
            "trade": "trade",
            "deposit": "deposit",
            "withdrawal": "withdrawal",
            "withdraw": "withdrawal",
            "fee": "fee",
            "staking": "staking_reward",
            "reward": "staking_reward",
            "airdrop": "airdrop",
            "income": "income"
        }

        return type_mapping.get(type_str, "unknown")

    @staticmethod
    def generate_template_csv() -> str:
        """
        Generate a CSV template for users

        Returns:
            CSV template as string
        """
        template = """Date,Type,Token In,Amount In,Token Out,Amount Out,Fee Token,Fee Amount,Price USD
2024-01-15 10:30:00,trade,BTC,0.5,USDT,25000.00,BNB,0.01,50000.00
2024-01-16 14:20:00,deposit,ETH,2.0,,,,,,
2024-01-17 09:45:00,withdrawal,,,,BTC,0.1,BTC,0.0001,
"""
        return template

    @staticmethod
    def validate_csv(csv_content: str) -> Dict:
        """
        Validate CSV format

        Returns:
            Dict with validation results
        """
        errors = []
        warnings = []

        try:
            reader = csv.DictReader(io.StringIO(csv_content))
            headers = reader.fieldnames

            if not headers:
                errors.append("CSV has no headers")
                return {"valid": False, "errors": errors, "warnings": warnings}

            # Check required columns
            headers_lower = [h.lower().strip() for h in headers]

            has_date = any(x in headers_lower for x in ["date", "timestamp", "time"])
            has_type = any(x in headers_lower for x in ["type", "transaction type"])

            if not has_date:
                errors.append("Missing required column: Date/Timestamp")

            if not has_type:
                warnings.append("Missing 'Type' column - will attempt to infer transaction types")

            # Parse rows
            row_count = 0
            for row in reader:
                row_count += 1

                if row_count > 10000:
                    warnings.append("CSV has more than 10,000 rows - only first 10,000 will be imported")
                    break

            if row_count == 0:
                errors.append("CSV has no data rows")

            return {
                "valid": len(errors) == 0,
                "errors": errors,
                "warnings": warnings,
                "row_count": row_count
            }

        except Exception as e:
            errors.append(f"Failed to parse CSV: {str(e)}")
            return {"valid": False, "errors": errors, "warnings": warnings}
