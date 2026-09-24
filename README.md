# 🎨 KaarigarAI (कारीगर AI)

> **AI-Powered Smart Cataloging & Direct Market Linkage for India's Traditional Artisans**

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🌟 What is KaarigarAI?

KaarigarAI empowers India's 7 million+ marginalized artisans — potters, weavers, metalworkers, woodcarvers, and folk painters — with an AI-first platform that transforms a **raw phone photo + voice description** into a **professionally cataloged, fairly priced, and market-ready product listing**, then instantly connects artisans with verified wholesale buyers.

**No digital literacy required. Just snap, speak, and sell.**

```
📸 Photo + 🎙️ Voice ──► 🤖 5-Stage AI Pipeline ──► 📋 Market-Ready Listing ──► 🤝 B2B Buyer Matches
```

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **📸 AI Image Enhancement** | U²-Net background removal + OpenCV studio lighting simulation |
| **🎙️ Voice-to-Text (6 Languages)** | Faster-Whisper transcription in Hindi, English, Odia, Bengali, Tamil, Marathi |
| **🎨 Craft Classification** | Fine-tuned CLIP ViT-B/32 across 8 artisan craft domains (98%+ accuracy) |
| **💰 Fair Price Prediction** | Stacking Ensemble (XGBoost + CatBoost + RidgeCV) with price floor safeguards |
| **✍️ Bilingual Listing Generation** | Groq (Llama 3) / Gemini LLMs generate Hindi + English marketplace copy |
| **🛒 One-Click Publishing** | Persistent MongoDB Atlas storage with unique Product IDs (KRG-XXXXXX) |
| **🤝 B2B Market Matching** | Deterministic 6-signal weighted buyer matching with transparent explainability |
| **🪪 Digital Artisan Passport** | Verifiable digital identity card with QR code and craft certification |
| **📋 Wholesale Spec Sheets** | Auto-generated B2B trade documents with bulk pricing tiers |
| **📨 Trade Inquiry System** | Demo B2B inquiry submission with tracking |

> 📖 **Full feature details**: See [`DOCS/FEATURES.md`](DOCS/FEATURES.md)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    KaarigarAI Platform                           │
├──────────────────────┬──────────────────────────────────────────┤
│   karigaar-web/      │   React 18 + Vite + Claymorphism CSS    │
│   (Web Frontend)     │   Zustand, i18next, Framer Motion       │
├──────────────────────┼──────────────────────────────────────────┤
│   backend/           │   FastAPI + Motor (Async MongoDB)        │
│   (AI/ML Server)     │   CLIP, Whisper, XGBoost, Groq/Gemini  │
├──────────────────────┼──────────────────────────────────────────┤
│   MongoDB Atlas      │   Products, Buyers, Inquiries, GridFS   │
│   (Cloud Database)   │   Image storage & streaming             │
└──────────────────────┴──────────────────────────────────────────┘
```

### AI/ML Pipeline (`POST /catalog/process`)

| Stage | Model | Output |
|-------|-------|--------|
| 1. Image Enhancement | U²-Net (REMBG) + OpenCV | Studio-quality product photo |
| 2. Voice Transcription | Faster-Whisper (int8) | Text transcript + language |
| 3. Craft Classification | Fine-Tuned CLIP ViT-B/32 | Category + confidence score |
| 4. Price Prediction | XGBoost + CatBoost + RidgeCV | ₹min / ₹suggested / ₹max |
| 5. Listing Generation | Groq (Llama 3) / Gemini | Bilingual title, description, SEO tags |

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+ with pip
- Node.js 18+ with npm
- MongoDB Atlas account (free tier works)
- API Keys: [Groq](https://console.groq.com) (free) and/or [Google Gemini](https://aistudio.google.com) (free)

### 1. Backend Server

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys and MongoDB URI

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Web Frontend

```bash
cd karigaar-web
npm install

# Copy and configure environment variables
cp .env.example .env

npm run dev
```

Web UI: [http://localhost:5173](http://localhost:5173)

> 📖 **Detailed setup guide**: See [`DOCS/RUNNING.md`](DOCS/RUNNING.md)

---

## 🧪 Testing

```bash
cd backend
.\venv\Scripts\activate

