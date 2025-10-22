from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    BETA_TESTER = "beta_tester"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)

    # Profile
    full_name = Column(String, nullable=True)
    current_country = Column(String(2))  # ISO country code
    beta_tester = Column(Boolean, default=False)

    # User Preferences (JSON)
    preferences = Column(JSON, nullable=True)  # {default_currency, language, theme}
    notifications = Column(JSON, nullable=True)  # {email_notifications, marketing_emails, product_updates}

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # OAuth
    google_id = Column(String, nullable=True)
    linkedin_id = Column(String, nullable=True)

    # Password reset
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

    # Email verification
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expires = Column(DateTime(timezone=True), nullable=True)

    # ✅ PHASE 1.3: Refresh tokens
    refresh_token = Column(String, nullable=True)
    refresh_token_expires = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    license = relationship("License", back_populates="user", uselist=False, cascade="all, delete-orphan")
    wallets = relationship("UserWallet", back_populates="user", cascade="all, delete-orphan")
    wallet_snapshots = relationship("WalletSnapshot", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role.value,
            "current_country": self.current_country,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
