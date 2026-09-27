import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales')

const TRANSLATIONS = {
  en: {
    page_not_found: 'Page Not Found',
    page_not_found_desc: 'The craft page or catalogue resource you are looking for does not exist or has been moved.',
  },
  hi: {
    page_not_found: 'पृष्ठ नहीं मिला',
    page_not_found_desc: 'आप जिस शिल्प पृष्ठ या कैटलॉग संसाधन को खोज रहे हैं वह मौजूद नहीं है या हटा दिया गया है।',
  },
  ta: {
    page_not_found: 'பக்கம் கிடைக்கவில்லை',
    page_not_found_desc: 'நீங்கள் தேடும் கைவினைப் பக்கம் அல்லது பட்டியல் பக்கம் கிடைக்கவில்லை அல்லது நகர்த்தப்பட்டுவிட்டது.',
  },
  mr: {
    page_not_found: 'पृष्ठ आढळले नाही',
    page_not_found_desc: 'आपण शोधत असलेले हस्तकला पृष्ठ किंवा कॅटलॉग अस्तित्वात नाही किंवा हलविले गेले आहे.',
  },
  or: {
    page_not_found: 'ପୃଷ୍ଠା ମିଳିଲା ନାହିଁ',
    page_not_found_desc: 'ଆପଣ ଖୋଜୁଥିବା ହସ୍ତଶିଳ୍ପ ପୃଷ୍ଠା କିମ୍ବା କ୍ୟାଟାଲଗ୍ ଉପଲବ୍ଧ ନାହିଁ କିମ୍ବା ସ୍ଥାନାନ୍ତରିତ ହୋଇଛି।',
  },
  bn: {
    page_not_found: 'পৃষ্ঠাটি পাওয়া যায়নি',
    page_not_found_desc: 'আপনি যে কারুশিল্পের পৃষ্ঠা বা ক্যাটালগ খুঁজছেন তা পাওয়া যায়নি বা স্থানান্তরিত হয়েছে।',
  },
}

for (const [lang, patch] of Object.entries(TRANSLATIONS)) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`)
  const existing = JSON.parse(readFileSync(filePath, 'utf8'))
  const merged = { ...existing, ...patch }
  writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8')
  console.log(`✅ Added not-found keys to ${lang}.json`)
}
