"""
DeFi Audit Endpoints

API routes for DeFi transaction auditing
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response as FastAPIResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.defi_protocol import DeFiAudit
from app.models.cost_basis import UserCostBasisSettings
from app.routers.auth import get_current_user
from app.services.defi_audit_service import DeFiAuditService
from app.middleware import limiter, get_rate_limit
from app.dependencies import get_exchange_rate_service
from app.dependencies.license_check import require_defi_audit, require_pdf_export, require_csv_export
from app.data.currency_mapping import get_currency_info
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/defi", tags=["DeFi Audit"])


# Helper function to add local currency values to audit response
async def enrich_audit_with_local_currency(
    audit: DeFiAudit,
    user_id: int,
    db: Session
) -> dict:
    """
    Convert audit USD values to user's local currency.

    Uses the average exchange rate during the audit period (midpoint date).
    Returns dictionary with local currency fields to add to AuditResponse.
    """
    try:
        # Get user's tax jurisdiction
        settings = db.query(UserCostBasisSettings).filter(
            UserCostBasisSettings.user_id == user_id
        ).first()

        if not settings or not settings.tax_jurisdiction:
            logger.info(f"No tax jurisdiction for user {user_id}, returning USD only")
            return {}

        jurisdiction = settings.tax_jurisdiction
        currency_info = get_currency_info(jurisdiction)

        if not currency_info:
            logger.warning(f"No currency mapping for jurisdiction {jurisdiction}")
            return {}

        # Skip if USD jurisdiction
        if currency_info.uses_usd_directly:
            return {
                "local_currency": "USD",
                "currency_symbol": "$",
                "exchange_rate": 1.0
            }

        # Get exchange rate for midpoint of audit period
        # Use midpoint to average out fluctuations during audit period
        audit_midpoint = audit.start_date + (audit.end_date - audit.start_date) / 2

        exchange_service = get_exchange_rate_service()
        rate, source = await exchange_service.get_exchange_rate(
            from_currency="USD",
            to_currency=currency_info.currency_code,
            target_date=audit_midpoint.date()
        )

        if rate is None:
            logger.error(f"Failed to get exchange rate for {currency_info.currency_code}")
            return {}

        # Convert all USD values to local currency
        rate_float = float(rate)

        result = {
            "local_currency": currency_info.currency_code,
            "currency_symbol": currency_info.currency_symbol,
            "exchange_rate": rate_float,
            "total_volume_local": float(audit.total_volume_usd or 0) * rate_float if audit.total_volume_usd else 0,
            "total_gains_local": float(audit.total_gains_usd or 0) * rate_float if audit.total_gains_usd else 0,
            "total_losses_local": float(audit.total_losses_usd or 0) * rate_float if audit.total_losses_usd else 0,
            "total_fees_local": float(audit.total_fees_usd or 0) * rate_float if audit.total_fees_usd else 0,
            "short_term_gains_local": float(audit.short_term_gains or 0) * rate_float if audit.short_term_gains else 0,
            "long_term_gains_local": float(audit.long_term_gains or 0) * rate_float if audit.long_term_gains else 0,
            "ordinary_income_local": float(audit.ordinary_income or 0) * rate_float if audit.ordinary_income else 0,
        }

        logger.info(
            f"✓ Enriched audit {audit.id}: Rate {rate_float:.4f} USD→{currency_info.currency_code}, "
            f"Volume: ${audit.total_volume_usd or 0:.2f} = {currency_info.currency_symbol}{result['total_volume_local']:.2f}"
        )

        await exchange_service.close()
        return result

    except Exception as e:
        logger.error(f"Error enriching audit with local currency: {e}", exc_info=True)
        return {}


class CreateAuditRequest(BaseModel):
    wallet_address: str = Field(..., min_length=26, max_length=100, description="Wallet address (EVM or Solana)")
    chains: List[str] = Field(..., min_length=1, max_length=10, description="List of blockchain networks (1-10 chains)")
    start_date: Optional[str] = Field(None, description="ISO date string (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="ISO date string (YYYY-MM-DD)")

    @field_validator('wallet_address')
    @classmethod
    def validate_wallet_address(cls, v: str) -> str:
        """Validate wallet address format (EVM: 0x... or Solana: base58)"""
        v = v.strip()

        # EVM address: 0x followed by 40 hex characters
        if re.match(r'^0x[a-fA-F0-9]{40}$', v):
            return v.lower()

        # Solana address: base58, 32-44 characters
        if re.match(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$', v):
            return v

        raise ValueError('Invalid wallet address format. Must be EVM (0x...) or Solana (base58)')

    @field_validator('chains')
    @classmethod
    def validate_chains(cls, v: List[str]) -> List[str]:
        """Validate and normalize chain names"""
        if not v:
            raise ValueError('At least one chain must be specified')

        # Normalize to lowercase
        v = [chain.lower().strip() for chain in v]

        # Check for duplicates
        if len(v) != len(set(v)):
            raise ValueError('Duplicate chains in list')

        return v


class AuditResponse(BaseModel):
    id: int
    status: str
    start_date: str
    end_date: str
    chains: List[str]
    total_transactions: int

    # USD values (original)
    total_volume_usd: float
    total_gains_usd: float
    total_losses_usd: float
    total_fees_usd: float
    short_term_gains: float
    long_term_gains: float
    ordinary_income: float

    # Local currency values (multi-currency support)
    local_currency: Optional[str] = None
    currency_symbol: Optional[str] = None
    total_volume_local: Optional[float] = None
    total_gains_local: Optional[float] = None
    total_losses_local: Optional[float] = None
    total_fees_local: Optional[float] = None
    short_term_gains_local: Optional[float] = None
    long_term_gains_local: Optional[float] = None
    ordinary_income_local: Optional[float] = None
    exchange_rate: Optional[float] = None

    protocols_used: dict
    created_at: str
    completed_at: Optional[str] = None


@router.post("/audit", response_model=AuditResponse)
@limiter.limit(get_rate_limit("defi_audit"))
async def create_defi_audit(
    request: Request,
    response: FastAPIResponse,
    audit_request: CreateAuditRequest,
    current_user: User = Depends(get_current_user),
    license_check = Depends(require_defi_audit),
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
    invalid_chains = [c for c in audit_request.chains if c.lower() not in supported_chains]
    if invalid_chains:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported chains: {invalid_chains}. Supported: {supported_chains}"
        )

    # Validate address compatibility with chains
    wallet_address = audit_request.wallet_address.strip()
    is_evm_address = re.match(r'^0x[a-fA-F0-9]{40}$', wallet_address)
    is_solana_address = re.match(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$', wallet_address)

    evm_chains = [c for c in audit_request.chains if c.lower() != 'solana']
    solana_chains = [c for c in audit_request.chains if c.lower() == 'solana']

    if is_evm_address and solana_chains:
        raise HTTPException(
            status_code=400,
            detail=f"EVM address (0x...) cannot be used on Solana blockchain. Please remove 'solana' from chains or use a Solana address."
        )

    if is_solana_address and evm_chains:
        raise HTTPException(
            status_code=400,
            detail=f"Solana address cannot be used on EVM blockchains: {evm_chains}. Please remove EVM chains or use an EVM address (0x...)."
        )

    if not is_evm_address and not is_solana_address:
        raise HTTPException(
            status_code=400,
            detail="Invalid wallet address format. Must be EVM (0x...) or Solana (base58) address."
        )

    # Parse dates
    start_date = None
    end_date = None
    if audit_request.start_date:
        try:
            start_date = datetime.fromisoformat(audit_request.start_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use ISO format.")

    if audit_request.end_date:
        try:
            end_date = datetime.fromisoformat(audit_request.end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format.")

    # Create audit record (without processing yet)
    # Default date range: last tax year
    if not start_date:
        from datetime import timedelta
        start_date = datetime.now(timezone.utc) - timedelta(days=365)
    if not end_date:
        end_date = datetime.now(timezone.utc)

    audit = DeFiAudit(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        chains=audit_request.chains,
        status="pending"  # Start as pending, will be processed by Celery
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    logger.info(f"Audit {audit.id} created with status pending")

    # Launch background task to process audit
    try:
        from app.tasks.defi_audit_tasks import process_defi_audit_task
        task = process_defi_audit_task.delay(audit.id, audit_request.wallet_address)
        logger.info(f"Launched Celery task {task.id} for audit {audit.id}")
    except Exception as e:
        logger.error(f"Failed to launch Celery task for audit {audit.id}: {e}", exc_info=True)
        # Don't fail the request - audit is created, just mark as failed
        audit.status = "failed"
        audit.error_message = f"Failed to start processing: {str(e)}"
        db.commit()

    # Enrich with local currency values
    local_currency_data = await enrich_audit_with_local_currency(audit, current_user.id, db)

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
        completed_at=audit.completed_at.isoformat() if audit.completed_at else None,
        **local_currency_data  # Add local currency fields
    )


@router.get("/audits", response_model=List[AuditResponse])
@limiter.limit(get_rate_limit("read_only"))
async def list_user_audits(
    request: Request,
    response: FastAPIResponse,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all audits for current user with local currency values"""

    audits = db.query(DeFiAudit).filter(
        DeFiAudit.user_id == current_user.id
    ).order_by(DeFiAudit.created_at.desc()).all()

    # Enrich each audit with local currency values
    results = []
    for audit in audits:
        # ✅ TIMEOUT CHECK: Mark audit as failed if stuck for > 1 hour
        if audit.status in ["pending", "processing"]:
            timeout_hours = 1
            time_elapsed = datetime.utcnow() - audit.created_at
            if time_elapsed.total_seconds() > timeout_hours * 3600:
                logger.warning(f"Audit {audit.id} timed out after {time_elapsed.total_seconds() / 3600:.1f} hours")
                audit.status = "failed"
                audit.error_message = f"Audit timed out after {timeout_hours} hour(s). The Celery worker may be unavailable. Please try again or contact support."
                audit.completed_at = datetime.utcnow()
                db.commit()
                db.refresh(audit)

        local_currency_data = await enrich_audit_with_local_currency(audit, current_user.id, db)

        results.append(AuditResponse(
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
            completed_at=audit.completed_at.isoformat() if audit.completed_at else None,
            **local_currency_data  # Add local currency fields
        ))

    return results


