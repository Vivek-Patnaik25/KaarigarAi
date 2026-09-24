import { create } from 'zustand'
import i18n from '../config/i18n'

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', native: 'हिन्दी', label: 'Hindi', flag: '🇮🇳' },
  { code: 'en', native: 'English', label: 'English', flag: '🌐' },
  { code: 'or', native: 'ଓଡ଼ିଆ', label: 'Odia', flag: '🇮🇳' },
  { code: 'bn', native: 'বাংলা', label: 'Bengali', flag: '🇮🇳' },
  { code: 'ta', native: 'தமிழ்', label: 'Tamil', flag: '🇮🇳' },
  { code: 'mr', native: 'मराठी', label: 'Marathi', flag: '🇮🇳' },
]

export const useLanguageStore = create((set) => ({
  language: localStorage.getItem('karigaar_lang') || 'hi',
  setLanguage: (langCode) => {
    localStorage.setItem('karigaar_lang', langCode)
    i18n.changeLanguage(langCode)
    document.documentElement.lang = langCode
    set({ language: langCode })
  },
}))
