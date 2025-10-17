"""
TurboTax Report Generator

Generate TXF (Tax Exchange Format) files for TurboTax import.
"""

from typing import Dict, Optional
import logging
from .base_report import BaseReportGenerator

logger = logging.getLogger(__name__)


class TurboTaxReportGenerator(BaseReportGenerator):
    """
    TurboTax TXF Format Generator

    Generates .txf files that can be imported into TurboTax.

    TXF Format Specification:
    - Plain text file with specific line format
    - Supports Form 8949 and Schedule D entries
    """

    async def generate(self, db, data: Optional[Dict] = None) -> bytes:
        """Generate TXF file"""
        if data is None:
            data = await self.fetch_report_data(db)

        lines = []

        # TXF Header
        lines.append("V042")  # TXF version
        lines.append(f"ACryptoNomadHub")  # Source
        lines.append(f"D{self.format_date(self.report_date)}")  # Date

        # Short-term transactions
        for tx in data['short_term']:
            lines.extend(self._format_transaction(tx, is_long_term=False))

        # Long-term transactions
        for tx in data['long_term']:
            lines.extend(self._format_transaction(tx, is_long_term=True))

        # End marker
        lines.append("^")

        txf_content = "\n".join(lines).encode('utf-8')
        return txf_content

    def _format_transaction(self, tx: Dict, is_long_term: bool) -> list:
        """
        Format single transaction for TXF

        Returns list of TXF lines
        """
        lines = []

        # Transaction type code
        if is_long_term:
            lines.append("TD")  # Long-term capital gain/loss
        else:
            lines.append("TS")  # Short-term capital gain/loss

        # Description
        lines.append(f"N{tx['token']}")

        # Date acquired
        lines.append(f"D{self.format_date(tx['acquisition_date'])}")

        # Date sold
        lines.append(f"D{self.format_date(tx['disposal_date'])}")

        # Sales price (proceeds)
        lines.append(f"${tx['proceeds']:.2f}")

        # Cost basis
        lines.append(f"${tx['cost_basis']:.2f}")

        # End of transaction
        lines.append("^")

        return lines
