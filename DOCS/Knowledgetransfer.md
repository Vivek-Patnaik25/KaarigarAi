# 📖 KarigaarAI — Knowledge Transfer & Quick Onboarding Guide

> **Welcome to KarigaarAI!** This document provides a high-level overview of our architecture, current codebase status, newly integrated ML engines, and active development roadmap.

---

## 📌 1. Project Overview & Tech Stack

KarigaarAI is an AI-first cataloging and market linkage platform built for Indian traditional artisans:
- **Web Frontend (`karigaar-web`)**: React 18 + Vite, Zustand state management, i18next, and Claymorphism CSS.
- **Mobile Client (`flutter`)**: Cross-platform Flutter app with BLoC architecture.
- **Backend API (`backend`)**: Python FastAPI server (port 8000).
- **AI/ML Core (`backend/app/ml/`)**: Fine-tuned CLIP ViT-B/32 vision classifier + 3-base Stacking Ensemble price predictor.
- **Generative AI (`backend/app/ai/`)**: Rembg U²-Net, Faster-Whisper, and Groq/Gemini LLMs.

---

## ⚡ 2. Current Architecture & Core Workflows

### 🔄 The 5-Stage AI Catalog Pipeline (`POST /catalog/process`)

1. **Image Studio Enhancement (`app/ai/image_enhancer.py`)**:
   - Removes messy background with `rembg`.
   - Adds studio shadow and white balance normalization using OpenCV.
2. **Speech Transcription (`app/ai/transcriber.py`)**:
   - Transcribes regional language voice descriptions into clean text using `faster-whisper` (int8).
3. **Fine-Tuned Craft Classification (`app/ml/classifier.py`)**:
   - Uses **Fine-Tuned CLIP ViT-B/32** (`craft_classifier_finetuned.pt`) with custom 2-stage MLP head.
   - Categorizes into 8 artisan craft domains with 95.7%+ precision.
4. **Stacking Price Prediction (`app/ml/price_predictor.py`)**:
   - Primary Engine: **RidgeCV Meta-Learner** stacking predictions from **XGBoost**, **LightGBM**, and **CatBoost**.
   - Safeguards: Enforces **10th-percentile minimum price floors** (`category_price_floors.json`) to prevent underpricing.
5. **Multilingual Listing Copy (`app/ai/listing_generator.py`)**:
   - Generates English, Hindi, and regional marketplace copy + SEO search tags via Groq (Llama 3.1) or Gemini 1.5 Flash.

---

## 🌐 3. Web Client Components (`karigaar-web`)

- **`src/pages/CatalogPage.jsx`**: Multi-step catalog creation wizard (Language $\rightarrow$ Media Upload $\rightarrow$ AI Processing $\rightarrow$ Preview & Publish).
- **`src/components/ListingPreview.jsx`**: Interactive Before/After slider comparing raw artisan photos with AI-enhanced studio photos.
- **`src/components/GITagBanner.jsx`**: Contextual awareness banner highlighting 20–40% premium opportunities for Geographical Indication crafts.
- **`src/pages/ArtisanPassport.jsx` & `PassportCard.jsx`**: Digital artisan certificate card with unique ID (`KG-YYYY-XXXX`) and QR code.
- **`src/styles/clay.css`**: Claymorphic design system tokens.

---

## 🎯 4. Active Roadmap & Developer Handoff

### 🚀 High-Priority Next Task: Multi-Platform 1-Click Publishing
Currently, `/catalog/publish` returns a simulated link. We are building the modular sync engine in `backend/app/services/marketplace_service.py` to publish to:
1. **Amazon Karigar** (SP-API JSON listings feed format).
2. **ONDC Network** (Beckn Protocol v1.2.0 retail catalog schema).
3. **WhatsApp / Social Storefront** (Direct customer ordering deep links).

> 👉 *For exact schemas, code snippets, and instructions, please read [DEVELOPER_HANDOFF.md](file:///s:/SEM_7/SIUUHH/KarigaarAI/DEVELOPER_HANDOFF.md).*

---

## 🛠️ 5. Running the Project Locally

### 1. Backend Server
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Docs: `http://localhost:8000/docs`

### 2. Web Client
```bash
cd karigaar-web
npm install
npm run dev
```
- Web UI: `http://localhost:5173`

### 3. Flutter Client (Optional)
```bash
cd flutter
flutter run
```
