"""
Regenerate AI analyses for ALL 167 countries with new 2025 crypto data
Forces refresh to use updated crypto_notes from verification project
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.regulation import Regulation
from app.services.country_analysis_ai import CountryAnalysisAI
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def regenerate_all_analyses():
    """Regenerate AI analyses for ALL 167 countries"""
    db = SessionLocal()

    try:
        # Get ALL countries (regardless of data_quality)
        countries = db.query(Regulation).all()

        country_codes = [c.country_code for c in countries]
        logger.info(f"🔄 Regenerating AI analyses for ALL {len(country_codes)} countries")
        logger.info(f"Using updated 2025 crypto data with 100% coverage\n")

        # Analyze in batches of 5 (smaller batches to avoid rate limiting)
        ai_service = CountryAnalysisAI()
        batch_size = 5
        total_batches = (len(country_codes) + batch_size - 1) // batch_size

        success_count = 0
        error_count = 0
        errors = []

        for i in range(0, len(country_codes), batch_size):
            batch = country_codes[i:i+batch_size]
            batch_num = (i // batch_size) + 1

            logger.info(f"\n{'='*70}")
            logger.info(f"📦 Batch {batch_num}/{total_batches}: {', '.join(batch)}")
            logger.info(f"{'='*70}")

            for code in batch:
                try:
                    logger.info(f"\n🤖 Analyzing {code} with Claude AI...")
                    # Force refresh to regenerate with new data
                    result = await ai_service.analyze_country(db, code, force_refresh=True)
                    logger.info(f"✅ {code}: Crypto={result['crypto_score']}/100, Nomad={result['nomad_score']}/100, Overall={result['overall_score']}/100")
                    success_count += 1
                except Exception as e:
                    logger.error(f"❌ Failed {code}: {e}")
                    error_count += 1
                    errors.append(f"{code}: {str(e)}")
                    continue

            logger.info(f"\n✅ Batch {batch_num}/{total_batches} complete")
            logger.info(f"📊 Progress: {success_count} success, {error_count} errors")

            # Wait between batches to avoid rate limiting
            if i + batch_size < len(country_codes):
                logger.info("⏳ Waiting 3 seconds before next batch...")
                await asyncio.sleep(3)

        logger.info(f"\n{'='*70}")
        logger.info(f"🎉 REGENERATION COMPLETE!")
        logger.info(f"{'='*70}")
        logger.info(f"✅ Successfully analyzed: {success_count}/{len(country_codes)} countries")
        logger.info(f"❌ Errors: {error_count}/{len(country_codes)} countries")

        if errors:
            logger.info(f"\n⚠️ Failed countries:")
            for error in errors:
                logger.info(f"  - {error}")

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(regenerate_all_analyses())
