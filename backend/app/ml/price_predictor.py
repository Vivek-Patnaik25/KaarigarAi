import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

logger = logging.getLogger("PricePredictor")

# Directory and Path Resolvers
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(CURRENT_DIR)

def _resolve_weight_path(filename: str) -> str:
    v2_path = os.path.join(APP_DIR, "models_v2", filename)
    if os.path.exists(v2_path):
        return v2_path
    return os.path.join(CURRENT_DIR, "weights", filename)

STACKING_MODEL_PATH = _resolve_weight_path("stacking_model.pkl")
STACKING_XGB_PATH = _resolve_weight_path("stacking_xgb_base.json")
STACKING_LGB_PATH = _resolve_weight_path("stacking_lgb_base.txt")
CATBOOST_PATH = _resolve_weight_path("catboost_price_model.cbm")
XGB_TABULAR_PATH = _resolve_weight_path("xgboost_price_model.json")
XGB_MULTIMODAL_PATH = _resolve_weight_path("xgboost_multimodal_model.json")
CAT_ENCODER_PATH = _resolve_weight_path("xgboost_label_encoder.pkl")
SRC_ENCODER_PATH = _resolve_weight_path("source_label_encoder.pkl")
FLOORS_PATH = _resolve_weight_path("category_price_floors.json")
METADATA_PATH = _resolve_weight_path("model_metadata.json")

CATEGORY_NAMES = [
    "basketry_bamboo",
    "jewellery",
    "metalcraft",
    "painting_folk",
    "pottery_terracotta",
    "textile_embroidery",
    "textile_handloom",
    "woodcraft"
]

# Module-level model state
_ridge_meta = None
_xgb_base = None
_lgb_base = None
_cb_base = None
_xgb_fallback = None
_cat_models = {}
_le_cat = None
_le_src = None
_floors = {}
_metadata = {
    "desc_len_mean": 646.18,
    "desc_len_std": 307.57,
}

_health_status = {
    "stacking_meta": False,
    "xgb_base": False,
    "lgb_base": False,
    "catboost_base": False,
    "xgb_fallback": False,
    "category_models_count": 0,
    "encoders": False,
    "floors": False,
    "active_mode": "none",
}

# Domain keyword lists for helper feature extractors
TEXT_SIGNAL_KEYWORDS = {
    "material_premium": [
        "silk", "pure silk", "mulberry", "tussar", "muga", "teak", "rosewood",
        "silver", "brass", "bronze", "bidri", "gold", "zari", "pashmina"
    ],
    "material_mid": [
        "wool", "linen", "copper", "bell metal", "sheesham", "lac", "dhokra",
        "chanderi", "bamboo", "cane", "leather", "marble"
    ],
    "material_basic": [
        "cotton", "jute", "clay", "terracotta", "earthen", "softwood", "paper"
    ],
    "technique": [
        "handwoven", "handstitched", "handpainted", "handcarved", "carved",
        "embroidered", "block-printed", "natural-dyed", "hand-spun", "tie and dye",
        "filigree", "engraved", "casted", "ikat", "chikankari", "phulkari",
        "kantha", "kalamkari", "bandhani", "zardozi", "ajrakh", "dabka"
    ],
    "origin_gi": [
        "banarasi", "kanjeevaram", "kanchipuram", "madhubani", "warli", "phulkari",
        "kantha", "dhokra", "bidri", "chanderi", "sambalpuri", "kota doria", "pochampally",
        "paithani", "bandhani", "patola", "pattachitra", "kullu shawl", "muga silk",
        "mysore silk", "tussar silk", "jamdani", "bagh print", "sanganeri", "kalamkari",
        "blue pottery", "tanjore painting", "bastar iron craft", "terracotta bankura",
        "kondapalli", "chanapatna", "moradabad brass", "saharanpur wood", "jaipur blue pottery"
    ]
}


def material_tier(title: str = "", desc: str = "") -> int:
    """Returns material tier: 0 (Basic), 1 (Mid), 2 (Premium)."""
    combined = f"{title} {desc}".lower()
    if any(kw in combined for kw in TEXT_SIGNAL_KEYWORDS["material_premium"]):
        return 2
    elif any(kw in combined for kw in TEXT_SIGNAL_KEYWORDS["material_mid"]):
        return 1
    return 0


