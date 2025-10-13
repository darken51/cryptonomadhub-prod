"""
User Settings and Profile Management Endpoints

API routes for user profile, preferences, notifications, and account management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.utils.security import hash_password, verify_password
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["User Settings"])


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UpdatePreferencesRequest(BaseModel):
    default_currency: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None


class UpdateNotificationsRequest(BaseModel):
    email_notifications: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    product_updates: Optional[bool] = None


class ProfileResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    email_verified: bool
    created_at: str


@router.put("/profile")
async def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile information

    Allows users to update their full name and email address.
    If email is changed, verification will be required.
    """

    # Update full name
    if data.full_name is not None:
        current_user.full_name = data.full_name
        logger.info(f"User {current_user.id} updated full_name")

    # Update email (check for duplicates)
    if data.email is not None and data.email != current_user.email:
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        current_user.email = data.email
        # Reset email verification if email changed
        current_user.email_verified = False
        logger.info(f"User {current_user.id} changed email to {data.email}")

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "profile": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role.value
        }
    }


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user password

    Requires current password for verification.
    New password must be at least 8 characters long.
    """

    # Verify current password
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Validate new password
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )

    # Update password
    current_user.password_hash = hash_password(data.new_password)
    db.commit()

    logger.info(f"User {current_user.id} changed password")

    return {"message": "Password changed successfully"}


@router.put("/preferences")
async def update_preferences(
    data: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user preferences

    Allows users to customize their experience:
    - default_currency: Preferred currency for calculations (USD, EUR, BTC, etc.)
    - language: Interface language (en, fr, es, de, etc.)
    - theme: UI theme (light, dark, system)
    """

    # Get existing preferences or create new dict
    preferences = current_user.preferences or {}

    if data.default_currency is not None:
        preferences['default_currency'] = data.default_currency

    if data.language is not None:
        preferences['language'] = data.language

    if data.theme is not None:
        preferences['theme'] = data.theme

    # Save to database
    current_user.preferences = preferences
    db.commit()
    db.refresh(current_user)

    logger.info(f"User {current_user.id} updated preferences: {preferences}")

    return {
        "message": "Preferences saved successfully",
        "preferences": preferences
    }


@router.put("/notifications")
async def update_notifications(
    data: UpdateNotificationsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update notification preferences

    Allows users to control what emails they receive:
    - email_notifications: Important account and activity notifications
    - product_updates: New features and improvements
    - marketing_emails: Promotional content and tips
    """

    # Get existing notifications or create new dict
    notifications = current_user.notifications or {}

    if data.email_notifications is not None:
        notifications['email_notifications'] = data.email_notifications

    if data.product_updates is not None:
        notifications['product_updates'] = data.product_updates

    if data.marketing_emails is not None:
        notifications['marketing_emails'] = data.marketing_emails

    # Save to database
    current_user.notifications = notifications
    db.commit()
    db.refresh(current_user)

    logger.info(f"User {current_user.id} updated notification preferences: {notifications}")

    return {
        "message": "Notification preferences saved successfully",
        "notifications": notifications
    }


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user profile

    Returns complete profile information for the authenticated user.
    """

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "email_verified": current_user.email_verified,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }


@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete user account permanently

    ⚠️ WARNING: This action is irreversible!

    Deletes the user account and all associated data:
    - All simulations
    - All DeFi audits
    - All chat history
    - All user preferences

    The user will be logged out immediately after deletion.
    """

    user_id = current_user.id
    user_email = current_user.email

    # Delete user (cascade will handle related records)
    db.delete(current_user)
    db.commit()

    logger.warning(f"User account deleted: {user_id} ({user_email})")

    return {
        "message": "Account deleted successfully",
        "deleted_user_id": user_id
    }
