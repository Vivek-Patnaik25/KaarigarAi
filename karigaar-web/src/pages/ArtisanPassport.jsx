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

export default function ArtisanPassport() {
  const { artisanId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const catalogStore = useCatalogStore()
  const [toastMessage, setToastMessage] = useState('')

  // Build profile merging parameter ID and catalog store data if available
  const profile = {
    ...DEFAULT_ARTISAN_PROFILE,
    artisanId: artisanId || DEFAULT_ARTISAN_PROFILE.artisanId,
    craftType: catalogStore.category ? catalogStore.category.replace(/_/g, ' ') : DEFAULT_ARTISAN_PROFILE.craftType,
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `Explore authentic handcrafted works by ${profile.name} (Artisan ID: ${profile.artisanId}) on KarigaarAI:`

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setToastMessage(t('passport.linkCopied', 'Link copied! Share on WhatsApp'))
      setTimeout(() => setToastMessage(''), 3500)
    } catch (err) {
      console.error('Clipboard copy error:', err)
    }

    // If Web Share API is available (especially on mobile), also offer native share
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} — Artisan Digital Passport`,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled share or not supported
      }
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-clay-bg flex flex-col">
      {/* Navbar - hidden on print */}
      <div className="no-print">
        <Navbar />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center">
        {/* Top Navigation Row (no-print) */}
        <div className="w-full flex items-center justify-between mb-6 no-print">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-heading font-bold text-clay-indigo hover:text-clay-primary transition-colors px-3 py-2 rounded-xl hover:bg-clay-deep/50 cursor-pointer"
          >
            <ArrowLeft size={18} weight="bold" />
            <span>{t('back_to_dashboard', 'Back to Dashboard')}</span>
          </button>

          <span className="text-xs font-bold text-clay-muted uppercase tracking-wider hidden sm:inline-block">
            {t('passport.title', 'Artisan Digital Passport')}
          </span>
        </div>

        {/* The Printable Passport Card Container */}
        <div className="passport-print-container w-full flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full max-w-xl"
          >
            <PassportCard profile={profile} />
          </motion.div>
        </div>

        {/* Action Buttons (Hidden when printing via #passport-actions and .no-print) */}
        <div id="passport-actions" className="no-print w-full max-w-xl flex flex-col sm:flex-row gap-3 items-center justify-center">
          {/* Share Store Button */}
          <ClayButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleShare}
            icon={<WhatsappLogo size={22} weight="fill" />}
            className="flex-1 shadow-lg"
          >
            {t('passport.shareButton', 'Share My Store')}
          </ClayButton>

          {/* Download as PDF Button */}
          <ClayButton
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleDownloadPDF}
            icon={<Printer size={22} weight="bold" />}
            className="flex-1 shadow-lg"
          >
            {t('passport.downloadButton', 'Download as PDF')}
          </ClayButton>
        </div>

        {/* Quick hint below buttons */}
        <p className="no-print text-xs text-clay-muted text-center mt-4">
          💡 This permanent ID card can be downloaded as a PDF, printed on cardstock, or shared directly with bulk buyers.
        </p>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/90 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 border border-emerald-500/30"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check size={18} weight="bold" />
              </div>
              <span className="text-sm font-medium font-sans">
                {toastMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
