import { create } from 'zustand'
import i18n from '../config/i18n'
import { getPersistedLanguage, LANGUAGE_STORAGE_KEY, normalizeLanguage, SUPPORTED_LANGUAGES } from '../config/language'

export { SUPPORTED_LANGUAGES }

export const useLanguageStore = create((set) => ({
  language: getPersistedLanguage(),
  setLanguage: (langCode) => {
    const language = normalizeLanguage(langCode)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    i18n.changeLanguage(language)
    document.documentElement.lang = language
    set({ language })
  },
}))