def technique_score(title: str = "", desc: str = "") -> int:
    """Returns handcrafted technique score from 0 to 3."""
    combined = f"{title} {desc}".lower()
    score = sum(1 for kw in TEXT_SIGNAL_KEYWORDS["technique"] if kw in combined)
    return min(score, 3)


def has_gi_tag(title: str = "", desc: str = "", tags: str = "") -> int:
    """Detects if product is associated with a Geographical Indication (GI)."""
    combined = f"{title} {desc} {tags}".lower()
    return int(any(kw in combined for kw in TEXT_SIGNAL_KEYWORDS["origin_gi"]))


def _init_models():
    """Loads all models_v2 models, encoders, and configuration once at module level."""
    global _ridge_meta, _xgb_base, _lgb_base, _cb_base, _xgb_fallback, _cat_models
    global _le_cat, _le_src, _floors, _metadata, _health_status

    import joblib

    # 1. Load Metadata
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _metadata = json.load(f)
        except Exception as e:
            logger.warning(f"Could not load metadata from {METADATA_PATH}: {e}")

    # 2. Load Price Floors
    if os.path.exists(FLOORS_PATH):
        try:
            with open(FLOORS_PATH, "r", encoding="utf-8") as f:
                _floors = json.load(f)
                _health_status["floors"] = True
        except Exception as e:
            logger.warning(f"Could not load price floors from {FLOORS_PATH}: {e}")

    # 3. Load Encoders
    try:
        if os.path.exists(CAT_ENCODER_PATH) and os.path.exists(SRC_ENCODER_PATH):
            _le_cat = joblib.load(CAT_ENCODER_PATH)
            _le_src = joblib.load(SRC_ENCODER_PATH)
            _health_status["encoders"] = True
            logger.info("Category and Source LabelEncoders loaded.")
    except Exception as e:
        logger.warning(f"Failed to load LabelEncoders: {e}")

    # 4. Load Base Models & Meta Learner for Stacking
    try:
        import xgboost as xgb
        import lightgbm as lgb
        from catboost import CatBoostRegressor

        # XGBoost base
        if os.path.exists(STACKING_XGB_PATH):
            _xgb_base = xgb.XGBRegressor()
            _xgb_base.load_model(STACKING_XGB_PATH)
            _health_status["xgb_base"] = True

        # LightGBM base
        if os.path.exists(STACKING_LGB_PATH):
            _lgb_base = lgb.Booster(model_file=STACKING_LGB_PATH)
            _health_status["lgb_base"] = True

        # CatBoost base
        if os.path.exists(CATBOOST_PATH):
            _cb_base = CatBoostRegressor()
            _cb_base.load_model(CATBOOST_PATH)
            _health_status["catboost_base"] = True

        # Ridge Meta Learner
        if os.path.exists(STACKING_MODEL_PATH):
            loaded_pkl = joblib.load(STACKING_MODEL_PATH)
            if isinstance(loaded_pkl, dict) and "ridge" in loaded_pkl:
                _ridge_meta = loaded_pkl["ridge"]
            else:
                _ridge_meta = loaded_pkl
            _health_status["stacking_meta"] = True

    except Exception as e:
        logger.warning(f"Stacking models loading failed or incomplete: {e}")

    # 5. Load Per-Category XGBoost Models
    try:
        import xgboost as xgb
        for cat in CATEGORY_NAMES:
            cat_path = _resolve_weight_path(f"xgb_{cat}.json")
            if os.path.exists(cat_path):
                cat_m = xgb.XGBRegressor()
                cat_m.load_model(cat_path)
                _cat_models[cat] = cat_m
        _health_status["category_models_count"] = len(_cat_models)
        logger.info(f"Loaded {len(_cat_models)} specialized per-category XGBoost models.")
    except Exception as e:
        logger.warning(f"Per-category XGBoost models loading failed: {e}")

    # 6. Load Tabular XGBoost Fallback
    try:
        import xgboost as xgb
        if os.path.exists(XGB_TABULAR_PATH):
            _xgb_fallback = xgb.XGBRegressor()
            _xgb_fallback.load_model(XGB_TABULAR_PATH)
            _health_status["xgb_fallback"] = True
            logger.info("Tabular XGBoost fallback model loaded.")
    except Exception as e:
        logger.warning(f"Fallback XGBoost model failed to load: {e}")

    # Determine active mode
    if _health_status["stacking_meta"] and _health_status["xgb_base"] and _health_status["lgb_base"] and _health_status["catboost_base"]:
        _health_status["active_mode"] = "stacking"
    elif _health_status["category_models_count"] > 0:
        _health_status["active_mode"] = "category_specialized"
    elif _health_status["xgb_fallback"]:
        _health_status["active_mode"] = "xgb_fallback"
    else:
        _health_status["active_mode"] = "none"

    logger.info(f"PricePredictor active mode: {_health_status['active_mode']}")


