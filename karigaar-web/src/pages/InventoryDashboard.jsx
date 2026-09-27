import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Storefront,
  IdentificationBadge,
  Check,
  Warning,
  ArrowRight,
  Buildings,
  MapPin,
  Sparkle,
  PaperPlaneTilt,
  ShieldCheck,
  QrCode,
  ShareNetwork,
  Tag,
  Gear
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import ListingMiniCard from '../components/ListingMiniCard'
import ClayButton from '../components/ClayButton'
import ProposalModal from '../components/ProposalModal'

import { fetchMyListings, fetchBuyerRequirements, updateProductStatus, deleteProduct } from '../config/api'
import { localizedField } from '../config/language'
import { useLanguageStore } from '../store/languageStore'
import { useUserStore } from '../store/userStore'
import { useCatalogStore } from '../store/catalogStore'
import { DEMO_ARTISAN, getSentProposals } from '../config/auth'
import { getLocalizedBuyerOpportunity } from '../config/buyerOpportunitiesLocalized'

const STORAGE_KEY = 'karigaar_listings'
const ARTISAN_ID = 'KG-2024-8921'

const LOCAL_PLACEHOLDER_IMAGES = [
  '/images/IMG_20260715_162127_448x448.webp',
  '/images/WhatsAppImage2025-10-04at5.07.21PM_28.webp',
  '/images/gcescodr0030s-_282_29.webp',
]

function getPlaceholderImage(index) {
  return LOCAL_PLACEHOLDER_IMAGES[index % LOCAL_PLACEHOLDER_IMAGES.length]
}

