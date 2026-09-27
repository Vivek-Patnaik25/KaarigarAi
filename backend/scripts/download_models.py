import os
from pathlib import Path

REPO_ID = "Killua2047/karigaar-models"
MODEL_FILENAME = "craft_classifier_finetuned.pt"
MODEL_DEST = Path(__file__).parent.parent / "app" / "models_v2" / MODEL_FILENAME

def download_classifier():
    if os.getenv("ENVIRONMENT") != "production":
        print("Local environment — skipping HuggingFace download")
        return
    
    if MODEL_DEST.exists():
        print(f"Model already exists at {MODEL_DEST} — skipping")
        return
    
    print("Downloading craft_classifier_finetuned.pt from HuggingFace...")
    from huggingface_hub import hf_hub_download
    hf_hub_download(
        repo_id=REPO_ID,
        filename=MODEL_FILENAME,
        local_dir=str(MODEL_DEST.parent),
        token=os.getenv("HUGGINGFACE_TOKEN")
    )
    print("Download complete.")

if __name__ == "__main__":
    download_classifier()
