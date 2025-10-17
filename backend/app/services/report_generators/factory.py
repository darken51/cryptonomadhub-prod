"""
Report Generator Factory

Factory for creating report generator instances.
"""

from typing import Optional
import logging
from .base_report import BaseReportGenerator
from .pdf_report import PDFReportGenerator
from .csv_report import CSVReportGenerator
from .excel_report import ExcelReportGenerator
from .turbotax_report import TurboTaxReportGenerator

logger = logging.getLogger(__name__)


class ReportGeneratorFactory:
    """
    Report Generator Factory

    Creates the appropriate report generator based on format.
    """

    SUPPORTED_FORMATS = {
        "pdf": PDFReportGenerator,
        "csv": CSVReportGenerator,
        "excel": ExcelReportGenerator,
        "xlsx": ExcelReportGenerator,
        "turbotax": TurboTaxReportGenerator,
        "txf": TurboTaxReportGenerator,
    }

    @staticmethod
    def create(
        format_type: str,
        user_id: int,
        tax_year: int,
        jurisdiction: str = "US"
    ) -> BaseReportGenerator:
        """
        Create report generator

        Args:
            format_type: Report format (pdf, csv, excel, turbotax)
            user_id: User ID
            tax_year: Tax year
            jurisdiction: Tax jurisdiction (US, FR, DE, etc.)

        Returns:
            Report generator instance

        Raises:
            ValueError: If format is not supported

        Example:
            generator = ReportGeneratorFactory.create(
                "pdf",
                user_id=123,
                tax_year=2024,
                jurisdiction="US"
            )
        """
        format_type = format_type.lower().strip()

        if format_type not in ReportGeneratorFactory.SUPPORTED_FORMATS:
            raise ValueError(
                f"Unsupported report format: {format_type}. "
                f"Supported: {', '.join(ReportGeneratorFactory.SUPPORTED_FORMATS.keys())}"
            )

        generator_class = ReportGeneratorFactory.SUPPORTED_FORMATS[format_type]
        return generator_class(user_id, tax_year, jurisdiction)

    @staticmethod
    def get_supported_formats() -> dict:
        """
        Get list of supported report formats with metadata

        Returns:
            Dict mapping format to metadata
        """
        return {
            "pdf": {
                "name": "PDF Report",
                "description": "Comprehensive tax report with charts and summaries",
                "extension": ".pdf",
                "mime_type": "application/pdf",
                "features": ["summary", "form_8949", "schedule_d", "charts"]
            },
            "csv": {
                "name": "CSV Export",
                "description": "Transaction data in CSV format",
                "extension": ".csv",
                "mime_type": "text/csv",
                "features": ["transactions"]
            },
            "excel": {
                "name": "Excel Workbook",
                "description": "Multi-sheet Excel workbook with formulas",
                "extension": ".xlsx",
                "mime_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "features": ["summary", "transactions", "formulas", "formatting"]
            },
            "turbotax": {
                "name": "TurboTax TXF",
                "description": "TXF format for direct import into TurboTax",
                "extension": ".txf",
                "mime_type": "application/x-txf",
                "features": ["turbotax_import"]
            }
        }

    @staticmethod
    def validate_format(format_type: str) -> bool:
        """
        Check if format is supported

        Args:
            format_type: Format type

        Returns:
            True if supported
        """
        return format_type.lower() in ReportGeneratorFactory.SUPPORTED_FORMATS

    @staticmethod
    def get_file_extension(format_type: str) -> str:
        """
        Get file extension for format

        Args:
            format_type: Format type

        Returns:
            File extension (e.g., ".pdf")
        """
        formats = ReportGeneratorFactory.get_supported_formats()
        return formats.get(format_type.lower(), {}).get("extension", ".txt")

    @staticmethod
    def get_mime_type(format_type: str) -> str:
        """
        Get MIME type for format

        Args:
            format_type: Format type

        Returns:
            MIME type (e.g., "application/pdf")
        """
        formats = ReportGeneratorFactory.get_supported_formats()
        return formats.get(format_type.lower(), {}).get("mime_type", "application/octet-stream")
