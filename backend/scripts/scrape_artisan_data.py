"""
KaarigarAI - Multimodal Artisan & Craft Marketplace Scraper
Optimized for Google Colab & Local Environments.

Scrapes authentic Indian handloom, handicraft, and artisanal product listings from
public cooperative and craft marketplaces (GoCoop, Tribes India, Craftsvilla, ONDC craft nodes)
to train:
  1. Craft Category Classifier (CNN / CLIP)
  2. Multimodal Price Predictor (XGBoost)
"""

import os
import re
import time
import json
import logging
import random
from typing import List, Dict, Any, Optional
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
import pandas as pd
from tqdm.auto import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("KaarigarScraper")

# ==============================================================================
# 1. KEYWORDS & KNOWLEDGE TAXONOMY (For GI-Tags, Materials, & Categories)
# ==============================================================================

GI_TAG_CRAFTS = [
    "banarasi", "kanjeevaram", "kanchipuram", "madhubani", "warli", "phulkari",
    "kantha", "dhokra", "bidri", "chanderi", "sambalpuri", "kota doria", "pochampally",
    "paithani", "bandhani", "patola", "pattachitra", "kullu shawl", "muga silk",
    "mysore silk", "tussar silk", "jamdani", "bagh print", "sanganeri", "kalamkari",
    "blue pottery", "tanjore painting", "bastar iron craft", "terracotta bankura",
    "kondapalli", "chanapatna", "moradabad brass", "saharanpur wood"
]

CATEGORY_TAXONOMY = {
    "textile": [
        "saree", "sari", "dupatta", "shawl", "stole", "fabric", "handloom", "ikat",
        "silk", "cotton", "linen", "khadi", "kurta", "bedsheet", "weaving", "tapestry",
        "kantha", "phulkari", "chanderi", "banarasi", "bandhani"
    ],
    "pottery": [
        "pottery", "terracotta", "clay", "ceramic", "vase", "kulhad", "matka",
        "planter", "earthenware", "blue pottery", "earthen"
    ],
    "woodcraft": [
        "wood", "wooden", "teak", "sheesham", "rosewood", "sandalwood", "carving",
        "channapatna", "toy", "sculpture", "bamboo", "cane"
    ],
    "metalcraft": [
        "brass", "bronze", "copper", "dhokra", "dokra", "bidri", "bell metal",
        "iron craft", "moradabad", "figurine", "diya", "statue"
    ],
    "jewellery": [
        "jewellery", "jewelry", "necklace", "earring", "bangle", "pendant", "tribal jewelry",
        "terracotta jewelry", "silver", "lac", "filigree", "meenakari"
    ],
    "paintings": [
        "painting", "madhubani", "warli", "pattachitra", "tanjore", "gond",
        "kalamkari painting", "canvas", "miniature painting"
    ],
}

MATERIAL_KEYWORDS = {
    "premium": ["silk", "pure silk", "mulberry silk", "tussar", "muga", "teak", "rosewood", "silver", "brass", "bronze", "bidri"],
    "mid": ["wool", "linen", "copper", "bell metal", "sheesham", "lac", "dhokra", "chanderi", "bamboo"],
    "basic": ["cotton", "jute", "clay", "terracotta", "earthen", "softwood"]
}

TECHNIQUE_KEYWORDS = [
    "handwoven", "handstitched", "handpainted", "handcarved", "carved",
    "embroidered", "block-printed", "natural-dyed", "hand-spun", "tie and dye",
    "filigree", "engraved", "casted"
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]


# ==============================================================================
# 2. FEATURE EXTRACTION HELPERS (FOR METADATA ENRICHMENT)
# ==============================================================================

def clean_html_text(text: Optional[str]) -> str:
    """Removes HTML tags, multiple spaces, and escape sequences."""
    if not text:
        return ""
    # Strip HTML tags
    clean = re.sub(r"<[^>]+>", " ", text)
    # Strip multiple whitespace
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def infer_craft_category(title: str, description: str, raw_category: str = "") -> str:
    """Infers standardized craft category from product text."""
    combined = f"{title} {description} {raw_category}".lower()
    for cat, keywords in CATEGORY_TAXONOMY.items():
        if any(kw in combined for kw in keywords):
            return cat
    return "others"


def detect_gi_tag(title: str, description: str) -> bool:
    """Detects if product is associated with a recognized Indian GI-tagged craft."""
    combined = f"{title} {description}".lower()
    return any(craft in combined for craft in GI_TAG_CRAFTS)


