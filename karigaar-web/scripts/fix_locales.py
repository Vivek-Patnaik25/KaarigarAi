import json, os, sys

LOCALES_DIR = r"s:\SEM_7\SIUUHH\KarigaarAI\karigaar-web\src\locales"

DASHBOARD_BLOCKS = {
    "ta": {
        "dashboard": {
            "title": "முகப்பு பலகை",
            "business_glance": "வணிக ஒரு பார்வை",
            "inventory_title": "கைவினைஞர் கடை மற்றும் பட்டியல்",
            "active_listings": "செயலில் உள்ள பட்டியல்கள்",
            "monthly_earnings": "இந்த மாத வருமானம்",
            "total_products": "மொத்த பொருட்கள்",
            "empty_title": "நீங்கள் இன்னும் எதுவும் பட்டியலிடவில்லை",
            "empty_sub": "உங்கள் முதல் கைவினைப் பொருளை AI மூலம் பதிவேற்ற + அழுத்துங்கள்.",
            "marked_sold": "பட்டியல் விற்பனையாக குறிக்கப்பட்டது! 🎉",
            "marked_active": "பட்டியல் மீண்டும் செயல்படுத்தப்பட்டது!"
        },
        "status_active": "செயலில்",
        "status_sold": "விற்கப்பட்டது",
        "status_draft": "வரைவு",
        "mark_active": "செயலில் குறி",
        "mark_sold": "விற்பனையாக குறி",
        "share_listing": "கடை இணைப்பை பகிர்",
        "delete_listing": "பட்டியலை நீக்கு",
        "dismiss": "நிராகரி"
    },
    "or": {
        "dashboard": {
            "title": "ଡ୍ୟାସବୋର୍ଡ",
            "business_glance": "ବ୍ୟବସାୟ ଏକ ନଜରରେ",
            "inventory_title": "କାରିଗର ଦୋକାନ ଓ ଭଣ୍ଡାର",
            "active_listings": "ସକ୍ରିୟ ତାଲିକା",
            "monthly_earnings": "ଏହି ମାସର ରୋଜଗାର",
            "total_products": "ମୋଟ ସାମଗ୍ରୀ",
            "empty_title": "ଆପଣ ଏ ପର୍ଯ୍ୟନ୍ତ କୌଣସି ସାମଗ୍ରୀ ଯୋଡ଼ି ନ ଥିଲେ",
            "empty_sub": "AI ସହ ଆପଣଙ୍କ ପ୍ରଥମ ହସ୍ତଶିଳ୍ପ ସାମଗ୍ରୀ ତାଲିକାଭୁକ୍ତ କରିବାକୁ + ଦବାନ୍ତୁ।",
            "marked_sold": "ସାମଗ୍ରୀ 'ବିକ୍ରି ହୋଇଗଲା' ମାର୍କ ହୋଇଗଲା! 🎉",
            "marked_active": "ସାମଗ୍ରୀ ପୁଣି ସକ୍ରିୟ ହୋଇଗଲା!"
        },
        "status_active": "ସକ୍ରିୟ",
        "status_sold": "ବିକ୍ରି ହୋଇଗଲା",
        "status_draft": "ଡ୍ରାଫ୍ଟ",
        "mark_active": "ସକ୍ରିୟ କରନ୍ତୁ",
        "mark_sold": "ବିକ୍ରି ହୋଇଗଲା ମାର୍କ କରନ୍ତୁ",
        "share_listing": "ଦୋକାନ ଲିଙ୍କ ସେୟାର କରନ୍ତୁ",
        "delete_listing": "ସାମଗ୍ରୀ ହଟାନ୍ତୁ",
        "dismiss": "ବନ୍ଦ କରନ୍ତୁ"
    },
    "bn": {
        "dashboard": {
            "title": "ড্যাশবোর্ড",
            "business_glance": "ব্যবসার এক ঝলক",
            "inventory_title": "কারিগর দোকান ও ইনভেন্টরি",
            "active_listings": "সক্রিয় পণ্য তালিকা",
            "monthly_earnings": "এই মাসের আয়",
            "total_products": "মোট পণ্য",
            "empty_title": "আপনি এখনো কোনো পণ্য যোগ করেননি",
            "empty_sub": "AI দিয়ে আপনার প্রথম হস্তশিল্প পণ্য তালিকাভুক্ত করতে + চাপুন।",
            "marked_sold": "পণ্য 'বিক্রি' হিসেবে চিহ্নিত হয়েছে! 🎉",
            "marked_active": "পণ্য পুনরায় সক্রিয় হয়েছে!"
        },
        "status_active": "সক্রিয়",
        "status_sold": "বিক্রি হয়েছে",
        "status_draft": "খসড়া",
        "mark_active": "সক্রিয় করুন",
        "mark_sold": "বিক্রি হিসেবে চিহ্নিত করুন",
        "share_listing": "দোকানের লিঙ্ক শেয়ার করুন",
        "delete_listing": "পণ্য মুছুন",
        "dismiss": "বাতিল করুন"
    },
    "mr": {
        "dashboard": {
            "title": "डॅशबोर्ड",
            "business_glance": "व्यवसाय एक नजरेत",
            "inventory_title": "कारागीर दुकान आणि माल",
            "active_listings": "सक्रिय उत्पादने",
            "monthly_earnings": "या महिन्याची कमाई",
            "total_products": "एकूण उत्पादने",
            "empty_title": "तुम्ही अद्याप कोणतेही उत्पादन जोडलेले नाही",
            "empty_sub": "AI सह तुमचे पहिले हस्तनिर्मित उत्पादन तयार करण्यासाठी + दाबा.",
            "marked_sold": "उत्पादन विकले म्हणून चिन्हांकित! 🎉",
            "marked_active": "उत्पादन पुन्हा सक्रिय केले!"
        },
        "status_active": "सक्रिय",
        "status_sold": "विकले",
        "status_draft": "मसुदा",
        "mark_active": "सक्रिय करा",
        "mark_sold": "विकले म्हणून चिन्हांकित करा",
        "share_listing": "दुकानाची लिंक शेअर करा",
        "delete_listing": "उत्पादन हटवा",
        "dismiss": "बंद करा"
    }
}

for lang, extra_keys in DASHBOARD_BLOCKS.items():
    fpath = os.path.join(LOCALES_DIR, f"{lang}.json")
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Strip → from next and continue
    for key in ("next", "continue"):
        if key in data and isinstance(data[key], str):
            data[key] = data[key].replace(" →", "").replace("→", "").strip()

    # Merge extra keys (dashboard block, status_*, mark_*)
    for k, v in extra_keys.items():
        if k not in data:
            data[k] = v
        elif isinstance(v, dict) and isinstance(data.get(k), dict):
            data[k].update({ek: ev for ek, ev in v.items() if ek not in data[k]})

    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Fixed: {lang}.json")

# Also fix en.json just for the arrow
for lang in ("en", "hi"):
    fpath = os.path.join(LOCALES_DIR, f"{lang}.json")
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    for key in ("next", "continue"):
        if key in data and isinstance(data[key], str):
            data[key] = data[key].replace(" →", "").replace("→", "").strip()
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Arrow-fixed: {lang}.json")

print("All done.")
