# AI Pipeline Document — PS 26090 Artisan Market Linkage App
# All Free Resources, Zero Paid API Dependency

> You are a senior AI/NLP engineer building the AI backbone for KaarigarAI.
> Your job is to design and integrate three AI pipelines:
> (1) image enhancement and background removal,
> (2) multilingual voice transcription,
> (3) product listing generation.
> Every tool and model used must be free and self-hostable.
> You write clean Python with clear separation between AI modules.

---

## 1. AI System Overview

```
PIPELINE 1: IMAGE
  Raw photo
    → Background Removal (REMBG)
    → Image Enhancement (Real-ESRGAN upscale + OpenCV corrections)
    → Output: professional product image on white/neutral background

PIPELINE 2: VOICE → TEXT
  Audio recording (regional language)
    → Speech-to-Text (Whisper small, self-hosted)
    → Language detection (langdetect / Whisper built-in)
    → Output: transcript + detected language code

PIPELINE 3: TEXT → LISTING
  Transcript + Category + Image URL
    → Prompt construction
    → LLM generation (Ollama local / Groq free tier)
    → Output: title, description (EN + HI + regional), SEO tags
```

All three pipelines are independent FastAPI endpoints.
They are called sequentially by the Flutter app.

---

## 2. Pipeline 1 — Image Enhancement

### 2.1 Background Removal — REMBG

REMBG uses U²-Net under the hood. Runs entirely on CPU. Free forever.

```bash
pip install rembg Pillow
```

```python
# app/ai/image_enhancer.py
from rembg import remove
from PIL import Image, ImageEnhance, ImageFilter
import io, cv2, numpy as np

def remove_background(image_bytes: bytes) -> bytes:
    """Remove background and place product on clean white."""
    input_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    output = remove(input_image)  # RGBA with transparent background

    # Composite onto white background
    white_bg = Image.new("RGBA", output.size, (255, 255, 255, 255))
    white_bg.paste(output, mask=output.split()[3])
    final = white_bg.convert("RGB")

    buf = io.BytesIO()
    final.save(buf, format="JPEG", quality=92)
    return buf.getvalue()
```

### 2.2 Image Enhancement — OpenCV

After background removal, apply corrections to make the product look
professionally lit even if original was taken in poor conditions.

```python
def enhance_product_image(image_bytes: bytes) -> bytes:
    """
    Apply: brightness correction, contrast boost, sharpening, white balance.
    Goal: make product look like a studio photo, not a phone snap.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 1. Auto white balance (Gray World assumption)
    result = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    avg_a = np.average(result[:, :, 1])
    avg_b = np.average(result[:, :, 2])
    result[:, :, 1] = result[:, :, 1] - ((avg_a - 128) * (result[:, :, 0] / 255.0) * 1.1)
    result[:, :, 2] = result[:, :, 2] - ((avg_b - 128) * (result[:, :, 0] / 255.0) * 1.1)
    img = cv2.cvtColor(result, cv2.COLOR_LAB2BGR)

    # 2. CLAHE contrast enhancement (adaptive, avoids over-brightening)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])
    img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    # 3. Unsharp masking for sharpness
    gaussian = cv2.GaussianBlur(img, (0, 0), 2.0)
    img = cv2.addWeighted(img, 1.5, gaussian, -0.5, 0)

    # 4. Slight saturation boost (makes craft colors pop)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.15, 0, 255)
    img = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

    _, encoded = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return encoded.tobytes()


def full_image_pipeline(image_bytes: bytes) -> dict:
    """Run bg removal → enhancement → return both original and enhanced."""
    bg_removed = remove_background(image_bytes)
    enhanced = enhance_product_image(bg_removed)

    # Quality score (sharpness proxy for judge demo)
    nparr = np.frombuffer(enhanced, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    sharpness = cv2.Laplacian(img, cv2.CV_64F).var()
    quality_score = round(min(sharpness / 500, 1.0), 2)

    return {
        "enhanced_image": enhanced,       # bytes
        "quality_score": quality_score,   # 0.0 - 1.0
    }
```

### 2.3 Optional Upscaling — Real-ESRGAN (if image is low-res)

```bash
pip install basicsr realesrgan
# Model weights: ~65MB, download once at startup
```

