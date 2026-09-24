import React from 'react'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../store/languageStore'

export default function LanguagePill({ className = '', compact = false }) {
  const { language, setLanguage } = useLanguageStore()

  return (
    <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl bg-clay-surface/80 border border-white/40 shadow-inner ${className}`}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected = language === lang.code
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all duration-200 flex items-center gap-1 ${
              isSelected
                ? 'bg-clay-primary text-white shadow-md scale-105'
                : 'text-clay-text/80 hover:bg-clay-deep/50'
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
