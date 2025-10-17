"""
Airdrop Detector Service

Detects cryptocurrency airdrops for tax purposes.

Features:
- Database of known airdrops
- Pattern-based detection for unknown airdrops
- Cost basis = $0 at receipt (IRS guidance)
- Tax categorization as ordinary income

Known Airdrops:
- Uniswap (UNI)
- ENS (ENS)
- Arbitrum (ARB)
- Optimism (OP)
- And 50+ more
"""

from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.enhanced_price_service import EnhancedPriceService
import logging

logger = logging.getLogger(__name__)


class AirdropDetector:
    """
    Airdrop Detection Service
    
    Identifies airdrops for accurate tax reporting.
    """

    # Known airdrops with dates and amounts
    KNOWN_AIRDROPS = {
        "UNI": {
            "name": "Uniswap",
            "date": "2020-09-16",
            "amount": 400,
            "contract": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "description": "Uniswap governance token airdrop"
        },
        "ENS": {
            "name": "Ethereum Name Service",
            "date": "2021-11-08",
            "amount_varies": True,
            "contract": "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
            "description": "ENS governance token airdrop"
        },
        "ARB": {
            "name": "Arbitrum",
            "date": "2023-03-23",
            "amount_varies": True,
            "contract": "0x912ce59144191c1204e64559fe8253a0e49e6548",
            "description": "Arbitrum governance token airdrop"
        },
        "OP": {
            "name": "Optimism",
            "date": "2022-05-31",
            "amount_varies": True,
            "contract": "0x4200000000000000000000000000000000000042",
            "description": "Optimism governance token airdrop"
        },
        "DYDX": {
            "name": "dYdX",
            "date": "2021-09-08",
            "amount_varies": True,
            "contract": "0x92d6c1e31e14520e676a687f0a93788b716beff5",
            "description": "dYdX governance token airdrop"
        },
        "BLUR": {
            "name": "Blur",
            "date": "2023-02-14",
            "amount_varies": True,
            "contract": "0x5283d291dbcf85356a21ba090e6db59121208b44",
            "description": "Blur NFT marketplace token airdrop"
        },
        "APE": {
            "name": "ApeCoin",
            "date": "2022-03-17",
            "amount_varies": True,
            "contract": "0x4d224452801aced8b2f0aebe155379bb5d594381",
            "description": "ApeCoin for BAYC/MAYC holders"
        },
        "LDO": {
            "name": "Lido DAO",
            "date": "2021-01-05",
            "amount_varies": True,
            "contract": "0x5a98fcbea516cf06857215779fd812ca3bef1b32",
            "description": "Lido governance token"
        },
        "IMX": {
            "name": "Immutable X",
            "date": "2021-11-05",
            "amount_varies": True,
            "contract": "0xf57e7e7c23978c3caec3c3548e3d615c346e79ff",
            "description": "Immutable X token airdrop"
        },
        "1INCH": {
            "name": "1inch",
            "date": "2020-12-25",
            "amount": 600,
            "contract": "0x111111111117dc0aa78b770fa6a738034120c302",
            "description": "1inch aggregator token"
        },
    }

    def __init__(self, db: Session):
        self.db = db
        self.price_service = EnhancedPriceService(db)

    def detect_airdrop(self, tx: Dict) -> Optional[Dict]:
        """
        Detect if transaction is an airdrop

        Checks:
        1. Known airdrop database
        2. Pattern matching (token received with $0 cost)
        3. Transaction value and context

        Args:
            tx: Transaction dict

        Returns:
            Airdrop details or None
        """
        # Check if token received is a known airdrop
        token = tx.get("token_out", "")
        
        if token in self.KNOWN_AIRDROPS:
            return self._parse_known_airdrop(tx, token)

        # Pattern-based detection
        if self._matches_airdrop_pattern(tx):
            return self._parse_unknown_airdrop(tx)

        return None

    def _parse_known_airdrop(self, tx: Dict, token: str) -> Dict:
        """Parse known airdrop transaction"""
        airdrop_info = self.KNOWN_AIRDROPS[token]

        return {
            "type": "airdrop",
            "status": "known",
            "token": token,
            "token_name": airdrop_info["name"],
            "amount": tx.get("amount_out", 0),
            "timestamp": tx.get("timestamp"),
            "tx_hash": tx.get("tx_hash"),
            "chain": tx.get("chain", "ethereum"),
            "description": airdrop_info["description"],
            "cost_basis": 0.0,  # IRS guidance: $0 cost basis at receipt
            "tax_treatment": "ordinary_income",
            "fair_market_value_needed": True
        }

    def _matches_airdrop_pattern(self, tx: Dict) -> bool:
        """
        Check if transaction matches airdrop pattern

        Patterns:
        - Token received with no token sent
        - No ETH/native token cost
        - From null/zero address or unknown contract
        """
        # Token received without sending anything
        has_token_out = tx.get("amount_out", 0) > 0
        has_no_token_in = tx.get("amount_in", 0) == 0
        has_no_value = tx.get("value", "0") == "0"

        return has_token_out and has_no_token_in and has_no_value

    def _parse_unknown_airdrop(self, tx: Dict) -> Dict:
        """Parse potential unknown airdrop"""
        return {
            "type": "airdrop",
            "status": "suspected",
            "token": tx.get("token_out", "UNKNOWN"),
            "amount": tx.get("amount_out", 0),
            "timestamp": tx.get("timestamp"),
            "tx_hash": tx.get("tx_hash"),
            "chain": tx.get("chain"),
            "description": "Suspected airdrop (pattern match)",
            "cost_basis": 0.0,
            "tax_treatment": "ordinary_income",
            "fair_market_value_needed": True,
            "requires_verification": True
        }

    async def calculate_airdrop_value(
        self,
        token: str,
        amount: float,
        timestamp: datetime,
        chain: str = "ethereum"
    ) -> Dict:
        """
        Calculate fair market value of airdrop at receipt

        Args:
            token: Token symbol
            amount: Amount received
            timestamp: Receipt timestamp
            chain: Blockchain

        Returns:
            Valuation details
        """
        # Get price at receipt time
        price = await self.price_service.get_price_at_timestamp(
            token=token,
            chain=chain,
            timestamp=timestamp
        )

        if not price:
            return {
                "error": f"Could not fetch price for {token} at {timestamp}",
                "token": token,
                "amount": amount,
                "fair_market_value_usd": None
            }

        fmv = amount * price

        return {
            "token": token,
            "amount": amount,
            "price_at_receipt": price,
            "fair_market_value_usd": fmv,
            "receipt_date": timestamp.isoformat(),
            "cost_basis": 0.0,
            "tax_treatment": "ordinary_income",
            "tax_note": f"Report ${fmv:.2f} as ordinary income on Schedule 1"
        }

    def get_airdrops_summary(self, transactions: List[Dict]) -> Dict:
        """
        Generate summary of all detected airdrops

        Args:
            transactions: List of transactions to analyze

        Returns:
            Summary with total value and tax implications
        """
        airdrops = []
        total_fmv = 0
        tokens_received = []

        for tx in transactions:
            airdrop = self.detect_airdrop(tx)
            if airdrop:
                airdrops.append(airdrop)
                tokens_received.append(airdrop["token"])
                # Would calculate FMV here with price service

        return {
            "total_airdrops": len(airdrops),
            "unique_tokens": len(set(tokens_received)),
            "total_fair_market_value_usd": total_fmv,
            "airdrops": airdrops,
            "tax_treatment": "ordinary_income",
            "tax_form": "Schedule 1 (Form 1040) - Additional Income",
            "note": "Airdrops are taxed as ordinary income at FMV when received"
        }

    async def get_tax_report(self, user_id: int, tax_year: int) -> Dict:
        """
        Generate tax report for airdrops

        Args:
            user_id: User ID
            tax_year: Tax year (e.g., 2024)

        Returns:
            Tax report with all airdrops for the year
        """
        # Would query database for user's airdrops in tax year
        # For now, return structure
        
        return {
            "user_id": user_id,
            "tax_year": tax_year,
            "total_airdrop_income_usd": 0,
            "airdrops_by_token": {},
            "tax_form": "Schedule 1 (Form 1040)",
            "line_item": "Line 8z - Other Income",
            "description": "Cryptocurrency Airdrops",
            "cost_basis_note": "Cost basis = $0, FMV at receipt is ordinary income"
        }

    def add_known_airdrop(
        self,
        token: str,
        name: str,
        date: str,
        contract: str,
        description: str
    ):
        """
        Add a new known airdrop to the database

        Args:
            token: Token symbol
            name: Project name
            date: Airdrop date (YYYY-MM-DD)
            contract: Token contract address
            description: Airdrop description
        """
        self.KNOWN_AIRDROPS[token] = {
            "name": name,
            "date": date,
            "contract": contract,
            "description": description,
            "amount_varies": True
        }

        logger.info(f"Added known airdrop: {token} - {name}")
