"""
Tax data synchronization Celery tasks
"""

from celery import shared_task
from app.database import SessionLocal
from app.services.tax_data_sources import TaxDataAggregator
from app.services.tax_data_monitor import TaxDataMonitor
from app.models.regulation import Regulation
import logging
import asyncio
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


@shared_task(name='app.tasks.tax_sync_tasks.sync_all_tax_data_task')
def sync_all_tax_data_task():
    """
    Sync tax data for all countries
    Runs weekly on Sunday at 3 AM UTC
    """
    logger.info("Starting weekly tax data sync task")

    db = SessionLocal()
    try:
        # Run async sync
        aggregator = TaxDataAggregator(db)
        results = asyncio.run(aggregator.sync_all_countries())
        asyncio.run(aggregator.close())

        # Log results
        updated = len([r for r in results if r.get('action') == 'updated'])
        no_change = len([r for r in results if r.get('action') == 'no_change'])
        failed = len([r for r in results if not r.get('success')])

        logger.info(f"Weekly sync completed: {updated} updated, {no_change} unchanged, {failed} failed")

        return {
            'status': 'completed',
            'total': len(results),
            'updated': updated,
            'no_change': no_change,
            'failed': failed,
            'timestamp': datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Weekly tax sync failed: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }
    finally:
        db.close()


@shared_task(name='app.tasks.tax_sync_tasks.sync_countries_task')
def sync_countries_task(country_codes: list):
    """
    Sync specific countries
    Can be triggered manually via API
    """
    logger.info(f"Starting manual sync for {len(country_codes)} countries")

    db = SessionLocal()
    try:
        aggregator = TaxDataAggregator(db)
        results = []

        for country_code in country_codes:
            result = asyncio.run(aggregator.update_database(country_code))
            results.append(result)

        asyncio.run(aggregator.close())

        updated = len([r for r in results if r.get('action') == 'updated'])
        failed = len([r for r in results if not r.get('success')])

        logger.info(f"Manual sync completed: {updated} updated, {failed} failed")

        return {
            'status': 'completed',
            'countries': country_codes,
            'updated': updated,
            'failed': failed,
            'results': results,
            'timestamp': datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Manual sync failed: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }
    finally:
        db.close()


@shared_task(name='app.tasks.tax_sync_tasks.check_urgent_updates_task')
def check_urgent_updates_task():
    """
    Check for urgent updates (countries >365 days old)
    Runs daily at 6 AM UTC
    """
    logger.info("Starting daily urgent updates check")

    db = SessionLocal()
    try:
        monitor = TaxDataMonitor(db)
        freshness = monitor.check_data_freshness()

        urgent_countries = freshness.get('urgent_review', [])

        if urgent_countries:
            logger.warning(f"Found {len(urgent_countries)} countries needing urgent review")

            # Auto-sync urgent countries
            aggregator = TaxDataAggregator(db)
            results = []

            for country in urgent_countries:
                country_code = country['country_code']
                result = asyncio.run(aggregator.update_database(country_code))
                results.append(result)

                if result.get('action') == 'updated':
                    logger.info(f"Auto-updated urgent country {country_code}")

            asyncio.run(aggregator.close())

            return {
                'status': 'completed',
                'urgent_found': len(urgent_countries),
                'auto_synced': len(results),
                'results': results,
                'timestamp': datetime.utcnow().isoformat()
            }
        else:
            logger.info("No urgent updates needed")
            return {
                'status': 'completed',
                'urgent_found': 0,
                'message': 'All countries up to date',
                'timestamp': datetime.utcnow().isoformat()
            }

    except Exception as e:
        logger.error(f"Urgent check failed: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }
    finally:
        db.close()


@shared_task(name='app.tasks.tax_sync_tasks.test_sources_task')
def test_sources_task():
    """
    Test connectivity to all tax data sources
    Can be run manually for diagnostics
    """
    logger.info("Testing tax data sources connectivity")

    db = SessionLocal()
    try:
        aggregator = TaxDataAggregator(db)
        results = asyncio.run(aggregator.test_all_sources())
        asyncio.run(aggregator.close())

        all_working = all([v for k, v in results.items() if k != 'timestamp'])

        logger.info(f"Source test completed: {'All OK' if all_working else 'Some failures'}")

        return {
            'status': 'completed',
            'all_working': all_working,
            'sources': results,
            'timestamp': datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Source test failed: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }
    finally:
        db.close()
