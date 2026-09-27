import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowSquareOut,
  CopySimple,
  Check,
  PlusCircle,
  House,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { useCatalogStore } from '../store/catalogStore'

export default function SuccessPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const navState = location.state || {}

  const {
    title,
    price,
    enhancedImageUrl,
    imagePreview,
    publishedProductId,
    publishedPublicUrl,
    reset,
  } = useCatalogStore()

  const [copied, setCopied] = useState(false)

  const activeProductId = navState.product_id || publishedProductId || 'KRG-LIVE'
  const activePublicUrl = navState.public_url || publishedPublicUrl || `${window.location.origin}/p/${activeProductId}`
  const activeTitle = navState.title || title || t('screen.published_product_alt', 'Your product')
  const activePrice = navState.price !== undefined && navState.price !== null && Number(navState.price) > 0
    ? Number(navState.price)
    : (Number(price) || 0)

  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  let displayImage = navState.image || enhancedImageUrl || imagePreview || null
  if (displayImage && (displayImage.startsWith('/v1/media/') || displayImage.startsWith('v1/media/'))) {
    displayImage = `${backendBase}/${displayImage.replace(/^\//, '')}`
  } else if (displayImage && (displayImage.startsWith('/temp/') || displayImage.startsWith('temp/'))) {
    displayImage = `${backendBase}/${displayImage.replace(/^\//, '')}`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activePublicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (e) {
      console.error('Clipboard copy failed:', e)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeTitle,
          text: `${activeTitle} — ₹${activePrice}`,
          url: activePublicUrl,
        })
      } catch (err) { /* user cancelled */ }
    } else {
      handleCopyLink()
    }
  }

  const whatsappText = encodeURIComponent(
    `${activeTitle} — ₹${activePrice}\n${activePublicUrl}`
  )
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`

  return (
    <div className="min-h-screen bg-stone-bg flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        {/* ── Success indicator ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center gap-3">
          {/* Checkmark */}
          <div className="w-14 h-14 rounded-full border-2 border-forest flex items-center justify-center bg-forest-faint">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
            >
              <Check size={28} weight="bold" className="text-forest" />
            </motion.div>
          </div>

          <div>
            <h1 className="text-xl font-semibold text-ink">
              {t('publish_success', 'Product published')}
            </h1>
            <p className="text-sm text-ink-muted mt-0.5">
              {t('screen.published_saved', 'Your product is now live and visible to buyers.')}
            </p>
          </div>
        </div>

        {/* ── Product summary card ─────────────────────────────────────── */}
        <div className="clay-card overflow-hidden">
          {/* Image strip */}
          {displayImage && (
            <div className="w-full h-40 bg-stone-surface overflow-hidden">
              <img
                src={displayImage}
                alt={activeTitle}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
              />
            </div>
          )}

          <div className="p-4 flex flex-col gap-1">
            <span className="section-label">{t('screen.active_catalog', 'Published')}</span>
            <h2 className="text-base font-medium text-ink leading-snug">
              {activeTitle}
            </h2>
            <p className="price-display text-xl mt-1">
              ₹{Number(activePrice).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-ink-faint font-mono mt-1">
              ID: {activeProductId}
            </p>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5">
          {/* Primary: View live page */}
          <button
            type="button"
            onClick={() => navigate(`/p/${activeProductId}`)}
            className="clay-btn clay-btn-primary w-full flex items-center justify-center gap-2"
          >
            <ArrowSquareOut size={17} weight="bold" />
            {t('screen.view_live', 'View published page')}
          </button>

          {/* WhatsApp share — actual WA action, WA green */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="clay-btn w-full flex items-center justify-center gap-2 text-white"
            style={{
              background: '#25D366',
              borderColor: '#25D366',
              borderRadius: '8px',
              minHeight: '44px',
              fontWeight: 500,
              fontSize: '14px',
            }}
          >
            <WhatsappLogo size={18} weight="fill" />
            {t('screen.share_whatsapp', 'Share on WhatsApp')}
          </a>

          {/* Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="clay-btn clay-btn-ghost w-full flex items-center justify-center gap-2"
          >
            {copied
              ? <><Check size={16} weight="bold" className="text-forest" /> {t('screen.share_copied', 'Copied!')}</>
              : <><CopySimple size={16} /> {t('screen.copy_public_link', 'Copy product link')}</>
            }
          </button>

          {/* Add another */}
          <button
            type="button"
            onClick={() => { reset(); navigate('/catalog?new=true') }}
            className="clay-btn clay-btn-ghost w-full flex items-center justify-center gap-2"
          >
            <PlusCircle size={16} />
            {t('add_another', 'Add another product')}
          </button>

          {/* Back to dashboard — text link */}
          <button
            type="button"
            onClick={() => { reset(); navigate('/dashboard') }}
            className="text-sm text-ink-muted hover:text-ink flex items-center justify-center gap-1.5 mt-1 transition-colors"
          >
            <House size={15} />
            {t('screen.my_listings_dashboard', 'Back to dashboard')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
