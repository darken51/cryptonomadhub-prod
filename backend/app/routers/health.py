"""
Health Check Endpoints

Provides comprehensive health checks for:
- Application status
- Database connectivity
- Redis connectivity
- Ollama availability
"""

from fastapi import APIRouter, Depends, status as http_status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import settings
from datetime import datetime
import redis
import httpx
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Basic health check

    Returns 200 if application is running.
    Used by Docker healthcheck and load balancers.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT
    }


@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """
    Detailed health check with all dependencies

    Checks:
    - Application status
    - Database connectivity
    - Redis connectivity
    - Ollama availability

    Returns:
    - 200 if all checks pass
    - 503 if any critical check fails
    """
    checks = {
        "application": {"status": "healthy", "message": "Application running"},
        "database": await check_database(db),
        "redis": await check_redis(),
        "ollama": await check_ollama(),
    }

    # Determine overall status
    # Critical: database, redis
    # Non-critical: ollama (can run without it)
    critical_services = ["database", "redis"]
    all_critical_healthy = all(
        checks[service]["status"] == "healthy"
        for service in critical_services
    )

    overall_status = "healthy" if all_critical_healthy else "unhealthy"
    status_code = http_status.HTTP_200_OK if all_critical_healthy else http_status.HTTP_503_SERVICE_UNAVAILABLE

    response = {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT,
        "checks": checks
    }

    return response


@router.get("/health/readiness")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Kubernetes readiness probe

    Checks if the application is ready to receive traffic.
    Only checks critical services (DB, Redis).

    Returns:
    - 200 if ready
    - 503 if not ready
    """
    db_check = await check_database(db)
    redis_check = await check_redis()

    ready = (
        db_check["status"] == "healthy" and
        redis_check["status"] == "healthy"
    )

    status_code = http_status.HTTP_200_OK if ready else http_status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "ready": ready,
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": db_check,
            "redis": redis_check
        }
    }


@router.get("/health/liveness")
async def liveness_check():
    """
    Kubernetes liveness probe

    Checks if the application is alive and should not be restarted.
    Simple check - just returns 200 if the process is running.

    Returns:
    - 200 if alive
    """
    return {
        "alive": True,
        "timestamp": datetime.utcnow().isoformat()
    }


# ========================================
# Individual service checks
# ========================================

async def check_database(db: Session) -> dict:
    """Check PostgreSQL database connectivity"""
    try:
        # Execute simple query
        result = db.execute(text("SELECT 1"))
        row = result.fetchone()

        if row and row[0] == 1:
            return {
                "status": "healthy",
                "message": "Database connection successful",
                "response_time_ms": "<10"
            }
        else:
            return {
                "status": "unhealthy",
                "message": "Database query returned unexpected result"
            }

    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}"
        }


async def check_redis() -> dict:
    """Check Redis connectivity"""
    try:
        # Connect to Redis
        r = redis.from_url(settings.REDIS_URL, socket_timeout=5)

        # Ping Redis
        r.ping()

        # Try set/get operation
        test_key = "health_check_test"
        r.set(test_key, "ok", ex=10)  # Expires in 10 seconds
        value = r.get(test_key)

        if value == b"ok":
            return {
                "status": "healthy",
                "message": "Redis connection successful",
                "response_time_ms": "<10"
            }
        else:
            return {
                "status": "unhealthy",
                "message": "Redis set/get operation failed"
            }

    except redis.ConnectionError as e:
        logger.error(f"Redis health check failed: {e}")
        return {
            "status": "unhealthy",
            "message": f"Redis connection failed: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return {
            "status": "unhealthy",
            "message": f"Redis error: {str(e)}"
        }


async def check_ollama() -> dict:
    """Check Ollama availability (non-critical)"""
    try:
        # Make HTTP request to Ollama
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.OLLAMA_HOST}/api/tags")

            if response.status_code == 200:
                return {
                    "status": "healthy",
                    "message": "Ollama is available",
                    "response_time_ms": "<100"
                }
            else:
                return {
                    "status": "degraded",
                    "message": f"Ollama returned status {response.status_code}",
                    "critical": False
                }

    except httpx.TimeoutException:
        logger.warning("Ollama health check timed out")
        return {
            "status": "degraded",
            "message": "Ollama request timed out (service may be slow)",
            "critical": False
        }
    except Exception as e:
        logger.warning(f"Ollama health check failed: {e}")
        return {
            "status": "degraded",
            "message": f"Ollama unavailable: {str(e)}",
            "critical": False
        }
