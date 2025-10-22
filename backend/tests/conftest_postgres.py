"""
✅ BONUS 2: PostgreSQL-based test fixtures for integration tests

Uses real PostgreSQL database for tests that require Regulation model (ARRAY type).
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.regulation import Regulation
from app.utils.security import hash_password
from datetime import datetime
from decimal import Decimal
import os


# PostgreSQL test database
# From Docker: use "postgres" as host
# From local: use "localhost" as host
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://nomadcrypto:nomadcrypto123@postgres:5432/nomadcrypto"
)

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_postgres():
    """
    Create a fresh PostgreSQL database for each test.

    Supports all models including Regulation with ARRAY type.
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client_postgres(db_postgres):
    """
    FastAPI test client with PostgreSQL database.
    """
    def override_get_db():
        try:
            yield db_postgres
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user_postgres(db_postgres):
    """
    Create a test user in PostgreSQL.
    """
    user = User(
        email="test@example.com",
        password_hash=hash_password("testpassword123"),
        email_verified=True
    )
    db_postgres.add(user)
    db_postgres.commit()
    db_postgres.refresh(user)
    return user


@pytest.fixture
def auth_headers_postgres(client_postgres, test_user_postgres):
    """
    Get authentication headers for test user (PostgreSQL).
    """
    response = client_postgres.post("/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_us_regulation(db_postgres):
    """Mock US regulation (PostgreSQL with ARRAY support)"""
    reg = Regulation(
        country_code="US",
        country_name="United States",
        flag_emoji="🇺🇸",
        cgt_short_rate=Decimal("0.37"),
        cgt_long_rate=Decimal("0.20"),
        crypto_legal_status="legal",
        residency_rule="Citizenship-based taxation",
        defi_reporting="Required",
        treaty_countries=["GB", "FR", "DE", "PT"],  # ARRAY type
        data_sources=["IRS"],  # ARRAY type
        updated_at=datetime.utcnow()
    )
    db_postgres.add(reg)
    db_postgres.commit()
    db_postgres.refresh(reg)
    return reg


@pytest.fixture
def mock_pt_regulation(db_postgres):
    """Mock Portugal regulation (PostgreSQL)"""
    reg = Regulation(
        country_code="PT",
        country_name="Portugal",
        flag_emoji="🇵🇹",
        cgt_short_rate=Decimal("0.28"),
        cgt_long_rate=Decimal("0.28"),
        crypto_legal_status="legal",
        residency_rule="183 days per year",
        defi_reporting="Required",
        treaty_countries=["US", "ES", "FR"],
        data_sources=["Portuguese Tax Authority"],
        updated_at=datetime.utcnow()
    )
    db_postgres.add(reg)
    db_postgres.commit()
    db_postgres.refresh(reg)
    return reg


@pytest.fixture
def mock_sg_regulation(db_postgres):
    """Mock Singapore regulation with crypto-specific rates (PostgreSQL)"""
    reg = Regulation(
        country_code="SG",
        country_name="Singapore",
        flag_emoji="🇸🇬",
        cgt_short_rate=Decimal("0.22"),
        cgt_long_rate=Decimal("0.22"),
        crypto_short_rate=Decimal("0.00"),
        crypto_long_rate=Decimal("0.00"),
        crypto_legal_status="legal",
        residency_rule="183 days",
        defi_reporting="Voluntary",
        treaty_countries=["US", "GB"],
        data_sources=["IRAS"],
        updated_at=datetime.utcnow()
    )
    db_postgres.add(reg)
    db_postgres.commit()
    db_postgres.refresh(reg)
    return reg
