# 🚀 PLAN COMPLET - CORRECTIONS & AMÉLIORATIONS CRYPTONOMADHUB

**Date:** 19 octobre 2025
**Backup de référence:** `backups/*20251019-audit-prefixes*`
**État:** ✅ Mot de passe PostgreSQL changé → `KovzZT7GWsORr9_iy44jT42Qct-nKnPQrImPLFq5Yks`

---

## 📊 VERSIONS DÉPENDANCES (Vérifiées Octobre 2025)

### Backend Python
| Package | Actuel | Dernière | Action |
|---------|--------|----------|--------|
| FastAPI | 0.104.1 | **0.119.0** | ⬆️ UPDATE |
| Pydantic | 2.5.0 | **2.12.3** | ⬆️ UPDATE |
| SQLAlchemy | 2.0.23 | **2.0.44** | ⬆️ UPDATE |
| Uvicorn | 0.24.0 | **0.32.1** | ⬆️ UPDATE |
| Redis | 5.0.1 | **5.2.0** | ⬆️ UPDATE |
| Celery | 5.3.4 | 5.4.0 | ✅ OK |

### Frontend Node.js
| Package | Actuel | Dernière | Action |
|---------|--------|----------|--------|
| Next.js | 15.0.0 | **15.5.6** | ⬆️ UPDATE |
| React | 18.3.1 | 19.2.0 | ⚠️ Rester 18.x |
| lucide-react | 0.263.1 | **0.546.0** | ⬆️ UPDATE (283 versions!) |
| Recharts | 3.2.1 | **3.3.0** | ⬆️ UPDATE |
| TailwindCSS | 3.4.18 | 4.1.14 | ⚠️ Rester 3.x (v4 breaking) |

---

# 🔴 PHASE 1: SÉCURITÉ CRITIQUE (PRIORITÉ ABSOLUE)

## Tâche 1.1: Implémenter email verification obligatoire

**Fichier:** `backend/app/routers/auth.py:186`
**Temps:** 30 minutes
**Impact:** 🔴 CRITIQUE - Empêche spam/bots

### Code à modifier:

```python
# backend/app/routers/auth.py ligne 186

@router.post("/login", response_model=Token)
@limiter.limit(get_rate_limit("auth_login"))
async def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user"""

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ✅ AJOUTER CETTE VÉRIFICATION
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for the verification link.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )

    return Token(access_token=access_token, token_type="bearer")
```

### Test:
```bash
# Créer user non vérifié
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Tenter login → devrait retourner 403
curl -X POST http://localhost:8001/auth/login \
  -d "username=test@example.com&password=Test1234"
```

---

## Tâche 1.2: Corriger admin role check (enum vs string)

**Fichiers:** `backend/app/routers/admin.py` + tous endpoints admin
**Temps:** 20 minutes
**Impact:** 🔴 CRITIQUE - Bypass potentiel

### Fichiers à modifier:

```python
# backend/app/routers/admin.py

from app.models.user import User, UserRole  # ✅ Importer UserRole

async def get_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency to verify admin role"""

    # ❌ ANCIEN: if current_user.role != "admin":
    # ✅ NOUVEAU:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
```

### Chercher TOUTES les occurrences:

```bash
cd backend
grep -r "role.*==.*\"admin\"" app/routers/
grep -r "role.*!=.*\"admin\"" app/routers/

# Remplacer PARTOUT par UserRole.ADMIN
```

### Test unitaire:

```python
# backend/tests/test_admin.py (CRÉER)

import pytest
from app.models.user import User, UserRole
from app.routers.admin import get_admin_user
from fastapi import HTTPException

def test_regular_user_cannot_access_admin():
    """User normal ne peut pas accéder admin"""
    user = User(email="user@test.com", role=UserRole.USER)

    with pytest.raises(HTTPException) as exc:
        get_admin_user(user)

    assert exc.value.status_code == 403

def test_admin_can_access():
    """Admin peut accéder"""
    admin = User(email="admin@test.com", role=UserRole.ADMIN)
    result = get_admin_user(admin)
    assert result == admin
```

---

## Tâche 1.3: Réduire JWT expiration + Refresh tokens

**Fichiers:** `backend/app/config.py`, `backend/app/routers/auth.py`, `backend/app/models/user.py`
**Temps:** 2 heures
**Impact:** 🔴 CRITIQUE - Token volé = 24h de dégâts actuellement

