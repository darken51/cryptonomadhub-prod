"""
Tax Data Aggregator

Combines data from multiple free sources:
- World Bank API
- Tax Foundation (scraping)
- OECD API

Intelligently merges and validates data
"""

import logging
from typing import Dict, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

from .worldbank_client import WorldBankClient
from .taxfoundation_scraper import TaxFoundationScraper
from .oecd_client import OECDClient
from .kpmg_scraper import KPMGScraper
from .koinly_crypto_scraper import KoinlyCryptoScraper
from .pwc_scraper import PwCScraper
from app.models.regulation import Regulation
from app.services.notification_service import NotificationService
from app.services.regulation_history import RegulationHistoryService

logger = logging.getLogger(__name__)


class TaxDataAggregator:
    """
    Aggregates tax data from multiple free sources

    Priority for CGT rates:
    1. Tax Foundation (most accurate for CGT)
    2. OECD (reliable for members)
    3. World Bank (macro data)
    """

    def __init__(self, db: Session):
        self.db = db
        self.wb_client = WorldBankClient()
        self.tf_scraper = TaxFoundationScraper()
        self.oecd_client = OECDClient()
        self.kpmg_scraper = KPMGScraper()
        self.koinly_scraper = KoinlyCryptoScraper()
        self.pwc_scraper = PwCScraper()
        self.notifier = NotificationService(db)

    async def close(self):
        """Close all HTTP clients"""
        await self.wb_client.close()
        await self.tf_scraper.close()
        await self.oecd_client.close()
        await self.kpmg_scraper.close()
        await self.koinly_scraper.close()
        await self.pwc_scraper.close()

    async def fetch_country_data(self, country_code: str) -> Dict:
        """
        Fetch data for a country from all sources

        Returns:
            {
                'country_code': 'FR',
                'sources': {
                    'tax_foundation': {...},
                    'world_bank': {...},
                    'oecd': {...}
                },
                'merged': {...},
                'confidence': 0.85
            }
        """
        logger.info(f"Aggregating data for {country_code}")

        country_code = country_code.upper()
        sources = {}

        # Fetch from Tax Foundation (best for CGT)
        try:
            tf_data = await self.tf_scraper.get_country_rate(country_code)
            if tf_data:
                sources['tax_foundation'] = tf_data
                logger.info(f"✓ Tax Foundation data found for {country_code}")
        except Exception as e:
            logger.warning(f"Tax Foundation fetch failed for {country_code}: {e}")

        # Fetch from World Bank
        try:
            wb_data = await self.wb_client.get_tax_data(country_code)
            if wb_data:
                sources['world_bank'] = wb_data
                logger.info(f"✓ World Bank data found for {country_code}")
        except Exception as e:
            logger.warning(f"World Bank fetch failed for {country_code}: {e}")

        # Fetch from OECD (if member)
        try:
            if await self.oecd_client.is_oecd_member(country_code):
                oecd_data = await self.oecd_client.get_tax_rates(country_code)
                if oecd_data:
                    sources['oecd'] = oecd_data
                    logger.info(f"✓ OECD data found for {country_code}")
        except Exception as e:
            logger.warning(f"OECD fetch failed for {country_code}: {e}")

        # Fetch from KPMG (127 countries)
        try:
            kpmg_data = await self.kpmg_scraper.get_country_rate(country_code)
            if kpmg_data:
                sources['kpmg'] = kpmg_data
                logger.info(f"✓ KPMG data found for {country_code}")
        except Exception as e:
            logger.warning(f"KPMG fetch failed for {country_code}: {e}")

        # Fetch from Koinly (crypto-specific)
        try:
            koinly_data = await self.koinly_scraper.get_country_crypto_rate(country_code)
            if koinly_data:
                sources['koinly'] = koinly_data
                logger.info(f"✓ Koinly crypto data found for {country_code}")
        except Exception as e:
            logger.warning(f"Koinly fetch failed for {country_code}: {e}")

        # Fetch from PwC (148 territories)
        try:
            pwc_data = await self.pwc_scraper.get_country_rate(country_code)
            if pwc_data:
                sources['pwc'] = pwc_data
                logger.info(f"✓ PwC data found for {country_code}")
        except Exception as e:
            logger.warning(f"PwC fetch failed for {country_code}: {e}")

        # Merge data
        merged = self._merge_sources(country_code, sources)

        # Calculate confidence
        confidence = self._calculate_confidence(sources, merged)

        return {
            'country_code': country_code,
            'sources': sources,
            'merged': merged,
            'confidence': confidence,
            'fetched_at': datetime.utcnow().isoformat()
        }

    def _merge_sources(self, country_code: str, sources: Dict) -> Dict:
        """
        Intelligently merge data from multiple sources

        Priority for general CGT:
        1. Tax Foundation (Europe - 29 countries, most accurate)
        2. PwC Tax Summaries (148 territories, Big 4 validated)
        3. KPMG (127 countries)
        4. OECD (38 members)

        Priority for crypto-specific:
        1. Koinly (crypto-specific rules)
        2. Fallback to general CGT
        """
        merged = {
            'country_code': country_code,
            'cgt_rate': None,
            'crypto_short_rate': None,
            'crypto_long_rate': None,
            'crypto_notes': None,
            'income_tax_top': None,
            'data_quality': 'unknown',
            'sources_used': [],
            'notes': []
        }

        # CGT Rate: Prefer Tax Foundation > PwC > KPMG
        if 'tax_foundation' in sources:
            tf_data = sources['tax_foundation']
            merged['cgt_rate'] = tf_data.get('cgt_rate')
            merged['sources_used'].append('Tax Foundation')
            merged['data_quality'] = 'high'

            if tf_data.get('notes'):
                merged['notes'].append(f"TF: {tf_data['notes']}")

        elif 'pwc' in sources:
            pwc_data = sources['pwc']
            merged['cgt_rate'] = pwc_data.get('cgt_rate')
            merged['sources_used'].append('PwC')
            merged['data_quality'] = 'high'

            if pwc_data.get('notes'):
                merged['notes'].append(f"PwC: {pwc_data['notes']}")

        elif 'kpmg' in sources:
            kpmg_data = sources['kpmg']
            merged['cgt_rate'] = kpmg_data.get('cgt_rate')
            merged['sources_used'].append('KPMG')
            merged['data_quality'] = 'high'

            if kpmg_data.get('notes'):
                merged['notes'].append(f"KPMG: {kpmg_data['notes']}")

        # Crypto-specific rates from Koinly
        if 'koinly' in sources:
            koinly_data = sources['koinly']
            merged['crypto_short_rate'] = koinly_data.get('crypto_short_rate')
            merged['crypto_long_rate'] = koinly_data.get('crypto_long_rate')
            merged['crypto_notes'] = koinly_data.get('crypto_notes')
            merged['sources_used'].append('Koinly')

            if koinly_data.get('crypto_notes'):
                merged['notes'].append(f"Koinly: {koinly_data['crypto_notes']}")

        # Income Tax: Prefer OECD
        if 'oecd' in sources:
            oecd_data = sources['oecd']
            merged['income_tax_top'] = oecd_data.get('personal_income_tax_top')
            merged['sources_used'].append('OECD')

            if oecd_data.get('note'):
                merged['notes'].append(f"OECD: {oecd_data['note']}")

        # Macro context: World Bank
        if 'world_bank' in sources:
            wb_data = sources['world_bank']
            merged['tax_revenue_context'] = {
                'tax_income_profits_pct': wb_data.get('tax_income_profits_pct'),
                'year': wb_data.get('year')
            }
            merged['sources_used'].append('World Bank')

        # If no CGT from Tax Foundation/KPMG but have OECD or WB, mark as medium quality
        if not merged['cgt_rate'] and ('oecd' in sources or 'world_bank' in sources):
            merged['data_quality'] = 'medium'

        return merged

    def _calculate_confidence(self, sources: Dict, merged: Dict) -> float:
        """
        Calculate confidence score (0.0 - 1.0)

        Factors:
        - Number of sources
        - Quality of sources
        - Data completeness
        """
        score = 0.0

        # Base score by number of sources
        num_sources = len(sources)
        if num_sources >= 3:
            score += 0.5
        elif num_sources == 2:
            score += 0.3
        elif num_sources == 1:
            score += 0.1

        # Bonus for Tax Foundation (best for Europe CGT)
        if 'tax_foundation' in sources and merged.get('cgt_rate') is not None:
            score += 0.25

        # Bonus for PwC (Big 4, 148 territories, highly reliable)
        if 'pwc' in sources and merged.get('cgt_rate') is not None:
            score += 0.25

        # Bonus for KPMG (reliable, 127 countries)
        if 'kpmg' in sources and merged.get('cgt_rate') is not None:
            score += 0.20

        # Bonus for Koinly (crypto-specific)
        if 'koinly' in sources:
            score += 0.20

        # Bonus for OECD (reliable)
        if 'oecd' in sources:
            score += 0.10

        # Bonus for data completeness
        if merged.get('cgt_rate') is not None:
            score += 0.05

        if merged.get('crypto_short_rate') is not None:
            score += 0.05

        return min(score, 1.0)

    async def update_database(self, country_code: str) -> Dict:
        """
        Fetch and update database for a country

        Returns status dict
        """
        try:
            # Fetch aggregated data
            result = await self.fetch_country_data(country_code)

            if not result['sources']:
                return {
                    'success': False,
                    'country_code': country_code,
                    'error': 'No data found from any source'
                }

            merged = result['merged']

            # Get existing regulation or create new one
            regulation = self.db.query(Regulation).filter(
                Regulation.country_code == country_code
            ).first()

            is_new_country = False
            if not regulation:
                # Auto-create new country if scraper found data
                logger.info(f"🆕 Creating new country entry for {country_code}")

                # Get country name from sources
                country_name = country_code  # Fallback
                if 'tax_foundation' in result['sources']:
                    country_name = result['sources']['tax_foundation'].get('country_name', country_code)
                elif 'kpmg' in result['sources']:
                    country_name = result['sources']['kpmg'].get('country_name', country_code)
                elif 'pwc' in result['sources']:
                    country_name = result['sources']['pwc'].get('country_name', country_code)
                elif 'koinly' in result['sources']:
                    country_name = result['sources']['koinly'].get('country_name', country_code)

                # Create with minimal data (will be updated below)
                regulation = Regulation(
                    country_code=country_code,
                    country_name=country_name,
                    cgt_short_rate=merged['cgt_rate'] or 0.0,
                    cgt_long_rate=merged['cgt_rate'] or 0.0,
                    residency_rule="Standard residency rules apply (verify with local authority)",
                    defi_reporting="Unknown - please verify with local tax authority",
                    penalties_max="Unknown - please verify with local tax authority"
                )
                self.db.add(regulation)
                self.db.flush()  # Get ID without committing
                is_new_country = True

            # Update if we have CGT data
            if merged.get('cgt_rate') is not None:
                old_rate = float(regulation.cgt_short_rate)
                new_rate = merged['cgt_rate']

                cgt_changed = abs(old_rate - new_rate) > 0.001  # 0.1% threshold
                crypto_needs_update = False

                # Check if crypto fields need updating (empty or different)
                if merged.get('crypto_short_rate') is not None:
                    if regulation.crypto_short_rate is None or abs(float(regulation.crypto_short_rate or 0) - merged['crypto_short_rate']) > 0.001:
                        crypto_needs_update = True

                if merged.get('crypto_long_rate') is not None:
                    if regulation.crypto_long_rate is None or abs(float(regulation.crypto_long_rate or 0) - merged['crypto_long_rate']) > 0.001:
                        crypto_needs_update = True

                if merged.get('crypto_notes') and regulation.crypto_notes != merged['crypto_notes']:
                    crypto_needs_update = True

                # Update if CGT changed OR crypto fields need updating
                if cgt_changed or crypto_needs_update:
                    # CRITICAL: Create historical snapshot BEFORE updating
                    try:
                        await RegulationHistoryService.snapshot_current_to_history(
                            country_code=country_code,
                            db=self.db,
                            change_notes=f"Auto-snapshot before update from {', '.join(merged['sources_used'])}"
                        )
                        logger.info(f"📸 Created historical snapshot for {country_code}")
                    except Exception as e:
                        logger.error(f"Failed to create snapshot for {country_code}: {e}")
                        # Continue with update even if snapshot fails

                    # Update CGT if changed
                    if cgt_changed:
                        regulation.cgt_short_rate = new_rate
                        regulation.cgt_long_rate = new_rate  # Assume same for now

                    regulation.updated_at = datetime.utcnow()

                    # Update crypto-specific rates if available
                    if merged.get('crypto_short_rate') is not None:
                        regulation.crypto_short_rate = merged['crypto_short_rate']

                    if merged.get('crypto_long_rate') is not None:
                        regulation.crypto_long_rate = merged['crypto_long_rate']

                    if merged.get('crypto_notes'):
                        regulation.crypto_notes = merged['crypto_notes'][:500]

                    # Update notes
                    sources_str = ', '.join(merged['sources_used'])
                    new_note = f"Updated from {sources_str} on {datetime.utcnow().date()}"

                    if merged['notes']:
                        new_note += ". " + ". ".join(merged['notes'])

                    regulation.notes = new_note[:500]  # Limit length

                    # Store sources and quality in dedicated fields
                    regulation.data_sources = merged['sources_used']
                    regulation.data_quality = merged['data_quality']

                    self.db.commit()

                    # Create notification if CGT changed
                    if cgt_changed:
                        self.notifier.notify_tax_data_updated(
                            country_code=country_code,
                            old_rate=old_rate,
                            new_rate=new_rate,
                            sources=merged['sources_used']
                        )

                    return {
                        'success': True,
                        'country_code': country_code,
                        'action': 'created' if is_new_country else ('updated' if cgt_changed else 'crypto_updated'),
                        'old_rate': old_rate,
                        'new_rate': new_rate,
                        'crypto_updated': crypto_needs_update,
                        'confidence': result['confidence'],
                        'sources': merged['sources_used'],
                        'is_new': is_new_country
                    }
                else:
                    return {
                        'success': True,
                        'country_code': country_code,
                        'action': 'no_change',
                        'rate': old_rate,
                        'confidence': result['confidence']
                    }

            return {
                'success': False,
                'country_code': country_code,
                'error': 'No CGT rate found in aggregated data'
            }

        except Exception as e:
            logger.error(f"Error updating database for {country_code}: {e}")
            return {
                'success': False,
                'country_code': country_code,
                'error': str(e)
            }

    async def sync_all_countries(self) -> List[Dict]:
        """
        Sync all countries in database

        Returns list of update results
        """
        regulations = self.db.query(Regulation).all()
        results = []

        logger.info(f"Starting sync for {len(regulations)} countries")

        for reg in regulations:
            result = await self.update_database(reg.country_code)
            results.append(result)

            if result['success'] and result.get('action') == 'updated':
                logger.info(f"✓ Updated {reg.country_code}: {result.get('old_rate')} -> {result.get('new_rate')}")

        return results

    async def test_all_sources(self) -> Dict:
        """Test connectivity to all sources"""
        return {
            'world_bank': await self.wb_client.test_connection(),
            'tax_foundation': await self.tf_scraper.test_connection(),
            'oecd': await self.oecd_client.test_connection(),
            'kpmg': await self.kpmg_scraper.test_connection(),
            'koinly': await self.koinly_scraper.test_connection(),
            'pwc': await self.pwc_scraper.test_connection(),
            'timestamp': datetime.utcnow().isoformat()
        }
