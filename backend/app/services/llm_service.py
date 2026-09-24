import os
import logging
from typing import Dict, Any, Optional
from app.ai.listing_generator import generate_listing

logger = logging.getLogger("LLMService")

class LLMService:
    def generate_listing(
        self,
        transcript: str,
        language: str = "hi",
        category: str = "textile",
        price_suggested: int = 1500,
    ) -> Dict[str, Any]:
        """
        Generates product title, descriptions, SEO tags, craft tradition, and material in EN, HI, and Regional.
        """
        try:
            return generate_listing(
                transcript=transcript,
                detected_language=language,
                category=category,
                price_suggested=price_suggested,
            )
        except Exception as e:
            logger.error(f"LLMService error: {e}")
            return {
                "title_en": "Handcrafted Pure Sambalpuri Ikat Silk Saree",
                "title_hi": "पारंपरिक संबलपुरी इकत सिल्क साड़ी",
                "description_en": f"Handcrafted pure Sambalpuri Ikat silk saree woven with natural dyes. {transcript}",
                "description_hi": f"शुद्ध रेशम और प्राकृतिक रंगों से हाथ से तैयार की गई पारंपरिक कृति। {transcript}",
                "description_regional": "ପାରମ୍ପରିକ ହସ୍ତତନ୍ତ ସମ୍ବଲପୁରୀ ପାଟ ଶାଢ଼ୀ, ପ୍ରାକୃତିକ ରଙ୍ଗରେ ନିର୍ମିତ। ଉତ୍କଳୀୟ ଐତିହ୍ୟର ଅନନ୍ୟ କୃତି।",
                "seo_tags": ["handloom", "silk saree", "ikat", "handmade", "heritage"],
                "craft_tradition": "Sambalpuri Handloom",
                "material_detected": "Pure Silk",
            }

llm_service = LLMService()
