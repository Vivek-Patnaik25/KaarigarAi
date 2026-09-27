import React from 'react'
import { useTranslation } from 'react-i18next'
import { 
  SealCheck, 
  ShieldCheck,
  MapPin, 
  Wrench, 
  ClockCounterClockwise, 
  IdentificationBadge, 
  Sparkle,
  QrCode,
  GlobeHemisphereWest
} from '@phosphor-icons/react'

export const DEFAULT_ARTISAN_PROFILE = {
  name: 'रामेश्वर प्रजापति (Rameshwar Prajapati)',
  craftType: 'मिट्टी और टेराकोटा (Terracotta & Pottery)',
  region: 'जयपुर, राजस्थान (Jaipur, Rajasthan)',
  yearsActive: '18 वर्ष (18 Years)',
  artisanId: 'KG-2024-8921',
  totalListings: 24,
  totalSales: 186,
  languages: ['हिन्दी (Hindi)', 'English', 'मारवाड़ी (Marwari)'],
  avatarUrl: '/artisan_avatar.png',
  qrUrl: 'https://karigaar.ai/passport/KG-2024-8921'
}

// Helper to parse bilingual name format "Native (English)" into primary & secondary
const parseName = (rawName) => {
  if (!rawName) return { primary: 'रामेश्वर प्रजापति', secondary: 'Rameshwar Prajapati' }
  const match = String(rawName).match(/^(.*?)\s*\((.*?)\)$/)
  if (match) {
    return {
      primary: match[1].trim(),
      secondary: match[2].trim()
    }
  }
  return { primary: rawName, secondary: null }
}

const formatCraftType = (craft) => {
  if (!craft) return 'Handicraft'
  if (craft.toLowerCase() === 'pottery terracotta' || craft.toLowerCase() === 'pottery_terracotta') {
    return 'मिट्टी और टेराकोटा (Pottery & Terracotta)'
  }
  return craft.replace(/_/g, ' ')
}

