"""
AI-powered country analysis service using Anthropic Claude
Generates crypto ecosystem and digital nomad scores with detailed analysis
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)

class CountryAnalysisAI:
    """Generate AI-powered country analyses for crypto and nomad scores"""

    def __init__(self):
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        self.model = os.getenv('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022')
        self.cache_ttl = timedelta(days=30)

        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

    async def analyze_country(
        self,
        db: Session,
        country_code: str,
        force_refresh: bool = False
    ) -> Dict:
        """
        Generate AI analysis for a country

        Args:
            db: Database session
            country_code: ISO 2-letter country code
            force_refresh: Force regeneration even if cached

        Returns:
            Dictionary with analysis data
        """
        try:
            # 1. Check cache (unless force_refresh)
            if not force_refresh:
                cached = await self._get_cached_analysis(db, country_code)
                if cached and not self._is_expired(cached):
                    logger.info(f"Returning cached analysis for {country_code}")
                    return cached

            # 2. Fetch country regulation data
            from app.models.regulation import Regulation
            regulation = db.query(Regulation).filter_by(country_code=country_code).first()

            if not regulation:
                raise ValueError(f"Country {country_code} not found in database")

            # 3. Build AI prompt
            prompt = self._build_analysis_prompt(regulation)

            # 4. Call Anthropic API
            logger.info(f"Generating analysis for {country_code} using {self.model}")
            start_time = datetime.now()

            import anthropic
            client = anthropic.Anthropic(api_key=self.api_key)

            response = client.messages.create(
                model=self.model,
                max_tokens=2500,
                temperature=0.3,  # Deterministic for consistency
                system=self._get_system_prompt(),
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            logger.info(f"Analysis generated in {duration_ms}ms")

            # 5. Parse AI response
            analysis = self._parse_ai_response(response.content[0].text)

            # 6. Save to database
            result = await self._save_analysis(db, country_code, analysis, duration_ms)

            return result

        except Exception as e:
            logger.error(f"Error analyzing country {country_code}: {e}")
            raise

    def _get_system_prompt(self) -> str:
        """System prompt defining AI role and guidelines"""
        return """You are a crypto ecosystem and digital nomad expert analyst.

Your role is to analyze countries for two distinct audiences:
1. **Crypto Enthusiasts**: People involved in the cryptocurrency ecosystem (holders, investors, developers, miners, DeFi users, NFT collectors)
2. **Digital Nomads**: Remote workers seeking tax-efficient countries with good quality of life

SCORING PHILOSOPHY:

**Crypto Score (0-100)** - Evaluates the ENTIRE crypto ecosystem:
- Tax Favorability (30%): CGT rates, holding periods, exemptions, staking/mining treatment
- Legal Clarity (25%): Clear regulations, crypto legal status, government stance
- Crypto Adoption (25%): Exchange presence, merchant acceptance, ATM availability, payment adoption
- Innovation Ecosystem (20%): Blockchain startups, crypto jobs, conferences, developer community

**Nomad Score (0-100)** - Evaluates digital nomad appeal:
- Cost of Living (30%): Rent, food, transportation, healthcare costs relative to income
- Visa Accessibility (25%): Digital nomad visa, ease of obtaining residency, visa-free travel
- Infrastructure (25%): Internet speed, coworking spaces, public transport, safety
- Expat Community (20%): English proficiency, expat presence, networking opportunities

IMPORTANT GUIDELINES:
- Be objective and data-driven, not promotional
- Consider both opportunities and risks
- Acknowledge regulatory uncertainty where it exists
- Use concrete examples when possible
- Scores should be relative to global standards (US/UK/EU = baseline ~60-70)
- Return ONLY valid JSON, no markdown formatting"""

    def _build_analysis_prompt(self, regulation) -> str:
        """Build context-rich prompt from regulation data"""

        # Crypto context
        crypto_status_emoji = {
            'banned': '🚫 BANNED',
            'restricted': '⚠️ RESTRICTED',
            'unclear': '❓ UNCLEAR',
            'legal': '✅ LEGAL'
        }
        crypto_status = crypto_status_emoji.get(regulation.crypto_legal_status, '✅ LEGAL')

        short_rate = regulation.crypto_short_rate if regulation.crypto_short_rate is not None else regulation.cgt_short_rate
        long_rate = regulation.crypto_long_rate if regulation.crypto_long_rate is not None else regulation.cgt_long_rate

        short_rate_pct = f"{short_rate*100:.1f}%" if short_rate >= 0 else "N/A"
        long_rate_pct = f"{long_rate*100:.1f}%" if long_rate >= 0 else "N/A"

        prompt = f"""Analyze {regulation.country_name} ({regulation.country_code}) for the cryptocurrency ecosystem and digital nomads.

