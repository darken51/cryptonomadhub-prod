"""
Admin endpoints for monitoring and maintenance
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User, UserRole
from app.models.feature_flag import FeatureFlag
from app.models.regulation import Regulation
from app.models.simulation import Simulation
from app.routers.auth import get_current_user
from app.services.tax_data_monitor import TaxDataMonitor
from app.services.tax_data_sources import TaxDataAggregator
from app.services.notification_service import NotificationService
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/admin", tags=["Admin"])


# ============================================================================
# ADMIN ROLE REQUIREMENT
# ============================================================================

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role for sensitive operations"""
    # ✅ PHASE 1.2: Utiliser enum au lieu de string
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user


class SyncRequest(BaseModel):
    country_codes: List[str]  # List of countries to sync


@router.get("/tax-data/freshness")
async def check_tax_data_freshness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check freshness of tax data

    Returns statistics about which countries need updates
    """
    monitor = TaxDataMonitor(db)
    return monitor.check_data_freshness()


@router.get("/tax-data/checklist")
async def get_update_checklist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get prioritized checklist of countries to review

    Returns list sorted by priority with official source URLs
    """
    monitor = TaxDataMonitor(db)
    return {
        "checklist": monitor.get_update_checklist(),
        "calendar_alerts": monitor.get_tax_calendar_alerts()
    }


@router.get("/tax-data/report")
async def get_tax_data_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get human-readable report of tax data status

    Returns formatted text report for admin review
    """
    monitor = TaxDataMonitor(db)
    return {
        "report": monitor.generate_update_report(),
        "generated_at": monitor.check_data_freshness()['last_check']
    }


@router.post("/tax-data/sync")
async def sync_tax_data(
    sync_request: SyncRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync tax data for specific countries from free APIs

    Fetches data from:
    - Tax Foundation (CGT rates)
    - OECD API (income tax)
    - World Bank API (macro data)

    Returns immediate response, data fetched in background
    """
    aggregator = TaxDataAggregator(db)

    results = []
    for country_code in sync_request.country_codes:
        try:
            result = await aggregator.update_database(country_code)
            results.append(result)
        except Exception as e:
            results.append({
                'success': False,
                'country_code': country_code,
                'error': str(e)
            })

    await aggregator.close()

    return {
        "status": "completed",
        "countries_requested": len(sync_request.country_codes),
        "results": results,
        "summary": {
            "updated": len([r for r in results if r.get('action') == 'updated']),
            "no_change": len([r for r in results if r.get('action') == 'no_change']),
            "failed": len([r for r in results if not r.get('success')])
        }
    }


@router.post("/tax-data/sync-all")
async def sync_all_tax_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync tax data for ALL countries in database

    WARNING: This may take several minutes
    """
    aggregator = TaxDataAggregator(db)

    try:
        results = await aggregator.sync_all_countries()
        await aggregator.close()

        return {
            "status": "completed",
            "total_countries": len(results),
            "results": results,
            "summary": {
                "updated": len([r for r in results if r.get('action') == 'updated']),
                "no_change": len([r for r in results if r.get('action') == 'no_change']),
                "failed": len([r for r in results if not r.get('success')])
            }
        }
    except Exception as e:
        await aggregator.close()
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.get("/tax-data/test-sources")
async def test_tax_data_sources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Test connectivity to all free tax data sources

    Returns status of:
    - World Bank API
    - Tax Foundation (web scraping)
    - OECD API
    """
    aggregator = TaxDataAggregator(db)

    try:
        results = await aggregator.test_all_sources()
        await aggregator.close()

        all_working = all(results.values())

        return {
            "status": "all_operational" if all_working else "partial_failure",
            "sources": results,
            "timestamp": results['timestamp']
        }
    except Exception as e:
        await aggregator.close()
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")


