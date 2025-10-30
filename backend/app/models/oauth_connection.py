from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class OAuthConnection(Base):
    """
    OAuth provider connections (Google, GitHub, Twitter, etc.)
    Links external OAuth accounts to internal users
    """
    __tablename__ = "oauth_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Provider info
    provider = Column(String(50), nullable=False)  # 'google', 'github', 'twitter'
    provider_user_id = Column(String(255), nullable=False)  # Unique ID from provider
    email = Column(String(255), nullable=True)  # Email from OAuth provider

    # OAuth tokens
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship to User
    user = relationship("User", back_populates="oauth_connections")

    # Constraints
    __table_args__ = (
        # One provider per user (can't link same Google account twice)
        UniqueConstraint('user_id', 'provider', name='uq_oauth_user_provider'),

        # One provider user_id per provider (can't use same Google account for 2 users)
        UniqueConstraint('provider', 'provider_user_id', name='uq_oauth_provider_user'),

        # Indexes for faster lookups
        Index('ix_oauth_connections_user_id', 'user_id'),
        Index('ix_oauth_connections_provider', 'provider'),
    )
