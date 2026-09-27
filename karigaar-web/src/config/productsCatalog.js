// Curated authentic handcrafted craft dataset & multilingual discovery service
import { normalizeLanguage } from './language'

export const CURATED_CRAFT_PRODUCTS = [
  {
    product_id: 'KRG-2024-8921',
    title: 'Handcrafted Rajasthani Terracotta Pot',
    title_en: 'Handcrafted Rajasthani Terracotta Pot',
    title_hi: 'हस्तनिर्मित राजस्थानी मिट्टी का घड़ा',
    title_ta: 'கைவினை ராஜஸ்தானி டெரகோட்டா பானை',
    title_mr: 'हस्तनिर्मित राजस्थानी मातीची घागर',
    title_or: 'ହସ୍ତନିର୍ମିତ ରାଜସ୍ଥାନୀ ଟେରାକୋଟା ମାଟିପାତ୍ର',
    title_bn: 'হস্তনির্মিত রাজস্থানী টেরাকোটা মাটির পাত্র',

    category: 'pottery_terracotta',
    category_name: 'Pottery & Terracotta',
    price: 1939,
    moq: 10,
    lead_time_days: 15,
    has_gi_tag: true,
    gi_tag_name: 'Rajasthan Terracotta Art',
    artisan_id: 'KG-2024-8921',
    artisan_name: 'Rameshwar Prajapati',
    artisan_phone: '+919556828397',
    location: 'Jaipur, Rajasthan',
    image_url: '/images/craft_terracotta_pot.jpg',

    description: 'A traditional wheel-thrown terracotta pot crafted with natural river clay and sun-dried kiln firing. Naturally cools drinking water and adds rustic elegance.',
    description_en: 'A traditional wheel-thrown terracotta pot crafted with natural river clay and sun-dried kiln firing. Naturally cools drinking water and adds rustic elegance.',
    description_hi: 'प्राकृतिक नदी की मिट्टी से चाक पर तैयार और भट्ठी में पकाया गया पारंपरिक घड़ा। यह पीने के पानी को प्राकृतिक रूप से ठंडा रखता है।',
    description_ta: 'இயற்கை ஆற்று களிமண்ணால் சக்கரத்தில் செய்யப்பட்டு சூளையில் சுடப்பட்ட பாரம்பரிய பானை. குடிநீரை இயற்கையாக குளிர்விக்கிறது.',
    description_mr: 'नैसर्गिक नदीच्या मातीपासून चाकावर बनवलेले आणि भट्टीमध्ये भाजलेले पारंपरिक भांडे. हे पिण्याचे पाणी नैसर्गिकरित्या थंड ठेवते.',
    description_or: 'ପ୍ରାକୃତିକ ନଦୀ ମାଟିରେ ଚକ ସାହାଯ୍ୟରେ ତିଆରି ଏବଂ ପାରମ୍ପରିକ ଭାବେ ପୋଡ଼ା ଯାଇଥିବା ମାଟିପାତ୍ର। ଏହା ପିଇବା ପାଣିକୁ ପ୍ରାକୃତିକ ଭାବେ ଥଣ୍ଡା ରଖେ।',
    description_bn: 'প্রাকৃতিক নদীর মাটিতে চাকার সাহায্যে তৈরি এবং ঐতিহ্যবাহী ভাটায় পোড়ানো মাটির কলসি। এটি পানীয় জলকে প্রাকৃতিকভাবে শীতল রাখে।',

    material: 'Natural river clay & terracotta slip',
    material_en: 'Natural river clay & terracotta slip',
    material_hi: 'प्राकृतिक नदी मिट्टी और टेराकोटा लेप',
    material_ta: 'இயற்கை ஆற்று களிமண் மற்றும் டெரகோட்டா',
    material_mr: 'नैसर्गिक नदीची माती आणि टेराकोटा लेप',
    material_or: 'ପ୍ରାକୃତିକ ନଦୀ ମାଟି ଓ ଟେରାକୋଟା ଲେପ',
    material_bn: 'প্রাকৃতিক নদীর মাটি ও টেরাকোটা প্রলেপ',

    technique: 'Wheel-thrown, wood-kiln fired',
    technique_en: 'Wheel-thrown, wood-kiln fired',
    technique_hi: 'चाक पर ढलाई, लकड़ी की भट्ठी में पकाई',
    technique_ta: 'சக்கரத்தில் வடிக்கப்பட்டது, மரச் சூளையில் சுடப்பட்டது',
    technique_mr: 'चाकावर घडवलेले, लाकडाच्या भट्टीत भाजलेले',
    technique_or: 'କୁମ୍ଭାର ଚକରେ ଗଢ଼ା, କାଠ ଚୁଲାରେ ପୋଡ଼ା',
    technique_bn: 'চাকায় গড়া, কাঠের ভাটায় পোড়ানো',

    dimensions: 'H 28 cm, Diameter 22 cm',
    tags: ['terracotta', 'rajasthan', 'handmade', 'pottery', 'earthenware'],
    status: 'active',
  },
  {
    product_id: 'KRG-TEXT-0102',
    title: 'Authentic Banarasi Katan Silk Saree',
    title_en: 'Authentic Banarasi Katan Silk Saree',
    title_hi: 'प्रामाणिक बनारसी कतान सिल्क साड़ी',
    title_ta: 'பாரம்பரிய பனாரசி காட்டன் பட்டுப் புடவை',
    title_mr: 'अस्सल बनारसी कतान रेशमी साडी',
    title_or: 'ପ୍ରାମାଣିକ ବନାରସୀ କତାନ ରେଶମ ଶାଢ଼ୀ',
    title_bn: 'খাঁটি বেনারসি কাতান রেশম শাড়ি',

    category: 'textile_handloom',
    category_name: 'Textile Handloom',
    price: 8450,
    moq: 5,
    lead_time_days: 25,
    has_gi_tag: true,
    gi_tag_name: 'Banaras Brocades and Sarees (GI No. 99)',
    artisan_id: 'KG-2024-5512',
    artisan_name: 'Mohammed Yunus Ansari',
    artisan_phone: '+919450098765',
    location: 'Varanasi, Uttar Pradesh',
    image_url: '/images/craft_banarasi_saree.jpg',

    description: 'Exquisite pure mulberry katan silk woven on traditional pit looms featuring intricate gold and silver zari floral jall motifs.',
    description_en: 'Exquisite pure mulberry katan silk woven on traditional pit looms featuring intricate gold and silver zari floral jall motifs.',
    description_hi: 'पारंपरिक करघे पर शुद्ध शहतूत कतान रेशम से बुनी गई साड़ी, जिसमें सोने-चांदी की जरी के बारीक पुष्प पैटर्न हैं।',
    description_ta: 'பாரம்பரிய தறியில் தூய மல்பெரி கட்டான் பட்டில் நெய்யப்பட்ட புடவை, நேர்த்தியான தங்கம் மற்றும் வெள்ளி ஜரி மலர் வேலைப்பாடுகளுடன்.',
    description_mr: 'पारंपरिक हातमागवर शुद्ध मलबरी कतान रेशमावर विणलेली साडी, ज्यामध्ये सोनेरी आणि चंदेरी जरीचे सुंदर नक्षीकाम आहे.',
    description_or: 'ପାରମ୍ପରିକ ହସ୍ତତନ୍ତରେ ଶୁଦ୍ଧ ମଲବେରୀ କତାନ ରେଶମରେ ବୁଣା ହୋଇଥିବା ଶାଢ଼ୀ, ଯେଉଁଥିରେ ସୁନା ଓ ରୂପା ଜରୀର ସୂକ୍ଷ୍ମ ଫୁଲ କାରିଗରୀ ରହିଛି।',
    description_bn: 'ঐতিহ্যবাহী তাঁতে খাঁটি তুঁত কাতান রেশমে বোনা শাড়ি, যার মধ্যে রয়েছে সোনা ও রুপোর জরির চমৎকার ফুলের নকশা।',

    material: 'Pure mulberry silk & metallic zari',
    material_en: 'Pure mulberry silk & metallic zari',
    material_hi: 'शुद्ध शहतूत रेशम और धात्विक जरी',
    material_ta: 'தூய மல்பெரி பட்டு & உலோக ஜரி',
    material_mr: 'शुद्ध मलबरी रेशीम आणि धातूची जरी',
    material_or: 'ଶୁଦ୍ଧ ମଲବେରୀ ରେଶମ ଓ ଧାତବ ଜରୀ',
    material_bn: 'খাঁটি তুঁত রেশম ও ধাতব জরি',

    technique: 'Traditional handloom jacquard weaving',
    technique_en: 'Traditional handloom jacquard weaving',
    technique_hi: 'पारंपरिक हथकरघा जैकार्ड बुनाई',
    technique_ta: 'பாரம்பரிய கைத்தறி ஜாக்கார்ட் நெசவு',
    technique_mr: 'पारंपरिक हातमाग जॅकार्ड विणकाम',
    technique_or: 'ପାରମ୍ପରିକ ହସ୍ତତନ୍ତ ଜାକାର୍ଡ ବୁଣାକାର୍ଯ୍ୟ',
    technique_bn: 'ঐতিহ্যবাহী তাঁত জ্যাকার্ড বুনন',

    dimensions: 'Length 6.5 m with blouse piece',
    tags: ['banarasi', 'silk', 'handloom', 'zari', 'traditional'],
    status: 'active',
  },
  {
    product_id: 'KRG-POT-0304',
    title: 'Jaipur Blue Pottery Glazed Floral Urn',
    title_en: 'Jaipur Blue Pottery Glazed Floral Urn',
    title_hi: 'जयपुर ब्लू पॉटरी नक्काशीदार गुलदस्ता',
    title_ta: 'ஜெய்ப்பூர் ப்ளூ பாட்டரி மலர் குவளை',
    title_mr: 'जयपूर ब्लू पॉटरी नक्षीदार फुलदाणी',
    title_or: 'ଜୟପୁର ବ୍ଲୁ ପଟେରୀ ଚିତ୍ରିତ ଫୁଲଦାନୀ',
    title_bn: 'জয়পুর ব্লু পটারি নকশাদার ফুলদানি',

    category: 'pottery_terracotta',
    category_name: 'Pottery & Terracotta',
    price: 2450,
    moq: 15,
    lead_time_days: 18,
    has_gi_tag: true,
    gi_tag_name: 'Blue Pottery of Jaipur (GI No. 51)',
    artisan_id: 'KG-2024-8921',
    artisan_name: 'Rameshwar Prajapati',
    artisan_phone: '+919829012345',
    location: 'Jaipur, Rajasthan',
    image_url: '/images/craft_blue_pottery.jpg',

    description: 'Distinctive quartz-paste blue pottery vase handcrafted without clay, glazed with natural cobalt and turquoise mineral oxides.',
    description_en: 'Distinctive quartz-paste blue pottery vase handcrafted without clay, glazed with natural cobalt and turquoise mineral oxides.',
    description_hi: 'क्वार्ट्ज पेस्ट से बिना मिट्टी के हाथ से तैयार अनोखा फूलदान, जिस पर प्राकृतिक कोबाल्ट और फ़िरोज़ा ऑक्साइड का चमकीला लेप है।',
    description_ta: 'களிமண் இல்லாமல் குவார்ட்ஸ் பசையால் கையால் செய்யப்பட்ட தனித்துவமான மலர் குவளை, கோபால்ட் மற்றும் டர்க்காய்ஸ் வண்ணக் கலவையுடன்.',
    description_mr: 'मातीचा वापर न करता क्वार्ट्ज पेस्टपासून हाताने बनवलेली वैशिष्ट्यपूर्ण फुलदाणी, कोबाल्ट आणि फिरोजा रंगाच्या चकाकीसह.',
    description_or: 'ବିନା ମାଟିରେ କ୍ୱାର୍ଟଜ୍ ପେଷ୍ଟ ସାହାଯ୍ୟରେ ହାତରେ ତିଆରି ସ୍ୱତନ୍ତ୍ର ଫୁଲଦାନୀ, ପ୍ରାକୃତିକ କୋବାଲ୍ଟ ଓ ଫିରୋଜା ରଙ୍ଗରେ ରଙ୍ଗିନ।',
    description_bn: 'মাটি ছাড়া কোয়ার্টজ পেস্ট দিয়ে হাতে তৈরি বিশেষ ফুলদানি, যাতে রয়েছে প্রাকৃতিক কোবাল্ট ও ফিরোজা খনিজ রঙের চকচকে প্রলেপ।',

    material: 'Quartz powder, glass powder & natural gum',
    material_en: 'Quartz powder, glass powder & natural gum',
    material_hi: 'क्वार्ट्ज पाउडर, ग्लास पाउडर और प्राकृतिक गोंद',
    material_ta: 'குவார்ட்ஸ் தூள், கண்ணாடி தூள் & இயற்கை பசை',
    material_mr: 'क्वार्ट्ज पावडर, काच पावडर आणि नैसर्गिक डिंक',
    material_or: 'କ୍ୱାର୍ଟଜ୍ ପାଉଡର, କାଚ ଗୁଣ୍ଡ ଏବଂ ପ୍ରାକୃତିକ ଅଠା',
    material_bn: 'কোয়ার্টজ গুঁড়ো, কাচ গুঁড়ো ও প্রাকৃতিক আঠা',

    technique: 'Mould-formed and low-fire glazed',
    technique_en: 'Mould-formed and low-fire glazed',
    technique_hi: 'सांचे में ढलाई और धीमी आंच पर ग्लेज़िंग',
    technique_ta: 'அச்சில் வார்க்கப்பட்டு மிதமான தீயில் பளபளப்பாக்கப்பட்டது',
    technique_mr: 'साच्यात घडवलेले आणि मंद आचेवर ग्लेझ केलेले',
    technique_or: 'ଫର୍ମାରେ ଗଠନ ଏବଂ କମ୍ ତାପମାତ୍ରାରେ ଗ୍ଲେଜିଂ',
    technique_bn: 'ছাঁচে তৈরি এবং মৃদু তাপে গ্লেজিং করা',

    dimensions: 'H 32 cm, Diameter 18 cm',
    tags: ['blue pottery', 'jaipur', 'ceramic', 'floral', 'decor'],
    status: 'active',
  },
  {
    product_id: 'KRG-EMB-0405',
    title: 'Lucknowi Chikankari Modal Silk Stole',
    title_en: 'Lucknowi Chikankari Modal Silk Stole',
    title_hi: 'लखनवी चिकनकारी मोडल सिल्क दुपट्टा',
    title_ta: 'லக்னோவி சிக்கன்காரி மோடல் பட்டு சால்வை',
    title_mr: 'लखनवी चिकनकारी मोडल सिल्क स्टोल',
    title_or: 'ଲକ୍ଷ୍ନୌ ଚିକନକାରୀ ମୋଡାଲ୍ ରେଶମ ଓଢ଼ଣୀ',
    title_bn: 'লখনউ চিকনকারি মোডাল সিল্ক ওড়না',

    category: 'textile_embroidery',
    category_name: 'Textile Embroidery',
    price: 1850,
    moq: 20,
    lead_time_days: 14,
    has_gi_tag: true,
    gi_tag_name: 'Lucknow Chikan Craft (GI No. 119)',
    artisan_id: 'KG-2024-7731',
    artisan_name: 'Farhana Khatoon',
    artisan_phone: '+919415012345',
    location: 'Lucknow, Uttar Pradesh',
    image_url: '/images/craft_chikankari_stole.jpg',

    description: 'Delicate hand needlework embroidery showcasing traditional Tepchi, Bakhiya, and Phanda stitches on breathable modal silk fabric.',
    description_en: 'Delicate hand needlework embroidery showcasing traditional Tepchi, Bakhiya, and Phanda stitches on breathable modal silk fabric.',
    description_hi: 'मुलायम मोडल सिल्क कपड़े पर पारंपरिक तेपची, बखिया और फंदा टांकों से सुसज्जित हाथ की नाजुक चिकनकारी कढ़ाई।',
    description_ta: 'மென்மையான மோடல் பட்டுத் துணியில் பாரம்பரிய டெப்சி, பகியா மற்றும் ஃபண்டா தையல்களுடன் கூடிய நேர்த்தியான கைத்தையல்.',
    description_mr: 'मऊ मोडल सिल्क कपड्यावर पारंपरिक तेपची, बखिया आणि फंदा टाके असलेली नाजूक हाताने केलेली चिकनकारी भरतकाम.',
    description_or: 'ନରମ ମୋଡାଲ୍ ରେଶମ କପଡ଼ା ଉପରେ ପାରମ୍ପରିକ ତେପଚି, ବଖିଆ ଓ ଫନ୍ଦା ଟାଙ୍କାରେ ହାତରେ କଢ଼ା ଯାଇଥିବା ସୁନ୍ଦର ଚିକନକାରୀ ଓଢ଼ଣୀ।',
    description_bn: 'নরম মোডাল সিল্ক কাপড়ে ঐতিহ্যবাহী তেপচি, বাখিয়া এবং ফান্দা সেলাই দিয়ে নিখুঁত হাতে করা চিকনকারি কাজ।',

    material: 'Modal silk fabric, fine cotton embroidery floss',
    material_en: 'Modal silk fabric, fine cotton embroidery floss',
    material_hi: 'मोडल सिल्क कपड़ा, बारीक सूती कढ़ाई धागा',
    material_ta: 'மோடல் பட்டுத் துணி, பருத்தி எம்பிராய்டரி நூல்',
    material_mr: 'मोडल सिल्क कापड, बारीक सुती धागा',
    material_or: 'ମୋଡାଲ୍ ରେଶମ କପଡ଼ା, ସୂକ୍ଷ୍ମ ସୂତା କଢ଼ା ସୂତ୍ର',
    material_bn: 'মোডাল সিল্ক কাপড়, সূক্ষ্ম সুতির সূচিকর্মের সুতো',

    technique: 'Intricate hand needlework',
    technique_en: 'Intricate hand needlework',
    technique_hi: 'हाथ की बारीक सुई कढ़ाई (चिकनकारी)',
    technique_ta: 'நுணுக்கமான கை ஊசி வேலைப்பாடு',
    technique_mr: 'बारीक हाताने केलेले सुईचे काम',
    technique_or: 'ସୂକ୍ଷ୍ମ ହାତ ଛୁଞ୍ଚି କାମ',
    technique_bn: 'নিখুঁত হস্ত সূচিকর্ম',

    dimensions: '200 cm x 70 cm',
    tags: ['chikankari', 'lucknow', 'embroidery', 'stole', 'handcrafted'],
    status: 'active',
  },
  {
    product_id: 'KRG-WOOD-0506',
    title: 'Saharanpur Carved Sheesham Wood Tray',
    title_en: 'Saharanpur Carved Sheesham Wood Tray',
    title_hi: 'सहारनपुर नक्काशीदार शीशम की लकड़ी की ट्रे',
    title_ta: 'சஹாரன்பூர் செதுக்கப்பட்ட சீஷம் மரத் தட்டு',
    title_mr: 'सहारनपूर नक्षीदार शीशम लाकडी ट्रे',
    title_or: 'ସହାରନପୁର ଖୋଦେଇ ଶିଶୁ କାଠ ଟ୍ରେ',
    title_bn: 'সাহারানপুর খোদাই করা শীশম কাঠের ট্রে',

    category: 'woodcraft',
    category_name: 'Woodcraft',
    price: 1250,
    moq: 25,
    lead_time_days: 12,
    has_gi_tag: true,
    gi_tag_name: 'Saharanpur Wood Craft (GI No. 378)',
    artisan_id: 'KG-2024-3341',
    artisan_name: 'Harish Chandra Suthar',
    artisan_phone: '+919837012345',
    location: 'Saharanpur, Uttar Pradesh',
    image_url: '/images/craft_wood_tray.jpg',

    description: 'Solid seasoned Indian Rosewood (Sheesham) serving tray featuring floral lattice carving with non-toxic natural beeswax buff finish.',
    description_en: 'Solid seasoned Indian Rosewood (Sheesham) serving tray featuring floral lattice carving with non-toxic natural beeswax buff finish.',
    description_hi: 'शीशम की ठोस लकड़ी से बनी सर्विंग ट्रे, जिस पर फूलों की सुंदर जालीदार नक्काशी और प्राकृतिक मोम की चमक है।',
    description_ta: 'சீஷம் மரத்தில் செய்யப்பட்ட உணவு பரிமாறும் தட்டு, மலர் பின்னல் செதுக்கல்கள் மற்றும் இயற்கை மெழுகு பாலிஷுடன்.',
    description_mr: 'शीशम लाकडापासून बनवलेला सर्व्हिंग ट्रे, ज्यावर फुलांची सुंदर जाळीदार नक्षी आणि नैसर्गिक मेणाची चमक आहे.',
    description_or: 'ମଜବୁତ ଶିଶୁ କାଠରେ ତିଆରି ସର୍ଭିଂ ଟ୍ରେ, ଯେଉଁଥିରେ ସୁନ୍ଦର ଫୁଲ ଜାଲି କାରୁକାର୍ଯ୍ୟ ଓ ପ୍ରାକୃତିକ ମହୁଫେଣା ମହମର ଚମକ ରହିଛି।',
    description_bn: 'মজবুত শীশম কাঠের তৈরি পরিবেশন ট্রে, যাতে রয়েছে ফুলের জালিকাটা খোদাই এবং প্রাকৃতিক মৌমাছির মোমের পালিশ।',

    material: 'Seasoned Sheesham Wood',
    material_en: 'Seasoned Sheesham Wood',
    material_hi: 'परिपक्व शीशम की लकड़ी',
    material_ta: 'பக்குவப்படுத்தப்பட்ட சீஷம் மரம்',
    material_mr: 'उत्तम दर्जाचे शीशम लाकूड',
    material_or: 'ଶୁଦ୍ଧ ଶିଶୁ କାଠ',
    material_bn: 'পরিণত শীশম কাঠ',

    technique: 'Hand-chiselled lattice carving (Jali work)',
    technique_en: 'Hand-chiselled lattice carving (Jali work)',
    technique_hi: 'हाथ से छेनी द्वारा जालीदार नक्काशी',
    technique_ta: 'கையால் செதுக்கப்பட்ட ஜாலி வேலைப்பாடு',
    technique_mr: 'हाताने छिन्नीने केलेले जाळीकाम',
    technique_or: 'ହାତ ବଟାଳି ସାହାଯ୍ୟରେ ଜାଲି ଖୋଦେଇ',
    technique_bn: 'হাতে বাটালি দিয়ে জালিকাটা নকশা',

    dimensions: '38 cm x 26 cm x 5 cm',
    tags: ['woodcraft', 'sheesham', 'carving', 'home decor', 'serveware'],
    status: 'active',
  },
  {
    product_id: 'KRG-MET-0607',
    title: 'Bastar Bell Metal Dokra Tribal Figurine',
    title_en: 'Bastar Bell Metal Dokra Tribal Figurine',
    title_hi: 'बस्तर डोकरा धातु शिल्पकला मूर्ति',
    title_ta: 'பஸ்தார் டோக்ரா மணி உலோக பழங்குடி சிலை',
    title_mr: 'बस्तर डोकरा धातू शिल्प मूर्ती',
    title_or: 'ବସ୍ତର ଡୋକରା ଧାତୁ ଆଦିବାସୀ ମୂର୍ତ୍ତି',
    title_bn: 'বস্তর ডোকরা ধাতু আদিবাসী মূর্তি',

    category: 'metalcraft',
    category_name: 'Metalcraft',
    price: 2950,
    moq: 8,
    lead_time_days: 20,
    has_gi_tag: true,
    gi_tag_name: 'Bastar Dhokra (GI No. 83)',
    artisan_id: 'KG-2024-9912',
    artisan_name: 'Budhram Kashyap',
    artisan_phone: '+919425212345',
    location: 'Bastar, Chhattisgarh',
    image_url: '/images/craft_dokra_bronze.jpg',

    description: 'Ancient lost-wax casting technique non-ferrous bell metal sculpture depicting indigenous tribal musicians and village folklore.',
    description_en: 'Ancient lost-wax casting technique non-ferrous bell metal sculpture depicting indigenous tribal musicians and village folklore.',
    description_hi: 'प्राचीन मोम-ढलाई (लॉस्ट वैक्स) तकनीक से निर्मित पीतल-कांस्य धातु शिल्प, जिसमें आदिवासी संगीतकारों और लोककथाओं का चित्रण है।',
    description_ta: 'பண்டைய மெழுகு வார்ப்பு முறையில் செய்யப்பட்ட பித்தளை-வெண்கல உலோகச் சிற்பம், பழங்குடி இசைக்கலைஞர்களை சித்தரிக்கிறது.',
    description_mr: 'प्राचीन मेण-ओतकाम (लॉस्ट वॅक्स) तंत्राने बनवलेले पितळ-कांस्य धातू शिल्प, ज्यामध्ये आदिवासी संगीतकारांचे दर्शन घडते.',
    description_or: 'ପ୍ରାଚୀନ ମହମ-ଢଳା (ଲଷ୍ଟ-ୱାକ୍ସ) ପଦ୍ଧତିରେ ପିତ୍ତଳ ଓ ବ୍ରୋଞ୍ଜ ଧାତୁରେ ତିଆରି ଆଦିବାସୀ ସଙ୍ଗୀତକାର ଓ ଲୋକକଳା ପ୍ରତିମୂର୍ତ୍ତି।',
    description_bn: 'প্রাচীন মোম-ঢালাই পদ্ধতিতে তৈরি পিতল ও ব্রোঞ্জ ধাতুর ভাস্কর্য, যা আদিবাসী বাদ্যযন্ত্রশিল্পী ও লোককথাকে তুলে ধরে।',

    material: 'Bell metal brass and bronze alloy',
    material_en: 'Bell metal brass and bronze alloy',
    material_hi: 'बेल मेटल पीतल और कांस्य मिश्रधातु',
    material_ta: 'பித்தளை மற்றும் வெண்கலக் கலவை',
    material_mr: 'बेल मेटल पितळ आणि कांस्य मिश्रधातू',
    material_or: 'ଘଣ୍ଟା ଧାତୁ ପିତ୍ତଳ ଏବଂ ବ୍ରୋଞ୍ଜ ମିଶ୍ରଣ',
    material_bn: 'বেল মেটাল পিতল ও ব্রোঞ্জ সংকর ধাতু',

    technique: 'Cire-perdue (Lost wax cast)',
    technique_en: 'Cire-perdue (Lost wax cast)',
    technique_hi: 'पारंपरिक लॉस्ट वैक्स कास्टिंग',
    technique_ta: 'பாரம்பரிய லாஸ்ட் வாக்ஸ் வார்ப்பு',
    technique_mr: 'पारंपरिक लॉस्ट वॅक्स कास्टिंग',
    technique_or: 'ପାରମ୍ପରିକ ଲଷ୍ଟ ୱାକ୍ସ କାଷ୍ଟିଂ',
    technique_bn: 'ঐতিহ্যবাহী লস্ট ওয়াক্স কাস্টিং',

    dimensions: 'H 22 cm, Weight 1.2 kg',
    tags: ['dokra', 'dhokra', 'brass', 'tribal art', 'metalcraft'],
    status: 'active',
  },
  {
    product_id: 'KRG-FOLK-0708',
    title: 'Madhubani Handpainted Tree of Life on Handmade Paper',
    title_en: 'Madhubani Handpainted Tree of Life on Handmade Paper',
    title_hi: 'मधुबनी हस्तचित्रित जीवन वृक्ष पेंटिंग',
    title_ta: 'மதுபானி கையால் வரையப்பட்ட வாழ்வின் மரம் ஓவியம்',
    title_mr: 'मधुबनी हस्तचित्रित कल्पवृक्ष पेंटिंग',
    title_or: 'ମଧୁବନୀ ହାତଅଙ୍କା ଜୀବନ ବୃକ୍ଷ ପେଣ୍ଟିଂ',
    title_bn: 'মধুবনী হাতে আঁকা জীবন বৃক্ষ চিত্রকর্ম',

    category: 'painting_folk',
    category_name: 'Folk Painting',
    price: 3200,
    moq: 5,
    lead_time_days: 15,
    has_gi_tag: true,
    gi_tag_name: 'Madhubani Paintings (GI No. 105)',
    artisan_id: 'KG-2024-4421',
    artisan_name: 'Devi Kumari Jha',
    artisan_phone: '+919431012345',
    location: 'Madhubani, Bihar',
    image_url: '/images/craft_madhubani_art.jpg',

    description: 'Authentic Mithila folk painting executed using bamboo nibs, cotton twigs, and natural mineral and plant-extracted pigments on cotton rag paper.',
    description_en: 'Authentic Mithila folk painting executed using bamboo nibs, cotton twigs, and natural mineral and plant-extracted pigments on cotton rag paper.',
    description_hi: 'हाथ से बने सूती कागज पर बांस की निब और प्राकृतिक वनस्पतिक रंगों से बनाई गई प्रामाणिक मिथिला लोक कला पेंटिंग।',
    description_ta: 'கையால் செய்யப்பட்ட காகிதத்தில் மூங்கில் குச்சிகள் மற்றும் இயற்கை வண்ணங்களால் வரையப்பட்ட பாரம்பரிய மிதிலா ஓவியம்.',
    description_mr: 'हातनिर्मित कागदावर बांबूच्या कमानीने आणि नैसर्गिक वनस्पती रंगांनी रेखाटलेली अस्सल मिथिला लोककला पेंटिंग.',
    description_or: 'ହାତତିଆରି କାଗଜ ଉପରେ ବାଉଁଶ କଲମ ଏବଂ ପ୍ରାକୃତିକ ଗଛଲତା ରଙ୍ଗରେ ଅଙ୍କିତ ପାରମ୍ପରିକ ମିଥିଳା ଲୋକ ଚିତ୍ରକଳା।',
    description_bn: 'হাতে তৈরি সুতির কাগজে বাঁশের কঞ্চি এবং প্রাকৃতিক ভেষজ রঙে আঁকা খাঁটি মিথিলা লোকশিল্প চিত্রকর্ম।',

    material: 'Natural vegetable dyes & handmade cotton rag paper',
    material_en: 'Natural vegetable dyes & handmade cotton rag paper',
    material_hi: 'प्राकृतिक वानस्पतिक रंग और हस्तनिर्मित सूती कागज',
    material_ta: 'இயற்கை தாவர சாயங்கள் மற்றும் கைவினை காகிதம்',
    material_mr: 'नैसर्गिक वनस्पती रंग आणि हातनिर्मित कागद',
    material_or: 'ପ୍ରାକୃତିକ ଉଦ୍ଭିଦ ରଙ୍ଗ ଓ ହାତତିଆରି ସୂତା କାଗଜ',
    material_bn: 'প্রাকৃতিক ভেষজ রং ও হাতে তৈরি সুতির কাগজ',

    technique: 'Mithila line art drawing with bamboo quill',
    technique_en: 'Mithila line art drawing with bamboo quill',
    technique_hi: 'बांस की कलम से मिथिला रेखाचित्र',
    technique_ta: 'மூங்கில் குச்சியால் வரையப்பட்ட மிதிலா கோட்டோவியம்',
    technique_mr: 'बांबूच्या लेखणीने रेखाटलेली मिथिला रेखाचित्रे',
    technique_or: 'ବାଉଁଶ କଲମ ସାହାଯ୍ୟରେ ମିଥିଳା ରେଖାଚିତ୍ର',
    technique_bn: 'বাঁশের কলম দিয়ে মিথিলা রেখাচিত্র',

    dimensions: '56 cm x 76 cm (Unframed)',
    tags: ['madhubani', 'mithila', 'folk art', 'natural dye', 'painting'],
    status: 'active',
  },
  {
    product_id: 'KRG-TEXT-0809',
    title: 'Sambalpuri Ikat Handloom Cotton Fabric Set',
    title_en: 'Sambalpuri Ikat Handloom Cotton Fabric Set',
    title_hi: 'संबलपुरी इकत हथकरघा सूती कपड़ा',
    title_ta: 'சம்பல்பூரி இக்கத் கைத்தறி பருத்தி துணி தொகுப்பு',
    title_mr: 'संबलपुरी इकत हातमाग सुती कापड संच',
    title_or: 'ସମ୍ବଲପୁରୀ ଇକ୍କତ ହସ୍ତତନ୍ତ ସୂତା କପଡ଼ା ସେଟ୍',
    title_bn: 'সম্বলপুরী ইকত তাঁত সুতি কাপড়ের সেট',

    category: 'textile_handloom',
    category_name: 'Textile Handloom',
    price: 2100,
    moq: 12,
    lead_time_days: 18,
    has_gi_tag: true,
    gi_tag_name: 'Sambalpuri Bandha Saree & Fabrics (GI No. 22)',
    artisan_id: 'KG-2024-6632',
    artisan_name: 'Baidyanath Meher',
    artisan_phone: '+919437012345',
    location: 'Sambalpur, Odisha',
    image_url: '/images/craft_sambalpuri_ikat.jpg',

    description: 'Masterfully tie-dyed warp and weft double-ikat pure organic cotton fabric showcasing traditional Shankha and Chakra motifs.',
    description_en: 'Masterfully tie-dyed warp and weft double-ikat pure organic cotton fabric showcasing traditional Shankha and Chakra motifs.',
    description_hi: 'पारंपरिक शंख और चक्र रूपांकनों को प्रदर्शित करने वाला मास्टर टाई-डाई डबल-इकत शुद्ध सूती हथकरघा कपड़ा।',
    description_ta: 'பாரம்பரிய சங்கு மற்றும் சக்கர வடிவங்களை வெளிப்படுத்தும் டை-டை டபுள்-இக்கத் தூய பருத்தி கைத்தறி துணி.',
    description_mr: 'पारंपरिक शंख आणि चक्र नक्षी असलेले टाई-अँड-डाई डबल-इकत शुद्ध सुती हातमाग कापड.',
    description_or: 'ପାରମ୍ପରିକ ଶଙ୍ଖ ଓ ଚକ୍ର ମୋଟିଫ୍ ବିଶିଷ୍ଟ ଟାଇ-ଡାଏ ଡବଲ୍-ଇକ୍କତ ଶୁଦ୍ଧ ସୂତା ହସ୍ତତନ୍ତ କପଡ଼ା।',
    description_bn: 'ঐতিহ্যবাহী শঙ্খ ও চক্র মোটিফ সমন্বিত টাই-ডাই ডাবল-ইকত খাঁটি সুতি তাঁতের কাপড়।',

    material: '100% fine organic combed cotton',
    material_en: '100% fine organic combed cotton',
    material_hi: '100% शुद्ध जैविक कंघीदार कपास',
    material_ta: '100% தூய இயற்கை பருத்தி',
    material_mr: '100% शुद्ध सेंद्रिय कापूस',
    material_or: '୧୦୦% ଶୁଦ୍ଧ ଜୈବିକ ସୂତା',
    material_bn: '১০০% খাঁটি জৈব সুতি',

    technique: 'Tie-and-dye double ikat handloom weaving',
    technique_en: 'Tie-and-dye double ikat handloom weaving',
    technique_hi: 'टाई-एंड-डाई डबल इकत हथकरघा बुनाई',
    technique_ta: 'டை-அண்ட்-டை டபுள் இக்கத் கைத்தறி நெசவு',
    technique_mr: 'टाई-अँड-डाई डबल इकत हातमाग विणकाम',
    technique_or: 'ଟାଇ-ଏଣ୍ଡ-ଡାଏ ବନ୍ଧକଳା ହସ୍ତତନ୍ତ ବୁଣାକାର୍ଯ୍ୟ',
    technique_bn: 'টাই-অ্যান্ড-ডাই ডাবল ইকত তাঁত বুনন',

    dimensions: 'Length 5.0 m, Width 44 inches',
    tags: ['sambalpuri', 'ikat', 'odisha', 'handloom', 'cotton'],
    status: 'active',
  },
]

