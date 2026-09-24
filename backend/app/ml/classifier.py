import os
import io
import json
import logging
from typing import Dict, Any, Optional, Union
from PIL import Image

logger = logging.getLogger("CraftClassifier")

# 8 valid categories (fallback reference)
CATEGORY_LABELS = [
    "textile_handloom",
    "textile_embroidery",
    "pottery_terracotta",
    "woodcraft",
    "metalcraft",
    "jewellery",
    "basketry_bamboo",
    "painting_folk",
]

# Path resolver for models_v2 and weights directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(CURRENT_DIR)

def _resolve_weight_path(filename: str) -> str:
    v2_path = os.path.join(APP_DIR, "models_v2", filename)
    if os.path.exists(v2_path):
        return v2_path
    return os.path.join(CURRENT_DIR, "weights", filename)

CLIP_WEIGHTS_PATH = _resolve_weight_path("craft_classifier_finetuned.pt")
LABEL_ENCODER_PATH = _resolve_weight_path("clip_label_encoder.json")
NLP_CLASSIFIER_PATH = _resolve_weight_path("nlp_category_classifier.joblib")
NLP_VECTORIZER_PATH = _resolve_weight_path("nlp_category_vectorizer.joblib")

# Module-level state
_device = None
_clip_model = None
_clip_transforms = None
_idx_to_cat = None
_nlp_classifier = None
_nlp_vectorizer = None
_active_model_status = "none"  # 'clip', 'nlp_fallback', 'none'


def _init_models():
    """Initializes and loads models once at module import."""
    global _device, _clip_model, _clip_transforms, _idx_to_cat
    global _nlp_classifier, _nlp_vectorizer, _active_model_status

    # 1. Attempt to load fine-tuned CLIP model
    try:
        import torch
        import torch.nn as nn
        from torchvision import transforms
        from transformers import CLIPModel

        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Initializing CraftClassifier on device: {_device}")

        if os.path.exists(CLIP_WEIGHTS_PATH):
            ckpt = torch.load(CLIP_WEIGHTS_PATH, map_location=_device)
            num_classes = ckpt.get("num_classes", len(CATEGORY_LABELS))

            # Define architecture matching training
            class CLIPCraftClassifier(nn.Module):
                def __init__(self, clip_model, num_classes_in):
                    super().__init__()
                    self.clip_vision = clip_model.vision_model
                    self.head = nn.Sequential(
                        nn.LayerNorm(768),
                        nn.Dropout(0.3),
                        nn.Linear(768, 256),
                        nn.GELU(),
                        nn.Dropout(0.15),
                        nn.Linear(256, num_classes_in),
                    )

                def forward(self, pixel_values):
                    features = self.clip_vision(
                        pixel_values=pixel_values
                    ).pooler_output
                    return self.head(features)

            clip_base = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            model = CLIPCraftClassifier(clip_base, num_classes)
            model.load_state_dict(ckpt["model_state"])
            model.to(_device)
            model.eval()
            _clip_model = model

            # Category index map
            if "cat_to_idx" in ckpt:
                _idx_to_cat = {int(v): k for k, v in ckpt["cat_to_idx"].items()}
            elif os.path.exists(LABEL_ENCODER_PATH):
                with open(LABEL_ENCODER_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "idx_to_cat" in data:
                        _idx_to_cat = {int(k): v for k, v in data["idx_to_cat"].items()}
                    else:
                        _idx_to_cat = {int(v): k for k, v in data["cat_to_idx"].items()}
            else:
                _idx_to_cat = {i: cat for i, cat in enumerate(CATEGORY_LABELS)}

            _clip_transforms = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(
                    [0.48145466, 0.4578275, 0.40821073],
                    [0.26862954, 0.26130258, 0.27577711],
                ),
            ])

            _active_model_status = "clip"
            logger.info("Fine-tuned CLIP craft classifier loaded successfully.")
            return
        else:
            logger.warning(f"CLIP weights not found at {CLIP_WEIGHTS_PATH}.")
    except Exception as e:
        logger.warning(f"Failed to load fine-tuned CLIP craft classifier: {e}")

    # 2. Fallback to NLP joblib model if CLIP fails
    try:
        import joblib
        if os.path.exists(NLP_CLASSIFIER_PATH) and os.path.exists(NLP_VECTORIZER_PATH):
            _nlp_classifier = joblib.load(NLP_CLASSIFIER_PATH)
            _nlp_vectorizer = joblib.load(NLP_VECTORIZER_PATH)
            _active_model_status = "nlp_fallback"
            logger.info("Loaded legacy NLP category classifier as fallback.")
            return
    except Exception as e:
        logger.warning(f"Failed to load fallback NLP classifier: {e}")

    _active_model_status = "none"
    logger.error("All craft classifiers failed to load.")


