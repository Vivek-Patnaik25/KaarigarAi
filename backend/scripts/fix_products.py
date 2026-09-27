import asyncio
from app.db.mongodb import connect_to_mongo, get_database
from app.db.collections import PRODUCTS_COLLECTION

# Products to DELETE: audit test junk + duplicate old terracotta entries
# Keep: KRG-H53KGD, KRG-SJWAWK (real recent listings), KRG-C8HXP5 (sold), KRG-ZHTJNU (sold), KRG-UCJZ9K (active)
# Delete: 4 Audit Test entries + 2 duplicate old Terracotta Pots (S4NFEE, JJSBNZ) + UITY76 (duplicate sold)
DELETE_IDS = [
    "KRG-CSIVZG",  # Audit Test
    "KRG-XQOGXZ",  # Audit Test
    "KRG-88GMN1",  # Audit Test
    "KRG-VO420Y",  # Audit Test
    "KRG-JJSBNZ",  # duplicate terracotta
    "KRG-S4NFEE",  # duplicate terracotta
    "KRG-UITY76",  # duplicate sold - keep ZHTJNU
    "KRG-UCJZ9K",  # duplicate old terracotta active - keep the two real ones
]

async def main():
    await connect_to_mongo()
    db = get_database()
    coll = db[PRODUCTS_COLLECTION]
    result = await coll.delete_many({"product_id": {"$in": DELETE_IDS}})
    print(f"Deleted: {result.deleted_count} documents")
    
    print("\nRemaining products:")
    async for doc in coll.find({}, {"product_id": 1, "status": 1, "created_at": 1}).sort("created_at", -1):
        print(doc.get("product_id"), "|", doc.get("status"), "|", str(doc.get("created_at",""))[:19])

asyncio.run(main())
