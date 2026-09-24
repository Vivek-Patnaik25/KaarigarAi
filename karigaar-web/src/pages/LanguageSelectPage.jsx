import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkle, ArrowRight } from '@phosphor-icons/react'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../store/languageStore'
import ClayCard from '../components/ClayCard'
import ClayButton from '../components/ClayButton'

export default function LanguageSelectPage() {
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguageStore()
  const [selected, setSelected] = useState(language || 'hi')

  const handleContinue = () => {
    if (!selected) return
    setLanguage(selected)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#FDF6EE] via-[#F8EFE3] to-[#F2E5D5]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl flex flex-col items-center text-center"
      >
        {/* Top Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-clay-primary to-orange-600 flex items-center justify-center text-white shadow-xl shadow-clay-primary/30">
            <span className="text-3xl font-black font-heading">क</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-clay-indigo tracking-tight font-heading">
            Karigaar<span className="text-clay-primary">AI</span>
          </span>
        </div>

        {/* Illustrated SVG Line-art of Artisan Hands */}
        <div className="my-2 p-3 text-clay-primary">
          <svg
            width="120"
            height="70"
            viewBox="0 0 120 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md mx-auto"
          >
            {/* Stylized Pottery Wheel and Artisan Hands Outline */}
            <path
              d="M15 50C25 35 40 30 50 35C55 38 58 45 60 48C62 45 65 38 70 35C80 30 95 35 105 50"
              stroke="#E8873A"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M35 55C45 50 55 48 60 48C65 48 75 50 85 55"
              stroke="#3D5A8A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="60" cy="22" r="12" fill="#F5C49A" stroke="#E8873A" strokeWidth="3" />
            <path
              d="M20 58C35 64 85 64 100 58"
              stroke="#8C7B6E"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Bilingual Heading */}
        <h1 className="text-3xl sm:text-4xl font-black text-clay-indigo font-heading mt-2">
          अपनी भाषा चुनें
        </h1>
        <p className="text-base sm:text-lg text-clay-muted font-medium mt-1 mb-8">
          Choose Your Language / अपनी पसंदीदा भाषा चुनें
        </p>

        {/* Language Grid: 2 columns, 3 rows */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 w-full mb-8">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code
            return (
              <ClayCard
                key={lang.code}
                variant={isSelected ? 'selected' : 'default'}
                onClick={() => setSelected(lang.code)}
                className={`p-4 sm:p-5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 ${
                  isSelected ? 'border-clay-primary scale-[1.03]' : ''
                }`}
              >
                <span className="text-2xl sm:text-3xl mb-1">{lang.flag}</span>
                <span className="text-xl sm:text-2xl font-black text-clay-indigo font-heading leading-tight">
                  {lang.native}
                </span>
                <span className="text-xs sm:text-sm text-clay-muted font-semibold tracking-wide">
                  {lang.label}
                </span>
              </ClayCard>
            )
          })}
        </div>

        {/* Continue Button */}
        <ClayButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
          onClick={handleContinue}
          icon={<ArrowRight weight="bold" size={22} />}
        >
          Continue → आगे बढ़ें
        </ClayButton>
      </motion.div>
    </div>
  )
}