# Run module initialization
_init_models()


def health_check() -> str:
    """Returns active model status: 'clip', 'nlp_fallback', or 'none'."""
    return _active_model_status


def _load_image(image_input: Union[str, Image.Image, bytes]) -> Optional[Image.Image]:
    """Helper to convert various image input formats into a PIL RGB Image."""
    try:
        if isinstance(image_input, Image.Image):
            return image_input.convert("RGB")
        elif isinstance(image_input, bytes):
            return Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, str):
            if os.path.exists(image_input):
                return Image.open(image_input).convert("RGB")
    except Exception as e:
        logger.error(f"Failed to parse image input: {e}")
    return None


def classify_craft(image_input: Union[str, Image.Image, bytes], description: Optional[str] = None) -> Dict[str, Any]:
    """
    Classifies craft product into one of the 8 craft categories.
    Accepts file path (str), PIL Image, or bytes.
    """
    import torch

    # 1. Try Primary: Fine-tuned CLIP Classifier
    if _active_model_status == "clip" and _clip_model is not None and _clip_transforms is not None:
        try:
            pil_img = _load_image(image_input)
            if pil_img is not None:
                tensor = _clip_transforms(pil_img).unsqueeze(0).to(_device)
                with torch.no_grad():
                    logits = _clip_model(tensor)
                    probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

                all_scores = {}
                for idx, prob in enumerate(probs):
                    cat_name = _idx_to_cat.get(idx, f"unknown_{idx}")
                    all_scores[cat_name] = round(float(prob), 4)

                top_idx = int(probs.argmax())
                top_cat = _idx_to_cat.get(top_idx, CATEGORY_LABELS[0])
                top_confidence = round(float(probs[top_idx]), 4)

                return {
                    "category": top_cat,
                    "confidence": top_confidence,
                    "all_scores": all_scores,
                }
        except Exception as e:
            logger.error(f"Error during CLIP inference: {e}")

    # 2. Fallback: NLP text classifier if description is available
    if _nlp_classifier is not None and _nlp_vectorizer is not None and description:
        try:
            vec = _nlp_vectorizer.transform([description])
            probs = _nlp_classifier.predict_proba(vec)[0]
            classes = _nlp_classifier.classes_

            all_scores = {str(classes[i]): round(float(probs[i]), 4) for i in range(len(classes))}
            top_idx = int(probs.argmax())
            top_cat = str(classes[top_idx])
            top_conf = round(float(probs[top_idx]), 4)

            return {
                "category": top_cat,
                "confidence": top_conf,
                "all_scores": all_scores,
            }
        except Exception as e:
            logger.error(f"Error during NLP fallback classification: {e}")

    # 3. Final Fallback
    return {
        "category": "textile_handloom",
        "confidence": 0.0,
        "all_scores": {},
        "error": "all classifiers failed",
    }


# Backwards compatibility class wrapper for existing routers
class CraftClassifier:
    def __init__(self):
        pass

    @property
    def _is_loaded(self) -> bool:
        return _active_model_status != "none"

    def load_model(self):
        if _active_model_status == "none":
            _init_models()

    def classify_from_bytes(self, image_bytes: bytes, description: Optional[str] = None) -> Dict[str, Any]:
        return classify_craft(image_bytes, description=description)

    def classify(self, image_path: str, description: Optional[str] = None) -> Dict[str, Any]:
        return classify_craft(image_path, description=description)


classifier = CraftClassifier()
