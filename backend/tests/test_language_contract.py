from app.core.language import normalize_language
from app.ai import listing_generator


def test_language_aliases_normalize_to_canonical_codes():
    assert normalize_language("en-IN") == "en"
    assert normalize_language("Hindi") == "hi"
    assert normalize_language("தமிழ்") == "ta"
    assert normalize_language("Marathi") == "mr"
    assert normalize_language("ଓଡ଼ିଆ") == "or"
    assert normalize_language("unsupported") == "en"


def test_listing_keeps_explicit_language_fields(monkeypatch):
    monkeypatch.setattr(listing_generator, "_generate_with_gemini", lambda *args, **kwargs: None)
    monkeypatch.setattr(listing_generator, "_generate_with_groq", lambda *args, **kwargs: None)
    listing = listing_generator.generate_listing("A handmade clay pot", "ta", "pottery_terracotta", 1000)

    # No regional language is ever silently populated from Hindi.
    assert listing["title_en"]
    assert listing["title_ta"] == ""
    assert listing["description_ta"] == ""
    assert listing["title_mr"] == ""
    assert listing["title_or"] == ""
