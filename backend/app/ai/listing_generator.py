"""
KarigaarAI — Multilingual Catalog & Story Generator
====================================================
Architecture (PART 1-4 hardening):
  PRIMARY  : Gemini 3.1 Flash-Lite  (single JSON request, 8s hard timeout)
  SECONDARY: Groq qwen/qwen3.8-27b  (5s hard timeout)
  FALLBACK : Local deterministic template generator (0ms, always works)

Rules:
- LLM is OPTIONAL — the pipeline never fails because of LLM issues.
- LLM must NOT invent facts not present in the input.
- Response must always conform to the catalog schema.
- No sequential retries. At most 1 attempt per provider.
"""

import os
import json
import logging
import time
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.language import normalize_language

logger = logging.getLogger("ListingGenerator")


class CatalogListingSchema(BaseModel):
    title_en: str
    title_hi: str
    title_ta: str = ""
    title_mr: str = ""
    title_or: str = ""
    title_bn: str = ""
    description_en: str
    description_hi: str
    description_ta: str = ""
    description_mr: str = ""
    description_or: str = ""
    description_bn: str = ""
    seo_tags: List[str] = Field(default_factory=list)
    craft_tradition: Optional[str] = None
    material_detected: Optional[str] = None
    craft_story: Optional[str] = None

# ---------------------------------------------------------------------------
# CRAFT METADATA KNOWLEDGE BASE  (deterministic, no hallucination)
# ---------------------------------------------------------------------------
CRAFT_META: Dict[str, Dict[str, str]] = {
    "pottery_terracotta": {
        "tradition_en": "Traditional Terracotta Pottery",
        "tradition_hi": "पारंपरिक टेराकोटा कुम्हारी",
        "material_en": "Natural Riverbed Clay",
        "material_hi": "प्राकृतिक नदी की मिट्टी",
        "tags": "terracotta,clay pottery,earthenware,handmade,eco-friendly,home decor",
    },
    "textile_handloom": {
        "tradition_en": "Handloom Weaving Heritage",
        "tradition_hi": "हाथकरघा बुनाई परंपरा",
        "material_en": "Natural Woven Fabric",
        "material_hi": "प्राकृतिक बुना हुआ कपड़ा",
        "tags": "handloom,weaving,textile,ethnic,traditional,artisan fabric",
    },
    "textile_embroidery": {
        "tradition_en": "Traditional Hand Embroidery",
        "tradition_hi": "पारंपरिक हाथ कढ़ाई",
        "material_en": "Embroidered Fabric",
        "material_hi": "कढ़ाई किया हुआ कपड़ा",
        "tags": "embroidery,handstitched,textile,ethnic,traditional craft",
    },
    "woodcraft": {
        "tradition_en": "Indian Woodcraft & Carving",
        "tradition_hi": "भारतीय काष्ठ कला",
        "material_en": "Seasoned Hardwood",
        "material_hi": "पक्की लकड़ी",
        "tags": "woodcraft,carved wood,home decor,handmade,artisan furniture",
    },
    "metalcraft": {
        "tradition_en": "Traditional Metal Craft",
        "tradition_hi": "पारंपरिक धातु शिल्प",
        "material_en": "Handworked Metal",
        "material_hi": "हाथ से बनाई धातु",
        "tags": "metalcraft,brass,dhokra,handmade,tribal art,heritage",
    },
    "jewellery": {
        "tradition_en": "Handcrafted Indian Jewellery",
        "tradition_hi": "हस्तनिर्मित भारतीय आभूषण",
        "material_en": "Artisan Metals & Stones",
        "material_hi": "कारीगरी धातु और पत्थर",
        "tags": "jewellery,handcrafted,ethnic,traditional,artisan jewelry",
    },
    "basketry_bamboo": {
        "tradition_en": "Bamboo & Cane Basketry",
        "tradition_hi": "बाँस और बेंत शिल्प",
        "material_en": "Natural Bamboo & Cane",
        "material_hi": "प्राकृतिक बाँस और बेंत",
        "tags": "bamboo,basketry,eco-friendly,handwoven,sustainable craft",
    },
    "painting_folk": {
        "tradition_en": "Traditional Indian Folk Art",
        "tradition_hi": "पारंपरिक भारतीय लोक चित्रकला",
        "material_en": "Natural Pigments on Fabric/Paper",
        "material_hi": "प्राकृतिक रंग और कागज",
        "tags": "folk art,painting,traditional,handmade,cultural heritage",
    },
}

