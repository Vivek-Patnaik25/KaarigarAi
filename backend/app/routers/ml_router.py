import os
import shutil
import logging
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.core.config import settings
from app.core.responses import ApiResponse
from app.ml.classifier import classifier
from app.ml.price_predictor import price_predictor
from app.ml.feature_extractor import extract_image_features, extract_text_features

logger = logging.getLogger("MLRouter")
router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.post("/classify", summary="Classify craft product into category")
async def classify_product(
    image: UploadFile = File(...),
    description: str = Form(None),
):
    try:
        temp_path = settings.TEMP_DIR / f"cls_{image.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        result = classifier.classify(str(temp_path), description=description)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        return ApiResponse.ok(result)
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return ApiResponse.fail(f"Failed to classify image: {str(e)}")


@router.post("/predict-price", summary="Predict product price using multimodal XGBoost")
async def predict_price(
    image: UploadFile = File(None),
    description: str = Form(...),
    category: str = Form(...),
):
    try:
        temp_path = None
        if image and image.filename:
            temp_path = settings.TEMP_DIR / f"prc_{image.filename}"
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

        img_features = extract_image_features(str(temp_path) if temp_path else None)
        text_features = extract_text_features(description)

        price_result = price_predictor.predict(
            category=category,
            description=description,
            image_path=str(temp_path) if temp_path else None,
            img_features=img_features,
            text_features=text_features,
        )

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        return ApiResponse.ok(price_result)
    except Exception as e:
        logger.error(f"Price prediction error: {e}")
        return ApiResponse.fail(f"Failed to predict price: {str(e)}")