# Run module initialization
_init_models()


def health_check() -> Dict[str, Any]:
    """Returns dictionary of which models and components loaded successfully."""
    return _health_status.copy()


def _build_feature_vector(
    category: str,
    description: str,
    title: str = "",
    source: str = "GoSwadeshi",
) -> np.ndarray:
    """
    Constructs the 8-feature tabular vector in exact layout:
    [0] category_encoded
    [1] has_gi_tag
    [2] material_tier
    [3] technique_score
    [4] source_encoded
    [5] title_length
    [6] title_word_count
    [7] desc_len_norm
    """
    cat_clean = category.lower().strip()
    if _le_cat is not None and cat_clean in _le_cat.classes_:
        cat_encoded = int(_le_cat.transform([cat_clean])[0])
    else:
        cat_encoded = 0

    gi_val = has_gi_tag(title, description)
    mat_val = material_tier(title, description)
    tech_val = technique_score(title, description)

    if _le_src is not None and source in _le_src.classes_:
        src_encoded = int(_le_src.transform([source])[0])
    else:
        src_encoded = 0

    t_len = len(title)
    t_words = len(title.split())

    mean_d = _metadata.get("desc_len_mean", 646.18)
    std_d = _metadata.get("desc_len_std", 307.57)
    if std_d == 0:
        std_d = 1.0
    desc_norm = (len(description) - mean_d) / std_d

    return np.array([[
        cat_encoded,
        gi_val,
        mat_val,
        tech_val,
        src_encoded,
        t_len,
        t_words,
        desc_norm,
    ]], dtype=np.float32)


