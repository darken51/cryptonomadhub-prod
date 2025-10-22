"""
✅ PHASE 2.6: Shared test fixtures and configuration
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.regulation import Regulation
from app.utils.security import hash_password
from datetime import datetime
from decimal import Decimal


# Test database (in-memory SQLite)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """
    Create a fresh database for each test.

    Uses in-memory SQLite for fast test execution.
    Only creates tables that are SQLite-compatible (excludes regulations with ARRAY type).
    """
    from app.models.user import User  # Import to ensure table is registered
    from app.models.simulation import Simulation

    # Create only the tables we need for tests (skip regulations due to ARRAY incompatibility)
    User.__table__.create(bind=engine, checkfirst=True)
    Simulation.__table__.create(bind=engine, checkfirst=True)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up
        User.__table__.drop(bind=engine, checkfirst=True)
        Simulation.__table__.drop(bind=engine, checkfirst=True)


@pytest.fixture(scope="function")
def client(db):
    """
    FastAPI test client with overridden database dependency.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """
    Create a test user for authenticated requests.

    Returns:
        User: Test user with email/password
    """
    user = User(
        email="test@example.com",
        password_hash=hash_password("testpassword123"),
        email_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """
    Get authentication headers for test user.

    Returns:
        dict: Headers with Bearer token
    """
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# NOTE: Regulation fixtures commented out because ARRAY type is incompatible with SQLite
# Integration tests that need regulations should use a real PostgreSQL database
# or mock the regulation service responses directly
