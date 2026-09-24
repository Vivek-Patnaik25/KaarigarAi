import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkle, ArrowSquareOut, X } from '@phosphor-icons/react'

export const GI_TAG_MAP = {
  pottery_terracotta: {
    name: 'Blue Pottery of Jaipur',
    premium: '30–40%',
    learnUrl: 'https://ipindia.gov.in',
  },
  textile_handloom: {
    name: 'Pochampally Ikat / Chanderi / Applicable regional GI',
    premium: '20–35%',
    learnUrl: 'https://ipindia.gov.in',
  },
  textile_embroidery: {
    name: 'Chikankari / Kantha / Phulkari',
    premium: '25–40%',
    learnUrl: 'https://ipindia.gov.in',
  },
  woodcraft: {
    name: 'Channapatna Toys / Saharanpur Wood Craft',
    premium: '15–25%',
    learnUrl: 'https://ipindia.gov.in',
  },
  painting_folk: {
    name: 'Madhubani / Warli / Pattachitra',
    premium: '20–45%',
    learnUrl: 'https://ipindia.gov.in',
  },
  metalcraft: {
    name: 'Bidriware / Dhokra',
    premium: '20–30%',
    learnUrl: 'https://ipindia.gov.in',
  },
  jewellery: {
    name: 'Kundan / Meenakari',
    premium: '15–25%',
    learnUrl: 'https://ipindia.gov.in',
  },
}

export default function GITagBanner({ detectedCategory = 'pottery_terracotta' }) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible || !detectedCategory) {
    return null
  }

  // Normalize category key
  const normalizedKey = detectedCategory.toLowerCase().trim().replace(/[\s-]/g, '_')
  const giInfo = GI_TAG_MAP[normalizedKey] || (
    // Check for substring match if exact key isn't found
    Object.keys(GI_TAG_MAP).find((k) => normalizedKey.includes(k) || k.includes(normalizedKey))
      ? GI_TAG_MAP[Object.keys(GI_TAG_MAP).find((k) => normalizedKey.includes(k) || k.includes(normalizedKey))]
      : null
  )

  if (!giInfo) {
    return null
  }

  return (
    <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-400/15 border-2 border-amber-400/60 shadow-md relative overflow-hidden transition-all my-1">
      {/* Decorative side accent */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 to-orange-500" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2">
        {/* Left icon and message */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Sparkle size={18} weight="fill" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-400/50">
                GI Tag Opportunity 🇮🇳
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-amber-950 leading-snug line-clamp-2">
              {t('gi.banner.text', {
                giName: giInfo.name,
                premium: giInfo.premium,
                defaultValue: `Your craft may qualify for the ${giInfo.name} GI Tag. GI-certified products sell for ${giInfo.premium} more. Tap to learn how to apply.`
              })}
            </p>
          </div>
        </div>

        {/* Right actions: Learn More and Dismiss */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-amber-300/40">
          <a
            href={giInfo.learnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-heading shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <span>{t('gi.learn_more', 'Learn How to Apply')}</span>
            <ArrowSquareOut size={14} weight="bold" />
          </a>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/60 hover:text-amber-950 transition-colors"
            title={t('dismiss', 'Dismiss')}
            aria-label="Dismiss GI notification"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