def predict_price(
    image_path: Optional[str] = None,
    category: str = "textile_handloom",
    description: str = "",
    title: str = "",
    source: str = "GoSwadeshi",
) -> Dict[str, Any]:
    """
    Predicts fair handicraft price using Stacking Ensemble (RidgeCV meta-learner over
    XGBoost, LightGBM, CatBoost) + Category-Specialized Models from models_v2 with empirical price floors.
    """
    cat_clean = category.lower().strip()
    features = _build_feature_vector(
        category=cat_clean,
        description=description,
        title=title,
        source=source,
    )

    model_used = "heuristic"
    suggested_val = 0.0
    stacking_pred = None
    cat_model_pred = None

    # 1. Try Primary: Stacking Meta-Learner
    if (
        _health_status["active_mode"] in ("stacking", "category_specialized")
        and _ridge_meta is not None
        and _xgb_base is not None
        and _lgb_base is not None
        and _cb_base is not None
    ):
        try:
            pred_xgb = float(_xgb_base.predict(features)[0])
            pred_lgb = float(_lgb_base.predict(features)[0])

            # Prepare CatBoost inputs
            mean_d = _metadata.get("desc_len_mean", 646.18)
            std_d = _metadata.get("desc_len_std", 307.57)
            desc_norm = (len(description) - mean_d) / (std_d if std_d != 0 else 1.0)

            cb_df = pd.DataFrame([{
                "category_str": cat_clean,
                "has_gi_tag": has_gi_tag(title, description),
                "material_tier": material_tier(title, description),
                "technique_score": technique_score(title, description),
                "source_str": source,
                "title_length": len(title),
                "title_word_count": len(title.split()),
                "desc_len_norm": desc_norm,
            }])
            pred_cb = float(_cb_base.predict(cb_df)[0])

            meta_X = np.array([[pred_xgb, pred_lgb, pred_cb]], dtype=np.float32)
            log_price = float(_ridge_meta.predict(meta_X)[0])
            stacking_pred = float(np.expm1(log_price))
            model_used = "stacking_v2"
        except Exception as e:
            logger.warning(f"Stacking inference failed: {e}. Attempting category/fallback model.")

    # 2. Try Specialized Per-Category Model from models_v2
    if cat_clean in _cat_models:
        try:
            cat_m = _cat_models[cat_clean]
            log_cat_pred = float(cat_m.predict(features)[0])
            cat_model_pred = float(np.expm1(log_cat_pred))
        except Exception as e:
            logger.warning(f"Category model inference failed for {cat_clean}: {e}")

    # Combine Stacking & Specialized Category Model if both available
    if stacking_pred is not None and cat_model_pred is not None:
        # Weighted blend (60% stacking, 40% specialized category tree)
        suggested_val = 0.60 * stacking_pred + 0.40 * cat_model_pred
        model_used = "stacking_v2+category_ensemble"
    elif stacking_pred is not None:
        suggested_val = stacking_pred
    elif cat_model_pred is not None:
        suggested_val = cat_model_pred
        model_used = "category_model_v2"

    # 3. Fallback: Tabular XGBoost
    if suggested_val <= 0.0 and _xgb_fallback is not None:
        try:
            log_pred = float(_xgb_fallback.predict(features)[0])
            suggested_val = float(np.expm1(log_pred))
            model_used = "xgb_fallback"
        except Exception as e:
            logger.warning(f"XGBoost fallback prediction failed: {e}.")

    # 4. Final Fallback Heuristic if ML models failed
    if suggested_val <= 0.0:
        base_cat_floors = {
            "textile_handloom": 1800,
            "textile_embroidery": 1200,
            "pottery_terracotta": 450,
            "woodcraft": 900,
            "metalcraft": 1500,
            "jewellery": 800,
            "basketry_bamboo": 400,
            "painting_folk": 1400,
        }
        suggested_val = base_cat_floors.get(cat_clean, 800)
        model_used = "heuristic"

    # 5. Enforce Empirical Category Price Floor from models_v2
    floor = _floors.get(cat_clean, 100.0)
    suggested = max(suggested_val, float(floor))

    # Round suggested price to clean integer
    price_suggested = int(round(suggested))
    price_min = int(round(suggested * 0.80))
    price_max = int(round(suggested * 1.25))

    # Formulate domain reasoning
    mat_score = material_tier(title, description)
    tech_s = technique_score(title, description)
    gi = has_gi_tag(title, description)
    
    reasons = []
    if gi:
        reasons.append("Geographical Indication (GI) heritage craft")
    if mat_score == 2:
        reasons.append("Premium raw materials detected")
    elif mat_score == 1:
        reasons.append("Quality artisanal materials")
    if tech_s >= 2:
        reasons.append("High handcrafted skill & complex technique")
    elif tech_s == 1:
        reasons.append("Handmade artisanal technique")

    reasoning_str = f"Estimated based on {cat_clean.replace('_', ' ')} market benchmarks"
    if reasons:
        reasoning_str += f" ({', '.join(reasons)})"
    reasoning_str += f". Suggested ₹{price_suggested} (Range: ₹{price_min} - ₹{price_max})."

    return {
        "price_suggested": price_suggested,
        "price_min": price_min,
        "price_max": price_max,
        "confidence": 0.88 if "stacking" in model_used else 0.75,
        "model_used": model_used,
        "reasoning": reasoning_str,
    }


# Backwards compatibility class wrapper for existing routers
class PricePredictor:
    def __init__(self):
        pass

    @property
    def _is_model_loaded(self) -> bool:
        return _health_status["active_mode"] != "none"

    def predict(
        self,
        category: str = "textile_handloom",
        description: str = "",
        title: str = "",
        image_path: Optional[str] = None,
        source: str = "GoSwadeshi",
    ) -> Dict[str, Any]:
        return predict_price(
            image_path=image_path,
            category=category,
            description=description,
            title=title,
            source=source,
        )

price_predictor = PricePredictor()
