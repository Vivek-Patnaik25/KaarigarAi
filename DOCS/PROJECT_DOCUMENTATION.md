# 🎨 KarigaarAI (कारीगर AI) - Complete Project Architecture & System Documentation

> **Empowering Indian Artisans through AI-Powered Multilingual Cataloging, Fine-Tuned Craft Intelligence, Fair Pricing, and Multi-Platform E-Commerce Sync.**

---

## 📌 1. Project Overview & Mission

**KarigaarAI** is an AI-first platform purpose-built to bridge the digital divide for traditional Indian artisans and craftspeople. Many artisans possess mastery in craftwork (pottery, handloom textiles, woodwork, brassware, etc.) but face friction with digital literacy, professional studio photography, multi-language product copywriting, fair market pricing, and multi-channel marketplace distribution.

KarigaarAI solves this through a voice-first, multi-platform workflow:
1. 📸 **Snap a Photo** of the handcrafted product on any phone or web client.
2. 🎙️ **Speak Naturally** in any Indian regional language (Hindi, Tamil, Bengali, Marathi, etc.) describing materials, technique, and heritage.
3. ⚡ **5-Stage AI/ML Engine** handles image background removal & studio lighting, speech transcription, fine-tuned craft categorization (CLIP ViT-B/32), fair price prediction (Stacking ensemble + price floors), and SEO-optimized multilingual catalog generation.
4. 🌐 **1-Click Multi-Channel Sync** distributes the listing to ONDC, Amazon Karigar, WhatsApp storefronts, and digital identity passports.

---

## 🏛️ 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Clients ["📱 Client Layer"]
        A1["🌐 React 18 Web App (karigaar-web)"]
        A2["📱 Flutter Mobile App (flutter)"]
        A3["🪪 Artisan Digital Passport (/passport/:artisanId)"]
    end

    subgraph Backend_Gateway ["⚡ FastAPI Backend Server (Port 8000)"]
        H[FastAPI Application Gateway]
        H --> I["/catalog/process (Unified Multipart Pipeline)"]
        H --> J["/catalog/generate-listing"]
        H --> K["/catalog/predict-price"]
        H --> L["/catalog/publish"]
        H --> M["/ml/classify"]
        H --> M2["/ml/predict-price"]
    end

    subgraph AI_ML_Engines ["🧠 AI & ML Pipeline Core"]
        N["1. Image Studio (Rembg U²-Net + OpenCV Normalization)"]
        O["2. Speech Transcription (Faster-Whisper int8)"]
        P["3. Fine-Tuned Craft Classifier (CLIP ViT-B/32 + 2-Stage MLP Head)"]
        Q["4. Stacking Price Predictor (XGBoost + LightGBM + CatBoost + RidgeCV)"]
        Q2["4b. Safeguards: Empirical 10th-Percentile Price Floors"]
        R["5. Multilingual Listing Copy (Groq Llama 3 / Google Gemini)"]
    end

    subgraph External_Integrations ["🌐 External Marketplaces & Channels"]
        S["ONDC Network (Beckn Protocol Catalog Schema)"]
        T["Amazon Karigar (SP-API Listing Feeds)"]
        U["WhatsApp Direct Social Storefront"]
    end

    Clients <==> |HTTP Multipart / JSON| H
    I --> N
    I --> O
    I --> P
    I --> Q
    I --> R
    L --> S
    L --> T
    L --> U
