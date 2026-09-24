import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Response, Query
from app.services.image_storage_service import image_storage_service
from app.core.responses import ApiResponse

logger = logging.getLogger("MediaRouter")
router = APIRouter(prefix="/media", tags=["Media Service"])

@router.get("/{file_id}/info", summary="Get GridFS media file metadata")
async def get_media_file_info(file_id: str):
    """
    Retrieves metadata for an image stored in MongoDB GridFS.
    """
    info = await image_storage_service.get_image_metadata(file_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"Media file '{file_id}' not found.")
    return ApiResponse.ok(info)

@router.get("/{file_id}", summary="Serve image file from MongoDB GridFS")
async def get_media_file(file_id: str):
    """
    Retrieves and streams image from GridFS with proper Content-Type and caching headers.
    """
    result = await image_storage_service.get_image(file_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Media file '{file_id}' not found.")

    raw_bytes, filename, content_type = result

    return Response(
        content=raw_bytes,
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Disposition": f'inline; filename="{filename}"',
        },
    )

@router.delete("/{file_id}", summary="Delete single image from GridFS")
async def delete_media_file(file_id: str):
    """
    Deletes an individual image from MongoDB GridFS bucket.
    """
    success = await image_storage_service.delete_image(file_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Media file '{file_id}' not found or could not be deleted.")
    return ApiResponse.ok({"deleted": True, "file_id": file_id})

@router.post("/cleanup-previews", summary="Purge abandoned preview images from GridFS")
async def cleanup_abandoned_previews(
    max_age_seconds: int = Query(43200, description="Max age in seconds before purging unattached preview images (default: 12h)"),
):
    """
    Scans GridFS for preview images that were never published to a permanent listing and purges them.
    """
    try:
        count = await image_storage_service.cleanup_abandoned_previews(max_age_seconds=max_age_seconds)
        return ApiResponse.ok({
            "cleaned_count": count,
            "max_age_seconds": max_age_seconds,
            "message": f"Successfully purged {count} abandoned preview image(s)."
        })
    except Exception as e:
        logger.error(f"Error during preview cleanup: {e}")
        return ApiResponse.fail(f"Cleanup failed: {str(e)}")