### Étape 1: Config

```python
# backend/app/config.py

class Settings(BaseSettings):
    # JWT
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60  # ✅ 1440 → 60 (1 heure)
    JWT_REFRESH_EXPIRATION_DAYS: int = 7  # ✅ NOUVEAU
```

### Étape 2: Modèle User

```python
# backend/app/models/user.py

class User(Base):
    __tablename__ = "users"

    # ... champs existants ...

    # ✅ AJOUTER refresh tokens
    refresh_token: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    refresh_token_expires: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
```

### Étape 3: Migration DB

```bash
# Créer migration
docker exec nomadcrypto-backend alembic revision -m "add_refresh_tokens"
```

```python
# backend/alembic/versions/XXX_add_refresh_tokens.py

def upgrade():
    op.add_column('users', sa.Column('refresh_token', sa.String(500), nullable=True))
    op.add_column('users', sa.Column('refresh_token_expires', sa.DateTime(timezone=True), nullable=True))

def downgrade():
    op.drop_column('users', 'refresh_token_expires')
    op.drop_column('users', 'refresh_token')
```

```bash
# Appliquer
docker exec nomadcrypto-backend alembic upgrade head
```

### Étape 4: Endpoint login modifié

```python
# backend/app/routers/auth.py

import secrets
from datetime import timedelta

class TokenWithRefresh(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int

@router.post("/login", response_model=TokenWithRefresh)
async def login(...):
    """Login - retourne access + refresh tokens"""

    # ... validations ...

    # Access token (1h)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )

    # ✅ Refresh token (7 jours)
    refresh_token = secrets.token_urlsafe(64)
    user.refresh_token = refresh_token
    user.refresh_token_expires = datetime.utcnow() + timedelta(days=7)
    db.commit()

    return TokenWithRefresh(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=3600
    )
```

### Étape 5: Endpoint /auth/refresh

```python
# backend/app/routers/auth.py

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=TokenWithRefresh)
@limiter.limit(get_rate_limit("auth_login"))
async def refresh_token(
    request: Request,
    response: Response,
    data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token"""

    user = db.query(User).filter(User.refresh_token == data.refresh_token).first()

    if not user or not user.refresh_token_expires or datetime.utcnow() > user.refresh_token_expires:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Nouveau access token
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})

    # ✅ Rotation refresh token (sécurité)
    new_refresh_token = secrets.token_urlsafe(64)
    user.refresh_token = new_refresh_token
    user.refresh_token_expires = datetime.utcnow() + timedelta(days=7)
    db.commit()

    return TokenWithRefresh(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=3600
    )
```

### Étape 6: Frontend auto-refresh

```tsx
// frontend/components/providers/AuthProvider.tsx

useEffect(() => {
  if (!refreshToken) return

  // Refresh 5 min avant expiration
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refresh_token: refreshToken})
      })

      const data = await res.json()
      setToken(data.access_token)
      setRefreshToken(data.refresh_token)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('refreshToken', data.refresh_token)
    } catch {
      logout()
    }
  }, 55 * 60 * 1000) // 55 minutes

  return () => clearInterval(interval)
}, [refreshToken])
```

---

## Tâche 1.4: Hasher reset tokens avant stockage DB

**Fichiers:** `backend/app/models/user.py`, `backend/app/routers/auth.py`
**Temps:** 1 heure
**Impact:** 🟠 ÉLEVÉ - DB compromise = tous les reset tokens utilisables

### Étape 1: Helper functions

```python
# backend/app/utils/security.py

import hashlib

def hash_token(token: str) -> str:
    """Hash token avec SHA-256"""
    return hashlib.sha256(token.encode()).hexdigest()

def verify_token_hash(token: str, token_hash: str) -> bool:
    """Vérifier token contre hash"""
    return hash_token(token) == token_hash
```

### Étape 2: Migration modèle

```python
# backend/app/models/user.py

class User(Base):
    # ✅ RENOMMER pour clarté
    reset_token_hash: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    reset_token_expires: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    verification_token_hash: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    verification_token_expires: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
```

### Étape 3: Migration DB

```bash
docker exec nomadcrypto-backend alembic revision -m "hash_reset_tokens"
```

