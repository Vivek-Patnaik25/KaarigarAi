import logging
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.core.responses import ApiResponse
from app.services.product_service import product_service
from app.models.schemas import ProductStatusUpdateRequest

logger = logging.getLogger("ProductRouter")
router = APIRouter(prefix="/products", tags=["Public Products"])

@router.get("/{product_id}", summary="Get public product details by permanent product_id")
async def get_public_product(product_id: str):
    """
    Fetches the public product document from MongoDB.
    Accessible without authentication for public product storefronts.
    """
    product = await product_service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' was not found.")

    return ApiResponse.ok(product)

@router.patch("/{product_id}/status", summary="Update product status (published, sold, draft, archived)")
async def update_status(product_id: str, payload: ProductStatusUpdateRequest):
    allowed_statuses = ["published", "draft", "sold", "archived", "active"]
    if payload.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Allowed values: {allowed_statuses}"
        )

    # Normalize 'active' to 'published'
    norm_status = "published" if payload.status == "active" else payload.status
    success = await product_service.update_product_status(product_id, norm_status)
    if not success:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' could not be updated.")

    return ApiResponse.ok({
        "product_id": product_id,
        "status": norm_status,
        "message": f"Product status updated to '{norm_status}'"
    })

@router.delete("/{product_id}", summary="Delete product listing")
async def delete_listing(product_id: str):
    success = await product_service.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")

    return ApiResponse.ok({
        "product_id": product_id,
        "deleted": True,
        "message": "Product removed successfully"
    })
