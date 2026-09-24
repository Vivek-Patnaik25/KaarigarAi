"""
KaarigarAI — Model Download Script
Run this once before starting the server to pre-download all AI model weights.

Usage:
    cd backend/
    python scripts/download_models.py

What it downloads:
  1. Faster-Whisper 'small' model (~244 MB) — Voice transcription for Indian languages
  2. CLIP ViT-B/32 (~600 MB) — Zero-shot craft category classification
     (Both download to Hugging Face cache, auto-loaded by the app at runtime)

Note: XGBoost / GradientBoosting model is trained locally from your dataset
      and already saved to app/ml/weights/ — no download needed.
"""
import sys
import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("ModelDownloader")

# Ensure backend is on the path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))


def download_whisper(model_size: str = "small"):
    """Download Faster-Whisper model weights to HuggingFace cache."""
    try:
        from faster_whisper import WhisperModel
        logger.info(f"Downloading Faster-Whisper '{model_size}' model (~244 MB for 'small')...")
        model = WhisperModel(
            model_size,
            device="cpu",
            compute_type="int8",
        )
        logger.info(f"Faster-Whisper '{model_size}' downloaded and cached successfully.")
        del model
        return True
    except ImportError:
        logger.warning("faster-whisper not installed. Run: pip install faster-whisper")
        return False
    except Exception as e:
        logger.error(f"Faster-Whisper download error: {e}")
        return False


def download_clip(model_name: str = "openai/clip-vit-base-patch32"):
    """Download CLIP model from HuggingFace Hub."""
    try:
        from transformers import CLIPModel, CLIPProcessor
        logger.info(f"Downloading CLIP model '{model_name}' (~600 MB)...")
        CLIPModel.from_pretrained(model_name)
        CLIPProcessor.from_pretrained(model_name)
        logger.info(f"CLIP model '{model_name}' downloaded and cached successfully.")
        return True
    except ImportError:
        logger.warning("transformers or torch not installed. Run: pip install transformers torch")
        return False
    except Exception as e:
        logger.error(f"CLIP download error: {e}")
        return False


def check_ml_weights():
    """Verify trained ML model weights are present."""
    weights_dir = backend_dir / "app" / "ml" / "weights"
    expected = [
        "price_model.joblib",
        "nlp_category_classifier.joblib",
        "nlp_category_vectorizer.joblib",
        "category_encoder.joblib",
        "tfidf_vectorizer.joblib",
    ]
    all_present = True
    for fname in expected:
        fpath = weights_dir / fname
        if fpath.exists():
            size_kb = fpath.stat().st_size // 1024
            logger.info(f"  [OK] {fname} ({size_kb} KB)")
        else:
            logger.warning(f"  [MISSING] {fname} — Run training: python backend/notebooks/train_kaarigar_dataset.py")
            all_present = False
    return all_present


def main():
    logger.info("=" * 60)
    logger.info("KaarigarAI — Model Download & Verification")
    logger.info("=" * 60)

    # Step 1: Check trained weights
    logger.info("\n[1/3] Checking trained ML model weights...")
    ml_ok = check_ml_weights()

    # Step 2: Download Whisper
    logger.info("\n[2/3] Downloading Faster-Whisper speech model...")
    whisper_ok = download_whisper("small")

    # Step 3: Download CLIP
    logger.info("\n[3/3] Downloading CLIP zero-shot classifier...")
    clip_ok = download_clip()

    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("DOWNLOAD SUMMARY")
    logger.info("=" * 60)
    logger.info(f"  Trained ML Weights:  {'OK' if ml_ok else 'MISSING (run training first)'}")
    logger.info(f"  Faster-Whisper:      {'OK' if whisper_ok else 'SKIPPED (install faster-whisper)'}")
    logger.info(f"  CLIP ViT-B/32:       {'OK' if clip_ok else 'SKIPPED (install transformers+torch)'}")

    if not ml_ok:
        logger.info("\n  To train missing models:")
        logger.info("    python backend/notebooks/train_kaarigar_dataset.py")

    logger.info("\n  To start the backend server:")
    logger.info("    cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    logger.info("\n  For SIH demo (expose publicly):")
    logger.info("    ngrok http 8000")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
