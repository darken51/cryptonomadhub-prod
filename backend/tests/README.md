# 🧪 Backend Tests

## Overview

Ce projet utilise **pytest** pour les tests backend avec deux types de tests:

1. **Tests unitaires** - Tests rapides sans dépendances externes (SQLite in-memory)
2. **Tests d'intégration** - Tests avec base PostgreSQL réelle

## Structure

```
tests/
├── conftest.py                    # Fixtures SQLite (auth tests)
├── conftest_postgres.py           # Fixtures PostgreSQL (simulation tests)
├── test_auth.py                   # Tests authentification (SQLite)
├── test_simulations.py            # Tests simulations basiques (SQLite)
├── test_simulations_integration.py # Tests simulations complètes (PostgreSQL)
└── test_tax_simulator.py          # Tests calculs taxes
```

## Lancer les tests

### Tests unitaires uniquement (rapides)
```bash
# Depuis le conteneur backend
docker compose exec backend pytest -m unit -v

# Ou tous les tests qui ne nécessitent pas PostgreSQL
docker compose exec backend pytest tests/test_auth.py -v
```

### Tests d'intégration (nécessitent PostgreSQL)
```bash
# Lancer tous les tests d'intégration
docker compose exec backend pytest -m integration -v

# Lancer un test spécifique
docker compose exec backend pytest tests/test_simulations_integration.py::TestSimulationEndpointIntegration::test_simulate_us_to_pt_success -v
```

### Tous les tests
```bash
docker compose exec backend pytest tests/ -v
```

### Avec couverture de code
```bash
docker compose exec backend pytest --cov=app --cov-report=html tests/
```

## Fixtures disponibles

### SQLite (tests unitaires)
- `db` - Session database SQLite in-memory
- `client` - TestClient FastAPI
- `test_user` - User de test
- `auth_headers` - Headers d'authentification

### PostgreSQL (tests d'intégration)
- `db_postgres` - Session database PostgreSQL
- `client_postgres` - TestClient avec PostgreSQL
- `test_user_postgres` - User de test (PostgreSQL)
- `auth_headers_postgres` - Headers d'authentification (PostgreSQL)
- `mock_us_regulation` - Regulation USA mockée
- `mock_pt_regulation` - Regulation Portugal mockée
- `mock_sg_regulation` - Regulation Singapore mockée

## Problèmes connus

### ARRAY type incompatibility
Le modèle `Regulation` utilise le type PostgreSQL `ARRAY` qui n'est pas supporté par SQLite.

**Solution**: Les tests qui nécessitent des regulations utilisent les fixtures PostgreSQL (`conftest_postgres.py`).

### Web3 plugin conflict
Pytest peut charger automatiquement le plugin web3 qui cause des erreurs.

**Solution**: Ajouté `-p no:web3` dans `pytest.ini` ou utiliser:
```bash
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 pytest tests/
```

## Écrire de nouveaux tests

### Test unitaire (SQLite)
```python
import pytest

@pytest.mark.unit
def test_something(client, test_user):
    # Test rapide sans regulations
    response = client.post("/endpoint", json={...})
    assert response.status_code == 200
```

### Test d'intégration (PostgreSQL)
```python
import pytest
from tests.conftest_postgres import (
    client_postgres,
    auth_headers_postgres,
    mock_us_regulation
)

@pytest.mark.integration
def test_simulation(client_postgres, auth_headers_postgres, mock_us_regulation):
    # Test avec regulations (nécessite PostgreSQL)
    response = client_postgres.post("/simulations/residency", ...)
    assert response.status_code == 200
```

## Configuration CI/CD

Pour les pipelines CI/CD, configurer:

```yaml
# GitHub Actions example
- name: Run unit tests
  run: pytest -m unit --tb=short

- name: Run integration tests
  run: pytest -m integration --tb=short
  env:
    TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
```