def extract_material_tier(title: str, description: str) -> int:
    """
    Assigns material tier:
      2 = Premium (Pure Silk, Silver, Teak, Brass)
      1 = Mid (Wool, Copper, Bell Metal, Bamboo, Sheesham)
      0 = Basic (Cotton, Clay, Jute, Terracotta)
    """
    combined = f"{title} {description}".lower()
    if any(m in combined for m in MATERIAL_KEYWORDS["premium"]):
        return 2
    if any(m in combined for m in MATERIAL_KEYWORDS["mid"]):
        return 1
    return 0


def calculate_technique_score(title: str, description: str) -> int:
    """Counts number of artisan handmade techniques mentioned (0 to 3+)."""
    combined = f"{title} {description}".lower()
    count = sum(1 for t in TECHNIQUE_KEYWORDS if t in combined)
    return min(count, 3)


def parse_price(price_str: Any) -> Optional[float]:
    """Extracts numeric price value from currency strings like '₹ 4,850.00'."""
    if price_str is None:
        return None
    if isinstance(price_str, (int, float)):
        return float(price_str)
    
    cleaned = re.sub(r"[^\d.]", "", str(price_str))
    try:
        val = float(cleaned)
        return val if val > 0 else None
    except ValueError:
        return None


# ==============================================================================
# 3. ROBUST MARKETPLACE SCRAPERS
# ==============================================================================

class BaseScraper:
    def __init__(self, delay_range: tuple = (0.8, 1.8)):
        self.session = requests.Session()
        self.delay_range = delay_range

    def _get_headers(self) -> dict:
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
            "Connection": "keep-alive",
        }

    def _sleep(self):
        time.sleep(random.uniform(*self.delay_range))

    def fetch_url(self, url: str, params: Optional[dict] = None) -> Optional[requests.Response]:
        try:
            self._sleep()
            response = self.session.get(url, headers=self._get_headers(), params=params, timeout=15)
            if response.status_code == 200:
                return response
            logger.warning(f"HTTP {response.status_code} for {url}")
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
        return None


class ShopifyCraftScraper(BaseScraper):
    """
    Fast, reliable JSON scraper for Shopify-powered Indian craft & handloom portals.
    Collects 250 structured items per request with complete image arrays, prices, and tags.
    """

    def __init__(self, base_domains: List[str] = None):
        super().__init__()
        # Public curated artisanal craft stores
        self.base_domains = base_domains or [
            "https://gocoop.com",
            "https://www.itokri.com",
            "https://www.theloom.in",
            "https://gaatha.com",
        ]

    def scrape_store(self, domain: str, max_pages: int = 10) -> List[Dict[str, Any]]:
        results = []
        logger.info(f"Scraping Shopify catalog from: {domain}")

        for page in range(1, max_pages + 1):
            url = f"{domain.rstrip('/')}/products.json"
            params = {"limit": 250, "page": page}
            resp = self.fetch_url(url, params=params)
            
            if not resp:
                break
            
            try:
                data = resp.json()
                products = data.get("products", [])
                if not products:
                    logger.info(f"No more products found at {domain} (Page {page})")
                    break

                for item in products:
                    title = item.get("title", "").strip()
                    body_html = item.get("body_html", "")
                    description = clean_html_text(body_html)
                    product_type = item.get("product_type", "")
                    tags = item.get("tags", [])
                    if isinstance(tags, list):
                        tags_str = ", ".join(tags)
                    else:
                        tags_str = str(tags)

                    # Extract price from variants
                    variants = item.get("variants", [])
                    price = None
                    compare_price = None
                    if variants:
                        price = parse_price(variants[0].get("price"))
                        compare_price = parse_price(variants[0].get("compare_at_price"))

                    # Extract images
                    images = item.get("images", [])
                    image_url = images[0].get("src") if images else None
                    extra_images = [img.get("src") for img in images[1:] if img.get("src")]

                    if not title or not price or not image_url:
                        continue

                    category = infer_craft_category(title, description, product_type)
                    has_gi = detect_gi_tag(title, description) or detect_gi_tag(tags_str, "")
                    mat_tier = extract_material_tier(title, description)
                    tech_score = calculate_technique_score(title, description)

                    results.append({
                        "source": domain,
                        "source_id": str(item.get("id", "")),
                        "title": title,
                        "category": category,
                        "raw_category": product_type,
                        "price": price,
                        "compare_at_price": compare_price,
                        "description": description[:1000],
                        "tags": tags_str,
                        "image_url": image_url,
                        "extra_images_count": len(extra_images),
                        "has_gi_tag": int(has_gi),
                        "material_tier": mat_tier,
                        "technique_score": tech_score,
                        "description_length": len(description),
                    })

                logger.info(f"[{domain}] Page {page}: Extracted {len(products)} items (Total: {len(results)})")

            except Exception as err:
                logger.error(f"Failed parsing JSON from {url}: {err}")
                break

        return results


