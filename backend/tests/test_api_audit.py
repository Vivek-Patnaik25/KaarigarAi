import asyncio
import os
import sys
import io
import time
from PIL import Image

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

def test_all_api_endpoints():
    print("================================================================================")
    print("STARTING FULL AUTOMATED API CONTRACT & SECURITY AUDIT")
    print("================================================================================")
    
    with TestClient(app) as client:
        # 1. Health & Root Endpoints
        print("\n[1. System & Health Endpoints]")
        r_root = client.get("/")
        assert r_root.status_code == 200, f"Root endpoint failed: {r_root.status_code}"
        root_json = r_root.json()
        assert root_json["status"] == "online" and root_json["database"] == "connected"
        print("✓ GET / returned HTTP 200 with online status and database connected")

        r_health = client.get("/health")
        assert r_health.status_code == 200
        assert r_health.json()["status"] == "ok"
        print("✓ GET /health returned HTTP 200 ok")

        # 2. ML Classifier Endpoint
        print("\n[2. ML CLIP Craft Classifier Endpoint]")
        # Create test image in memory
        img = Image.new("RGB", (200, 200), color=(180, 100, 60))
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format="JPEG")
        img_bytes = img_byte_arr.getvalue()

        r_ml_classify = client.post(
            "/v1/ml/classify",
            files={"image": ("test.jpg", img_bytes, "image/jpeg")},
            data={"hint": "earthen craft"}
        )
        assert r_ml_classify.status_code == 200
        classify_data = r_ml_classify.json()["data"]
        assert "category" in classify_data
        assert "confidence" in classify_data
        assert "all_scores" in classify_data
        print(f"✓ POST /v1/ml/classify returned category: {classify_data['category']} (conf: {classify_data['confidence']:.2f})")

        # 3. ML Price Predictor Endpoint
        print("\n[3. ML Stacking Price Predictor Endpoint]")
        r_price = client.post(
            "/v1/catalog/predict-price",
            json={
                "category": "pottery_terracotta",
                "title": "Handcrafted Clay Water Jug",
                "description": "Terracotta handcrafted pot made from natural clay",
                "dimensions": "Height 25cm"
            }
        )
        assert r_price.status_code == 200
        p_data = r_price.json()["data"]
        assert p_data["price_min"] <= p_data["price_suggested"] <= p_data["price_max"]
        assert "reasoning" in p_data
        print(f"✓ POST /v1/catalog/predict-price returned ₹{p_data['price_min']}-₹{p_data['price_max']} (suggested: ₹{p_data['price_suggested']})")

        # 4. Multilingual LLM Listing Generator Endpoint
        print("\n[4. Multilingual Listing Generator Endpoint]")
        r_gen = client.post(
            "/v1/catalog/generate-listing",
            json={
                "transcript": "यह प्राकृतिक मिट्टी का घड़ा है जो जयपुर में हाथ से बनाया गया है",
                "category": "pottery_terracotta",
                "language": "hi"
            }
        )
        assert r_gen.status_code == 200
        gen_data = r_gen.json()["data"]
        assert "title_hi" in gen_data
        assert "title_en" in gen_data
        assert "description_hi" in gen_data
        assert "seo_tags" in gen_data
        print(f"✓ POST /v1/catalog/generate-listing returned bilingual listing successfully: '{gen_data['title_hi']}' / '{gen_data['title_en']}'")

        # 5. Full End-to-End Multimodal Catalog Processing Endpoint
        print("\n[5. End-to-End Multimodal Catalog Pipeline Endpoint]")
        r_process = client.post(
            "/v1/catalog/process",
            files={"image": ("test_pot.jpg", img_bytes, "image/jpeg")},
            data={
                "text_description": "हस्तनिर्मित राजस्थानी मिट्टी का घड़ा",
                "language_hint": "hi"
            }
        )
        assert r_process.status_code == 200
        proc_data = r_process.json()["data"]
        assert "image_url" in proc_data
        assert "category" in proc_data
        assert "price_suggested" in proc_data
        assert "listing" in proc_data
        print(f"✓ POST /v1/catalog/process processed end-to-end pipeline in {proc_data.get('processing_time_ms', 0)}ms (Image URL: {proc_data['image_url']})")

        # 6. Product Publishing & CRUD Endpoints
        print("\n[6. Product Publishing & CRUD Lifecycle]")
        pub_payload = {
            "artisan_id": "KG-AUDIT-TEST",
            "title": "ऑडिट टेस्ट टेराकोटा शिल्प",
            "description": "प्रीमियम हस्तनिर्मित टेराकोटा",
            "category": "pottery_terracotta",
            "price": 1450,
            "image_url": proc_data["image_url"],
            "tags": ["audit", "terracotta", "rajasthan"],
            "listing": {
                "title_hi": "ऑडिट टेस्ट टेराकोटा शिल्प",
                "title_en": "Audit Test Terracotta Craft",
                "description_hi": "प्रीमियम हस्तनिर्मित टेराकोटा",
                "description_en": "Premium handcrafted terracotta craft",
                "craft_tradition": "Terracotta",
                "material_detected": "Natural Clay"
            },
            "ai_metadata": {
                "category": "pottery_terracotta",
                "price_suggested": proc_data["price_suggested"],
                "price_min": proc_data.get("price_min", 1100),
                "price_max": proc_data.get("price_max", 1800),
            },
            "status": "published"
        }
        r_pub = client.post("/v1/catalog/publish", json=pub_payload)
        assert r_pub.status_code == 200
        pub_res = r_pub.json()["data"]
        audit_pid = pub_res["product_id"]
        print(f"✓ POST /v1/catalog/publish created product: {audit_pid}")

        # Fetch public product
        r_get_prod = client.get(f"/v1/products/{audit_pid}")
        assert r_get_prod.status_code == 200
        prod_data = r_get_prod.json()["data"]
        assert prod_data["product_id"] == audit_pid
        assert prod_data["price"] == 1450
        print(f"✓ GET /v1/products/{audit_pid} returned published product successfully")

        # Fetch artisan listings
        r_artisan_listings = client.get("/v1/catalog/listings/KG-AUDIT-TEST")
        assert r_artisan_listings.status_code == 200
        artisan_list = r_artisan_listings.json()["data"]["listings"]
        assert any(p["product_id"] == audit_pid for p in artisan_list)
        print(f"✓ GET /v1/catalog/listings/KG-AUDIT-TEST returned {len(artisan_list)} active listing(s)")

        # Update status to 'sold'
        r_status = client.patch(f"/v1/products/{audit_pid}/status", json={"status": "sold"})
        assert r_status.status_code == 200
        assert r_status.json()["data"]["status"] == "sold"
        print(f"✓ PATCH /v1/products/{audit_pid}/status updated to 'sold'")

        # Update status back to 'active' (normalizes to 'published')
        r_status_active = client.patch(f"/v1/products/{audit_pid}/status", json={"status": "active"})
        assert r_status_active.status_code == 200
        assert r_status_active.json()["data"]["status"] == "published"
        print(f"✓ PATCH /v1/products/{audit_pid}/status normalized 'active' -> 'published'")

        # 7. Market Matching Endpoint
        print("\n[7. Market Opportunities & Buyer Matching Endpoint]")
        r_match = client.post("/v1/market/match", json={"product_id": audit_pid})
        assert r_match.status_code == 200
        match_res = r_match.json()["data"]
        assert "matches" in match_res
        assert "market_profile" in match_res
        print(f"✓ POST /v1/market/match found {len(match_res['matches'])} buyer match opportunities for {audit_pid}")

        # 8. B2B Buyer Registry & Inquiries
        print("\n[8. B2B Buyer Registry & Demo Trade Inquiries]")
        r_buyers = client.get("/v1/market/buyers")
        assert r_buyers.status_code == 200
        raw_b = r_buyers.json()["data"]
        buyers_list = raw_b if isinstance(raw_b, list) else raw_b.get("buyers", [])
        assert len(buyers_list) > 0
        sample_buyer = buyers_list[0]
        print(f"✓ GET /v1/market/buyers returned {len(buyers_list)} registered B2B buyers (Sample: {sample_buyer['display_name']})")

        # Create inquiry
        r_inq = client.post(
            "/v1/market/inquiries",
            json={
                "product_id": audit_pid,
                "buyer_id": sample_buyer["buyer_id"],
                "message": "Bulk order trial inquiry from automated audit",
                "contact_name": "Rameshwar Prajapati",
                "contact_phone": "+91 98765 43210"
            }
        )
        assert r_inq.status_code == 200
        inq_res = r_inq.json()["data"]
        inq_id = inq_res["inquiry_id"]
        print(f"✓ POST /v1/market/inquiries created inquiry {inq_id} with demo_data={inq_res.get('demo_data')}")

        # Fetch product inquiries
        r_art_inq = client.get(f"/v1/market/inquiries/{audit_pid}")
        assert r_art_inq.status_code == 200
        raw_inqs = r_art_inq.json()["data"]
        art_inqs = raw_inqs if isinstance(raw_inqs, list) else raw_inqs.get("inquiries", [])
        assert any(i["inquiry_id"] == inq_id for i in art_inqs)
        print(f"✓ GET /v1/market/inquiries/{audit_pid} returned {len(art_inqs)} inquiry record(s)")

        # 9. Media & GridFS Streaming Endpoints
        print("\n[9. GridFS Media Retrieval & Metadata]")
        gridfs_id = proc_data["image_url"].split("/")[-1]
        r_media = client.get(f"/v1/media/{gridfs_id}")
        assert r_media.status_code == 200
        assert "image" in r_media.headers.get("content-type", "")
        assert len(r_media.content) > 100
        print(f"✓ GET /v1/media/{gridfs_id} returned HTTP 200 image/jpeg ({len(r_media.content)} bytes)")

        r_media_info = client.get(f"/v1/media/{gridfs_id}/info")
        assert r_media_info.status_code == 200
        info_data = r_media_info.json()["data"]
        assert info_data["file_id"] == gridfs_id
        print(f"✓ GET /v1/media/{gridfs_id}/info returned metadata: {info_data['filename']}, {info_data['size_bytes']} bytes")

        # 10. Error Handling & Unhappy Path QA
        print("\n[10. Unhappy Path, Bad Requests & Error Contracts]")
        # 404 for non-existent product
        r_404 = client.get("/v1/products/KRG-NOT-FOUND-999")
        assert r_404.status_code == 404
        print("✓ GET /v1/products/KRG-NOT-FOUND-999 returned HTTP 404 Not Found")

        # 404 for non-existent media
        r_media_404 = client.get("/v1/media/000000000000000000000000")
        assert r_media_404.status_code == 404
        print("✓ GET /v1/media/000000000000000000000000 returned HTTP 404 Not Found")

        # 400 for invalid status update
        r_bad_status = client.patch(f"/v1/products/{audit_pid}/status", json={"status": "invalid_xyz"})
        assert r_bad_status.status_code == 400
        print("✓ PATCH /v1/products/{id}/status with invalid status returned HTTP 400 Bad Request")

        # 422 for invalid body types
        r_422 = client.post("/v1/market/inquiries", json={"product_id": audit_pid, "quantity": "invalid_string_qty"})
        assert r_422.status_code == 422
        print("✓ POST /v1/market/inquiries with malformed types returned HTTP 422 Unprocessable Entity")

        # Clean up test product
        r_del = client.delete(f"/v1/products/{audit_pid}")
        assert r_del.status_code == 200
        print(f"✓ DELETE /v1/products/{audit_pid} purged product and associated media")

        print("\n================================================================================")
        print("🎉 ALL 10 API CONTRACT & SECURITY AUDIT SECTIONS PASSED WITH ZERO ERRORS!")
        print("================================================================================")

if __name__ == "__main__":
    test_all_api_endpoints()