export default function InventoryDashboard() {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState([])
  const [dataSource, setDataSource] = useState('loading')
  const [toastMessage, setToastMessage] = useState('')
  const [activeOpportunity, setActiveOpportunity] = useState(null)
  const [selectedProductForProposal, setSelectedProductForProposal] = useState(null)

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash)
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [location.hash])

  const loadListings = async () => {
    setLoading(true)
    try {
      const data = await fetchMyListings(ARTISAN_ID)
      const items = Array.isArray(data) ? data : (data?.listings || [])

      if (Array.isArray(items) && items.length > 0) {
        const mapped = items.map((item, idx) => ({
          id: item.product_id,
          product_id: item.product_id,
          listing: item.listing || null,
          title: item.listing?.title_en || item.title || 'Handcrafted Artisan Item',
          title_en: item.listing?.title_en || item.title,
          title_hi: item.listing?.title_hi || item.title,
          title_ta: item.listing?.title_ta || '',
          title_mr: item.listing?.title_mr || '',
          title_or: item.listing?.title_or || '',
          title_bn: item.listing?.title_bn || '',
          category: item.category,
          price: item.price,
          status: normalizeStatus(item.status),
          image: item.image_url || getPlaceholderImage(idx),
          image_url: item.image_url || null,
          createdAt: item.published_at || item.created_at || new Date().toISOString(),
          public_url: item.public_url || `/p/${item.product_id}`,
          _isRealData: true,
        }))
        setListings(mapped)
        setDataSource('backend')
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped)) } catch (_) {}
        setLoading(false)
        return
      }

      setListings([])
      setDataSource('empty')
    } catch (err) {
      console.warn('Backend listings fetch failed:', err)
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setListings(parsed)
            setDataSource('cache')
            setLoading(false)
            return
          }
        }
      } catch (_) {}
      setListings([])
      setDataSource('empty')
    }
    setLoading(false)
  }

  const loadBuyerOpportunities = async () => {
    try {
      const data = await fetchBuyerRequirements()
      const buyers = Array.isArray(data) ? data : (data?.buyers || data?.data || [])
      setOpportunities(Array.isArray(buyers) ? buyers : [])
    } catch (_) {
      setOpportunities([])
    }
  }

  useEffect(() => {
    loadListings()
    loadBuyerOpportunities()
  }, [language])

  function normalizeStatus(s) {
    const v = (s || '').toLowerCase().trim()
    if (v === 'active' || v === 'published') return 'active'
    if (v === 'sold') return 'sold'
    if (v === 'archived') return 'archived'
    return 'draft'
  }

  const handleStatusChange = async (id, newStatus) => {
    const updated = listings.map((item) =>
      (item.id === id || item.product_id === id) ? { ...item, status: normalizeStatus(newStatus) } : item
    )
    setListings(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch (_) {}
    try { await updateProductStatus(id, newStatus) } catch (e) { console.warn('Status update failed:', e) }
    showToast(newStatus === 'sold' ? t('dashboard.marked_sold', 'Marked as Sold') : t('dashboard.marked_active', 'Marked as Active'))
  }

  const handleDelete = async (id) => {
    const updated = listings.filter((item) => item.id !== id && item.product_id !== id)
    setListings(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch (_) {}
    try { await deleteProduct(id) } catch (e) { console.warn('Delete failed:', e) }
    showToast(t('delete_listing', 'Product removed'))
  }

  const handleShare = async (listing) => {
    const id = listing.product_id || listing.id
    const shareUrl = `${window.location.origin}/p/${id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast(t('share_success', 'Public link copied!'))
    } catch (_) {}
  }

  const handleOpenProposal = (opp) => {
    setActiveOpportunity(opp)
    if (listings.length > 0) {
      setSelectedProductForProposal(listings[0])
    }
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Derived state
  const activeListings = listings.filter(l => l.status === 'active')
  const draftListings  = listings.filter(l => l.status === 'draft' || l.status === 'archived')
  const totalCount     = listings.length

  // "What should I do next?" — One meaningful recommended action based on actual state
  const nextAction = (() => {
    if (loading) return null
    if (totalCount === 0) {
      return {
        label: t('dashboard.action_add_first', 'Add your first product'),
        description: t('dashboard.action_add_first_desc', 'Photograph and generate a multilingual catalogue listing in 60 seconds.'),
        to: '/catalog',
        cta: t('add_new_product', 'Add Product')
      }
    }
    if (draftListings.length > 0) {
      return {
        label: t('dashboard.continue_draft', 'Finish and publish your draft product'),
        description: t('dashboard.continue_draft_desc', `You have ${draftListings.length} draft product awaiting final review.`),
        to: '/catalog',
        cta: t('continue', 'Continue Draft')
      }
    }
    if (opportunities.length > 0) {
      return {
        label: t('dashboard.action_review_buyers', 'Review matching buyer requirements'),
        description: t('dashboard.action_review_buyers_desc', `${opportunities.length} verified retail and hospitality buyers are looking for handcrafted goods.`),
        to: '/artisan/opportunities',
        cta: t('view_opportunities', 'View Opportunities')
      }
    }
    return null
  })()

  const { user } = useUserStore()
  const artisanProfile = (user && user.role === 'artisan') ? user : DEMO_ARTISAN

  // Top 3 relevant opportunities for dashboard preview, fully localized
  const previewOpportunities = opportunities.slice(0, 3).map(opp => getLocalizedBuyerOpportunity(opp, language))

  return (
    <div className="min-h-screen bg-stone-bg flex flex-col pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-10">

        {/* ── 1. Top Workshop & Artisan Context ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs border border-stone-200 bg-stone-100">
              <img
                src={artisanProfile.avatarUrl || DEMO_ARTISAN.avatarUrl || '/artisan_avatar.png'}
                alt={artisanProfile.name || DEMO_ARTISAN.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/artisan_avatar.png'
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-ink">
                  {artisanProfile.name || DEMO_ARTISAN.name}
                </span>
                <span className="clay-badge clay-badge-success text-[10px] py-0">
                  {t('verified_workshop', 'Verified Workshop')}
                </span>
              </div>
              <p className="text-xs text-ink-muted flex items-center gap-1.5">
                <MapPin size={13} className="text-amber-acc" />
                <span>{artisanProfile.location || DEMO_ARTISAN.location} · {t('category.pottery', artisanProfile.craftTitle || DEMO_ARTISAN.craftTitle)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => navigate('/settings?tab=artisan')}
              className="flex items-center gap-1.5 px-3 py-2 rounded border border-stone-300 bg-white hover:bg-stone-50 text-ink text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              title={t('settings.title', 'Edit Profile')}
            >
              <Gear size={15} className="text-stone-600" />
              <span>{t('settings.edit_profile', 'Edit Profile')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/passport/${artisanProfile.artisanId || 'KG-2024-8921'}`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded border border-stone-300 bg-white hover:bg-stone-50 text-ink text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <IdentificationBadge size={16} weight="fill" className="text-amber-acc" />
              <span>{t('passport.title', 'Digital Passport')}</span>
            </button>

            <ClayButton
              variant="primary"
              size="sm"
              onClick={() => {
                useCatalogStore.getState().reset()
                navigate('/catalog?new=true')
              }}
              icon={<Plus size={15} weight="bold" />}
            >
              {t('add_new_product', 'Add Product')}
            </ClayButton>
          </div>
        </div>

        {/* ── 2. What should I do next? (Next Action) ────────────────────── */}
        {nextAction && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-amber-acc bg-white"
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkle size={15} weight="fill" className="text-amber-acc" />
                <span className="section-label text-amber-900 font-semibold">{t('dashboard.next_action', 'Recommended Next Action')}</span>
              </div>
              <p className="text-sm font-semibold text-ink">{nextAction.label}</p>
              <p className="text-xs text-ink-muted mt-0.5">{nextAction.description}</p>
            </div>

            <button
              type="button"
              onClick={() => navigate(nextAction.to)}
              className="clay-btn clay-btn-primary flex items-center gap-1.5 shrink-0 self-start sm:self-auto text-xs"
              style={{ minHeight: '38px', padding: '7px 16px' }}
            >
              <span>{nextAction.cta}</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </motion.div>
        )}

        {/* ── 3. My Products Section (Photo-first) ────────────────────────── */}
        <section id="listings" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-ink">
                {t('recent_listings', 'My Products')}
              </h2>
              <p className="text-xs text-ink-muted">
                {activeListings.length} {t('status_live', 'live')}, {draftListings.length} {t('status_draft', 'drafts')}
              </p>
            </div>

            {totalCount > 0 && (
              <Link
                to="/artisan/products"
                className="text-xs text-amber-acc hover:text-amber-900 font-medium flex items-center gap-1 hover:underline"
              >
                <span>{t('view_all_products', 'View all products')}</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="clay-card h-24 skeleton" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && listings.length === 0 && (
            <div className="clay-card p-10 flex flex-col items-center text-center gap-4">
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
                  {t('dashboard.empty_title', "No products yet")}
                </h3>
                <p className="text-sm text-ink-muted max-w-xs">
                  {t('dashboard.empty_sub', 'Take a photo to add your first handcrafted product.')}
                </p>
              </div>
              <ClayButton
                variant="primary"
                size="md"
                onClick={() => {
                  useCatalogStore.getState().reset()
                  navigate('/catalog?new=true')
                }}
                icon={<Plus size={18} weight="bold" />}
              >
                {t('add_new_product', 'Add your first product')}
              </ClayButton>
            </div>
          )}

          {/* Product list (first 4 items) */}
          {!loading && listings.length > 0 && (
            <div className="flex flex-col gap-3">
              {listings.slice(0, 4).map((item) => (
                <ListingMiniCard
                  key={item.id}
                  listing={item}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── 4. Buyer Opportunities Section ─────────────────────────────── */}
        {!loading && opportunities.length > 0 && (
          <section className="scroll-mt-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  {t('screen.market_opportunities', 'Buyer Opportunities')}
                </h2>
                <p className="text-xs text-ink-muted">
                  {opportunities.length} {t('opportunities.verified_buyers_desc', 'verified commercial buyers looking for handcrafted items')}
                </p>
              </div>

              <Link
                to="/artisan/opportunities"
                className="text-xs text-amber-acc hover:text-amber-900 font-medium flex items-center gap-1 hover:underline"
              >
                <span>{t('view_all_opportunities', 'View all opportunities')}</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previewOpportunities.map((opp) => (
                <div
                  key={opp.buyer_id}
                  className="clay-card p-4 flex flex-col justify-between gap-3 bg-white hover:border-stone-400/60 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="clay-badge clay-badge-neutral text-[9px]">
                        {opp.buyer_type || 'Retailer'}
                      </span>
                      {opp.region_preferences && (
                        <span className="text-[10px] text-ink-faint">
                          📍 {Array.isArray(opp.region_preferences) ? opp.region_preferences[0] : opp.region_preferences}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-ink line-clamp-1 mb-1">
                      {opp.display_name || opp.buyer_name}
                    </h3>

                    <p className="text-xs text-ink-soft line-clamp-2 mb-2 leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="bg-stone-50 p-2 rounded border border-stone-200 text-[11px] space-y-1">
                      <div className="flex justify-between text-ink-muted">
                        <span>{t('opportunities.quantity_needed', 'Quantity')}:</span>
                        <strong className="text-ink">{opp.quantity_min || opp.min_quantity}–{opp.quantity_max || opp.max_quantity} {t('opportunities.units_needed', 'pcs')}</strong>
                      </div>
                      <div className="flex justify-between text-ink-muted">
                        <span>{t('opportunities.budget_range', 'Budget')}:</span>
                        <strong className="text-forest">₹{opp.budget_min}–₹{opp.budget_max}</strong>
                      </div>
                    </div>

                    <p className="text-[10px] text-amber-900 bg-amber-soft/60 p-1.5 rounded mt-2">
                      ✨ {opp.match_reason || t('opportunities.matches_workshop', 'Matches your terracotta & craft specialty.')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenProposal(opp)}
                    className="clay-btn clay-btn-primary w-full flex items-center justify-center gap-1 text-xs py-1.5"
                  >
                    <span>{t('opportunities.send_proposal', 'Send Proposal')}</span>
                    <PaperPlaneTilt size={13} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Passport / Business Identity Credibility ─────────────────── */}
        <section className="clay-card p-6 bg-stone-900 text-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <IdentificationBadge size={26} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold bg-white/10 px-2 py-0.5 rounded">
                  {t('passport.official_id', 'Official Artisan Passport')}
                </span>
                <span className="font-mono text-xs text-stone-300">
                  KG-2024-8921
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">
                {DEMO_ARTISAN.name} · {DEMO_ARTISAN.craftTitle}
              </h3>
              <p className="text-xs text-stone-300 mt-1 max-w-lg leading-relaxed">
                {t('passport.intro_desc', 'Your digital identity establishes verifiable provenance and GI craft authenticity for institutional buyers and global collectors.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => navigate('/passport/KG-2024-8921')}
              className="px-4 py-2 rounded bg-white text-stone-900 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              {t('passport.view_full', 'View Passport')}
            </button>
          </div>
        </section>

      </main>

      {/* Proposal Modal */}
      {activeOpportunity && (
        <ProposalModal
          isOpen={Boolean(activeOpportunity)}
          onClose={() => setActiveOpportunity(null)}
          opportunity={activeOpportunity}
          product={selectedProductForProposal}
          onSuccess={() => {
            showToast(t('proposal.sent_success', 'Proposal sent successfully!'))
          }}
        />
      )}

      {/* Floating Add (Mobile) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          useCatalogStore.getState().reset()
          navigate('/catalog?new=true')
        }}
        aria-label={t('add_new_product')}
        className="fixed bottom-20 right-5 z-40 w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center shadow-editorial-lg border border-ink-soft sm:hidden"
      >
        <Plus size={22} weight="bold" />
      </motion.button>

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
