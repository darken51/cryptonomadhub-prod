"""
✅ BONUS 2: Integration tests for simulations with PostgreSQL

Tests that require Regulation model (ARRAY type) use PostgreSQL fixtures.

Run with:
    pytest tests/test_simulations_integration.py -v --tb=short
"""

import pytest
from tests.conftest_postgres import (
    db_postgres,
    client_postgres,
    test_user_postgres,
    auth_headers_postgres,
    mock_us_regulation,
    mock_pt_regulation,
    mock_sg_regulation
)


@pytest.mark.integration
class TestSimulationEndpointIntegration:
    """Test /simulations/residency endpoint with PostgreSQL"""

    def test_simulate_us_to_pt_success(
        self,
        client_postgres,
        auth_headers_postgres,
        mock_us_regulation,
        mock_pt_regulation
    ):
        """Test successful US → PT simulation"""
        response = client_postgres.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers_postgres
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
        # PT: 50k * 0.28 + 100k * 0.28 = 14000 + 28000 = 42000
        assert data["current_tax"] == 38500
        assert data["target_tax"] == 42000
        assert data["savings"] == -3500  # Higher tax in PT

    def test_simulate_us_to_sg_crypto_rates(
        self,
        client_postgres,
        auth_headers_postgres,
        mock_us_regulation,
        mock_sg_regulation
    ):
        """Test simulation using crypto-specific rates (SG has 0% crypto tax)"""
        response = client_postgres.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "SG",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers_postgres
        )

        assert response.status_code == 200
        data = response.json()

        # SG should use crypto_short_rate (0%) not cgt_short_rate (22%)
        assert data["target_tax"] == 0
        assert data["savings"] == 38500  # Full US tax saved
        assert data["savings_percent"] > 99  # ~100% savings

    def test_simulate_invalid_country_code(
        self,
        client_postgres,
        auth_headers_postgres
    ):
        """Test simulation with invalid country code"""
        response = client_postgres.post(
            "/simulations/residency",
            json={
                "current_country": "XX",  # Invalid
                "target_country": "PT",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers_postgres
        )

        assert response.status_code == 404

    def test_simulate_zero_gains(
        self,
        client_postgres,
        auth_headers_postgres,
        mock_us_regulation,
        mock_pt_regulation
    ):
        """Test simulation with zero gains"""
        response = client_postgres.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 0,
                "long_term_gains": 0
            },
            headers=auth_headers_postgres
        )

        assert response.status_code == 200
        data = response.json()
        assert data["current_tax"] == 0
        assert data["target_tax"] == 0
        assert data["savings"] == 0


@pytest.mark.integration
class TestCompareEndpointIntegration:
    """Test /simulations/compare endpoint with PostgreSQL"""

    def test_compare_multiple_countries(
        self,
        client_postgres,
        auth_headers_postgres,
        mock_us_regulation,
        mock_pt_regulation,
        mock_sg_regulation
    ):
        """Test comparing multiple countries"""
        response = client_postgres.post(
            "/simulations/compare",
            json={
                "current_country": "US",
                "target_countries": ["PT", "SG"],
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers_postgres
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
        # SG has 0% tax, so it should be first
        assert data["comparisons"][0]["country_code"] == "SG"
        assert data["comparisons"][0]["tax_amount"] == 0


@pytest.mark.integration
class TestSimulationHistoryIntegration:
    """Test /simulations/history endpoint with PostgreSQL"""

    def test_get_history_after_simulation(
        self,
        client_postgres,
        auth_headers_postgres,
        mock_us_regulation,
        mock_pt_regulation
    ):
        """Test history contains simulation after running one"""
        # Run simulation
        client_postgres.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers_postgres
        )

        # Get history
        response = client_postgres.get(
            "/simulations/history",
            headers=auth_headers_postgres
        )

        assert response.status_code == 200
        data = response.json()
        assert data["count"] > 0
        assert len(data["simulations"]) > 0

        # Verify first simulation details
        sim = data["simulations"][0]
        assert sim["current_country"] == "US"
        assert sim["target_country"] == "PT"


@pytest.mark.integration
class TestSimulationRetrievalIntegration:
    """Test /simulations/{id} endpoint with PostgreSQL"""

    def test_get_simulation_by_id(
        self,
        client_postgres,
        auth_headers_postgres,
        mock_us_regulation,
        mock_pt_regulation
    ):
        """Test retrieving specific simulation by ID"""
        # Create simulation
        sim_response = client_postgres.post(
            "/simulations/residency",
            json={
                "current_country": "US",
                "target_country": "PT",
                "short_term_gains": 50000,
                "long_term_gains": 100000
            },
            headers=auth_headers_postgres
        )
        sim_id = sim_response.json()["id"]

        # Retrieve it
        response = client_postgres.get(
            f"/simulations/{sim_id}",
            headers=auth_headers_postgres
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sim_id

    def test_get_nonexistent_simulation(
        self,
        client_postgres,
        auth_headers_postgres
    ):
        """Test getting non-existent simulation returns 404"""
        response = client_postgres.get(
            "/simulations/99999",
            headers=auth_headers_postgres
        )

        assert response.status_code == 404
