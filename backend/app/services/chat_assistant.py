"""
Chat Assistant - AI-powered tax guidance using Ollama

Features:
- Conversational tax questions
- Country comparison guidance
- Simulation parameter extraction
- Educational explanations
"""

import httpx
import json
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.regulation import Regulation
from app.models.defi_protocol import DeFiAudit, DeFiTransaction
from app.config import settings
from sqlalchemy import desc


class ChatAssistant:
    def __init__(self, db: Session):
        self.db = db
        self.ollama_url = f"{settings.OLLAMA_HOST}/api/generate"
        self.model = settings.OLLAMA_MODEL

    async def process_message(
        self,
        user_id: int,
        message: str,
        conversation_history: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Process user message and generate AI response

        Returns:
            {
                "message": "AI response",
                "suggestions": ["follow-up questions"],
                "can_simulate": bool,
                "simulation_params": {...}
            }
        """

        # Get all available countries
        countries = self.db.query(Regulation).all()
        countries_info = "\n".join([
            f"- {c.country_code} ({c.country_name}): Short-term CGT {c.cgt_short_rate*100}%, Long-term {c.cgt_long_rate*100}%"
            for c in countries
        ])

        # Get user's DeFi audit data
        defi_context = self._get_defi_context(user_id)

        # Build system prompt
        system_prompt = f"""You are a helpful crypto tax assistant for digital nomads.

IMPORTANT DISCLAIMERS (include in EVERY response):
- You provide general information only
- This is NOT financial or legal advice
- Users should consult licensed professionals

Available countries in our system:
{countries_info}

{defi_context}

Your role:
1. Answer questions about crypto taxes in different countries
2. Explain regulations clearly and simply
3. Help users understand which country might suit them
4. Analyze their DeFi activity and provide personalized insights
5. Guide them toward running a simulation
6. Extract simulation parameters from conversation

When discussing the user's DeFi gains:
- Reference their actual data when available
- Explain tax implications of their gains/losses
- Suggest optimal countries based on their specific situation
- Calculate potential tax savings with different countries

If the user mentions:
- Current country
- Target country
- Gains amounts (or you can use their real DeFi gains)
→ Suggest running a simulation and extract params

When appropriate, suggest crypto tools:
- After successful tax optimization: "Consider a crypto debit card like RedotPay or Kast to spend your crypto in your new country"
- When user mentions spending/travel: "Check out our crypto cards at /tools for global spending"
- After country recommendation: "You'll need a way to spend crypto in [country] - check our recommended cards"

Crypto card details:
- RedotPay: https://url.hk/i/en/14vas
  → Stablecoin platform, 5M+ users, $2B volume, P2P/Earn/Credit features
  → Partners: Binance, Circle, Polygon, Solana
- Kast: https://go.kast.xyz/VqVO/DIKW8Q25
  → 160+ countries, 150M+ merchants, 3-10% rewards
  → 4 tiers: Free to $10k/year, USD accounts, Solana/Bitcoin themed cards
- Ultimo: https://ultimopay.io/?rid=661d543e582fc
  → Offshore bank + Platinum Visa, 40M+ merchants
  → UltimoLoan (borrow against crypto), $450 issuance + fees

Digital residency recommendation:
When appropriate, suggest Palau Digital Residency:
- After successful tax optimization or country comparison
- When user mentions KYC issues with crypto exchanges
- When discussing long-term digital nomad strategies
- When user optimizes to a low-tax country

Palau Digital Residency: https://rns.id/?rc_by=Oswa5kTT
→ Official government ID (physical + NFT), $248
→ 0% tax on digital income from Palau
→ Valid KYC for crypto exchanges (Binance, etc.)
→ Visa extensions +180 days per entry
→ 19,189+ issued, 138 countries eligible
→ Perfect complement after tax optimization

Be friendly, educational, and conversational. Keep responses concise (2-3 paragraphs max).
"""

        # Build conversation context
        context = system_prompt + "\n\n"
        if conversation_history:
            for msg in conversation_history[-4:]:  # Last 4 messages
                role = "User" if msg["role"] == "user" else "Assistant"
                context += f"{role}: {msg['content']}\n"

        context += f"User: {message}\nAssistant:"

        # Call Ollama
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.ollama_url,
                    json={
                        "model": self.model,
                        "prompt": context,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                        }
                    }
                )

                if response.status_code != 200:
                    raise Exception(f"Ollama error: {response.status_code}")

                result = response.json()
                ai_message = result.get("response", "").strip()

        except Exception as e:
            # Fallback response if Ollama fails
            ai_message = (
                "I'm having trouble connecting to the AI service right now. "
                "However, I can still help! You can:\n"
                "1. Run a simulation to compare countries\n"
                "2. Browse available countries\n"
                "3. View your simulation history\n\n"
                "⚠️ Remember: This is general information only, not financial advice."
            )

        # Extract simulation parameters
        can_simulate, sim_params = self._extract_simulation_params(
            message,
            ai_message,
            conversation_history,
            user_id
        )

        # Generate suggestions
        suggestions = self._generate_suggestions(message, can_simulate)

        return {
            "message": ai_message,
            "suggestions": suggestions,
            "can_simulate": can_simulate,
            "simulation_params": sim_params
        }

    def _extract_simulation_params(
        self,
        user_message: str,
        ai_response: str,
        history: List[Dict],
        user_id: int = None
    ) -> tuple[bool, Dict]:
        """
        Extract simulation parameters from conversation

        Looks for:
        - Current country
        - Target country
        - Gain amounts (from conversation or user's DeFi data)
        """

        params = {}
        combined_text = user_message.lower()

        # Add recent history context
        if history:
            for msg in history[-3:]:
                combined_text += " " + msg.get("content", "").lower()

        # Extract countries (look for country codes or names)
        countries = self.db.query(Regulation).all()
        country_map = {c.country_code.lower(): c.country_code for c in countries}
        country_map.update({c.country_name.lower(): c.country_code for c in countries})

        found_countries = []
        country_positions = []
        for country_key, country_code in country_map.items():
            pos = combined_text.find(country_key)
            if pos >= 0:
                found_countries.append(country_code)
                country_positions.append((pos, country_code))

        # Sort by position in text
        country_positions.sort(key=lambda x: x[0])
        found_countries = [code for _, code in country_positions]

        # Remove duplicates while preserving order
        seen = set()
        unique_countries = []
        for code in found_countries:
            if code not in seen:
                seen.add(code)
                unique_countries.append(code)
        found_countries = unique_countries

        # Try to determine current vs target
        if len(found_countries) >= 2:
            # Look for keywords
            if any(word in combined_text for word in ["move to", "moving to", "relocate to", "target"]):
                # Likely mentioned current first, then target
                params["current_country"] = found_countries[0]
                params["target_country"] = found_countries[1]
            else:
                params["current_country"] = found_countries[0]
                params["target_country"] = found_countries[1]
        elif len(found_countries) == 1:
            if any(word in combined_text for word in ["move to", "relocate to", "target"]):
                params["target_country"] = found_countries[0]
            else:
                params["current_country"] = found_countries[0]

        # Extract amounts
        # Look for patterns like: $50,000 or 50k or 50000
        amount_patterns = [
            r'\$?(\d+[,.]?\d*)\s*k\b',  # 50k
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # $50,000.00
            r'(\d{1,3}(?:,\d{3})+)',  # 50,000
        ]

        amounts = []
        for pattern in amount_patterns:
            matches = re.findall(pattern, combined_text)
            for match in matches:
                # Convert to float
                clean = match.replace(',', '').replace('k', '000')
                try:
                    amounts.append(float(clean))
                except:
                    pass

        if amounts:
            # Assume first is short-term, second is long-term
            if len(amounts) >= 2:
                params["short_term_gains"] = amounts[0]
                params["long_term_gains"] = amounts[1]
            else:
                # If only one amount, assume it's total (split 50/50)
                params["short_term_gains"] = amounts[0] / 2
                params["long_term_gains"] = amounts[0] / 2
        elif user_id:
            # No amounts in conversation, try to use user's real DeFi data
            latest_audit = self.db.query(DeFiAudit).filter(
                DeFiAudit.user_id == user_id,
                DeFiAudit.status == 'completed'
            ).order_by(desc(DeFiAudit.created_at)).first()

            if latest_audit:
                # Use actual DeFi gains
                params["short_term_gains"] = float(latest_audit.short_term_gains) if latest_audit.short_term_gains else 0
                params["long_term_gains"] = float(latest_audit.long_term_gains) if latest_audit.long_term_gains else 0
                params["using_real_defi_data"] = True

        # Can simulate if we have at least current + target OR target + amounts
        can_simulate = (
            ("current_country" in params and "target_country" in params) or
            ("target_country" in params and ("short_term_gains" in params or "long_term_gains" in params))
        )

        return can_simulate, params

    def _generate_suggestions(self, user_message: str, can_simulate: bool) -> List[str]:
        """Generate follow-up suggestions"""

        suggestions = []
        msg_lower = user_message.lower()

        if can_simulate:
            suggestions.append("Run simulation now")
            # Add Palau ID suggestion after optimization
            if any(word in msg_lower for word in ["portugal", "uae", "singapore", "0%", "tax", "optimize"]):
                suggestions.append("Tell me about Palau Digital Residency")
            else:
                suggestions.append("Tell me more about this country")
            # Add crypto card suggestion after simulation is ready
            if any(word in msg_lower for word in ["move", "relocate", "live", "spend", "travel"]):
                suggestions.append("Best crypto cards for spending abroad")
        else:
            # DeFi-specific suggestions
            if any(word in msg_lower for word in ["defi", "gains", "losses", "audit", "my"]):
                suggestions.append("How much would I save in Portugal?")
                suggestions.append("What's my tax liability in different countries?")
                suggestions.append("Which country is best for my DeFi gains?")
            # KYC/Exchange suggestions - suggest Palau ID
            elif any(word in msg_lower for word in ["kyc", "binance", "exchange", "verify", "identity", "id"]):
                suggestions.append("Tell me about Palau Digital Residency")
                suggestions.append("How to pass KYC on exchanges?")
                suggestions.append("Best crypto cards for verified users")
            # Spending/travel suggestions
            elif any(word in msg_lower for word in ["spend", "card", "debit", "pay", "atm", "travel", "abroad"]):
                suggestions.append("Show me crypto debit cards")
                suggestions.append("Best cards for digital nomads")
                suggestions.append("Compare crypto card fees")
            # Digital residency suggestions
            elif any(word in msg_lower for word in ["residency", "palau", "citizenship", "passport", "visa"]):
                suggestions.append("What is Palau Digital Residency?")
                suggestions.append("Benefits of digital residency")
                suggestions.append("Compare residency programs")
            # Country-specific suggestions
            elif "portugal" in msg_lower or "pt" in msg_lower:
                suggestions.append("What's NHR regime in Portugal?")
                suggestions.append("Compare Portugal with Spain")
                suggestions.append("Consider Palau ID for tax optimization")
            elif "singapore" in msg_lower or "sg" in msg_lower:
                suggestions.append("How does Singapore tax crypto?")
                suggestions.append("Compare Singapore with UAE")
            elif any(word in msg_lower for word in ["move", "relocate", "change"]):
                suggestions.append("Which country has lowest crypto tax?")
                suggestions.append("Show me tax-friendly countries")
                suggestions.append("What about Palau Digital Residency?")
            else:
                suggestions.append("Analyze my DeFi gains")
                suggestions.append("Which countries have 0% crypto tax?")
                suggestions.append("Compare France and Germany")

        return suggestions[:3]  # Max 3 suggestions

    def _get_defi_context(self, user_id: int) -> str:
        """
        Get user's DeFi audit data and format for AI context

        Returns formatted string with user's DeFi activity summary
        """

        # Get most recent completed audit
        latest_audit = self.db.query(DeFiAudit).filter(
            DeFiAudit.user_id == user_id,
            DeFiAudit.status == 'completed'
        ).order_by(desc(DeFiAudit.created_at)).first()

        if not latest_audit:
            return "USER'S DEFI DATA: No DeFi audit available yet."

        # Get top protocols used
        transactions = self.db.query(DeFiTransaction).filter(
            DeFiTransaction.audit_id == latest_audit.id
        ).all()

        # Count protocols
        protocol_counts = {}
        for tx in transactions:
            if tx.protocol_id:
                protocol = self.db.query(DeFiTransaction).filter(
                    DeFiTransaction.id == tx.id
                ).first()
                # Get protocol name via join would be better, but this works
                protocol_name = "Unknown"
                if hasattr(tx, 'protocol') and tx.protocol:
                    protocol_name = tx.protocol.name

                if protocol_name not in protocol_counts:
                    protocol_counts[protocol_name] = 0
                protocol_counts[protocol_name] += 1

        # Top 3 protocols
        top_protocols = sorted(protocol_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        protocols_text = ", ".join([f"{name} ({count} txs)" for name, count in top_protocols]) if top_protocols else "None"

        # Format context
        net_gain_loss = latest_audit.total_gains_usd - latest_audit.total_losses_usd

        context = f"""
USER'S DEFI DATA (Latest Audit #{latest_audit.id}):
Period: {latest_audit.start_date.strftime('%Y-%m-%d')} to {latest_audit.end_date.strftime('%Y-%m-%d')}
Total Transactions: {latest_audit.total_transactions}
Total Volume: ${latest_audit.total_volume_usd:,.2f}
Net Gain/Loss: ${net_gain_loss:,.2f}

Tax Breakdown:
- Short-term Capital Gains: ${latest_audit.short_term_gains:,.2f} (held < 1 year)
- Long-term Capital Gains: ${latest_audit.long_term_gains:,.2f} (held ≥ 1 year)
- Ordinary Income (staking/rewards): ${latest_audit.ordinary_income:,.2f}
- Total Fees Paid: ${latest_audit.total_fees_usd:,.2f}

Top Protocols Used: {protocols_text}
Chains: {', '.join(latest_audit.chains)}

IMPORTANT: When suggesting simulations, you can use these REAL gains from the user's DeFi activity!
"""

        return context
