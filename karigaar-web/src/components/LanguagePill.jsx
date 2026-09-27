import React from 'react'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../store/languageStore'

export default function LanguagePill({ className = '', compact = false }) {
  const { language, setLanguage } = useLanguageStore()

  return (
    <div className={`flex items-center gap-1 p-1 rounded-md bg-stone-100 border border-stone-200 ${className}`}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected = language === lang.code
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              isSelected
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{compact ? lang.code.toUpperCase() : lang.native}</span>
          </button>
        )
      })}
    </div>
  )
}
