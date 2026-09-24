# 🎨 KaarigarAI — Features, Capabilities & Uniqueness

> **Empowering India's 7 Million+ Artisans with AI-Driven Cataloging, Fair Pricing, and Direct Market Linkage**

---

## 🌟 Platform Vision

KaarigarAI is an **AI-first smart cataloging and B2B market linkage platform** built for marginalized Indian artisans — potters, weavers, metalworkers, woodcarvers, and folk painters — who possess extraordinary craft skills but lack the digital tools to sell their products professionally online.

The platform transforms a **raw photo + voice description** into a **market-ready, multilingual, fairly-priced product listing** and instantly connects artisans with verified wholesale buyers — all without requiring digital literacy.

---

## 🚀 Core Features

### 1. 📸 AI-Powered Image Enhancement
- **Background Removal**: U²-Net (REMBG) neural network strips messy backgrounds and places products on clean studio-white surfaces.
- **Studio Lighting Simulation**: OpenCV-based CLAHE contrast boosting, Gray World white balance, and unsharp masking transform casual phone photos into professional studio-quality images.
- **Quality Scoring**: Automated Laplacian variance-based image clarity scoring for demo assessments.
- **Before / After Comparison**: Interactive draggable slider letting artisans visually compare their original photo vs the AI-enhanced version.

### 2. 🎙️ Multilingual Voice-to-Text Transcription
- **6 Indic Languages Supported**: Hindi (हिन्दी), English, Odia (ଓଡ଼ିଆ), Bengali (বাংলা), Tamil (தமிழ்), Marathi (मराठी).
- **Faster-Whisper (int8)**: CPU-optimized speech-to-text engine transcribes artisan voice descriptions in native dialects with high accuracy.
- **Zero Typing Required**: Artisans simply speak naturally about their craft, materials, and heritage — the AI handles the rest.

### 3. 🎨 Fine-Tuned Craft Classification (Computer Vision)
- **CLIP ViT-B/32 Vision Encoder**: Fine-tuned with a custom 2-stage MLP head on Indian artisan craft images.
- **8 Craft Domains**: Pottery & Terracotta, Textile & Handloom, Metalcraft & Brassware, Woodcraft & Carving, Bamboo & Cane, Leather & Hide, Painting & Folk Art, Stone & Marble.
- **98.19% NLP Fallback Accuracy**: Dual classification pipeline — vision-first with NLP text-based fallback for robustness.
- **Zero-Shot Adaptability**: Can recognize craft types even from categories not explicitly trained.

### 4. 💰 AI Fair Price Prediction Engine
- **Stacking Ensemble Architecture**: RidgeCV meta-learner stacking predictions from XGBoost, LightGBM, and CatBoost base models.
- **Trained on 26,796 Real Artisan Products**: Scraped and curated from Indian handcraft marketplaces.
- **Empirical Price Floor Safeguards**: 10th-percentile minimum price floors per category prevent AI from ever undervaluing artisan work.
- **Transparent Price Reasoning**: Explainable output explaining *why* the AI recommends a specific price range.
- **Artisan Override**: Artisans can accept, reject, or adjust the AI's suggestion using an interactive price slider before publishing.

### 5. ✍️ Multilingual AI Listing Generation
- **Dual-LLM Pipeline**: Primary generation via Groq (Llama 3) with automatic fallback to Google Gemini.
- **Bilingual Output**: Every listing generates both Hindi and English titles, descriptions, and marketplace copy.
- **SEO-Optimized Tags**: Auto-generated searchable keywords for marketplace discoverability.
- **Craft Heritage Awareness**: AI identifies and highlights GI-tagged craft traditions (e.g., Sambalpuri Ikat, Madhubani, Bidriware) with premium pricing recommendations.