export default function PassportCard({ profile = DEFAULT_ARTISAN_PROFILE, className = '' }) {
  const { t } = useTranslation()
  const p = { ...DEFAULT_ARTISAN_PROFILE, ...profile }
  const parsedName = parseName(p.name)

  const hasGi = Boolean(
    p.hasGi ||
    p.has_gi_tag ||
    p.is_gi_certified ||
    p.gi_certified ||
    p.craftType?.toLowerCase().includes('terracotta') ||
    p.craftType?.toLowerCase().includes('pottery') ||
    p.region?.toLowerCase().includes('rajasthan')
  )

  return (
    <div className={`w-full max-w-xl mx-auto p-6 bg-white border border-stone-200 rounded-lg shadow-sm relative overflow-hidden ${className}`}>
      {/* Subtle Corner Motif */}
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-5">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-stone-900 w-full h-full">
          <circle cx="100" cy="0" r="80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="100" cy="0" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Card Header Strip: Government & Craft Certification Aesthetic */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-stone-900 flex items-center justify-center text-amber-400 shrink-0">
            <IdentificationBadge size={20} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                GOVT. RECOGNIZED
              </span>
            </div>
            <h2 className="text-base font-semibold text-stone-900 tracking-tight leading-tight">
              {t('passport.title', 'Artisan Digital Passport')}
            </h2>
          </div>
        </div>

        {/* Verified Seal & Shilp Samagam Badge */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
            <SealCheck size={16} weight="fill" className="text-emerald-700" />
            <span className="text-[11px] font-semibold tracking-wide">
              {t('passport.verified', 'Verified Workshop')}
            </span>
          </div>

          {hasGi && (
            <div 
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold text-white shadow-2xs"
              style={{ backgroundColor: '#15803D' }}
            >
              <ShieldCheck size={12} weight="fill" className="text-white shrink-0" />
              <span>🏛️ Shilp Samagam 2025 Certified Artisan</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Body: Avatar, Name, and Vital Details */}
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-6">
        {/* Avatar Container */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded border border-stone-200 p-1 bg-stone-50">
            <img
              src={p.avatarUrl}
              alt={parsedName.primary}
              className="w-full h-full object-cover rounded bg-stone-100"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
              }}
            />
          </div>
        </div>

        {/* Artisan Info */}
        <div className="flex-1 text-center sm:text-left">
          {/* Elegant Bilingual Name Presentation */}
          <div className="mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              {parsedName.primary}
            </h1>
            {parsedName.secondary && (
              <p className="text-xs sm:text-sm font-medium text-stone-500 mt-0.5 tracking-wide">
                {parsedName.secondary}
              </p>
            )}
          </div>

          {/* Unique ID Badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-stone-100 border border-stone-200 mb-3">
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
              {t('passport.artisanId', 'Artisan ID')}:
            </span>
            <span className="font-mono text-xs font-semibold text-stone-900 tracking-wider">
              {p.artisanId}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-800">
            <div className="flex items-start gap-2 p-2.5 rounded bg-stone-50 border border-stone-200">
              <Wrench size={15} className="text-stone-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] text-stone-500 block uppercase font-semibold">
                  {t('passport.craftType', 'Craft Specialization')}
                </span>
                <span className="font-medium text-stone-900 leading-snug break-words">
                  {formatCraftType(p.craftType)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded bg-stone-50 border border-stone-200">
              <MapPin size={15} className="text-stone-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] text-stone-500 block uppercase font-semibold">
                  {t('passport.region', 'Heritage Region')}
                </span>
                <span className="font-medium text-stone-900 leading-snug break-words">
                  {p.region}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded bg-stone-50 border border-stone-200">
              <ClockCounterClockwise size={15} className="text-stone-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] text-stone-500 block uppercase font-semibold">
                  {t('passport.yearsActive', 'Years of Practice')}
                </span>
                <span className="font-medium text-stone-900 leading-snug break-words">
                  {p.yearsActive}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded bg-stone-50 border border-stone-200">
              <GlobeHemisphereWest size={15} className="text-stone-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] text-stone-500 block uppercase font-semibold">
                  {t('passport.languages', 'Languages Spoken')}
                </span>
                <span className="font-medium text-stone-900 leading-snug break-words">
                  {Array.isArray(p.languages) ? p.languages.join(', ') : p.languages}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section: Stats & QR Verification Code */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200 bg-stone-50/70 -mx-6 -mb-6 p-4">
        {/* Metric Badges */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-around sm:justify-start">
          <div className="text-center sm:text-left">
            <span className="block text-base font-semibold font-mono text-stone-900">
              {p.totalListings}
            </span>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
              {t('passport.totalListings', 'Listings')}
            </span>
          </div>

          <div className="h-6 w-px bg-stone-300" />

          <div className="text-center sm:text-left">
            <span className="block text-base font-semibold font-mono text-emerald-700">
              {p.totalSales}+
            </span>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
              {t('passport.totalSales', 'Items Sold')}
            </span>
          </div>

          <div className="h-6 w-px bg-stone-300" />

          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1 text-sm font-semibold font-mono text-amber-700">
              ★ 4.9
            </span>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
              {t('screen.high')}
            </span>
          </div>
        </div>

        {/* QR Code Container with ID & Karigaar Seal */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-white px-2.5 py-1.5 rounded border border-stone-200 shadow-2xs">
            <div
              id="passport-qr"
              className="w-12 h-12 bg-white flex items-center justify-center border border-stone-200 rounded p-1 relative"
              title={`QR to ${p.qrUrl}`}
            >
              <svg viewBox="0 0 33 33" className="w-full h-full text-stone-800" fill="currentColor">
                {/* Corner 1 */}
                <rect x="0" y="0" width="9" height="9" rx="1" />
                <rect x="2" y="2" width="5" height="5" fill="white" />
                <rect x="3.5" y="3.5" width="2" height="2" />
                {/* Corner 2 */}
                <rect x="24" y="0" width="9" height="9" rx="1" />
                <rect x="26" y="2" width="5" height="5" fill="white" />
                <rect x="27.5" y="3.5" width="2" height="2" />
                {/* Corner 3 */}
                <rect x="0" y="24" width="9" height="9" rx="1" />
                <rect x="2" y="26" width="5" height="5" fill="white" />
                <rect x="3.5" y="27.5" width="2" height="2" />
                {/* Data matrix dots */}
                <rect x="12" y="2" width="2" height="2" />
                <rect x="16" y="2" width="2" height="2" />
                <rect x="19" y="2" width="2" height="2" />
                <rect x="12" y="6" width="2" height="2" />
                <rect x="18" y="7" width="2" height="2" />
                <rect x="14" y="10" width="2" height="2" />
                <rect x="17" y="12" width="2" height="2" />
                <rect x="4" y="12" width="2" height="2" />
                <rect x="7" y="14" width="2" height="2" />
                <rect x="11" y="14" width="2" height="2" />
                <rect x="2" y="17" width="2" height="2" />
                <rect x="14" y="17" width="4" height="2" />
                <rect x="22" y="13" width="2" height="2" />
                <rect x="26" y="15" width="2" height="2" />
                <rect x="30" y="13" width="2" height="2" />
                <rect x="12" y="22" width="2" height="2" />
                <rect x="16" y="25" width="2" height="2" />
                <rect x="12" y="28" width="2" height="2" />
                <rect x="20" y="22" width="2" height="2" />
                <rect x="24" y="24" width="2" height="2" />
                <rect x="27" y="27" width="2" height="2" />
                <rect x="23" y="29" width="3" height="2" />
              </svg>
            </div>
            <div className="text-[10px] leading-tight">
              <span className="font-semibold text-stone-900 block">
                {t('passport.scanToVerify', 'Scan to Verify')}
              </span>
              <span className="text-stone-500 font-mono text-[9px] block">
                {p.artisanId}
              </span>
              <span className="text-emerald-700 font-semibold text-[9px] block">
                ● {t('screen.verified')}
              </span>
            </div>
          </div>

          {/* Logo.png watermark seal: 60x60px, opacity 0.6 */}
          <img
            src="/logo.png"
            alt="KarigaarAI Seal"
            className="w-[60px] h-[60px] object-contain opacity-60 pointer-events-none select-none hidden sm:block"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/favicon_new.png'
            }}
          />
        </div>
      </div>
    </div>
  )
}
