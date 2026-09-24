import os
import json
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("ListingGenerator")

SYSTEM_PROMPT = """You are an expert product listing writer for an Indian handicrafts marketplace (KaarigarAI).
You help rural artisans present their handmade products professionally to global and domestic buyers.
You write compelling, SEO-friendly product descriptions that highlight authenticity, cultural heritage, and handmade craftsmanship.

RULES:
1. Never fabricate specifications (size, weight) not mentioned or implied by the input.
2. Always mention the craft tradition or origin if detectable from the transcript.
3. Keep descriptions honest, respectful, and grounded in artisan pride.
4. Return ONLY valid JSON, with no markdown fences, no preamble, and no explanation.
"""

def _build_user_prompt(
    transcript: str,
    detected_language: str,
    category: str,
    price_suggested: int,
) -> str:
    min_p = int(price_suggested * 0.75) if price_suggested else 500
    max_p = int(price_suggested * 1.25) if price_suggested else 2500
    return f"""An artisan described their handmade product in {detected_language}:
"{transcript}"

Product category: {category}
Suggested price range: ₹{min_p} – ₹{max_p}

Generate a comprehensive product listing. Return ONLY this JSON structure:
{{
  "title_en": "concise product title in English (max 10 words)",
  "title_hi": "same title in Hindi (Devanagari script)",
  "description_en": "2-3 paragraph English description highlighting craftsmanship, authenticity, and heritage.",
  "description_hi": "rich description in Hindi (Devanagari script)",
  "description_regional": "rich description in {detected_language} (native script e.g. Odia, Bengali, Tamil, etc.)",
  "seo_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "craft_tradition": "craft tradition name if identifiable or null",
  "material_detected": "primary material if identifiable or null"
}}
"""


def _generate_with_groq(prompt: str) -> Optional[Dict[str, Any]]:
    """Generates listing using Groq API (Llama 3.1 8B Instant)."""
    if not settings.GROQ_API_KEY:
        return None

    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=900,
        )
        content = response.choices[0].message.content.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1:
            content = content[start:end+1]
        data = json.loads(content)
        logger.info("Successfully generated listing via Groq API.")
        return data
    except Exception as e:
        logger.warning(f"Groq API listing generation error: {e}")
        return None


def _generate_with_gemini(prompt: str) -> Optional[Dict[str, Any]]:
    """Fallback generator using Google Gemini API."""
    if not settings.GEMINI_API_KEY:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT,
            generation_config={"response_mime_type": "application/json", "temperature": 0.3},
        )
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean potential markdown fences
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        data = json.loads(text.strip())
        logger.info("Successfully generated listing via Gemini API.")
        return data
    except Exception as e:
        logger.warning(f"Gemini API listing generation error: {e}")
        return None


