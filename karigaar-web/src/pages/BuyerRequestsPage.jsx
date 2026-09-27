import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnvelopeSimple,
  Clock,
  CheckCircle,
  Storefront,
  PaperPlaneTilt,
  Plus,
  ArrowRight,
  MapPin,
  Check
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import { getBuyerRequests, saveBuyerRequest, getStoredUser } from '../config/auth'

export default function BuyerRequestsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentUser = getStoredUser()

  const [requests, setRequests] = useState([])
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customCraft, setCustomCraft] = useState('')
  const [customQty, setCustomQty] = useState('50')
  const [customBudget, setCustomBudget] = useState('1500')
  const [customNotes, setCustomNotes] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const refreshRequests = () => {
    setRequests(getBuyerRequests())
  }

  useEffect(() => {
    refreshRequests()
    window.addEventListener('karigaar_requests_changed', refreshRequests)
    return () => window.removeEventListener('karigaar_requests_changed', refreshRequests)
  }, [])

  const handleCreateCustomRequest = (e) => {
    e.preventDefault()
    if (!customCraft) return

    saveBuyerRequest({
      product_title: `Custom Requirement: ${customCraft}`,
      artisan_name: 'Open to All Regional Workshops',
      offered_unit_price: Number(customBudget) || 1500,
      proposed_quantity: Number(customQty) || 50,
      buyer_notes: customNotes || 'Looking for artisan workshop quotes',
      buyer_name: currentUser?.buyerName || currentUser?.name || 'Retail Buyer',
      status: 'submitted',
    })

    setShowCustomModal(false)
    setCustomCraft('')
    setCustomNotes('')
    showToast(t('buyer.custom_req_posted', 'Custom procurement brief posted!'))
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  return (
    <div className="min-h-screen bg-stone-bg flex flex-col pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="section-label mb-0.5">{t('buyer.requests_subtitle', 'Commercial Orders')}</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink">
              {t('buyer.requests_title', 'My Proposal Requests')}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              {t('buyer.requests_desc', 'Track the status of commercial inquiries and quotations requested from Indian artisan workshops.')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="clay-btn clay-btn-primary flex items-center gap-1.5 text-xs self-start sm:self-auto"
          >
            <Plus size={15} weight="bold" />
            <span>{t('buyer.post_requirement', 'Post Custom Requirement')}</span>
          </button>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="clay-card p-14 text-center flex flex-col items-center gap-4 bg-white">
            <div className="w-16 h-16 rounded-full bg-stone-surface flex items-center justify-center text-3xl">
              📬
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink mb-1">
                {t('buyer.no_requests_title', 'No proposal requests sent yet')}
              </h3>
              <p className="text-xs text-ink-muted max-w-sm leading-relaxed">
                {t('buyer.no_requests_desc', 'When you request custom quotations or commercial orders for handcrafted items, they will appear here with live workshop response tracking.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/buyer/discover')}
              className="clay-btn clay-btn-primary flex items-center gap-2 text-xs mt-2"
            >
              <span>{t('browse_catalogue', 'Browse Craft Catalogue')}</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="clay-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="clay-badge clay-badge-success text-[10px]">
                      {t('status_inquiry_sent', 'Proposal Requested')}
                    </span>
                    <span className="text-xs text-ink-faint">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-ink mt-0.5">
                    {req.product_title}
                  </h3>

                  <p className="text-xs text-ink-muted flex items-center gap-1">
                    <Storefront size={13} className="text-amber-acc" />
                    <span>{req.artisan_name}</span>
                  </p>

                  {req.buyer_notes && (
                    <p className="text-[11px] text-ink-soft bg-stone-50 p-2 rounded mt-1 border border-stone-100">
                      "{req.buyer_notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase text-ink-faint block font-medium">
                      {t('buyer.requested_qty', 'Quantity')}
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {req.proposed_quantity} units
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-ink-faint block font-medium">
                      {t('proposal.total_val', 'Est. Total')}
                    </span>
                    <span className="text-base font-bold text-forest">
                      ₹{(req.total_estimated || (req.offered_unit_price * req.proposed_quantity)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Post Custom Requirement Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-lg p-6 shadow-editorial-lg border border-stone-200"
          >
            <h3 className="text-base font-semibold text-ink mb-1">
              {t('buyer.post_req_modal_title', 'Post Procurement Requirement')}
            </h3>
            <p className="text-xs text-ink-muted mb-4">
              {t('buyer.post_req_modal_desc', 'Describe what craft you are looking to source in bulk.')}
            </p>

            <form onSubmit={handleCreateCustomRequest} className="flex flex-col gap-3.5">
              <div>
                <label className="section-label block mb-1">{t('buyer.craft_name_label', 'Craft / Product Name')}</label>
                <input
                  type="text"
                  required
                  value={customCraft}
                  onChange={e => setCustomCraft(e.target.value)}
                  placeholder="e.g. Handmade Ceramic Dinnerware Set"
                  className="clay-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-1">{t('buyer.desired_quantity', 'Quantity')}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customQty}
                    onChange={e => setCustomQty(e.target.value)}
                    className="clay-input text-xs"
                  />
                </div>
                <div>
                  <label className="section-label block mb-1">{t('buyer.budget_per_piece', 'Target Budget / pc (₹)')}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customBudget}
                    onChange={e => setCustomBudget(e.target.value)}
                    className="clay-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="section-label block mb-1">{t('buyer.custom_specs', 'Specifications')}</label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={e => setCustomNotes(e.target.value)}
                  placeholder="Specify sizes, finishes, packing or delivery timeline..."
                  className="clay-input text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="clay-btn clay-btn-ghost text-xs"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="clay-btn clay-btn-primary text-xs"
                >
                  {t('submit', 'Submit Brief')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
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
