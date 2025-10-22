from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import hash_password, verify_password, create_access_token, verify_token, create_refresh_token, verify_refresh_token, hash_token, verify_hashed_token
from app.middleware import limiter, get_rate_limit
from app.services.license_service import LicenseService
from app.services.email_service import EmailService
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, timedelta
import secrets
import logging
import re

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Password (8-128 characters)")

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password must be at most 128 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    full_name: str | None = None


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str  # ✅ PHASE 1.3: Ajout refresh token


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=32, max_length=256, description="Password reset token")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password must be at most 128 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., min_length=32, max_length=256, description="Email verification token")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=32, max_length=256, description="Refresh token")


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
@limiter.limit(get_rate_limit("auth_register"))
async def register(
    request: Request,
    response: Response,
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
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

    # ✅ PHASE 1.4: Generate and hash email verification token
    verification_token = secrets.token_urlsafe(32)
    hashed_verification_token = hash_token(verification_token)

    new_user = User(
        email=user_data.email,
        password_hash=hashed,
        email_verified=False,
        verification_token=hashed_verification_token,
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

    # Send verification email with plain token
    try:
        email_service = EmailService()
        email_service.send_verification_email(
            to_email=new_user.email,
            verification_token=verification_token  # Send plain token, not hash
        )
        logger.info(f"Verification email sent to {new_user.email}")
    except Exception as e:
        logger.error(f"Failed to send verification email to {new_user.email}: {e}")
        # Don't fail registration if email fails

    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        role=new_user.role.value,
        full_name=new_user.full_name
    )


@router.post("/login", response_model=Token)
@limiter.limit(get_rate_limit("auth_login"))
async def login(
    request: Request,
    response: Response,
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

    # ✅ PHASE 1.1: Vérifier email vérifié
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for the verification link.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ✅ PHASE 1.3: Create access token (60 min) + refresh token (7 days)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )

    # Generate and store refresh token
    refresh_token = create_refresh_token()
    user.refresh_token = refresh_token
    user.refresh_token_expires = datetime.utcnow() + timedelta(days=7)
    db.commit()

    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=Token)
@limiter.limit(get_rate_limit("auth_login"))
async def refresh_access_token(
    request: Request,
    response: Response,
    data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token

    Returns new access token and refresh token if refresh token is valid.
    """
    # Find user by refresh token
    user = db.query(User).filter(User.refresh_token == data.refresh_token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify refresh token is valid and not expired
    if not verify_refresh_token(data.refresh_token, user.refresh_token, user.refresh_token_expires):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )

    # Generate new refresh token (rotation)
    new_refresh_token = create_refresh_token()
    user.refresh_token = new_refresh_token
    user.refresh_token_expires = datetime.utcnow() + timedelta(days=7)
    db.commit()

    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=new_refresh_token
    )


@router.get("/me", response_model=UserResponse)
@limiter.limit(get_rate_limit("read_only"))
async def get_me(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user)
):
    """Get current user info"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        full_name=current_user.full_name
    )


@router.post("/forgot-password")
@limiter.limit(get_rate_limit("auth_password_reset"))
async def forgot_password(
    request: Request,
    response: Response,
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

    # ✅ PHASE 1.4: Generate reset token and hash it
    reset_token = secrets.token_urlsafe(32)
    hashed_reset_token = hash_token(reset_token)

    # Set hashed token and expiration (1 hour)
    user.reset_token = hashed_reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)

    db.commit()

    # Send email with plain token (user needs it to reset)
    email_service = EmailService()
    email_sent = email_service.send_password_reset_email(
        to_email=user.email,
        reset_token=reset_token  # Send plain token, not hash
    )

    if not email_sent:
        logger.error(f"Failed to send password reset email to {user.email}")
        # Don't reveal failure to user to prevent enumeration
    else:
        logger.info(f"Password reset email sent to {user.email}")

    return {"message": "If that email exists, a password reset link has been sent"}


@router.post("/reset-password")
@limiter.limit(get_rate_limit("auth_password_reset"))
async def reset_password(
    request: Request,
    response: Response,
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password with token

    Verifies reset token and updates password.
    """
    # ✅ PHASE 1.4: Hash the provided token to compare with stored hash
    hashed_token = hash_token(data.token)

    # Find user by hashed token
    user = db.query(User).filter(User.reset_token == hashed_token).first()

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
@limiter.limit(get_rate_limit("auth_verify_email"))
async def send_verification_email(
    request: Request,
    response: Response,
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

    # ✅ PHASE 1.4: Generate and hash new verification token
    verification_token = secrets.token_urlsafe(32)
    hashed_verification_token = hash_token(verification_token)

    # Update user with hashed token
    current_user.verification_token = hashed_verification_token
    current_user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)

    db.commit()

    # Send email with plain token
    email_service = EmailService()
    email_sent = email_service.send_verification_email(
        to_email=current_user.email,
        verification_token=verification_token  # Send plain token, not hash
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
@limiter.limit(get_rate_limit("auth_verify_email"))
async def verify_email(
    request: Request,
    response: Response,
    data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    """
    Verify email with token

    Marks email as verified after token validation.
    """
    # ✅ PHASE 1.4: Hash the provided token to compare with stored hash
    hashed_token = hash_token(data.token)

    # Find user by hashed verification token
    user = db.query(User).filter(User.verification_token == hashed_token).first()

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
