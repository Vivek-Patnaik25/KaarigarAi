import logging
from typing import Dict, Any, List, Optional, Tuple
from app.models.schemas import (
    ProductMarketProfile,
    BuyerRequirementDocument,
    MatchScoreBreakdown,
    MarketOpportunityMatch,
)

logger = logging.getLogger("BuyerMatchingService")

# Canonical V1 Signal Weights
SIGNAL_WEIGHTS = {
    "category": 0.30,
    "price": 0.25,
    "quantity": 0.20,
    "material": 0.10,
    "region": 0.10,
    "tradition": 0.05,
}

# Broad craft family mapping
CRAFT_FAMILY_MAP = {
    "textile_handloom": "textile",
    "textile_embroidery": "textile",
    "pottery_terracotta": "pottery",
    "woodcraft": "woodcraft",
    "metalcraft": "metalcraft",
    "jewellery": "jewellery",
    "basketry_bamboo": "basketry",
    "painting_folk": "painting",
}

# Related material families for compatible (0.5) scoring
COMPATIBLE_MATERIAL_PAIRS = [
    {"clay", "terracotta", "terracotta clay", "natural clay", "earthen", "earthenware"},
    {"cotton", "khadi", "organic cotton", "handspun cotton", "linen"},
    {"silk", "mulberry silk", "tussar silk", "muga silk", "chanderi silk", "banarasi silk", "pashmina"},
    {"brass", "bronze", "copper", "bell metal", "bidri metal", "metal"},
    {"bamboo", "cane", "rattan", "sikki grass", "kauna reed", "jute"},
    {"teak", "sheesham", "rosewood", "mango wood", "walnut wood", "wood", "softwood"},
    {"silver", "sterling silver", "tribal silver", "german silver"},
]

# Compatible regional zones
REGIONAL_ZONE_MAP = {
    "rajasthan": "north india",
    "punjab": "north india",
    "haryana": "north india",
    "uttar pradesh": "north india",
    "himachal pradesh": "north india",
    "jammu & kashmir": "north india",
    "kashmir": "north india",
    "gujarat": "west india",
    "maharashtra": "west india",
    "goa": "west india",
    "madhya pradesh": "central india",
    "chhattisgarh": "central india",
    "odisha": "east india",
    "west bengal": "east india",
    "bihar": "east india",
    "assam": "northeast india",
    "manipur": "northeast india",
    "tripura": "northeast india",
    "karnataka": "south india",
    "tamil nadu": "south india",
    "kerala": "south india",
    "andhra pradesh": "south india",
    "telangana": "south india",
}

