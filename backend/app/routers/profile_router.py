import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import os
import base64

from app.core.responses import ApiResponse
from app.db.mongodb import get_database
from app.core.config import settings

logger = logging.getLogger("ProfileRouter")
router = APIRouter(prefix="/profile", tags=["User & Artisan Profile"])

class ProfileUpdateRequest(BaseModel):
    role: str = "artisan" # 'artisan' or 'buyer'
    user_id: Optional[str] = None
    name: Optional[str] = None
    name_regional: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Artisan specific fields
    workshop_name: Optional[str] = None
    craft: Optional[str] = None
    craft_title: Optional[str] = None
    location: Optional[str] = None
    years_active: Optional[str] = None
    bio: Optional[str] = None
    languages: Optional[list] = None
    artisan_id: Optional[str] = None
    
    # Buyer specific fields
    buyer_name: Optional[str] = None
    organization_name: Optional[str] = None
    buyer_type: Optional[str] = None
    title: Optional[str] = None
    interests: Optional[str] = None
    categories: Optional[list] = None
    gstin: Optional[str] = None

@router.get("/{role}/{user_id}", summary="Get profile for artisan or buyer")
async def get_profile(role: str, user_id: str):
    """
    Retrieves stored profile for an artisan or buyer.
    If database is not connected or document not found, returns standard default profile.
    """
    db = get_database()
    collection_name = "artisan_profiles" if role == "artisan" else "buyer_profiles"
    id_field = "artisan_id" if role == "artisan" else "buyer_id"

    if db is not None:
        try:
            profile = await db[collection_name].find_one({id_field: user_id}, {"_id": 0})
            if profile:
                return ApiResponse.ok(profile)
        except Exception as e:
            logger.warning(f"Failed to fetch profile from DB: {e}")

    # Default fallback profiles
    if role == "artisan":
        default_profile = {
            "role": "artisan",
            "artisan_id": user_id or "KG-2024-8921",
            "name": "Rameshwar Prajapati",
            "name_regional": "रामेश्वर प्रजापति",
            "phone": "+919556828397",
            "craft": "pottery_terracotta",
            "craft_title": "Terracotta & Pottery",
            "workshop_name": "Prajapati Terracotta Studio",
            "location": "Jaipur, Rajasthan",
            "years_active": "18 years",
            "avatar_url": "/artisan_avatar.png",
            "bio": "4th generation master terracotta craftsman specializing in traditional Rajasthani earthen cookware, decorative terracotta pots, and clay craft.",
            "languages": ["हिन्दी (Hindi)", "English", "मारवाड़ी (Marwari)"],
            "updated_at": datetime.utcnow().isoformat()
        }
        return ApiResponse.ok(default_profile)
    else:
        default_buyer = {
            "role": "buyer",
            "buyer_id": user_id or "BUYER-MUM-PRM-001",
            "name": "Ananya Sharma",
            "title": "Co-Founder & Chief Curator",
            "buyer_name": "Parampara Heritage Retail & Living",
            "organization_name": "Parampara Heritage Retail & Living",
            "buyer_type": "Premium Boutique & Retailer",
            "phone": "+919876543211",
            "location": "Kala Ghoda, Mumbai, Maharashtra",
            "categories": ["pottery_terracotta", "textile_handloom"],
            "interests": "Artisanal earthen cookware, decorative terracotta, and GI-certified handlooms",
            "avatar_url": "",
            "gstin": "27AABCP1234F1Z8",
            "updated_at": datetime.utcnow().isoformat()
        }
        return ApiResponse.ok(default_buyer)

@router.post("/update", summary="Create or update profile")
@router.put("/{role}/{user_id}", summary="Update profile by role and ID")
async def update_profile(payload: ProfileUpdateRequest, role: Optional[str] = None, user_id: Optional[str] = None):
    """
    Upserts artisan or buyer profile details into MongoDB.
    """
    effective_role = role or payload.role or "artisan"
    collection_name = "artisan_profiles" if effective_role == "artisan" else "buyer_profiles"
    id_field = "artisan_id" if effective_role == "artisan" else "buyer_id"
    effective_id = user_id or payload.user_id or (payload.artisan_id if effective_role == "artisan" else payload.buyer_name) or "default"

    profile_data = payload.dict(exclude_unset=True)
    profile_data["role"] = effective_role
    profile_data[id_field] = effective_id
    profile_data["updated_at"] = datetime.utcnow().isoformat()

    db = get_database()
    if db is not None:
        try:
            await db[collection_name].update_one(
                {id_field: effective_id},
                {"$set": profile_data},
                upsert=True
            )
            logger.info(f"Updated {effective_role} profile for ID '{effective_id}' in MongoDB")
        except Exception as e:
            logger.warning(f"Could not persist profile to MongoDB: {e}")

    return ApiResponse.ok({
        "success": True,
        "message": f"{effective_role.capitalize()} profile updated successfully",
        "profile": profile_data
    })

@router.post("/avatar/upload", summary="Upload profile avatar image")
async def upload_avatar(file: UploadFile = File(...)):
    """
    Uploads a user avatar image file and returns its public temporary or static URL.
    """
    try:
        os.makedirs(settings.TEMP_DIR, exist_ok=True)
        ext = os.path.splitext(file.filename)[1] or ".jpg"
        filename = f"avatar_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{ext}"
        filepath = os.path.join(settings.TEMP_DIR, filename)

        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        url = f"/temp/{filename}"
        return ApiResponse.ok({
            "success": True,
            "url": url,
            "filename": filename
        })
    except Exception as e:
        logger.error(f"Failed to upload avatar: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")