```python
# backend/alembic/versions/XXX_hash_reset_tokens.py

def upgrade():
    op.alter_column('users', 'reset_token', new_column_name='reset_token_hash')
    op.alter_column('users', 'verification_token', new_column_name='verification_token_hash')

    # Invalider tous tokens existants
    op.execute("UPDATE users SET reset_token_hash = NULL, verification_token_hash = NULL")

def downgrade():
    op.alter_column('users', 'reset_token_hash', new_column_name='reset_token')
    op.alter_column('users', 'verification_token_hash', new_column_name='verification_token')
```

### Étape 4: Forgot password

```python
# backend/app/routers/auth.py

from app.utils.security import hash_token

@router.post("/forgot-password")
async def forgot_password(...):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "If that email exists..."}

    # Token clair (envoyé par email)
    reset_token = secrets.token_urlsafe(32)

    # ✅ Stocker HASH
    user.reset_token_hash = hash_token(reset_token)
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    # Envoyer token clair par email
    email_service.send_password_reset_email(user.email, reset_token)

    return {"message": "..."}

@router.post("/reset-password")
async def reset_password(...):
    # ✅ Hasher et chercher
    token_hash = hash_token(data.token)
    user = db.query(User).filter(User.reset_token_hash == token_hash).first()

    if not user or not user.reset_token_expires or datetime.utcnow() > user.reset_token_expires:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Reset password
    user.password_hash = hash_password(data.new_password)
    user.reset_token_hash = None
    user.reset_token_expires = None
    db.commit()

    return {"message": "Password reset successful"}
```

---

## Tâche 1.5: Réduire rate limit DeFi audits

**Fichier:** `backend/app/middleware/rate_limit.py`
**Temps:** 5 minutes
**Impact:** 🟠 ÉLEVÉ - Coûts API externes

### Modification:

```python
# backend/app/middleware/rate_limit.py ligne 70

def get_rate_limit(endpoint_type: str) -> str:
    limits = {
        "auth_login": "5/minute,20/hour",
        "auth_register": "3/hour",
        "auth_password_reset": "3/hour",
        "auth_verify_email": "5/hour",
        "read_only": "100/minute,1000/hour",
        "write": "30/minute,200/hour",

        # ✅ MODIFIÉ: 10/min → 3/min, 30/hour → 10/hour
        "defi_audit": "3/minute,10/hour",

        "chat": "20/minute,100/hour",
        "simulation": "10/minute,50/hour",
    }
    return limits.get(endpoint_type, "60/minute,500/hour")
```

---

## Tâche 1.6: Ajouter Redis cache pour prix API

**Fichiers:** `backend/app/services/price_service.py`, `backend/app/database.py`
**Temps:** 1.5 heures
**Impact:** 🟠 ÉLEVÉ - Économie $$ + Performance

### Étape 1: Redis client

```python
# backend/app/database.py (ou créer app/cache.py)

import redis.asyncio as redis
from app.config import settings

redis_client: redis.Redis = None

async def get_redis():
    global redis_client
    if redis_client is None:
        redis_client = await redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    return redis_client

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
```

### Étape 2: PriceService avec cache

```python
# backend/app/services/price_service.py

from app.database import get_redis
from decimal import Decimal

class PriceService:
    def __init__(self, db: Session):
        self.db = db
        self.redis = None

    async def get_historical_price(
        self,
        token_symbol: str,
        timestamp: datetime,
        currency: str = "USD"
    ) -> Decimal:
        """Prix historique avec cache Redis"""

        if not self.redis:
            self.redis = await get_redis()

        # Clé cache
        date_str = timestamp.strftime("%Y-%m-%d")
        cache_key = f"price:{token_symbol}:{currency}:{date_str}"

        # ✅ Vérifier cache
        cached = await self.redis.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: {cache_key}")
            return Decimal(cached)

        logger.debug(f"Cache MISS: {cache_key}")

        # Fetch API
        price = await self._fetch_from_api(token_symbol, timestamp, currency)

        # ✅ Stocker cache
        # TTL: 7 jours si >24h, 1h si récent
        is_old = (datetime.utcnow() - timestamp).days > 1
        ttl = 7 * 24 * 3600 if is_old else 3600

        await self.redis.setex(cache_key, ttl, str(price))

        return price

    async def get_current_price(self, token_symbol: str, currency: str = "USD") -> Decimal:
        """Prix actuel avec cache 5 min"""

        if not self.redis:
            self.redis = await get_redis()

        cache_key = f"price:current:{token_symbol}:{currency}"

        cached = await self.redis.get(cache_key)
        if cached:
            return Decimal(cached)

        price = await self._fetch_current_price(token_symbol, currency)

        # Cache 5 minutes
        await self.redis.setex(cache_key, 300, str(price))

        return price
```

