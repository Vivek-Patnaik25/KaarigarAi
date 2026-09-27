import os
import shutil
import time
import logging
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, Body, Request, Query, HTTPException
from app.core.config import settings
from app.core.responses import ApiResponse
from app.core.language import normalize_language
from app.models.schemas import (
    GenerateListingRequest,
    PredictPriceRequest,
    ProductListingPublishRequest,
    ProcessProductData,
)
from app.ai.image_enhancer import full_image_pipeline
from app.ai.transcriber import transcribe_audio
from app.ai.listing_generator import generate_listing
from app.services.image_service import image_service
from app.services.image_storage_service import image_storage_service
from app.services.speech_service import speech_service
from app.services.llm_service import llm_service
from app.services.product_service import product_service
from app.ml.classifier import classifier
from app.ml.price_predictor import price_predictor

logger = logging.getLogger("CatalogRouter")
router = APIRouter(prefix="/catalog", tags=["Catalog Pipeline"])


@router.post("/process", summary="Execute end-to-end AI & ML Catalog Pipeline")
async def process_product(
    request: Request,
    image: UploadFile = File(...),
    audio: Optional[UploadFile] = File(None),
    text_description: Optional[str] = Form(None),
    language_hint: Optional[str] = Form(None),
):
    """
    Unified Endpoint that executes all 3 AI Pipelines + ML Classification & Price Prediction:
      1. Image Enhancement & Studio Background Removal (REMBG + OpenCV)
      2. Multilingual Voice Transcription (Faster-Whisper int8)
      3. ML Craft Category Classification (CLIP ViT-B/32)
      4. Multimodal Price Prediction & Reasoning (Stacking Ensemble)
      5. Multilingual Listing Generation (Groq / Gemini APIs in EN, HI, Regional)
      6. Persistent GridFS Image Store (MongoDB)
    """
    try:
        t0 = time.time()
        # 1. Image Pipeline
        image_bytes = await image.read()
        image_result = full_image_pipeline(image_bytes)

        # Save enhanced image to temp folder for immediate retrieval / preview
        clean_filename = f"enhanced_{int(time.time() * 1000)}.jpg"
        enhanced_path = settings.TEMP_DIR / clean_filename
        with open(enhanced_path, "wb") as f:
            f.write(image_result["enhanced_image"])

        # Also store enhanced image in MongoDB GridFS for permanent persistence
        base_url = str(request.base_url).rstrip("/")
        gridfs_ref = await image_storage_service.store_image(
            image_data=image_result["enhanced_image"],
            filename=clean_filename,
            content_type="image/jpeg",
            metadata={
                "original_filename": image.filename,
                "stage": "preview",
                "status": "preview",
                "created_at_ts": time.time(),
            }
        )

        if gridfs_ref and gridfs_ref.get("file_id"):
            enhanced_image_url = f"{base_url}/v1/media/{gridfs_ref['file_id']}"
        else:
            enhanced_image_url = f"{base_url}/temp/{clean_filename}"

        # 2. Voice / Text Transcription Pipeline
        selected_language = normalize_language(language_hint)
        transcript = ""
        detected_language = selected_language
        language_confidence = 1.0

        if audio and audio.filename:
            audio_bytes = await audio.read()
            if len(audio_bytes) > 0:
                audio_result = transcribe_audio(audio_bytes, language_hint=selected_language)
                transcript = audio_result["transcript"]
                detected_language = audio_result["detected_language"]
                language_confidence = audio_result["language_confidence"]

        if not transcript and text_description:
            transcript = text_description.strip()
            detected_language = selected_language
            language_confidence = 1.0

        if not transcript:
            transcript = "Handmade traditional craft product."

        # 3. ML Craft Category Classifier (Fine-Tuned CLIP ViT-B/32)
        category_result = classifier.classify_from_bytes(image_bytes, description=transcript)
        category = category_result["category"]
        category_confidence = category_result["confidence"]

        # 4. ML Price Predictor (Stacking Ensemble Engine)
        price_result = price_predictor.predict(
            category=category,
            description=transcript,
            image_path=str(enhanced_path),
        )

        # 5. LLM Multilingual Listing Generator (Groq / Gemini API)
        listing = generate_listing(
            transcript=transcript,
            # Output language is the canonical UI choice, never the detected transcript language.
            detected_language=selected_language,
            category=category,
            price_suggested=price_result["price_suggested"],
        )

        total_elapsed = round(time.time() - t0, 2)
        logger.info(f"Full catalog pipeline processed in {total_elapsed}s for category '{category}'.")

        return ApiResponse.ok({
            "enhanced_image_url": enhanced_image_url,
            "image_url": enhanced_image_url,
            "image_quality_score": image_result["quality_score"],
            "transcript": transcript,
            "detected_language": detected_language,
            "selected_language": selected_language,
            "language_confidence": language_confidence,
            "category": category,
            "category_confidence": category_confidence,
            "price_min": price_result["price_min"],
            "price_suggested": price_result["price_suggested"],
            "price_max": price_result["price_max"],
            "price_reasoning": price_result["reasoning"],
            "listing": listing,
            "processing_time_seconds": total_elapsed,
            # LLM metadata — tells frontend whether AI story was generated or local fallback used
            "llm_used": listing.pop("_llm_used", "unknown"),
            "llm_success": listing.pop("_llm_success", False),
        })

    except Exception as e:
        logger.error(f"Catalog processing pipeline error: {e}", exc_info=True)
        return ApiResponse.fail(f"Catalog pipeline processing failed: {str(e)}")