class BuyerMatchingService:
    """
    Deterministic, explainable, and testable Product-to-Buyer Requirement matching engine.
    """

    @staticmethod
    def calculate_category_score(product_cat: str, buyer_categories: List[str]) -> float:
        """
        Exact match = 1.0, broad craft family match = 0.5, mismatch = 0.0.
        """
        if not product_cat or not buyer_categories:
            return 0.0

        prod_clean = product_cat.lower().strip()
        buyer_clean = [c.lower().strip() for c in buyer_categories]

        if prod_clean in buyer_clean:
            return 1.0

        prod_family = CRAFT_FAMILY_MAP.get(prod_clean, prod_clean)
        for b_cat in buyer_clean:
            b_family = CRAFT_FAMILY_MAP.get(b_cat, b_cat)
            if prod_family == b_family or prod_family in b_cat or b_cat in prod_family:
                return 0.5

        return 0.0

    @staticmethod
    def calculate_price_score(p_min: int, p_max: int, b_min: int, b_max: int) -> float:
        """
        Interval overlap formula: intersection / union.
        """
        p_lo = min(p_min, p_max)
        p_hi = max(p_min, p_max)
        b_lo = min(b_min, b_max)
        b_hi = max(b_min, b_max)

        intersection = max(0, min(p_hi, b_hi) - max(p_lo, b_lo))
        union = max(p_hi, b_hi) - min(p_lo, b_lo)

        if union <= 0:
            return 1.0 if p_hi == b_hi else 0.0

        if intersection <= 0:
            return 0.0

        return round(float(intersection) / float(union), 4)

    @staticmethod
    def calculate_quantity_score(
        q_min: Optional[int],
        q_max: Optional[int],
        b_min: Optional[int],
        b_max: Optional[int]
    ) -> Optional[float]:
        """
        Calculates range overlap for quantity if product quantity is present.
        Returns None if product quantity is unavailable (triggers weight renormalization).
        """
        if q_min is None and q_max is None:
            return None

        p_q_lo = q_min if q_min is not None else q_max
        p_q_hi = q_max if q_max is not None else q_min

        if p_q_lo is None or p_q_hi is None:
            return None

        b_q_lo = b_min if b_min is not None else 1
        b_q_hi = b_max if b_max is not None else b_q_lo

        intersection = max(0, min(p_q_hi, b_q_hi) - max(p_q_lo, b_q_lo))
        union = max(p_q_hi, b_q_hi) - min(p_q_lo, b_q_lo)

        if union <= 0:
            return 1.0 if p_q_hi == b_q_hi else 0.0

        if intersection <= 0:
            return 0.0

        return round(float(intersection) / float(union), 4)

    @staticmethod
    def calculate_material_score(
        prod_material: Optional[str],
        buyer_materials: List[str]
    ) -> Optional[float]:
        """
        Exact match = 1.0, compatible family = 0.5, mismatch = 0.0.
        Returns None if product material is missing.
        """
        if not prod_material or prod_material.strip() == "":
            return None

        if not buyer_materials:
            return 0.5

        mat_clean = prod_material.lower().strip()
        buyer_clean = [m.lower().strip() for m in buyer_materials]

        # 1. Exact or direct substring match
        for bm in buyer_clean:
            if mat_clean == bm or mat_clean in bm or bm in mat_clean:
                return 1.0

        # 2. Compatible material family
        for group in COMPATIBLE_MATERIAL_PAIRS:
            prod_in_group = any(m in mat_clean for m in group)
            if prod_in_group:
                buyer_in_group = any(any(m in bm for m in group) for bm in buyer_clean)
                if buyer_in_group:
                    return 0.5

        return 0.0

    @staticmethod
    def calculate_region_score(
        prod_region: Optional[str],
        buyer_regions: List[str]
    ) -> Optional[float]:
        """
        Exact match = 1.0, compatible broad zone = 0.5, mismatch = 0.0.
        Returns None if product region is missing.
        """
        if not prod_region or prod_region.strip() == "":
            return None

        if not buyer_regions:
            return 0.5

        reg_clean = prod_region.lower().strip()
        buyer_clean = [r.lower().strip() for r in buyer_regions]

        if "all india" in buyer_clean or "pan india" in buyer_clean or "india" in buyer_clean:
            return 1.0

        for br in buyer_clean:
            if reg_clean == br or reg_clean in br or br in reg_clean:
                return 1.0

        # Zone match
        prod_zone = REGIONAL_ZONE_MAP.get(reg_clean)
        if prod_zone:
            for br in buyer_clean:
                if prod_zone == br or prod_zone in br:
                    return 0.5

        return 0.0

    @staticmethod
    def calculate_tradition_score(
        prod_tradition: Optional[str],
        buyer_crafts: List[str]
    ) -> Optional[float]:
        """
        Exact match = 1.0, compatible tradition = 0.5, mismatch = 0.0.
        Returns None if product craft tradition is missing.
        """
        if not prod_tradition or prod_tradition.strip() == "":
            return None

        if not buyer_crafts:
            return 0.5

        trad_clean = prod_tradition.lower().strip()
        buyer_clean = [c.lower().strip() for c in buyer_crafts]

        for bc in buyer_clean:
            if trad_clean == bc or trad_clean in bc or bc in trad_clean:
                return 1.0

        # Substring keyword match
        trad_tokens = set(trad_clean.split())
        for bc in buyer_clean:
            bc_tokens = set(bc.split())
            if len(trad_tokens.intersection(bc_tokens)) > 0:
                return 0.5

        return 0.0

    @classmethod
    def renormalize_weights(cls, scores: Dict[str, Optional[float]]) -> Tuple[float, List[str], List[str]]:
        """
        Generic weight renormalization for available vs missing signals.
        Score = sum(weight_i * score_i) / sum(weight_i for available signals)
        """
        available_signals = []
        missing_signals = []
        weighted_sum = 0.0
        available_weight_sum = 0.0

        for signal_name, default_weight in SIGNAL_WEIGHTS.items():
            val = scores.get(signal_name)
            if val is not None:
                available_signals.append(signal_name)
                weighted_sum += default_weight * val
                available_weight_sum += default_weight
            else:
                missing_signals.append(signal_name)

        if available_weight_sum <= 0.0:
            final_score = 0.0
        else:
            final_score = round(weighted_sum / available_weight_sum, 4)

        # Ensure strict [0.0, 1.0] bounds
        final_score = max(0.0, min(1.0, final_score))
        return final_score, available_signals, missing_signals

    @classmethod
    def generate_explanations(
        cls,
        scores: Dict[str, Optional[float]],
        missing_signals: List[str]
    ) -> List[str]:
        """
        Generates deterministic explainability bullet points without an LLM.
        """
        reasons = []

        # Category
        cat_s = scores.get("category", 0.0)
        if cat_s >= 1.0:
            reasons.append("✓ Craft category matches buyer requirement")
        elif cat_s >= 0.5:
            reasons.append("✓ Compatible craft family matches buyer focus")

        # Price
        price_s = scores.get("price", 0.0)
        if price_s >= 0.5:
            reasons.append("✓ Product pricing overlaps buyer budget bracket")
        elif price_s > 0.0:
            reasons.append("✓ Partial price range alignment with buyer budget")

        # Material
        mat_s = scores.get("material")
        if mat_s is not None:
            if mat_s >= 1.0:
                reasons.append("✓ Artisanal material matches buyer preference")
            elif mat_s >= 0.5:
                reasons.append("✓ Compatible natural material specification")

        # Tradition
        trad_s = scores.get("tradition")
        if trad_s is not None:
            if trad_s >= 1.0:
                reasons.append("✓ Craft tradition matches buyer collection theme")
            elif trad_s >= 0.5:
                reasons.append("✓ Related traditional artisan heritage")

        # Region
        reg_s = scores.get("region")
        if reg_s is not None:
            if reg_s >= 1.0:
                reasons.append("✓ Geographic artisan region aligns with buyer interest")
            elif reg_s >= 0.5:
                reasons.append("✓ Compatible regional craft zone")

        # Quantity
        qty_s = scores.get("quantity")
        if qty_s is not None:
            if qty_s >= 0.5:
                reasons.append("✓ Production capacity aligns with buyer order volume")
            elif qty_s > 0.0:
                reasons.append("✓ Partial order volume compatibility")

        # Information Unavailable notes
        missing_labels = {
            "quantity": "Product order capacity / quantity limits",
            "region": "Artisan geographic location",
            "material": "Material composition specification",
            "tradition": "Specific craft tradition heritage",
        }
        for ms in missing_signals:
            if ms in missing_labels:
                reasons.append(f"• Information unavailable: {missing_labels[ms]}")

        return reasons

    @classmethod
    def match_product_against_buyer(
        cls,
        product_profile: ProductMarketProfile,
        buyer_doc: Dict[str, Any]
    ) -> MarketOpportunityMatch:
        """
        Evaluates a single product profile against a buyer requirement.
        """
        # 1. Calculate component scores
        s_category = cls.calculate_category_score(
            product_profile.category,
            buyer_doc.get("categories", [])
        )
        s_price = cls.calculate_price_score(
            product_profile.price_min,
            product_profile.price_max,
            int(buyer_doc.get("budget_min", 0)),
            int(buyer_doc.get("budget_max", 100000))
        )
        s_quantity = cls.calculate_quantity_score(
            product_profile.quantity_min,
            product_profile.quantity_max,
            buyer_doc.get("quantity_min"),
            buyer_doc.get("quantity_max")
        )
        s_material = cls.calculate_material_score(
            product_profile.material,
            buyer_doc.get("material_preferences", [])
        )
        s_region = cls.calculate_region_score(
            product_profile.region_hint,
            buyer_doc.get("region_preferences", [])
        )
        s_tradition = cls.calculate_tradition_score(
            product_profile.craft_tradition,
            buyer_doc.get("craft_preferences", [])
        )

        scores = {
            "category": s_category,
            "price": s_price,
            "quantity": s_quantity,
            "material": s_material,
            "region": s_region,
            "tradition": s_tradition,
        }

        # 2. Renormalize weights
        final_score, available_signals, missing_signals = cls.renormalize_weights(scores)

        # 3. Determine match level
        if final_score >= 0.75:
            match_level = "high"
        elif final_score >= 0.50:
            match_level = "medium"
        else:
            match_level = "low"

        # 4. Generate deterministic reasons
        reasons = cls.generate_explanations(scores, missing_signals)

        breakdown = MatchScoreBreakdown(
            category=s_category,
            price=s_price,
            quantity=s_quantity,
            material=s_material,
            region=s_region,
            tradition=s_tradition,
        )

        # Prepare clean buyer dict without internal Mongo _id
        clean_buyer = dict(buyer_doc)
        clean_buyer.pop("_id", None)

        return MarketOpportunityMatch(
            buyer=clean_buyer,
            match_score=final_score,
            match_level=match_level,
            score_breakdown=breakdown,
            reasons=reasons,
            available_signals=available_signals,
            missing_signals=missing_signals,
        )

    @classmethod
    def rank_matches(cls, matches: List[MarketOpportunityMatch]) -> List[MarketOpportunityMatch]:
        """
        Sorts matches using the rigorous 9-step deterministic tie-breaking sequence:
        1. Higher final match_score DESC
        2. Higher category score DESC
        3. Higher price score DESC
        4. Higher quantity score DESC
        5. Higher material score DESC
        6. Higher region score DESC
        7. Higher tradition score DESC
        8. Greater number of available matching signals DESC
        9. buyer_id ASC (guaranteed deterministic tie-breaker)
        """
        def sort_key(m: MarketOpportunityMatch):
            b = m.score_breakdown
            s_cat = b.category if b.category is not None else -1.0
            s_prc = b.price if b.price is not None else -1.0
            s_qty = b.quantity if b.quantity is not None else -1.0
            s_mat = b.material if b.material is not None else -1.0
            s_reg = b.region if b.region is not None else -1.0
            s_trd = b.tradition if b.tradition is not None else -1.0
            avail_count = len(m.available_signals)
            buyer_id = str(m.buyer.get("buyer_id", ""))

            # For DESC ordering, negate numeric values; for ASC buyer_id, keep as string
            return (
                -m.match_score,
                -s_cat,
                -s_prc,
                -s_qty,
                -s_mat,
                -s_reg,
                -s_trd,
                -avail_count,
                buyer_id
            )

        return sorted(matches, key=sort_key)

buyer_matching_service = BuyerMatchingService()