### Étape 3: Cleanup shutdown

```python
# backend/app/main.py

from app.database import close_redis

@app.on_event("shutdown")
async def shutdown_event():
    await close_redis()
```

### Test Redis:

```bash
# Vérifier cache
docker exec nomadcrypto-redis redis-cli KEYS "price:*"

# Voir prix caché
docker exec nomadcrypto-redis redis-cli GET "price:BTC:USD:2025-01-01"

# Stats
docker exec nomadcrypto-redis redis-cli INFO stats
```

---

# 🟡 PHASE 2: AMÉLIORATIONS IMPORTANTES

## Tâche 2.1: Mettre à jour dépendances backend

**Temps:** 30 minutes
**Impact:** 🟡 MOYEN - Sécurité + Features

### Modifications:

```txt
# backend/requirements.txt

# ✅ Mises à jour
fastapi==0.119.0          # 0.104.1 → 0.119.0
pydantic==2.12.3          # 2.5.0 → 2.12.3
pydantic-settings==2.7.0  # 2.1.0 → 2.7.0
sqlalchemy==2.0.44        # 2.0.23 → 2.0.44
uvicorn[standard]==0.32.1 # 0.24.0 → 0.32.1
redis==5.2.0              # 5.0.1 → 5.2.0
asyncpg==0.30.0           # 0.29.0 → 0.30.0
```

### Installation:

```bash
# Rebuild image
docker compose build backend

# Redémarrer
docker compose up -d backend

# Vérifier
curl http://localhost:8001/health
```

---

## Tâche 2.2: Mettre à jour dépendances frontend

**Temps:** 30 minutes
**Impact:** 🟡 MOYEN - 283 versions de retard lucide-react!

### Modifications:

```bash
cd frontend

# ✅ Updates safe (pas breaking changes)
npm install next@15.5.6
npm install lucide-react@0.546.0
npm install recharts@3.3.0
npm install framer-motion@latest

# ⚠️ NE PAS mettre à jour:
# - React 18 → 19 (trop récent)
# - TailwindCSS 3 → 4 (breaking changes majeurs)
```

### Rebuild:

```bash
docker compose build frontend
docker compose up -d frontend
```

---

## Tâche 2.3: Optimiser bundle frontend (code splitting)

**Temps:** 3 heures
**Impact:** 🟡 MOYEN - Performance UX

### Dynamic imports:

```tsx
// frontend/app/page.tsx

import dynamic from 'next/dynamic'

// ✅ Lazy load composants lourds
const WorldTaxMap = dynamic(() => import('@/components/WorldTaxMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-800 rounded-xl animate-pulse" />
})

const ComparisonTable = dynamic(() => import('@/components/ComparisonTable'))
const TestimonialCarousel = dynamic(() => import('@/components/TestimonialCarousel'))

export default function Home() {
  return (
    <div>
      {/* Hero chargé immédiatement */}
      <HeroSection />

      {/* Lazy loaded */}
      <WorldTaxMap />
      <ComparisonTable />
      <TestimonialCarousel />
    </div>
  )
}
```

### Analyser bundle:

```bash
cd frontend
npm install --save-dev @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
module.exports = withBundleAnalyzer(nextConfig)

# Analyser
ANALYZE=true npm run build
```

**Target:** Initial bundle < 200KB

---

## Tâche 2.4: Améliorer accessibilité (WCAG AA)

**Temps:** 4 heures
**Impact:** 🟡 MOYEN - UX + Légal

### ARIA labels:

```tsx
// frontend/app/auth/login/page.tsx

<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  aria-label={showPassword ? "Hide password" : "Show password"}  // ✅ AJOUTÉ
>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

### Contrast ratios:

```tsx
// frontend/app/dashboard/page.tsx

// ❌ AVANT: text-slate-400 sur bg-white/5 (ratio 3.2:1)
// ✅ APRÈS: text-slate-300 sur bg-white/10 (ratio 4.7:1)