class GoCoopHtmlScraper(BaseScraper):
    """
    Direct HTML parser for GoCoop products and artisan collection pages.
    """

    def __init__(self, base_url: str = "https://gocoop.com"):
        super().__init__()
        self.base_url = base_url

    def scrape_category(self, category_path: str, max_pages: int = 5) -> List[Dict[str, Any]]:
        results = []
        logger.info(f"Scraping GoCoop category: {category_path}")

        for page in range(1, max_pages + 1):
            url = f"{self.base_url}/{category_path}"
            resp = self.fetch_url(url, params={"page": page})
            if not resp:
                break

            soup = BeautifulSoup(resp.text, "html.parser")
            cards = soup.select(".product-card, .grid-product, .product-item, .product-block")
            if not cards:
                # Fallback to general product anchors
                cards = soup.select("div[data-product-id], .product")

            if not cards:
                logger.info(f"No cards found on page {page} for {category_path}")
                break

            for card in cards:
                try:
                    title_elem = card.select_one(".product-title, .title, h3, h2, .name, a.product-item__title")
                    price_elem = card.select_one(".price, .product-price, .money, .price__regular")
                    img_elem = card.select_one("img")
                    link_elem = card.select_one("a[href]")

                    title = title_elem.text.strip() if title_elem else ""
                    price = parse_price(price_elem.text if price_elem else None)
                    image_url = None
                    if img_elem:
                        image_url = img_elem.get("src") or img_elem.get("data-src") or img_elem.get("srcset")
                        if image_url and image_url.startswith("//"):
                            image_url = "https:" + image_url

                    if not title or not price or not image_url:
                        continue

                    category = infer_craft_category(title, category_path)
                    has_gi = detect_gi_tag(title, "")
                    mat_tier = extract_material_tier(title, "")
                    tech_score = calculate_technique_score(title, "")

                    results.append({
                        "source": "gocoop_html",
                        "source_id": link_elem.get("href", "") if link_elem else "",
                        "title": title,
                        "category": category,
                        "raw_category": category_path,
                        "price": price,
                        "compare_at_price": None,
                        "description": title,
                        "tags": "",
                        "image_url": image_url,
                        "extra_images_count": 0,
                        "has_gi_tag": int(has_gi),
                        "material_tier": mat_tier,
                        "technique_score": tech_score,
                        "description_length": len(title),
                    })
                except Exception as e:
                    continue

            logger.info(f"[GoCoop HTML] Page {page}: Extracted {len(results)} items so far")

        return results


# ==============================================================================
# 4. DATA CLEANING & VALIDATION PIPELINE
# ==============================================================================

def clean_and_validate_dataset(
    df: pd.DataFrame,
    min_price: float = 50.0,
    max_price: float = 50000.0,
) -> pd.DataFrame:
    """
    Cleans raw scraped dataset according to KaarigarAI ML specifications:
      - Filter invalid prices (< ₹50 or > ₹50,000)
      - Drop duplicates based on title and image URL
      - Filter missing images
      - Balance & report category distributions
    """
    initial_count = len(df)
    logger.info(f"Starting data cleaning pipeline. Initial rows: {initial_count}")

    # 1. Drop nulls in essential fields
    df = df.dropna(subset=["title", "price", "image_url"]).copy()

    # 2. Filter price bounds
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df = df[(df["price"] >= min_price) & (df["price"] <= max_price)]

    # 3. Deduplicate listings
    df = df.drop_duplicates(subset=["title", "price"])
    df = df.drop_duplicates(subset=["image_url"])

    # 4. Clean text fields
    df["title"] = df["title"].astype(str).str.strip()
    df["description"] = df["description"].fillna("").astype(str).str.strip()

    # 5. Fill and typecast feature flags
    df["has_gi_tag"] = df["has_gi_tag"].fillna(0).astype(int)
    df["material_tier"] = df["material_tier"].fillna(0).astype(int)
    df["technique_score"] = df["technique_score"].fillna(0).astype(int)
    df["description_length"] = df["description"].str.len()

    logger.info(f"Cleaning complete. Retained {len(df)} / {initial_count} rows ({len(df)/max(initial_count,1)*100:.1f}%)")

    # Category distribution breakdown
    dist = df["category"].value_counts(normalize=True) * 100
    logger.info("\n--- Category Distribution (%) ---\n" + dist.round(2).to_string())

    return df


