"""Canonical language contract for every catalog API boundary."""
from typing import Any

DEFAULT_LANGUAGE = "en"
SUPPORTED_LANGUAGE_CODES = {"en", "hi", "ta", "mr", "or", "bn"}
_ALIASES = {
    "english": "en", "en-in": "en", "hindi": "hi", "hi-in": "hi", "हिंदी": "hi", "हिन्दी": "hi",
    "tamil": "ta", "ta-in": "ta", "தமிழ்": "ta", "marathi": "mr", "mr-in": "mr", "मराठी": "mr",
    "odia": "or", "oriya": "or", "or-in": "or", "ଓଡ଼ିଆ": "or", "bengali": "bn", "bangla": "bn", "bn-in": "bn",
}

def normalize_language(value: Any, default: str = DEFAULT_LANGUAGE) -> str:
    code = str(value or "").strip().lower().replace("_", "-")
    if code in SUPPORTED_LANGUAGE_CODES:
        return code
    return _ALIASES.get(code, default)