<div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
  <div className="text-slate-300 mb-1">Total Value</div>
</div>
```

### Keyboard navigation:

```tsx
// frontend/components/WorldTaxMap.tsx

<svg
  role="img"
  aria-label="Interactive world tax map"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && focusedCountry) {
      router.push(`/countries/${focusedCountry}`)
    }
  }}
>
  {countries.map(country => (
    <g
      key={country.code}
      role="button"
      tabIndex={0}
      aria-label={`${country.name} - Tax rate: ${country.rate}%`}
      onFocus={() => setFocusedCountry(country.code)}
    >
      {/* SVG path */}
    </g>
  ))}
</svg>
```

---

## Tâche 2.5: Error boundaries React

**Temps:** 1 heure
**Impact:** 🟡 MOYEN - Stabilité

### Component:

```tsx
// frontend/components/ErrorBoundary.tsx

'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)

    // ✅ Envoyer à Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
          <div className="max-w-md bg-slate-800 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-400 mb-6">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Utilisation:

```tsx
// frontend/app/layout.tsx

import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

## Tâche 2.6: Tests unitaires (>70% coverage)

**Temps:** 8 heures
**Impact:** 🟡 MOYEN - Qualité + Maintenance

### Setup Pytest:

```bash
# backend/tests/conftest.py

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
```

### Tests auth:

```python
# backend/tests/routers/test_auth.py

def test_register_success(client):
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "Test1234"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_login_unverified_email(client, db):
    # Créer user non vérifié
    user = User(email="test@test.com", password_hash="hash", email_verified=False)
    db.add(user)
    db.commit()

    response = client.post("/auth/login", data={
        "username": "test@test.com",
        "password": "test"
    })

    assert response.status_code == 403
    assert "verify your email" in response.json()["detail"].lower()
```

### Run tests:

```bash
docker exec nomadcrypto-backend pytest
docker exec nomadcrypto-backend pytest --cov=app --cov-report=html

# Target: >70% coverage
```

---

## Tâche 2.7: Standardiser error handling

**Temps:** 2 heures
**Impact:** 🟡 MOYEN - DX + Debugging

### Custom exceptions:

```python
# backend/app/exceptions.py

class CryptoNomadHubException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class BlockchainAPIError(CryptoNomadHubException):
    def __init__(self, provider: str, message: str):
        super().__init__(f"Blockchain API error ({provider}): {message}", 502)

class TaxCalculationError(CryptoNomadHubException):
    def __init__(self, country: str, reason: str):
        super().__init__(f"Tax calculation failed for {country}: {reason}", 422)

class InsufficientDataError(CryptoNomadHubException):
    def __init__(self, resource: str):
        super().__init__(f"Insufficient data for {resource}", 400)
```

### Handler global:

```python
# backend/app/main.py

from app.exceptions import CryptoNomadHubException

@app.exception_handler(CryptoNomadHubException)
async def custom_exception_handler(request: Request, exc: CryptoNomadHubException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "path": str(request.url)
        }
    )
```

---

# 🟢 PHASE 3: AMÉLIORATIONS CONTINUES

## Tâche 3.1: Documenter API (docstrings)

**Temps:** 4 heures
**Impact:** 🟢 BAS - Maintenance

### Google Style:

```python
# backend/app/services/tax_simulator.py

class TaxSimulator:
    """
    Service de simulation fiscale crypto.

    Calcule taxes sur gains en capital selon réglementations
    de différentes juridictions.

    Example:
        >>> simulator = TaxSimulator(db)
        >>> result = simulator.simulate_residency(
        ...     current_country="FR",
        ...     target_country="PT",
        ...     crypto_gains=100000
        ... )
        >>> print(result.savings)
        28000.0
    """

    def simulate_residency(
        self,
        current_country: str,
        target_country: str,
        crypto_gains: Decimal,
        holding_period: int
    ) -> SimulationResult:
        """
        Simule changement résidence fiscale.

        Args:
            current_country: Code ISO-2 pays actuel (ex: "FR")
            target_country: Code ISO-2 pays cible (ex: "PT")
            crypto_gains: Gains en capital USD
            holding_period: Durée détention (jours)

        Returns:
            SimulationResult avec calculs et économies

        Raises:
            ValueError: Code pays invalide
            TaxCalculationError: Données manquantes

        Note:
            Informatif uniquement. Pas de conseil fiscal.
        """
        pass