@router.post("/enhance-image", summary="Enhance product image & remove background")
async def enhance_image(request: Request, image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        image_result = full_image_pipeline(image_bytes)

        clean_filename = f"enhanced_{int(time.time() * 1000)}.jpg"
        output_path = settings.TEMP_DIR / clean_filename
        with open(output_path, "wb") as f:
            f.write(image_result["enhanced_image"])

        base_url = str(request.base_url).rstrip("/")
        enhanced_url = f"{base_url}/temp/{clean_filename}"

        return ApiResponse.ok({
            "enhanced_image_url": enhanced_url,
            "quality_score": image_result["quality_score"],
        })
    except Exception as e:
        logger.error(f"Image enhancement failed: {e}")
        return ApiResponse.fail(f"Image enhancement error: {str(e)}")


@router.post("/transcribe", summary="Transcribe artisan voice description")
async def transcribe(
    audio: UploadFile = File(...),
    language_hint: str = Form(None),
):
    try:
        audio_bytes = await audio.read()
        result = transcribe_audio(audio_bytes, language_hint=normalize_language(language_hint))
        return ApiResponse.ok(result)
    except Exception as e:
        logger.error(f"Audio transcription failed: {e}")
        return ApiResponse.fail(f"Audio transcription error: {str(e)}")


@router.post("/generate-listing", summary="Generate multi-language product listings")
async def generate_listing_endpoint(payload: GenerateListingRequest):
    try:
        listing_data = generate_listing(
            transcript=payload.transcript,
            detected_language=normalize_language(payload.language),
            category=payload.category or "textile",
            price_suggested=payload.price_suggested or 1500,
        )
        return ApiResponse.ok(listing_data)
    except Exception as e:
        logger.error(f"Listing generation failed: {e}")
        return ApiResponse.fail(f"Listing generation error: {str(e)}")


@router.post("/predict-price", summary="Predict price from catalog parameters")
async def predict_catalog_price(payload: PredictPriceRequest):
    try:
        price_result = price_predictor.predict(
            category=payload.category,
            description=payload.description,
            image_path=None,
        )
        return ApiResponse.ok({
            "price_min": price_result["price_min"],
            "price_suggested": price_result["price_suggested"],
            "price_max": price_result["price_max"],
            "reasoning": price_result["reasoning"],
        })
    except Exception as e:
        logger.error(f"Catalog price prediction failed: {e}")
        return ApiResponse.fail(f"Catalog price prediction error: {str(e)}")


@router.post("/publish", summary="Publish listing to KarigaarAI with MongoDB persistence")
async def publish_listing(request: Request, payload: ProductListingPublishRequest):
    """
    Real One-Click Publishing:
    Persists product, AI metadata, and images into MongoDB Atlas.
    Returns permanent public product ID and actual frontend public URL.
    """
    try:
        base_url = str(request.base_url).rstrip("/")
        publish_result = await product_service.create_or_publish_product(
            payload=payload,
            base_url=base_url,
        )
        return ApiResponse.ok(publish_result)
    except Exception as e:
        logger.error(f"Publishing failed: {e}", exc_info=True)
        return ApiResponse.fail(f"Failed to publish listing: {str(e)}")


@router.get("/my-listings", summary="Get all published product listings for artisan from MongoDB")
async def get_my_listings(
    artisan_id: str = Query("KG-2024-8921", description="Artisan identifier"),
    status: Optional[str] = Query(None, description="Optional status filter"),
):
    """
    Fetches permanent product listings from MongoDB Atlas using query params.
    """
    try:
        listings = await product_service.get_my_listings(artisan_id=artisan_id, status=status)
        return ApiResponse.ok({"listings": listings, "count": len(listings)})
    except Exception as e:
        logger.error(f"Failed to retrieve listings from MongoDB: {e}")
        return ApiResponse.fail(f"Failed to fetch listings: {str(e)}")


@router.get("/listings/{artisan_id}", summary="Get product listings for specific artisan (path param)")
async def get_artisan_listings_by_path(
    artisan_id: str,
    status: Optional[str] = Query(None, description="Optional status filter"),
):
    """
    Fetches permanent product listings from MongoDB Atlas using path param.
    """
    try:
        listings = await product_service.get_my_listings(artisan_id=artisan_id, status=status)
        return ApiResponse.ok({"listings": listings, "count": len(listings)})
    except Exception as e:
        logger.error(f"Failed to retrieve listings from MongoDB: {e}")
        return ApiResponse.fail(f"Failed to fetch listings: {str(e)}")
