from sqlalchemy.orm import Session
from app.models.regulation import Regulation, RegulationHistory
from app.models.simulation import Simulation
from app.services.regulation_history import RegulationHistoryService
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime, date


@dataclass
class SimulationResult:
    """Result of tax simulation"""
    current_country: str
    target_country: str
    current_tax: float
    target_tax: float
    savings: float
    savings_percent: float
    considerations: List[str]
    risks: List[str]
    timeline: str


@dataclass
class SimulationExplanation:
    """Explanation of how simulation was calculated (Explain Decision feature)"""
    decision: str
    reasoning: List[str]
    rules_applied: List[Dict]
    assumptions: List[str]
    confidence: float
    sources: List[str]


class TaxSimulator:
    """Tax simulation engine with Explain Decision feature"""

    def __init__(self, db: Session):
        self.db = db

    async def simulate_residency_change(
        self,
        user_id: int,
        current_country: str,
        target_country: str,
        short_term_gains: float = 0,
        long_term_gains: float = 0
    ) -> tuple[SimulationResult, SimulationExplanation]:
        """
        Simulate tax impact of residency change
        Returns: (result, explanation)
        """

        # Get current regulations
        reg_current = self.db.query(Regulation).filter_by(
            country_code=current_country
        ).first()
        reg_target = self.db.query(Regulation).filter_by(
            country_code=target_country
        ).first()

        if not reg_current or not reg_target:
            raise ValueError(f"Regulations not found for {current_country} or {target_country}")

        # Calculate taxes using crypto-specific rates if available, otherwise fallback to general CGT
        # Current country
        current_short_rate = float(reg_current.crypto_short_rate) if reg_current.crypto_short_rate is not None else float(reg_current.cgt_short_rate)
        current_long_rate = float(reg_current.crypto_long_rate) if reg_current.crypto_long_rate is not None else float(reg_current.cgt_long_rate)

        current_tax_short = short_term_gains * current_short_rate
        current_tax_long = long_term_gains * current_long_rate
        current_tax = current_tax_short + current_tax_long

        # Target country
        target_short_rate = float(reg_target.crypto_short_rate) if reg_target.crypto_short_rate is not None else float(reg_target.cgt_short_rate)
        target_long_rate = float(reg_target.crypto_long_rate) if reg_target.crypto_long_rate is not None else float(reg_target.cgt_long_rate)

        target_tax_short = short_term_gains * target_short_rate
        target_tax_long = long_term_gains * target_long_rate
        target_tax = target_tax_short + target_tax_long

        savings = current_tax - target_tax
        savings_percent = (savings / current_tax * 100) if current_tax > 0 else 0

        # Generate considerations
        considerations = self._generate_considerations(
            reg_current, reg_target, short_term_gains + long_term_gains
        )

        # Generate risks
        risks = self._generate_risks(reg_current, reg_target, current_country, target_country)

        # Timeline
        timeline = self._generate_timeline(reg_target)

        result = SimulationResult(
            current_country=current_country,
            target_country=target_country,
            current_tax=current_tax,
            target_tax=target_tax,
            savings=savings,
            savings_percent=savings_percent,
            considerations=considerations,
            risks=risks,
            timeline=timeline
        )

        # Generate explanation (Explain Decision feature)
        explanation = self._generate_explanation(
            reg_current, reg_target,
            short_term_gains, long_term_gains,
            current_tax, target_tax, savings
        )

        # Save simulation with regulation snapshot
        await self._save_simulation(
            user_id, result, reg_current, reg_target,
            short_term_gains + long_term_gains
        )

        return result, explanation

    def _generate_explanation(
        self,
        reg_current, reg_target,
        short_term: float, long_term: float,
        current_tax: float, target_tax: float, savings: float
    ) -> SimulationExplanation:
        """Generate step-by-step explanation (Explain Decision)"""

        # Get actual rates used (crypto-specific if available, otherwise general CGT)
        current_short_rate = float(reg_current.crypto_short_rate) if reg_current.crypto_short_rate is not None else float(reg_current.cgt_short_rate)
        current_long_rate = float(reg_current.crypto_long_rate) if reg_current.crypto_long_rate is not None else float(reg_current.cgt_long_rate)
        target_short_rate = float(reg_target.crypto_short_rate) if reg_target.crypto_short_rate is not None else float(reg_target.cgt_short_rate)
        target_long_rate = float(reg_target.crypto_long_rate) if reg_target.crypto_long_rate is not None else float(reg_target.cgt_long_rate)

        current_uses_crypto = reg_current.crypto_short_rate is not None
        target_uses_crypto = reg_target.crypto_short_rate is not None

        current_label = "crypto tax" if current_uses_crypto else "CGT"
        target_label = "crypto tax" if target_uses_crypto else "CGT"

        reasoning = [
            f"1. Current residency {reg_current.country_code}: {current_short_rate*100:.1f}% short-term, {current_long_rate*100:.1f}% long-term {current_label}",
            f"2. Target residency {reg_target.country_code}: {target_short_rate*100:.1f}% short-term, {target_long_rate*100:.1f}% long-term {target_label}",
            f"3. Your projected gains: ${short_term:,.0f} short-term + ${long_term:,.0f} long-term",
            f"4. Current tax calculation: ${current_tax:,.0f} (${short_term * current_short_rate:,.0f} short + ${long_term * current_long_rate:,.0f} long)",
            f"5. Target tax calculation: ${target_tax:,.0f} (${short_term * target_short_rate:,.0f} short + ${long_term * target_long_rate:,.0f} long)",
            f"6. Net savings: ${savings:,.0f} ({(savings/current_tax*100 if current_tax > 0 else 0):.1f}% reduction)"
        ]

        rules_applied = [
            {
                "country": reg_current.country_code,
                "rule": "Crypto Tax" if current_uses_crypto else "Capital Gains Tax",
                "rate_short": current_short_rate,
                "rate_long": current_long_rate,
                "crypto_specific": current_uses_crypto,
                "source": reg_current.source_url or f"Tax authority {reg_current.country_code}"
            },
            {
                "country": reg_target.country_code,
                "rule": "Crypto Tax" if target_uses_crypto else "Capital Gains Tax",
                "rate_short": target_short_rate,
                "rate_long": target_long_rate,
                "crypto_specific": target_uses_crypto,
                "source": reg_target.source_url or f"Tax authority {reg_target.country_code}"
            }
        ]

        assumptions = [
            reg_target.residency_rule if reg_target.residency_rule else "Standard residency rules apply",
            "No exit tax applies" if reg_current.country_code != "US" else "⚠️ US exit tax may apply - verify with CPA",
            f"Tax treaty prevents double taxation" if reg_current.country_code in (reg_target.treaty_countries or []) else "⚠️ No treaty - double tax risk",
            "Exchange rates stable (USD baseline)",
            f"Regulations current as of {reg_target.updated_at.strftime('%Y-%m-%d') if reg_target.updated_at else 'unknown'}"
        ]

        # Confidence based on data freshness
        days_old = (datetime.now(reg_target.updated_at.tzinfo) - reg_target.updated_at).days if reg_target.updated_at else 365
        confidence = max(0.3, 1.0 - (days_old / 365))

        decision = f"Moving from {reg_current.country_code} to {reg_target.country_code} saves ${savings:,.0f}/year"

        sources = [
            f"{reg_current.country_name} tax authority",
            f"{reg_target.country_name} tax authority"
        ]

        return SimulationExplanation(
            decision=decision,
            reasoning=reasoning,
            rules_applied=rules_applied,
            assumptions=assumptions,
            confidence=confidence,
            sources=sources
        )

    def _generate_considerations(self, reg_current, reg_target, total_gains: float) -> List[str]:
        """Generate key considerations"""
        items = []

        # Treaty check
        if reg_target.treaty_countries and reg_current.country_code in reg_target.treaty_countries:
            items.append(f"✅ Tax treaty exists between {reg_current.country_code} and {reg_target.country_code}")
        else:
            items.append(f"⚠️ No tax treaty - risk of double taxation")

        # Residency requirements
        items.append(f"📍 {reg_target.country_name} residency: {reg_target.residency_rule}")

        # Exit tax (US specific)
        if reg_current.country_code == "US" and total_gains > 700000:
            items.append("🚨 US exit tax may apply (net worth >$2M). Consult specialist.")

        # Reporting
        items.append(f"📋 {reg_target.country_name} DeFi reporting: {reg_target.defi_reporting}")

        return items

    def _generate_risks(self, reg_current, reg_target, current_code: str, target_code: str) -> List[str]:
        """Generate risk warnings"""
        risks = []

        # Zero-tax scrutiny
        if float(reg_target.cgt_long_rate) == 0:
            risks.append("⚠️ Zero-tax jurisdictions attract scrutiny. Ensure legitimate substance.")

        # US citizenship
        if current_code == "US":
            risks.append("🇺🇸 US citizens taxed worldwide. Renunciation has exit tax.")

        # Penalties
        risks.append(f"⚖️ Max penalties in {reg_target.country_name}: {reg_target.penalties_max}")

        return risks

    def _generate_timeline(self, reg_target) -> str:
        """Suggest timeline"""
        if "183 days" in (reg_target.residency_rule or ""):
            return "⏱️ Establish residency: 183+ days in tax year"
        elif "365 days" in (reg_target.residency_rule or ""):
            return "⏱️ Requires 365 days continuous residence"
        elif "Citizenship" in (reg_target.residency_rule or ""):
            return "🛂 Citizenship-based taxation. Residency change insufficient."
        else:
            return f"⏱️ Review: {reg_target.residency_rule}"

    async def _save_simulation(
        self,
        user_id: int,
        result: SimulationResult,
        reg_current: Regulation,
        reg_target: Regulation,
        capital_gains: float
    ):
        """Save simulation with COMPLETE regulation snapshots for legal compliance"""

        # Create complete snapshots using the history service
        # This ensures we have full audit trail
        current_snapshot = RegulationHistoryService.create_regulation_snapshot_dict(reg_current)
        target_snapshot = RegulationHistoryService.create_regulation_snapshot_dict(reg_target)

        simulation = Simulation(
            user_id=user_id,
            current_country=result.current_country,
            target_country=result.target_country,
            capital_gains=capital_gains,
            result_json={
                'current_tax': result.current_tax,
                'target_tax': result.target_tax,
                'savings': result.savings,
                'savings_percent': result.savings_percent,
                'considerations': result.considerations,
                'risks': result.risks,
                'timeline': result.timeline
            },
            regulation_snapshot={
                'current': current_snapshot,
                'target': target_snapshot,
                'calculated_at': datetime.utcnow().isoformat()
            }
        )

        self.db.add(simulation)
        self.db.commit()
        self.db.refresh(simulation)
        return simulation