# Run all test suites
python tests/test_api_audit.py          # 10 API contract sections
python tests/test_market_linkage.py     # 48 matching engine tests
python tests/test_persistence.py        # 8 database lifecycle phases
python tests/test_price_flow.py         # 3 pricing flow scenarios
```

**Result: 69+ tests, 100% pass rate.**

> 📖 **Test report**: See [`DOCS/AUDIT.md`](DOCS/AUDIT.md)

---

## 📂 Repository Structure

```
KaarigarAI/
├── backend/                    # FastAPI AI/ML Backend Server
│   ├── app/
│   │   ├── ai/                 # Image enhancer, transcriber, listing generator
│   │   ├── ml/                 # CLIP classifier, price predictor, feature extractor
│   │   ├── db/                 # MongoDB connection, indexes, buyer seed data
│   │   ├── routers/            # API route handlers
│   │   └── services/           # Business logic (catalog, market, product, media)
│   ├── tests/                  # Automated test suites
│   ├── requirements.txt
│   └── .env.example
│
├── karigaar-web/               # React 18 Web Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (ClayCard, GITagBanner, etc.)
│   │   ├── pages/              # Route pages (Catalog, Dashboard, Passport, etc.)
│   │   ├── store/              # Zustand state management
│   │   ├── locales/            # i18n translations (hi, en, or, bn, ta, mr)
│   │   ├── config/             # API client configuration
│   │   └── styles/             # Claymorphism CSS design system
│   ├── package.json
│   └── .env.example
│
├── DOCS/                       # Project Documentation
│   ├── FEATURES.md             # Complete features & capabilities guide
│   ├── PROJECT_DOCUMENTATION.md # Architecture & system documentation
│   ├── RUNNING.md              # Detailed execution & setup guide
│   ├── AUDIT.md                # Backend test & security audit report
│   ├── SIH_READINESS.md        # SIH hackathon readiness assessment
│   ├── DEVELOPER_HANDOFF.md    # Developer onboarding & task specs
│   ├── Knowledgetransfer.md    # Quick knowledge transfer guide
│   ├── 03_ai_pipeline_doc.md   # AI pipeline technical documentation
│   └── understanding.md        # Problem statement & solution overview
│
├── .gitignore
└── README.md                   # ← You are here
```

---

## 📖 Documentation Index

| Document | Description |
|----------|-------------|
| [`DOCS/FEATURES.md`](DOCS/FEATURES.md) | Complete features, capabilities & uniqueness |
| [`DOCS/PROJECT_DOCUMENTATION.md`](DOCS/PROJECT_DOCUMENTATION.md) | Full architecture & system documentation |
| [`DOCS/RUNNING.md`](DOCS/RUNNING.md) | Step-by-step setup & execution guide |
| [`DOCS/AUDIT.md`](DOCS/AUDIT.md) | Backend test & security audit report |
| [`DOCS/SIH_READINESS.md`](DOCS/SIH_READINESS.md) | SIH hackathon readiness assessment |
| [`DOCS/DEVELOPER_HANDOFF.md`](DOCS/DEVELOPER_HANDOFF.md) | Developer onboarding & marketplace sync spec |
| [`DOCS/understanding.md`](DOCS/understanding.md) | Problem statement & solution overview |
| [`backend/README.md`](backend/README.md) | Backend API architecture & endpoints |
| [`karigaar-web/README.md`](karigaar-web/README.md) | Web frontend components & design system |

---

## 🛣️ Roadmap

- [ ] JWT Authentication & Row-Level Security
- [ ] ONDC Network Integration (Beckn Protocol)
- [ ] Amazon Karigar SP-API Publishing
- [ ] ONNX Model Quantization for Offline Mobile
- [ ] Real Buyer Onboarding & Live Communication
- [ ] Multi-Artisan Cooperative Support

---

## 👥 Team

**Smart India Hackathon 2024** — Problem Statement: AI-Driven Cataloging & Market Linkage for Handloom & Handicraft Artisans

---

## 📜 License

This project is developed as part of the Smart India Hackathon (SIH) initiative.

---

*Built with ❤️ for India's traditional artisan communities — preserving heritage through technology.*