```python
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer

def upscale_if_needed(image_bytes: bytes, min_dimension: int = 800) -> bytes:
    """Only upscale if image is smaller than 800px on shortest side."""
    img = Image.open(io.BytesIO(image_bytes))
    if min(img.size) >= min_dimension:
        return image_bytes  # already large enough

    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64,
                    num_block=23, num_grow_ch=32, scale=4)
    upsampler = RealESRGANer(
        scale=4,
        model_path="weights/RealESRGAN_x4plus.pth",
        model=model,
        tile=0,
        tile_pad=10,
        pre_pad=0,
        half=False,  # CPU mode
    )
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    output, _ = upsampler.enhance(img_cv, outscale=2)
    _, encoded = cv2.imencode(".jpg", output)
    return encoded.tobytes()
```

**Note for SIH demo:** Skip Real-ESRGAN in live demo if CPU is slow.
Pre-process demo images offline and serve cached results.

---

## 3. Pipeline 2 — Voice Transcription

### 3.1 Whisper (OpenAI — Open Source Weights, Self-Hosted)

Whisper is free, open-source, and supports all Indian languages natively.
Use `whisper-small` model — 244MB, runs on CPU in ~3s for 30s audio.

```bash
pip install openai-whisper
# or faster implementation:
pip install faster-whisper
```

```python
# app/ai/transcriber.py
from faster_whisper import WhisperModel
import tempfile, os

# Load once at startup — don't reload per request
_model = None

def get_whisper_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            "small",           # 244MB — good balance of speed vs accuracy
            device="cpu",
            compute_type="int8"  # quantized — 2x faster on CPU
        )
    return _model


def transcribe_audio(audio_bytes: bytes, language_hint: str = None) -> dict:
    """
    Transcribe audio in any Indian language.
    language_hint: ISO 639-1 code e.g. "hi", "or", "bn", "ta"
                   Pass None for auto-detection.
    """
    model = get_whisper_model()

    # Write to temp file (Whisper needs a file path)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        tmp_path = f.name

    try:
        segments, info = model.transcribe(
            tmp_path,
            language=language_hint,   # None = auto-detect
            beam_size=5,
            vad_filter=True,          # removes silence automatically
            vad_parameters={
                "min_silence_duration_ms": 500
            }
        )
        transcript = " ".join([s.text for s in segments]).strip()
        detected_lang = info.language
        confidence = round(info.language_probability, 3)

    finally:
        os.unlink(tmp_path)

    return {
        "transcript": transcript,
        "detected_language": detected_lang,
        "language_confidence": confidence,
        "duration_seconds": round(info.duration, 1),
    }
```

**Language support (Whisper small):**
Hindi ✓, Odia ✓, Bengali ✓, Tamil ✓, Telugu ✓, Kannada ✓, Marathi ✓, Gujarati ✓

**Accuracy notes:**
- Hindi: ~92% WER equivalent
- Odia: ~78% WER (smaller training data) — acceptable for product descriptions
- For demo: record test audio in controlled environment, accuracy will be higher

---

## 4. Pipeline 3 — Listing Generation

This is the core NLP pipeline. Takes the transcript + category + context
and generates a professional product listing in multiple languages.

### 4.1 LLM Options (All Free)

**Option A — Groq API (Recommended for SIH)**
- Free tier: 14,400 requests/day, 30 requests/minute
- Model: `llama-3.1-8b-instant` — very fast (< 1s response)
- No credit card required to start
- Sign up: console.groq.com

```python
# app/ai/listing_generator.py
from groq import Groq  # pip install groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])  # free key

SYSTEM_PROMPT = """You are an expert product listing writer for Indian 
handicrafts marketplace. You help rural artisans present their handmade 
products professionally online. You write compelling, SEO-friendly product 
descriptions that highlight craftsmanship, materials, and cultural heritage.

RULES:
- Never fabricate specifications (size, weight) not mentioned in the input
- Always mention the craft tradition or origin if detectable
- Keep descriptions honest and grounded
- Return ONLY valid JSON, no explanation, no markdown fences
"""

def generate_listing(
    transcript: str,
    detected_language: str,
    category: str,
    price_suggested: int,
) -> dict:
    """
    Generate full product listing from artisan's voice description.
    Returns title + descriptions in EN, HI, and original regional language.
    """

    user_prompt = f"""
An artisan described their product in {detected_language}:
"{transcript}"

Product category (detected by AI): {category}
Suggested price range: ₹{int(price_suggested * 0.75)} – ₹{int(price_suggested * 1.25)}

Generate a product listing. Return ONLY this JSON:
{{
  "title_en": "short product title in English (max 10 words)",
  "title_hi": "same title in Hindi",
  "description_en": "2-3 paragraph English description, SEO-friendly, highlight craftsmanship",
  "description_hi": "same description in Hindi (Devanagari script)",
  "description_regional": "same description in {detected_language} (native script)",
  "seo_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "craft_tradition": "name of craft tradition if identifiable, else null",
  "material_detected": "primary material if detectable from description, else null"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,      # low temp = consistent, factual output
        max_tokens=800,
        response_format={"type": "json_object"},
    )

    import json
    raw = response.choices[0].message.content
    return json.loads(raw)
```

