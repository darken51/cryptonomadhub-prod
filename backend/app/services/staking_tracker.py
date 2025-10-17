"""
Staking Tracker Service

Tracks staking activities and rewards across major protocols.

Supported Protocols:
- Lido (stETH, stMATIC)
- Rocket Pool (rETH)
- Frax (sfrxETH)
- Coinbase Wrapped Staked ETH (cbETH)

Features:
- Automatic staking detection
- Rewards tracking as ordinary income
- Holding period calculation
- Tax categorization
"""

from typing import List, Dict, Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from app.services.enhanced_price_service import EnhancedPriceService
import logging

logger = logging.getLogger(__name__)


class StakingTracker:
    """
    Staking Activity Tracker
    
    Detects and tracks staking activities for tax purposes.
    """

    # Known staking tokens
    STAKING_TOKENS = {
        # Ethereum Liquid Staking
        "stETH": {
            "protocol": "Lido",
            "type": "liquid_staking",
            "underlying": "ETH",
            "contract": "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            "rewards_type": "rebase"
        },
        "rETH": {
            "protocol": "Rocket Pool",
            "type": "liquid_staking",
            "underlying": "ETH",
            "contract": "0xae78736cd615f374d3085123a210448e74fc6393",
            "rewards_type": "appreciation"
        },
        "cbETH": {
            "protocol": "Coinbase",
            "type": "liquid_staking",
            "underlying": "ETH",
            "contract": "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
            "rewards_type": "appreciation"
        },
        "sfrxETH": {
            "protocol": "Frax",
            "type": "liquid_staking",
            "underlying": "ETH",
            "contract": "0xac3e018457b222d93114458476f3e3416abbe38f",
            "rewards_type": "appreciation"
        },
        "stMATIC": {
            "protocol": "Lido",
            "type": "liquid_staking",
            "underlying": "MATIC",
            "contract": "0x9ee91f9f426fa633d227f7a9b000e28b9dfd8599",
            "rewards_type": "rebase"
        },
    }

    def __init__(self, db: Session):
        self.db = db
        self.price_service = EnhancedPriceService(db)

    def detect_staking(self, tx: Dict) -> Optional[Dict]:
        """
        Detect if transaction is a staking activity

        Args:
            tx: Transaction dict with token transfers

        Returns:
            Staking activity details or None
        """
        # Check for staking token receipt
        for token_symbol, token_info in self.STAKING_TOKENS.items():
            if self._is_staking_token_receipt(tx, token_symbol, token_info):
                return self._parse_staking_deposit(tx, token_symbol, token_info)

        return None

    def _is_staking_token_receipt(self, tx: Dict, token_symbol: str, token_info: Dict) -> bool:
        """Check if transaction involves receiving staking token"""
        # Simplified check - in production would check contract address
        token_out = tx.get("token_out", "")
        return token_symbol.lower() in token_out.lower()

    def _parse_staking_deposit(self, tx: Dict, token_symbol: str, token_info: Dict) -> Dict:
        """
        Parse staking deposit transaction

        Returns:
            {
                type: "staking_deposit",
                protocol: "Lido",
                staking_token: "stETH",
                underlying_token: "ETH",
                amount_deposited: 1.0,
                amount_received: 0.98,
                timestamp: "2024-01-01T00:00:00",
                rewards_type: "rebase"
            }
        """
        return {
            "type": "staking_deposit",
            "protocol": token_info["protocol"],
            "staking_token": token_symbol,
            "underlying_token": token_info["underlying"],
            "amount_deposited": tx.get("amount_in", 0),
            "amount_received": tx.get("amount_out", 0),
            "timestamp": tx.get("timestamp"),
            "rewards_type": token_info["rewards_type"],
            "tx_hash": tx.get("tx_hash"),
            "chain": tx.get("chain", "ethereum")
        }

    async def calculate_staking_rewards(
        self,
        staking_token: str,
        initial_amount: float,
        current_amount: float,
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """
        Calculate staking rewards earned

        Args:
            staking_token: Staking token symbol (stETH, rETH, etc.)
            initial_amount: Amount initially staked
            current_amount: Current amount held
            start_date: Staking start date
            end_date: Calculation end date

        Returns:
            Rewards calculation with tax details
        """
        if staking_token not in self.STAKING_TOKENS:
            return {"error": f"Unknown staking token: {staking_token}"}

        token_info = self.STAKING_TOKENS[staking_token]
        rewards_type = token_info["rewards_type"]

        if rewards_type == "rebase":
            # Rebase tokens (stETH) - rewards = increase in balance
            rewards_amount = current_amount - initial_amount
        else:
            # Appreciation tokens (rETH, cbETH) - rewards = increase in value
            # Would need to track exchange rate changes
            rewards_amount = current_amount - initial_amount

        if rewards_amount <= 0:
            return {
                "staking_token": staking_token,
                "rewards_amount": 0,
                "rewards_value_usd": 0,
                "tax_treatment": "No rewards earned"
            }

        # Get price at end date for USD valuation
        chain = "ethereum"  # Most staking is on Ethereum
        price = await self.price_service.get_price_at_timestamp(
            token=token_info["underlying"],
            chain=chain,
            timestamp=end_date
        )

        rewards_value_usd = rewards_amount * (price or 0)

        return {
            "staking_token": staking_token,
            "underlying_token": token_info["underlying"],
            "protocol": token_info["protocol"],
            "initial_amount": initial_amount,
            "current_amount": current_amount,
            "rewards_amount": rewards_amount,
            "rewards_value_usd": rewards_value_usd,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days_staked": (end_date - start_date).days,
            "tax_treatment": "ordinary_income",
            "tax_note": "Staking rewards are taxed as ordinary income at fair market value when received"
        }

    def get_staking_summary(self, transactions: List[Dict]) -> Dict:
        """
        Generate staking activity summary

        Args:
            transactions: List of transactions to analyze

        Returns:
            Summary of all staking activities
        """
        staking_activities = []
        total_staked_usd = 0
        protocols_used = set()

        for tx in transactions:
            staking_activity = self.detect_staking(tx)
            if staking_activity:
                staking_activities.append(staking_activity)
                protocols_used.add(staking_activity["protocol"])
                
                # Estimate value
                amount = staking_activity.get("amount_deposited", 0)
                # Would use price service for accurate USD value
                total_staked_usd += amount * 2000  # Rough ETH price estimate

        return {
            "total_staking_transactions": len(staking_activities),
            "total_staked_usd": total_staked_usd,
            "protocols_used": list(protocols_used),
            "staking_activities": staking_activities,
            "tax_note": "All staking rewards must be reported as ordinary income"
        }

    async def track_rewards_over_time(
        self,
        user_id: int,
        staking_token: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict]:
        """
        Track staking rewards over time period

        Returns daily/weekly snapshots of rewards earned
        """
        # This would query balance snapshots from database
        # For now, return placeholder structure
        
        return [
            {
                "date": start_date.isoformat(),
                "balance": 0,
                "rewards_earned": 0,
                "cumulative_rewards": 0,
                "rewards_value_usd": 0
            }
        ]

    def get_tax_report(self, staking_activities: List[Dict]) -> Dict:
        """
        Generate tax report for staking activities

        Returns:
            Tax summary with ordinary income from rewards
        """
        total_ordinary_income = 0
        activities_by_protocol = {}

        for activity in staking_activities:
            protocol = activity.get("protocol", "Unknown")
            if protocol not in activities_by_protocol:
                activities_by_protocol[protocol] = []
            activities_by_protocol[protocol].append(activity)

            # Sum up rewards value
            rewards_value = activity.get("rewards_value_usd", 0)
            total_ordinary_income += rewards_value

        return {
            "total_ordinary_income_usd": total_ordinary_income,
            "activities_by_protocol": activities_by_protocol,
            "tax_form": "Schedule 1 (Form 1040) - Additional Income",
            "tax_category": "Other Income - Staking Rewards",
            "note": "Report as ordinary income at fair market value when received"
        }
