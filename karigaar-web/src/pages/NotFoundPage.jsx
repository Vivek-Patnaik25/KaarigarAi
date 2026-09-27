import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { House, ArrowLeft } from '@phosphor-icons/react'
import ClayButton from '../components/ClayButton'

export default function NotFoundPage({ title, description }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md clay-card p-8 sm:p-10 flex flex-col items-center gap-5 shadow-md">
        {/* 100x100px Centered Logo.png */}
        <div className="w-[100px] h-[100px] rounded-2xl bg-white shadow-xs border border-stone-200/80 p-2 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="KarigaarAI"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/favicon_new.png'
            }}
          />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-[#E8762B] uppercase tracking-wider block mb-1">
            404 • {t('page_not_found', 'Page Not Found')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B2E6B] mb-2">
            {title || t('page_not_found', 'Page Not Found')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
            {description || t('page_not_found_desc', 'The craft page or catalogue resource you are looking for does not exist or has been moved.')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="clay-btn clay-btn-ghost w-full sm:flex-1 text-xs flex items-center justify-center gap-1.5"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft size={15} />
            <span>{t('back', 'Go Back')}</span>
          </button>

          <Link
            to="/dashboard"
            className="clay-btn clay-btn-primary w-full sm:flex-1 text-xs flex items-center justify-center gap-1.5"
            style={{ minHeight: '44px' }}
          >
            <House size={15} />
            <span>{t('dashboard.title', 'Dashboard')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
