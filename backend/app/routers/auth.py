from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import hash_password, verify_password, create_access_token, verify_token
from app.middleware import limiter, get_rate_limit
from app.services.license_service import LicenseService
from app.services.email_service import EmailService
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import secrets
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user


@router.post("/register", response_model=UserResponse)
# @limiter.limit(get_rate_limit("auth_register"))  # Temporarily disabled due to slowapi compatibility issue
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new user"""

    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    hashed = hash_password(user_data.password)

    # Generate email verification token
    verification_token = secrets.token_urlsafe(32)

    new_user = User(
        email=user_data.email,
        password_hash=hashed,
        email_verified=False,
        verification_token=verification_token,
        verification_token_expires=datetime.utcnow() + timedelta(hours=24)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create FREE license for new user
    try:
        license_service = LicenseService(db)
        license_service.create_free_license(new_user.id)
        logger.info(f"Created FREE license for new user: {new_user.email}")
    except Exception as e:
        logger.error(f"Failed to create license for user {new_user.id}: {e}")
        # Don't fail registration if license creation fails

    # Send verification email
    try:
        email_service = EmailService()
        email_service.send_verification_email(
            to_email=new_user.email,
            verification_token=verification_token
        )
        logger.info(f"Verification email sent to {new_user.email}")
    except Exception as e:
        logger.error(f"Failed to send verification email to {new_user.email}: {e}")
        # Don't fail registration if email fails

    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        role=new_user.role.value
    )


@router.post("/login", response_model=Token)
# @limiter.limit(get_rate_limit("auth_login"))  # Temporarily disabled due to slowapi compatibility issue
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user"""

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
# @limiter.limit(get_rate_limit("read_only"))  # Temporarily disabled due to slowapi compatibility issue
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value
    )


@router.post("/forgot-password")
# @limiter.limit(get_rate_limit("auth_password_reset"))  # Temporarily disabled
async def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Request password reset

    Generates a reset token and sends email with reset link.
    Token expires in 1 hour.
    """
    # Find user
    user = db.query(User).filter(User.email == data.email).first()

    # Always return success to prevent email enumeration
    if not user:
        logger.info(f"Password reset requested for non-existent email: {data.email}")
        return {"message": "If that email exists, a password reset link has been sent"}

    # Generate reset token (secure random string)
    reset_token = secrets.token_urlsafe(32)

    # Set token and expiration (1 hour)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)

    db.commit()

    # Send email
    email_service = EmailService()
    email_sent = email_service.send_password_reset_email(
        to_email=user.email,
        reset_token=reset_token
    )

    if not email_sent:
        logger.error(f"Failed to send password reset email to {user.email}")
        # Don't reveal failure to user to prevent enumeration
    else:
        logger.info(f"Password reset email sent to {user.email}")

    return {"message": "If that email exists, a password reset link has been sent"}


@router.post("/reset-password")
# @limiter.limit(get_rate_limit("auth_password_reset"))  # Temporarily disabled
async def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password with token

    Verifies reset token and updates password.
    """
    # Find user by token
    user = db.query(User).filter(User.reset_token == data.token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Check if token expired
    if not user.reset_token_expires or datetime.utcnow() > user.reset_token_expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one"
        )

    # Validate new password
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )

    # Update password
    user.password_hash = hash_password(data.new_password)

    # Clear reset token
    user.reset_token = None
    user.reset_token_expires = None

    db.commit()

    logger.info(f"Password reset successful for user {user.email}")

    return {"message": "Password reset successful. You can now login with your new password"}


@router.post("/send-verification")
# @limiter.limit(get_rate_limit("auth_verify_email"))  # Temporarily disabled
async def send_verification_email(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resend verification email

    Allows users to request a new verification email if they didn't receive it
    or if the previous token expired.
    """
    # Check if already verified
    if current_user.email_verified:
        return {"message": "Email is already verified"}

    # Generate new verification token
    verification_token = secrets.token_urlsafe(32)

    # Update user
    current_user.verification_token = verification_token
    current_user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)

    db.commit()

    # Send email
    email_service = EmailService()
    email_sent = email_service.send_verification_email(
        to_email=current_user.email,
        verification_token=verification_token
    )

    if not email_sent:
        logger.error(f"Failed to send verification email to {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please try again later"
        )

    logger.info(f"Verification email resent to {current_user.email}")

    return {"message": "Verification email sent. Please check your inbox"}


@router.post("/verify-email")
# @limiter.limit(get_rate_limit("auth_verify_email"))  # Temporarily disabled
async def verify_email(
    data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    """
    Verify email with token

    Marks email as verified after token validation.
    """
    # Find user by verification token
    user = db.query(User).filter(User.verification_token == data.token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )

    # Check if already verified
    if user.email_verified:
        return {"message": "Email already verified"}

    # Check if token expired
    if not user.verification_token_expires or datetime.utcnow() > user.verification_token_expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please request a new one"
        )

    # Mark email as verified
    user.email_verified = True

    # Clear verification token
    user.verification_token = None
    user.verification_token_expires = None

    db.commit()

    logger.info(f"Email verified for user {user.email}")

    return {"message": "Email verified successfully! You can now access all features"}
