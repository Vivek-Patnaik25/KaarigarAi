# 🎨 KarigaarAI (कारीगर AI) — Web Client (React + Claymorphism)

> **AI-Powered Multilingual Cataloging, Fair Pricing, and Multi-Platform E-Commerce Sync for Indian Artisans.**

Migrated from Flutter Mobile to a modern **React 18 + Vite** Web Application featuring an authentic **Claymorphism** visual system (thick, multi-layered box-shadows, puffy 3D inflated surfaces, soft pastel fills, and tactile clay interactions).

---

## 🌟 Key Features

1. **Claymorphism Design Language**:
   - Puffy 3D cards with dual-layer shadows (colored inner glow + dark outer drop shadow).
   - Soft pastel fills (`--clay-surface: #F5EDE0`, `--clay-bg: #FDF6EE`, `--clay-primary: #E8873A`).
   - Tactile press interactions on click and scale down on hover.
   - High accessibility with tactile buttons and Indic typography (`Nunito`, `Inter`, `Noto Sans Devanagari`).

2. **Multilingual Support (i18n)**:
   - Full support for 6 regional Indic languages: **Hindi (हिन्दी)**, **English**, **Odia (ଓଡ଼ିଆ)**, **Bengali (বাংলা)**, **Tamil (தமிழ்)**, and **Marathi (मराठी)**.
   - Language persistence with `localStorage` key `karigaar_lang`.

3. **4-Step Catalog Wizard (`/catalog`)**:
   - **Step 1 (Photo Upload)**: Drag & drop zone, camera capture input, and local image preview.
   - **Step 2 (Voice Description)**: Live audio recorder with animated pulsing saffron mic, real-time timer, and instant transcript bubble.
   - **Step 3 (AI Processing)**: Animated 5-stage progress pipeline (`LoadingPipeline`):
     1. 🖼️ *फोटो बेहतर हो रही है...* (REMBG + OpenCV CLAHE & White Balance)
     2. 🎙️ *आवाज़ समझी जा रही है...* (Faster-Whisper int8 STT)
     3. 🎨 *शिल्प पहचाना जा रहा है...* (CLIP Craft Classification)
     4. 💰 *सही कीमत लगाई जा रही है...* (Multimodal Price Prediction)
     5. ✍️ *विवरण लिखा जा रहा है...* (Groq / Gemini Multilingual Story Generator)
   - **Step 4 (Listing Preview & Value Intelligence)**:
     - **Before / After Comparison Slider**: Interactive draggable divider comparing original photo vs AI-enhanced studio lighting.
     - **Editable Details**: Title, multilingual story (EN/HI/OR tabs), tags editor.
     - **Price Recommendation Slider**: Interactive fair price adjuster with expandable *"यह कीमत क्यों?"* reasoning.
     - **1-Click Marketplace Publish**: Direct sync to ONDC, Amazon Karigar, and WhatsApp storefronts.

4. **Festive Success Page (`/success`)**:
   - Animated SVG checkmark with saffron path drawing.
   - Saffron + Indigo confetti burst (`canvas-confetti`).
   - Native Web Share API integration.

5. **Demo Mode & Offline Resiliency**:
   - `VITE_DEMO_MODE=true` support with built-in realistic mock data.
   - Graceful fallback when the FastAPI backend is offline.

---

## 🚀 Running the Web Client

### 1. Install Dependencies
```bash
cd karigaar-web
npm install
```

### 2. Configure Environment (`.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_DEMO_MODE=false
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 📂 Project Architecture

```
karigaar-web/
├── public/
│   ├── demo/
│   │   └── enhanced_pottery.jpg
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── ClayBadge.jsx
│   │   ├── ClayButton.jsx
│   │   ├── ClayCard.jsx
│   │   ├── ClayInput.jsx
│   │   ├── LanguagePill.jsx
│   │   ├── LoadingPipeline.jsx
│   │   └── Navbar.jsx
│   ├── config/
│   │   ├── api.js
│   │   └── i18n.js
│   ├── locales/
│   │   ├── bn.json
│   │   ├── en.json
│   │   ├── hi.json
│   │   ├── or.json
│   │   └── ta.json
│   ├── pages/
│   │   ├── CatalogPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LanguageSelectPage.jsx
│   │   └── SuccessPage.jsx
│   ├── store/
│   │   ├── catalogStore.js
│   │   └── languageStore.js
│   ├── styles/
│   │   ├── clay.css
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```
