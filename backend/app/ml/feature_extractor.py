import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("FeatureExtractor")

try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except Exception as e:
    cv2 = None
    np = None
    CV2_AVAILABLE = False

TEXT_SIGNAL_KEYWORDS = {
    "material_premium": ["silk", "pure silk", "mulberry", "tussar", "muga", "teak", "rosewood", "silver", "brass", "bronze", "bidri"],
    "material_mid": ["wool", "linen", "copper", "bell metal", "sheesham", "lac", "dhokra", "chanderi", "bamboo"],
    "material_basic": ["cotton", "jute", "clay", "terracotta", "earthen", "softwood"],
    "technique": [
        "handwoven", "handstitched", "handpainted", "handcarved", "carved",
        "embroidered", "block-printed", "natural-dyed", "hand-spun", "tie and dye",
        "filigree", "engraved", "casted", "ikat"
    ],
    "origin_gi": [
        "banarasi", "kanjeevaram", "kanchipuram", "madhubani", "warli", "phulkari",
        "kantha", "dhokra", "bidri", "chanderi", "sambalpuri", "kota doria", "pochampally",
        "paithani", "bandhani", "patola", "pattachitra", "kullu shawl", "muga silk",
        "mysore silk", "tussar silk", "jamdani", "bagh print", "sanganeri", "kalamkari",
        "blue pottery", "tanjore painting", "bastar iron craft", "terracotta bankura",
        "kondapalli", "chanapatna", "moradabad brass", "saharanpur wood"
    ]
}

def extract_image_features(image_path: Optional[str]) -> Dict[str, float]:
    """
    Extracts computer vision features directly related to handicraft complexity:
      1. Color complexity (entropy over k=8 color clusters)
      2. Edge density (Canny filter proxy for intricacy)
      3. Sharpness (Laplacian variance quality metric)
      4. Saturation (HSV saturation mean for vibrant craft dyes)
    """
    # Default fallback features in case of missing or unreadable image
    default_features = {
        "color_entropy": 1.50,
        "edge_density": 0.12,
        "sharpness": 0.50,
        "saturation": 0.45,
    }

    if not image_path or not CV2_AVAILABLE or cv2 is None or np is None:
        return default_features

    try:
        img = cv2.imread(image_path)
        if img is None:
            return default_features

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        h, w = img_rgb.shape[:2]
        if h == 0 or w == 0:
            return default_features

        # Resize for consistent, fast feature extraction (max 400px dimension)
        scale = 400.0 / max(h, w)
        if scale < 1.0:
            img_rgb = cv2.resize(img_rgb, (int(w * scale), int(h * scale)))

        # 1. Color complexity — distinct color clusters (k=8)
        pixels = img_rgb.reshape(-1, 3).astype(np.float32)
        k = min(8, len(pixels))
        _, labels, _ = cv2.kmeans(
            pixels, k, None,
            (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0),
            5, cv2.KMEANS_RANDOM_CENTERS
        )
        _, counts = np.unique(labels, return_counts=True)
        probs = counts / len(labels)
        color_entropy = -np.sum(probs * np.log(probs + 1e-9))

        # 2. Edge density — proxy for craft detail complexity
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = edges.sum() / (edges.shape[0] * edges.shape[1] * 255)

        # 3. Image sharpness — quality indicator
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        sharpness = min(laplacian_var / 1000.0, 1.0)

        # 4. Dominant color saturation — vibrant natural/craft dyes
        hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
        mean_saturation = hsv[:, :, 1].mean() / 255.0

        return {
            "color_entropy": round(float(color_entropy), 4),
            "edge_density": round(float(edge_density), 4),
            "sharpness": round(float(sharpness), 4),
            "saturation": round(float(mean_saturation), 4),
        }
    except Exception as e:
        logger.warning(f"Error extracting image features from {image_path}: {e}")
        return default_features


def extract_text_features(text: str) -> Dict[str, Any]:
    """
    Extracts high-signal domain features from artisan description/title:
      - has_gi_tag: Geographical Indication detected
      - material_tier: 0 (Basic), 1 (Mid), 2 (Premium)
      - technique_score: Handcrafted technique mentions (0 to 3)
      - description_length: Character count of description
    """
    clean_text = (text or "").lower()

    # GI Tag
    has_gi = int(any(kw in clean_text for kw in TEXT_SIGNAL_KEYWORDS["origin_gi"]))

    # Material Tier
    if any(kw in clean_text for kw in TEXT_SIGNAL_KEYWORDS["material_premium"]):
        mat_tier = 2
    elif any(kw in clean_text for kw in TEXT_SIGNAL_KEYWORDS["material_mid"]):
        mat_tier = 1
    else:
        mat_tier = 0

    # Technique score
    tech_score = sum(1 for kw in TEXT_SIGNAL_KEYWORDS["technique"] if kw in clean_text)
    tech_score = min(tech_score, 3)

    return {
        "has_gi_tag": has_gi,
        "material_tier": mat_tier,
        "technique_score": tech_score,
        "description_length": len(clean_text),
    }
