import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  ShareNetwork,
  PlusCircle,
  House,
  Storefront,
  Check,
  CopySimple,
  IdentificationBadge,
  FileText,
  ArrowSquareOut
} from '@phosphor-icons/react'
import { useCatalogStore } from '../store/catalogStore'
import ClayCard from '../components/ClayCard'
import ClayButton from '../components/ClayButton'

export default function SuccessPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    title,
    price,
    enhancedImageUrl,
    imagePreview,
    publishedProductId,
    publishedPublicUrl,
    reset
  } = useCatalogStore()
  
  const [copied, setCopied] = useState(false)

  const activeProductId = publishedProductId || 'KRG-LIVE'
  const activePublicUrl = publishedPublicUrl || `${window.location.origin}/p/${activeProductId}`

  useEffect(() => {
    // Festive Saffron + Indigo Confetti Burst
    const end = Date.now() + 1.2 * 1000
    const colors = ['#E8873A', '#3D5A8A', '#F5C49A', '#6DBF8A', '#FFFFFF']

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'हस्तनिर्मित शिल्प — KarigaarAI',
          text: `कारीगर AI पर नया उत्पाद प्रकाशित हुआ: ${title || 'पारंपरिक हस्तशिल्प'} ₹${price}`,
          url: activePublicUrl,
        })
      } catch (err) {
        // user canceled
      }
    } else {
      await navigator.clipboard.writeText(activePublicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
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

  const handleAddNew = () => {
    reset()
    navigate('/catalog')
  }

  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  let displayImage = enhancedImageUrl || imagePreview || '/demo/enhanced_pottery.jpg'
  if (displayImage.startsWith('/v1/media/') || displayImage.startsWith('v1/media/')) {
    displayImage = `${backendBase}/${displayImage.replace(/^\//, '')}`
  } else if (displayImage.startsWith('/temp/') || displayImage.startsWith('temp/')) {
    displayImage = `${backendBase}/${displayImage.replace(/^\//, '')}`
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#273D63] via-[#3D5A8A] to-[#1E2E4B] text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full flex flex-col items-center text-center gap-5"
      >
        {/* Animated Checkmark SVG */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-4 border-clay-primary/60 shadow-2xl">
          <svg
            width="56"
            height="56"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M16 34L26 44L48 20"
              stroke="#E8873A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
        </div>

        {/* Festive Heading & ID */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
            {t('publish_success', 'उत्पाद सफलतापूर्वक प्रकाशित हुआ!')}
          </h1>
          <p className="text-sm text-amber-200/90 mt-1 font-medium">
            कारीगर AI डिजिटल कैटलॉग में स्थायी रूप से सहेज दिया गया है
          </p>
          <div className="inline-block mt-2 px-3.5 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-mono font-bold border border-white/20">
            ID: {activeProductId}
          </div>
        </div>

        {/* Product Thumbnail + Title Card (white clay card) */}
        <div className="w-full p-4 rounded-3xl bg-white text-clay-text shadow-2xl flex items-center gap-4 border border-white/80">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-clay-surface shadow-inner shrink-0">
            <img
              src={displayImage}
              alt="Published product"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = '/demo/enhanced_pottery.jpg' }}
            />
          </div>
          <div className="text-left flex-1 min-w-0">
            <span className="text-[11px] font-black uppercase text-clay-primary tracking-wider block">
              सक्रिय डिजिटल कैटलॉग (Live)
            </span>
            <h3 className="text-sm sm:text-base font-bold text-clay-indigo font-heading truncate">
              {title || 'हस्तनिर्मित शिल्प उत्पाद'}
            </h3>
            <span className="text-lg font-black text-clay-primary">
              ₹{Number(price || 1939).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* 1. View Public Listing */}
          <ClayButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/p/${activeProductId}`)}
            icon={<ArrowSquareOut size={20} weight="bold" />}
          >
            लाइव उत्पाद देखें (View Live Listing)
          </ClayButton>

          {/* 2. Copy Link / Share */}
          <ClayButton
            variant="ghost"
            size="lg"
            fullWidth
            onClick={handleCopyLink}
            icon={copied ? <Check size={20} weight="bold" /> : <CopySimple size={20} weight="bold" />}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            {copied ? 'लिंक कॉपी हो गया!' : 'पब्लिक लिंक कॉपी करें (Copy Link)'}
          </ClayButton>

          {/* 3. Add Another Product */}
          <ClayButton
            variant="ghost"
            size="lg"
            fullWidth
            onClick={handleAddNew}
            icon={<PlusCircle size={20} weight="bold" />}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            {t('add_another', 'नया उत्पाद जोड़ें')}
          </ClayButton>

          {/* 4. Back to Dashboard / My Listings */}
          <button
            type="button"
            onClick={() => {
              reset()
              navigate('/dashboard')
            }}
            className="text-sm font-bold text-amber-200/90 hover:text-white flex items-center justify-center gap-1.5 mt-2 transition-colors cursor-pointer"
          >
            <House size={18} />
            <span>माई लिस्टिंग्स / डैशबोर्ड पर जाएं (My Listings)</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
