"""
Cost Basis Tracking Endpoints

API routes for cost basis lot tracking and portfolio management.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models.user import User
from app.models.cost_basis import (
    CostBasisLot,
    CostBasisDisposal,
    UserCostBasisSettings,
    CostBasisMethod,
    AcquisitionMethod
)
from app.routers.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import csv
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cost-basis", tags=["Cost Basis"])


# Pydantic models
class CreateLotRequest(BaseModel):
    token: str
    token_address: Optional[str] = None
    chain: str
    acquisition_date: str  # ISO format
    acquisition_method: str
    acquisition_price_usd: float
    original_amount: float
    source_tx_hash: Optional[str] = None
    notes: Optional[str] = None


class LotResponse(BaseModel):
    id: int
    token: str
    chain: str
    acquisition_date: str
    acquisition_method: str
    acquisition_price_usd: float
    original_amount: float
    remaining_amount: float
    disposed_amount: float
    current_value_usd: float
    unrealized_gain_loss: float
    notes: Optional[str]
    created_at: str


class PortfolioSummary(BaseModel):
    total_value_usd: float
    total_cost_basis: float
    total_unrealized_gain_loss: float
    total_lots: int
    tokens_summary: Dict[str, Dict]  # token -> {amount, value, cost_basis, gain_loss}
    by_chain: Dict[str, Dict]  # chain -> summary


class UpdateSettingsRequest(BaseModel):
    default_method: Optional[str] = None
    tax_jurisdiction: Optional[str] = None
    apply_wash_sale_rule: Optional[bool] = None


@router.get("/lots", response_model=List[LotResponse])
async def get_cost_basis_lots(
    token: Optional[str] = None,
    chain: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all cost basis lots for the current user

    Optionally filter by token or chain.
    """
    query = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == current_user.id
    )

    if token:
        query = query.filter(CostBasisLot.token == token.upper())
    if chain:
        query = query.filter(CostBasisLot.chain == chain.lower())

    lots = query.order_by(desc(CostBasisLot.acquisition_date)).all()

    # Get current prices from price service
    from app.services.price_service import PriceService
    price_service = PriceService()

    result = []
    for lot in lots:
        # Get real-time price from price service
        current_price_decimal = price_service.get_current_price(lot.token)
        if current_price_decimal:
            current_price = float(current_price_decimal)
        else:
            # Fallback to acquisition price if current price unavailable
            current_price = lot.acquisition_price_usd

        current_value = lot.remaining_amount * current_price
        unrealized_gl = current_value - (lot.remaining_amount * lot.acquisition_price_usd)

        result.append(LotResponse(
            id=lot.id,
            token=lot.token,
            chain=lot.chain,
            acquisition_date=lot.acquisition_date.isoformat(),
            acquisition_method=lot.acquisition_method.value,
            acquisition_price_usd=lot.acquisition_price_usd,
            original_amount=lot.original_amount,
            remaining_amount=lot.remaining_amount,
            disposed_amount=lot.disposed_amount,
            current_value_usd=current_value,
            unrealized_gain_loss=unrealized_gl,
            notes=lot.notes,
            created_at=lot.created_at.isoformat()
        ))

    return result