### 6. 🛒 One-Click Product Publishing
- **MongoDB Atlas Persistence**: Every published product is durably stored with a unique Product ID (`KRG-XXXXXX`).
- **GridFS Image Storage**: Enhanced product images stored directly in MongoDB GridFS with streaming retrieval.
- **Shareable Public Product Pages**: Each product gets a permanent public URL (`/p/KRG-XXXXXX`) for sharing with buyers.
- **Product Lifecycle Management**: Full CRUD with status tracking (Draft → Published → Sold → Archived).

### 7. 🤝 Deterministic B2B Market Linkage Engine
- **25 Verified Demo Buyers**: Spanning Heritage Boutiques, Fair Trade Exporters, Government Emporiums, Institutional Buyers, and E-commerce Aggregators.
- **6-Signal Weighted Matching Algorithm**:
  | Signal | Weight | Method |
  |--------|--------|--------|
  | Craft Category | 30% | Exact match + craft family compatibility |
  | Price Range | 25% | Interval overlap (intersection/union) |
  | Quantity Capacity | 20% | Volume interval evaluation |
  | Material Compatibility | 10% | Exact + taxonomy matching |
  | Geographic Region | 10% | State match + regional zone fallback |
  | Craft Tradition | 5% | Heritage tradition string matching |
- **Dynamic Weight Renormalization**: Missing signals are excluded and weights automatically redistribute — artisans are never penalized for incomplete data.
- **9-Step Tie-Breaking**: Guarantees 100% deterministic, reproducible buyer rankings across runs.
- **Transparent Explainability**: Every match shows clear reasons (✓ Category match, ✓ Price fit 85%, • Missing: Geographic region).

### 8. 📨 Demo Trade Inquiry System
- **Simulated B2B Inquiries**: Artisans can send demo quotation requests to matched buyers.
- **Inquiry Tracking**: Each inquiry gets a unique ID (`INQ-XXXXXX`) and is persisted in MongoDB.
- **Explicit Demo Labeling**: All simulated inquiries are clearly marked as `demo_data: true` to prevent misleading users.

### 9. 🪪 Artisan Digital Passport
- **Official Digital Identity Card**: Unique artisan ID (`KG-YYYY-XXXX`), craft specialization, regional heritage, experience rating.
- **QR Code Verification**: Scannable QR code linking to the artisan's verified digital profile.
- **India Craft Mark Integration**: Visual GI-tag and craft certification badges.
- **Shareable & Downloadable**: Artisans can share their digital passport or download it as a credential.

### 10. 📋 B2B Wholesale Specification Sheet
- **Standardized Trade Documents**: Auto-generated wholesale spec sheets with bulk pricing tiers (10-49, 50-99, 100+ units).
- **Technical Specifications**: Materials, techniques, dimensions, lead times, MOQ (Minimum Order Quantity).
- **WhatsApp Integration**: One-tap pre-filled WhatsApp inquiry messages for direct buyer-artisan communication.

---

## 🏗️ Technical Architecture

### Frontend (React Web App)
- **React 18 + Vite 5** with hot module reloading
- **Claymorphism Design System**: Puffy 3D cards, soft pastels, tactile interactions
- **Zustand** for lightweight state management
- **React Router v6** for SPA navigation
- **i18next** for 6-language internationalization
- **Framer Motion** for smooth micro-animations

### Backend (FastAPI AI/ML Server)
- **FastAPI** with async Motor/PyMongo for MongoDB Atlas
- **5-Stage AI Pipeline** in one atomic `POST /catalog/process` call
- **GridFS** for binary image storage and streaming
- **Deterministic Market Matching Engine** with weighted scoring
- **Comprehensive Test Suite**: 69+ automated tests across 4 test suites (100% pass rate)

### AI/ML Models
| Model | Technology | Purpose |
|-------|-----------|---------|
| Image Enhancer | U²-Net (REMBG) + OpenCV | Background removal + studio lighting |
| Speech-to-Text | Faster-Whisper (int8) | Multilingual voice transcription |
| Craft Classifier | Fine-Tuned CLIP ViT-B/32 | 8-domain craft categorization |
| Price Predictor | XGBoost + CatBoost + RidgeCV Stacking | Fair market price estimation |
| Listing Generator | Groq (Llama 3) + Gemini Fallback | Bilingual marketplace copy |

