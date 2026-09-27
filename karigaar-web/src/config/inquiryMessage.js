// Multilingual B2B Inquiry message builder for WhatsApp, SMS, and direct communication

export const INQUIRY_TEMPLATES = {
  en: {
    greeting: (name) => `Hello ${name || 'Master Artisan'},`,
    body: (title, qty) => `I’m interested in sourcing your ${title} and would like to request a quotation for ${qty} units.`,
    ask: 'Please share the unit price, total quotation, availability, and estimated delivery timeline.',
    closing: 'Thank you. I look forward to hearing from you.',
    signoff: '— Interested buyer via KarigaarAI',
  },
  hi: {
    greeting: (name) => `नमस्ते ${name || 'कारीगर'} जी,`,
    body: (title, qty) => `मैं आपकी कृति "${title}" प्राप्त करने में रुचि रखता/रखती हूँ और ${qty} इकाइयों (units) के लिए कोटेशन का अनुरोध करना चाहता/चाहती हूँ।`,
    ask: 'कृपया प्रति इकाई मूल्य, कुल कोटेशन, उपलब्धता और अनुमानित डिलीवरी समय साझा करें।',
    closing: 'धन्यवाद। आपके उत्तर की प्रतीक्षा रहेगी।',
    signoff: '— KarigaarAI के माध्यम से इच्छुक खरीदार',
  },
  ta: {
    greeting: (name) => `வணக்கம் ${name || 'கைவினைஞர்'},`,
    body: (title, qty) => `நான் உங்கள் "${title}" கைவினைப் பொருளைப் பெற ஆர்வமாக உள்ளேன். ${qty} அலகுகளுக்கான (units) விலை மேற்கோளைக் கோர விரும்புகிறேன்.`,
    ask: 'தயவுசெய்து ஒரு யூনিட் விலை, மொத்த மேற்கோள், இருப்பு மற்றும் உத்தேச விநியோக காலவரிசையை பகிரவும்.',
    closing: 'நன்றி. உங்கள் பதிலை எதிர்பார்க்கிறேன்.',
    signoff: '— KarigaarAI வழியாக ஆர்வமுள்ள வாங்குபவர்',
  },
  mr: {
    greeting: (name) => `नमस्कार ${name || 'कारागीर'} जी,`,
    body: (title, qty) => `मी तुमची कलाकृती "${title}" खरेदी करण्यास उत्सुक असून ${qty} नगांसाठी (units) कोटेशनची विनंती करू इच्छितो/इच्छिते.`,
    ask: 'कृपया प्रति नग किंमत, एकूण कोटेशन, उपलब्धता आणि अंदाजे डिलिव्हरी कालावधी सांगा.',
    closing: 'धन्यवाद। आपल्या प्रतिसादाची वाट पाहत आहे.',
    signoff: '— KarigaarAI मार्फत इच्छुक खरेदीदार',
  },
  or: {
    greeting: (name) => `ନମସ୍କାର ${name || 'କାରିଗର'} ଜୀ,`,
    body: (title, qty) => `ମୁଁ ଆପଣଙ୍କର "${title}" କ୍ରୟ କରିବାକୁ ଆଗ୍ରହୀ ଏବଂ ${qty} ଟି (units) ପାଇଁ କୋଟେସନ୍ ଅନୁରୋଧ କରିବାକୁ ଚାହୁଁଛି।`,
    ask: 'ଦୟାକରି ପ୍ରତି ୟୁନିଟ୍ ମୂଲ୍ୟ, ମୋଟ କୋଟେସନ୍, ଉପଲବ୍ଧତା ଏବଂ ଆନୁମାନିକ ବିତରଣ ସମୟସୀମା ଜଣାନ୍ତୁ।',
    closing: 'ଧନ୍ୟବାଦ। ଆପଣଙ୍କ ଉତ୍ତରକୁ ଅପେକ୍ଷା କରିଛି।',
    signoff: '— KarigaarAI ମାଧ୍ୟମରେ ଆଗ୍ରହୀ କ୍ରେତା',
  },
  bn: {
    greeting: (name) => `নমস্কার ${name || 'কারিগর'} মশাই/দিদি,`,
    body: (title, qty) => `আমি আপনার তৈরি "${title}" সংগ্রহ করতে আগ্রহী এবং ${qty} টি (units) পণ্যের জন্য একটি উদ্ধৃতি (quotation) অনুরোধ করতে চাই।`,
    ask: 'অনুগ্রহ করে প্রতি ইউনিট মূল্য, মোট উদ্ধৃতি, প্রাপ্যতা এবং আনুমানিক ডেলিভারির সময়সীমা জানান।',
    closing: 'ধন্যবাদ। আপনার উত্তরের অপেক্ষায় রইলাম।',
    signoff: '— KarigaarAI-এর মাধ্যমে আগ্রহী ক্রেতা',
  },
}

export function formatInquiryMessage({
  artisanName = 'Master Artisan',
  productTitle = 'Handcrafted Item',
  quantity = 20,
  productUrl = '',
  language = 'en',
  plainText = true,
}) {
  const langKey = INQUIRY_TEMPLATES[language] ? language : 'en'
  const t = INQUIRY_TEMPLATES[langKey]

  let title = productTitle

  const lines = [
    t.greeting(artisanName),
    '',
    t.body(title, quantity).replace(/\*\*/g, '').replace(/\*/g, ''),
    '',
    t.ask.replace(/\*\*/g, '').replace(/\*/g, ''),
    '',
    t.closing,
    '',
    t.signoff,
  ]

  if (productUrl) {
    lines.push('', productUrl)
  }

  return lines.join('\n')
}

export function cleanPhoneNumber(phone = '') {
  if (!phone) return ''
  const digits = String(phone).replace(/[^0-9]/g, '')
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`
  return digits
}

export function isValidPhoneNumber(phone = '') {
  if (!phone) return false
  const digits = cleanPhoneNumber(phone)
  return Boolean(digits && digits.length >= 10 && digits.length <= 15)
}

export function getWhatsAppInquiryUrl({
  artisanPhone = '',
  artisanName,
  productTitle,
  quantity = 20,
  productUrl = '',
  language = 'en',
}) {
  const cleanPhone = cleanPhoneNumber(artisanPhone)
  if (!cleanPhone || cleanPhone.length < 10) {
    return null
  }
  const message = formatInquiryMessage({
    artisanName,
    productTitle,
    quantity,
    productUrl,
    language,
    plainText: true,
  })
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

export function getSmsInquiryUrl({
  artisanPhone = '',
  artisanName,
  productTitle,
  quantity = 20,
  productUrl = '',
  language = 'en',
}) {
  const cleanPhone = cleanPhoneNumber(artisanPhone)
  if (!cleanPhone || cleanPhone.length < 10) {
    return null
  }
  const message = formatInquiryMessage({
    artisanName,
    productTitle,
    quantity,
    productUrl,
    language,
    plainText: true,
  })
  return `sms:+${cleanPhone}?body=${encodeURIComponent(message)}`
}

export function getTelUrl(artisanPhone = '') {
  const cleanPhone = cleanPhoneNumber(artisanPhone)
  if (!cleanPhone || cleanPhone.length < 10) {
    return null
  }
  return `tel:+${cleanPhone}`
}

