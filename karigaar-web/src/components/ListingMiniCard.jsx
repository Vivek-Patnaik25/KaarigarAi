import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  DotsThreeVertical, 
  CheckCircle, 
  ShareNetwork, 
  Trash, 
  ArrowSquareOut,
  FileText,
  Buildings
} from '@phosphor-icons/react'
import ClayCard from './ClayCard'
import MarketOpportunitiesModal from './MarketOpportunitiesModal'

export default function ListingMiniCard({
  listing,
  onStatusChange,
  onDelete,
  onShare,
  className = '',
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [marketModalOpen, setMarketModalOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const status = (listing.status || 'published').toLowerCase()
  const price = Number(listing.price || listing.suggestedPrice || 1939)
  const productId = listing.product_id || listing.id || 'KRG-DEMO'

  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  let image = listing.image_url || listing.enhancedImageUrl || listing.image || listing.imagePreview || '/demo/enhanced_pottery.jpg'
  if (image.startsWith('/v1/media/') || image.startsWith('v1/media/')) {
    image = `${backendBase}/${image.replace(/^\//, '')}`
  } else if (image.startsWith('/temp/') || image.startsWith('temp/')) {
    image = `${backendBase}/${image.replace(/^\//, '')}`
  }

  const title = listing.title || listing.listing?.title_hi || listing.listing?.title_en || 'हस्तनिर्मित शिल्प उत्पाद'

  const getStatusBadge = () => {
    if (status === 'sold') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 shadow-sm">
          <CheckCircle size={13} weight="fill" />
          <span>{t('status_sold', 'Sold')}</span>
        </span>
      )
    }
    if (status === 'draft') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300 shadow-sm">
          {t('status_draft', 'Draft')}
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
        <span>{t('status_active', 'Active')}</span>
      </span>
    )
  }

  const handleCardClick = (e) => {
    if (menuRef.current && menuRef.current.contains(e.target)) {
      return
    }
    navigate(`/p/${productId}`)
  }

  return (
    <ClayCard 
      onClick={handleCardClick}
      className={`overflow-hidden flex flex-col sm:flex-row items-stretch cursor-pointer hover:shadow-xl transition-all group relative ${className}`}
    >
      {/* Thumbnail */}
      <div className="w-full sm:w-36 h-40 sm:h-auto overflow-hidden bg-clay-deep/50 shrink-0 relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/demo/enhanced_pottery.jpg'
          }}
        />
        <div className="absolute top-2 left-2 sm:hidden">
          {getStatusBadge()}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="hidden sm:flex items-center gap-2 mb-1.5">
              {getStatusBadge()}
              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                {productId}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-clay-indigo font-heading line-clamp-2 leading-snug">
              {title}
            </h3>
            {listing.category && (
              <span className="text-[11px] font-bold text-clay-muted uppercase tracking-wider block mt-1">
                {listing.category.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* 3-Dot Action Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              className="p-2 rounded-xl text-clay-muted hover:text-clay-indigo hover:bg-clay-deep/60 transition-colors shadow-none cursor-pointer"
              title="Options"
              aria-label="Listing options"
            >
              <DotsThreeVertical size={20} weight="bold" />
            </button>

            {menuOpen && (
              <div 
                className="absolute right-0 top-10 w-48 rounded-2xl bg-white shadow-2xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 text-xs font-heading font-bold"
                onClick={(e) => e.stopPropagation()}
              >
                {/* View Live Product Page */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate(`/p/${productId}`)
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ArrowSquareOut size={16} className="text-clay-primary" />
                  <span>लाइव पेज देखें (View Page)</span>
                </button>

                {/* Market Opportunities */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setMarketModalOpen(true)
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Buildings size={16} className="text-amber-600" />
                  <span>बाज़ार के अवसर (Market Matches)</span>
                </button>

                {/* B2B Wholesale Sheet */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate(`/listing/${productId}/wholesale`)
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText size={16} className="text-indigo-600" />
                  <span>होलसेल शीट (B2B Sheet)</span>
                </button>

                {/* Mark as Sold / Reactivate */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onStatusChange && onStatusChange(productId, status === 'sold' ? 'published' : 'sold')
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CheckCircle size={16} className={status === 'sold' ? 'text-emerald-600' : 'text-blue-600'} />
                  <span>{status === 'sold' ? t('mark_active', 'Mark as Active') : t('mark_sold', 'Mark as Sold')}</span>
                </button>

                {/* Share Public Link */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onShare && onShare(listing)
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ShareNetwork size={16} className="text-amber-600" />
                  <span>{t('share_listing', 'Share Public Link')}</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete && onDelete(productId)
                  }}
                  className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash size={16} />
                  <span>{t('delete_listing', 'Delete Listing')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Price and date */}
        <div className="flex items-center justify-between pt-2 border-t border-clay-muted/15 mt-1">
          <span className="text-base sm:text-lg font-black text-clay-primary font-heading">
            ₹{price.toLocaleString('en-IN')}
          </span>
          
          <span className="text-[11px] font-semibold text-clay-muted">
            {listing.created_at || listing.createdAt ? new Date(listing.created_at || listing.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recently added'}
          </span>
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
    </ClayCard>
  )
}