**Option B — Ollama (Fully Local, No Internet Required)**

Use this if you want zero external dependency during demo (important for
venues with bad internet).

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model (one time, ~4.7GB)
ollama pull llama3.1:8b

# Server starts automatically at localhost:11434
```

```python
# Switch to Ollama by changing just the client:
import ollama

def generate_listing_local(transcript: str, ...) -> dict:
    response = ollama.chat(
        model="llama3.1:8b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        format="json",
        options={"temperature": 0.4}
    )
    return json.loads(response["message"]["content"])
```

**Option C — Google Gemini API (Free Tier Fallback)**
- Free: 1,500 requests/day with `gemini-1.5-flash`
- Better multilingual quality than Llama for Indian scripts
- `pip install google-generativeai`

```python
import google.generativeai as genai
genai.configure(api_key=os.environ["GEMINI_API_KEY"])  # free key
model = genai.GenerativeModel("gemini-1.5-flash")
```

### 4.2 Translation Fallback — IndicTrans2 (Fully Offline)

If LLM translation quality for Odia/Tamil is poor, use IndicTrans2
from AI4Bharat — purpose-built for Indian languages, completely free.

```bash
pip install indic-transliterate
# IndicTrans2 model: huggingface.co/ai4bharat/indictrans2-en-indic-1B
```

```python
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Use this specifically for: EN description → regional language
# when LLM regional output is poor quality
INDICTRANS_MODEL = "ai4bharat/indictrans2-en-indic-dist-200M"

def translate_to_regional(text_en: str, target_lang: str) -> str:
    """
    target_lang: "ory_Orya" for Odia, "ben_Beng" for Bengali,
                 "tam_Taml" for Tamil, etc.
    """
    tokenizer = AutoTokenizer.from_pretrained(INDICTRANS_MODEL)
    model = AutoModelForSeq2SeqLM.from_pretrained(INDICTRANS_MODEL)
    inputs = tokenizer(text_en, return_tensors="pt", padding=True)
    outputs = model.generate(**inputs, max_length=512)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)
```

---

## 5. Full Request Flow (All 3 Pipelines Together)

```python
# app/routers/catalog_router.py
from fastapi import APIRouter, File, UploadFile, Form

router = APIRouter(prefix="/catalog", tags=["catalog"])

@router.post("/process")
async def process_product(
    image: UploadFile = File(...),
    audio: UploadFile = File(...),
    language_hint: str = Form(default=None),
):
    """
    Single endpoint that runs all 3 pipelines.
    Flutter calls this once after user finishes recording.
    Returns everything needed to show the listing preview screen.
    """
    image_bytes = await image.read()
    audio_bytes = await audio.read()

    # Run image pipeline
    image_result = full_image_pipeline(image_bytes)

    # Run transcription
    transcript_result = transcribe_audio(audio_bytes, language_hint)

    # Run ML classification
    category_result = classify_craft_from_bytes(image_bytes)

    # Run price prediction
    price_result = predict_price(
        category=category_result["category"],
        description=transcript_result["transcript"],
        image_bytes=image_bytes,
    )

    # Generate listing (uses transcript + category + price)
    listing = generate_listing(
        transcript=transcript_result["transcript"],
        detected_language=transcript_result["detected_language"],
        category=category_result["category"],
        price_suggested=price_result["price_suggested"],
    )

    return {
        "success": True,
        "data": {
            "enhanced_image_url": upload_to_storage(image_result["enhanced_image"]),
            "image_quality_score": image_result["quality_score"],
            "transcript": transcript_result["transcript"],
            "detected_language": transcript_result["detected_language"],
            "category": category_result["category"],
            "category_confidence": category_result["confidence"],
            "price_min": price_result["price_min"],
            "price_suggested": price_result["price_suggested"],
            "price_max": price_result["price_max"],
            "price_reasoning": price_result["reasoning"],
            "listing": listing,
        }
    }
