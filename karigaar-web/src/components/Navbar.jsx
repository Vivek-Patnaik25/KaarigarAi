import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  House,
  Storefront,
  PlusCircle,
  Translate,
  SignOut,
  List,
  X,
  Compass,
  Heart,
  EnvelopeSimple,
  User,
  ArrowsLeftRight,
  Briefcase,
  IdentificationBadge,
  Gear
} from '@phosphor-icons/react'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../store/languageStore'
import { useUserStore } from '../store/userStore'
import { useCatalogStore } from '../store/catalogStore'
import { getShortlist } from '../config/auth'

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguageStore()
  const { role, user, switchToArtisan, switchToBuyer, logout } = useUserStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [shortlistCount, setShortlistCount] = useState(0)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    const updateCount = () => {
      setShortlistCount(getShortlist().length)
    }
    updateCount()
    window.addEventListener('karigaar_shortlist_changed', updateCount)
    return () => window.removeEventListener('karigaar_shortlist_changed', updateCount)
  }, [])

  const isArtisan = role === 'artisan'

  const artisanLinks = [
    { to: '/dashboard', label: t('nav_dashboard', 'Dashboard'), icon: <House size={16} /> },
    { to: '/artisan/products', label: t('nav_my_products', 'My Products'), icon: <Storefront size={16} /> },
    { to: '/artisan/opportunities', label: t('nav_opportunities', 'Buyer Opportunities'), icon: <Briefcase size={16} /> },
    { to: '/passport/KG-2024-8921', label: t('nav_passport', 'Passport'), icon: <IdentificationBadge size={16} /> },
    { to: '/settings?tab=artisan', label: t('nav_settings', 'Settings'), icon: <Gear size={16} /> },
  ]

  const buyerLinks = [
    { to: '/buyer/discover', label: t('nav_discover', 'Discover'), icon: <Compass size={16} /> },
    { to: '/buyer/shortlist', label: t('nav_shortlist', 'Shortlist'), icon: <Heart size={16} />, badge: shortlistCount },
    { to: '/buyer/requests', label: t('nav_requests', 'My Requests'), icon: <EnvelopeSimple size={16} /> },
    { to: '/buyer/profile', label: t('nav_buyer_profile', 'Profile'), icon: <User size={16} /> },
    { to: '/settings?tab=buyer', label: t('nav_settings', 'Settings'), icon: <Gear size={16} /> },
  ]

  const navLinks = isArtisan ? artisanLinks : buyerLinks

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/artisan/dashboard'
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const handleSwitchRole = (targetRole) => {
    setRoleOpen(false)
    setMobileMenuOpen(false)
    if (targetRole === 'artisan') {
      switchToArtisan()
      navigate('/dashboard')
    } else {
      switchToBuyer()
      navigate('/buyer/discover')
    }
  }

  return (
    <>
      {/* ── Top Navbar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[#1B2E6B] border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">

          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              to={isArtisan ? '/dashboard' : '/buyer/discover'}
              className="flex items-center gap-2.5 shrink-0"
            >
              <div className="w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-white/20">
                {!logoError ? (
                  <img
                    src="/favicon_new.png"
                    alt="KarigaarAI"
                    className="w-[26px] h-[26px] object-contain shrink-0"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-[#E8762B] font-bold text-[22px] leading-none select-none">k</span>
                )}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white text-[15px] font-bold tracking-tight">
                  Karigaar<span className="text-[#E8762B]">AI</span>
                </span>
                <span className="text-stone-300 text-[9px] tracking-wider uppercase font-medium mt-0.5">
                  {isArtisan ? t('role_artisan_mode', 'Artisan Studio') : t('role_buyer_mode', 'Buyer Discovery')}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link relative ${isActive(item.to) ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#E8762B] text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Side Utilities */}
          <div className="hidden md:flex items-center gap-2">
            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleOpen(!roleOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors cursor-pointer shadow-2xs"
                title={t('switch_role_tooltip', 'Switch experience')}
              >
                <ArrowsLeftRight size={13} className="text-[#E8762B]" />
                <span>{isArtisan ? t('role_artisan', 'Artisan') : t('role_buyer', 'Buyer')}</span>
              </button>

              {roleOpen && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-50 animate-fadeIn"
                  onBlur={() => setRoleOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => handleSwitchRole('artisan')}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                      isArtisan ? 'text-[#1B2E6B] font-semibold bg-blue-50' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Storefront size={14} />
                      <span>{t('switch_to_artisan', 'Artisan Workshop')}</span>
                    </span>
                    {isArtisan && <span className="text-[10px] uppercase font-bold text-[#E8762B]">Active</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchRole('buyer')}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                      !isArtisan ? 'text-[#1B2E6B] font-semibold bg-blue-50' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Compass size={14} />
                      <span>{t('switch_to_buyer', 'Buyer Discovery')}</span>
                    </span>
                    {!isArtisan && <span className="text-[10px] uppercase font-bold text-[#E8762B]">Active</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Language Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white hover:bg-white/15 text-sm transition-colors border border-white/20 bg-white/10 shadow-2xs cursor-pointer"
              >
                <Translate size={15} />
                <span className="text-xs">{currentLangObj.flag} {currentLangObj.native}</span>
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 mt-1 w-44 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-50"
                  onBlur={() => setLangOpen(false)}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => { setLanguage(lang.code); setLangOpen(false) }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                        language === lang.code
                          ? 'text-[#E8762B] font-semibold bg-orange-50'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                        {lang.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Artisan: Add Product CTA | Buyer: Browse / Shortlist */}
            {isArtisan ? (
              <button
                type="button"
                onClick={() => {
                  useCatalogStore.getState().reset()
                  navigate('/catalog?new=true')
                }}
                className="clay-btn clay-btn-primary flex items-center gap-1.5 text-xs px-3.5 py-1.5 min-h-0 text-white shadow-xs font-medium cursor-pointer"
                style={{ minHeight: '36px', borderRadius: '8px', fontSize: '13px', backgroundColor: '#E8762B' }}
              >
                <PlusCircle size={15} weight="bold" />
                <span>{t('add_new_product', 'Add Product')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/buyer/shortlist')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 transition-colors shadow-2xs cursor-pointer"
                style={{ minHeight: '36px' }}
              >
                <Heart size={15} weight={shortlistCount > 0 ? 'fill' : 'regular'} className={shortlistCount > 0 ? 'text-[#E8762B]' : 'text-stone-300'} />
                <span>{t('shortlist_label', 'Shortlist')}</span>
                {shortlistCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#E8762B] text-white text-[10px] font-bold">
                    {shortlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Settings Quick Access */}
            <button
              type="button"
              onClick={() => navigate(isArtisan ? '/settings?tab=artisan' : '/settings?tab=buyer')}
              title={t('nav_settings', 'Settings')}
              className="p-2 rounded text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Gear size={16} />
            </button>

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleLogout}
              title={t('sign_out', 'Sign out')}
              className="p-2 rounded text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <SignOut size={16} />
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-white hover:bg-white/10 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1B2E6B] border-t border-white/10 px-4 py-3 flex flex-col gap-1 shadow-xl animate-fadeIn">
            {/* Role switch on mobile */}
            <div className="p-2.5 mb-2 bg-white/10 rounded border border-white/15 flex items-center justify-between">
              <span className="text-xs text-white font-medium">
                {isArtisan ? t('role_artisan', 'Artisan Workshop') : t('role_buyer', 'Buyer Discovery')}
              </span>
              <button
                type="button"
                onClick={() => handleSwitchRole(isArtisan ? 'buyer' : 'artisan')}
                className="text-xs text-[#E8762B] font-semibold hover:underline flex items-center gap-1"
              >
                <ArrowsLeftRight size={13} />
                <span>{isArtisan ? t('switch_to_buyer', 'Switch to Buyer') : t('switch_to_artisan', 'Switch to Artisan')}</span>
              </button>
            </div>

            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.2 rounded-full bg-[#E8762B] text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="border-t border-white/10 mt-2 pt-2">
              <p className="section-label text-stone-300 mb-2 px-3">
                {t('choose_language', 'Language')}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => { setLanguage(lang.code); setMobileMenuOpen(false) }}
                    className={`px-2 py-2 rounded text-xs flex flex-col items-center gap-0.5 transition-colors ${
                      language === lang.code
                        ? 'bg-[#E8762B] text-white font-semibold'
                        : 'text-white bg-white/10 hover:bg-white/15 border border-white/10'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                  </button>
                ))}
              </div>
            </div>

            {isArtisan && (
              <button
                type="button"
                onClick={() => {
                  useCatalogStore.getState().reset()
                  setMobileMenuOpen(false)
                  navigate('/catalog?new=true')
                }}
                className="clay-btn clay-btn-primary w-full mt-2 text-sm"
                style={{ backgroundColor: '#E8762B', minHeight: '44px' }}
              >
                <PlusCircle size={16} weight="bold" />
                {t('add_new_product', 'Add Product')}
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors mt-1"
            >
              <SignOut size={16} />
              <span>{t('sign_out', 'Sign Out')}</span>
            </button>
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation for high-priority role actions */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-30 bg-[#1B2E6B]/95 backdrop-blur-md border-t border-white/10 md:hidden flex items-center justify-around h-14 px-2 shadow-lg">
        {navLinks.map((item) => (
          <Link
            key={`mobile-bottom-${item.to}`}
            to={item.to}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded text-[11px] transition-colors ${
              isActive(item.to) ? 'text-white font-semibold' : 'text-stone-300 hover:text-white'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2.5 px-1 py-0.2 rounded-full bg-[#E8762B] text-white text-[9px] font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="mt-0.5 truncate max-w-[64px]">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Overlay to close popovers */}
      {(langOpen || roleOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setLangOpen(false); setRoleOpen(false) }}
        />
      )}
    </>
  )
}
