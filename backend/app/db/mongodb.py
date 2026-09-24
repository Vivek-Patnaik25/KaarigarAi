import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorGridFSBucket
from app.core.config import settings
from app.db.indexes import create_db_indexes

logger = logging.getLogger("MongoDB")

class MongoDBManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    fs: Optional[AsyncIOMotorGridFSBucket] = None
    is_connected: bool = False

db_manager = MongoDBManager()

async def connect_to_mongo() -> None:
    """
    Initializes async MongoDB Atlas connection and sets up GridFS bucket & indexes.
    """
    if not settings.MONGODB_URI:
        logger.warning("MONGODB_URI is not set in environment. Running in offline/unconnected mode.")
        db_manager.is_connected = False
        return

    try:
        logger.info("Connecting to MongoDB Atlas...")
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=20,
            minPoolSize=2
        )
        db_manager.db = db_manager.client[settings.MONGODB_DATABASE]
        db_manager.fs = AsyncIOMotorGridFSBucket(db_manager.db)
        
        # Verify connection by pinging
        await db_manager.db.command("ping")
        db_manager.is_connected = True
        logger.info(f"Connected to MongoDB Atlas database: '{settings.MONGODB_DATABASE}'")

        # Create/verify indexes
        await create_db_indexes(db_manager.db)

    except Exception as e:
        logger.error(f"Failed to connect to MongoDB Atlas: {e}")
        db_manager.is_connected = False

async def close_mongo_connection() -> None:
    """
    Closes the MongoDB connection gracefully on application shutdown.
    """
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        db_manager.is_connected = False
        logger.info("MongoDB connection closed.")

def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Returns the active Motor database instance or None."""
    return db_manager.db if db_manager.is_connected else None

def get_gridfs() -> Optional[AsyncIOMotorGridFSBucket]:
    """Returns the active GridFS bucket instance or None."""
    return db_manager.fs if db_manager.is_connected else None

async def check_db_health() -> str:
    """Checks database responsiveness and returns 'connected' or 'disconnected'."""
    if not db_manager.is_connected or db_manager.db is None:
        return "disconnected"
    try:
        await db_manager.db.command("ping")
        return "connected"
    except Exception:
        return "disconnected"
