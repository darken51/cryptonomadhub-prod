from sqlalchemy import Column, Integer, String, Numeric, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Simulation(Base):
    """User tax simulations with regulation snapshots"""
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Simulation params
    current_country = Column(String(2), nullable=False)
    target_country = Column(String(2), nullable=False)
    capital_gains = Column(Numeric(15, 2))  # Projected gains amount

    # Results
    result_json = Column(JSON, nullable=False)  # Calculation results

    # CRITICAL: Snapshot of regulations used
    regulation_snapshot = Column(JSON, nullable=False)

    # Timestamps
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "current_country": self.current_country,
            "target_country": self.target_country,
            "capital_gains": float(self.capital_gains) if self.capital_gains else None,
            "result": self.result_json,
            "regulation_snapshot": self.regulation_snapshot,
            "calculated_at": self.calculated_at.isoformat() if self.calculated_at else None
        }