@router.get("/audit/{audit_id}")
@limiter.limit(get_rate_limit("read_only"))
async def get_audit_report(
    request: Request,
    response: FastAPIResponse,
    audit_id: int,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete audit report with paginated transactions

    Args:
        audit_id: Audit ID
        limit: Max transactions to return (default 100, max 1000)
        offset: Offset for pagination (default 0)

    Returns detailed breakdown of all DeFi activity, tax implications,
    and optimization recommendations.
    """

    # Validate pagination parameters
    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 1000")
    if offset < 0:
        raise HTTPException(status_code=400, detail="Offset must be >= 0")

    # Verify ownership
    audit = db.query(DeFiAudit).filter(
        DeFiAudit.id == audit_id,
        DeFiAudit.user_id == current_user.id
    ).first()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    # ✅ TIMEOUT CHECK: Mark audit as failed if stuck for > 1 hour
    if audit.status in ["pending", "processing"]:
        timeout_hours = 1
        time_elapsed = datetime.utcnow() - audit.created_at
        if time_elapsed.total_seconds() > timeout_hours * 3600:
            logger.warning(f"Audit {audit.id} timed out after {time_elapsed.total_seconds() / 3600:.1f} hours")
            audit.status = "failed"
            audit.error_message = f"Audit timed out after {timeout_hours} hour(s). The Celery worker may be unavailable. Please try again or contact support."
            audit.completed_at = datetime.utcnow()
            db.commit()
            db.refresh(audit)

    # Get full report with pagination
    service = DeFiAuditService(db)
    report = await service.get_audit_report(audit_id, limit=limit, offset=offset)

    return report


@router.get("/audit/{audit_id}/export/csv")
async def export_audit_csv(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    license_check = Depends(require_csv_export),
    db: Session = Depends(get_db)
):
    """
    Export DeFi audit transactions as CSV

    Returns all transactions in CSV format for import into Excel, Google Sheets,
    or tax software like TurboTax/TaxAct.

    🔒 PRO feature only
    """
    from fastapi.responses import Response as FastAPIResp
    import csv
    from io import StringIO

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
            detail="Cannot export CSV for incomplete audit"
        )

    # Get all transactions (no pagination for export)
    from app.models.defi_protocol import DeFiTransaction
    transactions = db.query(DeFiTransaction).filter(
        DeFiTransaction.audit_id == audit_id
    ).order_by(DeFiTransaction.timestamp.asc()).all()

    # Generate CSV
    output = StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        'Date',
        'Time (UTC)',
        'Transaction Hash',
        'Chain',
        'Type',
        'Protocol',
        'Tax Category',
        'Token In',
        'Amount In',
        'USD Value In',
        'Token Out',
        'Amount Out',
        'USD Value Out',
        'Gain/Loss (USD)',
        'Holding Period (days)',
        'Gas Fee (USD)',
        'Protocol Fee (USD)',
        'Total Fee (USD)',
        'Notes'
    ])

    # Write transaction rows
    for tx in transactions:
        writer.writerow([
            tx.timestamp.strftime('%Y-%m-%d'),
            tx.timestamp.strftime('%H:%M:%S'),
            tx.tx_hash,
            tx.chain,
            tx.transaction_type.value if tx.transaction_type else 'unknown',
            tx.protocol.name if tx.protocol else 'Unknown',
            tx.tax_category,
            tx.token_in or '',
            f"{tx.amount_in:.6f}" if tx.amount_in else '',
            f"{tx.usd_value_in:.2f}" if tx.usd_value_in else '',
            tx.token_out or '',
            f"{tx.amount_out:.6f}" if tx.amount_out else '',
            f"{tx.usd_value_out:.2f}" if tx.usd_value_out else '',
            f"{tx.gain_loss_usd:.2f}" if tx.gain_loss_usd else '',
            tx.holding_period_days or '',
            f"{tx.gas_fee_usd:.2f}" if tx.gas_fee_usd else '',
            f"{tx.protocol_fee_usd:.2f}" if tx.protocol_fee_usd else '',
            f"{(tx.gas_fee_usd or 0) + (tx.protocol_fee_usd or 0):.2f}",
            tx.notes or ''
        ])

    csv_content = output.getvalue()
    output.close()

    # Generate filename
    filename = f"defi_audit_{audit_id}_{audit.start_date.strftime('%Y%m%d')}_{audit.end_date.strftime('%Y%m%d')}.csv"

    return FastAPIResp(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/audit/{audit_id}/export/pdf")
async def export_audit_pdf(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    license_check = Depends(require_pdf_export),
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


@router.get("/audit/{audit_id}/status")
@limiter.limit(get_rate_limit("read_only"))
async def get_audit_status(
    request: Request,
    response: FastAPIResponse,
    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get real-time audit processing status

    Returns current progress for audits in 'processing' state.
    Useful for frontend progress bars and status updates.

    Returns:
        - status: processing, completed, failed
        - progress: 0-100 percentage
        - current_step: Description of current operation
        - total_transactions: Transactions found so far
        - estimated_time_remaining: Seconds (if available)
    """

    # Verify ownership
    audit = db.query(DeFiAudit).filter(
        DeFiAudit.id == audit_id,
        DeFiAudit.user_id == current_user.id
    ).first()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    # ✅ TIMEOUT CHECK: Mark audit as failed if stuck for > 1 hour
    if audit.status in ["pending", "processing"]:
        timeout_hours = 1
        time_elapsed = datetime.utcnow() - audit.created_at
        if time_elapsed.total_seconds() > timeout_hours * 3600:
            logger.warning(f"Audit {audit.id} timed out after {time_elapsed.total_seconds() / 3600:.1f} hours")
            audit.status = "failed"
            audit.error_message = f"Audit timed out after {timeout_hours} hour(s). The Celery worker may be unavailable. Please try again or contact support."
            audit.completed_at = datetime.utcnow()
            db.commit()
            db.refresh(audit)

    # Calculate progress based on status
    if audit.status == "completed":
        return {
            "audit_id": audit.id,
            "status": "completed",
            "progress": 100,
            "current_step": "Audit completed",
            "total_transactions": audit.total_transactions,
            "completed_at": audit.completed_at.isoformat() if audit.completed_at else None
        }

    elif audit.status == "failed":
        return {
            "audit_id": audit.id,
            "status": "failed",
            "progress": 0,
            "current_step": "Audit failed",
            "error_message": audit.error_message,
            "total_transactions": 0
        }

    elif audit.status == "processing":
        # Count transactions processed so far
        transactions_processed = db.query(DeFiTransaction).filter(
            DeFiTransaction.audit_id == audit_id
        ).count()

        # Estimate progress (rough estimate)
        # Assume 10% for each chain scanned (if we knew which chain we're on)
        # For now, just show 50% if processing
        estimated_progress = min(50 + (transactions_processed // 10), 95)

        return {
            "audit_id": audit.id,
            "status": "processing",
            "progress": estimated_progress,
            "current_step": f"Processing transactions... ({transactions_processed} found)",
            "total_transactions": transactions_processed,
            "chains": audit.chains,
            "created_at": audit.created_at.isoformat()
        }

    else:
        # Pending or unknown status
        return {
            "audit_id": audit.id,
            "status": audit.status or "pending",
            "progress": 0,
            "current_step": "Queued for processing",
            "total_transactions": 0
        }


@router.post("/audit/{audit_id}/generate-cost-basis-lots")
async def generate_cost_basis_lots_retroactively(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate cost basis lots retroactively for an existing audit

    Useful when an audit was created before the automatic lot generation feature
    or when lots were not created due to a bug.
    """
    # Get audit
    audit = db.query(DeFiAudit).filter(
        DeFiAudit.id == audit_id,
        DeFiAudit.user_id == current_user.id
    ).first()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    if audit.status != "completed":
        raise HTTPException(status_code=400, detail="Audit must be completed first")

    # Get all transactions from this audit
    from app.models.defi_protocol import DeFiTransaction
    transactions = db.query(DeFiTransaction).filter(
        DeFiTransaction.audit_id == audit_id
    ).all()

    if not transactions:
        raise HTTPException(status_code=404, detail="No transactions found for this audit")

    # Initialize service
    service = DeFiAuditService(db)

    lots_created = 0
    errors = []

    for tx in transactions:
        try:
            # Reconstruct tx_data from transaction record
            tx_data = {
                "tx_hash": tx.tx_hash,
                "chain": tx.chain,
                "token_in": tx.token_in,
                "amount_in": float(tx.amount_in) if tx.amount_in else None,
                "usd_value_in": float(tx.usd_value_in) if tx.usd_value_in else None,
                "token_out": tx.token_out,
                "amount_out": float(tx.amount_out) if tx.amount_out else None,
                "usd_value_out": float(tx.usd_value_out) if tx.usd_value_out else None,
                "timestamp": tx.timestamp,
                "transaction_type": tx.transaction_type
            }

            # Get wallet address from audit (assuming single wallet per audit)
            # If multiple wallets, this should be stored in the transaction
            wallet_address = "unknown"  # Fallback

            # Create lots for this transaction
            await service._create_lots_for_transaction(
                tx_data=tx_data,
                audit_id=audit_id,
                user_id=current_user.id,
                wallet_address=wallet_address
            )

            lots_created += 1

        except Exception as e:
            errors.append({
                "tx_hash": tx.tx_hash,
                "error": str(e)
            })
            logger.error(f"Failed to create lots for tx {tx.tx_hash}: {e}")

    return {
        "audit_id": audit_id,
        "total_transactions": len(transactions),
        "lots_created": lots_created,
        "errors": errors[:10],  # Limit errors returned
        "success": len(errors) == 0
    }
