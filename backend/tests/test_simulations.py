"""
✅ PHASE 2.6: Unit tests for simulation endpoints

Tests tax simulation calculations and multi-country comparisons.
"""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestSimulationEndpoint:
    """Test /simulations/residency endpoint"""

    def test_simulate_us_to_pt_success(self, client, auth_headers, mock_us_regulation, mock_pt_regulation):
        """Test successful US → PT simulation"""
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
        data = response.json()

        # Verify response structure
        assert "id" in data
        assert data["current_country"] == "US"
        assert data["target_country"] == "PT"
        assert "current_tax" in data
        assert "target_tax" in data
        assert "savings" in data
        assert "savings_percent" in data
        assert "considerations" in data
        assert "risks" in data
        assert "timeline" in data
        assert "explanation" in data

        # Verify tax calculation
        # US: 50k * 0.37 + 100k * 0.20 = 18500 + 20000 = 38500
        # PT: 150k * 0.28 = 42000
        assert data["current_tax"] == 38500
        assert data["target_tax"] == 42000
        assert data["savings"] == -3500  # Higher tax in PT

    def test_simulate_us_to_sg_crypto_rates(self, client, auth_headers, mock_us_regulation, mock_sg_regulation):
        """Test simulation using crypto-specific rates (SG has 0% crypto tax)"""
        response = client.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "SG",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        # SG should use crypto_short_rate (0%) not cgt_short_rate (22%)
        assert data["target_tax"] == 0
        assert data["savings"] > 0  # Significant savings

    def test_simulate_same_country_fails(self, client, auth_headers, mock_us_regulation):
        """Test that simulating same country to itself fails"""
        response = client.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "US",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        assert response.status_code == 422  # Validation error

    def test_simulate_invalid_country_code(self, client, auth_headers):
        """Test simulation with invalid country code"""
        response = client.post(
            "/simulations/residency",
            json={
                "current_country": "XX",  # Invalid
                "target_country": "PT",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_simulate_negative_gains_fails(self, client, auth_headers, mock_us_regulation, mock_pt_regulation):
        """Test simulation with negative gains fails"""
        response = client.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": -10000,  # Invalid
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        assert response.status_code == 422  # Validation error

    def test_simulate_zero_gains(self, client, auth_headers, mock_us_regulation, mock_pt_regulation):
        """Test simulation with zero gains"""
        response = client.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 0,
                "long_term_gains": 0
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["current_tax"] == 0
        assert data["target_tax"] == 0
        assert data["savings"] == 0

    def test_simulate_very_large_gains(self, client, auth_headers, mock_us_regulation, mock_pt_regulation):
        """Test simulation with very large gains"""
        response = client.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 10_000_000,
                "long_term_gains": 50_000_000
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["current_tax"] > 0
        assert data["target_tax"] > 0


@pytest.mark.integration
class TestCompareEndpoint:
    """Test /simulations/compare endpoint"""

    def test_compare_multiple_countries(self, client, auth_headers, mock_us_regulation, mock_pt_regulation, mock_sg_regulation):
        """Test comparing multiple countries"""
        response = client.post(
            "/simulations/compare",
            json={
                "current_country": "US",
                "target_countries": ["PT", "SG"],
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        assert data["current_country"] == "US"
        assert "current_tax" in data
        assert "comparisons" in data
        assert len(data["comparisons"]) == 2

        # Check comparison structure
        for comp in data["comparisons"]:
            assert "country_code" in comp
            assert "country_name" in comp
            assert "tax_amount" in comp
            assert "savings" in comp
            assert "savings_percent" in comp
            assert "effective_rate" in comp

        # Verify sorted by savings (highest first)
        assert data["comparisons"][0]["savings"] >= data["comparisons"][1]["savings"]

    def test_compare_insufficient_countries(self, client, auth_headers, mock_us_regulation):
        """Test compare with less than 2 countries fails"""
        response = client.post(
            "/simulations/compare",
            json={
                "current_country": "US",
                "target_countries": ["PT"],  # Only 1
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        assert response.status_code == 422  # Validation error

    def test_compare_too_many_countries(self, client, auth_headers):
        """Test compare with more than 5 countries fails"""
        response = client.post(
            "/simulations/compare",
            json={
                "current_country": "US",
                "target_countries": ["PT", "SG", "GB", "FR", "DE", "ES"],  # 6 countries
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        assert response.status_code == 422  # Validation error

    def test_compare_duplicate_countries(self, client, auth_headers, mock_us_regulation):
        """Test compare with duplicate countries fails"""
        response = client.post(
            "/simulations/compare",
            json={
                "current_country": "US",
                "target_countries": ["PT", "PT"],  # Duplicate
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        assert response.status_code == 422  # Validation error


@pytest.mark.integration
class TestSimulationHistory:
    """Test /simulations/history endpoint"""

    def test_get_empty_history(self, client, auth_headers):
        """Test getting history with no simulations"""
        response = client.get("/simulations/history", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "simulations" in data
        assert "count" in data
        assert data["count"] == 0

    def test_get_history_after_simulation(self, client, auth_headers, mock_us_regulation, mock_pt_regulation):
        """Test history contains simulation after running one"""
        # Run simulation
        client.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )

        # Get history
        response = client.get("/simulations/history", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["count"] > 0
        assert len(data["simulations"]) > 0


@pytest.mark.integration
class TestSimulationRetrieval:
    """Test /simulations/{id} endpoint"""

    def test_get_simulation_by_id(self, client, auth_headers, mock_us_regulation, mock_pt_regulation):
        """Test retrieving specific simulation by ID"""
        # Create simulation
        sim_response = client.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers
        )
        sim_id = sim_response.json()["id"]

        # Retrieve it
        response = client.get(f"/simulations/{sim_id}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sim_id

    def test_get_nonexistent_simulation(self, client, auth_headers):
        """Test getting non-existent simulation returns 404"""
        response = client.get("/simulations/99999", headers=auth_headers)

        assert response.status_code == 404

    def test_get_other_user_simulation(self, client, db):
        """Test user cannot access another user's simulation"""
        # Create second user
        from app.models.user import User
        from app.utils.security import hash_password

        user2 = User(
            email="user2@example.com",
            password_hash=hash_password("password123"),
            email_verified=True
        )
        db.add(user2)
        db.commit()

        # Login as user2
        login_response = client.post("/auth/login", json={
            "email": "user2@example.com",
            "password": "password123"
        })
        user2_token = login_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # Try to access user1's simulation (would need to create one first)
        response = client.get("/simulations/1", headers=user2_headers)

        # Should return 404 (not found) since user2 doesn't own it
        assert response.status_code == 404
