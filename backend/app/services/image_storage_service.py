import io
import re
import time
import mimetypes
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Dict, Any, Union, List, Set
from bson import ObjectId
from app.db.mongodb import get_gridfs, get_database

logger = logging.getLogger("ImageStorageService")

def extract_gridfs_file_id(url_or_id: Optional[str]) -> Optional[str]:
    """Extracts a 24-character hex MongoDB ObjectId from a URL or raw string ID."""
    if not url_or_id or not isinstance(url_or_id, str):
        return None
    match = re.search(r'([0-9a-fA-F]{24})', url_or_id)
    if match:
        return match.group(1)
    return None

class ImageStorageService:
    @staticmethod
    async def store_image(
        image_data: Union[bytes, io.BytesIO],
        filename: str = "product_image.jpg",
        content_type: str = "image/jpeg",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Stores image bytes in MongoDB GridFS bucket and returns image reference dict.
        """
        fs = get_gridfs()
        if fs is None:
            logger.warning("GridFS is unavailable. Skipping GridFS image persistence.")
            return None

        try:
            if isinstance(image_data, io.BytesIO):
                raw_bytes = image_data.getvalue()
            else:
                raw_bytes = image_data

            if not content_type or content_type == "application/octet-stream":
                guessed, _ = mimetypes.guess_type(filename)
                content_type = guessed or "image/jpeg"

            custom_metadata = metadata or {}
            custom_metadata["content_type"] = content_type
            if "created_at" not in custom_metadata:
                custom_metadata["created_at"] = datetime.now(timezone.utc).isoformat()
            if "created_at_ts" not in custom_metadata:
                custom_metadata["created_at_ts"] = time.time()

            # Upload to GridFS
            file_id = await fs.upload_from_stream(
                filename=filename,
                source=raw_bytes,
                metadata=custom_metadata,
            )

            file_id_str = str(file_id)
            logger.info(f"Image stored in GridFS with file_id: {file_id_str} ({len(raw_bytes)} bytes)")

            return {
                "file_id": file_id_str,
                "filename": filename,
                "content_type": content_type,
                "url": f"/v1/media/{file_id_str}",
                "size_bytes": len(raw_bytes),
            }
        except Exception as e:
            logger.error(f"Failed to store image in GridFS: {e}")
            return None

    @staticmethod
    async def get_image(file_id_str: str) -> Optional[Tuple[bytes, str, str]]:
        """
        Retrieves image bytes, filename, and content_type from GridFS given a file_id string.
        """
        fs = get_gridfs()
        if fs is None:
            return None

        try:
            oid = ObjectId(file_id_str)
            grid_out = await fs.open_download_stream(oid)
            raw_bytes = await grid_out.read()
            filename = grid_out.filename or "image.jpg"
            content_type = "image/jpeg"
            if grid_out.metadata and "content_type" in grid_out.metadata:
                content_type = grid_out.metadata["content_type"]
            else:
                guessed, _ = mimetypes.guess_type(filename)
                content_type = guessed or "image/jpeg"

            return raw_bytes, filename, content_type
        except Exception as e:
            logger.warning(f"Error reading image {file_id_str} from GridFS: {e}")
            return None

    @staticmethod
    async def get_image_metadata(file_id_str: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves file metadata from GridFS fs.files collection.
        """
        db = get_database()
        if db is None or not file_id_str:
            return None
        try:
            clean_id = extract_gridfs_file_id(file_id_str) or file_id_str
            oid = ObjectId(clean_id)
            doc = await db["fs.files"].find_one({"_id": oid})
            if not doc:
                return None
            return {
                "file_id": str(doc["_id"]),
                "filename": doc.get("filename", "image.jpg"),
                "size_bytes": doc.get("length", 0),
                "content_type": (doc.get("metadata") or {}).get("content_type", "image/jpeg"),
                "upload_date": doc.get("uploadDate").isoformat() if doc.get("uploadDate") else None,
                "metadata": doc.get("metadata", {}),
            }
        except Exception as e:
            logger.warning(f"Error fetching image metadata for {file_id_str}: {e}")
            return None

    @staticmethod
    async def delete_image(file_id_str: str) -> bool:
        """
        Deletes an image file and its chunks from MongoDB GridFS bucket.
        """
        fs = get_gridfs()
        if fs is None or not file_id_str:
            return False

        try:
            clean_id = extract_gridfs_file_id(file_id_str) or file_id_str
            oid = ObjectId(clean_id)
            await fs.delete(oid)
            logger.info(f"Deleted image {clean_id} from GridFS")
            return True
        except Exception as e:
            logger.warning(f"Failed to delete image {file_id_str} from GridFS: {e}")
            return False

    @staticmethod
    async def mark_image_as_published(file_id_str: str, product_id: str) -> bool:
        """
        Updates metadata of a GridFS image to mark it as published and linked to product_id.
        """
        db = get_database()
        if db is None or not file_id_str:
            return False

        try:
            clean_id = extract_gridfs_file_id(file_id_str) or file_id_str
            oid = ObjectId(clean_id)
            res = await db["fs.files"].update_one(
                {"_id": oid},
                {"$set": {
                    "metadata.status": "published",
                    "metadata.stage": "published",
                    "metadata.product_id": product_id,
                    "metadata.published_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            return res.modified_count > 0
        except Exception as e:
            logger.warning(f"Failed to mark image {file_id_str} as published: {e}")
            return False

    @staticmethod
    async def cleanup_abandoned_previews(max_age_seconds: int = 43200) -> int:
        """
        Finds and purges preview images from GridFS that were created > max_age_seconds ago
        and were never marked as published / attached to a permanent product.
        """
        db = get_database()
        fs = get_gridfs()
        if db is None or fs is None:
            return 0

        cutoff_date = datetime.now(timezone.utc) - timedelta(seconds=max_age_seconds)
        cutoff_timestamp = time.time() - max_age_seconds

        query = {
            "$and": [
                {
                    "$or": [
                        {"metadata.status": "preview"},
                        {"metadata.stage": "preview"},
                        {"metadata.stage": "enhanced", "metadata.status": {"$ne": "published"}}
                    ]
                },
                {"metadata.status": {"$ne": "published"}},
                {"metadata.product_id": {"$exists": False}},
                {
                    "$or": [
                        {"uploadDate": {"$lt": cutoff_date}},
                        {"metadata.created_at_ts": {"$lt": cutoff_timestamp}}
                    ]
                }
            ]
        }

        deleted_count = 0
        try:
            cursor = db["fs.files"].find(query, {"_id": 1})
            async for file_doc in cursor:
                file_id = file_doc["_id"]
                try:
                    await fs.delete(file_id)
                    deleted_count += 1
                except Exception as del_err:
                    logger.warning(f"Error deleting abandoned preview file {file_id}: {del_err}")
            
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} abandoned preview image(s) from GridFS.")
        except Exception as e:
            logger.warning(f"Failed during cleanup_abandoned_previews: {e}")

        return deleted_count

image_storage_service = ImageStorageService()
