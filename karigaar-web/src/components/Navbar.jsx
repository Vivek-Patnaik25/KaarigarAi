import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  House, 
  Storefront, 
  Coins, 
  PlusCircle, 
  List, 
  X, 
  Translate 
} from '@phosphor-icons/react'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../store/languageStore'
import ClayButton from './ClayButton'

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguageStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { to: '/dashboard', label: t('nav_dashboard', 'Dashboard'), icon: <House size={20} /> },
    { to: '/dashboard#listings', label: t('my_listings'), icon: <Storefront size={20} /> },
    { to: '/dashboard#earnings', label: t('earnings'), icon: <Coins size={20} /> },
  ]

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 bg-clay-bg/90 backdrop-blur-md border-b border-white/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-clay-primary to-orange-600 flex items-center justify-center text-white shadow-lg shadow-clay-primary/30 group-hover:scale-105 transition-transform">
            <span className="text-2xl font-black font-heading">क</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-clay-indigo tracking-tight font-heading">
              Karigaar<span className="text-clay-primary">AI</span>
            </span>
            <span className="text-[10px] text-clay-muted -mt-1 font-semibold">
              कारीगर AI · Handloom & Craft
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-2xl font-heading font-bold text-sm flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-clay-surface text-clay-primary shadow-sm ring-1 ring-clay-primary/40'
                    : 'text-clay-text/80 hover:bg-clay-surface/60 hover:text-clay-indigo'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right side: Language Dropdown + Action */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative group">
            <button
              type="button"
              className="px-3.5 py-2 rounded-2xl bg-clay-surface hover:bg-clay-deep text-clay-indigo text-sm font-bold flex items-center gap-2 shadow-sm border border-white/50 transition-all"
            >
              <Translate size={18} className="text-clay-primary" />
              <span>{currentLangObj.flag} {currentLangObj.native}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 py-2 bg-clay-surface rounded-2xl shadow-2xl border border-white/70 hidden group-hover:block transition-all z-50">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full px-4 py-2 text-left text-sm font-heading flex items-center justify-between hover:bg-clay-primary-soft/40 transition-colors ${
                    language === lang.code ? 'font-black text-clay-primary bg-clay-primary-soft/20' : 'text-clay-text'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                  </span>
                  <span className="text-xs text-clay-muted uppercase">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>

          <ClayButton
            size="sm"
            variant="primary"
            icon={<PlusCircle weight="bold" size={18} />}
            onClick={() => navigate('/catalog')}
          >
            {t('add_new_product')}
          </ClayButton>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-clay-surface text-clay-indigo shadow-sm border border-white/50"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 bg-clay-surface rounded-3xl shadow-xl border border-white/60 flex flex-col gap-3 animate-fadeIn">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-2xl font-heading font-bold text-base flex items-center gap-3 text-clay-indigo hover:bg-clay-deep/50"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-clay-muted/20 pt-3">
            <span className="text-xs font-bold text-clay-muted uppercase tracking-wider block mb-2 px-2">
              भाषा बदलें / Select Language
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code)
                    setMobileMenuOpen(false)
                  }}
                  className={`p-2 rounded-xl text-sm font-heading font-bold flex items-center gap-2 ${
                    language === lang.code
                      ? 'bg-clay-primary text-white shadow-sm'
                      : 'bg-clay-bg text-clay-text hover:bg-clay-deep'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
