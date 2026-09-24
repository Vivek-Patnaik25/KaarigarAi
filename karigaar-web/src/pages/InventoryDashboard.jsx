import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Storefront, 
  Coins, 
  Package, 
  CheckCircle, 
  IdentificationBadge, 
  House, 
  Sparkle,
  ShareNetwork,
  Check,
  Tag
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import ListingMiniCard from '../components/ListingMiniCard'
import ClayButton from '../components/ClayButton'
import ClayCard from '../components/ClayCard'

import { fetchMyListings, updateProductStatus, deleteProduct } from '../config/api'

const STORAGE_KEY = 'karigaar_listings'

// Optional initial mock seed if user has never used the app before
export const SEED_LISTINGS = [
  {
    id: 'lst-101',
    product_id: 'lst-101',
    title: 'हस्तनिर्मित राजस्थानी मिट्टी का घड़ा (Terracotta Heritage Pot)',
    category: 'pottery_terracotta',
    price: 1939,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lst-102',
    product_id: 'lst-102',
    title: 'बनारसी ज़री हैंडलूम रेशमी दुपट्टा (Zari Silk Dupatta)',
    category: 'textile_handloom',
    price: 2850,
    status: 'sold',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'lst-103',
    product_id: 'lst-103',
    title: 'पीतल की नक्काशीदार धूपदानी (Carved Brass Burner)',
    category: 'metalcraft',
    price: 1350,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
]

export default function InventoryDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')

  // Smooth scroll to hash anchor if present (e.g. #listings or #earnings)
  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash)
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [location.hash])

  // Load from MongoDB backend on mount with fallback
  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchMyListings('KG-2024-8921')
      const items = Array.isArray(data) ? data : (data?.listings || [])
      if (Array.isArray(items) && items.length > 0) {
        // Map backend schema to unified listing structure for cards
        const mapped = items.map((item) => ({
          id: item.product_id,
          product_id: item.product_id,
          title: item.title_hi || item.title_en || item.title || 'Handcrafted Artisan Item',
          title_en: item.title_en,
          title_hi: item.title_hi,
          category: item.category,
          price: item.price,
          status: item.status || 'published',
          image: item.image_url || (item.image_gridfs_id ? `/v1/media/${item.image_gridfs_id}` : null),
          createdAt: item.published_at || item.created_at || new Date().toISOString(),
          public_url: item.public_url || `/p/${item.product_id}`,
        }))
        setListings(mapped)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped))
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('Backend listings fetch failed, checking local cache:', err)
    }

    // Fallback to local storage or seed
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
      setListings(SEED_LISTINGS)
    } catch (e) {
      console.error('Failed to load listings:', e)
      setListings(SEED_LISTINGS)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle status toggle (active <-> sold)
  const handleStatusChange = async (id, newStatus) => {
    // Optimistic UI update
    const updated = listings.map((item) =>
      (item.id === id || item.product_id === id) ? { ...item, status: newStatus } : item
    )
    setListings(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {}

    // Call backend API
    try {
      await updateProductStatus(id, newStatus)
    } catch (e) {
      console.warn('Backend status update failed:', e)
    }

    setToastMessage(
      newStatus === 'sold'
        ? t('dashboard.marked_sold', 'Listing marked as Sold! 🎉')
        : t('dashboard.marked_active', 'Listing reactivated!')
    )
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Handle delete
  const handleDelete = async (id) => {
    // Optimistic UI update
    const updated = listings.filter((item) => item.id !== id && item.product_id !== id)
    setListings(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {}

    // Call backend API
    try {
      await deleteProduct(id)
    } catch (e) {
      console.warn('Backend delete failed:', e)
    }

    setToastMessage(t('dashboard.deleted', 'Listing removed from inventory'))
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Handle share
  const handleShare = async (listing) => {
    const id = listing.product_id || listing.id
    const shareUrl = id.startsWith('KRG-') || id.startsWith('lst-')
      ? `${window.location.origin}/p/${id}`
      : `${window.location.origin}/passport/KG-2024-8921`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setToastMessage(t('passport.linkCopied', 'Public product link copied to clipboard!'))
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Clipboard copy error:', err)
    }
  }

  // Calculate stats
  const activeCount = listings.filter((l) => ['active', 'published'].includes((l.status || 'published').toLowerCase())).length
  const totalCount = listings.length

  // Calculate earnings for sold items in current month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyEarnings = listings
    .filter((l) => {
      if ((l.status || '').toLowerCase() !== 'sold') return false
      if (!l.createdAt) return true
      const d = new Date(l.createdAt)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, l) => sum + (Number(l.price) || 0), 0)

  return (
    <div className="min-h-screen bg-clay-bg flex flex-col relative pb-24">
      {/* Top Navigation */}
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-8">
        {/* Header Title with Passport & Quick Access */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-clay-primary bg-clay-primary-soft/40 px-2.5 py-0.5 rounded-full border border-clay-primary/30">
                {t('dashboard.business_glance', 'Business at a Glance')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-clay-indigo font-heading">
              {t('dashboard.inventory_title', 'Artisan Store & Inventory')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/passport/KG-2024-8921')}
              className="px-4 py-2.5 rounded-2xl bg-clay-surface hover:bg-clay-deep text-clay-indigo font-heading font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm border border-white/60 transition-all active:scale-95"
            >
              <IdentificationBadge size={20} weight="fill" className="text-amber-600" />
              <span>{t('passport.title', 'My Passport')}</span>
            </button>

            <ClayButton
              variant="primary"
              size="md"
              onClick={() => navigate('/catalog')}
              icon={<Plus size={18} weight="bold" />}
              className="shadow-md hidden sm:inline-flex"
            >
              {t('add_new_product', 'Add Product')}
            </ClayButton>
          </div>
        </div>

        {/* TOP ROW: 3 StatCards (stacked on mobile, 3 columns on desktop) */}
        <div id="earnings" className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 scroll-mt-24">
          <StatCard
            label={t('dashboard.active_listings', 'Active Listings')}
            value={activeCount}
            variant="primary"
            icon={<Package size={22} weight="fill" />}
            subtext={`${activeCount} available in catalog`}
          />

          <StatCard
            label={t('dashboard.monthly_earnings', "This Month's Earnings")}
            value={`₹${monthlyEarnings.toLocaleString('en-IN')}`}
            variant="success"
            icon={<Coins size={22} weight="fill" />}
            subtext="From verified sales"
          />

          <StatCard
            label={t('dashboard.total_products', 'Total Products')}
            value={totalCount}
            variant="indigo"
            icon={<Storefront size={22} weight="fill" />}
            subtext={`${totalCount - activeCount} archived / sold`}
          />
        </div>

        {/* LISTINGS SECTION */}
        <section id="listings" className="flex flex-col gap-4 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-clay-indigo font-heading">
              {t('recent_listings', 'My Product Listings')}
            </h2>
            <span className="text-xs font-bold text-clay-muted">
              {listings.length} items total
            </span>
          </div>

          {listings.length === 0 ? (
            /* Empty State */
            <ClayCard className="p-10 text-center flex flex-col items-center justify-center gap-4 my-6">
              <div className="w-20 h-20 rounded-full bg-clay-primary-soft/40 flex items-center justify-center text-clay-primary shadow-inner">
                <Storefront size={40} weight="fill" />
              </div>

              <div className="max-w-md">
                <h3 className="text-lg font-bold text-clay-indigo font-heading mb-1">
                  {t('dashboard.empty_title', "You haven't listed anything yet")}
                </h3>
                <p className="text-sm text-clay-muted">
                  {t('dashboard.empty_sub', 'Tap + to photograph and publish your first handcrafted craft product with AI.')}
                </p>
              </div>

              <ClayButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/catalog')}
                icon={<Plus size={22} weight="bold" />}
                className="mt-2 shadow-lg"
              >
                {t('add_new_product', 'Add Your First Product')}
              </ClayButton>
            </ClayCard>
          ) : (
            /* Listings Grid (1 col on mobile, 2 col on desktop) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {listings.map((item) => (
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
      </main>

      {/* Floating Action Button (Fixed bottom right) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate('/catalog')}
        aria-label="Add new product"
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-tr from-[#df7829] to-[#f29649] text-white shadow-2xl flex items-center justify-center border-2 border-white/60 hover:shadow-orange-500/50 cursor-pointer"
      >
        <Plus size={32} weight="bold" />
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/90 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 border border-emerald-500/30"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={16} weight="bold" />
            </div>
            <span className="text-xs sm:text-sm font-medium font-sans">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