```

---

## 🔌 3. Component Connections & Data Flow

### 🔄 End-to-End Workflow: From Photo to Multi-Platform Listing

```mermaid
sequenceDiagram
    autonumber
    actor Artisan as 👩‍🎨 Artisan
    participant Client as 🌐 Web (React) / 📱 Mobile (Flutter)
    participant Backend as ⚡ FastAPI Backend
    participant Rembg as 🖼️ Rembg + OpenCV Studio
    participant Whisper as 🎙️ Faster-Whisper
    participant CLIP as 🎯 Fine-Tuned CLIP Classifier
    participant Pricing as 📊 Stacking Price Engine
    participant LLM as 🤖 Groq / Gemini LLM
    participant Store as 🛒 Multi-Channel Sync

    Artisan->>Client: Uploads photo & records voice description
    Client->>Backend: POST /catalog/process (image + audio/transcript + language_hint)
    
    par AI Processing Stage
        Backend->>Rembg: Remove background, normalize balance, add studio lighting
        Rembg-->>Backend: Enhanced Studio Image (.jpg)
    and
        Backend->>Whisper: Transcribe regional dialect audio to text
        Whisper-->>Backend: Transcript ("हाथ से बनी मिट्टी की हांडी...")
    end

    Backend->>CLIP: Fine-tuned Vision inference on image
    CLIP-->>Backend: Craft category (e.g., pottery_terracotta) + 95.7% confidence

    Backend->>Pricing: 8-feature tabular vector (cat, GI, material, technique, length)
    Pricing-->>Backend: Suggested price (₹969), Range (₹775 - ₹1,211), Model: Stacking
    
    Backend->>LLM: Generate multilingual titles, tags, story & specifications
    LLM-->>Backend: Structured JSON (English + Hindi + Regional + SEO Tags)

    Backend-->>Client: Complete ProcessProductData response
    Client->>Artisan: Before/After Slider, GI-Tag Banner, Price Breakdown & Edit Form
    Artisan->>Client: Clicks "Publish"
    Client->>Backend: POST /catalog/publish (selected channels)
    Backend->>Store: Dispatches to Amazon Karigar, ONDC, WhatsApp Store
    Store-->>Backend: Sync Confirmation & Live Product Links
    Backend-->>Client: Published URLs & Shareable Artisan Passport
