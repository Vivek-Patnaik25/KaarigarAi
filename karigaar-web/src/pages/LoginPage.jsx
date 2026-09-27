import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeSlash, ArrowRight, Storefront, ShoppingBag, CheckCircle } from '@phosphor-icons/react'
import { DEMO_ARTISAN, DEMO_BUYER } from '../config/auth'
import { useUserStore } from '../store/userStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setUser } = useUserStore()

  const [activeRole, setActiveRole] = useState('artisan') // 'artisan' | 'buyer'
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleChange = (role) => {
    setActiveRole(role)
    setError('')
    setPhone('')
    setPin('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!phone || !pin) {
      setError(t('login.missing_fields', 'Please enter your phone number and PIN.'))
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)

    if (activeRole === 'artisan') {
      if (phone === DEMO_ARTISAN.phone && pin === DEMO_ARTISAN.pin) {
        setUser(DEMO_ARTISAN)
        const savedLang = localStorage.getItem('karigaar_lang')
        navigate(savedLang ? '/dashboard' : '/language-select', { replace: true })
      } else {
        setError(t('login.invalid', 'Invalid credentials. Please try again.'))
      }
    } else {
      if (phone === DEMO_BUYER.phone && pin === DEMO_BUYER.pin) {
        setUser(DEMO_BUYER)
        const savedLang = localStorage.getItem('karigaar_lang')
        navigate(savedLang ? '/buyer/discover' : '/language-select', { replace: true })
      } else {
        setError(t('login.invalid', 'Invalid credentials. Please try again.'))
      }
    }
  }

  const handleQuickLogin = (role) => {
    if (role === 'artisan') {
      setUser(DEMO_ARTISAN)
      const savedLang = localStorage.getItem('karigaar_lang')
      navigate(savedLang ? '/dashboard' : '/language-select', { replace: true })
    } else {
      setUser(DEMO_BUYER)
      const savedLang = localStorage.getItem('karigaar_lang')
      navigate(savedLang ? '/buyer/discover' : '/language-select', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-stone-bg flex">
      {/* ── Left panel — visible on desktop ─────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
        style={{ background: '#1B2E6B' }}
      >
        {/* Subtle grid texture */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          viewBox="0 0 400 700"
          fill="none"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 35} x2="400" y2={i * 35} stroke="white" strokeWidth="1" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 35} y1="0" x2={i * 35} y2="700" stroke="white" strokeWidth="1" />
          ))}
        </svg>

        {/* Logo & Headline */}
        <div className="relative z-10">
          <div className="flex flex-col items-start gap-4 mb-8">
            <div className="w-[120px] h-[120px] rounded-2xl bg-white/10 p-2.5 backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center">
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
            <span className="text-white text-2xl font-bold tracking-tight">
              Karigaar<span className="text-[#E8762B]">AI</span>
            </span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-semibold text-white leading-snug mb-5">
            {t('login.hero', 'Your craft,\nyour catalogue,\nyour price.')}
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed max-w-sm mb-8">
            {t('login.sub', 'AI-powered multilingual catalogue for Indian artisans. Direct access to curated retail and wholesale buyers.')}
          </p>

          {/* Two role features showcase */}
          <div className="grid grid-cols-1 gap-3 max-w-sm">
            <div className={`p-3.5 rounded border transition-colors ${activeRole === 'artisan' ? 'border-[#E8762B]/60 bg-white/10' : 'border-white/10 bg-transparent'}`}>
              <div className="flex items-center gap-2 text-white font-medium text-xs mb-1">
                <Storefront size={15} className="text-[#E8762B]" />
                <span>{t('role_artisan', 'Artisan Experience')}</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {t('login.artisan_desc', 'Photograph your handmade creations, generate multi-lingual listings, and receive verified buyer requests.')}
              </p>
            </div>

            <div className={`p-3.5 rounded border transition-colors ${activeRole === 'buyer' ? 'border-[#E8762B]/60 bg-white/10' : 'border-white/10 bg-transparent'}`}>
              <div className="flex items-center gap-2 text-white font-medium text-xs mb-1">
                <ShoppingBag size={15} className="text-[#E8762B]" />
                <span>{t('role_buyer', 'Buyer Experience')}</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {t('login.buyer_desc', 'Discover authentic craft products direct from Indian master artisans. Compare, shortlist, and request custom proposals.')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom credential hint */}
        <div className="relative z-10 border border-stone-deep/20 rounded p-4 text-xs text-ink-muted flex items-center justify-between">
          <div>
            <p className="font-medium text-stone-border mb-0.5">
              {t('login.demo_mode', 'Demo Environments Active')}
            </p>
            <p className="text-[11px] text-ink-faint">
              {t('login.demo_switch_note', 'Switch freely between Artisan and Buyer roles at any time.')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — login form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <img
              src="/logo_transparent.png"
              alt="KarigaarAI"
              className="w-8 h-8 rounded object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/favicon.png'
              }}
            />
            <span className="text-ink text-base font-semibold">
              Karigaar<span className="text-amber-acc">AI</span>
            </span>
          </div>

          <h2 className="text-xl font-semibold text-ink mb-1">
            {t('login.title', 'Sign in to KarigaarAI')}
          </h2>
          <p className="text-sm text-ink-muted mb-5">
            {t('login.subtitle_role', 'Select your profile to continue')}
          </p>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/60 rounded mb-5">
            <button
              type="button"
              onClick={() => handleRoleChange('artisan')}
              className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                activeRole === 'artisan'
                  ? 'bg-white text-ink shadow-2xs font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Storefront size={14} weight={activeRole === 'artisan' ? 'bold' : 'regular'} />
              <span>{t('role_artisan', 'Artisan')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('buyer')}
              className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                activeRole === 'buyer'
                  ? 'bg-white text-ink shadow-2xs font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <ShoppingBag size={14} weight={activeRole === 'buyer' ? 'bold' : 'regular'} />
              <span>{t('role_buyer', 'Buyer / Retailer')}</span>
            </button>
          </div>

          {/* Direct Continue Button (1-click Demo Entry) */}
          <button
            type="button"
            onClick={() => handleQuickLogin(activeRole)}
            className="clay-btn clay-btn-primary w-full flex items-center justify-center gap-2 mb-4"
            style={{ minHeight: '46px' }}
          >
            <span>
              {activeRole === 'artisan'
                ? t('login.continue_artisan', 'Continue as Artisan')
                : t('login.continue_buyer', 'Continue as Buyer')}
            </span>
            <ArrowRight size={15} weight="bold" />
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-stone-deep" />
            <span className="text-[11px] text-ink-faint uppercase tracking-wider">{t('login.or_credentials', 'or sign in with PIN')}</span>
            <div className="flex-1 border-t border-stone-deep" />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="section-label block mb-1">
                {t('login.phone', 'Phone number')}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={activeRole === 'artisan' ? '9876543210' : '9876543211'}
                className="clay-input"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="section-label block mb-1">
                {t('login.pin', 'PIN')}
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="1234"
                  className="clay-input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                  aria-label="Toggle PIN visibility"
                >
                  {showPin ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rust bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="clay-btn clay-btn-ghost w-full flex items-center justify-center gap-2 mt-1 text-xs"
              style={{ minHeight: '40px' }}
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{t('login.cta', 'Sign in')}</span>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
