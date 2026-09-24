from typing import Dict, Any

def generate_price_reasoning(features: Dict[str, Any], predicted_price: int) -> str:
    """
    Generates a clear, human-readable explanation in Hindi / English
    for why a particular price point was recommended.
    """
    reasons = []

    if features.get("has_gi_tag"):
        reasons.append("जीआई टैग प्रमाणित पारंपरिक शिल्प (GI tagged craft)")
    
    mat_tier = features.get("material_tier", 0)
    if mat_tier == 2:
        reasons.append("उच्च गुणवत्ता वाला प्राकृतिक कच्चा माल (Premium raw material)")
    elif mat_tier == 1:
        reasons.append("प्रामाणिक हस्तकला सामग्री (Authentic craft material)")

    tech_score = features.get("technique_score", 0)
    if tech_score >= 2:
        reasons.append("जटिल हस्तनिर्मित कलाकारी (High-skill handmade technique)")

    edge_density = features.get("edge_density", 0.0)
    if edge_density > 0.15:
        reasons.append("बारीक नक्काशी और डिजाइन विवरण (Intricate visible craftsmanship)")

    category = features.get("category", "")
    if category in ["textile", "textile_handloom", "metalcraft", "jewellery"]:
        reasons.append("बाजार में मजबूत मांग (Strong marketplace demand)")

    if not reasons:
        reasons.append("GoCoop और सहयोगी हस्तशिल्प बाजारों के समान उत्पादों के विश्लेषण पर आधारित")

    selected_reasons = ", ".join(reasons[:2])
    return f"सुझाई गई कीमत ₹{predicted_price:,} — {selected_reasons}।"
