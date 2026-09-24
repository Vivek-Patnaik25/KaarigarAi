import asyncio
import os
import sys
import time

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.stdout.reconfigure(encoding="utf-8")

from app.db.mongodb import connect_to_mongo, close_mongo_connection, check_db_health
from app.services.product_service import product_service
from app.services.image_storage_service import image_storage_service, extract_gridfs_file_id
from app.models.schemas import ProductListingPublishRequest

async def run_tests():
    print("1. Connecting to MongoDB Atlas...")
    await connect_to_mongo()
    health = await check_db_health()
    print(f"Database health: {health}")
    assert health == "connected", "Database is not connected"

    print("2. Testing GridFS image storage...")
    dummy_img = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
    img_ref = await image_storage_service.store_image(
        dummy_img,
        filename="test_terracotta.jpg",
        content_type="image/jpeg",
        metadata={"stage": "preview", "status": "preview"}
    )
    print("Stored image reference:", img_ref)
    assert img_ref and img_ref.get("file_id"), "Image storage failed"
    file_id = img_ref["file_id"]

    retrieved_img = await image_storage_service.get_image(file_id)
    assert retrieved_img is not None, "Image retrieval failed"
    print(f"Retrieved image size: {len(retrieved_img[0])} bytes, content_type: {retrieved_img[2]}")

    print("3. Testing Product Publishing to MongoDB (and linking GridFS image)...")
    pub_req = ProductListingPublishRequest(
        artisan_id="KG-TEST-PERSISTENCE",
        title="हस्तनिर्मित राजस्थानी मिट्टी का घड़ा",
        description="पारंपरिक मिट्टी का घड़ा प्राकृतिक रूप से पानी को ठंडा रखता है।",
        category="pottery_terracotta",
        price=1939,
        tags=["terracotta", "rajasthan", "handmade"],
        image_url=img_ref["url"],
        listing={
            "title_en": "Handcrafted Rajasthani Terracotta Pot",
            "title_hi": "हस्तनिर्मित राजस्थानी मिट्टी का घड़ा",
            "description_en": "A beautiful hand-thrown terracotta pot crafted by skilled potters of Rajasthan.",
            "description_hi": "राजस्थान के कुशल कुम्हारों द्वारा हाथ से बनाया गया सुंदर मिट्टी का घड़ा।",
            "seo_tags": ["terracotta", "rajasthan", "handmade"],
            "craft_tradition": "Rajasthani Terracotta",
            "material_detected": "terracotta clay"
        },
        ai_metadata={
            "category": "pottery_terracotta",
            "category_confidence": 0.95,
            "price_suggested": 1939,
            "price_min": 1833,
            "price_max": 2290,
            "price_reasoning": "Suggested price based on terracotta wheel craft comps."
        }
    )

    res = await product_service.create_or_publish_product(pub_req)
    print("Publish result:", res)
    assert res["success"] is True, "Publish failed"
    product_id = res["product_id"]

    print(f"4. Testing Product Retrieval for product_id: {product_id}...")
    fetched_doc = await product_service.get_product_by_id(product_id)
    assert fetched_doc is not None, "Product retrieval failed"
    print(f"Fetched product: {fetched_doc['title']} | Status: {fetched_doc['status']} | Price: ₹{fetched_doc['price']}")
    assert fetched_doc["product_id"] == product_id
    assert fetched_doc["status"] == "published"
    assert "_id" not in fetched_doc

    print("5. Testing My Listings retrieval with 'active' and 'published' filters...")
    active_listings = await product_service.get_my_listings(artisan_id="KG-TEST-PERSISTENCE", status="active")
    print(f"Active listings count: {len(active_listings)}")
    assert len(active_listings) >= 1, "Status 'active' filter did not find published product"
    assert any(l["product_id"] == product_id for l in active_listings)

    pub_listings = await product_service.get_my_listings(artisan_id="KG-TEST-PERSISTENCE", status="published")
    assert len(pub_listings) >= 1, "Status 'published' filter did not find published product"

    print("6. Testing Status update to sold...")
    up_res = await product_service.update_product_status(product_id, "sold")
    assert up_res is True, "Status update failed"
    updated_doc = await product_service.get_product_by_id(product_id)
    assert updated_doc["status"] == "sold", "Status did not update"
    print("Updated status to 'sold' successfully verified.")

    print("7. Testing GridFS deletion when product is deleted...")
    # Verify image exists before deletion
    img_before = await image_storage_service.get_image(file_id)
    assert img_before is not None, "Image should exist before product deletion"

    del_res = await product_service.delete_product(product_id)
    assert del_res is True, "Product deletion failed"

    # Verify product is deleted
    deleted_doc = await product_service.get_product_by_id(product_id)
    assert deleted_doc is None, "Product document should not exist after deletion"

    # Verify GridFS image was cleaned up
    img_after = await image_storage_service.get_image(file_id)
    assert img_after is None, "GridFS image should have been deleted when product was deleted"
    print("GridFS image successfully purged on product deletion!")

    print("8. Testing abandoned preview images cleanup...")
    # Create an abandoned preview image with 0-second age threshold
    abandoned_img_ref = await image_storage_service.store_image(
        dummy_img,
        filename="abandoned_preview.jpg",
        content_type="image/jpeg",
        metadata={"stage": "preview", "status": "preview", "created_at_ts": time.time() - 100}
    )
    abandoned_id = abandoned_img_ref["file_id"]
    assert await image_storage_service.get_image(abandoned_id) is not None

    cleaned_count = await image_storage_service.cleanup_abandoned_previews(max_age_seconds=10)
    print(f"Purged {cleaned_count} abandoned preview image(s)")
    assert cleaned_count >= 1, "Cleanup should have purged the abandoned preview"
    assert await image_storage_service.get_image(abandoned_id) is None, "Abandoned preview should be deleted"

    await close_mongo_connection()
    print("\n✅ ALL BACKEND PERSISTENCE & GRIDFS CLEANUP TESTS PASSED SUCCESSFULLY!")

def test_persistence():
    asyncio.run(run_tests())

if __name__ == "__main__":
    asyncio.run(run_tests())
