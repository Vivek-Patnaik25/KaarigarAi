import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User,
  Buildings,
  MapPin,
  Tag,
  ArrowsLeftRight,
  ShieldCheck,
  Storefront,
  EnvelopeSimple,
  Heart,
  Gear
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import { getStoredUser, getBuyerProfile, DEMO_BUYER } from '../config/auth'
import { useUserStore } from '../store/userStore'

export default function BuyerProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user: storeUser, switchToArtisan } = useUserStore()
  const user = (storeUser && storeUser.role === 'buyer') ? storeUser : getBuyerProfile()

  const handleSwitchToArtisan = () => {
    switchToArtisan()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-stone-bg flex flex-col pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="section-label mb-0.5">{t('buyer.profile_subtitle', 'Verified Organization')}</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink">
              {t('buyer.profile_title', 'Buyer & Procurement Profile')}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              {t('buyer.profile_desc', 'Your commercial organization details used when connecting with artisan workshops.')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/settings?tab=buyer')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded border border-stone-300 bg-white hover:bg-stone-50 text-[#1B2E6B] text-xs font-semibold transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Gear size={16} className="text-[#E8762B]" />
            <span>{t('settings.edit_profile', 'Edit Profile & Settings')}</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="clay-card p-6 sm:p-8 bg-white flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-[#1B2E6B] text-amber-400 flex items-center justify-center text-xl shrink-0 overflow-hidden border border-stone-200 shadow-2xs">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Buildings size={32} weight="fill" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="clay-badge clay-badge-neutral text-[10px]">
                    {user.buyerType || 'Premium Boutique & Retailer'}
                  </span>
                  <span className="clay-badge clay-badge-success text-[10px]">
                    {t('verified_buyer', 'Verified Commercial Buyer')}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-ink">
                  {user.buyerName || user.organizationName || user.name || 'Parampara Heritage Retail & Living'}
                </h2>
                <p className="text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
                  <MapPin size={13} className="text-amber-acc" />
                  <span>{user.location || 'Mumbai, Maharashtra'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => navigate('/buyer/shortlist')}
                className="clay-btn clay-btn-ghost text-xs flex items-center gap-1.5"
              >
                <Heart size={14} className="text-rose-400" />
                <span>{t('shortlist.title', 'Saved Items')}</span>
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded bg-stone-50 border border-stone-200">
              <span className="text-[10px] text-ink-faint block uppercase font-medium mb-1">
                {t('buyer.contact_person', 'Contact Name')}
              </span>
              <span className="text-sm font-semibold text-ink">
                {user.name || 'Ananya Sharma'}
              </span>
            </div>

            <div className="p-3.5 rounded bg-stone-50 border border-stone-200">
              <span className="text-[10px] text-ink-faint block uppercase font-medium mb-1">
                {t('login.phone', 'Registered Phone')}
              </span>
              <span className="text-sm font-semibold text-ink font-mono">
                {user.phone ? `+91 ${user.phone}` : '+91 9876543211'}
              </span>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded bg-stone-50 border border-stone-200">
              <span className="text-[10px] text-ink-faint block uppercase font-medium mb-1">
                {t('buyer.sourcing_categories', 'Procurement & Craft Interests')}
              </span>
              <p className="text-xs text-ink-soft leading-relaxed">
                {user.interests || 'Handmade terracotta cookware, certified Banarasi handloom silks, blue pottery studio ware, and wooden home decor.'}
              </p>
            </div>
          </div>

          {/* Switch Experience Banner */}
          <div className="p-4 rounded-lg bg-amber-soft border border-amber-acc/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs mb-0.5">
                <Storefront size={15} />
                <span>{t('role_artisan_switch_heading', 'Are you an artisan or maker?')}</span>
              </div>
              <p className="text-[11px] text-ink-soft">
                {t('role_artisan_switch_sub', 'Switch to the Artisan Workshop experience to photograph products and manage your catalogue.')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSwitchToArtisan}
              className="clay-btn clay-btn-primary flex items-center gap-1.5 text-xs shrink-0 self-start sm:self-auto"
            >
              <ArrowsLeftRight size={14} />
              <span>{t('switch_to_artisan', 'Switch to Artisan Mode')}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
