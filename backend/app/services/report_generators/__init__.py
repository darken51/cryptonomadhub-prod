"""
Report Generators Package

Generate professional tax reports in multiple formats.

Supported Formats:
- PDF - Comprehensive tax report with charts
- CSV - Transaction export
- Excel - Multi-sheet workbook with formulas
- TurboTax - TXF import format
- Custom - JSON format for developers

Features:
- IRS Form 8949 generation
- Schedule D summary
- Gain/loss breakdowns
- Multi-jurisdiction support
"""

from .base_report import BaseReportGenerator
from .pdf_report import PDFReportGenerator
from .csv_report import CSVReportGenerator
from .excel_report import ExcelReportGenerator
from .turbotax_report import TurboTaxReportGenerator
from .factory import ReportGeneratorFactory

__all__ = [
    "BaseReportGenerator",
    "PDFReportGenerator",
    "CSVReportGenerator",
    "ExcelReportGenerator",
    "TurboTaxReportGenerator",
    "ReportGeneratorFactory",
]
