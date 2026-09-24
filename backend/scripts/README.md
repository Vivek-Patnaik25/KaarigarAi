# 🧵 KaarigarAI Data Scraper (Google Colab & Local)

This directory contains the scraping pipeline to build the dataset for training:
1. **Craft Category Classifier** (CNN / CLIP)
2. **Multimodal Price Predictor** (XGBoost)

---

## 📁 Files

- `kaarigar_scraper_colab.ipynb`: Ready-to-run Jupyter notebook tailored for **Google Colab** (includes Google Drive sync, visual plots, and image batch downloading).
- `scrape_artisan_data.py`: Standalone CLI Python script with multi-source scrapers and data cleaning logic.

---

## 🚀 How to Run in Google Colab

1. Open [Google Colab](https://colab.research.google.com/).
2. Click **Upload Notebook** and select `backend/scripts/kaarigar_scraper_colab.ipynb`.
3. (Optional) Run **Cell 2** to mount your Google Drive so all CSVs and images are directly saved to `MyDrive/KaarigarAI_Data`.
4. Run all cells sequentially.

---

## 📊 Dataset Schema (`craft_listings_cleaned.csv`)

| Column | Type | Description |
|---|---|---|
| `source` | string | Origin platform (e.g. `gocoop.com`, `itokri.com`, `gaatha.com`) |
| `source_id` | string | Product ID |
| `title` | string | Product title |
| `category` | string | Normalized category (`textile`, `pottery`, `woodcraft`, `metalcraft`, `jewellery`, `paintings`, `others`) |
| `raw_category` | string | Platform category label |
| `price` | float | Target variable in INR (₹) |
| `compare_at_price`| float | Original MRP / strike-through price |
| `description` | string | Cleaned textual description |
| `tags` | string | Raw tags and attributes |
| `image_url` | string | Primary product image URL |
| `has_gi_tag` | int (0/1) | Whether craft has a Geographical Indication (Banarasi, Madhubani, Sambalpuri, etc.) |
| `material_tier` | int (0-2) | 0 = Basic (Cotton, Clay), 1 = Mid (Wool, Copper), 2 = Premium (Pure Silk, Silver, Teak) |
| `technique_score`| int (0-3) | Complexity score based on handmade techniques |
| `description_length`| int | Character length of description |

---

## 💻 Running Locally

```bash
cd backend/scripts
pip install requests beautifulsoup4 pandas tqdm pillow matplotlib seaborn
python scrape_artisan_data.py
```
