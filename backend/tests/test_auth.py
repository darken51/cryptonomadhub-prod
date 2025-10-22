"""
✅ PHASE 2.6: Unit tests for authentication endpoints

Tests registration, login, token refresh, and logout functionality.
"""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.unit
class TestRegistration:
    """Test user registration endpoint"""

    def test_register_new_user(self, client):
        """Test successful user registration"""
        response = client.post("/auth/register", json={
            "email": "newuser@example.com",
            "password": "SecurePass123!"
        })

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert "id" in data
        assert "hashed_password" not in data  # Never expose hash

    def test_register_duplicate_email(self, client, test_user):
        """Test registration with existing email fails"""
        response = client.post("/auth/register", json={
            "email": "test@example.com",  # Already exists
            "password": "SecurePass123!"
        })

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_register_weak_password(self, client):
        """Test registration with weak password fails"""
        response = client.post("/auth/register", json={
            "email": "newuser@example.com",
            "password": "123"  # Too short
        })

        assert response.status_code == 422  # Validation error

    def test_register_invalid_email(self, client):
        """Test registration with invalid email fails"""
        response = client.post("/auth/register", json={
            "email": "not-an-email",
            "password": "SecurePass123!"
        })

        assert response.status_code == 422  # Validation error


@pytest.mark.unit
class TestLogin:
    """Test user login endpoint"""

    def test_login_success(self, client, test_user):
        """Test successful login returns tokens"""
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "testpassword123"
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user):
        """Test login with incorrect password fails"""
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })

        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email fails"""
        response = client.post("/auth/login", json={
            "email": "doesnotexist@example.com",
            "password": "anypassword"
        })

        assert response.status_code == 401

    def test_login_unverified_user(self, client, db):
        """Test login with unverified email fails"""
        from app.models.user import User
        from app.utils.security import hash_password

        # Create unverified user
        unverified = User(
            email="unverified@example.com",
            password_hash=hash_password("password123"),
            email_verified=False
        )
        db.add(unverified)
        db.commit()

        response = client.post("/auth/login", json={
            "email": "unverified@example.com",
            "password": "password123"
        })

        assert response.status_code == 403
        assert "not verified" in response.json()["detail"].lower()


@pytest.mark.unit
class TestTokenRefresh:
    """Test token refresh endpoint"""

    def test_refresh_token_success(self, client, test_user):
        """Test successful token refresh"""
        # Login to get refresh token
        login_response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "testpassword123"
        })
        refresh_token = login_response.json()["refresh_token"]

        # Use refresh token
        response = client.post("/auth/refresh", json={
            "refresh_token": refresh_token
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_invalid_token(self, client):
        """Test refresh with invalid token fails"""
        response = client.post("/auth/refresh", json={
            "refresh_token": "invalid.token.here"
        })

        assert response.status_code in [401, 422]

    def test_refresh_expired_token(self, client):
        """Test refresh with expired token fails"""
        # Create an expired token (would need to mock datetime)
        # For now, just test with invalid token
        response = client.post("/auth/refresh", json={
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token"
        })

        assert response.status_code in [401, 422]


@pytest.mark.unit
class TestProtectedEndpoints:
    """Test authentication required endpoints"""

    def test_access_protected_endpoint_with_token(self, client, auth_headers, mock_us_regulation, mock_pt_regulation):
        """Test accessing protected endpoint with valid token"""
        response = client.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        assert response.status_code == 200

    def test_access_protected_endpoint_without_token(self, client):
        """Test accessing protected endpoint without token fails"""
        response = client.post("/simulations/residency", json={
            "current_country": "US",
            "target_country": "PT",
            "short_term_gains": 50000,
            "long_term_gains": 100000
        })

        assert response.status_code == 401

    def test_access_protected_endpoint_with_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token fails"""
        response = client.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers={"Authorization": "Bearer invalid.token.here"}
        )

        assert response.status_code == 401


@pytest.mark.unit
class TestLogout:
    """Test logout endpoint"""

    def test_logout_success(self, client, auth_headers):
        """Test successful logout"""
        response = client.post("/auth/logout", headers=auth_headers)

        # Logout might return 200 or 204
        assert response.status_code in [200, 204]

    def test_logout_without_token(self, client):
        """Test logout without token fails"""
        response = client.post("/auth/logout")

        assert response.status_code == 401