export function getLocalizedProduct(item, language = 'en') {
  if (!item) return item
  const lang = normalizeLanguage(language)
  const listing = item.listing || {}

  const title =
    item[`title_${lang}`] ||
    listing[`title_${lang}`] ||
    item.title_en ||
    listing.title_en ||
    item.title ||
    'Handcrafted Artisan Product'

  const description =
    item[`description_${lang}`] ||
    listing[`description_${lang}`] ||
    item.description_en ||
    listing.description_en ||
    item.description ||
    ''

  const material =
    item[`material_${lang}`] ||
    item.material_en ||
    listing.material_detected ||
    item.material ||
    ''

  const technique =
    item[`technique_${lang}`] ||
    item.technique_en ||
    listing.craft_tradition ||
    item.technique ||
    ''

  return {
    ...item,
    title,
    description,
    material,
    technique,
  }
}

export function getAllMarketplaceProducts(liveBackendListings = [], language = 'en') {
  const lang = normalizeLanguage(language)

  const mappedLive = (liveBackendListings || []).map((item) => ({
    product_id: item.product_id || item.id,
    id: item.product_id || item.id,
    title: item.listing?.[`title_${lang}`] || item.listing?.title_en || item.title || 'Handcrafted Artisan Product',
    title_en: item.listing?.title_en || item.title,
    title_hi: item.listing?.title_hi || item.title,
    title_ta: item.listing?.title_ta || item.title,
    title_mr: item.listing?.title_mr || item.title,
    title_or: item.listing?.title_or || item.title,
    title_bn: item.listing?.title_bn || item.title,
    category: item.category || 'pottery_terracotta',
    category_name: (item.category || 'pottery_terracotta').replace(/_/g, ' '),
    price: Number(item.price) || 1939,
    moq: 10,
    lead_time_days: 15,
    has_gi_tag: true,
    gi_tag_name: 'Verified Craft Provenance',
    artisan_id: item.artisan_id || 'KG-2024-8921',
    artisan_name: item.artisan_name || 'Rameshwar Prajapati',
    artisan_phone: item.artisan_phone || item.phone || '+919556828397',
    location: item.location || 'Jaipur, Rajasthan',
    image_url: item.image_url || '/images/craft_terracotta_pot.jpg',
    description: item.listing?.[`description_${lang}`] || item.listing?.description_en || item.description || 'Authentic handcrafted creation from artisan workshop.',
    material: item.listing?.material_detected || 'Natural craft materials',
    technique: item.listing?.craft_tradition || 'Traditional handcrafting',
    tags: item.listing?.seo_tags || ['handmade', 'artisan'],
    status: 'active',
  }))

  const seenIds = new Set()
  const seenTitleKeys = new Set()
  const deduplicated = []

  const normalizeTitleKey = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '')

  // Live published listings take priority
  for (const item of mappedLive) {
    const pId = item.product_id || item.id
    const tKey = normalizeTitleKey(item.title)
    if (!pId || seenIds.has(pId) || (tKey && seenTitleKeys.has(tKey))) {
      continue
    }
    seenIds.add(pId)
    if (tKey) seenTitleKeys.add(tKey)
    deduplicated.push(getLocalizedProduct(item, lang))
  }

  // Complement with curated catalog crafts (only if not already present)
  for (const item of CURATED_CRAFT_PRODUCTS) {
    const pId = item.product_id || item.id
    const tKey = normalizeTitleKey(item.title_en || item.title)
    if (seenIds.has(pId) || (tKey && seenTitleKeys.has(tKey))) {
      continue
    }
    seenIds.add(pId)
    if (tKey) seenTitleKeys.add(tKey)
    deduplicated.push(getLocalizedProduct(item, lang))
  }

  return deduplicated
}
