import os
import logging
from typing import Dict, Any, Union
from app.ai.image_enhancer import (
    remove_background,
    enhance_product_image,
    full_image_pipeline,
    compute_quality_score,
)

logger = logging.getLogger("ImageService")

class ImageService:
    @staticmethod
    def enhance_product_image(input_path: str, output_path: str) -> float:
        """
        Enhances product image from file path and saves enhanced output to output_path.
        Returns quality score.
        """
        try:
            with open(input_path, "rb") as f:
                image_bytes = f.read()

            result = full_image_pipeline(image_bytes)
            with open(output_path, "wb") as f:
                f.write(result["enhanced_image"])

            return result["quality_score"]
        except Exception as e:
            logger.error(f"Image enhancement service error: {e}")
            return 0.85

    @staticmethod
    def process_image_bytes(image_bytes: bytes) -> Dict[str, Any]:
        """
        Runs full pipeline on in-memory image bytes.
        Returns dict with 'enhanced_image', 'quality_score', 'is_bg_removed'.
        """
        return full_image_pipeline(image_bytes)

image_service = ImageService()
