import threading
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection, check_db_health
from app.routers import ml_router, catalog_router, media_router, product_router, market_router, profile_router
from app.ml.price_predictor import price_predictor
from app.ml.classifier import classifier

try:
    from scripts.download_models import download_classifier
except ImportError:
    download_classifier = None

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("KaarigarBackend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes MongoDB Atlas connection and ML models on startup."""
    logger.info("Initializing KaarigarAI ML & Persistence Backend...")
    
    # 1. Connect to MongoDB Atlas
    await connect_to_mongo()

    # 2. Trigger model download in background thread if needed
    if download_classifier:
        threading.Thread(target=download_classifier, daemon=True).start()

    logger.info("ML models and persistence layer ready for requests.")
    yield
    
    # Graceful shutdown
    logger.info("Shutting down KaarigarAI Backend...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered market linkage, smart cataloging, and persistent publishing engine for Indian artisans.",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

# Static file serving for processed media and enhanced images
app.mount("/temp", StaticFiles(directory=str(settings.TEMP_DIR)), name="temp")

# Mount Routers (both top-level and /v1 for mobile/web compatibility)
app.include_router(ml_router.router)
app.include_router(catalog_router.router)
app.include_router(media_router.router)
app.include_router(product_router.router)
app.include_router(market_router.router)
app.include_router(profile_router.router)

app.include_router(ml_router.router, prefix=settings.API_V1_STR)
app.include_router(catalog_router.router, prefix=settings.API_V1_STR)
app.include_router(media_router.router, prefix=settings.API_V1_STR)
app.include_router(product_router.router, prefix=settings.API_V1_STR)
app.include_router(market_router.router, prefix=settings.API_V1_STR)
app.include_router(profile_router.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
async def root():
    db_status = await check_db_health()
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "models_loaded": {
            "price_model": price_predictor._is_model_loaded,
            "classifier": classifier._is_loaded,
        },
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint exposing system and database connectivity status."""
    db_status = await check_db_health()
    return {
        "status": "ok",
        "database": db_status,
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }
