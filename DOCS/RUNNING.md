# 🚀 KaarigarAI — Complete Execution & Architecture Guide (`RUNNING.md`)

Welcome to **KaarigarAI**, an AI-powered market linkage and smart cataloging ecosystem designed specifically for marginalized Indian artisans (weavers, potters, craftspeople) with zero digital literacy.

This comprehensive guide details the **entire repository architecture**, **AI prompts & agent systems**, and provides step-by-step instructions to set up, train, verify, and run both the **FastAPI AI/ML Backend (Python 3.12)** and the **Flutter Mobile Application**.

---

## 📑 Table of Contents
1. [🏗️ Project Architecture Overview](#-project-architecture-overview)
2. [🤖 AI Pipelines, Prompts & Agent Systems](#-ai-pipelines-prompts--agent-systems)
   - [Pipeline 1: Studio Image Enhancement](#pipeline-1-studio-image-enhancement)
   - [Pipeline 2: Multilingual Speech-to-Text](#pipeline-2-multilingual-speech-to-text)
   - [Pipeline 3: Multilingual LLM Listing Generator & Prompts](#pipeline-3-multilingual-llm-listing-generator--prompts)
   - [ML Model 1: CLIP Zero-Shot & NLP Craft Classifier](#ml-model-1-clip-zero-shot--nlp-craft-classifier)
   - [ML Model 2: Multimodal Price Predictor & Explainability](#ml-model-2-multimodal-price-predictor--explainability)
   - [.agents Subsystem & Guidance Prompts](#agents-subsystem--guidance-prompts)
3. [⚙️ Prerequisites & System Requirements](#%EF%B8%8F-prerequisites--system-requirements)
4. [⚡ Running the Backend Server (FastAPI on Python 3.12)](#-running-the-backend-server-fastapi-on-python-312)
   - [Step 1: Environment Setup (Python 3.12)](#step-1-environment-setup-python-312)
   - [Step 2: Install Dependencies](#step-2-install-dependencies)
   - [Step 3: Configure Environment Variables (.env)](#step-3-configure-environment-variables-env)
   - [Step 4: Download AI Models & Weights](#step-4-download-ai-models--weights)
   - [Step 5: Run Automated Verification Tests](#step-5-run-automated-verification-tests)
   - [Step 6: (Optional) Re-train ML Models](#step-6-optional-re-train-ml-models)
   - [Step 7: Launch the FastAPI Backend](#step-7-launch-the-fastapi-backend)
   - [Step 8: Expose Backend via ngrok (For Mobile Demo)](#step-8-expose-backend-via-ngrok-for-mobile-demo)
5. [📱 Running the Mobile App (Flutter)](#-running-the-mobile-app-flutter)
   - [Step 1: Install Dependencies](#step-1-install-dependencies-1)
   - [Step 2: Configure API Base URL](#step-2-configure-api-base-url)
   - [Step 3: Launch Flutter App](#step-3-launch-flutter-app)
6. [🌐 Running the Web App (React / Vite)](#-running-the-web-app-react--vite)
   - [Step 1: Install Node Dependencies](#step-1-install-node-dependencies)
   - [Step 2: Configure Environment (.env)](#step-2-configure-environment-env)
   - [Step 3: Start Development Server](#step-3-start-development-server)
   - [Step 4: Build for Production](#step-4-build-for-production)
7. [📡 API Endpoints Summary](#-api-endpoints-summary)
8. [🔍 Verification & Troubleshooting Guide](#-verification--troubleshooting-guide)

---

## 🏗️ Project Architecture Overview

The system consists of two primary modules:
1. **Backend (`/backend`)**: Built with **FastAPI**, **Python 3.12**, **PyTorch**, **Faster-Whisper**, **REMBG (U²-Net)**, **OpenCV**, **CLIP**, **scikit-learn / XGBoost**, and **Groq / Gemini APIs**.
2. **Frontend (`/flutter`)**: Built with **Flutter (Dart)** using **BLoC State Management** and a tactile handloom-inspired design system (`Noto Sans`/`Noto Serif`, HSL/Saffron color tokens, high touch target accessibility).

### Unified Process Flow (`POST /catalog/process`)

```
Artisan Phone: Image + Voice Recording (Hindi, Odia, Bengali, Tamil...)
                           │
                           ▼
 ┌──────────────────────────────────────────────────┐
 │ PIPELINE 1: Background Removal & Studio Filter   │ ──► Enhanced Studio Photo
 │ (REMBG U²-Net + OpenCV Gray World LAB & CLAHE)   │     + Quality Score (Laplacian)
 └─────────────────────────┬────────────────────────┘
                           │
 ┌─────────────────────────▼────────────────────────┐
 │ PIPELINE 2: Voice Transcription                  │ ──► Transcript text
 │ (Faster-Whisper CPU int8 + VAD filter)           │     + Detected Language
 └─────────────────────────┬────────────────────────┘
                           │
 ┌─────────────────────────▼────────────────────────┐
 │ ML MODEL 1: Craft Category Classifier            │ ──► Category label
 │ (CLIP Zero-Shot + TF-IDF SGD Classifier 98.19%)  │     (e.g., "textile", "pottery")
 └─────────────────────────┬────────────────────────┘
                           │
 ┌─────────────────────────▼────────────────────────┐
 │ ML MODEL 2: Multimodal Price Predictor (R²=0.875)│ ──► ₹min, ₹suggested, ₹max
 │ (GradientBoosting + Feature Extractor + Explain) │     + Explainable reasoning
 └─────────────────────────┬────────────────────────┘
                           │
 ┌─────────────────────────▼────────────────────────┐
 │ PIPELINE 3: Multilingual Listing Generator       │ ──► JSON Listing (EN, HI,
 │ (Groq Llama-3.1-8b / Gemini 1.5 Flash / Fallback)│     Regional language, SEO tags)
 └──────────────────────────────────────────────────┘
```

---

## 🤖 AI Pipelines, Prompts & Agent Systems

### Pipeline 1: Studio Image Enhancement
- **File**: [`backend/app/ai/image_enhancer.py`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/ai/image_enhancer.py)
- **Tech**: REMBG (U²-Net), OpenCV, Pillow.
- **Functionality**:
  - `remove_background()`: Cuts out artisan background and pastes product onto studio-white background.
  - `enhance_product_image()`: Auto white balance (Gray World in LAB color space), CLAHE adaptive contrast enhancement, unsharp masking, and HSV saturation pop (+15%).
  - `compute_quality_score()`: Sharpness estimation via Laplacian variance.

### Pipeline 2: Multilingual Speech-to-Text
- **File**: [`backend/app/ai/transcriber.py`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/ai/transcriber.py)
- **Tech**: Faster-Whisper `small` model with CPU int8 quantization.
- **Languages**: Native support for Hindi (`hi`), Odia (`or`), Bengali (`bn`), Tamil (`ta`), Telugu (`te`), Marathi (`mr`), Gujarati (`gu`), Kannada (`kn`), etc.

### Pipeline 3: Multilingual LLM Listing Generator & Prompts
- **File**: [`backend/app/ai/listing_generator.py`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/ai/listing_generator.py)
- **Primary LLM**: Groq API (`llama-3.1-8b-instant` — free 14,400 req/day).
- **Secondary LLM**: Google Gemini API (`gemini-1.5-flash` — free 1,500 req/day).
- **Offline Resilient Fallback**: Craft-aware Indic template generator.

#### 💬 LLM System Prompt Used:
```text
You are an expert product listing writer for an Indian handicrafts marketplace (KaarigarAI).
You help rural artisans present their handmade products professionally to global and domestic buyers.
You write compelling, SEO-friendly product descriptions that highlight authenticity, cultural heritage, and handmade craftsmanship.

RULES:
1. Never fabricate specifications (size, weight) not mentioned or implied by the input.
2. Always mention the craft tradition or origin if detectable from the transcript.
3. Keep descriptions honest, respectful, and grounded in artisan pride.
4. Return ONLY valid JSON, with no markdown fences, no preamble, and no explanation.
```

#### 💬 LLM User Prompt Structure:
```text
An artisan described their handmade product in {detected_language}:
"{transcript}"

Product category: {category}
Suggested price range: ₹{min_p} – ₹{max_p}

Generate a comprehensive product listing. Return ONLY this JSON structure:
{
  "title_en": "concise product title in English (max 10 words)",
  "title_hi": "same title in Hindi (Devanagari script)",
  "description_en": "2-3 paragraph English description highlighting craftsmanship, authenticity, and heritage.",
  "description_hi": "rich description in Hindi (Devanagari script)",
  "description_regional": "rich description in {detected_language} (native script e.g. Odia, Bengali, Tamil, etc.)",
  "seo_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "craft_tradition": "craft tradition name if identifiable or null",
  "material_detected": "primary material if identifiable or null"
}
```

### ML Model 1: CLIP Zero-Shot & NLP Craft Classifier
- **Files**: [`backend/app/ml/classifier.py`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/ml/classifier.py) & [`backend/app/ml/weights/nlp_category_classifier.joblib`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/ml/weights/nlp_category_classifier.joblib)
- **Accuracy**: 98.19% NLP classification accuracy across craft categories (`textile`, `pottery_terracotta`, `metalcraft`, `woodcraft`, `jewellery`, `painting_patachitra`).

### ML Model 2: Multimodal Price Predictor & Explainability
- **Files**: [`backend/app/ml/price_predictor.py`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/ml/price_predictor.py), [`feature_extractor.py`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/ml/feature_extractor.py), [`reasoning_generator.py`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/ml/reasoning_generator.py)
- **Performance**: R² = 0.875 trained on 10,810 artisan listing records.
- **Explainability**: Outputs human-readable Hindi reasoning based on GI tag, material tier, technique score, edge density, and marketplace demand.

### `.agents` Subsystem & Guidance Prompts
The project embeds custom `.agents` prompt systems for autonomous subagents and developers:
- [`backend/.agents/prompt/02_ml_pipeline_doc.md`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/.agents/prompt/02_ml_pipeline_doc.md): Complete blueprint for ML data collection, feature engineering, training, and deployment.
- [`flutter/.agents/prompts/01_frontend_agent_prompt.md`](file:///s:/SEM_7/SIUUHH/KarigaarAI/flutter/.agents/prompts/01_frontend_agent_prompt.md): Specifications for Flutter UI design tokens, BLoC architecture, accessibility guidelines, and component design.
- [`03_ai_pipeline_doc.md`](file:///s:/SEM_7/SIUUHH/KarigaarAI/03_ai_pipeline_doc.md): System design document for zero-paid-dependency AI pipelines.

---

## ⚙️ Prerequisites & System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux.
- **Python**: **Python 3.12** (`py -3.12`).
- **Flutter & Dart**: Flutter SDK (>= 3.10.0), Dart SDK (>= 3.0.0).
- **Android Development** (for running Flutter app on mobile): Android Studio + Android SDK (minSdkVersion 21) or connected Android device / emulator.
- **Hardware**: Minimum 8GB RAM (16GB recommended for running Faster-Whisper & CLIP locally).

---

## ⚡ Running the Backend Server (FastAPI on Python 3.12)

### Step 1: Environment Setup (Python 3.12)
Open terminal in the repository root and navigate to `backend`:
```bash
cd backend
py -3.12 -m venv venv
```

Activate the virtual environment:
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD)**:
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- **Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```

Verify Python version inside venv:
```bash
python --version
# Expected: Python 3.12.x
```

### Step 2: Install Dependencies
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables (`.env`)
Copy `.env.example` to `.env`:
```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```
Ensure your `.env` contains your free API keys:
```ini
GROQ_API_KEY=gsk_...        # Free from https://console.groq.com
GROQ_MODEL=llama-3.1-8b-instant

GEMINI_API_KEY=AQ...        # Free from https://aistudio.google.com
GEMINI_MODEL=gemini-1.5-flash

WHISPER_MODEL_SIZE=small
CLIP_MODEL_NAME=openai/clip-vit-base-patch32
ALLOWED_ORIGINS=["*"]
```

### Step 4: Download AI Models & Weights
Run the one-time downloader script to pre-cache Faster-Whisper (~244 MB) and CLIP (~600 MB):
```bash
python scripts/download_models.py
```

### Step 5: Run Automated Verification Tests
Verify all 3 AI pipelines and ML models end-to-end:
```bash
python scripts/test_ai_pipeline.py
```
*Expected Output*: `ALL AI PIPELINES OPERATIONAL AND VERIFIED!`

### Step 6: (Optional) Re-train ML Models
If you want to train the Price Predictor and Craft Classifier from the 10,810 artisan listing dataset (`data/kaarigar_dataset.csv`):
```bash
python notebooks/train_kaarigar_dataset.py
```

### Step 7: Launch the FastAPI Backend
Start the server using `uvicorn`:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Interactive Swagger API Docs**: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **Health Check Endpoint**: [`http://localhost:8000/health`](http://localhost:8000/health)

### Step 8: Expose Backend via ngrok (For Mobile Demo)
To connect a physical mobile device or remote tester to your local FastAPI backend:
```bash
ngrok http 8000
```
Copy the generated forwarding URL (e.g. `https://xxxx.ngrok-free.app`).

---

## 📱 Running the Mobile App (Flutter)

### Step 1: Install Dependencies
Open a new terminal window, navigate to the `flutter` directory:
```bash
cd flutter
flutter pub get
```

### Step 2: Configure API Base URL
To connect the app to your backend:
- If testing on **Android Emulator**, use `http://10.0.2.2:8000/v1`.
- If testing on **Physical Android Device**, use your **ngrok URL** (e.g. `https://xxxx.ngrok-free.app/v1`) or local Wi-Fi IP (e.g. `http://192.168.x.x:8000/v1`).

Edit [`flutter/lib/core/constants/api_constants.dart`](file:///s:/SEM_7/SIUUHH/KarigaarAI/flutter/lib/core/constants/api_constants.dart):
```dart
class ApiConstants {
  ApiConstants._();

  // Update this to your local backend or ngrok URL
  static const String baseUrl = 'http://10.0.2.2:8000/v1';

  static const String enhanceImage = '$baseUrl/catalog/enhance-image';
  static const String transcribe = '$baseUrl/catalog/transcribe';
  static const String generateListing = '$baseUrl/catalog/generate-listing';
  static const String predictPrice = '$baseUrl/catalog/predict-price';
  static const String publish = '$baseUrl/catalog/publish';
}
```

### Step 3: Launch Flutter App
Check available devices:
```bash
flutter devices
```
Run on target device or emulator:
```bash
flutter run
```

---

## 🌐 Running the Web App (React / Vite)

The KarigaarAI ecosystem also includes a fully functional, responsive React web application built with Vite and Tailwind CSS. It provides features like the Inventory Dashboard, Public Product Pages, and the Market Linkage AI tools.

### Step 1: Install Node Dependencies
Open a new terminal window and navigate to the `karigaar-web` directory:
```bash
cd karigaar-web
npm install
```

### Step 2: Configure Environment (`.env`)
Create a `.env` file in the `karigaar-web` directory.
```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```
Ensure your `.env` correctly points to the backend (or ngrok URL if running on a separate device):
```ini
VITE_API_URL=http://localhost:8000
VITE_DEMO_MODE=false
```

### Step 3: Start Development Server
```bash
npm run dev
```
The application will be accessible at [`http://localhost:5173`](http://localhost:5173).

### Step 4: Build for Production
To generate an optimized production build:
```bash
npm run build
```
The compiled static assets will be located in the `karigaar-web/dist/` directory, ready to be served by any static hosting provider (e.g., Vercel, Netlify, or Nginx).

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/catalog/process` or `/v1/catalog/process` | **Unified Pipeline**: Runs background removal, transcription, ML classification, pricing & LLM listing generation in one call. |
| `POST` | `/catalog/enhance-image` | Background removal (REMBG) + OpenCV studio enhancement. |
| `POST` | `/catalog/transcribe` | Voice-to-text transcription (Faster-Whisper int8). |
| `POST` | `/catalog/generate-listing` | Multilingual product listing (Groq/Gemini LLM). |
| `POST` | `/catalog/predict-price` | Price prediction & explainable Hindi reasoning. |
| `POST` | `/catalog/publish` | Publish listing to marketplace. |
| `POST` | `/ml/classify` | CLIP zero-shot craft classification. |
| `POST` | `/ml/predict-price` | Multimodal price prediction. |
| `GET`  | `/health` | System health check. |

---

## 🔍 Verification & Troubleshooting Guide

### 1. Model Weights Missing Error
If server fails on startup with `FileNotFoundError` for `.joblib` files in `app/ml/weights/`:
```bash
python notebooks/train_kaarigar_dataset.py
```

### 2. Low RAM / Out of Memory
If Faster-Whisper fails on CPU with limited memory:
- Edit `.env` and set `WHISPER_MODEL_SIZE=tiny` (uses only ~39MB RAM).

### 3. LLM Rate Limit or Offline Mode
If Groq or Gemini API keys expire or network is offline:
- The system automatically engages the **Intelligent Craft-Aware Template Fallback** in [`listing_generator.py`](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/ai/listing_generator.py), ensuring 100% demo uptime without breaking.

### 4. Flutter Android Microphone / Camera Permissions
Ensure permissions are enabled when prompted on device startup for capturing product photos and recording audio notes.

---
*Created for KaarigarAI — Smart Cataloging & Fair Market Pricing for Indian Artisans.*