def _generate_fallback_template(
    transcript: str,
    detected_language: str,
    category: str,
    price_suggested: int,
) -> Dict[str, Any]:
    """
    Intelligent craft-aware template generator when external cloud APIs are unreachable.
    """
    category_lower = category.lower() if category else "textile"
    
    if "textile" in category_lower or "saree" in transcript.lower():
        title_en = "Handcrafted Pure Sambalpuri Ikat Silk Saree"
        title_hi = "पारंपरिक संबलपुरी इकत सिल्क साड़ी"
        desc_en = (
            f"Handwoven with pure natural silk by master artisans. "
            f"Featuring authentic traditional Ikat motifs and rich heritage patterns. {transcript}"
        )
        desc_hi = (
            f"शुद्ध रेशम और प्राकृतिक रंगों से हाथ से तैयार की गई पारंपरिक कृति। "
            f"भारतीय हस्तकला की अमूल्य धरोहर। {transcript}"
        )
        desc_reg = "ପାରମ୍ପରିକ ହସ୍ତତନ୍ତ ସମ୍ବଲପୁରୀ ପାଟ ଶାଢ଼ୀ, ପ୍ରାକୃତିକ ରଙ୍ଗରେ ନିର୍ମିତ। ଉତ୍କଳୀୟ ଐତିହ୍ୟର ଅନନ୍ୟ କୃତି।"
        tags = ["handloom", "silk saree", "ikat", "sambalpuri", "ethnic wear"]
        tradition = "Sambalpuri Handloom (GI Tagged)"
        material = "Pure Mulberry Silk"
    elif "pottery" in category_lower or "clay" in transcript.lower():
        title_en = "Handmade Terracotta Clay Decorative Vessel"
        title_hi = "हस्तनिर्मित टेराकोटा मिट्टी का सजावटी पात्र"
        desc_en = (
            f"Carefully hand-thrown on the potter's wheel and wood-fired. "
            f"Showcasing timeless rural craftsmanship and organic earthy aesthetics. {transcript}"
        )
        desc_hi = f"कुम्हार के चाक पर प्यार से गढ़ी गई शुद्ध मिट्टी की हस्तशिल्प कृति। {transcript}"
        desc_reg = "ପାରମ୍ପରିକ ମାଟିପାତ୍ର ଏବଂ ହସ୍ତଶିଳ୍ପ।"
        tags = ["terracotta", "clay pottery", "home decor", "handmade", "eco friendly"]
        tradition = "Traditional Terracotta Pottery"
        material = "Natural Riverbed Clay"
    elif "metal" in category_lower or "dhokra" in transcript.lower() or "brass" in transcript.lower():
        title_en = "Handcrafted Dhokra Brass Tribal Figurine"
        title_hi = "हस्तनिर्मित ढोकरा पीतल जनजातीय कलाकृति"
        desc_en = (
            f"Cast using the ancient lost-wax technique passed down across generations. "
            f"Exemplifies authentic tribal folk art. {transcript}"
        )
        desc_hi = f"प्राचीन मोम-ढलाई पद्धति द्वारा निर्मित प्रामाणिक ढोकरा पीतल शिल्प। {transcript}"
        desc_reg = "ପାରମ୍ପରିକ ଢୋକ୍ରା ପିତ୍ତଳ ହସ୍ତଶିଳ୍ପ।"
        tags = ["dhokra", "brass art", "tribal craft", "lost wax casting", "heritage"]
        tradition = "Dhokra Lost-Wax Art"
        material = "Solid Brass & Bronze"
    else:
        title_en = f"Authentic Handcrafted Indian {category.title()} Art"
        title_hi = f"प्रामाणिक हस्तनिर्मित भारतीय {category} शिल्प"
        desc_en = f"Handmade by skilled Indian artisans celebrating authentic cultural heritage. {transcript}"
        desc_hi = f"कुशल कारीगरों द्वारा हस्तनिर्मित प्रामाणिक भारतीय शिल्प। {transcript}"
        desc_reg = f"ପାରମ୍ପରିକ ଭାରତୀୟ ହସ୍ତକଳା। {transcript}"
        tags = [category.lower(), "handcrafted", "indian artisan", "authentic", "ethical"]
        tradition = f"Traditional Indian {category.title()}"
        material = "Natural Craft Materials"

    return {
        "title_en": title_en,
        "title_hi": title_hi,
        "description_en": desc_en,
        "description_hi": desc_hi,
        "description_regional": desc_reg,
        "seo_tags": tags,
        "craft_tradition": tradition,
        "material_detected": material,
    }


def generate_listing(
    transcript: str,
    detected_language: str = "hi",
    category: str = "textile",
    price_suggested: int = 1500,
) -> Dict[str, Any]:
    """
    Generate full product listing in English, Hindi, and Regional Language.
    Primary: Groq API (llama-3.1-8b-instant)
    Secondary: Google Gemini API (gemini-1.5-flash)
    Fallback: Intelligent craft-aware template
    """
    prompt = _build_user_prompt(
        transcript=transcript,
        detected_language=detected_language,
        category=category,
        price_suggested=price_suggested,
    )

    # 1. Try Groq API
    data = _generate_with_groq(prompt)
    if data and isinstance(data, dict) and "description_en" in data:
        return data

    # 2. Try Gemini API
    data = _generate_with_gemini(prompt)
    if data and isinstance(data, dict) and "description_en" in data:
        return data

    # 3. Use craft-aware template fallback
    logger.info("Using intelligent craft template fallback for listing.")
    return _generate_fallback_template(
        transcript=transcript,
        detected_language=detected_language,
        category=category,
        price_suggested=price_suggested,
    )
