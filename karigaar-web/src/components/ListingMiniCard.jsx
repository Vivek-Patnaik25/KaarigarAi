import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { localizedField } from '../config/language'
import { useLanguageStore } from '../store/languageStore'
import {
  DotsThreeVertical,
  CheckCircle,
  ShareNetwork,
  Trash,
  ArrowSquareOut,
  FileText,
  Buildings,
} from '@phosphor-icons/react'
import MarketOpportunitiesModal from './MarketOpportunitiesModal'

/**
 * ListingMiniCard — editorial catalogue entry
 * Image-first horizontal layout. Restrained status badges. Forest green price.
 */
export default function ListingMiniCard({
  listing,
  onStatusChange,
  onDelete,
  onShare,
  className = '',
}) {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [marketModalOpen, setMarketModalOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const status = (listing.status || 'published').toLowerCase()
  const price = Number(listing.price || listing.suggestedPrice || 0)
  const productId = listing.product_id || listing.id || 'KRG-DEMO'
  const title = localizedField(listing.listing, 'title', language) || listing.title || t('product_title')

  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  let image = listing.image_url || listing.enhancedImageUrl || listing.image || listing.imagePreview
  if (image && (image.startsWith('/v1/media/') || image.startsWith('v1/media/'))) {
    image = `${backendBase}/${image.replace(/^\//, '')}`
  } else if (image && (image.startsWith('/temp/') || image.startsWith('temp/'))) {
    image = `${backendBase}/${image.replace(/^\//, '')}`
  }

  // Status badge — subtle, semantic only
  const StatusBadge = () => {
    if (status === 'sold') return (
      <span className="clay-badge clay-badge-indigo">
        {t('status_sold', 'Sold')}
      </span>
    )
    if (status === 'draft') return (
      <span className="clay-badge clay-badge-muted">
        {t('status_draft', 'Draft')}
      </span>
    )
    // active / published
    return (
      <span className="clay-badge clay-badge-success flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-forest inline-block" />
        {t('status_active', 'Live')}
      </span>
    )
  }

  const handleCardClick = (e) => {
    if (menuRef.current && menuRef.current.contains(e.target)) return
    navigate(`/p/${productId}`)
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`clay-card flex cursor-pointer hover:border-stone-border group transition-all ${className}`}
        style={{ overflow: 'hidden' }}
      >
        {/* Product image — 4:3 on mobile, fixed width on desktop */}
        <div className="w-28 sm:w-32 shrink-0 bg-stone-surface overflow-hidden"
             style={{ minHeight: '120px' }}>
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              style={{ aspectRatio: '3/4' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-faint text-2xl bg-stone-surface">
              🪔
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Category label above title */}
              {listing.category && (
                <span className="section-label block mb-1">
                  {listing.category.replace(/_/g, ' ')}
                </span>
              )}
              <h3 className="text-sm font-medium text-ink leading-snug line-clamp-2">
                {title}
              </h3>
            </div>

            {/* Actions menu */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
                className="p-1.5 rounded text-ink-faint hover:text-ink hover:bg-stone-surface transition-colors"
                aria-label="Options"
              >
                <DotsThreeVertical size={18} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-8 w-48 bg-white border border-stone-deep rounded shadow-editorial-lg py-1 z-30 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button type="button" onClick={() => { setMenuOpen(false); navigate(`/p/${productId}`) }}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-ink hover:bg-stone-surface flex items-center gap-2.5 transition-colors">
                    <ArrowSquareOut size={14} className="text-ink-muted" />
                    {t('screen.view_live', 'View live page')}
                  </button>

                  <button type="button" onClick={() => { setMenuOpen(false); setMarketModalOpen(true) }}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-ink hover:bg-stone-surface flex items-center gap-2.5 transition-colors">
                    <Buildings size={14} className="text-ink-muted" />
                    {t('screen.market_matches', 'Buyer opportunities')}
                  </button>

                  <button type="button" onClick={() => { setMenuOpen(false); navigate(`/listing/${productId}/wholesale`) }}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-ink hover:bg-stone-surface flex items-center gap-2.5 transition-colors">
                    <FileText size={14} className="text-ink-muted" />
                    {t('screen.b2b_wholesale_sheet', 'B2B sheet')}
                  </button>

                  <button type="button" onClick={() => { setMenuOpen(false); onStatusChange && onStatusChange(productId, status === 'sold' ? 'published' : 'sold') }}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-ink hover:bg-stone-surface flex items-center gap-2.5 transition-colors">
                    <CheckCircle size={14} className="text-ink-muted" />
                    {status === 'sold' ? t('mark_active', 'Mark as active') : t('mark_sold', 'Mark as sold')}
                  </button>

                  <button type="button" onClick={() => { setMenuOpen(false); onShare && onShare(listing) }}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-ink hover:bg-stone-surface flex items-center gap-2.5 transition-colors">
                    <ShareNetwork size={14} className="text-ink-muted" />
                    {t('share_listing', 'Share link')}
                  </button>

                  <div className="my-1 border-t border-stone-deep" />

                  <button type="button" onClick={() => { setMenuOpen(false); onDelete && onDelete(productId) }}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-rust hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                    <Trash size={14} />
                    {t('delete_listing', 'Delete')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer: status + price */}
          <div className="flex items-center justify-between border-t border-stone-deep pt-2">
            <StatusBadge />
            <span className="price-display text-base">
              {price > 0 ? `₹${price.toLocaleString('en-IN')}` : '—'}
            </span>
          </div>
        </div>
      </div>

      <MarketOpportunitiesModal
        isOpen={marketModalOpen}
        onClose={() => setMarketModalOpen(false)}
        productId={productId}
        productTitle={title}
        productCategory={listing.category}
        productPrice={price}
      />
    </>
  )
}
