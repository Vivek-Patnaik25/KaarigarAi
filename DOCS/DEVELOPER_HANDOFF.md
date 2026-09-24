# 🤝 KarigaarAI — Developer Handoff & Marketplace Sync Task Spec

> **Project Mission**: Empowering Indian traditional artisans with an AI-first cataloging pipeline, fine-tuned craft classification, dynamic fair pricing, and 1-click multi-channel publishing to **Amazon Karigar**, **ONDC Network**, **Flipkart Samarth**, and digital storefronts.

---

## 📌 1. Executive Summary & Current Status

### ✅ What is Already Built & Working:
1. **Fine-Tuned ML Core (`backend/app/ml/`)**:
   - **Craft Classifier**: Fine-tuned CLIP ViT-B/32 vision encoder (`craft_classifier_finetuned.pt`) achieving **95.7%+ precision** across 8 craft domains (terracotta, handloom silk, metalcraft, etc.).
   - **Pricing Engine**: Stacking Ensemble (RidgeCV meta-learner over XGBoost + LightGBM + CatBoost) trained on 26,796 scraped artisan products with hard price floor safeguards (`category_price_floors.json`).
2. **Unified Catalog API (`POST /catalog/process`)**:
   - Multipart endpoint handling image background removal/studio enhancement (Rembg/OpenCV), multilingual speech-to-text (Faster-Whisper), craft classification, price estimation, and LLM multilingual listing copy generation.
3. **Web Client (`karigaar-web`)**:
   - React 18 + Vite with Claymorphic design system.
   - Interactive Before/After image slider, contextual GI-Tag awareness banner, and `ArtisanPassport` profile card (`/passport/:artisanId`).

---

## 🎯 2. Assigned Task: Multi-Platform One-Click Marketplace Sync

### 📍 Problem Statement:
Currently, the `/catalog/publish` endpoint in `backend/app/routers/catalog_router.py` returns a mock static URL. We need to implement a modular **Marketplace Sync Engine** that formats and publishes the generated product listing into actual target channels (or staging/mock integration APIs):
1. **Amazon Karigar (SP-API / Listings Feed)**
2. **ONDC Network (Beckn Protocol Catalog Schema)**
3. **WhatsApp / Social Commerce Storefront**

---

## 🛠️ 3. Architecture & Task Breakdown for Teammate

```
                           ┌──────────────────────────────────────────────┐
                           │      POST /catalog/publish                   │
                           │  Payload: listing, price, platforms: [...]   │
                           └──────────────────────┬───────────────────────┘
                                                  │
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │      app/services/marketplace_service.py         │
                        │             (NEW MODULE TO BUILD)                 │
                        └─────────┬───────────────┬────────────────┬────────┘
                                  │               │                │
            ┌─────────────────────┴─┐   ┌─────────┴────────────┐   └──────────────────────┐
            ▼                       ▼   ▼                      ▼                          ▼
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
    │  Amazon Karigar Sync │  │   ONDC Beckn Sync    │  │  Flipkart Samarth    │  │ WhatsApp Storefront  │
    │ (SP-API Listing Feed)│  │ (Retail BAP Catalog) │  │  (Catalog Feed API)  │  │ (Catalogue URL/PDF)  │
    └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

---

### 📝 Step-by-Step Implementation Instructions

#### Task A: Create Marketplace Service (`backend/app/services/marketplace_service.py`)
Create a dedicated service to handle payload conversion and dispatch for each platform:

1. **Amazon Karigar Adapter**:
   - Format attributes required by Amazon Listings API:
     - `standard_product_id` (UPC/EAN or GTIN exemption)
     - `brand`: `"Karigaar - {artisan_name}"`
     - `item_name`: `listing['title_en']`
     - `product_description`: `listing['description_en']`
     - `bullet_point`: Features extracted from craft tradition and materials
     - `main_image_url`: `enhanced_image_url`
     - `purchasable_offer`: `price_suggested` (currency: `INR`)
     - `target_audience_keywords`: `listing['seo_tags']`
   - Include sandbox mode toggle via `.env` (`AMAZON_SANDBOX=True`, `AMAZON_REFRESH_TOKEN`, `AMAZON_CLIENT_ID`, `AMAZON_CLIENT_SECRET`).

2. **ONDC (Open Network for Digital Commerce) Adapter**:
   - Format catalog item adhering to **Beckn Protocol (v1.2.0)**:
     - `bpp/descriptor`: Name, short/long description, images
     - `bpp/providers`: Artisan Store ID & location
     - `bpp/items`: Item ID, price tag (`currency: "INR"`, `value: str(price_suggested)`), category (`"Handicrafts"`), `@ondc/org/returnable: false`, `@ondc/org/cancellable: true`
     - `@ondc/org/statutory_reqs_packaged_commodities`: Manufacturer name, country of origin (`"IND"`), net quantity.

3. **WhatsApp / Direct Web Storefront**:
   - Generate a direct checkout / enquiry deep link:
     - `https://wa.me/{artisan_phone}?text=Hello!+I+am+interested+in+buying+{title_en}+for+₹{price_suggested}`.