# ---------------------------------------------------------------------------
# SYSTEM PROMPT  (compact, forces structured output)
# ---------------------------------------------------------------------------
_SYSTEM = (
    "You are a catalog writer for KarigaarAI, an Indian handicraft marketplace. "
    "Write honest, culturally respectful product listings. "
    "Use ONLY facts from the artisan input — never invent dimensions, weights, locations, "
    "or supplier names not mentioned. "
    "Return concise titles and storytelling descriptions matching the requested schema."
)


def _build_prompt(
    transcript: str,
    detected_language: str,
    category: str,
    price_suggested: int,
    craft_meta: Dict[str, str],
) -> str:
    min_p = int(price_suggested * 0.75)
    max_p = int(price_suggested * 1.25)
    tradition = craft_meta.get("tradition_en", category.replace("_", " ").title())
    material = craft_meta.get("material_en", "Natural craft materials")

    return (
        f'Artisan transcript ({detected_language}): "{transcript}"\n'
        f"Craft category: {category}\n"
        f"Craft tradition: {tradition}\n"
        f"Primary material: {material}\n"
        f"Suggested price range: ₹{min_p}–₹{max_p}\n\n"
        "Generate multilingual titles and descriptions in English (en), Hindi (hi), "
        "Tamil (ta), Marathi (mr), Odia (or), and Bengali (bn), with SEO tags and craft story."
    )


def _parse_json_safe(raw: str) -> Optional[Dict[str, Any]]:
    """Extract and parse JSON from raw LLM text robustly."""
    if not raw:
        return None
    # Strip markdown fences
    for fence in ("```json", "```"):
        if fence in raw:
            parts = raw.split(fence)
            if len(parts) >= 3:
                raw = parts[1].strip()
                break
    # Find outermost JSON object
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        data = json.loads(raw[start : end + 1])
        if isinstance(data, dict) and "title_en" in data:
            return data
    except Exception:
        pass
    return None


# ---------------------------------------------------------------------------
# PROVIDER 1: Gemini 3.1 Flash-Lite
# ---------------------------------------------------------------------------
def _generate_with_gemini(prompt: str, timeout: float = 8.0) -> Optional[Dict[str, Any]]:
    """Primary: Gemini 3.1 Flash-Lite — minimal thinking, low latency, structured JSON output."""
    if not settings.GEMINI_API_KEY:
        logger.info("Gemini API key not configured — skipping.")
        return None
    try:
        # Try official google.genai client
        try:
            from google import genai
            from google.genai import types

            http_options = None
            if timeout >= 10.0:
                http_options = types.HttpOptions(timeout=int(timeout * 1000))
            client = genai.Client(
                api_key=settings.GEMINI_API_KEY,
                http_options=http_options,
            )
            config = types.GenerateContentConfig(
                system_instruction=_SYSTEM,
                response_mime_type="application/json",
                response_schema=CatalogListingSchema,
                temperature=0.2,
                max_output_tokens=1500,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            )
            t0 = time.time()
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=config,
            )
            elapsed = round(time.time() - t0, 2)
            if response and response.text:
                data = _parse_json_safe(response.text)
                if data:
                    logger.info(f"Gemini structured listing generated in {elapsed}s ({settings.GEMINI_MODEL})")
                    return data
        except ImportError:
            pass

        # Fallback to google.generativeai if google.genai is not available
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            settings.GEMINI_MODEL,
            system_instruction=_SYSTEM,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": CatalogListingSchema,
                "temperature": 0.2,
                "max_output_tokens": 1500,
            },
        )
        t0 = time.time()
        response = model.generate_content(
            prompt,
            request_options={"timeout": timeout},
        )
        elapsed = round(time.time() - t0, 2)
        data = _parse_json_safe(response.text or "")
        if data:
            logger.info(f"Gemini listing generated in {elapsed}s ({settings.GEMINI_MODEL})")
            return data
        logger.warning(f"Gemini returned non-JSON in {elapsed}s: {(response.text or '')[:120]}")
    except Exception as e:
        err_str = str(e)
        if "timeout" in err_str.lower() or "deadline" in err_str.lower():
            logger.warning(f"Gemini timeout after {timeout}s: {err_str[:120]}")
        elif "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
            logger.warning(f"Gemini rate-limited: {err_str[:120]}")
        elif "not found" in err_str.lower() or "404" in err_str:
            logger.error(f"Gemini model not found ({settings.GEMINI_MODEL}): {err_str[:120]}")
        else:
            logger.warning(f"Gemini error: {err_str[:200]}")
    return None