@router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get admin notifications

    Query params:
    - unread_only: Only return unread notifications
    - limit: Max number of notifications to return
    - offset: Pagination offset
    """
    notifier = NotificationService(db)

    if unread_only:
        notifications = notifier.get_unread_notifications(limit=limit)
    else:
        notifications = notifier.get_all_notifications(limit=limit, offset=offset)

    unread_count = notifier.get_unread_count()

    return {
        "notifications": [
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "country_code": n.country_code,
                "read": n.read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "read_at": n.read_at.isoformat() if n.read_at else None
            }
            for n in notifications
        ],
        "unread_count": unread_count,
        "total": len(notifications)
    }


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notifier = NotificationService(db)
    success = notifier.mark_as_read(notification_id)

    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"status": "success", "message": "Notification marked as read"}


@router.post("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    notifier = NotificationService(db)
    notifier.mark_all_as_read()

    return {"status": "success", "message": "All notifications marked as read"}


# ============================================================================
# FEATURE FLAGS MANAGEMENT
# ============================================================================

class FeatureFlagResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    enabled_globally: bool
    beta_only: bool
    rollout_percentage: int
    enabled_countries: Optional[List[str]]
    created_at: str
    updated_at: Optional[str]

    class Config:
        from_attributes = True


class FeatureFlagUpdate(BaseModel):
    enabled_globally: Optional[bool] = None
    beta_only: Optional[bool] = None
    rollout_percentage: Optional[int] = None
    enabled_countries: Optional[List[str]] = None


class FeatureFlagCreate(BaseModel):
    name: str
    description: Optional[str] = None


@router.get("/feature-flags", response_model=List[FeatureFlagResponse])
async def get_all_feature_flags(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all feature flags

    Admin only
    """
    flags = db.query(FeatureFlag).all()

    return [
        FeatureFlagResponse(
            id=flag.id,
            name=flag.name,
            description=flag.description,
            enabled_globally=flag.enabled_globally,
            beta_only=flag.beta_only,
            rollout_percentage=flag.rollout_percentage,
            enabled_countries=flag.enabled_countries,
            created_at=flag.created_at.isoformat() if flag.created_at else None,
            updated_at=flag.updated_at.isoformat() if flag.updated_at else None
        )
        for flag in flags
    ]


@router.patch("/feature-flags/{flag_name}")
async def update_feature_flag(
    flag_name: str,
    updates: FeatureFlagUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update feature flag configuration

    Admin only
    """
    flag = db.query(FeatureFlag).filter_by(name=flag_name).first()

    if not flag:
        raise HTTPException(status_code=404, detail=f"Feature flag '{flag_name}' not found")

    # Apply updates
    if updates.enabled_globally is not None:
        flag.enabled_globally = updates.enabled_globally

    if updates.beta_only is not None:
        flag.beta_only = updates.beta_only

    if updates.rollout_percentage is not None:
        if not 0 <= updates.rollout_percentage <= 100:
            raise HTTPException(status_code=400, detail="Rollout percentage must be 0-100")
        flag.rollout_percentage = updates.rollout_percentage

    if updates.enabled_countries is not None:
        flag.enabled_countries = updates.enabled_countries

    db.commit()
    db.refresh(flag)

    return {
        "success": True,
        "message": f"Feature flag '{flag_name}' updated successfully",
        "flag": FeatureFlagResponse(
            id=flag.id,
            name=flag.name,
            description=flag.description,
            enabled_globally=flag.enabled_globally,
            beta_only=flag.beta_only,
            rollout_percentage=flag.rollout_percentage,
            enabled_countries=flag.enabled_countries,
            created_at=flag.created_at.isoformat() if flag.created_at else None,
            updated_at=flag.updated_at.isoformat() if flag.updated_at else None
        )
    }


@router.post("/feature-flags")
async def create_feature_flag(
    flag_data: FeatureFlagCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Create new feature flag

    Admin only
    """
    # Check if already exists
    existing = db.query(FeatureFlag).filter_by(name=flag_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Feature flag '{flag_data.name}' already exists")

    flag = FeatureFlag(
        name=flag_data.name,
        description=flag_data.description,
        enabled_globally=False,
        beta_only=False,
        rollout_percentage=0,
        enabled_countries=[]
    )

    db.add(flag)
    db.commit()
    db.refresh(flag)

    return {
        "success": True,
        "message": f"Feature flag '{flag_data.name}' created successfully",
        "flag": FeatureFlagResponse(
            id=flag.id,
            name=flag.name,
            description=flag.description,
            enabled_globally=flag.enabled_globally,
            beta_only=flag.beta_only,
            rollout_percentage=flag.rollout_percentage,
            enabled_countries=flag.enabled_countries,
            created_at=flag.created_at.isoformat() if flag.created_at else None,
            updated_at=flag.updated_at.isoformat() if flag.updated_at else None
        )
    }


@router.delete("/feature-flags/{flag_name}")
async def delete_feature_flag(
    flag_name: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a feature flag

    Admin only
    """
    flag = db.query(FeatureFlag).filter_by(name=flag_name).first()

    if not flag:
        raise HTTPException(status_code=404, detail=f"Feature flag '{flag_name}' not found")

    db.delete(flag)
    db.commit()

    return {
        "success": True,
        "message": f"Feature flag '{flag_name}' deleted successfully"
    }


# ============================================================================
# SYSTEM STATS
# ============================================================================

@router.get("/stats")
async def get_system_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get system statistics

    Admin only
    """
    total_countries = db.query(func.count(Regulation.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()
    total_simulations = db.query(func.count(Simulation.id)).scalar()
    total_flags = db.query(func.count(FeatureFlag.id)).scalar()

    return {
        "total_countries": total_countries,
        "total_users": total_users,
        "total_simulations": total_simulations,
        "feature_flags_count": total_flags
    }
