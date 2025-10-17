"""
CSV Report Generator

Generate transaction exports in CSV format.
"""

from typing import Dict, Optional
import csv
import io
import logging
from .base_report import BaseReportGenerator

logger = logging.getLogger(__name__)


class CSVReportGenerator(BaseReportGenerator):
    """
    CSV Report Generator

    Generates CSV exports of all transactions.
    """

    async def generate(self, db, data: Optional[Dict] = None) -> bytes:
        """Generate CSV report"""
        if data is None:
            data = await self.fetch_report_data(db)

        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow([
            "Asset",
            "Acquisition Date",
            "Disposal Date",
            "Holding Period (Days)",
            "Amount",
            "Cost Basis (USD)",
            "Proceeds (USD)",
            "Gain/Loss (USD)",
            "Type",
            "Wash Sale Loss Disallowed (USD)"
        ])

        # Write all transactions
        all_transactions = data['short_term'] + data['long_term']
        all_transactions.sort(key=lambda x: x['disposal_date'])

        for tx in all_transactions:
            writer.writerow([
                tx['token'],
                self.format_date(tx['acquisition_date']),
                self.format_date(tx['disposal_date']),
                tx['holding_period_days'],
                tx['amount'],
                f"{tx['cost_basis']:.2f}",
                f"{tx['proceeds']:.2f}",
                f"{tx['gain_loss']:.2f}",
                "Long-Term" if tx['is_long_term'] else "Short-Term",
                f"{tx['wash_sale_loss_disallowed']:.2f}"
            ])

        # Get CSV content as bytes
        csv_content = output.getvalue().encode('utf-8')
        output.close()

        return csv_content
