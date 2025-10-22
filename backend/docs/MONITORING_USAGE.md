# 📊 Monitoring & Performance Tracking

## Overview

Le système de monitoring utilise **Sentry** pour:
- ✅ Error tracking (exceptions, crashes)
- ✅ Performance monitoring (latency, throughput)
- ✅ Custom metrics (business KPIs)
- ✅ User context tracking

## Configuration

### Variables d'environnement

```bash
# .env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
ENVIRONMENT=production  # ou staging, development
```

### Initialisation automatique

Le monitoring est initialisé automatiquement au démarrage de l'application (`app/main.py`).

## Utilisation

### 1. Contexte Manager - Monitor Performance

Pour mesurer la performance d'une opération:

```python
from app.monitoring import monitor_performance

async def calculate_complex_tax(data):
    with monitor_performance("tax_calculation", {"country": data.country}):
        # Code à mesurer
        result = perform_calculation(data)
        return result
```

**Résultat**: Transaction Sentry avec durée, tags, et statut.

### 2. Decorator - Monitor Endpoint

Pour monitorer automatiquement un endpoint:

```python
from fastapi import APIRouter
from app.monitoring import monitor_endpoint

router = APIRouter()

@router.get("/health")
@monitor_endpoint
async def health_check():
    return {"status": "healthy"}
```

**Résultat**: Chaque requête est tracée avec latency et success count.

### 3. Métriques Custom

Pour tracker des KPIs business:

```python
from app.monitoring import track_metric

# Track count
track_metric("simulations_created", 1, "count", {"country": "US"})

# Track latency
track_metric("api_latency", 0.250, "second", {"endpoint": "/simulations"})

# Track volume
track_metric("data_processed", 1024, "byte", {"operation": "import"})
```

### 4. User Context

Pour associer erreurs à des utilisateurs:

```python
from app.monitoring import set_user_context

async def my_endpoint(current_user: User = Depends(get_current_user)):
    # Set context for this request
    set_user_context(current_user.id, current_user.email)

    # Any errors will now include user ID
    perform_operation()
```

### 5. Messages Custom

Pour logger des événements importants:

```python
from app.monitoring import capture_message

# Info message
capture_message("User upgraded to premium", "info", {"user_id": 123})

# Warning
capture_message(
    "High value transaction detected",
    "warning",
    {"amount": 1000000, "user_id": 456}
)
```

### 6. Performance Tracker (Class-based)

Pour des opérations complexes multi-étapes:

```python
from app.monitoring import PerformanceTracker

async def complex_simulation(data):
    tracker = PerformanceTracker("full_simulation_pipeline")
    tracker.start()

    try:
        # Étape 1
        step1_result = await fetch_data()

        # Étape 2
        step2_result = await process_data(step1_result)

        # Étape 3
        final_result = await save_results(step2_result)

        # Arrêter le tracking avec metrics
        tracker.stop(
            tags={"user_id": data.user_id, "country": data.country},
            measurements={"records_processed": len(final_result)}
        )

        return final_result

    except Exception as e:
        tracker.stop(tags={"error": str(e)})
        raise
```

## Exemples d'intégration

### Endpoint de Simulation

```python
from fastapi import APIRouter, Depends
from app.monitoring import monitor_performance, track_metric, set_user_context

router = APIRouter()

@router.post("/simulations/residency")
async def simulate_residency_change(
    simulation_request: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Set user context for error tracking
    set_user_context(current_user.id)

    # Monitor performance
    with monitor_performance(
        "tax_simulation",
        {
            "current_country": simulation_request.current_country,
            "target_country": simulation_request.target_country,
        }
    ):
        # Run simulation
        simulator = TaxSimulator(db)
        result, explanation = await simulator.simulate_residency_change(
            user_id=current_user.id,
            current_country=simulation_request.current_country,
            target_country=simulation_request.target_country,
            short_term_gains=simulation_request.short_term_gains,
            long_term_gains=simulation_request.long_term_gains
        )

        # Track business metric
        track_metric(
            "simulations_created",
            1,
            "count",
            {
                "current_country": simulation_request.current_country,
                "target_country": simulation_request.target_country,
            }
        )

        # Track savings amount
        track_metric(
            "potential_savings",
            result.savings,
            "none",
            {"country_pair": f"{simulation_request.current_country}-{simulation_request.target_country}"}
        )

        return result
```

### Service avec Performance Tracking

```python
from app.monitoring import PerformanceTracker

class TaxSimulator:
    async def simulate_residency_change(self, ...):
        tracker = PerformanceTracker("tax_simulation_full")
        tracker.start()

        # Étape 1: Fetch regulations
        current_reg = self.get_regulation(current_country)
        target_reg = self.get_regulation(target_country)

        # Étape 2: Calculate taxes
        current_tax = self.calculate_tax(current_reg, gains)
        target_tax = self.calculate_tax(target_reg, gains)

        # Étape 3: Generate explanation (AI)
        explanation = await self.generate_explanation(...)

        # Stop tracking
        tracker.stop(
            tags={
                "current_country": current_country,
                "target_country": target_country,
                "user_id": user_id
            },
            measurements={
                "current_tax": current_tax,
                "target_tax": target_tax,
                "savings": current_tax - target_tax
            }
        )

        return result
```

## Métriques recommandées

### Métriques business
- `simulations_created` (count) - Nombre de simulations
- `potential_savings` (USD) - Économies potentielles
- `users_registered` (count) - Nouveaux utilisateurs
- `premium_upgrades` (count) - Upgrades premium

### Métriques techniques
- `api_latency` (second) - Latence des APIs
- `db_query_duration` (second) - Durée des requêtes DB
- `cache_hit_rate` (percentage) - Taux de cache hit
- `external_api_errors` (count) - Erreurs API externes

### Métriques de qualité
- `ai_confidence_score` (percentage) - Score de confiance IA
- `data_freshness_days` (days) - Fraîcheur des données
- `validation_errors` (count) - Erreurs de validation

## Dashboard Sentry

Une fois configuré, vous verrez dans Sentry:

1. **Performance** → Transactions
   - Latency par endpoint
   - Throughput (req/s)
   - Apdex score

2. **Performance** → Custom Metrics
   - Simulations créées
   - Savings moyens
   - Taux d'erreur

3. **Issues** → Errors
   - Stack traces
   - User context
   - Fréquence

## Best Practices

1. **Ne pas monitorer les credentials**
   - ✅ Filtrage automatique des passwords/tokens
   - ✅ Voir `filter_sensitive_data()` dans `monitoring.py`

2. **Utiliser des tags pertinents**
   ```python
   # ✅ Good
   track_metric("api_call", 1, "count", {"endpoint": "/simulations", "status": "200"})

   # ❌ Bad
   track_metric("api_call", 1, "count")
   ```

3. **Sampling approprié**
   - Production: 10% (configuré dans `init_sentry()`)
   - Staging: 50%
   - Development: Désactivé

4. **Nommer clairement les opérations**
   ```python
   # ✅ Good
   with monitor_performance("tax_simulation_us_to_pt"):

   # ❌ Bad
   with monitor_performance("operation"):
   ```

## Troubleshooting

### Sentry n'envoie pas de données

1. Vérifier `SENTRY_DSN` dans `.env`
2. Vérifier `ENVIRONMENT != "development"`
3. Vérifier les logs: `grep "Sentry" backend.log`

### Performance overhead

- Sampling à 10% = overhead minimal (<1%)
- Context managers optimisés
- Async compatible

### Privacy compliance

- Emails redacted automatiquement
- Pas de PII dans les messages
- Filtre `filter_sensitive_data()` actif
