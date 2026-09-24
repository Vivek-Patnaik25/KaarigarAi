import logging
from typing import Dict, Any, Optional
from app.models.schemas import ProductMarketProfile
from app.ml.price_predictor import has_gi_tag

logger = logging.getLogger("ProductMarketProfiler")

class ProductMarketProfiler:
    """
    Transforms an EXISTING published KarigaarAI product into structured market signals
    without hallucinating or inventing missing attributes.
    """

    @staticmethod
    def profile_product(product: Dict[str, Any]) -> ProductMarketProfile:
        product_id = product.get("product_id", "")
        category = product.get("category") or product.get("ai_metadata", {}).get("category") or "pottery_terracotta"
        
        listing = product.get("listing") or {}
        ai_metadata = product.get("ai_metadata") or {}

        # 1. Resolve Craft Tradition (only if explicitly recorded)
        craft_tradition = listing.get("craft_tradition") or product.get("craft_tradition")
        if not craft_tradition or craft_tradition.strip() == "":
            craft_tradition = None
        else:
            craft_tradition = craft_tradition.strip()

        # 2. Resolve Material (only if explicitly recorded)
        material = listing.get("material_detected") or product.get("material")
        if not material or material.strip() == "":
            material = None
        else:
            material = material.strip()

        # 3. Resolve Price bounds — anchored on the artisan's final published price
        final_price = product.get("price")
        if final_price is not None and int(final_price) > 0:
            price_val = int(final_price)
            price_min = int(round(price_val * 0.85))
            price_max = int(round(price_val * 1.15))
            price_suggested = price_val
        else:
            price_val = int(ai_metadata.get("price_suggested") or 1939)
            price_min = int(ai_metadata.get("price_min") or round(price_val * 0.80))
            price_max = int(ai_metadata.get("price_max") or round(price_val * 1.25))
            price_suggested = price_val

        # 4. Resolve Quantity (strictly None if not present in product data)
        quantity_min = product.get("quantity_min")
        quantity_max = product.get("quantity_max")
        if quantity_min is not None:
            quantity_min = int(quantity_min)
        if quantity_max is not None:
            quantity_max = int(quantity_max)

        # 5. Resolve Title & Description
        title = product.get("title") or listing.get("title_hi") or listing.get("title_en") or "हस्तनिर्मित शिल्प उत्पाद"
        description = product.get("description") or listing.get("description_hi") or listing.get("description_en") or ""
        tags = product.get("tags") or listing.get("seo_tags") or []

        # 6. Resolve Region (strictly None if not explicitly present in product data)
        region_hint = product.get("region_hint") or product.get("region")
        if not region_hint or region_hint.strip() == "":
            region_hint = None
        else:
            region_hint = region_hint.strip()

        # 7. Resolve GI Signal
        tags_str = " ".join(tags)
        gi_signal = bool(product.get("gi_signal") or has_gi_tag(title, description, tags_str))

        # 8. Build concise semantic representation
        semantic_text = f"{title}. {description}. Category: {category}. Material: {material or 'unspecified'}. Tradition: {craft_tradition or 'unspecified'}."

        profile = ProductMarketProfile(
            product_id=product_id,
            category=category,
            craft_tradition=craft_tradition,
            material=material,
            price_min=price_min,
            price_suggested=price_suggested,
            price_max=price_max,
            quantity_min=quantity_min,
            quantity_max=quantity_max,
            title=title,
            description=description,
            tags=tags,
            region_hint=region_hint,
            gi_signal=gi_signal,
            semantic_text=semantic_text,
        )

        logger.debug(f"Generated Market Profile for {product_id}: Category={category}, Price=₹{price_suggested}")
        return profile

product_market_profiler = ProductMarketProfiler()
