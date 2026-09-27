"""
test_listing_generator.py — Validation for all 10 cases specified in PART 13
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def _validate(result: dict, test_name: str):
    required = ["title_en", "title_hi", "description_en", "description_hi",
                "seo_tags", "craft_tradition", "material_detected"]
    missing = [k for k in required if not result.get(k)]
    if missing:
        print(f"  [FAIL] {test_name} -- missing fields: {missing}", flush=True)
        return False
    print(f"  [PASS] {test_name}", flush=True)
    print(f"         llm={result.get('_llm_used')} success={result.get('_llm_success')}", flush=True)
    print(f"         title_en: {result.get('title_en')}", flush=True)
    return True


def run_tests():
    from app.ai.listing_generator import generate_listing

    results = []

    print("\n" + "="*65)
    print("CASE 1: Normal Hindi transcript - pottery")
    r = generate_listing("यह टेराकोटा मिट्टी का घड़ा राजस्थान के कारीगर ने बनाया है", "hi", "pottery_terracotta", 1200)
    results.append(_validate(r, "CASE 1"))

    print("\nCASE 2: Gemini key missing -> should use Groq or local")
    orig = os.environ.get("GEMINI_API_KEY", "")
    os.environ["GEMINI_API_KEY"] = ""
    from importlib import reload
    import app.core.config, app.ai.listing_generator
    reload(app.core.config)
    reload(app.ai.listing_generator)
    from app.ai.listing_generator import generate_listing as gl2
    r2 = gl2("handwoven silk saree", "en", "textile_handloom", 3000)
    results.append(_validate(r2, "CASE 2"))
    os.environ["GEMINI_API_KEY"] = orig
    reload(app.core.config)
    reload(app.ai.listing_generator)

    print("\nCASE 3: Gemini timeout -> use local (simulated via 0.001s timeout)")
    os.environ["GEMINI_TIMEOUT_SECONDS"] = "0.001"
    os.environ["GROQ_TIMEOUT_SECONDS"] = "0.001"
    reload(app.core.config)
    reload(app.ai.listing_generator)
    from app.ai.listing_generator import generate_listing as gl3
    r3 = gl3("beautiful clay pot", "en", "pottery_terracotta", 800)
    print(f"  timeout-forced llm_used={r3.get('_llm_used')}")
    results.append(_validate(r3, "CASE 3 -- forced-local via 0.001s timeout"))
    os.environ["GEMINI_TIMEOUT_SECONDS"] = "8"
    os.environ["GROQ_TIMEOUT_SECONDS"] = "5"
    reload(app.core.config)
    reload(app.ai.listing_generator)
    from app.ai.listing_generator import generate_listing

    print("\nCASE 4: Malformed/rate-limit response -- local fallback covers")
    os.environ["GEMINI_API_KEY"] = "INVALID_KEY_12345"
    os.environ["GROQ_API_KEY"] = "INVALID_KEY_12345"
    reload(app.core.config)
    reload(app.ai.listing_generator)
    from app.ai.listing_generator import generate_listing as gl4
    r4 = gl4("dhokra brass figurine", "en", "metalcraft", 2500)
    results.append(_validate(r4, "CASE 4 -- invalid keys -> local fallback"))
    import dotenv, pathlib
    dotenv.load_dotenv(pathlib.Path(__file__).parent.parent / ".env", override=True)
    reload(app.core.config)
    reload(app.ai.listing_generator)
    from app.ai.listing_generator import generate_listing

    print("\nCASE 5: Very short transcript")
    r5 = generate_listing("pot", "en", "pottery_terracotta", 500)
    results.append(_validate(r5, "CASE 5"))

    print("\nCASE 6: Hindi transcript, textile category")
    r6 = generate_listing("यह बनारसी सिल्क की साड़ी है", "hi", "textile_handloom", 4500)
    results.append(_validate(r6, "CASE 6"))

    print("\nCASE 7: Bengali transcript")
    r7 = generate_listing("হাতে বোনা তাঁত শাড়ি", "bn", "textile_embroidery", 3200)
    results.append(_validate(r7, "CASE 7"))

    print("\nCASE 8: English transcript, bamboo")
    r8 = generate_listing("handwoven bamboo basket for kitchen use", "en", "basketry_bamboo", 650)
    results.append(_validate(r8, "CASE 8"))

    print("\nCASE 9: Unknown category")
    r9 = generate_listing("beautiful hand-painted wall art", "en", "painting_folk", 1800)
    results.append(_validate(r9, "CASE 9"))

    print("\nCASE 10: Incomplete information")
    r10 = generate_listing("", "hi", "woodcraft", 0)
    results.append(_validate(r10, "CASE 10 -- empty transcript & zero price"))

    passed = sum(results)
    total = len(results)
    print("\n" + "="*65)
    print(f"RESULTS: {passed}/{total} PASSED")
    if passed < total:
        print("SOME TESTS FAILED")
        sys.exit(1)
    else:
        print("ALL TESTS PASSED")


if __name__ == "__main__":
    run_tests()
