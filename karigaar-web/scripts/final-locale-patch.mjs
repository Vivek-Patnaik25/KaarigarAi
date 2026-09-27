/**
 * final-locale-patch.mjs
 * 
 * Comprehensive patch to fix ALL remaining English leaks in non-English locale files.
 * Targets: hi.json, ta.json, mr.json, bn.json
 * 
 * Sections patched:
 *  - category (craft categories)
 *  - gi.learn_more
 *  - buyer (entire section)
 *  - shortlist (subtitle, desc, empty_title, empty_desc, total_saved, sample_total, added, removed)
 *  - login (hero, sub, artisan_desc, buyer_desc, title, subtitle_role, continue_artisan, continue_buyer, etc.)
 *  - proposal.title, proposal.default_artisan_notes, proposal.error, proposal.sent_success, proposal.total_val
 *  - screen.share_whatsapp
 *  - cancel, close, done, filter, reset, save, saved, ai_fair_value, ai_active_badge
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales')

// ─── Per-language translation patches ──────────────────────────────────────

const PATCHES = {
  hi: {
    // Basic UI
    cancel: 'रद्द करें',
    close: 'बंद करें',
    done: 'पूर्ण',
    filter: 'फ़िल्टर',
    reset: 'रीसेट',
    save: 'सहेजें',
    saved: 'सहेजा गया',
    ai_fair_value: 'एआई उचित मूल्य',
    ai_active_badge: 'पाँच-चरणीय AI/ML इंजन सक्रिय',

    // Craft categories
    category: {
      pottery: 'मिट्टी शिल्प और टेराकोटा',
      handloom: 'हथकरघा वस्त्र',
      embroidery: 'कढ़ाई शिल्प',
      woodcraft: 'काष्ठ कला',
      metalcraft: 'धातु शिल्प',
      painting: 'लोक चित्रकला',
      jewellery: 'आभूषण एवं गहने',
    },

    // GI
    gi: {
      banner: {
        text: 'आपका शिल्प {{giName}} जीआई टैग के लिए योग्य हो सकता है। जीआई प्रमाणित उत्पाद {{premium}} अधिक मूल्य पर बिकते हैं।',
      },
      learn_more: 'आवेदन करने का तरीका जानें',
    },

    // Buyer section (entire)
    buyer: {
      marketplace_subtitle: 'हस्तशिल्प उत्पाद कैटलॉग',
      discover_title: 'प्रामाणिक भारतीय हस्तशिल्प खोजें',
      discover_desc: 'कुशल कारीगरों से सीधे जुड़ें। खुदरा, आतिथ्य या संग्रह के लिए प्रमाणित, हस्तनिर्मित वस्तुएं खरीदें।',
      search_placeholder: 'शिल्प, सामग्री, कारीगर या शहर खोजें...',
      no_products_found: 'आपके फ़िल्टर से मेल खाने वाला कोई शिल्प उत्पाद नहीं',
      no_products_desc: 'कुछ फ़िल्टर हटाएं या किसी अन्य शिल्प श्रेणी में खोजें।',
      request_proposal_cta: 'व्यावसायिक प्रस्ताव अनुरोध करें',
      request_modal_title: 'व्यावसायिक प्रस्ताव अनुरोध',
      desired_quantity: 'आवश्यक ऑर्डर मात्रा',
      suggested_moq: 'कारीगर न्यूनतम ऑर्डर',
      target_date: 'डिलीवरी का समय',
      date_placeholder: 'जैसे: 30 दिनों में / Q3',
      custom_specs: 'विशेष आवश्यकताएं या पैकेजिंग नोट्स',
      notes_placeholder: 'कस्टम आकार, रिटेल टैग या पैकेजिंग आवश्यकताएं बताएं...',
      est_order_val: 'अनुमानित ऑर्डर मूल्य',
      send_proposal_request: 'प्रस्ताव अनुरोध करें',
      request_submitted_title: 'कारीगर को प्रस्ताव अनुरोध भेजा गया',
      request_submitted_desc: 'कारीगर कार्यशाला ने आपकी व्यावसायिक आवश्यकताएं प्राप्त की हैं। "मेरे अनुरोध" के अंतर्गत स्थिति ट्रैक करें।',
      artisan: 'कारीगर कार्यशाला',
      requested_qty: 'अनुरोधित मात्रा',
      notify_whatsapp: 'व्हाट्सएप पर भेजें',
      send_sms: 'SMS भेजें',
      call_artisan: 'कार्यशाला को कॉल करें',
      contact_phone: 'सीधा फोन',
      request_sent_success: 'प्रस्ताव अनुरोध भेजा गया!',
      request_error: 'प्रस्ताव अनुरोध भेजने में विफल।',
      requests_title: 'मेरे प्रस्ताव अनुरोध',
      requests_desc: 'भारतीय कारीगर कार्यशालाओं से व्यावसायिक अनुरोधों और कोटेशन की स्थिति ट्रैक करें।',
      post_requirement: 'कस्टम आवश्यकता पोस्ट करें',
      no_requests_title: 'अभी तक कोई प्रस्ताव अनुरोध नहीं भेजा गया',
      no_requests_desc: 'जब आप हस्तनिर्मित वस्तुओं के लिए कस्टम कोटेशन या ऑर्डर अनुरोध करेंगे, तो वे यहां दिखेंगे।',
      post_req_modal_title: 'खरीद आवश्यकता पोस्ट करें',
      post_req_modal_desc: 'बताएं कि आप थोक में किस शिल्प की तलाश कर रहे हैं।',
      craft_name_label: 'शिल्प / उत्पाद का नाम',
      budget_per_piece: 'लक्षित बजट / प्रति नग (₹)',
      profile_title: 'खरीदार प्रोफाइल और खरीद प्राथमिकताएं',
      profile_desc: 'अपने संगठन का विवरण, सोर्सिंग फोकस और सत्यापित व्यावसायिक प्रमाण-पत्र प्रबंधित करें।',
      org_name: 'संगठन का नाम',
      contact_person: 'प्राथमिक संपर्क',
      org_type: 'संगठन का प्रकार',
      sourcing_categories: 'सोर्सिंग श्रेणियां',
      billing_location: 'स्थान',
      profile_updated: 'प्रोफाइल सफलतापूर्वक अपडेट हुई',
      profile_subtitle: 'सत्यापित संस्था',
      custom_req_posted: 'कस्टम खरीद विवरण पोस्ट किया गया!',
      requests_subtitle: 'व्यावसायिक ऑर्डर',
    },

    // Shortlist section
    shortlist: {
      subtitle: 'खरीदार संग्रह',
      desc: 'शॉर्टलिस्ट किए गए कारीगर कार्यशालाओं को समीक्षा करें, तुलना करें और थोक प्रस्ताव अनुरोध भेजें।',
      empty_title: 'आपकी पसंद सूची खाली है',
      empty_desc: 'हस्तशिल्प बाज़ार में खोजें और किसी भी उत्पाद पर दिल (♡) के निशान पर टैप करके यहाँ सहेजें।',
      total_saved: 'सहेजे गए उत्पाद',
      sample_total: 'संयुक्त इकाई मूल्य',
      added: 'पसंद सूची में जोड़ा गया',
      removed: 'पसंद सूची से हटाया गया',
      title: 'सहेजे गए उत्पाद',
    },

    // Login section
    login: {
      missing_fields: 'कृपया अपना फोन नंबर और पिन डालें।',
      invalid: 'अमान्य प्रमाण-पत्र। कृपया पुनः प्रयास करें।',
      hero: 'आपका शिल्प,\nआपका कैटलॉग,\nआपका मूल्य।',
      sub: 'भारतीय कारीगरों के लिए AI-संचालित बहुभाषी कैटलॉग। चुनिंदा खुदरा और थोक खरीदारों तक सीधी पहुँच।',
      artisan_desc: 'अपनी हस्तनिर्मित रचनाओं की तस्वीर लें, बहुभाषी लिस्टिंग बनाएं, और सत्यापित खरीदार अनुरोध प्राप्त करें।',
      buyer_desc: 'भारतीय कारीगरों से सीधे प्रामाणिक शिल्प उत्पाद खोजें। तुलना करें, शॉर्टलिस्ट करें, और कस्टम प्रस्ताव अनुरोध करें।',
      demo_mode: 'डेमो वातावरण सक्रिय',
      demo_switch_note: 'किसी भी समय कारीगर और खरीदार भूमिकाओं के बीच स्विच करें।',
      title: 'कारीगर AI में साइन इन करें',
      subtitle_role: 'जारी रखने के लिए अपनी प्रोफाइल चुनें',
      continue_artisan: 'कारीगर के रूप में जारी रखें',
      continue_buyer: 'खरीदार के रूप में जारी रखें',
      or_credentials: 'या पिन से साइन इन करें',
      pin: 'पिन',
      phone: 'फोन नंबर',
      cta: 'साइन इन',
    },

    // Proposal section
    proposal: {
      title: 'व्यावसायिक प्रस्ताव भेजें',
      default_artisan_notes: 'सभी वस्तुएं हमारी जयपुर कार्यशाला में 100% हस्तनिर्मित हैं। कस्टम आकार उपलब्ध है।',
      error: 'प्रस्ताव भेजने में विफल। कृपया पुनः प्रयास करें।',
      sent_success: 'प्रस्ताव सफलतापूर्वक भेजा गया!',
      total_val: 'अनुमानित मूल्य',
    },

    // Screen fixes
    screen: {
      share_whatsapp: 'व्हाट्सएप पर शेयर करें',
    },
  },

  ta: {
    // Basic UI
    cancel: 'ரத்து செய்',
    close: 'மூடு',
    done: 'முடிந்தது',
    filter: 'வடிகட்டி',
    reset: 'மீட்டமை',
    save: 'சேமி',
    saved: 'சேமிக்கப்பட்டது',
    ai_fair_value: 'AI நியாயமான மதிப்பு',
    ai_active_badge: 'ஐந்து-நிலை AI/ML இயந்திரம் செயல்படுகிறது',

    // Craft categories
    category: {
      pottery: 'மண் பொருட்கள் மற்றும் டெராகோட்டா',
      handloom: 'கைத்தறி ஆடை',
      embroidery: 'கைவேலை நூலிழை',
      woodcraft: 'மரக்கலை',
      metalcraft: 'உலோகக்கலை',
      painting: 'நாட்டுப்புற ஓவியம்',
      jewellery: 'நகைகள் மற்றும் அலங்காரம்',
    },

    // GI
    gi: {
      banner: {
        text: 'உங்கள் கைவினை {{giName}} GI குறிக்கு தகுதி பெறலாம். GI சான்றளிக்கப்பட்ட பொருட்கள் {{premium}} அதிக விலையில் விற்கின்றன.',
      },
      learn_more: 'விண்ணப்பிக்கும் முறையை அறியுங்கள்',
    },

    // Buyer section
    buyer: {
      marketplace_subtitle: 'தேர்ந்தெடுக்கப்பட்ட கைவினை தொகுப்பு',
      discover_title: 'உண்மையான இந்திய கைவினைகளை கண்டறியுங்கள்',
      discover_desc: 'திறமையான கலைஞர்களுடன் நேரடியாக இணையுங்கள். சில்லறை, விருந்தோம்பல் அல்லது சேகரிப்புக்கு சான்றளிக்கப்பட்ட கைவினை பொருட்கள் பெறுங்கள்।',
      search_placeholder: 'கைவினை, பொருள், கலைஞர் அல்லது நகரத்தை தேடுங்கள்...',
      no_products_found: 'உங்கள் வடிகட்டிகளுக்கு பொருந்தும் கைவினை பொருட்கள் இல்லை',
      no_products_desc: 'சில வடிகட்டிகளை நீக்கி வேறு கைவினை வகையில் தேடுங்கள்.',
      request_proposal_cta: 'வணிக முன்மொழிவை கோருங்கள்',
      request_modal_title: 'வணிக முன்மொழிவு கோரிக்கை',
      desired_quantity: 'தேவையான ஆர்டர் அளவு',
      suggested_moq: 'கலைஞர் குறைந்தபட்ச ஆர்டர்',
      target_date: 'இலக்கு விநியோக சாளரம்',
      date_placeholder: 'எ.கா: 30 நாட்களில் / Q3',
      custom_specs: 'தனிப்பயன் விவரக்குறிப்புகள் அல்லது பேக்கேஜிங் குறிப்புகள்',
      notes_placeholder: 'தனிப்பயன் அளவுகள், சில்லறை தொகை தேவைகள் குறிப்பிடவும்...',
      est_order_val: 'மதிப்பிடப்பட்ட ஆர்டர் மதிப்பு',
      send_proposal_request: 'முன்மொழிவை கோருங்கள்',
      request_submitted_title: 'கலைஞரிடம் முன்மொழிவு கோரிக்கை அனுப்பப்பட்டது',
      request_submitted_desc: 'கலைஞர் பட்டறை உங்கள் வணிக தேவைகளை பெற்றுள்ளது. "என் கோரிக்கைகள்" என்பதில் நிலையை கண்காணிக்கலாம்.',
      artisan: 'கலைஞர் பட்டறை',
      requested_qty: 'கோரிய அளவு',
      notify_whatsapp: 'WhatsApp வழியாக அனுப்புங்கள்',
      send_sms: 'SMS அனுப்புங்கள்',
      call_artisan: 'பட்டறைக்கு அழைக்கவும்',
      contact_phone: 'நேரடி தொலைபேசி',
      request_sent_success: 'முன்மொழிவு கோரிக்கை அனுப்பப்பட்டது!',
      request_error: 'முன்மொழிவு கோரிக்கையை சமர்ப்பிக்க முடியவில்லை.',
      requests_title: 'என் முன்மொழிவு கோரிக்கைகள்',
      requests_desc: 'இந்திய கலைஞர் பட்டறைகளிடம் கோரப்பட்ட வணிக விசாரணைகளின் நிலையை கண்காணிக்கவும்.',
      post_requirement: 'தனிப்பயன் தேவையை இடுகையிடுங்கள்',
      no_requests_title: 'இதுவரை முன்மொழிவு கோரிக்கைகள் அனுப்பப்படவில்லை',
      no_requests_desc: 'கைவினை பொருட்களுக்கான தனிப்பயன் மேற்கோள்களை கோரும்போது அவை இங்கே தோன்றும்.',
      post_req_modal_title: 'கொள்முதல் தேவையை இடுகையிடுங்கள்',
      post_req_modal_desc: 'நீங்கள் மொத்தமாக எந்த கைவினை சேகரிக்க விரும்புகிறீர்கள் என்று விவரிக்கவும்.',
      craft_name_label: 'கைவினை / பொருள் பெயர்',
      budget_per_piece: 'இலக்கு பட்ஜெட் / ஒரு துண்டு (₹)',
      profile_title: 'வாங்குபவர் சுயவிவரம் & கொள்முதல் விருப்பங்கள்',
      profile_desc: 'உங்கள் நிறுவன விவரங்கள், சோர்சிங் கவனம் நிர்வகிக்கவும்.',
      org_name: 'நிறுவன பெயர்',
      contact_person: 'முதன்மை தொடர்பு',
      org_type: 'நிறுவன வகை',
      sourcing_categories: 'சோர்சிங் வகைகள்',
      billing_location: 'இடம்',
      profile_updated: 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
      profile_subtitle: 'சரிபார்க்கப்பட்ட நிறுவனம்',
      custom_req_posted: 'தனிப்பயன் கொள்முதல் விவரம் வெளியிடப்பட்டது!',
      requests_subtitle: 'வணிக ஆர்டர்கள்',
    },

    // Shortlist section
    shortlist: {
      subtitle: 'வாங்குபவர் சேகரிப்பு',
      desc: 'குறுகிய பட்டியலிடப்பட்ட கலைஞர் பட்டறைகளை மதிப்பாய்வு செய்து, ஒப்பிட்டு, மொத்த முன்மொழிவு விசாரணைகள் அனுப்புங்கள்.',
      empty_title: 'உங்கள் குறுகிய பட்டியல் காலியாக உள்ளது',
      empty_desc: 'கலைஞர் சந்தையை ஆராயுங்கள், எந்த கைவினை பொருளிலும் இதய சின்னத்தை தட்டி இங்கே சேமிக்கவும்.',
      total_saved: 'சேமிக்கப்பட்ட பொருட்கள்',
      sample_total: 'ஒருங்கிணைந்த அலகு மதிப்பு',
      added: 'குறுகிய பட்டியலில் சேர்க்கப்பட்டது',
      removed: 'குறுகிய பட்டியலிலிருந்து நீக்கப்பட்டது',
      title: 'சேமிக்கப்பட்ட பொருட்கள்',
    },

    // Login section
    login: {
      missing_fields: 'தயவுசெய்து உங்கள் தொலைபேசி எண் மற்றும் PIN உள்ளிடவும்.',
      invalid: 'தவறான சான்றுகள். மீண்டும் முயலவும்.',
      hero: 'உங்கள் கைவினை,\nஉங்கள் தொகுப்பு,\nஉங்கள் விலை.',
      sub: 'இந்திய கலைஞர்களுக்கான AI-இயக்கும் பன்மொழி தொகுப்பு. தேர்ந்தெடுக்கப்பட்ட சில்லறை மற்றும் மொத்த வாங்குபவர்களுக்கு நேரடி அணுகல்.',
      artisan_desc: 'உங்கள் கைவினை படங்கள் எடுத்து, பன்மொழி பட்டியல்கள் உருவாக்கி, சரிபார்க்கப்பட்ட வாங்குபவர் கோரிக்கைகள் பெறுங்கள்.',
      buyer_desc: 'இந்திய கலைஞர்களிடமிருந்து நேரடியாக உண்மையான கைவினை பொருட்களை கண்டறியுங்கள்.',
      demo_mode: 'டெமோ சூழல்கள் செயல்படுகின்றன',
      demo_switch_note: 'எந்த நேரத்திலும் கலைஞர் மற்றும் வாங்குபவர் பாத்திரங்களுக்கு இடையே மாறுங்கள்.',
      title: 'KarigaarAI இல் உள்நுழையவும்',
      subtitle_role: 'தொடர உங்கள் சுயவிவரத்தை தேர்ந்தெடுங்கள்',
      continue_artisan: 'கலைஞராக தொடரவும்',
      continue_buyer: 'வாங்குபவராக தொடரவும்',
      or_credentials: 'அல்லது PIN மூலம் உள்நுழையவும்',
      pin: 'PIN',
      phone: 'தொலைபேசி எண்',
      cta: 'உள்நுழை',
    },

    // Proposal section
    proposal: {
      title: 'வணிக முன்மொழிவை அனுப்புங்கள்',
      default_artisan_notes: 'அனைத்து பொருட்களும் எங்கள் பட்டறையில் 100% கையால் தயாரிக்கப்பட்டவை. தனிப்பயன் அளவுகள் கிடைக்கும்.',
      error: 'முன்மொழிவை அனுப்ப முடியவில்லை. மீண்டும் முயலவும்.',
      sent_success: 'முன்மொழிவு வெற்றிகரமாக அனுப்பப்பட்டது!',
      total_val: 'மதிப்பிடப்பட்ட மதிப்பு',
    },

    // Screen fixes
    screen: {
      share_whatsapp: 'WhatsApp இல் பகிருங்கள்',
    },
  },

  mr: {
    // Basic UI
    cancel: 'रद्द करा',
    close: 'बंद करा',
    done: 'पूर्ण',
    filter: 'फिल्टर',
    reset: 'रीसेट',
    save: 'जतन करा',
    saved: 'जतन केले',
    ai_fair_value: 'AI न्याय्य मूल्य',
    ai_active_badge: 'पाच-स्तरीय AI/ML इंजिन सक्रिय',

    // Craft categories
    category: {
      pottery: 'मातीकाम आणि टेराकोटा',
      handloom: 'हातमाग वस्त्र',
      embroidery: 'हस्तनिर्मित भरतकाम',
      woodcraft: 'लाकडकाम',
      metalcraft: 'धातुकाम',
      painting: 'लोककला चित्रकारी',
      jewellery: 'दागिने व अलंकार',
    },

    // GI
    gi: {
      banner: {
        text: 'तुमची कला {{giName}} GI टॅगसाठी पात्र असू शकते. GI-प्रमाणित उत्पादने {{premium}} जास्त किमतीत विकली जातात.',
      },
      learn_more: 'अर्ज कसा करावा ते जाणून घ्या',
    },

    // Buyer section
    buyer: {
      marketplace_subtitle: 'निवडक हस्तकला कॅटलॉग',
      discover_title: 'खस्सा भारतीय हस्तकला शोधा',
      discover_desc: 'तज्ज्ञ कारागिरांशी थेट जोडा. किरकोळ, आदरातिथ्य किंवा संग्रहासाठी प्रमाणित हातमाग वस्तू मिळवा।',
      search_placeholder: 'हस्तकला, साहित्य, कारागीर किंवा शहर शोधा...',
      no_products_found: 'तुमच्या फिल्टरशी जुळणारे कोणतेही हस्तकला उत्पादन नाही',
      no_products_desc: 'काही फिल्टर काढा किंवा दुसऱ्या हस्तकला श्रेणीत शोधा.',
      request_proposal_cta: 'व्यावसायिक प्रस्ताव विनंती करा',
      request_modal_title: 'व्यावसायिक प्रस्ताव विनंती',
      desired_quantity: 'आवश्यक ऑर्डर प्रमाण',
      suggested_moq: 'कारागीर किमान ऑर्डर',
      target_date: 'डिलिव्हरी वेळ',
      date_placeholder: 'उदा: 30 दिवसांत / Q3',
      custom_specs: 'विशेष तपशील किंवा पॅकेजिंग नोट्स',
      notes_placeholder: 'सानुकूल माप, किरकोळ टॅग किंवा पॅकेजिंग गरजा सांगा...',
      est_order_val: 'अंदाजे ऑर्डर मूल्य',
      send_proposal_request: 'प्रस्ताव विनंती करा',
      request_submitted_title: 'कारागिराला प्रस्ताव विनंती पाठवली',
      request_submitted_desc: 'कारागीर कार्यशाळेला तुमच्या व्यावसायिक गरजा मिळाल्या आहेत. "माझ्या विनंत्या" मध्ये स्थिती तपासा.',
      artisan: 'कारागीर कार्यशाळा',
      requested_qty: 'विनंती केलेले प्रमाण',
      notify_whatsapp: 'WhatsApp द्वारे पाठवा',
      send_sms: 'SMS पाठवा',
      call_artisan: 'कार्यशाळेला कॉल करा',
      contact_phone: 'थेट फोन',
      request_sent_success: 'प्रस्ताव विनंती पाठवली!',
      request_error: 'प्रस्ताव विनंती सादर करणे अयशस्वी.',
      requests_title: 'माझ्या प्रस्ताव विनंत्या',
      requests_desc: 'भारतीय कारागीर कार्यशाळांकडून मागवलेल्या व्यावसायिक चौकशींची स्थिती तपासा.',
      post_requirement: 'सानुकूल गरज पोस्ट करा',
      no_requests_title: 'अद्याप कोणतीही प्रस्ताव विनंती पाठवली नाही',
      no_requests_desc: 'हस्तनिर्मित वस्तूंसाठी सानुकूल कोटेशन किंवा ऑर्डर विनंती केल्यावर ते येथे दिसतील.',
      post_req_modal_title: 'खरेदी गरज पोस्ट करा',
      post_req_modal_desc: 'तुम्हाला घाऊक प्रमाणात कोणती हस्तकला हवी आहे ते सांगा.',
      craft_name_label: 'हस्तकला / उत्पादन नाव',
      budget_per_piece: 'लक्षित बजेट / प्रति नग (₹)',
      profile_title: 'खरेदीदार प्रोफाइल आणि खरेदी प्राधान्ये',
      profile_desc: 'तुमच्या संस्थेचे तपशील, सोर्सिंग फोकस व्यवस्थापित करा.',
      org_name: 'संस्थेचे नाव',
      contact_person: 'प्राथमिक संपर्क',
      org_type: 'संस्थेचा प्रकार',
      sourcing_categories: 'सोर्सिंग श्रेण्या',
      billing_location: 'स्थान',
      profile_updated: 'प्रोफाइल यशस्वीरित्या अपडेट झाली',
      profile_subtitle: 'पडताळलेली संस्था',
      custom_req_posted: 'सानुकूल खरेदी संक्षिप्त माहिती पोस्ट केली!',
      requests_subtitle: 'व्यावसायिक ऑर्डर्स',
    },

    // Shortlist section
    shortlist: {
      subtitle: 'खरेदीदार संग्रह',
      desc: 'शॉर्टलिस्ट केलेल्या कारागीर कार्यशाळांचे पुनरावलोकन करा, तुलना करा आणि घाऊक प्रस्ताव चौकशी पाठवा.',
      empty_title: 'तुमची आवडती यादी रिकामी आहे',
      empty_desc: 'हस्तकला बाजारपेठेत शोधा आणि कोणत्याही उत्पादनावरील हृदय (♡) चिन्हावर टॅप करून येथे जतन करा.',
      total_saved: 'जतन केलेल्या वस्तू',
      sample_total: 'एकत्रित एकक मूल्य',
      added: 'आवडती यादीत जोडले',
      removed: 'आवडती यादीतून काढले',
      title: 'जतन केलेल्या वस्तू',
    },

    // Login section
    login: {
      missing_fields: 'कृपया तुमचा फोन नंबर आणि पिन टाका.',
      invalid: 'अवैध प्रमाणपत्रे. पुन्हा प्रयत्न करा.',
      hero: 'तुमची कला,\nतुमचा कॅटलॉग,\nतुमची किंमत.',
      sub: 'भारतीय कारागिरांसाठी AI-चालित बहुभाषी कॅटलॉग. निवडक किरकोळ आणि घाऊक खरेदीदारांपर्यंत थेट प्रवेश.',
      artisan_desc: 'तुमच्या हस्तनिर्मित वस्तूंचे फोटो काढा, बहुभाषी लिस्टिंग तयार करा आणि प्रमाणित खरेदीदार विनंत्या मिळवा.',
      buyer_desc: 'भारतीय कारागिरांकडून थेट खस्सा हस्तकला उत्पादने शोधा.',
      demo_mode: 'डेमो वातावरणे सक्रिय',
      demo_switch_note: 'कोणत्याही वेळी कारागीर आणि खरेदीदार भूमिकांमध्ये मुक्तपणे स्विच करा.',
      title: 'KarigaarAI मध्ये साइन इन करा',
      subtitle_role: 'सुरू ठेवण्यासाठी तुमची प्रोफाइल निवडा',
      continue_artisan: 'कारागीर म्हणून सुरू ठेवा',
      continue_buyer: 'खरेदीदार म्हणून सुरू ठेवा',
      or_credentials: 'किंवा पिनसह साइन इन करा',
      pin: 'पिन',
      phone: 'फोन नंबर',
      cta: 'साइन इन',
    },

    // Proposal section
    proposal: {
      title: 'व्यावसायिक प्रस्ताव पाठवा',
      default_artisan_notes: 'सर्व वस्तू आमच्या कार्यशाळेत 100% हस्तनिर्मित आहेत. सानुकूल आकार उपलब्ध आहे.',
      error: 'प्रस्ताव पाठवणे अयशस्वी. पुन्हा प्रयत्न करा.',
      sent_success: 'प्रस्ताव यशस्वीरित्या पाठवला!',
      total_val: 'अंदाजे मूल्य',
    },

    // Screen fixes
    screen: {
      share_whatsapp: 'WhatsApp वर शेअर करा',
    },
  },

  bn: {
    // Basic UI
    cancel: 'বাতিল করুন',
    close: 'বন্ধ করুন',
    done: 'সম্পন্ন',
    filter: 'ফিল্টার',
    reset: 'রিসেট',
    save: 'সংরক্ষণ করুন',
    saved: 'সংরক্ষিত',
    ai_fair_value: 'AI ন্যায্য মূল্য',
    ai_active_badge: 'পাঁচ-স্তরের AI/ML ইঞ্জিন সক্রিয়',

    // Craft categories
    category: {
      pottery: 'মাটির পাত্র ও টেরাকোটা',
      handloom: 'তাঁত বস্ত্র',
      embroidery: 'হস্তনির্মিত সূচিকর্ম',
      woodcraft: 'কাঠের কারুকাজ',
      metalcraft: 'ধাতুশিল্প',
      painting: 'লোকচিত্র',
      jewellery: 'গহনা ও অলঙ্কার',
    },

    // GI
    gi: {
      banner: {
        text: 'আপনার কারুশিল্প {{giName}} GI ট্যাগের জন্য যোগ্য হতে পারে। GI-প্রত্যয়িত পণ্যগুলি {{premium}} বেশি দামে বিক্রি হয়।',
      },
      learn_more: 'কীভাবে আবেদন করবেন জানুন',
    },

    // Buyer section
    buyer: {
      marketplace_subtitle: 'বাছাই করা কারুশিল্প তালিকা',
      discover_title: 'খাঁটি ভারতীয় কারুশিল্প আবিষ্কার করুন',
      discover_desc: 'দক্ষ কারিগরদের সাথে সরাসরি যোগাযোগ করুন। খুচরা, আতিথেয়তা বা সংগ্রহের জন্য প্রমাণিত হস্তশিল্প পণ্য সংগ্রহ করুন।',
      search_placeholder: 'কারুশিল্প, উপকরণ, কারিগর বা শহর অনুসন্ধান করুন...',
      no_products_found: 'আপনার ফিল্টারের সাথে মেলে এমন কোনো কারুশিল্প পণ্য নেই',
      no_products_desc: 'কিছু ফিল্টার সরান বা অন্য কারুশিল্প বিভাগে অনুসন্ধান করুন।',
      request_proposal_cta: 'বাণিজ্যিক প্রস্তাব অনুরোধ করুন',
      request_modal_title: 'বাণিজ্যিক প্রস্তাব অনুরোধ',
      desired_quantity: 'প্রয়োজনীয় অর্ডার পরিমাণ',
      suggested_moq: 'কারিগর সর্বনিম্ন অর্ডার',
      target_date: 'লক্ষ্য ডেলিভারি উইন্ডো',
      date_placeholder: 'যেমন: ৩০ দিনের মধ্যে / Q3',
      custom_specs: 'কাস্টম বিবরণ বা প্যাকেজিং নোট',
      notes_placeholder: 'কাস্টম মাপ, খুচরা ট্যাগ বা প্যাকেজিং প্রয়োজনীয়তা উল্লেখ করুন...',
      est_order_val: 'আনুমানিক অর্ডার মূল্য',
      send_proposal_request: 'প্রস্তাব অনুরোধ করুন',
      request_submitted_title: 'কারিগরের কাছে প্রস্তাব অনুরোধ পাঠানো হয়েছে',
      request_submitted_desc: 'কারিগর কর্মশালা আপনার বাণিজ্যিক প্রয়োজনীয়তা পেয়েছে। "আমার অনুরোধ"-এ অবস্থা ট্র্যাক করুন।',
      artisan: 'কারিগর কর্মশালা',
      requested_qty: 'অনুরোধিত পরিমাণ',
      notify_whatsapp: 'WhatsApp-এ পাঠান',
      send_sms: 'SMS পাঠান',
      call_artisan: 'কর্মশালায় কল করুন',
      contact_phone: 'সরাসরি ফোন',
      request_sent_success: 'প্রস্তাব অনুরোধ পাঠানো হয়েছে!',
      request_error: 'প্রস্তাব অনুরোধ জমা দিতে ব্যর্থ।',
      requests_title: 'আমার প্রস্তাব অনুরোধগুলি',
      requests_desc: 'ভারতীয় কারিগর কর্মশালা থেকে অনুরোধ করা বাণিজ্যিক অনুসন্ধানগুলির অবস্থা ট্র্যাক করুন।',
      post_requirement: 'কাস্টম প্রয়োজনীয়তা পোস্ট করুন',
      no_requests_title: 'এখনো কোনো প্রস্তাব অনুরোধ পাঠানো হয়নি',
      no_requests_desc: 'হস্তশিল্প পণ্যের জন্য কাস্টম কোটেশন বা অর্ডার অনুরোধ করলে সেগুলি এখানে দেখাবে।',
      post_req_modal_title: 'ক্রয় প্রয়োজনীয়তা পোস্ট করুন',
      post_req_modal_desc: 'আপনি পাইকারিতে কোন কারুশিল্প সংগ্রহ করতে চান তা বর্ণনা করুন।',
      craft_name_label: 'কারুশিল্প / পণ্যের নাম',
      budget_per_piece: 'লক্ষ্য বাজেট / প্রতি পিস (₹)',
      profile_title: 'ক্রেতার প্রোফাইল ও ক্রয় পছন্দ',
      profile_desc: 'আপনার সংস্থার বিবরণ, সোর্সিং ফোকাস পরিচালনা করুন।',
      org_name: 'সংস্থার নাম',
      contact_person: 'প্রাথমিক যোগাযোগ',
      org_type: 'সংস্থার ধরন',
      sourcing_categories: 'সোর্সিং বিভাগ',
      billing_location: 'অবস্থান',
      profile_updated: 'প্রোফাইল সফলভাবে আপডেট হয়েছে',
      profile_subtitle: 'যাচাইকৃত সংস্থা',
      custom_req_posted: 'কাস্টম ক্রয় বিবরণী পোস্ট করা হয়েছে!',
      requests_subtitle: 'বাণিজ্যিক অর্ডার',
    },

    // Shortlist section
    shortlist: {
      subtitle: 'ক্রেতার সংগ্রহ',
      desc: 'শর্টলিস্ট করা কারিগর কর্মশালা পর্যালোচনা করুন, তুলনা করুন এবং পাইকারি প্রস্তাব অনুসন্ধান পাঠান।',
      empty_title: 'আপনার পছন্দের তালিকা খালি',
      empty_desc: 'হস্তশিল্প বাজার অন্বেষণ করুন এবং যেকোনো পণ্যে হৃদয় (♡) আইকনে ট্যাপ করে এখানে সংরক্ষণ করুন।',
      total_saved: 'সংরক্ষিত পণ্য',
      sample_total: 'সম্মিলিত একক মূল্য',
      added: 'পছন্দের তালিকায় যোগ করা হয়েছে',
      removed: 'পছন্দের তালিকা থেকে সরানো হয়েছে',
      title: 'সংরক্ষিত সামগ্রী',
    },

    // Login section
    login: {
      missing_fields: 'অনুগ্রহ করে আপনার ফোন নম্বর এবং পিন দিন।',
      invalid: 'অবৈধ প্রমাণপত্র। পুনরায় চেষ্টা করুন।',
      hero: 'আপনার কারুশিল্প,\nআপনার তালিকা,\nআপনার মূল্য।',
      sub: 'ভারতীয় কারিগরদের জন্য AI-চালিত বহুভাষিক তালিকা। বাছাই করা খুচরা ও পাইকারি ক্রেতাদের কাছে সরাসরি অ্যাক্সেস।',
      artisan_desc: 'আপনার হস্তনির্মিত সৃষ্টির ছবি তুলুন, বহুভাষিক তালিকা তৈরি করুন এবং যাচাইকৃত ক্রেতার অনুরোধ পান।',
      buyer_desc: 'ভারতীয় কারিগরদের কাছ থেকে সরাসরি খাঁটি কারুশিল্প পণ্য আবিষ্কার করুন।',
      demo_mode: 'ডেমো পরিবেশ সক্রিয়',
      demo_switch_note: 'যেকোনো সময় কারিগর ও ক্রেতার ভূমিকার মধ্যে স্বাধীনভাবে পরিবর্তন করুন।',
      title: 'KarigaarAI-তে সাইন ইন করুন',
      subtitle_role: 'চালিয়ে যেতে আপনার প্রোফাইল নির্বাচন করুন',
      continue_artisan: 'কারিগর হিসেবে চালিয়ে যান',
      continue_buyer: 'ক্রেতা হিসেবে চালিয়ে যান',
      or_credentials: 'অথবা পিন দিয়ে সাইন ইন করুন',
      pin: 'পিন',
      phone: 'ফোন নম্বর',
      cta: 'সাইন ইন',
    },

    // Proposal section
    proposal: {
      title: 'বাণিজ্যিক প্রস্তাব পাঠান',
      default_artisan_notes: 'সমস্ত পণ্য আমাদের কর্মশালায় 100% হস্তনির্মিত। কাস্টম আকার পাওয়া যায়।',
      error: 'প্রস্তাব পাঠাতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।',
      sent_success: 'প্রস্তাব সফলভাবে পাঠানো হয়েছে!',
      total_val: 'আনুমানিক মূল্য',
    },

    // Passport fixes
    passport: {
      languages: 'বোলা ভাষাসমূহ',
    },

    // Screen fixes
    screen: {
      share_whatsapp: 'WhatsApp-এ শেয়ার করুন',
    },
  },
}

// ─── Helper: deep merge objects ─────────────────────────────────────────────
function deepMerge(base, override) {
  const result = { ...base }
  for (const [key, val] of Object.entries(override)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && typeof result[key] === 'object') {
      result[key] = deepMerge(result[key] || {}, val)
    } else {
      result[key] = val
    }
  }
  return result
}

// ─── Process each locale ────────────────────────────────────────────────────
for (const [lang, patch] of Object.entries(PATCHES)) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`)
  const raw = readFileSync(filePath, 'utf8')
  const existing = JSON.parse(raw)
  const merged = deepMerge(existing, patch)
  writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8')
  console.log(`✅ Patched ${lang}.json`)
}

console.log('\n🎉 All locale files patched. English leaks fixed for hi, ta, mr, bn.')
