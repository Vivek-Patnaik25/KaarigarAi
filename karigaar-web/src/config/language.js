/** The only language contract shared by UI, persistence, API requests and content fields. */
export const DEFAULT_LANGUAGE = 'en'
export const LANGUAGE_STORAGE_KEY = 'karigaar_lang'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', native: 'English', label: 'English', flag: '🌐' },
  { code: 'hi', native: 'हिन्दी', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ta', native: 'தமிழ்', label: 'Tamil', flag: '🇮🇳' },
  { code: 'mr', native: 'मराठी', label: 'Marathi', flag: '🇮🇳' },
  { code: 'or', native: 'ଓଡ଼ିଆ', label: 'Odia', flag: '🇮🇳' },
  { code: 'bn', native: 'বাংলা', label: 'Bengali', flag: '🇮🇳' },
]

const aliases = {
  english: 'en', 'en-in': 'en', hindi: 'hi', 'हिंदी': 'hi', 'हिन्दी': 'hi', 'hi-in': 'hi',
  tamil: 'ta', 'தமிழ்': 'ta', 'ta-in': 'ta', marathi: 'mr', 'मराठी': 'mr', 'mr-in': 'mr',
  odia: 'or', oriya: 'or', 'ଓଡ଼ିଆ': 'or', 'or-in': 'or', bengali: 'bn', bangla: 'bn', 'bn-in': 'bn',
}

export function normalizeLanguage(value) {
  const normalized = String(value || '').trim().toLowerCase().replace('_', '-')
  if (SUPPORTED_LANGUAGES.some(({ code }) => code === normalized)) return normalized
  return aliases[normalized] || DEFAULT_LANGUAGE
}

export function getPersistedLanguage() {
  return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY))
}

/** Content is data, not UI copy. English is the single documented safe fallback. */
export function localizedField(record, baseName, language) {
  const lang = normalizeLanguage(language)
  return record?.[`${baseName}_${lang}`] || record?.[`${baseName}_en`] || record?.[baseName] || ''
}