@router.post("/lots", response_model=LotResponse)
async def create_cost_basis_lot(
    request: CreateLotRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new cost basis lot

    Manually add a purchase/acquisition to track cost basis.
    """
    try:
        acquisition_date = datetime.fromisoformat(request.acquisition_date.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid acquisition_date format. Use ISO format.")

    # Validate acquisition method
    try:
        acq_method = AcquisitionMethod(request.acquisition_method.lower())
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid acquisition_method. Must be one of: {[m.value for m in AcquisitionMethod]}"
        )

    lot = CostBasisLot(
        user_id=current_user.id,
        token=request.token.upper(),
        token_address=request.token_address,
        chain=request.chain.lower(),
        acquisition_date=acquisition_date,
        acquisition_method=acq_method,
        acquisition_price_usd=request.acquisition_price_usd,
        source_tx_hash=request.source_tx_hash,
        original_amount=request.original_amount,
        remaining_amount=request.original_amount,
        disposed_amount=0.0,
        notes=request.notes,
        manually_added=True,
        verified=False
    )

    db.add(lot)
    db.commit()
    db.refresh(lot)

    # Calculate current value with real price
    from app.services.price_service import PriceService
    price_service = PriceService()
    current_price_decimal = price_service.get_current_price(lot.token)
    if current_price_decimal:
        current_price = float(current_price_decimal)
    else:
        current_price = lot.acquisition_price_usd

    current_value = lot.remaining_amount * current_price
    unrealized_gl = current_value - (lot.remaining_amount * lot.acquisition_price_usd)

    return LotResponse(
        id=lot.id,
        token=lot.token,
        chain=lot.chain,
        acquisition_date=lot.acquisition_date.isoformat(),
        acquisition_method=lot.acquisition_method.value,
        acquisition_price_usd=lot.acquisition_price_usd,
        original_amount=lot.original_amount,
        remaining_amount=lot.remaining_amount,
        disposed_amount=lot.disposed_amount,
        current_value_usd=current_value,
        unrealized_gain_loss=unrealized_gl,
        notes=lot.notes,
        created_at=lot.created_at.isoformat()
    )


@router.delete("/lots/{lot_id}")
async def delete_cost_basis_lot(
    lot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a cost basis lot"""
    lot = db.query(CostBasisLot).filter(
        CostBasisLot.id == lot_id,
        CostBasisLot.user_id == current_user.id
    ).first()

    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    db.delete(lot)
    db.commit()

    return {"message": "Lot deleted successfully"}


@router.get("/portfolio", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get portfolio summary with aggregated cost basis data

    Returns total portfolio value, cost basis, and unrealized gains/losses.
    """
    lots = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == current_user.id,
        CostBasisLot.remaining_amount > 0
    ).all()

    if not lots:
        return PortfolioSummary(
            total_value_usd=0.0,
            total_cost_basis=0.0,
            total_unrealized_gain_loss=0.0,
            total_lots=0,
            tokens_summary={},
            by_chain={}
        )

    # Get price service for real-time prices
    from app.services.price_service import PriceService
    price_service = PriceService()

    # Cache prices per token to avoid repeated API calls
    price_cache = {}

    # Aggregate by token
    tokens_summary = {}
    by_chain = {}

    total_value = 0.0
    total_cost_basis = 0.0

    for lot in lots:
        # Get current price (use cache to avoid repeated calls)
        if lot.token not in price_cache:
            current_price_decimal = price_service.get_current_price(lot.token)
            if current_price_decimal:
                price_cache[lot.token] = float(current_price_decimal)
            else:
                price_cache[lot.token] = lot.acquisition_price_usd

        current_price = price_cache[lot.token]
        lot_value = lot.remaining_amount * current_price
        lot_cost_basis = lot.remaining_amount * lot.acquisition_price_usd

        total_value += lot_value
        total_cost_basis += lot_cost_basis

        # By token
        if lot.token not in tokens_summary:
            tokens_summary[lot.token] = {
                "amount": 0.0,
                "value_usd": 0.0,
                "cost_basis": 0.0,
                "gain_loss": 0.0,
                "current_price": current_price
            }

        tokens_summary[lot.token]["amount"] += lot.remaining_amount
        tokens_summary[lot.token]["value_usd"] += lot_value
        tokens_summary[lot.token]["cost_basis"] += lot_cost_basis
        tokens_summary[lot.token]["gain_loss"] += (lot_value - lot_cost_basis)

        # By chain
        if lot.chain not in by_chain:
            by_chain[lot.chain] = {
                "value_usd": 0.0,
                "cost_basis": 0.0,
                "gain_loss": 0.0,
                "lots_count": 0
            }

        by_chain[lot.chain]["value_usd"] += lot_value
        by_chain[lot.chain]["cost_basis"] += lot_cost_basis
        by_chain[lot.chain]["gain_loss"] += (lot_value - lot_cost_basis)
        by_chain[lot.chain]["lots_count"] += 1

    return PortfolioSummary(
        total_value_usd=total_value,
        total_cost_basis=total_cost_basis,
        total_unrealized_gain_loss=total_value - total_cost_basis,
        total_lots=len(lots),
        tokens_summary=tokens_summary,
        by_chain=by_chain
    )


@router.post("/import-csv")
async def import_cost_basis_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Import cost basis lots from CSV

    Expected CSV format (all fields):
    token,chain,acquisition_date,acquisition_price_usd,amount,acquisition_method,notes,token_address,source_tx_hash

    Required fields: token, chain, acquisition_date, acquisition_price_usd, amount
    Optional fields: acquisition_method (default: purchase), notes, token_address, source_tx_hash

    Date formats supported: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, ISO 8601

    Example:
    ETH,ethereum,2023-01-15,1500.00,2.5,purchase,Bought on Coinbase
    BTC,bitcoin,15/03/2023,25000.00,0.1,purchase,Bought on Kraken,,0x123abc...
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    def parse_flexible_date(date_str: str) -> datetime:
        """Parse date from multiple formats"""
        date_str = date_str.strip()

        # Try ISO format first (YYYY-MM-DD)
        for fmt in [
            "%Y-%m-%d",           # 2023-01-15
            "%d/%m/%Y",           # 15/01/2023
            "%m/%d/%Y",           # 01/15/2023
            "%Y-%m-%dT%H:%M:%S",  # ISO with time
            "%Y/%m/%d",           # 2023/01/15
        ]:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue

        # Last resort: try fromisoformat
        try:
            return datetime.fromisoformat(date_str)
        except ValueError:
            raise ValueError(f"Invalid date format: {date_str}. Supported: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY")

    try:
        contents = await file.read()
        csv_data = io.StringIO(contents.decode('utf-8'))
        reader = csv.DictReader(csv_data)

        imported_count = 0
        errors = []
        warnings = []

        for row_num, row in enumerate(reader, start=2):
            try:
                # Parse required fields
                token = row.get('token', '').upper().strip()
                chain = row.get('chain', '').lower().strip()
                acquisition_date_str = row.get('acquisition_date', '').strip()

                # Validate required fields
                if not token:
                    errors.append(f"Row {row_num}: Missing token")
                    continue
                if not chain:
                    errors.append(f"Row {row_num}: Missing chain")
                    continue
                if not acquisition_date_str:
                    errors.append(f"Row {row_num}: Missing acquisition_date")
                    continue

                # Parse and validate numeric fields
                try:
                    acquisition_price = float(row.get('acquisition_price_usd', 0))
                except ValueError:
                    errors.append(f"Row {row_num}: Invalid acquisition_price_usd - must be a number")
                    continue

                try:
                    amount = float(row.get('amount', 0))
                except ValueError:
                    errors.append(f"Row {row_num}: Invalid amount - must be a number")
                    continue

                # Validate positive values
                if acquisition_price <= 0:
                    errors.append(f"Row {row_num}: acquisition_price_usd must be > 0 (got {acquisition_price})")
                    continue
                if amount <= 0:
                    errors.append(f"Row {row_num}: amount must be > 0 (got {amount})")
                    continue

                # Parse optional fields (handle None values from CSV)
                acquisition_method = (row.get('acquisition_method') or 'purchase').lower().strip()
                notes = (row.get('notes') or '').strip()
                token_address = (row.get('token_address') or '').strip() or None
                source_tx_hash = (row.get('source_tx_hash') or '').strip() or None

                # Parse date with flexible formats
                try:
                    acquisition_date = parse_flexible_date(acquisition_date_str)
                except ValueError as e:
                    errors.append(f"Row {row_num}: {str(e)}")
                    continue

                # Validate and map acquisition method
                # Map common aliases
                method_aliases = {
                    'staking': 'mining',  # staking rewards = mining
                    'stake': 'mining',
                    'reward': 'mining',
                    'rewards': 'mining',
                    'buy': 'purchase',
                    'bought': 'purchase',
                    'trade': 'swap',
                    'exchange': 'swap',
                }

                mapped_method = method_aliases.get(acquisition_method, acquisition_method)

                try:
                    acq_method = AcquisitionMethod(mapped_method)
                except ValueError:
                    warnings.append(f"Row {row_num}: Unknown acquisition_method '{acquisition_method}', defaulting to 'purchase'")
                    acq_method = AcquisitionMethod.PURCHASE

                # Create lot
                lot = CostBasisLot(
                    user_id=current_user.id,
                    token=token,
                    token_address=token_address,
                    chain=chain,
                    acquisition_date=acquisition_date,
                    acquisition_method=acq_method,
                    acquisition_price_usd=acquisition_price,
                    source_tx_hash=source_tx_hash,
                    original_amount=amount,
                    remaining_amount=amount,
                    disposed_amount=0.0,
                    notes=notes,
                    manually_added=True,
                    verified=False
                )

                db.add(lot)
                imported_count += 1

            except Exception as e:
                errors.append(f"Row {row_num}: Unexpected error - {str(e)}")

        db.commit()

        response = {
            "message": f"Successfully imported {imported_count} lots",
            "imported_count": imported_count,
            "total_rows": row_num - 1 if 'row_num' in locals() else 0,
            "errors": errors if errors else None,
            "warnings": warnings if warnings else None
        }

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import CSV: {str(e)}")


@router.get("/settings")
async def get_cost_basis_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's cost basis calculation settings"""
    settings = db.query(UserCostBasisSettings).filter(
        UserCostBasisSettings.user_id == current_user.id
    ).first()

    if not settings:
        # Create default settings
        settings = UserCostBasisSettings(
            user_id=current_user.id,
            default_method=CostBasisMethod.FIFO,
            tax_jurisdiction="US",
            apply_wash_sale_rule=True
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return {
        "default_method": settings.default_method.value,
        "tax_jurisdiction": settings.tax_jurisdiction,
        "apply_wash_sale_rule": settings.apply_wash_sale_rule,
        "wash_sale_days": settings.wash_sale_days,
        "track_inter_wallet_transfers": settings.track_inter_wallet_transfers,
        "auto_import_enabled": settings.auto_import_enabled
    }


@router.put("/settings")
async def update_cost_basis_settings(
    request: UpdateSettingsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's cost basis calculation settings"""
    settings = db.query(UserCostBasisSettings).filter(
        UserCostBasisSettings.user_id == current_user.id
    ).first()

    if not settings:
        settings = UserCostBasisSettings(user_id=current_user.id)
        db.add(settings)

    if request.default_method:
        try:
            settings.default_method = CostBasisMethod(request.default_method.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid method. Must be one of: {[m.value for m in CostBasisMethod]}"
            )

    if request.tax_jurisdiction:
        settings.tax_jurisdiction = request.tax_jurisdiction.upper()

    if request.apply_wash_sale_rule is not None:
        settings.apply_wash_sale_rule = request.apply_wash_sale_rule

    db.commit()

    return {"message": "Settings updated successfully"}


@router.get("/export/irs-8949")
async def export_irs_form_8949(
    year: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export IRS Form 8949 - Sales and Other Dispositions of Capital Assets
    
    CSV format compatible with IRS Form 8949:
    - Description of property
    - Date acquired
    - Date sold or disposed
    - Proceeds (sales price)
    - Cost or other basis
    - Gain or (loss)
    - Term (Short-term / Long-term)
    
    Args:
        year: Tax year to export (e.g., 2024)
    
    Returns:
        CSV file ready for IRS Form 8949
    """
    from app.models.cost_basis import CostBasisDisposal
    from fastapi.responses import StreamingResponse
    import io
    
    # Get all disposals for the year
    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31, 23, 59, 59)
    
    disposals = db.query(CostBasisDisposal).filter(
        CostBasisDisposal.user_id == current_user.id,
        CostBasisDisposal.disposal_date >= start_date,
        CostBasisDisposal.disposal_date <= end_date
    ).order_by(CostBasisDisposal.disposal_date).all()
    
    if not disposals:
        raise HTTPException(
            status_code=404,
            detail=f"No disposals found for tax year {year}"
        )
    
    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header (IRS Form 8949 format)
    writer.writerow([
        "Description of Property",
        "Date Acquired",
        "Date Sold or Disposed",
        "Proceeds (Sales Price)",
        "Cost or Other Basis",
        "Gain or (Loss)",
        "Term"
    ])
    
    short_term_total = 0.0
    long_term_total = 0.0
    
    for disposal in disposals:
        # Description
        description = f"{disposal.amount_disposed} {disposal.token}"
        
        # Dates
        date_acquired = disposal.acquisition_date.strftime("%m/%d/%Y")
        date_sold = disposal.disposal_date.strftime("%m/%d/%Y")
        
        # Financial amounts
        proceeds = disposal.disposal_price_usd * disposal.amount_disposed
        cost_basis = disposal.cost_basis_usd * disposal.amount_disposed
        gain_loss = disposal.gain_loss_usd
        
        # Determine term (short-term = <365 days, long-term = >=365 days)
        holding_period_days = disposal.holding_period_days or 0
        term = "Long-term" if holding_period_days >= 365 else "Short-term"
        
        if term == "Short-term":
            short_term_total += gain_loss
        else:
            long_term_total += gain_loss
        
        writer.writerow([
            description,
            date_acquired,
            date_sold,
            f"${proceeds:.2f}",
            f"${cost_basis:.2f}",
            f"${gain_loss:.2f}",
            term
        ])
    
    # Summary rows
    writer.writerow([])
    writer.writerow(["SUMMARY", "", "", "", "", "", ""])
    writer.writerow([
        "Total Short-term Gain/(Loss)",
        "", "", "", "",
        f"${short_term_total:.2f}",
        "Short-term"
    ])
    writer.writerow([
        "Total Long-term Gain/(Loss)",
        "", "", "", "",
        f"${long_term_total:.2f}",
        "Long-term"
    ])
    writer.writerow([
        "TOTAL GAIN/(LOSS)",
        "", "", "", "",
        f"${short_term_total + long_term_total:.2f}",
        ""
    ])
    
    # Return as downloadable CSV
    output.seek(0)
    headers = {
        "Content-Disposition": f"attachment; filename=IRS_Form_8949_{year}_crypto.csv"
    }
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers=headers
    )


# ========== P4: UI REVISION MANUELLE COST BASIS ==========

@router.patch("/lots/{lot_id}")
async def update_cost_basis_lot(
    lot_id: int,
    acquisition_price_usd: Optional[float] = None,
    acquisition_date: Optional[str] = None,
    notes: Optional[str] = None,
    verified: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update cost basis lot for manual correction/verification
    
    Allows users to manually adjust:
    - Acquisition price (if API data was wrong)
    - Acquisition date
    - Notes
    - Mark as verified
    """
    lot = db.query(CostBasisLot).filter(
        CostBasisLot.id == lot_id,
        CostBasisLot.user_id == current_user.id
    ).first()
    
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    # Update fields if provided
    if acquisition_price_usd is not None:
        if acquisition_price_usd <= 0:
            raise HTTPException(status_code=400, detail="Price must be > 0")
        lot.acquisition_price_usd = acquisition_price_usd
    
    if acquisition_date is not None:
        try:
            new_date = datetime.fromisoformat(acquisition_date.replace('Z', '+00:00'))
            lot.acquisition_date = new_date
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")
    
    if notes is not None:
        lot.notes = notes
    
    if verified is not None:
        lot.verified = verified
    
    db.commit()
    db.refresh(lot)
    
    return {"message": "Lot updated successfully", "lot_id": lot_id}


@router.get("/lots/unverified")
async def get_unverified_lots(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get cost basis lots that need manual verification
    
    Returns lots that:
    - Are not manually verified
    - Were auto-generated
    - Have uncertain data (no source price, estimated dates, etc.)
    """
    lots = db.query(CostBasisLot).filter(
        CostBasisLot.user_id == current_user.id,
        CostBasisLot.verified == False,
        CostBasisLot.remaining_amount > 0
    ).order_by(CostBasisLot.acquisition_date.desc()).limit(limit).all()
    
    from app.services.price_service import PriceService
    price_service = PriceService()
    
    result = []
    for lot in lots:
        current_price_decimal = price_service.get_current_price(lot.token)
        current_price = float(current_price_decimal) if current_price_decimal else lot.acquisition_price_usd
        
        current_value = lot.remaining_amount * current_price
        unrealized_gl = current_value - (lot.remaining_amount * lot.acquisition_price_usd)
        
        result.append({
            "id": lot.id,
            "token": lot.token,
            "chain": lot.chain,
            "acquisition_date": lot.acquisition_date.isoformat(),
            "acquisition_method": lot.acquisition_method.value,
            "acquisition_price_usd": lot.acquisition_price_usd,
            "original_amount": lot.original_amount,
            "remaining_amount": lot.remaining_amount,
            "current_value_usd": current_value,
            "unrealized_gain_loss": unrealized_gl,
            "source_tx_hash": lot.source_tx_hash,
            "notes": lot.notes,
            "manually_added": lot.manually_added,
            "needs_review": not lot.source_tx_hash or lot.manually_added
        })
    
    return result


# ========== P5: WASH SALE WARNINGS ==========

@router.get("/wash-sale-warnings")
async def get_wash_sale_warnings(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect potential wash sales (IRS 30-day rule)
    
    Wash Sale: Selling crypto at a loss, then repurchasing same/similar asset
    within 30 days before or after the sale.
    
    WARNING: Wash sale rule doesn't officially apply to crypto yet (IRS 2024),
    but may apply in future. Use for informational purposes.
    
    Args:
        days: Look-back period (default: 30 days per IRS rule)
    
    Returns:
        List of potential wash sales with warnings
    """
    from app.models.cost_basis import CostBasisDisposal
    from datetime import timedelta
    
    # Get all disposals with losses in last year
    one_year_ago = datetime.utcnow() - timedelta(days=365)
    
    disposals = db.query(CostBasisDisposal).filter(
        CostBasisDisposal.user_id == current_user.id,
        CostBasisDisposal.disposal_date >= one_year_ago,
        CostBasisDisposal.gain_loss_usd < 0  # Only losses
    ).order_by(CostBasisDisposal.disposal_date.desc()).all()
    
    warnings = []
    
    for disposal in disposals:
        # Look for repurchases within 30 days before/after
        window_start = disposal.disposal_date - timedelta(days=days)
        window_end = disposal.disposal_date + timedelta(days=days)
        
        # Find lots acquired in wash sale window
        repurchases = db.query(CostBasisLot).filter(
            CostBasisLot.user_id == current_user.id,
            CostBasisLot.token == disposal.token,
            CostBasisLot.chain == disposal.chain,
            CostBasisLot.acquisition_date >= window_start,
            CostBasisLot.acquisition_date <= window_end,
            CostBasisLot.acquisition_date != disposal.disposal_date  # Not same transaction
        ).all()
        
        if repurchases:
            repurchase_amounts = sum(lot.original_amount for lot in repurchases)
            
            # Determine severity
            if disposal.disposal_date < datetime.utcnow() - timedelta(days=days):
                severity = "info"  # Past wash sale window
            elif repurchase_amounts >= disposal.amount_disposed:
                severity = "high"  # Full repurchase = definite wash sale
            else:
                severity = "medium"  # Partial repurchase
            
            warnings.append({
                "disposal_id": disposal.id,
                "token": disposal.token,
                "chain": disposal.chain,
                "disposal_date": disposal.disposal_date.isoformat(),
                "disposal_amount": disposal.amount_disposed,
                "loss_amount_usd": abs(disposal.gain_loss_usd),
                "repurchase_dates": [lot.acquisition_date.isoformat() for lot in repurchases],
                "repurchase_amount": repurchase_amounts,
                "severity": severity,
                "message": f"Sold {disposal.amount_disposed} {disposal.token} at ${abs(disposal.gain_loss_usd):.2f} loss, "
                          f"then repurchased {repurchase_amounts} within {days} days. "
                          f"Potential wash sale - loss may be disallowed.",
                "affected_lot_ids": [lot.id for lot in repurchases]
            })
    
    return {
        "total_warnings": len(warnings),
        "high_severity": len([w for w in warnings if w["severity"] == "high"]),
        "medium_severity": len([w for w in warnings if w["severity"] == "medium"]),
        "info_severity": len([w for w in warnings if w["severity"] == "info"]),
        "warnings": warnings,
        "disclaimer": "Wash sale rule currently does NOT apply to cryptocurrency per IRS guidance (as of 2024). "
                     "However, this may change. These warnings are for informational purposes only."
    }
