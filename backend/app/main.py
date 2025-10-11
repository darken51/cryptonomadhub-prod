from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="NomadCrypto Hub API",
    description="Crypto tax optimization API for digital nomads",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "NomadCrypto Hub API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# TODO: Import routers here
# from app.routers import auth, simulations, paddle_webhook
# app.include_router(auth.router)
# app.include_router(simulations.router)
# app.include_router(paddle_webhook.router)
