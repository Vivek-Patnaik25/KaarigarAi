import random
import string
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.db.mongodb import get_database
from app.db.collections import (
    BUYER_REQUIREMENTS_COLLECTION,
    INQUIRIES_COLLECTION,
    PRODUCTS_COLLECTION,
)
from app.db.seed_buyers import seed_buyer_requirements
from app.models.schemas import (
    ProductMarketProfile,
    MarketOpportunityMatch,
    MarketMatchResponse,
    DemoInquiryRequest,
    DemoInquiryResponse,
)
from app.services.product_service import product_service
from app.services.product_market_profiler import product_market_profiler
from app.services.buyer_matching_service import buyer_matching_service

logger = logging.getLogger("MarketService")

def generate_unique_inquiry_id() -> str:
    """Generates a unique permanent inquiry ID in format INQ-XXXXXX."""
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=6))
    return f"INQ-{suffix}"

class MarketService:
    @staticmethod
    async def ensure_buyers_seeded() -> int:
        """Checks and auto-seeds the buyer_requirements collection if empty."""
        db = get_database()
        if db is None:
            return 0
        return await seed_buyer_requirements(db, overwrite=False)

    @staticmethod
    async def find_matches_for_product(
        product_id: str,
        limit: int = 10,
    ) -> Optional[MarketMatchResponse]:
        """
        Executes end-to-end deterministic market linkage match for a published product:
        1. Loads product from MongoDB.
        2. Validates that product exists and is published (rejects draft/archived/missing).
        3. Generates ProductMarketProfile.
        4. Loads active buyer requirements.
        5. Computes explainable compatibility scores & renormalizes missing weights.
        6. Applies 9-step deterministic tie-breaking.
        7. Returns top ranked market opportunities.
        """
        db = get_database()
        if db is None:
            raise RuntimeError("MongoDB connection is unavailable.")

        # 1. Fetch product
        product_doc = await product_service.get_product_by_id(product_id)
        if not product_doc:
            logger.warning(f"Market match requested for nonexistent product: {product_id}")
            return None

        # 2. Verify publication status
        status = (product_doc.get("status") or "published").lower().strip()
        if status not in ("published", "active"):
            logger.warning(f"Market match rejected for non-published product {product_id} with status '{status}'")
            raise ValueError(f"Product '{product_id}' is currently in '{status}' status. Only published products can access market opportunities.")

        # 3. Ensure buyer requirements exist
        await MarketService.ensure_buyers_seeded()

        # 4. Generate structured market profile
        market_profile = product_market_profiler.profile_product(product_doc)

        # 5. Fetch active buyer requirements
        buyers_cursor = db[BUYER_REQUIREMENTS_COLLECTION].find({"status": "active"})
        all_matches: List[MarketOpportunityMatch] = []

        async for buyer_doc in buyers_cursor:
            match = buyer_matching_service.match_product_against_buyer(market_profile, buyer_doc)
            all_matches.append(match)

        # 6. Apply deterministic tie-breaking and ranking
        ranked_matches = buyer_matching_service.rank_matches(all_matches)
        top_matches = ranked_matches[:limit]

        logger.info(f"Generated {len(top_matches)} market opportunities for product {product_id}")

        return MarketMatchResponse(
            product_id=product_id,
            market_profile=market_profile,
            matches=top_matches,
            total_matches=len(ranked_matches),
        )

    @staticmethod
    async def get_all_buyers(
        buyer_type: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Retrieves active buyer requirements from MongoDB."""
        db = get_database()
        if db is None:
            return []

        await MarketService.ensure_buyers_seeded()

        query: Dict[str, Any] = {"status": "active"}
        if buyer_type:
            query["buyer_type"] = buyer_type
        if category:
            query["categories"] = category

        cursor = db[BUYER_REQUIREMENTS_COLLECTION].find(query).limit(limit)
        buyers = []
        async for doc in cursor:
            doc.pop("_id", None)
            buyers.append(doc)

        return buyers

    @staticmethod
    async def get_buyer_by_id(buyer_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single buyer requirement by buyer_id."""
        db = get_database()
        if db is None:
            return None

        doc = await db[BUYER_REQUIREMENTS_COLLECTION].find_one({"buyer_id": buyer_id})
        if not doc:
            return None

        doc.pop("_id", None)
        return doc

    @staticmethod
    async def create_demo_inquiry(payload: DemoInquiryRequest) -> DemoInquiryResponse:
        """
        Creates a demo inquiry document in the inquiries collection.
        Explicitly marked with demo_data: True.
        """
        db = get_database()
        if db is None:
            raise RuntimeError("MongoDB connection is unavailable.")

        inquiry_coll = db[INQUIRIES_COLLECTION]
        inquiry_id = generate_unique_inquiry_id()
        now_iso = datetime.now(timezone.utc).isoformat()

        inquiry_doc = {
            "inquiry_id": inquiry_id,
            "product_id": payload.product_id,
            "buyer_id": payload.buyer_id,
            "message": payload.message or "Artisan expressed interest in supplying handcrafted items matching requirement.",
            "contact_name": payload.contact_name or "Artisan",
            "contact_phone": payload.contact_phone or "+91 98765 43210",
            "status": "draft",
            "demo_data": True,
            "created_at": now_iso,
            "updated_at": now_iso,
        }

        await inquiry_coll.insert_one(inquiry_doc)
        logger.info(f"Created demo inquiry {inquiry_id} for product {payload.product_id} and buyer {payload.buyer_id}")

        return DemoInquiryResponse(
            success=True,
            inquiry_id=inquiry_id,
            product_id=payload.product_id,
            buyer_id=payload.buyer_id,
            status="draft",
            demo_data=True,
            created_at=now_iso,
            message="Demo Inquiry recorded. No live transmission sent (Simulation Mode).",
        )

    @staticmethod
    async def get_inquiries_for_product(product_id: str) -> List[Dict[str, Any]]:
        """Retrieves all demo inquiries for a specific product."""
        db = get_database()
        if db is None:
            return []

        cursor = db[INQUIRIES_COLLECTION].find({"product_id": product_id}).sort("created_at", -1)
        inquiries = []
        async for doc in cursor:
            doc.pop("_id", None)
            inquiries.append(doc)

        return inquiries

market_service = MarketService()
