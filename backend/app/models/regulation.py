from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, Date, ARRAY, Index
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime, date


class Regulation(Base):
    """Current active regulations per country"""
    __tablename__ = "regulations"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(2), unique=True, index=True, nullable=False)
    country_name = Column(String(100), nullable=False)
    flag_emoji = Column(String(10))  # Country flag emoji (e.g., 🇺🇸, 🇫🇷)

    # Tax Rates (decimal 0-1, ex: 0.20 = 20%)
    cgt_short_rate = Column(Numeric(5, 4), nullable=False)  # Short-term capital gains (general)
    cgt_long_rate = Column(Numeric(5, 4), nullable=False)   # Long-term capital gains (general)

    # Crypto-specific tax rates (may differ from general CGT)
    crypto_short_rate = Column(Numeric(5, 4))  # Short-term crypto gains (<1 year)
    crypto_long_rate = Column(Numeric(5, 4))   # Long-term crypto gains (>1 year)
    crypto_notes = Column(Text)                 # Crypto-specific rules and conditions

    staking_rate = Column(Numeric(5, 4))                     # Staking rewards
    mining_rate = Column(Numeric(5, 4))                      # Mining income

    # Structured crypto tax metadata (from scraper IA)
    holding_period_months = Column(Integer)                  # Holding period for long-term (e.g., 12 for DE, PT)
    is_flat_tax = Column(Integer)                           # 1 if flat tax, 0 otherwise (e.g., BG, PL)
    is_progressive = Column(Integer)                        # 1 if progressive tax, 0 otherwise (e.g., DE, ES, GB)
    is_territorial = Column(Integer)                        # 1 if territorial taxation, 0 otherwise (e.g., PA)
    crypto_specific = Column(Integer)                       # 1 if has crypto-specific rules, 0 otherwise
    long_term_discount_pct = Column(Numeric(5, 2))         # Long-term discount % (e.g., 33 for IN, 50 for AU)
    exemption_threshold = Column(Numeric(12, 2))           # Exemption threshold amount
    exemption_threshold_currency = Column(String(3))        # Currency code (e.g., EUR, USD, GBP)

    # Rules
    nft_treatment = Column(String(50))  # "collectible", "capital_gain", etc
    residency_rule = Column(Text)        # Ex: "183 days or domicile test"
    treaty_countries = Column(ARRAY(String(2)))  # Countries with tax treaty
    defi_reporting = Column(Text)        # DeFi reporting requirements
    penalties_max = Column(String(200))   # Max penalties
    notes = Column(Text)

    # Metadata
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    source_url = Column(Text)
    data_sources = Column(ARRAY(String(50)))  # List of sources used (e.g., ["Tax Foundation", "KPMG", "Koinly"])
    data_quality = Column(String(20))  # "high", "medium", "low", "unknown"

    def to_dict(self):
        return {
            "country_code": self.country_code,
            "country_name": self.country_name,
            "flag_emoji": self.flag_emoji,
            "cgt_short_rate": float(self.cgt_short_rate) if self.cgt_short_rate else None,
            "cgt_long_rate": float(self.cgt_long_rate) if self.cgt_long_rate else None,
            "crypto_short_rate": float(self.crypto_short_rate) if self.crypto_short_rate else None,
            "crypto_long_rate": float(self.crypto_long_rate) if self.crypto_long_rate else None,
            "crypto_notes": self.crypto_notes,
            "staking_rate": float(self.staking_rate) if self.staking_rate else None,
            "mining_rate": float(self.mining_rate) if self.mining_rate else None,
            # Structured crypto tax metadata
            "holding_period_months": self.holding_period_months,
            "is_flat_tax": bool(self.is_flat_tax) if self.is_flat_tax is not None else None,
            "is_progressive": bool(self.is_progressive) if self.is_progressive is not None else None,
            "is_territorial": bool(self.is_territorial) if self.is_territorial is not None else None,
            "crypto_specific": bool(self.crypto_specific) if self.crypto_specific is not None else None,
            "long_term_discount_pct": float(self.long_term_discount_pct) if self.long_term_discount_pct else None,
            "exemption_threshold": float(self.exemption_threshold) if self.exemption_threshold else None,
            "exemption_threshold_currency": self.exemption_threshold_currency,
            "residency_rule": self.residency_rule,
            "treaty_countries": self.treaty_countries,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "notes": self.notes,
            "data_sources": self.data_sources,
            "data_quality": self.data_quality,
            "source_url": self.source_url
        }

    @property
    def is_stale(self) -> bool:
        """Data older than 90 days"""
        if not self.updated_at:
            return True
        return (datetime.now(self.updated_at.tzinfo) - self.updated_at).days > 90


class RegulationHistory(Base):
    """Historical versions of regulations for audit trail"""
    __tablename__ = "regulations_history"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(2), index=True, nullable=False)

    # Tax Rates (snapshot)
    cgt_short_rate = Column(Numeric(5, 4), nullable=False)
    cgt_long_rate = Column(Numeric(5, 4), nullable=False)
    staking_rate = Column(Numeric(5, 4))
    mining_rate = Column(Numeric(5, 4))
    nft_treatment = Column(String(50))
    residency_rule = Column(Text)
    treaty_countries = Column(ARRAY(String(2)))
    defi_reporting = Column(Text)
    penalties_max = Column(String(200))
    notes = Column(Text)

    # Validity Period
    valid_from = Column(Date, nullable=False)  # Inclusive
    valid_to = Column(Date, nullable=True)      # Exclusive (NULL = current)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    source_url = Column(Text)
    verified_by = Column(Integer, nullable=True)  # User ID who verified
    change_notes = Column(Text)  # Why changed

    __table_args__ = (
        Index('idx_country_valid_period', 'country_code', 'valid_from', 'valid_to'),
    )

    @staticmethod
    def get_at_date(db, country_code: str, target_date: date):
        """Get regulation version valid at specific date"""
        from sqlalchemy import or_, and_
        return db.query(RegulationHistory).filter(
            and_(
                RegulationHistory.country_code == country_code,
                RegulationHistory.valid_from <= target_date,
                or_(
                    RegulationHistory.valid_to > target_date,
                    RegulationHistory.valid_to == None
                )
            )
        ).first()
