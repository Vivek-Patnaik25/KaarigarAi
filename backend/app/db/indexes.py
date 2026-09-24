import logging
from pymongo import ASCENDING, DESCENDING
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.collections import (
    PRODUCTS_COLLECTION,
    BUYER_REQUIREMENTS_COLLECTION,
    INQUIRIES_COLLECTION,
)

logger = logging.getLogger("DatabaseIndexes")

async def create_db_indexes(db: AsyncIOMotorDatabase) -> None:
    """
    Creates necessary indexes for high-frequency queries and uniqueness constraints across all collections.
    """
    try:
        # 1. Products Collection Indexes
        products = db[PRODUCTS_COLLECTION]
        await products.create_index(
            [("product_id", ASCENDING)],
            unique=True,
            name="idx_product_id_unique"
        )
        await products.create_index(
            [("status", ASCENDING)],
            name="idx_status"
        )
        await products.create_index(
            [("artisan_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_artisan_created_at"
        )
        await products.create_index(
            [("category", ASCENDING)],
            name="idx_category"
        )
        await products.create_index(
            [("published_at", DESCENDING)],
            name="idx_published_at"
        )

        # 2. Buyer Requirements Collection Indexes
        buyers = db[BUYER_REQUIREMENTS_COLLECTION]
        await buyers.create_index(
            [("buyer_id", ASCENDING)],
            unique=True,
            name="idx_buyer_id_unique"
        )
        await buyers.create_index(
            [("status", ASCENDING)],
            name="idx_buyer_status"
        )
        await buyers.create_index(
            [("categories", ASCENDING)],
            name="idx_buyer_categories"
        )
        await buyers.create_index(
            [("buyer_type", ASCENDING)],
            name="idx_buyer_type"
        )

        # 3. Inquiries Collection Indexes
        inquiries = db[INQUIRIES_COLLECTION]
        await inquiries.create_index(
            [("inquiry_id", ASCENDING)],
            unique=True,
            name="idx_inquiry_id_unique"
        )
        await inquiries.create_index(
            [("product_id", ASCENDING)],
            name="idx_inquiry_product_id"
        )
        await inquiries.create_index(
            [("buyer_id", ASCENDING)],
            name="idx_inquiry_buyer_id"
        )
        await inquiries.create_index(
            [("created_at", DESCENDING)],
            name="idx_inquiry_created_at"
        )

        logger.info("MongoDB indexes for Products, Buyers, and Inquiries verified successfully.")
    except Exception as e:
        logger.warning(f"Warning during MongoDB index creation: {e}")