**CRYPTO TAX & LEGAL DATA:**
- Legal Status: {crypto_status}
- Short-term CGT: {short_rate_pct} (<{regulation.holding_period_months or 12} months)
- Long-term CGT: {long_rate_pct} (>{regulation.holding_period_months or 12} months)
- Tax System: {"Flat" if regulation.is_flat_tax else "Progressive" if regulation.is_progressive else "Territorial" if regulation.is_territorial else "Standard"}
- Exemption Threshold: {f"{regulation.exemption_threshold:,.0f} {regulation.exemption_threshold_currency}" if regulation.exemption_threshold else "None"}
- Crypto-Specific Rules: {"Yes" if regulation.crypto_specific else "No"}
{f"- Special Notes: {regulation.crypto_notes[:300]}" if regulation.crypto_notes else ""}
{f"- Additional Info: {regulation.notes[:200]}" if regulation.notes else ""}

**YOUR TASK:**
Analyze the ENTIRE crypto ecosystem (not just trading), including:
1. Tax treatment for all crypto activities (holding, trading, staking, mining, DeFi, NFTs)
2. Legal framework and regulatory clarity
3. Crypto adoption and infrastructure (exchanges, ATMs, merchant acceptance)
4. Innovation ecosystem (startups, jobs, events, developer community)

Also analyze digital nomad appeal considering cost, visa policies, infrastructure, and community.

**REQUIRED OUTPUT (JSON):**
{{
  "crypto_score": <0-100>,
  "nomad_score": <0-100>,
  "crypto_analysis": "<200-300 words analyzing ENTIRE crypto ecosystem: taxes, legal, adoption, innovation>",
  "nomad_analysis": "<200-300 words analyzing nomad lifestyle: cost, visa, infrastructure, community>",
  "key_advantages": ["advantage 1", "advantage 2", "advantage 3"],
  "key_disadvantages": ["disadvantage 1", "disadvantage 2"],
  "best_for": ["Long-term crypto holders", "DeFi enthusiasts", "Blockchain developers", etc],
  "crypto_score_breakdown": {{
    "tax_favorability": <0-100>,
    "legal_clarity": <0-100>,
    "crypto_adoption": <0-100>,
    "innovation_ecosystem": <0-100>
  }},
  "nomad_score_breakdown": {{
    "cost_of_living": <0-100>,
    "visa_accessibility": <0-100>,
    "infrastructure": <0-100>,
    "expat_community": <0-100>
  }},
  "confidence": <0.0-1.0>
}}

**SCORING GUIDELINES:**
Crypto Score Components:
- Tax (30%): 90-100=0% tax, 70-89=<10%, 50-69=10-20%, 30-49=20-30%, 0-29=>30% or banned
- Legal (25%): 90-100=clear+friendly, 70-89=clear, 50-69=unclear, 30-49=restrictive, 0-29=banned
- Adoption (25%): 90-100=widespread, 70-89=growing, 50-69=moderate, 30-49=limited, 0-29=minimal
- Innovation (20%): 90-100=hub, 70-89=active, 50-69=emerging, 30-49=limited, 0-29=none

Nomad Score Components:
- Cost (30%): Lower is better - 90-100=very cheap, 70-89=affordable, 50-69=moderate, 30-49=expensive, 0-29=very expensive
- Visa (25%): 90-100=digital nomad visa, 70-89=easy residency, 50-69=tourist visa, 30-49=difficult, 0-29=very difficult
- Infrastructure (25%): 90-100=excellent, 70-89=good, 50-69=adequate, 30-49=poor, 0-29=very poor
- Community (20%): 90-100=thriving, 70-89=active, 50-69=small, 30-49=limited, 0-29=isolated

Confidence: 0.9-1.0 (official gov data), 0.7-0.9 (reliable sources), 0.5-0.7 (estimates), <0.5 (very uncertain)

