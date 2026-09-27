/**
 * add-gi-certified-key.mjs
 * Adds the gi_certified translation key to all 6 locale files.
 */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales')

const TRANSLATIONS = {
  en: { gi_certified: 'GI Certified' },
  hi: { gi_certified: 'जीआई प्रमाणित' },
  ta: { gi_certified: 'GI சான்றளிக்கப்பட்டது' },
  mr: { gi_certified: 'GI प्रमाणित' },
  bn: { gi_certified: 'GI প্রত্যয়িত' },
  or: { gi_certified: 'ଜିଆଇ ପ୍ରମାଣିତ' },
}

for (const [lang, patch] of Object.entries(TRANSLATIONS)) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`)
  const existing = JSON.parse(readFileSync(filePath, 'utf8'))
  const merged = { ...existing, ...patch }
  writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8')
  console.log(`✅ Added gi_certified to ${lang}.json`)
}
console.log('\n🎉 gi_certified key added to all locales.')
