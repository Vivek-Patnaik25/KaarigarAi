import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from '@phosphor-icons/react'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../store/languageStore'
import { DEFAULT_LANGUAGE } from '../config/language'

export default function LanguageSelectPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguageStore()
  const [selected, setSelected] = useState(language || DEFAULT_LANGUAGE)

  const handleContinue = () => {
    if (!selected) return
    setLanguage(selected)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-stone-bg flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div
            className="w-9 h-9 rounded flex items-center justify-center text-white text-sm font-semibold"
            style={{ background: '#B45309' }}
          >
            क
          </div>
          <span className="text-ink text-lg font-semibold">
            Karigaar<span className="text-amber-acc">AI</span>
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-ink mb-1">
          {t('choose_language', 'Choose language')}
        </h1>
        <p className="text-sm text-ink-muted mb-8">
          {t('choose_language_sub', 'Select the language you are most comfortable with')}
        </p>

        {/* Language grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-8">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded border text-left transition-all ${
                  isSelected
                    ? 'border-amber-acc bg-amber-light'
                    : 'border-stone-deep bg-white hover:border-stone-border hover:bg-stone-surface'
                }`}
                style={{ minHeight: '64px' }}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={`text-base font-medium leading-tight ${isSelected ? 'text-amber-acc' : 'text-ink'}`}>
                    {lang.native}
                  </span>
                  <span className="text-xs text-ink-faint">{lang.label}</span>
                </div>
                {isSelected && (
                  <Check size={15} weight="bold" className="text-amber-acc shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Continue */}
        <button
          type="button"
          disabled={!selected}
          onClick={handleContinue}
          className="clay-btn clay-btn-primary w-full flex items-center justify-center gap-2"
          style={{ minHeight: '50px', fontSize: '15px' }}
        >
          {t('continue', 'Continue')}
          <ArrowRight size={16} weight="bold" />
        </button>
      </motion.div>
    </div>
  )
}
