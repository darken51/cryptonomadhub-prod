"""
DeFi Audit Endpoints

API routes for DeFi transaction auditing
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.defi_protocol import DeFiAudit
from app.routers.auth import get_current_user
from app.services.defi_audit_service import DeFiAuditService
from app.middleware import limiter, get_rate_limit
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/defi", tags=["DeFi Audit"])


class CreateAuditRequest(BaseModel):
    wallet_address: str
    chains: List[str]  # ["ethereum", "polygon", "bsc"]
    start_date: Optional[str] = None  # ISO date string
    end_date: Optional[str] = None  # ISO date string


class AuditResponse(BaseModel):
    id: int
    status: str
    start_date: str
    end_date: str
    chains: List[str]
    total_transactions: int
    total_volume_usd: float
    total_gains_usd: float
    total_losses_usd: float
    total_fees_usd: float
    short_term_gains: float
    long_term_gains: float
    ordinary_income: float
    protocols_used: dict
    created_at: str
    completed_at: Optional[str] = None


@router.post("/audit", response_model=AuditResponse)
# @limiter.limit(get_rate_limit("defi_audit"))  # Temporarily disabled
async def create_defi_audit(

    request: CreateAuditRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create new DeFi audit for wallet address

    ⚠️ BETA FEATURE: This feature is in beta. Results may be incomplete.

    Scans specified blockchains for DeFi activity and generates tax report.

    **Supported chains (50+):**

    **Major Networks:**
    - ethereum, polygon, bsc/bnb, avalanche, fantom
    - **solana** 🔥

    **Layer 2s:**
    - arbitrum, optimism, base, blast, scroll, zksync, linea, mantle, taiko

    **Emerging Chains:**
    - abstract, apechain, berachain, fraxtal, sei, sonic, sophon, unichain, world

    **Others:**
    - cronos, gnosis, celo, moonbeam, moonriver

    **Testnets:**
    - sepolia, holesky, arbitrum-sepolia, optimism-sepolia, base-sepolia, polygon-amoy

    **Supported protocols:**
    - **EVM:** Uniswap V2/V3, Aave V2/V3, Compound V2/V3, SushiSwap, Curve, Convex
    - **Solana:** Jupiter, Raydium, Orca, Marinade (via Helius API)
    """

    # Validate chains (expanded list)
    supported_chains = [
        "ethereum", "sepolia", "holesky",
        "arbitrum", "arbitrum-nova", "arbitrum-sepolia",
        "optimism", "optimism-sepolia",
        "base", "base-sepolia", "blast", "scroll", "zksync", "linea", "mantle", "taiko",
        "polygon", "polygon-amoy", "bsc", "bnb", "avalanche", "avalanche-fuji",
        "fantom", "cronos", "gnosis", "celo", "moonbeam", "moonriver",
        "abstract", "apechain", "berachain", "fraxtal", "sei", "sonic", "sophon",
        "unichain", "world",
        "solana"
    ]
    invalid_chains = [c for c in request.chains if c.lower() not in supported_chains]
    if invalid_chains:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported chains: {invalid_chains}. Supported: {supported_chains}"
        )

    # Parse dates
    start_date = None
    end_date = None
    if request.start_date:
        try:
            start_date = datetime.fromisoformat(request.start_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use ISO format.")

    if request.end_date:
        try:
            end_date = datetime.fromisoformat(request.end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format.")

    # Create audit
    service = DeFiAuditService(db)
    logger.info(f"Creating audit for wallet {request.wallet_address} on chains {request.chains}")
    try:
        audit = await service.create_audit(
            user_id=current_user.id,
            wallet_address=request.wallet_address,
            chains=request.chains,
            start_date=start_date,
            end_date=end_date
        )
        logger.info(f"Audit {audit.id} created with status {audit.status}")
    except Exception as e:
        logger.error(f"Failed to create audit: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create audit: {str(e)}"
        )

    return AuditResponse(
        id=audit.id,
        status=audit.status,
        start_date=audit.start_date.isoformat(),
        end_date=audit.end_date.isoformat(),
        chains=audit.chains,
        total_transactions=audit.total_transactions,
        total_volume_usd=audit.total_volume_usd or 0.0,
        total_gains_usd=audit.total_gains_usd or 0.0,
        total_losses_usd=audit.total_losses_usd or 0.0,
        total_fees_usd=audit.total_fees_usd or 0.0,
        short_term_gains=audit.short_term_gains or 0.0,
        long_term_gains=audit.long_term_gains or 0.0,
        ordinary_income=audit.ordinary_income or 0.0,
        protocols_used=audit.protocols_used or {},
        created_at=audit.created_at.isoformat(),
        completed_at=audit.completed_at.isoformat() if audit.completed_at else None
    )


@router.get("/audits", response_model=List[AuditResponse])
# @limiter.limit(get_rate_limit("read_only"))  # Temporarily disabled
async def list_user_audits(

    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all audits for current user"""

    audits = db.query(DeFiAudit).filter(
        DeFiAudit.user_id == current_user.id
    ).order_by(DeFiAudit.created_at.desc()).all()

    return [
        AuditResponse(
            id=audit.id,
            status=audit.status,
            start_date=audit.start_date.isoformat(),
            end_date=audit.end_date.isoformat(),
            chains=audit.chains,
            total_transactions=audit.total_transactions,
            total_volume_usd=audit.total_volume_usd or 0.0,
            total_gains_usd=audit.total_gains_usd or 0.0,
            total_losses_usd=audit.total_losses_usd or 0.0,
            total_fees_usd=audit.total_fees_usd or 0.0,
            short_term_gains=audit.short_term_gains or 0.0,
            long_term_gains=audit.long_term_gains or 0.0,
            ordinary_income=audit.ordinary_income or 0.0,
            protocols_used=audit.protocols_used or {},
            created_at=audit.created_at.isoformat(),
            completed_at=audit.completed_at.isoformat() if audit.completed_at else None
        )
        for audit in audits
    ]


@router.get("/audit/{audit_id}")
# @limiter.limit(get_rate_limit("read_only"))  # Temporarily disabled
async def get_audit_report(

    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete audit report with all transactions

    Returns detailed breakdown of all DeFi activity, tax implications,
    and optimization recommendations.
    """

    # Verify ownership
    audit = db.query(DeFiAudit).filter(
        DeFiAudit.id == audit_id,
        DeFiAudit.user_id == current_user.id
    ).first()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    # Get full report
    service = DeFiAuditService(db)
    report = await service.get_audit_report(audit_id)

    return report


@router.get("/audit/{audit_id}/export/pdf")
async def export_audit_pdf(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export DeFi audit report as PDF

    Returns a comprehensive PDF report with transaction summary and tax breakdown.
    """
    from fastapi.responses import Response
    from app.services.pdf_generator import PDFGenerator

    # Verify ownership
    audit = db.query(DeFiAudit).filter(
        DeFiAudit.id == audit_id,
        DeFiAudit.user_id == current_user.id
    ).first()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    if audit.status != 'completed':
        raise HTTPException(
            status_code=400,
            detail="Cannot export PDF for incomplete audit"
        )

    try:
        # Generate simple HTML report
        net_gain_loss = audit.total_gains_usd - audit.total_losses_usd
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>DeFi Audit Report #{audit_id}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                h1 {{ color: #2563eb; }}
                .summary {{ background: #f3f4f6; padding: 20px; margin: 20px 0; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th, td {{ border: 1px solid #e5e7eb; padding: 8px; text-align: left; }}
                th {{ background: #f9fafb; font-weight: bold; }}
                .footer {{ margin-top: 40px; padding: 20px; background: #fef3c7; }}
            </style>
        </head>
        <body>
            <h1>DeFi Audit Report #{audit_id}</h1>
            <p><strong>Period:</strong> {audit.start_date.strftime('%Y-%m-%d')} to {audit.end_date.strftime('%Y-%m-%d')}</p>
            <p><strong>Chains:</strong> {', '.join(audit.chains)}</p>

            <div class="summary">
                <h2>Summary</h2>
                <p><strong>Total Transactions:</strong> {audit.total_transactions}</p>
                <p><strong>Total Volume:</strong> ${audit.total_volume_usd:,.2f}</p>
                <p><strong>Net Gain/Loss:</strong> ${net_gain_loss:,.2f}</p>
                <p><strong>Total Fees:</strong> ${audit.total_fees_usd:,.2f}</p>
            </div>

            <h2>Tax Breakdown</h2>
            <table>
                <tr><th>Category</th><th>Amount (USD)</th></tr>
                <tr><td>Short-term Capital Gains</td><td>${audit.short_term_gains:,.2f}</td></tr>
                <tr><td>Long-term Capital Gains</td><td>${audit.long_term_gains:,.2f}</td></tr>
                <tr><td>Ordinary Income</td><td>${audit.ordinary_income:,.2f}</td></tr>
            </table>

            <div class="footer">
                <strong>⚠️ Important Disclaimer:</strong> This is NOT financial or tax advice. Consult licensed professionals.
            </div>
            <div style="background: #fee2e2; padding: 15px; margin-top: 15px; border: 1px solid #ef4444;">
                <strong>⚠️ Cost Basis Warning:</strong> Some transactions may not have accurate purchase prices (cost basis).
                When the cost basis is unknown, the system assumes $0 (worst case for tax purposes), which may significantly
                overstate your capital gains. Please verify with your actual purchase records and adjust calculations accordingly.
            </div>
        </body>
        </html>
        """

        # Convert to PDF
        pdf_bytes = await PDFGenerator.html_to_pdf(html_content)

        # Generate filename
        filename = f"defi_audit_{audit_id}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF: {str(e)}"
        )


@router.delete("/audit/{audit_id}")
async def delete_audit(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete audit and all associated transactions"""

    # Verify ownership
    audit = db.query(DeFiAudit).filter(
        DeFiAudit.id == audit_id,
        DeFiAudit.user_id == current_user.id
    ).first()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    # Delete (cascade will delete transactions)
    db.delete(audit)
    db.commit()

    return {"message": f"Audit {audit_id} deleted successfully"}


@router.get("/protocols")
async def list_supported_protocols():
    """
    List all supported DeFi protocols

    Returns protocols that can be detected and analyzed
    """
    from app.services.defi_connectors import DeFiConnectorFactory

    protocols = DeFiConnectorFactory.list_supported_protocols()

    return {
        "protocols": protocols,
        "total": len(protocols),
        "categories": {
            "DEX": ["Uniswap V2", "Uniswap V3", "SushiSwap"],
            "Lending": ["Aave V2", "Aave V3", "Compound V2", "Compound V3"],
            "Yield": [],
            "Staking": []
        }
    }


@router.get("/chains")
async def list_supported_chains():
    """List all supported blockchain networks"""

    return {
        "chains": [
            {
                "id": "ethereum",
                "name": "Ethereum",
                "status": "active",
                "protocols": 25
            },
            {
                "id": "polygon",
                "name": "Polygon",
                "status": "active",
                "protocols": 15
            },
            {
                "id": "bsc",
                "name": "Binance Smart Chain",
                "status": "active",
                "protocols": 12
            },
            {
                "id": "arbitrum",
                "name": "Arbitrum",
                "status": "beta",
                "protocols": 8
            },
            {
                "id": "optimism",
                "name": "Optimism",
                "status": "beta",
                "protocols": 7
            }
        ]
    }
