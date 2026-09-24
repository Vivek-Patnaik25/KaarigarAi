import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Storefront,
  ArrowLeft,
  IdentificationBadge,
  Sparkle,
  ShareNetwork,
  WhatsappLogo,
  CheckCircle,
  Tag,
  ShieldCheck,
  House,
  CircleNotch,
  CopySimple,
  Check,
  Buildings
} from '@phosphor-icons/react'
import { fetchProductById } from '../config/api'
import Navbar from '../components/Navbar'
import ClayCard from '../components/ClayCard'
import ClayButton from '../components/ClayButton'
import ClayBadge from '../components/ClayBadge'
import GITagBanner from '../components/GITagBanner'
import MarketOpportunitiesModal from '../components/MarketOpportunitiesModal'

export default function PublicProductPage() {
  const { productId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLang, setSelectedLang] = useState('hi') // 'hi' or 'en'
  const [copied, setCopied] = useState(false)
  const [marketModalOpen, setMarketModalOpen] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return
      setLoading(true)
      setError('')
      try {
        const data = await fetchProductById(productId)
        if (data) {
          setProduct(data)
        } else {
          setError('उत्पाद नहीं मिला। कृपया लिंक की जाँच करें।')
        }
      } catch (err) {
        console.error('Failed to load public product:', err)
        setError(err.message || 'उत्पाद लोड करने में असमर्थ।')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const handleShare = async () => {
    const currentUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title || 'KarigaarAI Product',
          text: `कारीगर AI पर हस्तशिल्प उत्पाद देखें: ${product?.title} (₹${product?.price})`,
          url: currentUrl,
        })
      } catch (err) {
        // user dismissed share sheet
      }
    } else {
      try {
        await navigator.clipboard.writeText(currentUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch (e) {
        console.error('Clipboard copy failed:', e)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-clay-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <CircleNotch size={48} className="animate-spin text-clay-primary" />
          <p className="text-sm font-bold text-clay-indigo font-heading">
            कारीगर AI से उत्पाद लोड हो रहा है...
          </p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-clay-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 text-red-500 flex items-center justify-center shadow-inner">
            <Storefront size={40} weight="fill" />
          </div>
          <h2 className="text-xl font-bold text-clay-indigo font-heading">
            {error || 'उत्पाद नहीं मिला'}
          </h2>
          <p className="text-xs text-clay-muted">
            हो सकता है कि यह उत्पाद हटा दिया गया हो या इसका स्थायी लिंक बदल गया हो।
          </p>
          <ClayButton variant="primary" size="md" onClick={() => navigate('/dashboard')} icon={<House size={18} />}>
            डैशबोर्ड पर जाएं
          </ClayButton>
        </div>
      </div>
    )
  }

  const listing = product.listing || {}
  const aiMeta = product.ai_metadata || {}
  const activeTitle = selectedLang === 'hi' ? (listing.title_hi || product.title) : (listing.title_en || product.title)
  const activeDesc = selectedLang === 'hi' ? (listing.description_hi || product.description) : (listing.description_en || product.description)

  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  let imageUrl = product.image_url || '/demo/enhanced_pottery.jpg'
  if (imageUrl.startsWith('/v1/media/') || imageUrl.startsWith('v1/media/')) {
    imageUrl = `${backendBase}/${imageUrl.replace(/^\//, '')}`
  } else if (imageUrl.startsWith('/temp/') || imageUrl.startsWith('temp/')) {
    imageUrl = `${backendBase}/${imageUrl.replace(/^\//, '')}`
  }

  const whatsappMessage = encodeURIComponent(
    `नमस्ते! मैं आपके हस्तनिर्मित उत्पाद "${activeTitle}" (आईडी: ${product.product_id}) को ₹${product.price} में खरीदने के लिए इच्छुक हूँ। कृपया विवरण साझा करें।`
  )
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-clay-bg flex flex-col pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => (window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/dashboard'))}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-clay-indigo hover:text-clay-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} weight="bold" />
            <span>{t('back', 'वापस जाएं (Back)')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMarketModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-heading font-bold text-xs flex items-center gap-1.5 border border-indigo-200 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Buildings size={16} weight="duotone" className="text-indigo-600" />
              <span>बाज़ार के अवसर (Market Matches)</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-2xl bg-clay-surface hover:bg-clay-deep text-clay-indigo font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm border border-white/60 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check size={16} weight="bold" className="text-emerald-600" /> : <ShareNetwork size={16} weight="bold" />}
              <span>{copied ? 'लिंक कॉपी हो गया!' : 'शेयर करें (Share)'}</span>
            </button>

            <Link
              to={`/passport/${product.artisan_id || 'KG-2024-8921'}`}
              className="px-3.5 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-heading font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 transition-all active:scale-95"
            >
              <IdentificationBadge size={16} weight="fill" className="text-amber-600" />
              <span>कारीगर पासपोर्ट</span>
            </Link>
          </div>
        </div>

        {/* GI Tag Contextual Awareness Banner */}
        <GITagBanner category={product.category} />

        {/* Main Product Showcase Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left Column: Enhanced Studio Image Showcase */}
          <div className="flex flex-col gap-3">
            <ClayCard className="p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-center bg-white">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-clay-surface flex items-center justify-center shadow-inner relative group">
                <img
                  src={imageUrl}
                  alt={activeTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/demo/enhanced_pottery.jpg'
                  }}
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                  <Sparkle size={14} weight="fill" className="text-amber-400" />
                  <span>AI Studio Enhanced</span>
                </div>
              </div>

              {/* Verified Authentic Badge */}
              <div className="mt-4 w-full flex items-center justify-between text-xs text-clay-muted border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck size={18} weight="fill" />
                  <span>प्रमाणित हस्तनिर्मित शिल्प</span>
                </div>
                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-600">
                  {product.product_id}
                </span>
              </div>
            </ClayCard>
          </div>

          {/* Right Column: Details, Pricing, Multilingual Tabs */}
          <div className="flex flex-col gap-5">
            <ClayCard className="p-6 sm:p-8 flex flex-col gap-5">
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ClayBadge variant="primary">
                  {product.category?.replace('_', ' ').toUpperCase()}
                </ClayBadge>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ● सक्रिय उत्पाद (Live)
                </span>
              </div>

              {/* Title & Language Switcher */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLang('hi')}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                      selectedLang === 'hi'
                        ? 'bg-clay-primary text-white shadow-sm'
                        : 'bg-clay-surface text-clay-indigo hover:bg-clay-deep'
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLang('en')}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                      selectedLang === 'en'
                        ? 'bg-clay-primary text-white shadow-sm'
                        : 'bg-clay-surface text-clay-indigo hover:bg-clay-deep'
                    }`}
                  >
                    English
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-clay-indigo font-heading leading-tight">
                  {activeTitle}
                </h1>
              </div>

              {/* Transparent Fair Price Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 flex items-baseline justify-between shadow-sm">
                <div>
                  <span className="text-xs font-black uppercase text-amber-800 tracking-wider block">
                    उचित शिल्प मूल्य (Fair Artisan Price)
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-clay-primary font-heading">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-500 block">100% कारीगर को सीधा भुगतान</span>
                  <span className="text-[11px] font-bold text-emerald-700">शून्य बिचौलिया कमीशन</span>
                </div>
              </div>

              {/* Cultural Heritage Story & Description */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-clay-muted">
                  उत्पाद की कहानी व विवरण (Story & Heritage)
                </h3>
                <p className="text-sm text-clay-text leading-relaxed font-sans whitespace-pre-line bg-clay-surface/50 p-4 rounded-2xl border border-white/60">
                  {activeDesc}
                </p>
              </div>

              {/* Craft Specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {listing.craft_tradition && (
                  <div className="p-3 rounded-xl bg-clay-surface border border-white/60">
                    <span className="text-clay-muted font-bold block">शिल्प परंपरा (Tradition):</span>
                    <span className="text-clay-indigo font-extrabold">{listing.craft_tradition}</span>
                  </div>
                )}
                {listing.material_detected && (
                  <div className="p-3 rounded-xl bg-clay-surface border border-white/60">
                    <span className="text-clay-muted font-bold block">प्राकृतिक सामग्री (Material):</span>
                    <span className="text-clay-indigo font-extrabold">{listing.material_detected}</span>
                  </div>
                )}
              </div>

              {/* SEO Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <Tag size={16} className="text-clay-muted shrink-0" />
                  {product.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Direct WhatsApp Purchase Action */}
              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setMarketModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all active:scale-98 cursor-pointer"
                >
                  <Buildings size={22} weight="duotone" />
                  <span>संबंधित खरीदार व बाज़ार अवसर देखें (Market Matches)</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-heading font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
                >
                  <WhatsappLogo size={24} weight="fill" />
                  <span>कारीगर से व्हाट्सएप पर संपर्क करें (Buy on WhatsApp)</span>
                </a>

                <div className="flex items-center justify-center gap-2 text-center text-xs text-clay-muted pt-1">
                  <Sparkle size={14} className="text-amber-500" />
                  <span>कारीगर AI द्वारा सत्यापित डिजिटल कैटलॉग</span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      </main>

      <MarketOpportunitiesModal
        isOpen={marketModalOpen}
        onClose={() => setMarketModalOpen(false)}
        productId={product.product_id}
        productTitle={activeTitle}
        productCategory={product.category}
        productPrice={product.price}
      />
    </div>
  )
}
