import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShareNetwork, 
  Printer, 
  ArrowLeft, 
  Check, 
  Storefront, 
  WhatsappLogo,
  House
} from '@phosphor-icons/react'
import PassportCard, { DEFAULT_ARTISAN_PROFILE } from '../components/PassportCard'
import ClayButton from '../components/ClayButton'
import Navbar from '../components/Navbar'
import { useCatalogStore } from '../store/catalogStore'
import { getArtisanProfile } from '../config/auth'

export default function ArtisanPassport() {
  const { artisanId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const catalogStore = useCatalogStore()
  const [toastMessage, setToastMessage] = useState('')

  const storedArtisan = getArtisanProfile()

  // Build profile merging stored artisan, parameter ID, and catalog store data if available
  const profile = {
    ...DEFAULT_ARTISAN_PROFILE,
    ...storedArtisan,
    name: storedArtisan.nameHi ? `${storedArtisan.nameHi} (${storedArtisan.name})` : (storedArtisan.name || DEFAULT_ARTISAN_PROFILE.name),
    region: storedArtisan.location || DEFAULT_ARTISAN_PROFILE.region,
    yearsActive: storedArtisan.yearsActive || DEFAULT_ARTISAN_PROFILE.yearsActive,
    avatarUrl: storedArtisan.avatarUrl || DEFAULT_ARTISAN_PROFILE.avatarUrl,
    artisanId: artisanId || storedArtisan.artisanId || DEFAULT_ARTISAN_PROFILE.artisanId,
    craftType: storedArtisan.craftTitle || (catalogStore.category ? catalogStore.category.replace(/_/g, ' ') : DEFAULT_ARTISAN_PROFILE.craftType),
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `Explore authentic handcrafted works by ${profile.name} (Artisan ID: ${profile.artisanId}) on KarigaarAI:`

    try {
      await navigator.clipboard.writeText(shareUrl)
      setToastMessage(t('passport.linkCopied', 'Link copied! Share on WhatsApp'))
      setTimeout(() => setToastMessage(''), 3500)
    } catch (err) {
      console.error('Clipboard copy error:', err)
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} — Artisan Digital Passport`,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled share
      }
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      {/* Navbar - hidden on print */}
      <div className="no-print">
        <Navbar />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center">
        {/* Top Navigation Row (no-print) */}
        <div className="w-full flex items-center justify-between mb-6 no-print">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors px-2 py-1 rounded hover:bg-stone-200/50 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t('screen.dashboard_go')}</span>
          </button>

          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider hidden sm:inline-block">
            {t('passport.title', 'Artisan Digital Passport')}
          </span>
        </div>

        {/* The Printable Passport Card Container */}
        <div className="passport-print-container w-full flex justify-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-xl"
          >
            <PassportCard profile={profile} />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div id="passport-actions" className="no-print w-full max-w-xl flex flex-col sm:flex-row gap-3 items-center justify-center">
          <ClayButton
            variant="primary"
            size="md"
            fullWidth
            onClick={handleShare}
            icon={<WhatsappLogo size={18} weight="fill" />}
            className="flex-1"
          >
            {t('passport.shareButton', 'Share My Store')}
          </ClayButton>

          <ClayButton
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleDownloadPDF}
            icon={<Printer size={18} />}
            className="flex-1"
          >
            {t('passport.downloadButton', 'Download as PDF')}
          </ClayButton>
        </div>

        {/* Quick hint below buttons */}
        <p className="no-print text-xs text-stone-500 text-center mt-4">
          💡 {t('screen.published_saved')}
        </p>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-6 z-50 px-4 py-2.5 rounded bg-stone-900 text-white shadow-lg flex items-center gap-2.5 border border-stone-700 text-xs font-medium"
            >
              <Check size={16} className="text-emerald-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
