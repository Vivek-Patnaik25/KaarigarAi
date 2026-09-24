from typing import Optional, Dict, List, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

# ==============================================================================
# ML SCHEMAS
# ==============================================================================

class CategoryClassificationResult(BaseModel):
    category: str
    confidence: float
    all_scores: Dict[str, float] = Field(default_factory=dict)

class ImageFeatures(BaseModel):
    color_entropy: float
    edge_density: float
    sharpness: float
    saturation: float

class PricePredictionResult(BaseModel):
    price_min: int
    price_suggested: int
    price_max: int
    reasoning: str
    features_used: Optional[Dict[str, Any]] = None

# ==============================================================================
# CATALOG & LISTING SCHEMAS
# ==============================================================================

class EnhanceImageResponse(BaseModel):
    enhanced_image_url: str
    quality_score: float

class TranscribeResponse(BaseModel):
    transcript: str
    detected_language: str
    language_confidence: Optional[float] = 1.0
    duration_seconds: Optional[float] = 0.0

class ListingData(BaseModel):
    title_en: str = ""
    title_hi: str = ""
    description_en: str = ""
    description_hi: str = ""
    description_regional: str = ""
    seo_tags: List[str] = Field(default_factory=list)
    craft_tradition: Optional[str] = None
    material_detected: Optional[str] = None

class GenerateListingRequest(BaseModel):
    transcript: str
    language: str = "hi"
    category: Optional[str] = "textile"
    price_suggested: Optional[int] = 1500
    image_url: Optional[str] = None

class GenerateListingResponse(BaseModel):
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    description_regional: str
    seo_tags: List[str] = Field(default_factory=list)
    craft_tradition: Optional[str] = None
    material_detected: Optional[str] = None

class PredictPriceRequest(BaseModel):
    image_url: Optional[str] = None
    category: str
    description: str

class ProcessProductData(BaseModel):
    enhanced_image_url: str
    image_quality_score: float
    transcript: str
    detected_language: str
    language_confidence: float
    category: str
    category_confidence: float
    price_min: int
    price_suggested: int
    price_max: int
    price_reasoning: str
    listing: ListingData

# ==============================================================================
# MONGODB PRODUCT PERSISTENCE & PUBLISHING SCHEMAS
# ==============================================================================

class ImageReference(BaseModel):
    file_id: Optional[str] = None
    filename: Optional[str] = None
    content_type: str = "image/jpeg"
    url: str = ""
    size_bytes: Optional[int] = None

class AIMetadata(BaseModel):
    category: str = "pottery_terracotta"
    category_confidence: float = 0.0
    detected_language: str = "hi"
    language_confidence: float = 1.0
    image_quality_score: float = 0.85
    price_min: int = 0
    price_suggested: int = 0
    price_max: int = 0
    price_reasoning: str = ""

class SourceMetadata(BaseModel):
    transcript: str = ""
    original_filename: Optional[str] = None
    detected_language: str = "hi"

class ProductDocument(BaseModel):
    product_id: str
    artisan_id: str = "KG-2024-8921"
    status: str = "published"  # 'draft', 'published', 'sold', 'archived'
    title: str
    description: str
    category: str
    price: int
    tags: List[str] = Field(default_factory=list)
    image_url: str = ""
    listing: ListingData
    ai_metadata: AIMetadata
    source: SourceMetadata
    images: Dict[str, Optional[ImageReference]] = Field(default_factory=dict)
    public_url: str = ""
    created_at: str
    updated_at: str
    published_at: Optional[str] = None

class ProductListingPublishRequest(BaseModel):
    artisan_id: Optional[str] = "KG-2024-8921"
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[int] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    language: Optional[str] = "hi"
    listing: Optional[Dict[str, Any]] = None
    ai_metadata: Optional[Dict[str, Any]] = None
    source: Optional[Dict[str, Any]] = None
    status: Optional[str] = "published"

class ProductListingPublishResponse(BaseModel):
    success: bool
    product_id: str
    status: str
    public_url: str
    message: str = "Product published successfully"

class ProductStatusUpdateRequest(BaseModel):
    status: str  # 'published', 'draft', 'sold', 'archived'

class HealthResponse(BaseModel):
    status: str
    database: str
    app: str
    version: str
    models_loaded: Dict[str, bool]

# ==============================================================================
# MARKET LINKAGE SCHEMAS
# ==============================================================================

class ProductMarketProfile(BaseModel):
    product_id: str
    category: str
    craft_tradition: Optional[str] = None
    material: Optional[str] = None
    price_min: int
    price_suggested: int
    price_max: int
    quantity_min: Optional[int] = None
    quantity_max: Optional[int] = None
    title: str
    description: str
    tags: List[str] = Field(default_factory=list)
    region_hint: Optional[str] = None
    gi_signal: bool = False
    semantic_text: str

class BuyerRequirementDocument(BaseModel):
    buyer_id: str
    display_name: str
    buyer_type: str
    categories: List[str] = Field(default_factory=list)
    budget_min: int
    budget_max: int
    quantity_min: Optional[int] = None
    quantity_max: Optional[int] = None
    material_preferences: List[str] = Field(default_factory=list)
    craft_preferences: List[str] = Field(default_factory=list)
    region_preferences: List[str] = Field(default_factory=list)
    description: str = ""
    demo_data: bool = True
    status: str = "active"
    created_at: str
    updated_at: str

class MatchScoreBreakdown(BaseModel):
    category: float
    price: float
    quantity: Optional[float] = None
    material: Optional[float] = None
    region: Optional[float] = None
    tradition: Optional[float] = None

class MarketOpportunityMatch(BaseModel):
    buyer: Dict[str, Any]
    match_score: float
    match_level: str  # 'high', 'medium', 'low'
    score_breakdown: MatchScoreBreakdown
    reasons: List[str] = Field(default_factory=list)
    available_signals: List[str] = Field(default_factory=list)
    missing_signals: List[str] = Field(default_factory=list)

class MarketMatchRequest(BaseModel):
    product_id: str

class MarketMatchResponse(BaseModel):
    product_id: str
    market_profile: ProductMarketProfile
    matches: List[MarketOpportunityMatch]
    total_matches: int

class DemoInquiryRequest(BaseModel):
    product_id: str
    buyer_id: str
    message: Optional[str] = None
    contact_name: Optional[str] = "Artisan"
    contact_phone: Optional[str] = "+91 98765 43210"

class DemoInquiryResponse(BaseModel):
    success: bool
    inquiry_id: str
    product_id: str
    buyer_id: str
    status: str = "draft"
    demo_data: bool = True
    created_at: str
    message: str = "Demo Inquiry created successfully."
