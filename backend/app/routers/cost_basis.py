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

    Expected CSV format:
    token,chain,acquisition_date,acquisition_price_usd,amount,acquisition_method,notes
    ETH,ethereum,2023-01-15,1500.00,2.5,purchase,Bought on Coinbase
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        contents = await file.read()
        csv_data = io.StringIO(contents.decode('utf-8'))
        reader = csv.DictReader(csv_data)

        imported_count = 0
        errors = []

        for row_num, row in enumerate(reader, start=2):
            try:
                # Parse row
                token = row.get('token', '').upper().strip()
                chain = row.get('chain', '').lower().strip()
                acquisition_date_str = row.get('acquisition_date', '').strip()
                acquisition_price = float(row.get('acquisition_price_usd', 0))
                amount = float(row.get('amount', 0))
                acquisition_method = row.get('acquisition_method', 'purchase').lower().strip()
                notes = row.get('notes', '').strip()

                if not token or not chain or not acquisition_date_str:
                    errors.append(f"Row {row_num}: Missing required fields")
                    continue

                # Parse date
                acquisition_date = datetime.fromisoformat(acquisition_date_str)

                # Validate method
                try:
                    acq_method = AcquisitionMethod(acquisition_method)
                except ValueError:
                    acq_method = AcquisitionMethod.PURCHASE

                # Create lot
                lot = CostBasisLot(
                    user_id=current_user.id,
                    token=token,
                    chain=chain,
                    acquisition_date=acquisition_date,
                    acquisition_method=acq_method,
                    acquisition_price_usd=acquisition_price,
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
                errors.append(f"Row {row_num}: {str(e)}")

        db.commit()

        return {
            "message": f"Successfully imported {imported_count} lots",
            "imported_count": imported_count,
            "errors": errors if errors else None
        }

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