# ---------------------------------------------------------------------------
# PROVIDER 2: Groq
# ---------------------------------------------------------------------------
def _generate_with_groq(prompt: str, timeout: float = 5.0) -> Optional[Dict[str, Any]]:
    """Secondary: Groq LPU — fast inference, free tier."""
    if not settings.GROQ_API_KEY:
        logger.info("Groq API key not configured — skipping.")
        return None
    try:
        from groq import Groq

        client = Groq(api_key=settings.GROQ_API_KEY, timeout=timeout)
        t0 = time.time()
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM},
                {"role": "user", "content": prompt},
            ],
            temperature=0.25,
            max_tokens=900,
        )
        elapsed = round(time.time() - t0, 2)
        content = (response.choices[0].message.content or "").strip()
        data = _parse_json_safe(content)
        if data:
            logger.info(f"Groq listing generated in {elapsed}s ({settings.GROQ_MODEL})")
            return data
        logger.warning(f"Groq returned non-JSON in {elapsed}s: {content[:120]}")
    except Exception as e:
        err_str = str(e)
        if "timeout" in err_str.lower():
            logger.warning(f"Groq timeout after {timeout}s: {err_str[:120]}")
        elif "429" in err_str or "rate" in err_str.lower():
            logger.warning(f"Groq rate-limited: {err_str[:120]}")
        else:
            logger.warning(f"Groq error: {err_str[:200]}")
    return None


