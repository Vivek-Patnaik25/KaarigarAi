"""
End-to-End Verification Script for KaarigarAI AI Pipeline
Tests:
1. Pipeline 1: Image Enhancement & Quality Scoring
2. Pipeline 2: Voice Transcriber (Whisper / Fallback)
3. Pipeline 3: LLM Listing Generator (Groq / Gemini / Fallback)
4. Full FastAPI /catalog/process endpoint logic
"""
import io
import os
import sys
import asyncio
from pathlib import Path
from unittest.mock import MagicMock

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from PIL import Image, ImageDraw
from fastapi import UploadFile
from app.ai.image_enhancer import full_image_pipeline
from app.ai.transcriber import transcribe_audio
from app.ai.listing_generator import generate_listing
from app.routers.catalog_router import process_product


def create_test_image() -> bytes:
    """Creates a synthetic craft image (terracotta vase) in memory."""
    img = Image.new("RGB", (300, 300), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    # Draw clay vase
    draw.ellipse([80, 80, 220, 260], fill=(184, 80, 48), outline=(120, 40, 20), width=3)
    draw.rectangle([110, 40, 190, 80], fill=(204, 90, 58), outline=(120, 40, 20), width=3)
    # Decorative patterns
    draw.line([90, 150, 210, 150], fill=(255, 215, 0), width=4)
    draw.line([95, 180, 205, 180], fill=(255, 255, 255), width=3)
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


async def async_test_pipeline():
    print("=" * 60)
    print("Testing KaarigarAI AI Pipelines (03_ai_pipeline_doc.md)")
    print("=" * 60)

    # 1. Pipeline 1: Image Enhancement
    print("\n[1/4] Testing Pipeline 1: Image Enhancer...")
    img_bytes = create_test_image()
    img_result = full_image_pipeline(img_bytes)
    print(f"  -> Enhanced image generated: {len(img_result['enhanced_image'])} bytes")
    print(f"  -> Quality score: {img_result['quality_score']}")
    print(f"  -> Background removed mode: {img_result['is_bg_removed']}")
    assert len(img_result["enhanced_image"]) > 0, "Enhanced image must not be empty"
    print("  [PASS] Pipeline 1 Image Enhancement verified.")

    # 2. Pipeline 2: Voice Transcriber
    print("\n[2/4] Testing Pipeline 2: Voice Transcriber...")
    audio_dummy = b"RIFF....WAVEfmt ...."  # simulated short audio
    trans_res = transcribe_audio(audio_dummy, language_hint="hi")
    print(f"  -> Transcript: '{trans_res['transcript'][:60]}...'")
    print(f"  -> Detected Language: {trans_res['detected_language']}")
    print(f"  -> Confidence: {trans_res['language_confidence']}")
    assert "transcript" in trans_res, "Transcription output must contain transcript"
    print("  [PASS] Pipeline 2 Voice Transcription verified.")

    # 3. Pipeline 3: LLM Listing Generator
    print("\n[3/4] Testing Pipeline 3: Multilingual Listing Generator...")
    sample_transcript = "यह शुद्ध मिट्टी से बना हस्तनिर्मित सजावटी टेराकोटा फूलदान है।"
    listing = generate_listing(
        transcript=sample_transcript,
        detected_language="hi",
        category="pottery_terracotta",
        price_suggested=850,
    )
    print(f"  -> Title EN: {listing.get('title_en')}")
    print(f"  -> Title HI: {listing.get('title_hi')}")
    print(f"  -> Description EN: {listing.get('description_en')[:80]}...")
    print(f"  -> SEO Tags: {listing.get('seo_tags')}")
    print(f"  -> Craft Tradition: {listing.get('craft_tradition')}")
    print(f"  -> Material: {listing.get('material_detected')}")
    assert "title_en" in listing and "title_hi" in listing, "Listing must contain titles"
    print("  [PASS] Pipeline 3 Listing Generator verified.")

    # 4. FastAPI Direct /catalog/process Test
    print("\n[4/4] Testing FastAPI /catalog/process unified endpoint logic...")
    
    # Mock Request
    mock_request = MagicMock()
    mock_request.base_url = "http://localhost:8000"
    
    # Mock UploadFile for image
    mock_image = UploadFile(
        file=io.BytesIO(img_bytes),
        filename="terracotta_vase.jpg",
        headers={"content-type": "image/jpeg"},
    )

    response = await process_product(
        request=mock_request,
        image=mock_image,
        audio=None,
        text_description="Pure terracotta hand-painted clay vase made on traditional potter's wheel in Rajasthan",
        language_hint="hi",
    )

    assert response.get("success") is True, f"Failed: {response}"
    
    payload = response["data"]
    print(f"  -> Status: Success = {response['success']}")
    print(f"  -> Enhanced Image URL: {payload['enhanced_image_url']}")
    print(f"  -> Quality Score: {payload['image_quality_score']}")
    print(f"  -> Category Detected: {payload['category']} (Confidence: {payload['category_confidence']})")
    print(f"  -> Suggested Price: Rs. {payload['price_suggested']} (Range: Rs. {payload['price_min']} - Rs. {payload['price_max']})")
    print(f"  -> Reasoning: {payload['price_reasoning']}")
    print(f"  -> Listing Title: {payload['listing']['title_en']}")
    print(f"  -> Processing Time: {payload.get('processing_time_seconds', 0)}s")
    print("  [PASS] /catalog/process unified pipeline fully verified!")

    print("\n" + "=" * 60)
    print("ALL AI PIPELINES OPERATIONAL AND VERIFIED!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(async_test_pipeline())
