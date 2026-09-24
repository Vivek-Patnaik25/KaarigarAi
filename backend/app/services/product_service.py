import os
import time
import random
import string
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Set
from app.core.config import settings
from app.db.mongodb import get_database
from app.db.collections import PRODUCTS_COLLECTION
from app.models.schemas import ProductDocument, ProductListingPublishRequest
from app.services.image_storage_service import image_storage_service, extract_gridfs_file_id

logger = logging.getLogger("ProductService")

def generate_unique_product_id() -> str:
    """Generates a clean permanent public product ID in format KRG-XXXXXX."""
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=6))
    return f"KRG-{suffix}"

class ProductService:
    @staticmethod
    async def create_or_publish_product(
        payload: ProductListingPublishRequest,
        base_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Validates, prepares, and persists a product into MongoDB with unique permanent ID.
        Also marks associated GridFS images as published.
        """
        db = get_database()
        if db is None:
            raise RuntimeError("MongoDB connection is unavailable. Cannot persist product.")

        now_iso = datetime.now(timezone.utc).isoformat()
        
        # 1. Generate unique product_id with collision checking
        products_coll = db[PRODUCTS_COLLECTION]
        product_id = generate_unique_product_id()
        for _ in range(5):
            existing = await products_coll.find_one({"product_id": product_id})
            if not existing:
                break
            product_id = generate_unique_product_id()

        # 2. Extract and sanitize fields
        raw_listing = payload.listing or {}
        raw_ai = payload.ai_metadata or {}
        raw_source = payload.source or {}

        # Resolve primary title
        title = payload.title or raw_listing.get("title_hi") or raw_listing.get("title_en") or "हस्तनिर्मित उत्पाद"
        # Resolve primary description
        description = payload.description or raw_listing.get("description_hi") or raw_listing.get("description_en") or ""
        # Resolve category
        category = payload.category or raw_ai.get("category") or "pottery_terracotta"
        # Resolve price
        price = payload.price or raw_ai.get("price_suggested") or 1939
        # Resolve tags
        tags = payload.tags or raw_listing.get("seo_tags") or ["handmade", "traditional", "artisan"]

        # Ensure listing object is well-formed
        listing_obj = {
            "title_en": raw_listing.get("title_en") or title,
            "title_hi": raw_listing.get("title_hi") or title,
            "description_en": raw_listing.get("description_en") or description,
            "description_hi": raw_listing.get("description_hi") or description,
            "description_regional": raw_listing.get("description_regional") or "",
            "seo_tags": tags,
            "craft_tradition": raw_listing.get("craft_tradition"),
            "material_detected": raw_listing.get("material_detected"),
        }

        # Ensure AI metadata is well-formed
        ai_metadata_obj = {
            "category": category,
            "category_confidence": float(raw_ai.get("category_confidence", 0.90)),
            "detected_language": payload.language or raw_ai.get("detected_language", "hi"),
            "language_confidence": float(raw_ai.get("language_confidence", 1.0)),
            "image_quality_score": float(raw_ai.get("image_quality_score", 0.85)),
            "price_min": int(raw_ai.get("price_min", round((raw_ai.get("price_suggested") or price) * 0.80))),
            "price_suggested": int(raw_ai.get("price_suggested") or price),
            "price_max": int(raw_ai.get("price_max", round((raw_ai.get("price_suggested") or price) * 1.25))),
            "price_reasoning": raw_ai.get("price_reasoning", "उचित बाज़ार मूल्य अनुमान"),
        }

        # Source metadata
        source_obj = {
            "transcript": raw_source.get("transcript", ""),
            "original_filename": raw_source.get("original_filename"),
            "detected_language": payload.language or raw_source.get("detected_language", "hi"),
        }

        # Construct public URL based on FRONTEND_PUBLIC_URL configuration
        frontend_base = settings.FRONTEND_PUBLIC_URL.rstrip("/")
        public_url = f"{frontend_base}/p/{product_id}"

        # Image references
        image_url = payload.image_url or ""
        images_bundle = {}
        if image_url:
            images_bundle["enhanced"] = {
                "url": image_url,
                "content_type": "image/jpeg",
            }

        # Mark image in GridFS as published
        gridfs_file_id = extract_gridfs_file_id(image_url)
        if gridfs_file_id:
            await image_storage_service.mark_image_as_published(gridfs_file_id, product_id)

        status = payload.status or "published"
        if status == "active":
            status = "published"
            
        published_at = now_iso if status == "published" else None

        product_doc = {
            "product_id": product_id,
            "artisan_id": payload.artisan_id or "KG-2024-8921",
            "status": status,
            "title": title,
            "description": description,
            "category": category,
            "price": int(price),
            "tags": tags,
            "image_url": image_url,
            "listing": listing_obj,
            "ai_metadata": ai_metadata_obj,
            "source": source_obj,
            "images": images_bundle,
            "public_url": public_url,
            "created_at": now_iso,
            "updated_at": now_iso,
            "published_at": published_at,
        }

        # Insert into MongoDB
        result = await products_coll.insert_one(product_doc)
        logger.info(f"Product persisted in MongoDB: {product_id} (Mongo _id: {result.inserted_id})")

        return {
            "success": True,
            "product_id": product_id,
            "status": status,
            "public_url": public_url,
            "published_at": published_at,
            "message": "Product published successfully to KarigaarAI",
        }

    @staticmethod
    async def get_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves clean public product data from MongoDB by product_id.
        """
        db = get_database()
        if db is None:
            return None

        doc = await db[PRODUCTS_COLLECTION].find_one({"product_id": product_id})
        if not doc:
            return None

        # Remove internal MongoDB ObjectId for clean JSON
        doc.pop("_id", None)
        return doc

    @staticmethod
    async def get_my_listings(
        artisan_id: str = "KG-2024-8921",
        status: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves artisan's product listings sorted by created_at descending.
        Normalizes status filtering so 'active' and 'published' match seamlessly.
        """
        db = get_database()
        if db is None:
            return []

        query: Dict[str, Any] = {"artisan_id": artisan_id}
        if status:
            norm_status = status.lower().strip()
            if norm_status in ("active", "published"):
                query["status"] = {"$in": ["active", "published"]}
            else:
                query["status"] = norm_status

        cursor = db[PRODUCTS_COLLECTION].find(query).sort("created_at", -1).limit(limit)
        listings = []
        async for doc in cursor:
            doc.pop("_id", None)
            listings.append(doc)

        return listings

    @staticmethod
    async def update_product_status(product_id: str, new_status: str) -> bool:
        """
        Updates product status ('published', 'draft', 'sold', 'archived').
        Normalizes 'active' to 'published'.
        """
        db = get_database()
        if db is None:
            return False

        norm_status = "published" if new_status.lower() == "active" else new_status.lower()
        now_iso = datetime.now(timezone.utc).isoformat()
        update_fields = {"status": norm_status, "updated_at": now_iso}
        if norm_status == "published":
            update_fields["published_at"] = now_iso

        res = await db[PRODUCTS_COLLECTION].update_one(
            {"product_id": product_id},
            {"$set": update_fields}
        )
        return res.modified_count > 0

    @staticmethod
    async def delete_product(product_id: str) -> bool:
        """
        Removes a product listing and deletes all associated images from MongoDB GridFS.
        """
        db = get_database()
        if db is None:
            return False

        # 1. Fetch product document to locate all image references
        doc = await db[PRODUCTS_COLLECTION].find_one({"product_id": product_id})
        if not doc:
            return False

        file_ids_to_delete: Set[str] = set()

        # Extract from main image_url
        if doc.get("image_url"):
            fid = extract_gridfs_file_id(doc["image_url"])
            if fid:
                file_ids_to_delete.add(fid)

        if doc.get("image_gridfs_id"):
            fid = extract_gridfs_file_id(doc["image_gridfs_id"])
            if fid:
                file_ids_to_delete.add(fid)

        # Extract from images dictionary
        images_dict = doc.get("images") or {}
        for key, val in images_dict.items():
            if isinstance(val, dict):
                url = val.get("url")
                fid = extract_gridfs_file_id(url)
                if fid:
                    file_ids_to_delete.add(fid)
                if val.get("file_id"):
                    file_ids_to_delete.add(str(val["file_id"]))
            elif isinstance(val, str):
                fid = extract_gridfs_file_id(val)
                if fid:
                    file_ids_to_delete.add(fid)

        # Query GridFS files tagged with this product_id
        try:
            async for fdoc in db["fs.files"].find({"metadata.product_id": product_id}, {"_id": 1}):
                file_ids_to_delete.add(str(fdoc["_id"]))
        except Exception as e:
            logger.warning(f"Error querying GridFS files for product {product_id}: {e}")

        # 2. Delete each image from GridFS
        for fid in file_ids_to_delete:
            await image_storage_service.delete_image(fid)

        # 3. Delete product document from MongoDB collection
        res = await db[PRODUCTS_COLLECTION].delete_one({"product_id": product_id})
        logger.info(f"Product {product_id} deleted with {len(file_ids_to_delete)} GridFS image(s) cleaned up.")
        return res.deleted_count > 0

product_service = ProductService()