```

---

## Tâche 3.2: Breadcrumbs navigation

**Temps:** 2 heures
**Impact:** 🟢 BAS - UX

```tsx
// frontend/components/Breadcrumb.tsx

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-600" />
            {i === items.length - 1 ? (
              <span className="text-white font-semibold">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-slate-400 hover:text-white">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

---

## Tâche 3.3: Monitoring Sentry

**Temps:** 1 heure
**Impact:** 🟢 BAS - Production monitoring

### Backend (déjà configuré):

```python
# backend/app/monitoring/__init__.py existe déjà

# Ajouter DSN dans .env:
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Frontend:

```bash
cd frontend
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

## Tâche 3.4: Standardiser design tokens

**Temps:** 2 heures
**Impact:** 🟢 BAS - Cohérence UI

```js
// frontend/tailwind.config.ts

const config = {
  theme: {
    extend: {
      colors: {
        brand: {
          violet: {
            light: '#a78bfa',
            DEFAULT: '#7c3aed',
            dark: '#5b21b6'
          },
          fuchsia: {
            light: '#f0abfc',
            DEFAULT: '#d946ef',
            dark: '#a21caf'
          }
        }
      },
      spacing: {
        'section': '5rem'  // Standardiser espacement sections
      }
    }
  }
}
```

---

# 📋 CHECKLIST FINALE PRODUCTION

## Sécurité ✅

- [x] Mot de passe PostgreSQL changé
- [ ] Email verification obligatoire
- [ ] Admin role check avec enum
- [ ] JWT 60 min + refresh tokens
- [ ] Reset tokens hashés
- [ ] Rate limits DeFi audits réduits
- [ ] Redis cache prix API
- [ ] HTTPS forcé (prod uniquement)

## Code Quality ✅

- [ ] Dépendances backend mises à jour
- [ ] Dépendances frontend mises à jour
- [ ] Bundle frontend < 200KB
- [ ] Tests coverage > 70%
- [ ] Error boundaries React
- [ ] Error handling standardisé
- [ ] Docstrings complètes

## UX ✅

- [ ] ARIA labels complets
- [ ] Contrast ratios WCAG AA
- [ ] Keyboard navigation
- [ ] Breadcrumbs ajoutés
- [ ] Messages d'erreur clairs

## Monitoring ✅

- [ ] Sentry configuré
- [ ] Logs structurés
- [ ] Health checks actifs

---

# ⏱️ ESTIMATION TEMPS TOTAL

| Phase | Temps | Difficulté |
|-------|-------|------------|
| **Phase 1** (Sécurité critique) | 6h | 🔴 Haute |
| **Phase 2** (Améliorations importantes) | 20h | 🟡 Moyenne |
| **Phase 3** (Améliorations continues) | 9h | 🟢 Basse |
| **TOTAL** | **35h** | - |

---

# 🚀 COMMANDES RAPIDES

### Vérifier état:

```bash
# Health check
curl http://localhost:8001/health

# DB connexion
docker exec nomadcrypto-postgres psql -U nomad -d nomadcrypto -c "SELECT version();"

# Redis cache
docker exec nomadcrypto-redis redis-cli KEYS "*"

# Services
docker ps
```

### Restaurer backup:

```bash
cat backups/RESTORE_INSTRUCTIONS_20251019.md
```

### Migrations:

```bash
# Créer migration
docker exec nomadcrypto-backend alembic revision -m "description"

# Appliquer
docker exec nomadcrypto-backend alembic upgrade head

# Rollback
docker exec nomadcrypto-backend alembic downgrade -1
```

### Tests:

```bash
# Backend
docker exec nomadcrypto-backend pytest --cov=app

# Frontend
cd frontend && npm test
```

---

**Plan créé le:** 19 octobre 2025
**Backup:** `backups/*20251019-audit-prefixes*`
**PostgreSQL password:** ✅ Changé → `KovzZT7GWsORr9_iy44jT42Qct-nKnPQrImPLFq5Yks`

**⚠️ IMPORTANT:** Ce plan est complet mais à adapter selon vos priorités business. Les corrections de sécurité Phase 1 sont **OBLIGATOIRES avant production**.