---

#### Task B: Update API Schema & Endpoint
1. **Schema Update (`backend/app/models/schemas.py`)**:
   ```python
   class ProductListingPublishRequest(BaseModel):
       listing_id: Optional[str] = None
       artisan_id: str
       title: str
       description: str
       category: str
       price: int
       image_url: str
       channels: List[str] = ["amazon_karigar", "ondc", "whatsapp"]  # Selectable
       metadata: Optional[Dict[str, Any]] = None

   class ChannelPublishStatus(BaseModel):
       channel: str
       status: str  # 'success', 'pending', 'simulated'
       external_url: Optional[str] = None
       feed_id: Optional[str] = None
       error: Optional[str] = None

   class ProductListingPublishResponse(BaseModel):
       listing_id: str
       timestamp: str
       channels: List[ChannelPublishStatus]
   ```

2. **Router Update (`backend/app/routers/catalog_router.py`)**:
   - Wire `POST /catalog/publish` to execute `marketplace_service.publish_to_channels(...)`.

---

#### Task C: Update Web UI (`karigaar-web/src/components/PublishModal.jsx` or `CatalogPage.jsx`)
- Allow the artisan to check/uncheck channels:
  - ☑️ **Amazon Karigar** (Global audience & Prime delivery)
  - ☑️ **ONDC Network** (Zero commission open Indian network)
  - ☑️ **WhatsApp Store** (Direct customer chats & UPI)
- Display individual success badges with clickable live preview links for each selected platform after publishing.

---

## 📂 4. Key Repository File Map

| Path | Purpose |
| :--- | :--- |
| [backend/app/routers/catalog_router.py](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/routers/catalog_router.py) | Main catalog router containing `POST /catalog/publish`. |
| [backend/app/models/schemas.py](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/models/schemas.py) | Pydantic request/response models. |
| [backend/app/services/](file:///s:/SEM_7/SIUUHH/KarigaarAI/backend/app/services/) | Location to place `marketplace_service.py`. |
| [karigaar-web/src/pages/CatalogPage.jsx](file:///s:/SEM_7/SIUUHH/KarigaarAI/karigaar-web/src/pages/CatalogPage.jsx) | Web wizard finish step where publishing is triggered. |
| [karigaar-web/src/components/PassportCard.jsx](file:///s:/SEM_7/SIUUHH/KarigaarAI/karigaar-web/src/components/PassportCard.jsx) | Digital Artisan Identity Card. |

---

## 🚀 5. How to Run & Test the Local Setup

### Backend:
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`

### Frontend Web:
```bash
cd karigaar-web
npm install
npm run dev
```
- Web UI: `http://localhost:5173`