```

---

## 📁 4. Project Directory Map & File Responsibilities

### 📂 Root Directory
```
KarigaarAI/
├── backend/                   # FastAPI Backend and AI/ML Service
├── karigaar-web/              # React 18 + Vite Web Client (Claymorphism UI)
├── flutter/                   # Flutter Cross-Platform Mobile Application
├── 03_ai_pipeline_doc.md      # AI pipeline technical specifications
├── DEVELOPER_HANDOFF.md       # Teammate handoff spec for Amazon & ONDC sync
├── Knowledgetransfer.md       # Developer onboarding & architecture summary
├── PROJECT_DOCUMENTATION.md   # Complete system architecture (This file)
├── RUNNING.md                 # Local setup and execution guide
```

---

### 📂 Backend Architecture (`/backend`)

| Directory / File | Description & Connections |
| :--- | :--- |
| **`app/main.py`** | FastAPI entry point, lifespan initialization, CORS middleware, static `/temp` mounts. |
| **`app/core/config.py`** | Pydantic Settings, environment variables (`GROQ_API_KEY`, `GEMINI_API_KEY`, model paths). |
| **`app/core/responses.py`** | Standardized API response format (`ApiResponse` envelope with `status`, `data`, `message`). |
| **`app/models/schemas.py`** | Pydantic data schemas: `ProcessProductData`, `GenerateListingRequest`, `ProductListingPublishRequest`. |
| **`app/routers/catalog_router.py`** | Main catalog pipeline router handling `/catalog/process`, `/catalog/publish`. |
| **`app/routers/ml_router.py`** | Standalone ML endpoints: `/ml/classify` and `/ml/predict-price`. |
| **`app/ai/image_enhancer.py`** | Background removal via `rembg`, drop shadow generation, and OpenCV white-balancing. |
| **`app/ai/transcriber.py`** | Local `faster-whisper` speech-to-text inference with Indian regional dialect support. |
| **`app/ai/listing_generator.py`** | Prompt orchestration with Groq (Llama 3.1 8B/70B) & Gemini 1.5 Flash for multi-language copy. |
| **`app/ml/classifier.py`** | **Fine-tuned CLIP ViT-B/32 vision classifier** with 2-stage MLP head and NLP fallback. |
| **`app/ml/price_predictor.py`** | **Stacking Ensemble Engine** (RidgeCV over XGBoost, LightGBM, CatBoost) with empirical price floors. |
| **`app/ml/weights/`** | Model checkpoints (`craft_classifier_finetuned.pt`, `stacking_model.pkl`, `category_price_floors.json`, etc.). |
| **`app/services/`** | Service abstractions (`image_service.py`, `speech_service.py`, `llm_service.py`, `marketplace_service.py`). |

---

### 📂 Web Frontend Architecture (`/karigaar-web`)

| Directory / File | Description & UI Components |
| :--- | :--- |
| **`src/App.jsx`** | Router configuration (`/`, `/catalog`, `/passport/:artisanId`, `/dashboard`). |
| **`src/pages/CatalogPage.jsx`** | 4-step interactive wizard: Language $\rightarrow$ Media Upload $\rightarrow$ AI Processing $\rightarrow$ Listing Preview & Publish. |
| **`src/pages/ArtisanPassport.jsx`** | Digital artisan identity card with QR code and shareable WhatsApp store links. |
| **`src/components/PassportCard.jsx`** | Claymorphic craft certificate ID card with GI badges and craft metrics. |
| **`src/components/GITagBanner.jsx`** | Contextual awareness banner highlighting 20–40% price premiums for GI-tagged crafts. |
| **`src/components/ListingPreview.jsx`** | Interactive Before/After image comparison slider and editable listing form. |
| **`src/store/catalogStore.js`** | Zustand state management storing uploaded files, previews, and pipeline results. |
| **`src/styles/clay.css`** | Custom 3D Claymorphic styling tokens (tactile drop shadows and pastel palettes). |

---

## 🧠 5. The 5 AI & ML Pipelines Explained

```
                     ┌───────────────────────────────┐
                     │ Raw Product Image + Voice Clip │
                     └───────────────┬───────────────┘
                                     │
      ┌──────────────────────────────┴──────────────────────────────┐
      ▼                                                             ▼
[Pipeline 1: Image Studio]                              [Pipeline 2: Voice STT]
- Rembg U²-Net Background Removal                       - Faster-Whisper int8 STT
- OpenCV Histogram Normalization                         - Indian Dialect Auto-Detect
- Studio Drop Shadow & 1:1 Canvas                        - Transcript Extraction
      │                                                             │
      └──────────────────────────────┬──────────────────────────────┘
                                     │
                                     ▼
                        [Pipeline 3: Fine-Tuned CLIP Classifier]
                        - Base: openai/clip-vit-base-patch32
                        - Custom 2-Stage MLP Head (LayerNorm + GELU + Dropout)
                        - 8 Craft Categories (95.7%+ Precision)
                                     │
                                     ▼
                        [Pipeline 4: Stacking Price Engine]
                        - Base Models: XGBoost + LightGBM + CatBoost
                        - Meta-Learner: RidgeCV on 26,796 scraped craft products
                        - Empirical 10th-Percentile Price Floor Safeguards
                                     │
                                     ▼
                        [Pipeline 5: Multilingual Catalog Generator]
                        - Groq (Llama 3.1) / Google Gemini 1.5 Flash
                        - English, Hindi, and Regional Cultural Narratives
                        - Search Tags, Material Detection & Care Specs
```

---

## 🚀 6. Execution & Testing Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Run Backend Server** | `cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` |
| **Run Web Client** | `cd karigaar-web; npm run dev` (Access via `http://localhost:5173`) |
| **Run Flutter Mobile App** | `cd flutter; flutter run` |
| **Test ML Inference CLI** | `python -c "from app.ml.classifier import classify_craft; print(classify_craft('Test_Image.webp'))"` |
| **Swagger API Docs** | Open browser to `http://localhost:8000/docs` |