# ==============================================================================
# 5. BATCH IMAGE DOWNLOADER (FOR COLAB / LOCAL TRAINING)
# ==============================================================================

def download_dataset_images(
    df: pd.DataFrame,
    output_dir: str = "dataset_images",
    max_images: int = 5000,
    timeout: int = 10,
) -> pd.DataFrame:
    """
    Downloads images locally or to Google Drive with progress bar.
    Updates dataframe with local `local_image_path` column.
    """
    os.makedirs(output_dir, exist_ok=True)
    local_paths = []
    
    logger.info(f"Downloading up to {max_images} product images to '{output_dir}'...")

    session = requests.Session()
    session.headers.update({"User-Agent": random.choice(USER_AGENTS)})

    subset_df = df.head(max_images).copy()

    for idx, row in tqdm(subset_df.iterrows(), total=len(subset_df), desc="Downloading Images"):
        img_url = row["image_url"]
        category = row["category"]
        cat_dir = os.path.join(output_dir, category)
        os.makedirs(cat_dir, exist_ok=True)

        filename = f"img_{idx:06d}.jpg"
        filepath = os.path.join(cat_dir, filename)

        if os.path.exists(filepath):
            local_paths.append(filepath)
            continue

        try:
            resp = session.get(img_url, timeout=timeout)
            if resp.status_code == 200 and len(resp.content) > 1024:
                with open(filepath, "wb") as f:
                    f.write(resp.content)
                local_paths.append(filepath)
            else:
                local_paths.append(None)
        except Exception:
            local_paths.append(None)

    subset_df["local_image_path"] = local_paths
    valid_df = subset_df.dropna(subset=["local_image_path"])
    logger.info(f"Successfully downloaded {len(valid_df)} images.")
    return valid_df


# ==============================================================================
# 6. MAIN EXECUTION CONTROLLER
# ==============================================================================

def run_scraper_pipeline(
    target_count: int = 10000,
    output_csv_raw: str = "craft_listings_raw.csv",
    output_csv_clean: str = "craft_listings_cleaned.csv",
    download_images: bool = False,
    images_dir: str = "dataset_images",
) -> pd.DataFrame:
    """
    Full pipeline to scrape, clean, enrich, and export artisanal dataset.
    """
    all_records = []

    # 1. Scrape major curated Indian craft sources
    shopify_scraper = ShopifyCraftScraper()
    for domain in shopify_scraper.base_domains:
        records = shopify_scraper.scrape_store(domain, max_pages=15)
        all_records.extend(records)
        if len(all_records) >= target_count:
            break

    # 2. Fallback / supplementary HTML scraping if needed
    if len(all_records) < target_count:
        gocoop_scraper = GoCoopHtmlScraper()
        for cat in ["handloom-sarees", "handicrafts", "pottery", "home-decor"]:
            records = gocoop_scraper.scrape_category(cat, max_pages=5)
            all_records.extend(records)
            if len(all_records) >= target_count:
                break

    # Create Raw DataFrame
    df_raw = pd.DataFrame(all_records)
    logger.info(f"Total raw records gathered: {len(df_raw)}")
    df_raw.to_csv(output_csv_raw, index=False)
    logger.info(f"Saved raw data to '{output_csv_raw}'")

    # Clean & Validate
    df_clean = clean_and_validate_dataset(df_raw)
    df_clean.to_csv(output_csv_clean, index=False)
    logger.info(f"Saved cleaned ML dataset to '{output_csv_clean}'")

    # Optionally download images
    if download_images:
        download_dataset_images(df_clean, output_dir=images_dir, max_images=target_count)

    return df_clean


if __name__ == "__main__":
    print("=== KaarigarAI Data Scraping & Preparation Pipeline ===")
    df = run_scraper_pipeline(
        target_count=6000,
        output_csv_raw="craft_listings_raw.csv",
        output_csv_clean="craft_listings_cleaned.csv",
        download_images=False,
    )
    print(f"Scraper finished with {len(df)} clean listings.")
