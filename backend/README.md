# 🚀 KaarigarAI — AI & ML Backend Server

Production-grade FastAPI backend with **3 AI Pipelines** and **2 ML Models** for **KaarigarAI** (Smart Cataloging and Fair Market Pricing for Marginalized Indian Artisans).

---

## 🏗️ Architecture Overview

```
Input: Product Image + Voice Note / Text Description
       │
       ▼
┌─────────────────────────────────┐
│ PIPELINE 1: Image Enhancement   │ ──► Studio-quality product photo
│ (REMBG + OpenCV studio filters) │     + quality score
└────────────┬────────────────────┘
             │
┌─────────────────────────────────┐
│ PIPELINE 2: Voice Transcription │ ──► Transcript + language detection
│ (Faster-Whisper int8 on CPU)    │     Hindi, Odia, Bengali, Tamil...
└────────────┬────────────────────┘
             │
┌─────────────────────────────────┐
│ ML: Craft Category Classifier   │ ──► "textile", "pottery", "metalcraft"...
│ (CLIP Zero-Shot + Trained NLP)  │     98.19% accuracy (NLP fallback)
└────────────┬────────────────────┘
             │
┌─────────────────────────────────┐
│ ML: Multimodal Price Predictor  │ ──► ₹min, ₹suggested, ₹max + reasoning
│ (GradientBoosting / XGBoost)    │     R² = 0.875
└────────────┬────────────────────┘
             │
┌─────────────────────────────────┐
│ PIPELINE 3: Listing Generator   │ ──► title_en, title_hi, descriptions,
│ (Groq API + Gemini API fallback)│     SEO tags, craft tradition, material
└─────────────────────────────────┘
```

**All 5 stages run in one atomic call via `POST /catalog/process`.**

---

## 📁 Repository Structure

```
backend/
├── app/
│   ├── main.py                      # FastAPI app, lifespan model loader, static files
│   ├── ai/                          # AI PIPELINE MODULES
│   │   ├── image_enhancer.py        # Pipeline 1: REMBG + OpenCV studio enhancement
│   │   ├── transcriber.py           # Pipeline 2: Faster-Whisper speech-to-text
│   │   └── listing_generator.py     # Pipeline 3: Groq/Gemini LLM listing generator
│   ├── core/
│   │   ├── config.py                # Environment and path configurations
│   │   └── responses.py             # Standard { success, data, error } wrapper
│   ├── ml/
│   │   ├── classifier.py            # CLIP zero-shot + trained NLP classifier
│   │   ├── feature_extractor.py     # Multi-modal CV & text feature extractor
│   │   ├── price_predictor.py       # Price predictor & fallback heuristic
│   │   ├── reasoning_generator.py   # Rule-based explainable reasoning
│   │   └── weights/                 # Trained .joblib model weights
│   ├── models/
│   │   └── schemas.py               # Pydantic schemas
│   ├── routers/
│   │   ├── ml_router.py             # /ml/classify & /ml/predict-price
│   │   └── catalog_router.py        # /catalog/* endpoints (incl. /catalog/process)
│   └── services/
│       ├── image_service.py         # Image enhancement service wrapper
│       ├── speech_service.py        # Speech-to-text service wrapper
│       └── llm_service.py           # LLM listing generation service wrapper
├── data/
│   └── kaarigar_dataset.csv         # 10,810 artisan craft listings
├── notebooks/
│   └── train_kaarigar_dataset.py    # Full training pipeline (NLP + Price model)
├── scripts/
│   ├── scrape_artisan_data.py       # Multi-source scraper script
│   ├── download_models.py          # One-time AI model weight downloader
│   └── test_ai_pipeline.py         # End-to-end pipeline verification
├── .env.example                     # Environment variable template
├── requirements.txt
└── Dockerfile
```

---

## ⚡ Quick Start

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your free API keys:
#   GROQ_API_KEY   → https://console.groq.com (free, 14,400 req/day)
#   GEMINI_API_KEY → https://aistudio.google.com (free, 1,500 req/day)

# 5. Download AI model weights (one-time, optional)
python scripts/download_models.py

# 6. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Swagger UI**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`
- **SIH Demo**: `ngrok http 8000` (free, exposes locally to Flutter app)

---

## 📡 API Endpoints

### Unified Pipeline (Flutter app calls this)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/catalog/process` | **End-to-end**: image enhancement → transcription → classification → pricing → listing generation |

### Individual Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/catalog/enhance-image` | Background removal + studio enhancement |
| `POST` | `/catalog/transcribe` | Voice-to-text with Indian language detection |
| `POST` | `/catalog/generate-listing` | Multilingual listing via Groq/Gemini LLM |
| `POST` | `/catalog/predict-price` | Price prediction from category + description |
| `POST` | `/catalog/publish` | Publish listing to marketplace |
| `POST` | `/ml/classify` | CLIP zero-shot craft classification |
| `POST` | `/ml/predict-price` | Multimodal price prediction + explainability |

---

## 🧠 Trained Model Weights

All weights are saved in `app/ml/weights/`:

| File | Size | Purpose |
|---|---|---|
| `price_model.joblib` | 1.2 MB | GradientBoosting price regressor (R²=0.875) |
| `nlp_category_classifier.joblib` | 313 KB | TF-IDF + SGDClassifier (98.19% accuracy) |
| `nlp_category_vectorizer.joblib` | 204 KB | TF-IDF vectorizer for NLP classifier |
| `category_encoder.joblib` | 1 KB | LabelEncoder for category mapping |
| `tfidf_vectorizer.joblib` | 3 KB | TF-IDF vectorizer for price model |

---

## 🔑 Free AI Tool Stack

| Task | Tool | Cost | Size |
|---|---|---|---|
| Background removal | REMBG (U²-Net) | Free forever | ~170MB |
| Image enhancement | OpenCV | Free forever | ~50MB |
| Speech-to-text | Faster-Whisper small | Free forever | ~244MB |
| Craft classifier | CLIP ViT-B/32 | Free forever | ~600MB |
| LLM (primary) | Groq + Llama 3.1 8B | Free 14k req/day | API |
| LLM (fallback) | Gemini 1.5 Flash | Free 1.5k req/day | API |
| Price prediction | GradientBoosting | Free forever | ~1.2MB |