### Database
- **MongoDB Atlas** (Cloud) with indexed collections for Products, Buyers, and Inquiries
- **GridFS** for image binary storage with streaming retrieval and cascade cleanup

---

## 🎯 What Makes KaarigarAI Unique

### 1. Built FOR Artisans, Not General E-Commerce
KaarigarAI is **not** a generic shopping app. It has no shopping carts, no payment gateways, no consumer consumerism. It is purpose-built to **empower artisans** with digital tools while respecting their craft identity and heritage.

### 2. Voice-First, Zero Digital Literacy Required
Most artisan platforms assume users can type product descriptions and navigate complex UIs. KaarigarAI works with just a **photo and a spoken description** in the artisan's native language.

### 3. AI That Protects Artisan Value
The pricing engine includes **hard price floor safeguards** trained on real market data — the AI can never recommend a price that undervalues handcrafted work. Artisans always have the final say with interactive price override.

### 4. Transparent, Non-Hallucinated Market Matching
Unlike opaque recommendation systems, every buyer match comes with **explicit scoring breakdowns and reasoning**. Missing data is honestly reported ("Information unavailable: Geographic location") rather than fabricated.

### 5. Heritage-Aware Intelligence
The system recognizes **Geographical Indication (GI) tagged crafts** and automatically highlights premium pricing opportunities — educating artisans about the value of their cultural heritage.

### 6. Complete Digital Identity Ecosystem
Beyond just selling products, KaarigarAI provides artisans with a **verifiable digital passport** — a professional credential they can share with buyers, government schemes, and craft certification bodies.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/` | System status & health |
| `GET` | `/health` | Health check |
| `POST` | `/v1/ml/classify` | CLIP craft classification |
| `POST` | `/v1/catalog/predict-price` | ML price prediction |
| `POST` | `/v1/catalog/generate-listing` | LLM bilingual listing generation |
| `POST` | `/v1/catalog/process` | Full multimodal pipeline (image + voice → listing) |
| `POST` | `/v1/catalog/publish` | Publish product to MongoDB |
| `GET` | `/v1/products/{id}` | Retrieve product by ID |
| `GET` | `/v1/catalog/listings/{artisan_id}` | List artisan's products |
| `PATCH` | `/v1/products/{id}/status` | Update product status |
| `DELETE` | `/v1/products/{id}` | Delete product + cleanup media |
| `POST` | `/v1/market/match` | Find B2B buyer matches |
| `GET` | `/v1/market/buyers` | List registered buyers |
| `POST` | `/v1/market/inquiries` | Create trade inquiry |
| `GET` | `/v1/market/inquiries/{product_id}` | Get inquiries for product |
| `GET` | `/v1/media/{file_id}` | Stream image from GridFS |
| `GET` | `/v1/media/{file_id}/info` | Image metadata |

---

## 🧪 Testing & Verification

| Test Suite | Tests | Scope |
|-----------|-------|-------|
| `test_api_audit.py` | 10 Sections | Full API contract, ML endpoints, CRUD, media, error handling |
| `test_market_linkage.py` | 48 Tests | Buyer matching, weight renormalization, tie-breaking, inquiries |
| `test_persistence.py` | 8 Phases | MongoDB Atlas, GridFS lifecycle, cascade cleanup |
| `test_price_flow.py` | 3 Flows | AI price acceptance, artisan override, market sync |

**Result: 69+ tests, 100% pass rate, zero errors.**

---

## 🛣️ Roadmap

- [ ] JWT Authentication & Row-Level Security
- [ ] ONDC Network Integration (Beckn Protocol)
- [ ] Amazon Karigar SP-API Publishing
- [ ] ONNX Model Quantization for Offline Mobile Classification
- [ ] Real Buyer Onboarding & Live Trade Communication
- [ ] Multi-Artisan Cooperative Support

---

*Built with ❤️ for India's traditional artisan communities — preserving heritage through technology.*
