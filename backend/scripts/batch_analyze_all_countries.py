"""
Batch analyze all countries with reliable data
Runs in batches to avoid overwhelming the API
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

async def batch_analyze_countries():
    """Analyze all countries with reliable data"""
    db = SessionLocal()

    try:
        # Get all countries with reliable data (data_quality = high or medium)
        countries = db.query(Regulation).filter(
            Regulation.data_quality.in_(['high', 'medium'])
        ).all()

        country_codes = [c.country_code for c in countries]
        logger.info(f"Found {len(country_codes)} countries to analyze")

        # Analyze in batches of 10
        ai_service = CountryAnalysisAI()
        batch_size = 10
        total_batches = (len(country_codes) + batch_size - 1) // batch_size

        for i in range(0, len(country_codes), batch_size):
            batch = country_codes[i:i+batch_size]
            batch_num = (i // batch_size) + 1

            logger.info(f"\n{'='*60}")
            logger.info(f"Processing batch {batch_num}/{total_batches}: {', '.join(batch)}")
            logger.info(f"{'='*60}")

            for code in batch:
                try:
                    logger.info(f"\n🔄 Analyzing {code}...")
                    result = await ai_service.analyze_country(db, code, force_refresh=False)
                    logger.info(f"✅ {code}: Crypto={result['crypto_score']}, Nomad={result['nomad_score']}, Overall={result['overall_score']}")
                except Exception as e:
                    logger.error(f"❌ Failed to analyze {code}: {e}")
                    continue

            logger.info(f"\n✅ Completed batch {batch_num}/{total_batches}")

            # Small delay between batches to avoid rate limiting
            if i + batch_size < len(country_codes):
                logger.info("⏳ Waiting 2 seconds before next batch...")
                await asyncio.sleep(2)

        logger.info(f"\n🎉 Analysis complete! Processed {len(country_codes)} countries")

    except Exception as e:
        logger.error(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(batch_analyze_countries())
