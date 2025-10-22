from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database import engine, Base
from app.models import (
    User, Regulation, RegulationHistory, Simulation,
    FeatureFlag, AuditLog, DeFiProtocol, DeFiTransaction, DeFiAudit,
    License,
    CostBasisLot, CostBasisDisposal, UserCostBasisSettings, WashSaleViolation,
    WalletGroup, WalletGroupMember, InterWalletTransfer, ConsolidatedBalance,
    TaxOpportunity, TaxHarvestingTransaction, TaxOptimizationSettings,
    UserWallet, NFTTransaction, YieldPosition, YieldReward,
    DashboardActivity
)
from app.middleware import (
    limiter,
    rate_limit_exceeded_handler,
    setup_security_middleware
)
from app.monitoring import init_sentry
from app.error_handlers import register_error_handlers  # ✅ PHASE 2.7
import logging

logger = logging.getLogger(__name__)

# Initialize Sentry for error tracking (production only)
init_sentry()

app = FastAPI(
    title="NomadCrypto Hub API",
    description="Crypto tax optimization API for digital nomads",
    version="1.0.0"
)

# Add security middleware (HTTPS + security headers)
setup_security_middleware(app)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# ✅ PHASE 2.7: Register global error handlers
register_error_handlers(app)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    Base.metadata.create_all(bind=engine)

# CORS - Dynamic configuration based on environment
allowed_origins = settings.get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

@app.get("/")
async def root():
    return {
        "message": "NomadCrypto Hub API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/health"
    }


# Import routers
from app.routers import (
    auth, simulations, paddle_webhook, chat, admin, regulations,
    defi_audit, health, users, cost_basis, tax_optimizer, wallets, user_wallets,
    dashboard, wallet_portfolio
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(simulations.router)
app.include_router(paddle_webhook.router)
app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(regulations.router)
app.include_router(defi_audit.router)
app.include_router(cost_basis.router)
app.include_router(tax_optimizer.router)
app.include_router(wallets.router)
app.include_router(user_wallets.router)
app.include_router(wallet_portfolio.router)
