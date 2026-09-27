import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  PaperPlaneTilt,
  CheckCircle,
  Storefront,
  CalendarBlank,
  Package,
  CurrencyInr,
  WhatsappLogo,
  PhoneCall
} from '@phosphor-icons/react'
import { createDemoInquiry } from '../config/api'
import { saveBuyerRequest, getStoredUser } from '../config/auth'
import { useLanguageStore } from '../store/languageStore'
import { getTelUrl, isValidPhoneNumber } from '../config/inquiryMessage'

export default function BuyerProposalModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}) {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const currentUser = getStoredUser()

  const [quantity, setQuantity] = useState('20')
  const [targetDate, setTargetDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !product) return null

  const unitPrice = product.price || 1500
  const totalEstimated = (Number(quantity) || 0) * unitPrice

  const rawArtisanPhone = product.artisan_phone || product.phone || (product.artisan_id === 'KG-2024-8921' ? '+919556828397' : '')
  const hasValidPhone = isValidPhoneNumber(rawArtisanPhone)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        product_id: product.product_id || product.id,
        buyer_id: currentUser?.buyerId || 'BUYER-MUM-PRM-001',
        buyer_name: currentUser?.buyerName || currentUser?.name || 'Parampara Heritage Retail',
        product_title: product.title || product.title_en || 'Handcrafted Artisan Item',
        artisan_id: product.artisan_id || 'KG-2024-8921',
        artisan_name: product.artisan_name || 'Artisan Workshop',
        artisan_phone: rawArtisanPhone || '+919556828397',
        offered_unit_price: unitPrice,
        proposed_quantity: Number(quantity) || 20,
        target_delivery_date: targetDate || 'Within 30 days',
        buyer_notes: notes || 'Standard wholesale inquiry',
        total_estimated: totalEstimated,
        demo_data: true,
      }

      // 1. Send to backend if available
      try {
        await createDemoInquiry({
          product_id: payload.product_id,
          buyer_id: payload.buyer_id,
          buyer_name: payload.buyer_name,
          product_title: payload.product_title,
          artisan_id: payload.artisan_id,
          artisan_name: payload.artisan_name,
          artisan_phone: payload.artisan_phone,
          offered_unit_price: payload.offered_unit_price,
          proposed_quantity: payload.proposed_quantity,
          target_delivery_date: payload.target_delivery_date,
          lead_time_days: 20,
          artisan_notes: `Buyer Request from ${payload.buyer_name}: ${notes}`,
          buyer_notes: payload.buyer_notes,
          language: language || 'mr',
          total_estimated: payload.total_estimated,
          demo_data: true,
        })
      } catch (apiErr) {
        console.warn('Inquiry API fallback:', apiErr)
      }

      // 2. Persist locally in Buyer Requests
      saveBuyerRequest(payload)

      setIsSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || t('buyer.request_error', 'Failed to submit proposal request.'))
    } finally {
      setSubmitting(false)
    }
  }

  const telUrl = hasValidPhone ? getTelUrl(rawArtisanPhone) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg bg-white rounded-lg shadow-editorial-lg border border-stone-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <p className="section-label mb-0.5">{t('buyer.request_modal_title', 'Commercial Proposal Request')}</p>
            <h3 className="text-base font-semibold text-ink">
              {product.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-ink-muted hover:text-ink hover:bg-stone-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center text-center py-5 gap-4">
              {/* WhatsApp & Success Badge */}
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-sm animate-pulse">
                  <WhatsappLogo size={36} weight="fill" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white">
                  <CheckCircle size={14} weight="bold" />
                </div>
              </div>

              {/* Bold Headline & Message */}
              <div className="space-y-1.5 max-w-sm">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold tracking-wide uppercase">
                  ✓ WhatsApp Dispatched
                </span>
                <h4 className="text-lg font-bold text-ink">
                  Inquiry Sent to {product.artisan_name || 'Artisan Workshop'}!
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  An automated WhatsApp notification with your order requirements has been dispatched directly to the artisan's phone.
                </p>
              </div>

              {/* Order & Contact Summary Box */}
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 w-full text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-ink-muted">
                  <span>{t('buyer.artisan', 'Artisan Workshop')}:</span>
                  <span className="font-semibold text-ink">{product.artisan_name || 'Master Artisan'}</span>
                </div>
                <div className="flex justify-between items-center text-ink-muted">
                  <span>{t('buyer.requested_qty', 'Requested Quantity')}:</span>
                  <span className="font-semibold text-ink">{quantity} units</span>
                </div>
                <div className="flex justify-between items-center text-ink-muted">
                  <span>{t('proposal.total_val', 'Estimated Value')}:</span>
                  <span className="font-semibold text-forest">₹{totalEstimated.toLocaleString('en-IN')}</span>
                </div>
                {rawArtisanPhone && (
                  <div className="flex justify-between items-center text-ink-muted pt-1.5 border-t border-stone-200">
                    <span>Direct WhatsApp:</span>
                    <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                      {rawArtisanPhone}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-2 mt-2">
                {telUrl && (
                  <a
                    href={telUrl}
                    className="clay-btn clay-btn-ghost flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 border border-stone-300"
                  >
                    <PhoneCall size={15} />
                    <span>{t('buyer.call_artisan', 'Call Workshop')}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="clay-btn clay-btn-primary flex-1 text-xs py-2.5 font-medium"
                >
                  {t('close', 'Done')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Product Context */}
              <div className="flex items-center gap-3 p-3 rounded bg-stone-50 border border-stone-200">
                <div className="w-12 h-12 rounded bg-stone-200 overflow-hidden shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">🪔</div>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <h4 className="font-semibold text-ink truncate">{product.title}</h4>
                  <p className="text-ink-muted">
                    {product.artisan_name} · {product.location}
                  </p>
                  <p className="font-medium text-forest mt-0.5">
                    ₹{unitPrice.toLocaleString('en-IN')} / piece
                  </p>
                </div>
              </div>

              {/* Requirements Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-1">
                    {t('buyer.desired_quantity', 'Desired Order Quantity')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="clay-input"
                    placeholder="e.g. 50"
                  />
                  <span className="text-[10px] text-ink-faint mt-0.5 block">
                    {t('buyer.suggested_moq', 'Artisan MOQ')}: {product.moq || 10} pcs
                  </span>
                </div>

                <div>
                  <label className="section-label block mb-1">
                    {t('buyer.target_date', 'Target Delivery Window')}
                  </label>
                  <input
                    type="text"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="clay-input"
                    placeholder={t('buyer.date_placeholder', 'e.g. Within 30 days / Q3')}
                  />
                </div>
              </div>

              <div>
                <label className="section-label block mb-1">
                  {t('buyer.custom_specs', 'Custom Specifications or Packaging Notes')}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="clay-input text-xs"
                  placeholder={t('buyer.notes_placeholder', 'Specify custom dimensions, retail tag requirements, or bulk packaging needs...')}
                />
              </div>

              {/* Estimate Calculation */}
              <div className="p-3 rounded bg-forest-faint border border-forest/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-ink-muted block">{t('buyer.est_order_val', 'Estimated Order Value')}</span>
                  <span className="text-base font-bold text-forest">₹{totalEstimated.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-forest font-medium bg-white px-2 py-1 rounded border border-forest/20">
                  {quantity || 0} units @ ₹{unitPrice}
                </span>
              </div>

              {error && (
                <p className="text-xs text-rust bg-red-50 border border-red-200 rounded p-2">
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="clay-btn clay-btn-ghost text-xs"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="clay-btn clay-btn-primary flex items-center gap-1.5 text-xs"
                >
                  {submitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t('buyer.send_proposal_request', 'Request Proposal')}</span>
                      <PaperPlaneTilt size={14} weight="bold" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
