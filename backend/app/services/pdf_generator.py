"""
PDF Report Generator

Generates professional tax simulation reports in PDF format
Uses WeasyPrint for HTML to PDF conversion
"""

from datetime import datetime
from typing import Dict, Optional
from decimal import Decimal
import os


class PDFGenerator:
    """Generate PDF reports from simulation data"""

    @staticmethod
    def generate_simulation_report(
        simulation_data: Dict,
        user_info: Optional[Dict] = None
    ) -> str:
        """
        Generate HTML report for simulation

        Args:
            simulation_data: Simulation result with regulation snapshots
            user_info: Optional user information

        Returns:
            HTML string ready for PDF conversion
        """

        # Extract data
        current_country = simulation_data.get('current_country', 'N/A')
        target_country = simulation_data.get('target_country', 'N/A')
        result = simulation_data.get('result', {})
        reg_snapshot = simulation_data.get('regulation_snapshot', {})
        calculated_at = simulation_data.get('calculated_at', datetime.utcnow())

        current_tax = result.get('current_tax', 0)
        target_tax = result.get('target_tax', 0)
        savings = result.get('savings', 0)
        savings_percent = result.get('savings_percent', 0)
        considerations = result.get('considerations', [])
        risks = result.get('risks', [])

        # Get regulation details
        current_reg = reg_snapshot.get('current', {})
        target_reg = reg_snapshot.get('target', {})

        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tax Simulation Report - CryptoNomadHub</title>
    <style>
        @page {{
            size: A4;
            margin: 2cm;
            @bottom-right {{
                content: "Page " counter(page) " of " counter(pages);
                font-size: 9pt;
                color: #666;
            }}
        }}

        body {{
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            font-size: 11pt;
        }}

        .header {{
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }}

        .logo {{
            font-size: 24pt;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }}

        .subtitle {{
            font-size: 12pt;
            color: #666;
        }}

        h1 {{
            font-size: 20pt;
            color: #1e293b;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }}

        h2 {{
            font-size: 14pt;
            color: #334155;
            margin-top: 20px;
            margin-bottom: 10px;
        }}

        .summary-box {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }}

        .summary-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }}

        .summary-item {{
            padding: 15px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
        }}

        .summary-label {{
            font-size: 9pt;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }}

        .summary-value {{
            font-size: 18pt;
            font-weight: bold;
            color: #1e293b;
        }}

        .savings-positive {{
            color: #16a34a;
        }}

        .savings-negative {{
            color: #dc2626;
        }}

        .tax-comparison {{
            margin: 20px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 8px;
        }}

        .country-details {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }}

        .country-card {{
            padding: 20px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }}

        .country-name {{
            font-size: 14pt;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 15px;
        }}

        .rate-item {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }}

        .rate-label {{
            color: #64748b;
        }}

        .rate-value {{
            font-weight: 600;
            color: #1e293b;
        }}

        .section {{
            margin: 30px 0;
            page-break-inside: avoid;
        }}

        .list-item {{
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }}

        .list-item:before {{
            content: "•";
            position: absolute;
            left: 0;
            color: #2563eb;
            font-weight: bold;
            font-size: 14pt;
        }}

        .warning-box {{
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}

        .warning-title {{
            font-weight: bold;
            color: #92400e;
            margin-bottom: 5px;
        }}

        .disclaimer {{
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin-top: 40px;
            font-size: 9pt;
            line-height: 1.8;
        }}

        .disclaimer-title {{
            font-weight: bold;
            color: #991b1b;
            font-size: 11pt;
            margin-bottom: 10px;
        }}

        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 9pt;
            color: #666;
        }}

        .metadata {{
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            font-size: 9pt;
            color: #64748b;
            margin-bottom: 20px;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}

        th {{
            background: #f1f5f9;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #cbd5e1;
        }}

        td {{
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
        }}
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🌍 CryptoNomadHub</div>
        <div class="subtitle">Crypto Tax Residency Simulation Report</div>
    </div>

    <div class="metadata">
        <strong>Report Generated:</strong> {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')}<br>
        <strong>Calculation Date:</strong> {calculated_at if isinstance(calculated_at, str) else calculated_at.strftime('%B %d, %Y')}<br>
        {f'<strong>User:</strong> {user_info.get("email", "N/A")}<br>' if user_info else ''}
        <strong>Report ID:</strong> {simulation_data.get('id', 'N/A')}
    </div>

    <h1>Executive Summary</h1>

    <div class="summary-box">
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Current Country</div>
                <div class="summary-value">{current_reg.get('country_name', current_country)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Target Country</div>
                <div class="summary-value">{target_reg.get('country_name', target_country)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Current Tax Liability</div>
                <div class="summary-value">${current_tax:,.2f}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Target Tax Liability</div>
                <div class="summary-value">${target_tax:,.2f}</div>
            </div>
        </div>
    </div>

    <div class="tax-comparison">
        <h2 style="margin-top: 0;">Tax Savings Analysis</h2>
        <div class="summary-value {'savings-positive' if savings > 0 else 'savings-negative'}">
            ${abs(savings):,.2f} ({abs(savings_percent):.1f}%)
        </div>
        <p style="margin-top: 10px; color: #475569;">
            {'You would save' if savings > 0 else 'You would pay'}
            <strong>${abs(savings):,.2f}</strong> per year by
            {'moving' if savings > 0 else 'staying in your current country instead of moving'}
            to {target_reg.get('country_name', target_country)}.
        </p>
    </div>

    <h1>Tax Rate Comparison</h1>

    <div class="country-details">
        <div class="country-card">
            <div class="country-name">📍 {current_reg.get('country_name', current_country)}</div>
            <div class="rate-item">
                <span class="rate-label">Short-term CGT (&lt;1 year)</span>
                <span class="rate-value">{(current_reg.get('cgt_short_rate') or 0)*100:.1f}%</span>
            </div>
            <div class="rate-item">
                <span class="rate-label">Long-term CGT (&gt;1 year)</span>
                <span class="rate-value">{(current_reg.get('cgt_long_rate') or 0)*100:.1f}%</span>
            </div>
            {f'''
            <div class="rate-item">
                <span class="rate-label">Crypto Short-term</span>
                <span class="rate-value">{(current_reg.get('crypto_short_rate') or 0)*100:.1f}%</span>
            </div>
            <div class="rate-item">
                <span class="rate-label">Crypto Long-term</span>
                <span class="rate-value">{(current_reg.get('crypto_long_rate') or 0)*100:.1f}%</span>
            </div>
            ''' if current_reg.get('crypto_short_rate') else ''}
        </div>

        <div class="country-card">
            <div class="country-name">🎯 {target_reg.get('country_name', target_country)}</div>
            <div class="rate-item">
                <span class="rate-label">Short-term CGT (&lt;1 year)</span>
                <span class="rate-value">{(target_reg.get('cgt_short_rate') or 0)*100:.1f}%</span>
            </div>
            <div class="rate-item">
                <span class="rate-label">Long-term CGT (&gt;1 year)</span>
                <span class="rate-value">{(target_reg.get('cgt_long_rate') or 0)*100:.1f}%</span>
            </div>
            {f'''
            <div class="rate-item">
                <span class="rate-label">Crypto Short-term</span>
                <span class="rate-value">{(target_reg.get('crypto_short_rate') or 0)*100:.1f}%</span>
            </div>
            <div class="rate-item">
                <span class="rate-label">Crypto Long-term</span>
                <span class="rate-value">{(target_reg.get('crypto_long_rate') or 0)*100:.1f}%</span>
            </div>
            ''' if target_reg.get('crypto_short_rate') else ''}
        </div>
    </div>

    {f'''
    <h1>Key Considerations</h1>
    <div class="section">
        {''.join(f'<div class="list-item">{item}</div>' for item in considerations)}
    </div>
    ''' if considerations else ''}

    {f'''
    <h1>⚠️ Potential Risks</h1>
    <div class="section">
        {''.join(f'<div class="list-item">{risk}</div>' for risk in risks)}
    </div>
    ''' if risks else ''}

    <div class="warning-box">
        <div class="warning-title">⏱️ Implementation Timeline</div>
        <p>{result.get('timeline', 'Review specific residency requirements for detailed timeline.')}</p>
    </div>

    <div class="disclaimer">
        <div class="disclaimer-title">⚠️ Important Legal Disclaimer</div>
        <p>
            This report is generated automatically based on publicly available tax regulations and is provided
            for informational and educational purposes only. It does NOT constitute financial, tax, or legal advice.
        </p>
        <p>
            Tax laws are complex and change frequently. Individual circumstances vary significantly.
            You MUST consult with qualified tax professionals and legal advisors in both your current
            and target jurisdictions before making any decisions.
        </p>
        <p>
            <strong>CryptoNomadHub and its affiliates:</strong>
        </p>
        <ul style="margin-top: 10px; padding-left: 20px;">
            <li>Are NOT tax advisors, CPAs, or legal counsel</li>
            <li>Do NOT guarantee accuracy or completeness of information</li>
            <li>Are NOT liable for any decisions made based on this report</li>
            <li>Recommend consulting licensed professionals before taking action</li>
        </ul>
        <p style="margin-top: 10px;">
            <strong>Data Sources:</strong> {', '.join(current_reg.get('data_sources', [])) if current_reg.get('data_sources') else 'Multiple verified sources'}<br>
            <strong>Last Updated:</strong> {current_reg.get('updated_at', 'N/A')}
        </p>
    </div>

    <div class="footer">
        <p>Generated by CryptoNomadHub Tax Simulation Platform</p>
        <p>https://cryptonomadhub.com</p>
        <p>For questions or support, contact: support@cryptonomadhub.com</p>
    </div>
</body>
</html>
"""
        return html

    @staticmethod
    async def html_to_pdf(html_content: str, output_path: Optional[str] = None) -> bytes:
        """
        Convert HTML to PDF using WeasyPrint

        Args:
            html_content: HTML string
            output_path: Optional path to save PDF file

        Returns:
            PDF as bytes
        """
        try:
            from weasyprint import HTML, CSS
            from io import BytesIO

            # Create PDF
            pdf_file = BytesIO()
            HTML(string=html_content).write_pdf(pdf_file)
            pdf_bytes = pdf_file.getvalue()

            # Save to file if path provided
            if output_path:
                with open(output_path, 'wb') as f:
                    f.write(pdf_bytes)

            return pdf_bytes

        except ImportError:
            raise Exception(
                "WeasyPrint not installed. Run: pip install weasyprint"
            )