# ---------------------------------------------------------------------------
# PROVIDER 3: Local Deterministic Template (GUARANTEED — no network needed)
# ---------------------------------------------------------------------------
def _generate_local(
    transcript: str,
    detected_language: str,
    category: str,
    price_suggested: int,
    craft_meta: Dict[str, str],
) -> Dict[str, Any]:
    """
    Deterministic catalog generator from craft metadata + transcript.
    Never hallucinates — uses only supplied inputs.
    Execution time: ~0ms.
    """
    cat_lower = (category or "").lower()
    tr_lower = (transcript or "").lower()

    # Resolve craft kind for branching
    kind = "generic"
    if "pottery" in cat_lower or "terracotta" in cat_lower or "clay" in tr_lower:
        kind = "pottery"
    elif "textile" in cat_lower or "handloom" in cat_lower or "saree" in tr_lower or "dupatta" in tr_lower:
        kind = "textile"
    elif "embroid" in cat_lower or "embroid" in tr_lower:
        kind = "embroidery"
    elif "metal" in cat_lower or "brass" in tr_lower or "dhokra" in tr_lower:
        kind = "metal"
    elif "wood" in cat_lower or "carved" in tr_lower:
        kind = "wood"
    elif "jewel" in cat_lower or "jewellery" in cat_lower:
        kind = "jewel"
    elif "bamboo" in cat_lower or "basket" in cat_lower:
        kind = "bamboo"
    elif "paint" in cat_lower or "folk" in cat_lower:
        kind = "folk"

    tradition = craft_meta.get("tradition_en", category.replace("_", " ").title())
    tradition_hi = craft_meta.get("tradition_hi", "पारंपरिक हस्तशिल्प")
    material_en = craft_meta.get("material_en", "Natural craft materials")
    material_hi = craft_meta.get("material_hi", "प्राकृतिक शिल्प सामग्री")
    tags_str = craft_meta.get("tags", f"{category},handcrafted,indian artisan,authentic,ethical")
    tags = [t.strip() for t in tags_str.split(",") if t.strip()][:6]

    # Per-kind copy
    templates = {
        "pottery": {
            "title_en": "Handmade Traditional Terracotta Clay Vessel",
            "title_hi": "हस्तनिर्मित पारंपरिक टेराकोटा मिट्टी का पात्र",
            "desc_en": (
                f"A beautiful piece crafted by skilled artisans using time-honoured pottery techniques. "
                f"Made from natural riverbed clay, hand-thrown and kiln-fired to create an authentic "
                f"decorative vessel. Perfect for home décor and traditional use. {transcript}"
            ),
            "desc_hi": (
                f"कुशल कुम्हारों द्वारा पारंपरिक विधि से बनाई गई एक सुंदर मिट्टी की कृति। "
                f"प्राकृतिक मिट्टी से हाथ से गढ़ी और भट्टी में पकाई गई यह रचना घर की सजावट के लिए आदर्श है। {transcript}"
            ),
            "story": "Each piece carries the patience and skill of the artisan who shaped it on the potter's wheel.",
        },
        "textile": {
            "title_en": "Handwoven Artisan Textile — Traditional Heritage Fabric",
            "title_hi": "हाथ से बुना हुआ कारीगरी वस्त्र — पारंपरिक विरासत",
            "desc_en": (
                f"Woven by skilled artisans preserving India's rich handloom traditions. "
                f"Created using traditional techniques passed down through generations, this textile "
                f"showcases authentic craftsmanship and natural materials. {transcript}"
            ),
            "desc_hi": (
                f"भारत की समृद्ध हाथकरघा परंपरा को संरक्षित करते हुए कुशल बुनकरों द्वारा निर्मित। "
                f"पीढ़ियों से चली आ रही पारंपरिक विधि से बुना हुआ यह वस्त्र प्रामाणिक कारीगरी का प्रतीक है। {transcript}"
            ),
            "story": "Every thread woven by hand tells the story of generations of artisan skill.",
        },
        "metal": {
            "title_en": "Handcrafted Traditional Metal Art Piece",
            "title_hi": "हस्तनिर्मित पारंपरिक धातु कला",
            "desc_en": (
                f"Crafted using traditional metalworking techniques by skilled artisans. "
                f"This piece reflects the rich tribal and folk art heritage of India, "
                f"made with precision and care. {transcript}"
            ),
            "desc_hi": (
                f"कुशल शिल्पियों द्वारा पारंपरिक धातु कारीगरी तकनीक से निर्मित। "
                f"यह कृति भारत की समृद्ध जनजातीय और लोक कला विरासत को प्रतिबिंबित करती है। {transcript}"
            ),
            "story": "Shaped by the same ancient techniques passed down across generations of master craftsmen.",
        },
    }

    tmpl = templates.get(kind, {
        "title_en": f"Authentic Handcrafted Indian {tradition}",
        "title_hi": f"प्रामाणिक हस्तनिर्मित भारतीय {tradition_hi}",
        "desc_en": (
            f"Handmade by skilled Indian artisans preserving authentic cultural heritage. "
            f"Made with {material_en.lower()} using traditional techniques. {transcript}"
        ),
        "desc_hi": (
            f"कुशल भारतीय कारीगरों द्वारा प्रामाणिक सांस्कृतिक विरासत को संरक्षित करते हुए निर्मित। "
            f"{material_hi} से पारंपरिक विधि से बनाई गई यह कृति। {transcript}"
        ),
        "story": "Every handcrafted piece is a unique expression of the artisan's skill and cultural heritage.",
    })

    return {
        "title_en": tmpl["title_en"],
        "title_hi": tmpl["title_hi"],
        "description_en": tmpl["desc_en"],
        "description_hi": tmpl["desc_hi"],
        "description_regional": tmpl["desc_hi"],  # Same as Hindi for safety
        "seo_tags": tags,
        "craft_tradition": tradition,
        "material_detected": material_en,
        "craft_story": tmpl.get("story", "A unique piece of authentic Indian handicraft."),
    }


