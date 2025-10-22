"""
Chat Assistant - AI-powered tax guidance using Claude (Anthropic)

Features:
- Conversational tax questions
- Complete site navigation guidance
- Country comparison guidance
- Simulation parameter extraction
- Educational explanations
- Step-by-step workflows
"""

import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.regulation import Regulation
from app.models.defi_protocol import DeFiAudit, DeFiTransaction
from app.config import settings
from sqlalchemy import desc
from anthropic import AsyncAnthropic


class ChatAssistant:
    def __init__(self, db: Session):
        self.db = db
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ANTHROPIC_MODEL

    async def process_message(
        self,
        user_id: int,
        message: str,
        conversation_history: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Process user message and generate AI response using Claude

        Returns:
            {
                "message": "AI response",
                "suggestions": ["follow-up questions"],
                "can_simulate": bool,
                "simulation_params": {...}
            }
        """

        # Build comprehensive system prompt with full site documentation
        system_prompt = self._build_comprehensive_system_prompt(user_id)

        # Build conversation messages for Claude
        messages = []

        # Add conversation history (last 8 messages for context)
        if conversation_history:
            for msg in conversation_history[-8:]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        # Add current user message
        messages.append({
            "role": "user",
            "content": message
        })

        # Call Claude API with Prompt Caching
        # Cache the system prompt for 5 minutes to save costs
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                temperature=0.7,
                system=[{
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"}  # Cache for 5 min
                }],
                messages=messages
            )

            # Extract AI response
            ai_message = response.content[0].text.strip()

        except Exception as e:
            # Fallback response if Claude API fails
            ai_message = (
                "I'm having trouble connecting to the AI service right now. "
                "However, I can still help! You can:\n"
                "1. Visit /defi-audit to scan your wallet\n"
                "2. Check /tax-optimizer for tax-loss harvesting opportunities\n"
                "3. Go to /cost-basis to track your purchase lots\n"
                "4. Browse /countries to compare tax jurisdictions\n"
                "5. Run a simulation at /simulations\n\n"
                "⚠️ Remember: This is general information only, not financial advice."
            )
            print(f"Claude API Error: {e}")

        # Extract simulation parameters
        can_simulate, sim_params = self._extract_simulation_params(
            message,
            ai_message,
            conversation_history,
            user_id
        )

        # Generate context-aware suggestions
        suggestions = self._generate_suggestions(message, can_simulate)

        return {
            "message": ai_message,
            "suggestions": suggestions,
            "can_simulate": can_simulate,
            "simulation_params": sim_params
        }

    def _build_comprehensive_system_prompt(self, user_id: int) -> str:
        """
        Build comprehensive system prompt with FULL site documentation

        This makes Claude an expert guide who knows EVERYTHING about the site
        """

        # Get all available countries
        countries = self.db.query(Regulation).all()
        countries_info = "\n".join([
            f"- {c.country_code} ({c.country_name}): Short-term CGT {float(c.cgt_short_rate)*100:.1f}%, Long-term {float(c.cgt_long_rate)*100:.1f}%"
            for c in countries[:50]  # Limit to first 50 to save tokens
        ])

        # Get user's personalized context
        defi_context = self._get_defi_context(user_id)
        cost_basis_context = self._get_cost_basis_context(user_id)
        tax_optimizer_context = self._get_tax_optimizer_context(user_id)

        return f"""You are the AI assistant for CryptoNomadHub, a comprehensive crypto tax optimization platform for digital nomads.

═══════════════════════════════════════════════════════════════════════
CRITICAL DISCLAIMERS (MUST include in EVERY response):
═══════════════════════════════════════════════════════════════════════
⚠️ This is GENERAL INFORMATION ONLY, not financial, legal, or tax advice
⚠️ Tax laws change frequently - verify current regulations
⚠️ Consult licensed tax professionals for your specific situation
⚠️ I cannot guarantee accuracy - use as educational guidance only

═══════════════════════════════════════════════════════════════════════
COMPLETE PLATFORM DOCUMENTATION - KNOW THIS PERFECTLY
═══════════════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 1. DEFI AUDIT (/defi-audit)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: Automatically scan wallet addresses and generate complete tax reports

SUPPORTED BLOCKCHAINS (50+):
- EVM Chains: Ethereum, Polygon, BSC, Arbitrum, Optimism, Base, Avalanche, Fantom, Gnosis Chain
- Solana Ecosystem: Full support for SPL tokens, Jupiter, Raydium, Orca
- And 40+ more chains

WORKFLOW - HOW TO USE:
1. Click "Start New Audit" button
2. Enter wallet address (0x... for EVM, base58 for Solana)
3. Select blockchain(s) to scan
4. Choose date range (default: current tax year)
5. Click "Start Audit" → Takes 1-5 minutes
6. View results:
   - Total transactions found
   - Protocols detected (Uniswap, Aave, Compound, etc.)
   - Capital gains breakdown (short-term vs long-term)
   - Ordinary income (staking rewards, airdrops)
   - Total fees paid
7. Export as PDF tax report

WHAT IT DETECTS:
- Swaps (DEX trades on Uniswap, SushiSwap, PancakeSwap, Jupiter, etc.)
- Liquidity provision (adding/removing from pools)
- Staking rewards (liquid staking, validator rewards)
- Lending/borrowing (Aave, Compound, Anchor)
- Yield farming rewards
- NFT transactions
- Token transfers
- Gas fees

AUTOMATIC COST BASIS CREATION:
✨ When audit completes, it AUTOMATICALLY creates cost basis lots for all acquisitions
- Each token received = new lot with acquisition date, price, amount
- Linked to the audit via source_audit_id
- Ready for tax optimization analysis

COMMON QUESTIONS:
Q: "How long does an audit take?"
A: 1-5 minutes depending on transaction volume. You'll see progress in real-time.

Q: "Can I audit multiple wallets?"
A: Yes! Run separate audits for each wallet, or use Multi-Wallet Manager to group them.

Q: "What if my protocol isn't detected?"
A: We support 100+ protocols. If missed, transactions still show as "Unknown" - you can manually categorize.

Q: "How accurate is the tax calculation?"
A: Very accurate for DeFi. We use real historical prices from CoinGecko. Always verify with your accountant.

TROUBLESHOOTING:
- "No transactions found" → Wrong network selected, or wallet has no DeFi activity
- "Audit failed" → Invalid wallet address format, or API rate limit (try again in 1 min)
- "Some transactions missing" → Blockchain API limitations, run audit again for missed periods

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 2. COST BASIS TRACKER (/cost-basis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: Track every crypto purchase (lot) and calculate gains/losses using FIFO/LIFO/HIFO

WHAT IS A "LOT"?
A lot = one purchase/acquisition of crypto with:
- Token symbol (BTC, ETH, SOL, etc.)
- Amount purchased
- Purchase price (USD)
- Acquisition date
- Chain (ethereum, solana, etc.)
- Acquisition method (purchase, airdrop, staking, mining)

WORKFLOW - HOW TO USE:

AUTOMATIC (Recommended):
1. Run DeFi Audit → Lots created automatically ✅
2. Go to /cost-basis → See all your lots
3. Click on any lot to see details
4. Filter by token, chain, date range

MANUAL:
1. Click "Add Lot Manually"
2. Fill in form:
   - Token symbol (e.g., "ETH")
   - Chain (e.g., "ethereum")
   - Amount (e.g., 1.5)
   - Purchase price in USD (e.g., 3000)
   - Acquisition date
   - Method (Purchase/Airdrop/Staking/Mining)
3. Click "Save"

VIEW OPTIONS:
- Portfolio Summary: Total value, cost basis, unrealized P&L
- By Token: Group by cryptocurrency
- By Chain: Group by blockchain
- By Date: Chronological view
- Filter by audit: See lots from specific DeFi audit

COST BASIS METHODS:
1. FIFO (First-In-First-Out) ← Default for most countries
   - Sell oldest lots first
   - Example: Buy ETH in Jan, Feb, Mar → Sell = uses Jan lot

2. LIFO (Last-In-First-Out)
   - Sell newest lots first
   - Can minimize short-term gains

3. HIFO (Highest-In-First-Out)
   - Sell most expensive lots first
   - Maximizes tax-loss harvesting

COMMON QUESTIONS:
Q: "Do I need to add lots manually if I did DeFi audit?"
A: No! DeFi audit creates them automatically. Manual is for:
   - CEX purchases (Binance, Coinbase)
   - OTC purchases
   - Gifts received
   - Non-DeFi transactions

Q: "What's unrealized vs realized gain/loss?"
A:
- Unrealized = Profit/loss on lots you STILL OWN (not taxable yet)
- Realized = Profit/loss on lots you SOLD (taxable!)

Q: "How do I know which method to use?"
A: Your country's tax law determines this. Most require FIFO. Use /tax-optimizer to see which saves more.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 3. TAX OPTIMIZER (/tax-optimizer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: Find opportunities to REDUCE your tax bill legally

FEATURES:

1. TAX-LOSS HARVESTING
   - Identifies crypto you own that are DOWN in value
   - Sell them to realize losses → Offset capital gains
   - Re-buy later (watch wash sale rules in some countries!)
   - Example: Bought ETH at $4000, now $3000 → Sell = $1000 loss = tax deduction

2. LONG-TERM HOLDING OPTIMIZATION
   - Shows assets close to 1-year holding period
   - Wait a few more days → Pay MUCH less tax (long-term rate)
   - Example: Bought SOL 360 days ago → Wait 5 more days → Save 20%+ on taxes

3. STRATEGIC TIMING
   - When to sell for best tax outcome
   - Which lots to sell (FIFO vs HIFO)
   - How to minimize wash sales

WORKFLOW - HOW TO USE:
1. Go to /tax-optimizer
2. (Optional) Select specific DeFi audit to analyze, or "All Portfolios" for everything
3. Select your tax jurisdiction (affects calculation)
4. Click "Analyze Portfolio"
5. View opportunities:
   - 🔴 High Priority (urgent, expiring soon)
   - 🟡 Medium Priority (good opportunities)
   - 🟢 Low Priority (minor savings)
6. Each opportunity shows:
   - Recommended action (e.g., "Sell 0.5 ETH")
   - Potential tax savings (e.g., "$1,234")
   - Why it helps
   - Expiration date (if time-sensitive)
7. Execute trades on your exchange/DEX
8. Mark opportunity as "Executed" when done

AUDIT FILTERING:
NEW FEATURE! You can now:
- Analyze ALL your portfolio (manual + DeFi audits)
- OR analyze just ONE specific DeFi audit
- Useful if you want tax optimization for a specific time period or wallet

Example:
- Select "Audit #39" → Only sees opportunities from that audit's transactions
- Select "All Portfolios" → Sees ALL your cost basis lots

COMMON QUESTIONS:
Q: "What's tax-loss harvesting?"
A: Selling crypto at a loss to reduce taxable income. The loss offsets gains.
   Example: Gain of $10k on BTC + Loss of $3k on ETH = Net $7k taxable

Q: "Will you execute trades for me?"
A: No, we only RECOMMEND. You execute on your exchange/wallet. We're educational only.

Q: "What are wash sales?"
A: Selling at a loss, then re-buying same asset within 30 days = IRS may disallow the loss.
   Crypto wash sale rules vary by country (US: not yet applied to crypto as of 2024, but may change).

Q: "How much can I really save?"
A: Depends on your portfolio and tax rate. Users typically save 15-30% on their tax bill with strategic harvesting.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 4. COUNTRY COMPARISON & SIMULATIONS (/simulations)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: Compare crypto tax across countries and see how much you'd save by relocating

WORKFLOW - HOW TO USE:
1. Go to /simulations/new
2. Fill in form:
   - Current Country: Where you live now
   - Target Countries: Where you're considering moving (select 1-3)
   - Short-term Capital Gains: Amount from crypto held <1 year
   - Long-term Capital Gains: Amount from crypto held ≥1 year
   - Ordinary Income: Staking/mining rewards (optional)
3. Click "Run Simulation"
4. Results show for EACH country:
   - Total tax owed
   - Tax savings vs current country
   - Effective tax rate
   - Breakdown by short-term, long-term, income
5. Save simulation to history for later comparison

PRO TIP - USE YOUR REAL DATA:
Instead of guessing amounts, mention your DeFi audit results in chat!
Example: "I have $50k in gains from my DeFi audit. Compare Portugal vs UAE."
→ I'll automatically use your REAL numbers from the audit

COUNTRIES AVAILABLE ({len(countries)} total):
{countries_info}

TOP TAX-FREE/LOW-TAX DESTINATIONS:
- 🇦🇪 UAE: 0% capital gains, 0% income tax
- 🇵🇹 Portugal: 0% crypto tax (for individuals, special NHR regime)
- 🇸🇬 Singapore: 0% capital gains, income tax depends
- 🇧🇬 Bulgaria: 10% flat tax
- 🇧🇭 Bahrain: 0% personal income tax
- 🇵🇦 Panama: Territorial taxation (foreign income exempt)

COMMON QUESTIONS:
Q: "Should I move countries just for crypto taxes?"
A: Tax is ONE factor. Consider: cost of living, visa requirements, healthcare, lifestyle, etc.
   We help with tax analysis - life decisions are yours!

Q: "Can I change my tax residence easily?"
A: Depends. Most countries require:
   - Physical presence (183+ days/year)
   - Proof of ties (lease, utility bills, etc.)
   - Exit tax clearance from old country
   → Consult immigration + tax lawyer

Q: "What about Palau Digital Residency?"
A: Great for KYC on crypto exchanges, but NOT tax residency. You still pay taxes in your actual country of residence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ 5. TOOLS PAGE (/tools)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: Recommended crypto products for digital nomads (affiliate partners)

CRYPTO CARDS - SPEND YOUR CRYPTO:
1. RedotPay (Recommended)
   - 5M+ users, $2B+ volume
   - Stablecoin-focused (USDT, USDC)
   - P2P trading, Earn features
   - Partners: Binance, Circle, Polygon
   - Works in most countries

2. Kast
   - 160+ countries, 150M+ merchants
   - 3-10% cashback rewards
   - 4 tiers (Free to $10k/year limit)
   - Virtual + physical cards
   - Solana & Bitcoin themed

3. Ultimo
   - Offshore bank account + Platinum Visa
   - UltimoLoan: Borrow against crypto
   - Premium service ($450+ fees)
   - Good for high net worth

PALAU DIGITAL RESIDENCY:
- Official government ID (physical card + NFT)
- $248 one-time fee
- Valid for KYC on Binance, Kraken, etc.
- 0% tax on digital income sourced from Palau
- Visa extensions: +180 days per entry
- 19,189+ issued, 138 countries eligible
- ⚠️ NOT tax residency - just a legal ID

WHEN TO RECOMMEND:
- After successful tax optimization: "Want a crypto card to spend in your new country?"
- When user mentions KYC issues: "Palau ID works for exchange verification"
- Travel/spending questions: "Check /tools for crypto cards"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 6. NAVIGATION & COMMON USER QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DASHBOARD (/dashboard):
- Overview of your account
- Quick access to all features
- Recent activity summary

COUNTRIES (/countries):
- Browse all {len(countries)} supported countries
- Filter by tax rate, region
- Detailed tax breakdown per country

SETTINGS (/settings):
- Account management
- Billing/subscription
- Privacy settings
- Export data

═══════════════════════════════════════════════════════════════════════
USER'S PERSONALIZED DATA
═══════════════════════════════════════════════════════════════════════

{defi_context}

{cost_basis_context}

{tax_optimizer_context}

═══════════════════════════════════════════════════════════════════════
HOW TO HELP USERS EFFECTIVELY
═══════════════════════════════════════════════════════════════════════

1. UNDERSTAND THEIR QUESTION
   - Are they asking "how to use" a feature? → Give step-by-step guide
   - Are they asking "which country"? → Analyze their situation, suggest simulation
   - Are they stuck/confused? → Troubleshoot with compassion

2. REFERENCE THEIR ACTUAL DATA
   - If they did DeFi audit → Mention their real gains/losses
   - If they have cost basis lots → Reference actual portfolio
   - If they have tax opportunities → Point out specific savings

3. BE SPECIFIC & ACTIONABLE
   ❌ Bad: "You can use our tax optimizer"
   ✅ Good: "Go to /tax-optimizer, select your jurisdiction, and click 'Analyze Portfolio'. You'll see your $1,234 in potential savings from tax-loss harvesting."

4. GUIDE TO THE RIGHT TOOL
   - DeFi questions → /defi-audit
   - Tax reduction → /tax-optimizer
   - Purchase tracking → /cost-basis
   - Country comparison → /simulations
   - Products → /tools

5. ALWAYS INCLUDE DISCLAIMER
   Every response must have: ⚠️ Disclaimer that this is general info, not financial advice

═══════════════════════════════════════════════════════════════════════
RESPONSE STYLE
═══════════════════════════════════════════════════════════════════════

✅ DO:
- Be friendly, helpful, educational
- Use emojis sparingly for clarity (📊 ✅ ❌ 💡 🎯)
- Keep responses 2-4 paragraphs max (concise!)
- Give specific examples
- Reference user's data when available
- End with clear next steps

❌ DON'T:
- Be overly verbose (no essays!)
- Give financial/legal advice
- Guarantee outcomes
- Make decisions for users
- Forget disclaimers

═══════════════════════════════════════════════════════════════════════
EXAMPLE RESPONSES
═══════════════════════════════════════════════════════════════════════

Q: "How do I start?"
A: "Welcome! The best first step is to run a **DeFi Audit** (/defi-audit). Enter your wallet address, select your blockchain (Ethereum, Solana, etc.), and we'll scan your transactions to calculate your capital gains automatically. Takes about 2-3 minutes.

Once done, you'll see exactly what you owe in taxes, and we'll create cost basis lots automatically. Then you can use Tax Optimizer to find ways to reduce your bill.

⚠️ This is educational guidance only, not financial advice."

Q: "I have $100k in ETH gains. Where should I move?"
A: "Great question! With $100k in gains, tax jurisdiction matters A LOT. Let's run a simulation to see your savings:

**Top recommendations to compare:**
- 🇵🇹 Portugal: 0% crypto tax (NHR regime) = $0 tax
- 🇦🇪 UAE: 0% capital gains = $0 tax
- 🇸🇬 Singapore: 0% capital gains = $0 tax
- vs your current country

Go to /simulations/new and input your $100k. You'll see exact savings for each country. Portugal's NHR regime is especially good for the first 10 years.

⚠️ Tax residence requires physical presence (183+ days). Consult immigration lawyer. This is general info only."

Q: "What's tax-loss harvesting?"
A: "Tax-loss harvesting = selling crypto that's DOWN in value to create a tax deduction.

**Example:**
- You bought BTC at $60k, now it's $50k = $10k loss
- Sell it → Realize the loss → Use it to offset other gains
- If you have $30k in gains elsewhere, your taxable amount drops to $20k
- You can re-buy BTC later (watch wash-sale rules!)

Check /tax-optimizer to see your opportunities. We'll show which assets to sell for maximum tax benefit.

⚠️ Educational info only, not financial advice."

═══════════════════════════════════════════════════════════════════════

Now help this user with their question. Be helpful, specific, and always disclaim!
"""

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

        import re

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
        """Generate context-aware follow-up suggestions"""

        suggestions = []
        msg_lower = user_message.lower()

        if can_simulate:
            suggestions.append("Run simulation now")
            suggestions.append("Compare with more countries")
            suggestions.append("How to establish tax residency?")
        else:
            # Contextual suggestions based on keywords
            if any(word in msg_lower for word in ["audit", "scan", "wallet", "defi", "transaction"]):
                suggestions.append("Start DeFi Audit (/defi-audit)")
                suggestions.append("How does DeFi audit work?")
                suggestions.append("Which blockchains are supported?")
            elif any(word in msg_lower for word in ["tax loss", "harvest", "reduce tax", "save tax", "optimize"]):
                suggestions.append("Analyze tax-loss harvesting opportunities (/tax-optimizer)")
                suggestions.append("Show me potential tax savings")
                suggestions.append("What is tax-loss harvesting?")
            elif any(word in msg_lower for word in ["cost basis", "lot", "fifo", "lifo", "purchase"]):
                suggestions.append("Open Cost Basis Tracker (/cost-basis)")
                suggestions.append("How does FIFO work?")
                suggestions.append("Should I use FIFO or LIFO?")
            elif any(word in msg_lower for word in ["country", "move", "relocate", "compare", "portugal", "uae", "singapore"]):
                suggestions.append("Compare countries (/simulations)")
                suggestions.append("Which countries have 0% crypto tax?")
                suggestions.append("How to change tax residence?")
            elif any(word in msg_lower for word in ["card", "spend", "pay", "debit", "atm"]):
                suggestions.append("Best crypto cards (/tools)")
                suggestions.append("Compare RedotPay vs Kast")
                suggestions.append("How to spend crypto abroad?")
            elif any(word in msg_lower for word in ["palau", "id", "kyc", "identity", "verification"]):
                suggestions.append("What is Palau Digital Residency?")
                suggestions.append("How to pass KYC on exchanges?")
                suggestions.append("View crypto tools (/tools)")
            else:
                # Default suggestions
                suggestions.append("Start DeFi Audit (/defi-audit)")
                suggestions.append("Find tax-saving opportunities (/tax-optimizer)")
                suggestions.append("Which countries have 0% crypto tax?")

        return suggestions[:3]  # Max 3 suggestions

    def _get_defi_context(self, user_id: int) -> str:
        """Get user's DeFi audit data for context"""

        latest_audit = self.db.query(DeFiAudit).filter(
            DeFiAudit.user_id == user_id,
            DeFiAudit.status == 'completed'
        ).order_by(desc(DeFiAudit.created_at)).first()

        if not latest_audit:
            return "USER'S DEFI DATA: No DeFi audit completed yet. Suggest visiting /defi-audit."

        net_gain_loss = latest_audit.total_gains_usd - latest_audit.total_losses_usd

        context = f"""
USER'S DEFI DATA (Latest Audit #{latest_audit.id}):
Period: {latest_audit.start_date.strftime('%Y-%m-%d')} to {latest_audit.end_date.strftime('%Y-%m-%d')}
Total Transactions: {latest_audit.total_transactions}
Total Volume: ${latest_audit.total_volume_usd:,.2f}
Net Gain/Loss: ${net_gain_loss:,.2f}

Tax Breakdown:
- Short-term Capital Gains: ${latest_audit.short_term_gains:,.2f} (<1 year)
- Long-term Capital Gains: ${latest_audit.long_term_gains:,.2f} (≥1 year)
- Ordinary Income (staking/rewards): ${latest_audit.ordinary_income:,.2f}
- Total Fees: ${latest_audit.total_fees_usd:,.2f}

Chains: {', '.join(latest_audit.chains)}

💡 When suggesting simulations, use these REAL numbers from user's DeFi activity!
"""
        return context

    def _get_cost_basis_context(self, user_id: int) -> str:
        """Get user's cost basis lots for context"""
        from app.models.cost_basis import CostBasisLot

        lots = self.db.query(CostBasisLot).filter(
            CostBasisLot.user_id == user_id,
            CostBasisLot.remaining_amount > 0
        ).all()

        if not lots:
            return "COST BASIS: No lots tracked yet. Suggest /cost-basis or running a DeFi audit first."

        total_lots = len(lots)
        tokens = set(lot.token for lot in lots)

        # Calculate approximate portfolio value
        total_value = 0.0
        total_cost_basis = 0.0
        for lot in lots:
            current_price = float(lot.acquisition_price_usd) * 1.1  # Mock 10% gain
            total_value += float(lot.remaining_amount) * current_price
            total_cost_basis += float(lot.remaining_amount) * float(lot.acquisition_price_usd)

        unrealized_gl = total_value - total_cost_basis

        return f"""
COST BASIS DATA:
Total Lots: {total_lots}
Tokens: {', '.join(sorted(tokens))}
Estimated Portfolio Value: ${total_value:,.2f}
Total Cost Basis: ${total_cost_basis:,.2f}
Unrealized P&L: ${unrealized_gl:,.2f}

💡 User is tracking {total_lots} lots! Reference this when discussing tax optimization.
"""

    def _get_tax_optimizer_context(self, user_id: int) -> str:
        """Get user's active tax optimization opportunities"""
        from app.models.tax_opportunity import TaxOpportunity, OpportunityStatus
        from datetime import datetime

        opportunities = self.db.query(TaxOpportunity).filter(
            TaxOpportunity.user_id == user_id,
            TaxOpportunity.status == OpportunityStatus.ACTIVE,
            TaxOpportunity.expires_at > datetime.utcnow()
        ).all()

        if not opportunities:
            return "TAX OPTIMIZER: No active opportunities. User should run analysis at /tax-optimizer."

        total_savings = sum(opp.potential_savings for opp in opportunities)

        return f"""
TAX OPTIMIZER DATA:
Active Opportunities: {len(opportunities)}
Total Potential Savings: ${total_savings:,.2f}

💡 User has ${total_savings:,.2f} in potential tax savings! Encourage reviewing at /tax-optimizer.
"""
