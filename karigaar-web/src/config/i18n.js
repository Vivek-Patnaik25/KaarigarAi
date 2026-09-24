import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '../locales/en.json'
import hi from '../locales/hi.json'
import or from '../locales/or.json'
import bn from '../locales/bn.json'
import ta from '../locales/ta.json'

const savedLanguage = localStorage.getItem('karigaar_lang') || 'hi'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      or: { translation: or },
      bn: { translation: bn },
      ta: { translation: ta },
    },
    lng: savedLanguage,
    fallbackLng: 'hi',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
