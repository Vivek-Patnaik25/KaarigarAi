import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Storefront,
  MagnifyingGlass,
  Check,
  Warning,
  Eye,
  FileText,
  Trash,
  ShareNetwork,
  PencilSimple,
  CircleNotch
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import ListingMiniCard from '../components/ListingMiniCard'
import ClayButton from '../components/ClayButton'
import { fetchMyListings, updateProductStatus, deleteProduct } from '../config/api'
import { useLanguageStore } from '../store/languageStore'
import { useCatalogStore } from '../store/catalogStore'

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

export default function ArtisanProductsPage() {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const navigate = useNavigate()

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'published' | 'draft' | 'sold'
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState('')

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
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped)) } catch (_) {}
        setLoading(false)
        return
      }

      setListings([])
    } catch (err) {
      console.warn('Listings fetch fallback:', err)
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setListings(parsed)
            setLoading(false)
            return
          }
        }
      } catch (_) {}
      setListings([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadListings()
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

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Filter listings by tab and search
  const filteredListings = listings.filter(item => {
    // Tab filter
    if (activeTab === 'published' && item.status !== 'active') return false
    if (activeTab === 'draft' && item.status !== 'draft' && item.status !== 'archived') return false
    if (activeTab === 'sold' && item.status !== 'sold') return false

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = (item.title || '').toLowerCase().includes(q)
      const catMatch = (item.category || '').toLowerCase().includes(q)
      return titleMatch || catMatch
    }
    return true
  })

  const countByTab = {
    all: listings.length,
    published: listings.filter(l => l.status === 'active').length,
    draft: listings.filter(l => l.status === 'draft' || l.status === 'archived').length,
    sold: listings.filter(l => l.status === 'sold').length,
  }

  return (
    <div className="min-h-screen bg-stone-bg flex flex-col pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="section-label mb-1">{t('products.section_subtitle', 'Workshop Inventory')}</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink">
              {t('nav_my_products', 'My Products')}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              {t('products.manage_desc', 'Manage your catalog items, change availability statuses, and export wholesale spec sheets.')}
            </p>
          </div>

          <ClayButton
            variant="primary"
            size="md"
            onClick={() => {
              useCatalogStore.getState().reset()
              navigate('/catalog?new=true')
            }}
            icon={<Plus size={16} weight="bold" />}
          >
            {t('add_new_product', 'Add Product')}
          </ClayButton>
        </div>

        {/* Controls: Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded overflow-x-auto text-xs">
            {[
              { id: 'all', label: t('all', 'All') },
              { id: 'published', label: t('status_live', 'Live / Published') },
              { id: 'draft', label: t('status_draft', 'Drafts') },
              { id: 'sold', label: t('status_sold', 'Sold') },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-ink shadow-2xs font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab.label} ({countByTab[tab.id] || 0})
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search_products_placeholder', 'Search products...')}
              className="clay-input pl-8 py-1.5 text-xs w-full"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="clay-card h-24 skeleton" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredListings.length === 0 && (
          <div className="clay-card p-12 text-center flex flex-col items-center gap-4">
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
                {searchQuery ? t('products.no_search_results', 'No matching products found') : t('products.empty_tab_title', 'No products in this view')}
              </h3>
              <p className="text-xs text-ink-muted max-w-sm">
                {searchQuery
                  ? t('products.try_different_search', 'Try adjusting your search term or clear the filter.')
                  : t('dashboard.empty_sub', 'Take a photo to add your first handcrafted product.')}
              </p>
            </div>
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
        )}

        {/* Products List */}
        {!loading && filteredListings.length > 0 && (
          <div className="flex flex-col gap-3">
            {filteredListings.map(item => (
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
      </main>

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
