from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.config import settings
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


# ✅ PHASE 1.3: Refresh tokens
def create_refresh_token() -> str:
    """Create a secure random refresh token"""
    return secrets.token_urlsafe(32)


def verify_refresh_token(token: str, stored_token: str, expires: datetime) -> bool:
    """Verify refresh token is valid and not expired"""
    if not token or not stored_token:
        return False

    # Check token matches
    if token != stored_token:
        return False

    # Check not expired
    if not expires or datetime.utcnow() > expires:
        return False

    return True


# ✅ PHASE 1.4: Hash reset and verification tokens
import hashlib


def hash_token(token: str) -> str:
    """Hash a token using SHA-256 for secure storage"""
    return hashlib.sha256(token.encode()).hexdigest()


def verify_hashed_token(plain_token: str, hashed_token: str) -> bool:
    """Verify a plain token against its hash"""
    return hash_token(plain_token) == hashed_token
