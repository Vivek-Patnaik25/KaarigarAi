import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ShareNetwork,
  WhatsappLogo,
  ShieldCheck,
  Tag,
  CopySimple,
  Check,
  CircleNotch,
  Storefront,
  House,
  Heart,
  PaperPlaneTilt,
  MapPin,
  Clock,
  Package,
  ChatText
} from '@phosphor-icons/react'
import { fetchProductById } from '../config/api'
import Navbar from '../components/Navbar'
import GITagBanner from '../components/GITagBanner'
import BuyerProposalModal from '../components/BuyerProposalModal'
import { localizedField } from '../config/language'
import { useLanguageStore } from '../store/languageStore'
import { useUserStore } from '../store/userStore'
import { isInShortlist, toggleShortlist } from '../config/auth'
import { getWhatsAppInquiryUrl, getSmsInquiryUrl, isValidPhoneNumber } from '../config/inquiryMessage'
import { getLocalizedProduct } from '../config/productsCatalog'

export default function PublicProductPage() {
  const { productId } = useParams()
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const { role } = useUserStore()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [proposalModalOpen, setProposalModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return
      setLoading(true)
      setError('')
      try {
        const data = await fetchProductById(productId)
        if (data) {
          setProduct(data)
          setIsSaved(isInShortlist(data.product_id || data.id || productId))
        } else {
          setError(t('screen.product_not_found', 'Product not found'))
        }
      } catch (err) {
        setError(err.message || t('screen.product_load_error', 'Failed to load product'))
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [productId, t])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: product?.title || 'KarigaarAI', url }) } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch (_) {}
    }
  }

  const handleToggleShortlist = () => {
    if (!product) return
    const updated = toggleShortlist({
      ...product,
      id: product.product_id || product.id || productId,
      product_id: product.product_id || product.id || productId,
      title: activeTitle,
    })
    const savedNow = isInShortlist(product.product_id || product.id || productId)
    setIsSaved(savedNow)
    showToast(savedNow ? t('shortlist.added', 'Added to shortlist') : t('shortlist.removed', 'Removed from shortlist'))
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center gap-3 text-ink-muted">
          <CircleNotch size={24} className="animate-spin" />
          <span className="text-sm">{t('screen.product_loading', 'Loading…')}</span>
        </div>
      </div>
    )
  }

  /* ── Error ───────────────────────────────────────────────────────────── */
  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-full bg-stone-surface flex items-center justify-center">
            <Storefront size={28} className="text-ink-faint" />
          </div>
          <div>
            <h2 className="text-base font-medium text-ink mb-1">
              {error || t('screen.product_not_found', 'Product not found')}
            </h2>
            <p className="text-sm text-ink-muted">
              {t('screen.product_removed', 'This product may have been removed or made private.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/buyer/discover')}
            className="clay-btn clay-btn-primary flex items-center gap-1.5"
          >
            <House size={15} />
            <span>{t('browse_catalogue', 'Browse Catalogue')}</span>
          </button>
        </div>
      </div>
    )
  }

  const localizedProd = getLocalizedProduct(product, language)
  const listing       = product.listing || {}
  const activeTitle   = localizedField(listing, 'title', language) || localizedProd.title || product.title || 'Handcrafted Artisan Product'
  const activeDesc    = localizedField(listing, 'description', language) || localizedProd.description || product.description || ''
  const activeMat     = localizedField(listing, 'material', language) || localizedProd.material || product.material || ''
  const activeTech    = localizedField(listing, 'technique', language) || localizedProd.technique || product.technique || ''

  // Category label lookup for i18n
  const CATEGORY_I18N_KEY = {
    pottery_terracotta: 'category.pottery',
    textile_handloom: 'category.handloom',
    textile_embroidery: 'category.embroidery',
    woodcraft: 'category.woodcraft',
    metalcraft: 'category.metalcraft',
    painting_folk: 'category.painting',
    jewellery: 'category.jewellery',
  }
  const activeCategoryLabel = product.category
    ? (CATEGORY_I18N_KEY[product.category] ? t(CATEGORY_I18N_KEY[product.category]) : product.category.replace(/_/g, ' '))
    : null

  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  let imageUrl = product.image_url || null
  if (imageUrl && (imageUrl.startsWith('/v1/media/') || imageUrl.startsWith('v1/media/'))) {
    imageUrl = `${backendBase}/${imageUrl.replace(/^\//, '')}`
  } else if (imageUrl && (imageUrl.startsWith('/temp/') || imageUrl.startsWith('temp/'))) {
    imageUrl = `${backendBase}/${imageUrl.replace(/^\//, '')}`
  }

  // Direct messaging URLs (WhatsApp & SMS)
  const rawArtisanPhone = product.artisan_phone || product.phone || (product.artisan_id === 'KG-2024-8921' ? '+919556828397' : '')
  const hasValidPhone = isValidPhoneNumber(rawArtisanPhone)

  const whatsappUrl = hasValidPhone
    ? getWhatsAppInquiryUrl({
        artisanPhone: rawArtisanPhone,
        artisanName: product.artisan_name,
        productTitle: activeTitle,
        quantity: product.moq || 20,
        productUrl: typeof window !== 'undefined' ? window.location.href : '',
        language,
      })
    : null

  const smsUrl = hasValidPhone
    ? getSmsInquiryUrl({
        artisanPhone: rawArtisanPhone,
        artisanName: product.artisan_name,
        productTitle: activeTitle,
        quantity: product.moq || 20,
        productUrl: typeof window !== 'undefined' ? window.location.href : '',
        language,
      })
    : null

  const artisanId = product.artisan_id || 'KG-2024-8921'

  return (
    <div className="min-h-screen bg-stone-bg flex flex-col pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">

        {/* ── Breadcrumb & Top Actions ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button
            type="button"
            onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate(role === 'artisan' ? '/artisan/products' : '/buyer/discover')}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>{t('back', 'Back')}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Shortlist Heart Button (Buyers only) */}
            {role !== 'artisan' && (
              <button
                type="button"
                onClick={handleToggleShortlist}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-colors shadow-2xs ${
                  isSaved
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-stone-300 bg-white text-ink hover:bg-stone-50'
                }`}
              >
                <Heart size={15} weight={isSaved ? 'fill' : 'regular'} className={isSaved ? 'text-rose-500' : ''} />
                <span>{isSaved ? t('saved_label', 'Saved') : t('save_label', 'Save')}</span>
              </button>
            )}

            {/* Share link */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-300 bg-white text-xs text-ink hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
            >
              {copied
                ? <><Check size={14} weight="bold" className="text-forest" /> {t('screen.share_copied', 'Copied')}</>
                : <><ShareNetwork size={14} /> {t('screen.share', 'Share')}</>
              }
            </button>
          </div>
        </div>

        {/* ── GI Tag Banner ────────────────────────────────────────────── */}
        <GITagBanner category={product.category} />

        {/* ── Main layout: image + details ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-start mt-4">

          {/* Left: Product image */}
          <div className="clay-card overflow-hidden bg-white shadow-editorial-md">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={activeTitle}
                className="w-full object-cover"
                style={{ aspectRatio: '4/3', display: 'block' }}
                onError={(e) => { e.currentTarget.parentElement.style.background = '#F5F5F4' }}
              />
            ) : (
              <div className="w-full bg-stone-surface flex items-center justify-center text-5xl"
                   style={{ aspectRatio: '4/3' }}>
                🪔
              </div>
            )}

            {/* Authenticity footer */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-stone-200 bg-stone-50/50">
              <div className="flex items-center gap-1.5 text-forest text-xs font-medium">
                <ShieldCheck size={16} weight="fill" />
                <span>{t('screen.verified_handmade', 'Verified handmade creation')}</span>
              </div>
              <span className="font-mono text-[11px] text-ink-faint">
                {product.product_id || productId}
              </span>
            </div>
          </div>

          {/* Right: Product details */}
          <div className="flex flex-col gap-5">

            {/* Category + status */}
            <div className="flex items-center justify-between gap-3">
              {product.category && (
                <span className="section-label">
                  {activeCategoryLabel}
                </span>
              )}
              <span className="clay-badge clay-badge-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-forest inline-block" />
                <span>{t('screen.live_product', 'Available')}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-ink leading-snug">
              {activeTitle}
            </h1>

            {/* Price */}
            <div className="border-t border-stone-200 pt-4">
              <p className="section-label mb-1">{t('screen.fair_price', 'Direct Artisan Price')}</p>
              <p className="price-display text-3xl font-bold text-ink">
                ₹{product.price?.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-ink-faint mt-1">
                {t('screen.direct_payment', 'Direct from artisan workshop')} · {t('screen.no_middleman', 'Zero intermediary commission')}
              </p>
            </div>

            {/* Artisan Workshop Attribution */}
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-ink-faint block uppercase font-medium">
                  {t('artisan_workshop', 'Workshop')}
                </span>
                <span className="font-semibold text-ink">
                  {product.artisan_name || 'Rameshwar Prajapati'}
                </span>
                <span className="text-ink-muted block text-[11px]">
                  {product.location || 'India'}
                </span>
              </div>

              <Link
                to={`/passport/${artisanId}`}
                className="text-xs text-amber-900 font-medium hover:underline flex items-center gap-1 shrink-0"
              >
                <span>{t('screen.artisan_passport', 'View Passport')}</span>
                <span>→</span>
              </Link>
            </div>

            {/* Description / story */}
            {activeDesc && (
              <div>
                <p className="section-label mb-1.5">{t('screen.story_heritage', 'Artisan Story & Craftsmanship')}</p>
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed" style={{ lineHeight: '1.75' }}>
                  {activeDesc}
                </p>
              </div>
            )}

            {/* Craft specs */}
            {(activeTech || activeMat || listing.craft_tradition || listing.material_detected || product.material) && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(activeTech || listing.craft_tradition || product.technique) && (
                  <div className="clay-card-inset p-2.5 rounded bg-stone-50 border border-stone-200">
                    <p className="section-label mb-0.5">{t('screen.craft_tradition', 'Craft Tradition')}</p>
                    <p className="font-medium text-ink truncate">{activeTech || listing.craft_tradition || product.technique}</p>
                  </div>
                )}
                {(activeMat || listing.material_detected || product.material) && (
                  <div className="clay-card-inset p-2.5 rounded bg-stone-50 border border-stone-200">
                    <p className="section-label mb-0.5">{t('screen.material', 'Material')}</p>
                    <p className="font-medium text-ink truncate">{activeMat || listing.material_detected || product.material}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag size={13} className="text-ink-faint shrink-0" />
                {product.tags.map((tag, i) => (
                  <span key={i} className="clay-badge clay-badge-muted text-[11px]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs: Role-aware */}
            {role === 'artisan' ? (
              <div className="flex flex-col gap-2.5 pt-3 border-t border-stone-200">
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/90 text-xs text-ink-muted flex items-center justify-between">
                  <span className="font-medium">{t('artisan.public_view_notice', 'Viewing published catalog listing (Artisan Studio mode)')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/listing/${product.product_id || productId}/wholesale`)}
                    className="clay-btn clay-btn-primary w-full flex items-center justify-center gap-2 text-xs cursor-pointer"
                    style={{ minHeight: '42px' }}
                  >
                    <span>📄 {t('wholesale.b2b_inquiry_btn', 'B2B Spec Sheet')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="clay-btn clay-btn-ghost w-full flex items-center justify-center gap-2 text-ink text-xs border border-stone-300 bg-white hover:bg-stone-50 cursor-pointer"
                    style={{ minHeight: '42px' }}
                  >
                    <ShareNetwork size={16} />
                    <span>{t('screen.share', 'Share Product Link')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-3 border-t border-stone-200">
                {/* Primary CTA: Request Proposal */}
                <button
                  type="button"
                  onClick={() => setProposalModalOpen(true)}
                  className="clay-btn clay-btn-primary w-full flex items-center justify-center gap-2 text-sm cursor-pointer"
                  style={{ minHeight: '46px' }}
                >
                  <PaperPlaneTilt size={17} weight="bold" />
                  <span>{t('buyer.request_proposal_cta', 'Request Commercial Proposal')}</span>
                </button>

                {/* Secondary CTAs: WhatsApp & SMS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clay-btn w-full flex items-center justify-center gap-2 text-white text-xs"
                      style={{
                        background: '#25D366',
                        borderColor: '#25D366',
                        borderRadius: '6px',
                        minHeight: '40px',
                        fontWeight: 500,
                        textDecoration: 'none',
                      }}
                    >
                      <WhatsappLogo size={18} weight="fill" />
                      <span>{t('screen.buy_whatsapp', 'Contact on WhatsApp')}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="clay-btn clay-btn-ghost w-full flex items-center justify-center gap-2 text-stone-400 text-xs border border-stone-200 opacity-60 cursor-not-allowed"
                      style={{
                        borderRadius: '6px',
                        minHeight: '40px',
                        fontWeight: 500,
                      }}
                      title={t('buyer.whatsapp_unavailable', 'WhatsApp unavailable for this artisan')}
                    >
                      <WhatsappLogo size={18} weight="fill" className="text-stone-400" />
                      <span>{t('buyer.whatsapp_unavailable', 'WhatsApp Unavailable')}</span>
                    </button>
                  )}

                  {smsUrl ? (
                    <a
                      href={smsUrl}
                      className="clay-btn clay-btn-ghost w-full flex items-center justify-center gap-2 text-stone-800 text-xs bg-stone-100 hover:bg-stone-200 border border-stone-300"
                      style={{
                        borderRadius: '6px',
                        minHeight: '40px',
                        fontWeight: 500,
                        textDecoration: 'none',
                      }}
                    >
                      <ChatText size={18} weight="bold" className="text-stone-700" />
                      <span>{t('buyer.send_sms', 'Send SMS')}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="clay-btn clay-btn-ghost w-full flex items-center justify-center gap-2 text-stone-400 text-xs border border-stone-200 opacity-60 cursor-not-allowed"
                      style={{
                        borderRadius: '6px',
                        minHeight: '40px',
                        fontWeight: 500,
                      }}
                    >
                      <ChatText size={18} weight="bold" className="text-stone-400" />
                      <span>{t('buyer.send_sms', 'Send SMS')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Buyer Proposal Modal */}
      {proposalModalOpen && (
        <BuyerProposalModal
          isOpen={proposalModalOpen}
          onClose={() => setProposalModalOpen(false)}
          product={{
            ...product,
            product_id: product.product_id || productId,
            title: activeTitle,
          }}
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
