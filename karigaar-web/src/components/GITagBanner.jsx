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
    <div className="w-full p-3.5 sm:p-4 rounded-md bg-amber-50/80 border border-amber-200 text-stone-900 shadow-xs relative overflow-hidden transition-all my-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left icon and message */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkle size={15} weight="bold" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                GI Tag Opportunity 🇮🇳
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-amber-950 leading-snug">
              {t('gi.banner.text', {
                giName: giInfo.name,
                premium: giInfo.premium,
                defaultValue: `Your craft may qualify for the ${giInfo.name} GI Tag. GI-certified products sell for ${giInfo.premium} more. Tap to learn how to apply.`
              })}
            </p>
          </div>
        </div>

        {/* Right actions: Learn More and Dismiss */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200">
          <a
            href={giInfo.learnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <span>{t('gi.learn_more', 'Learn How to Apply')}</span>
            <ArrowSquareOut size={13} weight="bold" />
          </a>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1 rounded text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors cursor-pointer"
            title={t('dismiss', 'Dismiss')}
            aria-label="Dismiss GI notification"
          >
            <X size={15} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
