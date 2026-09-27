import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlass,
  Funnel,
  Heart,
  Storefront,
  MapPin,
  ShieldCheck,
  Tag,
  SlidersHorizontal,
  X,
  Check,
  ArrowRight,
  ChatCircleText,
  WhatsappLogo
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import BuyerProposalModal from '../components/BuyerProposalModal'
import { getAllMarketplaceProducts } from '../config/productsCatalog'
import { fetchMyListings } from '../config/api'
import { getShortlist, toggleShortlist, isInShortlist } from '../config/auth'
import { useLanguageStore } from '../store/languageStore'

export default function BuyerDiscoverPage() {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriceRange, setSelectedPriceRange] = useState('all') // 'all' | 'under_1500' | '1500_3000' | 'above_3000'
  const [selectedMoq, setSelectedMoq] = useState('all') // 'all' | 'under_20' | '20_100' | 'above_100'
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [giOnly, setGiOnly] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [shortlistVersion, setShortlistVersion] = useState(0)

  // Modal states
  const [selectedProductForProposal, setSelectedProductForProposal] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  const loadCatalog = async () => {
    setLoading(true)
    try {
      // Fetch backend listings to combine with curated craft products
      const backendRes = await fetchMyListings('KG-2024-8921').catch(() => ({ listings: [] }))
      const liveItems = Array.isArray(backendRes) ? backendRes : (backendRes?.listings || [])
      const catalog = getAllMarketplaceProducts(liveItems, language)
      setProducts(catalog)
    } catch (err) {
      console.warn('Failed to fetch marketplace products:', err)
      setProducts(getAllMarketplaceProducts([], language))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCatalog()
  }, [language])

  const handleToggleShortlist = (e, product) => {
    e.stopPropagation()
    e.preventDefault()
    toggleShortlist(product)
    setShortlistVersion(v => v + 1)
    const active = isInShortlist(product.product_id || product.id)
    showToast(active ? t('shortlist.added', 'Added to shortlist') : t('shortlist.removed', 'Removed from shortlist'))
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // Categories list
  const categories = [
    { id: 'all', label: t('all_categories', 'All Crafts') },
    { id: 'pottery_terracotta', label: t('category.pottery', 'Pottery & Terracotta') },
    { id: 'textile_handloom', label: t('category.handloom', 'Textile Handloom') },
    { id: 'textile_embroidery', label: t('category.embroidery', 'Embroidery') },
    { id: 'woodcraft', label: t('category.woodcraft', 'Woodcraft') },
    { id: 'metalcraft', label: t('category.metalcraft', 'Metalcraft') },
    { id: 'painting_folk', label: t('category.painting', 'Folk Painting') },
  ]

  // Mapping from category slug → i18n key for product card rendering
  const CATEGORY_I18N_KEY = {
    pottery_terracotta: 'category.pottery',
    textile_handloom: 'category.handloom',
    textile_embroidery: 'category.embroidery',
    woodcraft: 'category.woodcraft',
    metalcraft: 'category.metalcraft',
    painting_folk: 'category.painting',
    jewellery: 'category.jewellery',
  }

  const getCategoryLabel = (product) => {
    const slug = product.category || ''
    const key = CATEGORY_I18N_KEY[slug]
    if (key) return t(key)
    // Fallback: humanize slug
    return product.category_name || slug.replace(/_/g, ' ')
  }

  const regions = [
    { id: 'all', label: t('all_regions', 'All Regions') },
    { id: 'Rajasthan', label: t('region.rajasthan', 'Rajasthan') },
    { id: 'Uttar Pradesh', label: t('region.uttar_pradesh', 'Uttar Pradesh') },
    { id: 'Odisha', label: t('region.odisha', 'Odisha') },
    { id: 'Bihar', label: t('region.bihar', 'Bihar') },
    { id: 'Chhattisgarh', label: t('region.chhattisgarh', 'Chhattisgarh') },
  ]

  // Price ranges list
  const priceRanges = [
    { id: 'all', label: t('all_prices', 'All Prices') },
    { id: 'under_1500', label: t('filter_under_1500', 'Under ₹1,500') },
    { id: '1500_3000', label: t('filter_1500_3000', '₹1,500 – ₹3,000') },
    { id: 'above_3000', label: t('filter_above_3000', 'Above ₹3,000') },
  ]

  // MOQ Filter Chips
  const moqChips = [
    { id: 'all', label: language === 'mr' ? 'सर्व' : (language === 'hi' ? 'सभी' : 'All') },
    { id: 'under_20', label: language === 'mr' ? '< 20 नग' : (language === 'hi' ? '< 20 नग' : '< 20 units') },
    { id: '20_100', label: language === 'mr' ? '20–100 नग' : (language === 'hi' ? '20–100 नग' : '20–100 units') },
    { id: 'above_100', label: language === 'mr' ? '100+ नग' : (language === 'hi' ? '100+ नग' : '100+ units') },
  ]

  // Filter application
  const filteredProducts = products.filter(item => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = (item.title || '').toLowerCase().includes(q)
      const catMatch = (item.category_name || item.category || '').toLowerCase().includes(q)
      const artisanMatch = (item.artisan_name || '').toLowerCase().includes(q)
      const locMatch = (item.location || '').toLowerCase().includes(q)
      const matMatch = (item.material || '').toLowerCase().includes(q)
      if (!titleMatch && !catMatch && !artisanMatch && !locMatch && !matMatch) return false
    }

    // 2. Category
    if (selectedCategory !== 'all') {
      if (item.category !== selectedCategory && !item.category?.includes(selectedCategory)) return false
    }

    // 3. Price Range
    if (selectedPriceRange === 'under_1500' && item.price >= 1500) return false
    if (selectedPriceRange === '1500_3000' && (item.price < 1500 || item.price > 3000)) return false
    if (selectedPriceRange === 'above_3000' && item.price <= 3000) return false

    // 4. MOQ Filter
    if (selectedMoq !== 'all') {
      const itemMoq = Number(item.moq) || 10
      if (selectedMoq === 'under_20' && itemMoq >= 20) return false
      if (selectedMoq === '20_100' && (itemMoq < 20 || itemMoq > 100)) return false
      if (selectedMoq === 'above_100' && itemMoq < 100) return false
    }

    // 5. Region
    if (selectedRegion !== 'all') {
      if (!item.location?.toLowerCase().includes(selectedRegion.toLowerCase())) return false
    }

    // 6. GI Certified only
    if (giOnly && !item.has_gi_tag) return false

    return true
  })

  const resetFilters = () => {
    setSelectedCategory('all')
    setSelectedPriceRange('all')
    setSelectedMoq('all')
    setSelectedRegion('all')
    setGiOnly(false)
    setSearchQuery('')
  }

  const hasActiveFilters = selectedCategory !== 'all' || selectedPriceRange !== 'all' || selectedMoq !== 'all' || selectedRegion !== 'all' || giOnly || searchQuery !== ''

  return (
    <div className="min-h-screen bg-stone-bg flex flex-col pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="section-label mb-0.5">{t('buyer.marketplace_subtitle', 'Curated Craft Catalogue')}</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink">
              {t('buyer.discover_title', 'Discover Authentic Indian Crafts')}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              {t('buyer.discover_desc', 'Connect directly with master artisans. Source authentic, verified handmade items for retail, hospitality, or collection.')}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('buyer.search_placeholder', 'Search craft, material, artisan or city...')}
              className="clay-input pl-9 text-xs w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Category Filter Bar ────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs border-b border-stone-200/80">
          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                    : 'bg-white hover:bg-stone-100 text-ink-muted hover:text-ink border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-100 border border-stone-200 text-xs font-medium text-ink shrink-0"
          >
            <SlidersHorizontal size={14} />
            <span>{t('filter', 'Filter')}</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-acc inline-block" />}
          </button>
        </div>

        {/* ── Main Layout: Desktop Sidebar Filters + Product Grid ────────── */}
        <div className="flex items-start gap-8">

          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:flex flex-col gap-6 w-56 shrink-0 clay-card p-4 bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Funnel size={14} /> {t('filters_title', 'Filter Products')}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-amber-acc hover:underline"
                >
                  {t('reset', 'Reset')}
                </button>
              )}
            </div>

            {/* Price Range Filter */}
            <div>
              <p className="section-label mb-2">{t('filter_price', 'Price Range')}</p>
              <div className="flex flex-col gap-1.5 text-xs text-ink-soft">
                {priceRanges.map(p => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:text-ink">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange === p.id}
                      onChange={() => setSelectedPriceRange(p.id)}
                      className="accent-stone-900"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <p className="section-label mb-2">{t('filter_region', 'Region / State')}</p>
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="clay-input text-xs py-1.5"
              >
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* GI Certification Toggle */}
            <div className="pt-2 border-t border-stone-200">
              <label className="flex items-center gap-2 text-xs text-ink font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={giOnly}
                  onChange={e => setGiOnly(e.target.checked)}
                  className="accent-stone-900 rounded"
                />
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-forest" weight="fill" />
                  <span>{t('filter_gi_only', 'GI Tagged only')}</span>
                </span>
              </label>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Active filters bar / count */}
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>
                {t('showing_products_count', { count: filteredProducts.length, defaultValue: `Showing ${filteredProducts.length} handcrafted products` })}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-amber-acc hover:underline font-medium"
                >
                  {t('clear_all_filters', 'Clear filters')}
                </button>
              )}
            </div>

            {/* MOQ Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
              <span className="text-xs font-semibold text-ink-muted shrink-0 mr-1">
                MOQ:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {moqChips.map((chip) => {
                  const isActive = selectedMoq === chip.id
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setSelectedMoq(chip.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#1B2E6B] text-white border border-[#1B2E6B] shadow-2xs'
                          : 'border border-[#1B2E6B] text-[#1B2E6B] hover:bg-[#1B2E6B]/5 bg-transparent'
                      }`}
                    >
                      {chip.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="clay-card h-80 skeleton rounded-lg" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredProducts.length === 0 && (
              <div className="clay-card p-12 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-stone-surface flex items-center justify-center text-2xl">
                  🔍
                </div>
                <h3 className="text-base font-semibold text-ink">
                  {t('buyer.no_products_found', 'No craft products match your filters')}
                </h3>
                <p className="text-xs text-ink-muted max-w-sm">
                  {t('buyer.no_products_desc', 'Try clearing some filters or searching for another craft category.')}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="clay-btn clay-btn-primary text-xs mt-2"
                >
                  {t('clear_all_filters', 'Reset All Filters')}
                </button>
              </div>
            )}

            {/* Product Cards Grid */}
            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map(product => {
                  const pId = product.product_id || product.id
                  const isSaved = isInShortlist(pId)

                  return (
                    <div
                      key={pId}
                      className="clay-card flex flex-col overflow-hidden group hover:shadow-editorial-md transition-shadow bg-white"
                    >
                      {/* Product Image & Shortlist Button */}
                      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url || '/images/craft_terracotta_pot.jpg'}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = '/images/craft_terracotta_pot.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🪔</div>
                        )}

                        {/* GI Tag Badge */}
                        {product.has_gi_tag && (
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-forest text-white text-[10px] font-semibold flex items-center gap-1 shadow-2xs">
                            <ShieldCheck size={12} weight="fill" />
                            <span>{t('gi_certified', 'GI Certified')}</span>
                          </div>
                        )}

                        {/* Heart Shortlist Action */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleShortlist(e, product)}
                          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition-colors shadow-2xs ${
                            isSaved
                              ? 'bg-white text-rose-500 hover:bg-stone-50'
                              : 'bg-black/30 text-white hover:bg-black/50'
                          }`}
                          aria-label={isSaved ? 'Remove from shortlist' : 'Add to shortlist'}
                        >
                          <Heart size={16} weight={isSaved ? 'fill' : 'regular'} />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          {/* Category & Region */}
                          <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1">
                            <span className="uppercase tracking-wider font-medium text-amber-900">
                              {getCategoryLabel(product)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MapPin size={11} className="text-stone-400" />
                              {product.location}
                            </span>
                          </div>

                          {/* Title */}
                          <Link
                            to={`/p/${pId}`}
                            className="text-sm font-semibold text-ink hover:text-amber-900 line-clamp-1 leading-snug transition-colors"
                          >
                            {product.title}
                          </Link>

                          {/* Artisan Identity */}
                          <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                            <span>{t('by_artisan', 'By')}</span>
                            <span className="font-medium text-ink-soft">{product.artisan_name}</span>
                          </p>
                        </div>

                        {/* Price & MOQ */}
                        <div className="pt-2 border-t border-stone-200/80 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] text-ink-faint block uppercase font-medium">
                              {t('price_direct', 'Direct Price')}
                            </span>
                            <span className="text-base font-bold text-ink">
                              ₹{product.price?.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {product.moq && (
                            <span className="text-[11px] text-ink-muted bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                              MOQ: {product.moq} {t('opportunities.units_needed', 'pcs')}
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Link
                            to={`/p/${pId}`}
                            className="clay-btn clay-btn-ghost text-xs py-1.5 flex items-center justify-center gap-1"
                          >
                            <span>{t('view_details', 'View')}</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setSelectedProductForProposal(product)}
                            className="clay-btn clay-btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
                          >
                            <span>{t('request_proposal', 'Inquire')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-ink/60 backdrop-blur-xs md:hidden">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white rounded-t-xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="font-semibold text-ink text-sm flex items-center gap-1.5">
                <Funnel size={16} /> {t('filters_title', 'Filter Products')}
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded text-ink-muted"
              >
                <X size={18} />
              </button>
            </div>

            {/* Price Filter */}
            <div>
              <p className="section-label mb-2">{t('filter_price', 'Price Range')}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {priceRanges.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPriceRange(p.id)}
                    className={`p-2 rounded border text-center transition-colors ${
                      selectedPriceRange === p.id ? 'bg-stone-900 text-white font-medium' : 'bg-stone-50 border-stone-200 text-ink'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <p className="section-label mb-2">{t('filter_region', 'Region / State')}</p>
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="clay-input text-xs py-2"
              >
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* GI Tagged only */}
            <label className="flex items-center gap-2 text-xs text-ink font-medium p-2 rounded bg-stone-50 border border-stone-200">
              <input
                type="checkbox"
                checked={giOnly}
                onChange={e => setGiOnly(e.target.checked)}
                className="accent-stone-900 rounded"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck size={15} className="text-forest" weight="fill" />
                <span>{t('filter_gi_only', 'GI Tagged only')}</span>
              </span>
            </label>

            {/* Apply Action */}
            <div className="flex gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={resetFilters}
                className="clay-btn clay-btn-ghost flex-1 text-xs"
              >
                {t('reset', 'Reset')}
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="clay-btn clay-btn-primary flex-1 text-xs"
              >
                {t('apply_filters', 'Show Results')} ({filteredProducts.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Buyer Proposal Request Modal */}
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
