import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Body
from app.core.responses import ApiResponse
from app.models.schemas import (
    MarketMatchRequest,
    MarketMatchResponse,
    DemoInquiryRequest,
    DemoInquiryResponse,
)
from app.services.market_service import market_service

logger = logging.getLogger("MarketRouter")
router = APIRouter(prefix="/market", tags=["Market Linkage"])

@router.post("/match", summary="Discover explainable market opportunities for a published product")
async def match_product_opportunities(payload: MarketMatchRequest):
    """
    Computes deterministic, explainable compatibility matching against the Buyer Requirement Registry.
    Applies 6-signal weighting, weight renormalization for missing product signals, and 9-step tie-breaking.
    Only permitted for published products.
    """
    try:
        match_result = await market_service.find_matches_for_product(payload.product_id)
        if match_result is None:
            raise HTTPException(status_code=404, detail=f"Product with ID '{payload.product_id}' was not found.")
        return ApiResponse.ok(match_result.model_dump())
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Market matching failed for product {payload.product_id}: {e}", exc_info=True)
        return ApiResponse.fail(f"Market matching failed: {str(e)}")

@router.get("/buyers", summary="List active buyer requirements in the registry")
async def list_buyer_requirements(
    buyer_type: Optional[str] = Query(None, description="Filter by buyer type taxonomy"),
    category: Optional[str] = Query(None, description="Filter by craft category"),
    limit: int = Query(50, description="Max buyers to return"),
):
    """Retrieves synthetic demo buyer requirements from MongoDB."""
    try:
        buyers = await market_service.get_all_buyers(buyer_type=buyer_type, category=category, limit=limit)
        return ApiResponse.ok(buyers)
    except Exception as e:
        logger.error(f"Failed to list buyers: {e}")
        return ApiResponse.fail(f"Failed to list buyers: {str(e)}")

@router.get("/buyers/{buyer_id}", summary="Get single buyer requirement details")
async def get_buyer_details(buyer_id: str):
    """Retrieves a single buyer requirement by buyer_id."""
    buyer = await market_service.get_buyer_by_id(buyer_id)
    if not buyer:
        raise HTTPException(status_code=404, detail=f"Buyer requirement '{buyer_id}' not found.")
    return ApiResponse.ok(buyer)

@router.post("/inquiries", summary="Create a demo supply inquiry for a matched opportunity")
async def create_inquiry(payload: DemoInquiryRequest):
    """
    Creates a simulated demo inquiry in MongoDB for tracking artisan interest.
    Explicitly marked with demo_data: True.
    """
    try:
        inquiry_res = await market_service.create_demo_inquiry(payload)
        return ApiResponse.ok(inquiry_res.model_dump())
    except Exception as e:
        logger.error(f"Failed to create demo inquiry: {e}")
        return ApiResponse.fail(f"Failed to create inquiry: {str(e)}")

@router.get("/inquiries/{product_id}", summary="Get demo inquiries for a specific product")
async def get_product_inquiries(product_id: str):
    """Lists demo inquiries created for a product."""
    try:
        inquiries = await market_service.get_inquiries_for_product(product_id)
        return ApiResponse.ok(inquiries)
    except Exception as e:
        logger.error(f"Failed to fetch inquiries for {product_id}: {e}")
        return ApiResponse.fail(f"Failed to fetch inquiries: {str(e)}")
