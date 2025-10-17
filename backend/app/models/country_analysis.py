from sqlalchemy import Column, Integer, String, Text, DateTime, ARRAY, ForeignKey, Numeric, Boolean, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime

class CountryAnalysis(Base):
    """AI-generated country analysis with crypto and nomad scores"""
    __tablename__ = "country_analyses"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(2), ForeignKey('regulations.country_code', ondelete='CASCADE'), unique=True, nullable=False)

    # Overall Scores (0-100)
    crypto_score = Column(Integer, nullable=False)
    nomad_score = Column(Integer, nullable=False)
    # overall_score is GENERATED ALWAYS column, don't include in model

    # Detailed Analyses
    crypto_analysis = Column(Text, nullable=False)
    nomad_analysis = Column(Text, nullable=False)

    # Key Points (arrays)
    key_advantages = Column(ARRAY(Text))
    key_disadvantages = Column(ARRAY(Text))
    best_for = Column(ARRAY(Text))

    # Score Breakdowns (JSONB)
    crypto_score_breakdown = Column(JSONB, nullable=False)
    nomad_score_breakdown = Column(JSONB, nullable=False)

    # Generation Metadata
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), server_default=text("NOW() + INTERVAL '30 days'"), nullable=False)
    model_used = Column(String(50), nullable=False, default='claude-3-5-sonnet-20241022')
    generation_duration_ms = Column(Integer)
    confidence = Column(Numeric(3, 2), nullable=False, default=0.80)

    # Audit Trail
    last_refreshed_by = Column(Integer, ForeignKey('users.id'))
    auto_generated = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def to_dict(self):
        """Convert to dictionary for API response"""
        # Get overall_score from database
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            from sqlalchemy import text as sql_text
            result = db.execute(
                sql_text("SELECT overall_score FROM country_analyses WHERE id = :id"),
                {"id": self.id}
            ).fetchone()
            overall_score = result[0] if result else (self.crypto_score + self.nomad_score) // 2
        finally:
            db.close()

        return {
            "id": self.id,
            "country_code": self.country_code,
            "crypto_score": self.crypto_score,
            "nomad_score": self.nomad_score,
            "overall_score": overall_score,
            "crypto_analysis": self.crypto_analysis,
            "nomad_analysis": self.nomad_analysis,
            "key_advantages": self.key_advantages or [],
            "key_disadvantages": self.key_disadvantages or [],
            "best_for": self.best_for or [],
            "crypto_score_breakdown": self.crypto_score_breakdown,
            "nomad_score_breakdown": self.nomad_score_breakdown,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "model_used": self.model_used,
            "generation_duration_ms": self.generation_duration_ms,
            "confidence": float(self.confidence) if self.confidence else 0.8,
            "auto_generated": self.auto_generated,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @property
    def is_expired(self) -> bool:
        """Check if analysis has expired and needs refresh"""
        if not self.expires_at:
            return True
        return datetime.now(self.expires_at.tzinfo) > self.expires_at

    @property
    def days_until_expiry(self) -> int:
        """Days remaining before auto-refresh"""
        if not self.expires_at:
            return 0
        delta = self.expires_at - datetime.now(self.expires_at.tzinfo)
        return max(0, delta.days)