```

Total pipeline time target: **< 8 seconds** end-to-end on a 2-core server.

---

## 6. Free Tool Stack Summary

| Task | Tool | Cost | Size |
|---|---|---|---|
| Background removal | REMBG (U²-Net) | Free forever | ~170MB |
| Image enhancement | OpenCV | Free forever | ~50MB |
| Image upscaling | Real-ESRGAN | Free forever | ~65MB |
| Speech-to-text | Faster-Whisper small | Free forever | ~244MB |
| LLM (online) | Groq + Llama 3.1 8B | Free 14k req/day | API |
| LLM (offline) | Ollama + Llama 3.1 8B | Free forever | ~4.7GB |
| LLM (fallback) | Gemini 1.5 Flash | Free 1.5k req/day | API |
| Indian language NLP | IndicTrans2 (AI4Bharat) | Free forever | ~800MB |
| Zero-shot classify | CLIP (HuggingFace) | Free forever | ~600MB |
| Price prediction | XGBoost (trained) | Free forever | ~5MB |

**Total offline footprint (without Ollama):** ~1.1GB models
**With Ollama local LLM:** ~5.8GB

**SIH demo recommendation:**
Use Groq (online, fast) as primary + pre-cached responses as offline fallback.
This keeps demo snappy and avoids the 4.7GB Ollama download on venue WiFi.

---

## 7. Backend Project Structure

```
backend/
├── app/
│   ├── main.py                  — FastAPI app init, CORS, startup events
│   ├── routers/
│   │   ├── catalog_router.py    — /catalog/process, /catalog/publish
│   │   └── ml_router.py         — /ml/classify, /ml/predict-price
│   ├── ai/
│   │   ├── image_enhancer.py    — REMBG + OpenCV pipeline
│   │   ├── transcriber.py       — Faster-Whisper
│   │   └── listing_generator.py — Groq/Ollama LLM
│   ├── ml/
│   │   ├── classifier.py        — CLIP zero-shot
│   │   ├── price_predictor.py   — XGBoost inference
│   │   └── feature_extractor.py — image + text features
│   ├── storage/
│   │   └── file_handler.py      — save images, return URLs
│   └── core/
│       ├── config.py            — env vars, model paths
│       └── dependencies.py      — shared FastAPI dependencies
├── models/                      — trained model files (.joblib, .pkl)
├── weights/                     — AI model weights (gitignored)
├── scripts/
│   ├── download_models.py       — one-time model download script
│   └── scrape_gocoop.py
├── notebooks/                   — Colab training notebooks
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## 8. Deployment (Free Tier)

**Option A — Render.com (Recommended)**
- Free tier: 512MB RAM, 0.1 CPU (enough for demo)
- Auto-deploy from GitHub
- Issue: REMBG + Whisper need >512MB → use Render Starter ($7/mo) OR
  pre-process all demo images and serve cached results from free tier

**Option B — Railway.app**
- $5 free credit/month
- More RAM headroom than Render free tier

**Option C — Local laptop as server during SIH demo**
- Run FastAPI on your laptop, Flutter app points to local IP
- Most reliable for demo — no cloud latency, no internet dependency
- Use ngrok for public URL if needed: `ngrok http 8000` (free)

**For SIH: use local laptop + ngrok. Zero cloud cost, maximum reliability.**

---

## 9. Environment Setup

```bash
# Clone and setup
git clone https://github.com/your-team/kaarigai-backend
cd kaarigai-backend

# Install dependencies
pip install -r requirements.txt

# Download AI model weights (run once)
python scripts/download_models.py

# Set environment variables
cp .env.example .env
# Fill in: GROQ_API_KEY, GEMINI_API_KEY (both free)

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```
# requirements.txt
fastapi==0.111.0
uvicorn[standard]==0.30.1
python-multipart==0.0.9
rembg==2.0.57
faster-whisper==1.0.1
opencv-python-headless==4.10.0.82
Pillow==10.3.0
numpy==1.26.4
xgboost==2.0.3
scikit-learn==1.5.0
joblib==1.4.2
transformers==4.41.2
torch==2.3.0          # CPU only — no CUDA needed
groq==0.9.0
google-generativeai==0.7.2
python-dotenv==1.0.1
httpx==0.27.0
```
