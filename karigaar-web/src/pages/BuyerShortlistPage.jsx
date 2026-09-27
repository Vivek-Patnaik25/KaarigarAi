import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Trash,
  ShareNetwork,
  Check,
  ShoppingBag,
  ArrowRight,
  MapPin,
  ShieldCheck,
  WhatsappLogo,
  PaperPlaneTilt
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import BuyerProposalModal from '../components/BuyerProposalModal'
import { getShortlist, toggleShortlist } from '../config/auth'

export default function BuyerShortlistPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [shortlist, setShortlist] = useState([])
  const [copied, setCopied] = useState(false)
  const [selectedProductForProposal, setSelectedProductForProposal] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  const refreshShortlist = () => {
    setShortlist(getShortlist())
  }

  useEffect(() => {
    refreshShortlist()
    window.addEventListener('karigaar_shortlist_changed', refreshShortlist)
    return () => window.removeEventListener('karigaar_shortlist_changed', refreshShortlist)
  }, [])

  const handleRemove = (product) => {
    toggleShortlist(product)
    showToast(t('shortlist.removed', 'Removed from shortlist'))
  }

  const handleShareShortlist = async () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Curated KarigaarAI Craft Shortlist',
          text: `Review my shortlisted Indian craft products (${shortlist.length} items):`,
          url: shareUrl,
        })
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch (_) {}
    }
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  const totalValue = shortlist.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

  return (
    <div className="min-h-screen bg-stone-bg flex flex-col pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="section-label mb-0.5">{t('shortlist.subtitle', 'Buyer Collection')}</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink">
              {t('shortlist.title', 'Saved Craft Products')}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              {t('shortlist.desc', 'Review, compare, and send bulk proposal inquiries to shortlisted artisan workshops.')}
            </p>
          </div>

          {shortlist.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareShortlist}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-300 bg-white hover:bg-stone-50 text-xs font-medium text-ink transition-colors shadow-2xs"
              >
                {copied ? <Check size={14} className="text-forest" /> : <ShareNetwork size={14} />}
                <span>{copied ? t('copied', 'Copied Link') : t('share_shortlist', 'Share Shortlist')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {shortlist.length === 0 ? (
          <div className="clay-card p-14 text-center flex flex-col items-center gap-4 bg-white">
            <div className="w-[80px] h-[80px] rounded-2xl bg-white shadow-xs border border-stone-200/80 p-1.5 flex items-center justify-center">
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
            <div>
              <h3 className="text-base font-semibold text-ink mb-1">
                {t('shortlist.empty_title', 'Your shortlist is empty')}
              </h3>
              <p className="text-xs text-ink-muted max-w-sm leading-relaxed">
                {t('shortlist.empty_desc', 'Explore the artisan marketplace and tap the heart icon on any craft product to save it here for comparison and inquiries.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/buyer/discover')}
              className="clay-btn clay-btn-primary flex items-center gap-2 text-xs mt-2 cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              <span>{t('browse_catalogue', 'Browse Craft Catalogue')}</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Summary Bar */}
            <div className="p-4 rounded-lg bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-ink-faint block uppercase font-medium">
                    {t('shortlist.total_saved', 'Saved Items')}
                  </span>
                  <span className="text-lg font-bold text-ink">{shortlist.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-faint block uppercase font-medium">
                    {t('shortlist.sample_total', 'Combined Unit Value')}
                  </span>
                  <span className="text-lg font-bold text-forest">₹{totalValue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/buyer/discover')}
                className="clay-btn clay-btn-ghost text-xs"
              >
                + {t('add_more_products', 'Add More Products')}
              </button>
            </div>

            {/* Shortlist Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortlist.map((item) => {
                const pId = item.product_id || item.id

                return (
                  <div
                    key={pId}
                    className="clay-card p-4 flex gap-4 bg-white hover:shadow-editorial-md transition-shadow relative"
                  >
                    {/* Image */}
                    <Link to={`/p/${pId}`} className="w-28 h-28 sm:w-32 sm:h-32 rounded bg-stone-100 overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🪔</div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] uppercase tracking-wider text-amber-900 font-semibold truncate">
                            {item.category_name || (item.category || '').replace(/_/g, ' ')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="text-ink-faint hover:text-rust p-1 rounded transition-colors"
                            title={t('remove', 'Remove')}
                          >
                            <Trash size={15} />
                          </button>
                        </div>

                        <Link to={`/p/${pId}`} className="text-sm font-semibold text-ink hover:text-amber-900 line-clamp-1">
                          {item.title}
                        </Link>

                        <p className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-1">
                          <MapPin size={11} className="text-stone-400" />
                          <span>{item.artisan_name} · {item.location}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-ink">
                            ₹{item.price?.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedProductForProposal(item)}
                          className="clay-btn clay-btn-primary text-xs py-1 px-2.5 flex items-center gap-1"
                        >
                          <span>{t('request_proposal', 'Inquire')}</span>
                          <PaperPlaneTilt size={12} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Proposal Modal */}
      {selectedProductForProposal && (
        <BuyerProposalModal
          isOpen={Boolean(selectedProductForProposal)}
          onClose={() => setSelectedProductForProposal(null)}
          product={selectedProductForProposal}
          onSuccess={() => {
            showToast(t('buyer.request_sent_success', 'Proposal request sent!'))
          }}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="toast"
          >
            <Check size={14} weight="bold" className="text-forest shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