Return ONLY valid JSON, no markdown blocks or extra text."""

        return prompt

    def _parse_ai_response(self, response_text: str) -> Dict:
        """Parse and validate AI JSON response"""
        try:
            # Remove markdown if present
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            data = json.loads(response_text)

            # Validate required fields
            required = [
                'crypto_score', 'nomad_score', 'crypto_analysis', 'nomad_analysis',
                'crypto_score_breakdown', 'nomad_score_breakdown'
            ]
            for field in required:
                if field not in data:
                    raise ValueError(f"Missing required field: {field}")

            # Validate score ranges
            if not (0 <= data['crypto_score'] <= 100):
                raise ValueError(f"crypto_score out of range: {data['crypto_score']}")
            if not (0 <= data['nomad_score'] <= 100):
                raise ValueError(f"nomad_score out of range: {data['nomad_score']}")

            # Validate confidence
            confidence = data.get('confidence', 0.8)
            if not (0 <= confidence <= 1):
                data['confidence'] = 0.8

            # Set defaults for optional fields
            data.setdefault('key_advantages', [])
            data.setdefault('key_disadvantages', [])
            data.setdefault('best_for', [])

            return data

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON from AI: {e}\nResponse: {response_text[:500]}")
            raise ValueError(f"Invalid JSON response from AI: {e}")
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            raise

    async def _save_analysis(
        self,
        db: Session,
        country_code: str,
        analysis: Dict,
        duration_ms: int
    ) -> Dict:
        """Save or update analysis in database"""

        from app.models.country_analysis import CountryAnalysis

        # Check if exists
        existing = db.query(CountryAnalysis).filter_by(country_code=country_code).first()

        if existing:
            # Update existing
            existing.crypto_score = analysis['crypto_score']
            existing.nomad_score = analysis['nomad_score']
            existing.crypto_analysis = analysis['crypto_analysis']
            existing.nomad_analysis = analysis['nomad_analysis']
            existing.key_advantages = analysis.get('key_advantages', [])
            existing.key_disadvantages = analysis.get('key_disadvantages', [])
            existing.best_for = analysis.get('best_for', [])
            existing.crypto_score_breakdown = analysis['crypto_score_breakdown']
            existing.nomad_score_breakdown = analysis['nomad_score_breakdown']
            existing.generated_at = datetime.now()
            existing.expires_at = datetime.now() + self.cache_ttl
            existing.model_used = self.model
            existing.generation_duration_ms = duration_ms
            existing.confidence = analysis.get('confidence', 0.8)
            existing.auto_generated = True

            db.commit()
            db.refresh(existing)

            logger.info(f"Updated analysis for {country_code}")
            return existing.to_dict()
        else:
            # Create new
            new_analysis = CountryAnalysis(
                country_code=country_code,
                crypto_score=analysis['crypto_score'],
                nomad_score=analysis['nomad_score'],
                crypto_analysis=analysis['crypto_analysis'],
                nomad_analysis=analysis['nomad_analysis'],
                key_advantages=analysis.get('key_advantages', []),
                key_disadvantages=analysis.get('key_disadvantages', []),
                best_for=analysis.get('best_for', []),
                crypto_score_breakdown=analysis['crypto_score_breakdown'],
                nomad_score_breakdown=analysis['nomad_score_breakdown'],
                model_used=self.model,
                generation_duration_ms=duration_ms,
                confidence=analysis.get('confidence', 0.8),
                auto_generated=True
            )

            db.add(new_analysis)
            db.commit()
            db.refresh(new_analysis)

            logger.info(f"Created new analysis for {country_code}")
            return new_analysis.to_dict()

    async def _get_cached_analysis(self, db: Session, country_code: str) -> Optional[Dict]:
        """Get cached analysis if exists and not expired"""
        from app.models.country_analysis import CountryAnalysis

        analysis = db.query(CountryAnalysis).filter_by(country_code=country_code).first()

        if analysis:
            return analysis.to_dict()
        return None

    def _is_expired(self, analysis_dict: Dict) -> bool:
        """Check if cached analysis has expired"""
        if not analysis_dict or 'expires_at' not in analysis_dict:
            return True

        try:
            expires_at = datetime.fromisoformat(analysis_dict['expires_at'].replace('Z', '+00:00'))
            return datetime.now(expires_at.tzinfo) > expires_at
        except:
            return True

    async def batch_analyze_countries(
        self,
        db: Session,
        country_codes: list[str],
        force_refresh: bool = False
    ) -> Dict[str, Dict]:
        """Analyze multiple countries (for admin bulk operations)"""
        results = {}

        for code in country_codes:
            try:
                result = await self.analyze_country(db, code, force_refresh)
                results[code] = {"status": "success", "data": result}
                logger.info(f"Successfully analyzed {code}")
            except Exception as e:
                logger.error(f"Failed to analyze {code}: {e}")
                results[code] = {"status": "error", "error": str(e)}

        return results
