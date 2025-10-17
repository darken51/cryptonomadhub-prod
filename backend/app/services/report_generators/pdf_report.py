"""
PDF Report Generator

Generate comprehensive tax reports in PDF format using ReportLab.
"""

from typing import Dict
from datetime import datetime
import io
import logging
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from .base_report import BaseReportGenerator

logger = logging.getLogger(__name__)


class PDFReportGenerator(BaseReportGenerator):
    """
    PDF Tax Report Generator

    Generates comprehensive PDF tax reports with:
    - Summary page
    - Form 8949 (US) or equivalent
    - Schedule D summary
    - Transaction details
    - Charts and visualizations
    """

    async def generate(self, db, data: Optional[Dict] = None) -> bytes:
        """Generate PDF report"""
        if data is None:
            data = await self.fetch_report_data(db)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        )

        # Title Page
        story.append(Spacer(1, 2*inch))
        story.append(Paragraph(f"Cryptocurrency Tax Report", title_style))
        story.append(Paragraph(f"Tax Year {self.tax_year}", styles['Heading2']))
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph(f"Generated: {self.format_date(self.report_date)}", styles['Normal']))
        story.append(Paragraph(f"Jurisdiction: {self.jurisdiction}", styles['Normal']))
        story.append(PageBreak())

        # Summary Page
        story.extend(self._create_summary_section(data, styles))
        story.append(PageBreak())

        # Short-Term Transactions
        if data['short_term']:
            story.extend(self._create_transactions_section(
                "Short-Term Capital Gains and Losses",
                data['short_term'],
                styles
            ))
            story.append(PageBreak())

        # Long-Term Transactions
        if data['long_term']:
            story.extend(self._create_transactions_section(
                "Long-Term Capital Gains and Losses",
                data['long_term'],
                styles
            ))
            story.append(PageBreak())

        # Wash Sales
        if data['wash_sales']:
            story.extend(self._create_wash_sales_section(data['wash_sales'], styles))

        # Build PDF
        doc.build(story)
        pdf_content = buffer.getvalue()
        buffer.close()

        return pdf_content

    def _create_summary_section(self, data: Dict, styles) -> list:
        """Create summary section"""
        story = []
        summary = data['summary']

        story.append(Paragraph("Executive Summary", styles['Heading1']))
        story.append(Spacer(1, 0.3*inch))

        # Summary table
        summary_data = [
            ["Metric", "Amount"],
            ["Total Transactions", str(summary['total_disposals'])],
            ["Short-Term Transactions", str(summary['short_term_transactions'])],
            ["Long-Term Transactions", str(summary['long_term_transactions'])],
            ["", ""],
            ["Short-Term Gains", self.format_currency(summary['short_term_gain'])],
            ["Short-Term Losses", f"({self.format_currency(summary['short_term_loss'])})"],
            ["Short-Term Net", self.format_currency(summary['short_term_net'])],
            ["", ""],
            ["Long-Term Gains", self.format_currency(summary['long_term_gain'])],
            ["Long-Term Losses", f"({self.format_currency(summary['long_term_loss'])})"],
            ["Long-Term Net", self.format_currency(summary['long_term_net'])],
            ["", ""],
            ["Net Capital Gain/Loss", self.format_currency(summary['net_gain_loss'])],
        ]

        table = Table(summary_data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 14),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f3f4f6')),
        ]))

        story.append(table)
        story.append(Spacer(1, 0.5*inch))

        # Tax liability estimate
        estimated_tax = summary['net_gain_loss'] * 0.20  # Simplified
        if estimated_tax > 0:
            story.append(Paragraph(
                f"<b>Estimated Tax Liability:</b> {self.format_currency(estimated_tax)} (20% rate)",
                styles['Normal']
            ))

        return story

    def _create_transactions_section(self, title: str, transactions: list, styles) -> list:
        """Create transaction details section"""
        story = []

        story.append(Paragraph(title, styles['Heading1']))
        story.append(Spacer(1, 0.2*inch))

        if not transactions:
            story.append(Paragraph("No transactions in this category", styles['Normal']))
            return story

        # Transaction table headers
        headers = ["Asset", "Acquired", "Disposed", "Proceeds", "Cost Basis", "Gain/Loss"]
        data = [headers]

        for tx in transactions[:100]:  # Limit to 100 per page
            data.append([
                tx['token'],
                self.format_date(tx['acquisition_date']),
                self.format_date(tx['disposal_date']),
                self.format_currency(tx['proceeds']),
                self.format_currency(tx['cost_basis']),
                self.format_currency(tx['gain_loss'])
            ])

        # Create table
        col_widths = [0.8*inch, 1*inch, 1*inch, 1*inch, 1*inch, 1*inch]
        table = Table(data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))

        story.append(table)

        if len(transactions) > 100:
            story.append(Spacer(1, 0.2*inch))
            story.append(Paragraph(
                f"<i>Showing first 100 of {len(transactions)} transactions</i>",
                styles['Normal']
            ))

        return story

    def _create_wash_sales_section(self, wash_sales: list, styles) -> list:
        """Create wash sales section"""
        story = []

        story.append(Paragraph("Wash Sale Violations", styles['Heading1']))
        story.append(Spacer(1, 0.2*inch))

        if not wash_sales:
            story.append(Paragraph("No wash sale violations detected", styles['Normal']))
            return story

        # Wash sales table
        headers = ["Asset", "Sale Date", "Loss", "Repurchase Date", "Status"]
        data = [headers]

        for ws in wash_sales:
            data.append([
                ws['token'],
                self.format_date(ws['sale_date']),
                self.format_currency(ws['loss_amount']),
                self.format_date(ws['repurchase_date']),
                "Disallowed"
            ])

        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc2626')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))

        story.append(table)

        return story
