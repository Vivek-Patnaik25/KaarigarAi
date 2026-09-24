import React from 'react'
import { useTranslation } from 'react-i18next'
import { 
  SealCheck, 
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
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  qrUrl: 'https://karigaar.ai/passport/KG-2024-8921'
}

export default function PassportCard({ profile = DEFAULT_ARTISAN_PROFILE, className = '' }) {
  const { t } = useTranslation()
  const p = { ...DEFAULT_ARTISAN_PROFILE, ...profile }

  return (
    <div className={`passport-card passport-card-print-target w-full max-w-xl mx-auto p-5 sm:p-7 relative ${className}`}>
      {/* Decorative Traditional Craft Watermark Background */}
      <svg
        className="passport-watermark"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="45" stroke="#E8873A" strokeWidth="2" fill="none" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="35" stroke="#3D5A8A" strokeWidth="1.5" fill="none" />
        <path d="M50 10 L55 35 L80 30 L60 50 L80 70 L55 65 L50 90 L45 65 L20 70 L40 50 L20 30 L45 35 Z" fill="#E8873A" opacity="0.3" />
      </svg>

      {/* Card Header Strip: Government & Craft Certification Aesthetic */}
      <div className="flex items-center justify-between border-b-2 border-clay-primary/30 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
            <IdentificationBadge size={22} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-clay-primary bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60">
                OFFICIAL IDENTITY
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-clay-muted">
                INDIA CRAFT MARK
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-clay-indigo font-heading tracking-tight leading-tight">
              {t('passport.title', 'Artisan Digital Passport')}
            </h2>
          </div>
        </div>

        {/* Verified Seal Emblem */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-sm shrink-0">
          <SealCheck size={18} weight="fill" className="text-emerald-600" />
          <span className="text-[11px] sm:text-xs font-black tracking-wide">
            {t('passport.verified', 'Govt. Recognized')}
          </span>
        </div>
      </div>

      {/* Main Body: Avatar, Name, and Vital Details */}
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-6">
        {/* Avatar Container */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-orange-400 via-amber-200 to-indigo-500 shadow-lg">
            <img
              src={p.avatarUrl}
              alt={p.name}
              className="w-full h-full object-cover rounded-full border-2 border-white bg-amber-50"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
              }}
            />
          </div>
          <div 
            className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-white shadow-md border-2 border-white"
            title="Master Artisan"
          >
            <Sparkle size={14} weight="fill" />
          </div>
        </div>

        {/* Artisan Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-black text-clay-text font-heading leading-tight">
              {p.name}
            </h1>
          </div>

          {/* Unique ID Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border border-slate-300 shadow-inner mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('passport.artisanId', 'Artisan ID')}:
            </span>
            <span className="font-mono text-xs sm:text-sm font-black text-clay-indigo tracking-wider">
              {p.artisanId}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-clay-text">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-amber-200/50 shadow-sm">
              <Wrench size={16} className="text-orange-600 shrink-0" />
              <div>
                <span className="text-[10px] text-clay-muted block uppercase font-bold">
                  {t('passport.craftType', 'Craft Specialization')}
                </span>
                <span className="font-bold text-clay-indigo leading-snug">
                  {p.craftType}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-amber-200/50 shadow-sm">
              <MapPin size={16} className="text-rose-600 shrink-0" />
              <div>
                <span className="text-[10px] text-clay-muted block uppercase font-bold">
                  {t('passport.region', 'Heritage Region')}
                </span>
                <span className="font-bold text-clay-indigo leading-snug">
                  {p.region}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-amber-200/50 shadow-sm">
              <ClockCounterClockwise size={16} className="text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] text-clay-muted block uppercase font-bold">
                  {t('passport.yearsActive', 'Years of Practice')}
                </span>
                <span className="font-bold text-clay-indigo leading-snug">
                  {p.yearsActive}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-amber-200/50 shadow-sm">
              <GlobeHemisphereWest size={16} className="text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-clay-muted block uppercase font-bold">
                  Languages Spoken
                </span>
                <span className="font-bold text-clay-indigo leading-snug truncate">
                  {Array.isArray(p.languages) ? p.languages.join(', ') : p.languages}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section: Stats & QR Verification Code */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-clay-muted/20 bg-amber-50/50 -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 p-5 rounded-b-[26px]">
        {/* Metric Badges */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-around sm:justify-start">
          <div className="text-center sm:text-left">
            <span className="block text-lg font-black text-clay-indigo font-heading">
              {p.totalListings}
            </span>
            <span className="text-[11px] font-bold text-clay-muted uppercase">
              {t('passport.totalListings', 'Listings')}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-clay-muted/20" />

          <div className="text-center sm:text-left">
            <span className="block text-lg font-black text-emerald-700 font-heading">
              {p.totalSales}+
            </span>
            <span className="text-[11px] font-bold text-clay-muted uppercase">
              {t('passport.totalSales', 'Items Sold')}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-clay-muted/20" />

          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1 text-sm font-black text-amber-600 font-heading">
              ★ 4.9
            </span>
            <span className="text-[11px] font-bold text-clay-muted uppercase block">
              Buyer Rating
            </span>
          </div>
        </div>

        {/* QR Code Container with ID */}
        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-2xl border border-clay-muted/25 shadow-sm shrink-0">
          {/* Authentic Clean SVG QR Code Representation */}
          <div 
            id="passport-qr" 
            className="w-14 h-14 bg-white flex items-center justify-center border border-slate-200 rounded-lg p-1 relative"
            title={`QR to ${p.qrUrl}`}
          >
            <svg viewBox="0 0 33 33" className="w-full h-full text-slate-800" fill="currentColor">
              {/* Corner 1 */}
              <rect x="0" y="0" width="9" height="9" rx="1.5" />
              <rect x="2" y="2" width="5" height="5" fill="white" />
              <rect x="3.5" y="3.5" width="2" height="2" />
              {/* Corner 2 */}
              <rect x="24" y="0" width="9" height="9" rx="1.5" />
              <rect x="26" y="2" width="5" height="5" fill="white" />
              <rect x="27.5" y="3.5" width="2" height="2" />
              {/* Corner 3 */}
              <rect x="0" y="24" width="9" height="9" rx="1.5" />
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
            <span className="font-bold text-clay-indigo block">
              {t('passport.scanToVerify', 'Scan to Verify')}
            </span>
            <span className="text-slate-500 font-mono text-[9px] block">
              {p.artisanId}
            </span>
            <span className="text-emerald-700 font-semibold text-[9px] block">
              ● Official Record
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
