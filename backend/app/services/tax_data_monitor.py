"""
Tax Data Monitoring Service

Monitors tax regulation changes and alerts admins when updates are needed.
"""

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.regulation import Regulation
from typing import List, Dict


class TaxDataMonitor:
    """Monitor and validate tax data freshness"""

    # Major tax changes typically happen quarterly or annually
    STALE_WARNING_DAYS = 90  # 3 months
    CRITICAL_WARNING_DAYS = 365  # 1 year

    def __init__(self, db: Session):
        self.db = db

    def check_data_freshness(self) -> Dict:
        """
        Check which countries need data review

        Returns:
            {
                'stale': [countries needing update],
                'critical': [countries needing urgent update],
                'last_check': datetime,
                'stats': {...}
            }
        """
        stale_countries = []
        critical_countries = []

        all_regs = self.db.query(Regulation).all()

        for reg in all_regs:
            if not reg.updated_at:
                critical_countries.append({
                    'country': reg.country_name,
                    'code': reg.country_code,
                    'reason': 'Never updated',
                    'last_update': None
                })
                continue

            days_old = (datetime.now(timezone.utc) - reg.updated_at).days

            if days_old > self.CRITICAL_WARNING_DAYS:
                critical_countries.append({
                    'country': reg.country_name,
                    'code': reg.country_code,
                    'days_old': days_old,
                    'last_update': reg.updated_at.isoformat()
                })
            elif days_old > self.STALE_WARNING_DAYS:
                stale_countries.append({
                    'country': reg.country_name,
                    'code': reg.country_code,
                    'days_old': days_old,
                    'last_update': reg.updated_at.isoformat()
                })

        return {
            'stale': stale_countries,
            'critical': critical_countries,
            'last_check': datetime.now(timezone.utc).isoformat(),
            'stats': {
                'total_countries': len(all_regs),
                'stale_count': len(stale_countries),
                'critical_count': len(critical_countries),
                'up_to_date': len(all_regs) - len(stale_countries) - len(critical_countries)
            }
        }

    def get_update_checklist(self) -> List[Dict]:
        """
        Generate checklist of countries to verify with official sources

        Returns list of countries with their official tax authority URLs
        """
        countries = self.db.query(Regulation).all()

        checklist = []
        for reg in countries:
            days_old = (datetime.now(timezone.utc) - reg.updated_at).days if reg.updated_at else 999

            checklist.append({
                'country': reg.country_name,
                'code': reg.country_code,
                'priority': 'HIGH' if days_old > self.CRITICAL_WARNING_DAYS else
                           'MEDIUM' if days_old > self.STALE_WARNING_DAYS else 'LOW',
                'days_old': days_old,
                'source_url': reg.source_url,
                'current_rates': {
                    'cgt_short': float(reg.cgt_short_rate),
                    'cgt_long': float(reg.cgt_long_rate)
                },
                'notes': reg.notes
            })

        # Sort by priority
        priority_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
        checklist.sort(key=lambda x: (priority_order[x['priority']], -x['days_old']))

        return checklist

    def get_tax_calendar_alerts(self) -> List[Dict]:
        """
        Get alerts for known tax calendar events
        (e.g., US tax changes typically Jan 1, UK April 6, etc.)
        """
        today = datetime.now(timezone.utc)
        alerts = []

        # Common tax year start dates
        tax_calendars = {
            'US': {'month': 1, 'day': 1, 'name': 'US Tax Year Start'},
            'GB': {'month': 4, 'day': 6, 'name': 'UK Tax Year Start'},
            'AU': {'month': 7, 'day': 1, 'name': 'AU Tax Year Start'},
            'CA': {'month': 1, 'day': 1, 'name': 'CA Tax Year Start'},
            'FR': {'month': 1, 'day': 1, 'name': 'FR Tax Year Start'},
        }

        for country_code, calendar in tax_calendars.items():
            tax_date = datetime(today.year, calendar['month'], calendar['day'], tzinfo=timezone.utc)

            # Check if within 30 days before or after
            days_diff = (tax_date - today).days

            if -30 <= days_diff <= 30:
                alerts.append({
                    'country_code': country_code,
                    'event': calendar['name'],
                    'date': tax_date.isoformat(),
                    'days_until': days_diff,
                    'action': 'Verify tax rates have been updated' if days_diff <= 0 else
                             'Prepare for upcoming tax year changes'
                })

        return alerts

    def generate_update_report(self) -> str:
        """
        Generate human-readable report for admin review
        """
        freshness = self.check_data_freshness()
        alerts = self.get_tax_calendar_alerts()

        report = f"""
TAX DATA FRESHNESS REPORT
Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}
{'='*60}

STATISTICS:
- Total Countries: {freshness['stats']['total_countries']}
- Up to Date: {freshness['stats']['up_to_date']}
- Needs Review (>90 days): {freshness['stats']['stale_count']}
- Urgent Review (>365 days): {freshness['stats']['critical_count']}

"""

        if freshness['critical']:
            report += "\n🚨 CRITICAL - UPDATE REQUIRED:\n"
            for country in freshness['critical'][:10]:  # Top 10
                report += f"  - {country['country']} ({country['code']}): "
                if 'days_old' in country:
                    report += f"{country['days_old']} days old\n"
                else:
                    report += f"{country['reason']}\n"

        if freshness['stale']:
            report += "\n⚠️  NEEDS REVIEW:\n"
            for country in freshness['stale'][:10]:
                report += f"  - {country['country']} ({country['code']}): {country['days_old']} days old\n"

        if alerts:
            report += "\n📅 TAX CALENDAR ALERTS:\n"
            for alert in alerts:
                report += f"  - {alert['event']}: {alert['action']} (in {alert['days_until']} days)\n"

        report += f"\n{'='*60}\n"

        return report