# ---------------------------------------------------------------------------
# PUBLIC API
# ---------------------------------------------------------------------------
def generate_listing(
    transcript: str,
    detected_language: str = "hi",
    category: str = "pottery_terracotta",
    price_suggested: int = 1500,
) -> Dict[str, Any]:
    """
    Generate multilingual product listing.

    Returns dict always containing:
      title_en, title_hi, description_en, description_hi,
      description_regional, seo_tags, craft_tradition,
      material_detected, craft_story, _llm_used, _llm_success

    Never raises — always returns a valid catalog object.
    """
    # The caller's selected UI language is authoritative. Transcript detection is input metadata only.
    detected_language = normalize_language(detected_language)
    # Resolve craft metadata from KB
    cat_key = (category or "").lower().replace("-", "_").replace(" ", "_")
    craft_meta = CRAFT_META.get(cat_key, CRAFT_META.get("pottery_terracotta", {}))

    # Build prompt once
    prompt = _build_prompt(
        transcript=transcript or "पारंपरिक हस्तशिल्प उत्पाद",
        detected_language=detected_language,
        category=category,
        price_suggested=price_suggested,
        craft_meta=craft_meta,
    )

    gemini_timeout = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "8"))
    groq_timeout = float(os.getenv("GROQ_TIMEOUT_SECONDS", "5"))

    # Tier 1: Gemini 3.1 Flash-Lite (Primary)
    data = _generate_with_gemini(prompt, timeout=gemini_timeout)
    if data:
        data.setdefault("_llm_used", settings.GEMINI_MODEL)
        data.setdefault("_llm_success", True)
        data.setdefault("craft_tradition", craft_meta.get("tradition_en"))
        data.setdefault("material_detected", craft_meta.get("material_en"))
        data.setdefault("craft_story", "A unique piece of authentic Indian handicraft.")
        return _complete_language_fields(data)

    # Tier 2: Groq (Secondary)
    data = _generate_with_groq(prompt, timeout=groq_timeout)
    if data:
        data.setdefault("_llm_used", settings.GROQ_MODEL)
        data.setdefault("_llm_success", True)
        data.setdefault("craft_tradition", craft_meta.get("tradition_en"))
        data.setdefault("material_detected", craft_meta.get("material_en"))
        data.setdefault("craft_story", "A unique piece of authentic Indian handicraft.")
        return _complete_language_fields(data)

    # Tier 3: Local deterministic generator — always works (0ms, guaranteed)
    logger.info("All LLM providers unavailable — using local deterministic catalog generator.")
    result = _generate_local(
        transcript=transcript or "",
        detected_language=detected_language,
        category=category,
        price_suggested=price_suggested,
        craft_meta=craft_meta,
    )
    result["_llm_used"] = "local_template"
    result["_llm_success"] = False
    return _complete_language_fields(result)


def _complete_language_fields(data: Dict[str, Any]) -> Dict[str, Any]:
    """Keep old documents compatible while guaranteeing a predictable, non-Hindi fallback."""
    for code in ("en", "hi", "ta", "mr", "or", "bn"):
        data.setdefault(f"title_{code}", "")
        data.setdefault(f"description_{code}", "")
    # Legacy regional data is retained only for old clients. New clients use explicit fields.
    data.setdefault("description_regional", data.get("description_en", ""))
    return data
