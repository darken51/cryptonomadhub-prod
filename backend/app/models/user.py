from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
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
    current_country = Column(String(2))  # ISO country code
    beta_tester = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # OAuth
    google_id = Column(String, nullable=True)
    linkedin_id = Column(String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role.value,
            "current_country": self.current_country,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
