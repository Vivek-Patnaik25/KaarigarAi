import os
import json
from typing import List, Union
from pathlib import Path
from dotenv import load_dotenv

from pydantic import BaseModel as BaseSettings, ConfigDict, field_validator

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "KaarigarAI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/v1"
    
    # Base Directories
    BASE_DIR: Path = BASE_DIR
    WEIGHTS_DIR: Path = BASE_DIR / "app" / "ml" / "weights"
    DATA_DIR: Path = BASE_DIR / "data"
    TEMP_DIR: Path = BASE_DIR / "temp"

    # Model Artifact Paths
    PRICE_MODEL_PATH: Path = WEIGHTS_DIR / "price_model.joblib"
    CATEGORY_ENCODER_PATH: Path = WEIGHTS_DIR / "category_encoder.joblib"
    TFIDF_VECTORIZER_PATH: Path = WEIGHTS_DIR / "tfidf_vectorizer.joblib"

    # CLIP Model Configuration
    CLIP_MODEL_NAME: str = "openai/clip-vit-base-patch32"

    # Speech-to-Text & LLM
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "small")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    GROQ_TIMEOUT_SECONDS: float = float(os.getenv("GROQ_TIMEOUT_SECONDS", "5"))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
    GEMINI_TIMEOUT_SECONDS: float = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "10"))
    MISTRAL_KEY: str = os.getenv("MISTRAL_KEY", os.getenv("MISTRAL_API_KEY", ""))
    MISTRAL_MODEL: str = os.getenv("MISTRAL_MODEL", "mistral-small-latest")
    MISTRAL_TIMEOUT_SECONDS: float = float(os.getenv("MISTRAL_TIMEOUT_SECONDS", "6"))

    # Database (MongoDB Atlas)
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "KaarigarAI")

    # Frontend Public URL
    FRONTEND_PUBLIC_URL: str = os.getenv("FRONTEND_PUBLIC_URL", "http://localhost:5173")

    # UltraMsg WhatsApp Configuration
    ULTRAMSG_INSTANCE_ID: str = os.getenv("ULTRAMSG_INSTANCE_ID", "")
    ULTRAMSG_TOKEN: str = os.getenv("ULTRAMSG_TOKEN", "")
    DEMO_ARTISAN_PHONE: str = os.getenv("DEMO_ARTISAN_PHONE", "")

    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                try:
                    parsed = json.loads(v_str)
                    if isinstance(parsed, list):
                        return [str(item) for item in parsed]
                except Exception:
                    pass
            return [i.strip() for i in v_str.split(",") if i.strip()]
        return v

    model_config = ConfigDict(
        extra="ignore"
    )

settings = Settings()
os.makedirs(settings.TEMP_DIR, exist_ok=True)
os.makedirs(settings.WEIGHTS_DIR, exist_ok=True)

