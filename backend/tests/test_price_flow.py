import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.stdout.reconfigure(encoding="utf-8")

from app.db.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.models.schemas import ProductListingPublishRequest
from app.services.product_service import product_service
from app.services.market_service import market_service
from app.ml.price_predictor import price_predictor

async def run_price_flows_tests():
    print("================================================================================")
    print("TESTING END-TO-END PRICING & MARKET LINKAGE FLOWS (TEST A & TEST B)")
    print("================================================================================")

    await connect_to_mongo()
    db = get_database()
    assert db is not None, "MongoDB connection failed"

    # Step 1: Run actual ML Price Predictor for Terracotta
    print("\n--- 1. ML Ensemble Price Prediction ---")
    ai_pred = price_predictor.predict(
        category="pottery_terracotta",
        title="Handcrafted Rajasthani Terracotta Pot",
        description="Traditional handcrafted natural clay earthen pot for cool drinking water.",
    )
    assert ai_pred["price_suggested"] > 0, "Expected realistic craft price > 0"
    assert ai_pred["price_min"] <= ai_pred["price_suggested"] <= ai_pred["price_max"], "Expected price_min <= price_suggested <= price_max"

    # -------------------------------------------------------------------------
    # TEST A: ARTISAN ACCEPTS AI SUGGESTED PRICE
    # -------------------------------------------------------------------------
    print("\n--- 2. TEST A: Artisan Accepts AI Suggested Price ---")
    accepted_price = ai_pred["price_suggested"]  # e.g. 1939

    pub_req_a = ProductListingPublishRequest(
        artisan_id="KG-TEST-FLOW-A",
        title="हस्तनिर्मित मिट्टी का घड़ा (Accepted AI Price)",
        description="प्राकृतिक मिट्टी का घड़ा",
        category="pottery_terracotta",
        price=accepted_price,
        tags=["terracotta", "rajasthan"],
        listing={
            "title_en": "Handcrafted Terracotta Pot",
            "title_hi": "हस्तनिर्मित मिट्टी का घड़ा",
            "craft_tradition": "Rajasthani Terracotta Art",
            "material_detected": "terracotta clay",
        },
        ai_metadata={
            "category": "pottery_terracotta",
            "price_suggested": ai_pred["price_suggested"],
            "price_min": ai_pred["price_min"],
            "price_max": ai_pred["price_max"],
            "price_reasoning": ai_pred["reasoning"],
        },
        status="published"
    )

    pub_res_a = await product_service.create_or_publish_product(pub_req_a)
    prod_id_a = pub_res_a["product_id"]
    print(f"Published Product A: {prod_id_a} with commercial price: ₹{accepted_price}")

    # Verify persistence in MongoDB
    saved_doc_a = await product_service.get_product_by_id(prod_id_a)
    assert saved_doc_a["price"] == accepted_price, f"Expected price {accepted_price}, got {saved_doc_a['price']}"
    assert saved_doc_a["ai_metadata"]["price_suggested"] == ai_pred["price_suggested"]
    print(f"✓ Test A Passed: Database final price = ₹{saved_doc_a['price']} (Matches accepted AI price)")

    # Verify Market Linkage uses this accepted price
    match_a = await market_service.find_matches_for_product(prod_id_a)
    assert match_a is not None
    assert match_a.market_profile.price_suggested == accepted_price
    print(f"✓ Market Linkage A: Engine evaluated with price ₹{match_a.market_profile.price_suggested}")
    print(f"   Top Match: {match_a.matches[0].buyer['display_name']} (Score: {match_a.matches[0].match_score})")

    # -------------------------------------------------------------------------
    # TEST B: ARTISAN OVERRIDES AI PRICE TO ₹2,000
    # -------------------------------------------------------------------------
    print("\n--- 3. TEST B: Artisan Overrides AI Price to ₹2,000 ---")
    custom_price = 2000

    pub_req_b = ProductListingPublishRequest(
        artisan_id="KG-TEST-FLOW-B",
        title="हस्तनिर्मित मिट्टी का घड़ा (Artisan Custom Price)",
        description="प्राकृतिक मिट्टी का घड़ा",
        category="pottery_terracotta",
        price=custom_price,  # Artisan chose 2000
        tags=["terracotta", "rajasthan"],
        listing={
            "title_en": "Handcrafted Terracotta Pot",
            "title_hi": "हस्तनिर्मित मिट्टी का घड़ा",
            "craft_tradition": "Rajasthani Terracotta Art",
            "material_detected": "terracotta clay",
        },
        ai_metadata={
            "category": "pottery_terracotta",
            "price_suggested": ai_pred["price_suggested"],  # AI originally recommended e.g. 1939
            "price_min": ai_pred["price_min"],
            "price_max": ai_pred["price_max"],
            "price_reasoning": ai_pred["reasoning"],
        },
        status="published"
    )

    pub_res_b = await product_service.create_or_publish_product(pub_req_b)
    prod_id_b = pub_res_b["product_id"]
    print(f"Published Product B: {prod_id_b} with commercial price: ₹{custom_price}")

    # Verify persistence in MongoDB
    saved_doc_b = await product_service.get_product_by_id(prod_id_b)
    assert saved_doc_b["price"] == custom_price, f"Expected price {custom_price}, got {saved_doc_b['price']}"
    assert saved_doc_b["ai_metadata"]["price_suggested"] == ai_pred["price_suggested"], "AI recommendation should be preserved separately!"
    print(f"✓ Test B Passed: Database final price = ₹{saved_doc_b['price']} (Artisan override preserved)")
    print(f"✓ AI metadata retained: price_suggested = ₹{saved_doc_b['ai_metadata']['price_suggested']}")

    # Verify Market Linkage uses the overridden price ₹2,000
    match_b = await market_service.find_matches_for_product(prod_id_b)
    assert match_b is not None
    assert match_b.market_profile.price_suggested == custom_price
    print(f"✓ Market Linkage B: Engine evaluated with overridden price ₹{match_b.market_profile.price_suggested}")
    print(f"   Top Match: {match_b.matches[0].buyer['display_name']} (Score: {match_b.matches[0].match_score})")

    # Cleanup test products
    await product_service.delete_product(prod_id_a)
    await product_service.delete_product(prod_id_b)
    await close_mongo_connection()

    print("\n================================================================================")
    print("🎉 ALL TEST A & TEST B PRICING & MARKET LINKAGE FLOWS PASSED SUCCESSFULLY!")
    print("================================================================================")

def test_price_flows():
    asyncio.run(run_price_flows_tests())

if __name__ == "__main__":
    asyncio.run(run_price_flows_tests())
