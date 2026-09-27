import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  PaperPlaneTilt,
  Buildings,
  CheckCircle,
  Clock,
  CurrencyInr,
  Package,
  Info,
  Sparkle
} from '@phosphor-icons/react'
import { createDemoInquiry } from '../config/api'
import { saveSentProposal } from '../config/auth'

export default function ProposalModal({
  isOpen,
  onClose,
  opportunity,
  product,
  onSuccess,
}) {
  const { t } = useTranslation()

  const [unitPrice, setUnitPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [leadTimeDays, setLeadTimeDays] = useState('20')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !opportunity) {
      setIsSuccess(false)
      setError('')
      return
    }

    const defaultPrice = product?.price || opportunity?.budget_max || opportunity?.budget_min || 1500
    const defaultQty = opportunity?.quantity_min || opportunity?.min_quantity || 25
    const defaultLead = opportunity?.lead_time_days || '20'

    setUnitPrice(String(defaultPrice))
    setQuantity(String(defaultQty))
    setLeadTimeDays(String(defaultLead))
    setNotes(t('proposal.default_artisan_notes', 'All items are 100% handcrafted in our Jaipur workshop using authentic natural clay and kiln firing. Custom sizing available.'))
    setIsSuccess(false)
    setError('')
  }, [isOpen, opportunity, product, t])

  if (!isOpen || !opportunity) return null

  const totalEstimated = (Number(unitPrice) || 0) * (Number(quantity) || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        product_id: product?.product_id || product?.id || 'KRG-2024-8921',
        buyer_id: opportunity.buyer_id,
        offered_unit_price: Number(unitPrice) || 1500,
        proposed_quantity: Number(quantity) || 25,
        lead_time_days: Number(leadTimeDays) || 20,
        artisan_notes: notes,
        demo_data: true,
      }

      // 1. Call API if available
      try {
        await createDemoInquiry(payload)
      } catch (apiErr) {
        console.warn('API inquiry fallback to local persistence:', apiErr)
      }

      // 2. Save in local sent proposals
      saveSentProposal({
        ...payload,
        buyer_name: opportunity.display_name || opportunity.buyer_name || 'Buyer',
        buyer_type: opportunity.buyer_type || 'Retailer',
        product_title: product?.title || product?.title_en || 'Handcrafted Product',
        total_value: totalEstimated,
      })

      setIsSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || t('proposal.error', 'Failed to send proposal. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

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
            <p className="section-label mb-0.5">{t('proposal.modal_title', 'Prepare Proposal')}</p>
            <h3 className="text-base font-semibold text-ink">
              {opportunity.display_name || opportunity.buyer_name || 'Buyer Requirement'}
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
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="w-14 h-14 rounded-full bg-forest-faint border-2 border-forest flex items-center justify-center text-forest">
                <CheckCircle size={32} weight="fill" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-ink mb-1">
                  {t('proposal.sent_success', 'Proposal Sent Successfully')}
                </h4>
                <p className="text-xs text-ink-muted max-w-xs leading-relaxed">
                  {t('proposal.sent_desc', 'The buyer has been notified. You can review your sent proposals under Opportunities.')}
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 w-full text-left text-xs space-y-1">
                <div className="flex justify-between text-ink-muted">
                  <span>{t('proposal.offered_rate', 'Unit Rate')}:</span>
                  <span className="font-semibold text-ink">₹{Number(unitPrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>{t('proposal.offered_qty', 'Quantity')}:</span>
                  <span className="font-semibold text-ink">{quantity} units</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>{t('proposal.total_val', 'Total Estimated')}:</span>
                  <span className="font-semibold text-forest">₹{totalEstimated.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="clay-btn clay-btn-primary w-full mt-2"
              >
                {t('close', 'Done')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Buyer Context Card */}
              <div className="p-3.5 rounded bg-stone-50 border border-stone-200 text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <Buildings size={14} className="text-amber-acc" />
                    {opportunity.buyer_type || 'Direct Buyer'}
                  </span>
                  {opportunity.region_preferences && (
                    <span className="text-ink-muted">
                      📍 {Array.isArray(opportunity.region_preferences) ? opportunity.region_preferences.join(', ') : opportunity.region_preferences}
                    </span>
                  )}
                </div>

                <p className="text-ink-soft leading-relaxed">
                  {opportunity.description}
                </p>

                <div className="flex flex-wrap gap-3 pt-1 border-t border-stone-200/60 text-[11px] text-ink-muted">
                  <span>{t('proposal.req_budget', 'Buyer Budget')}: <strong className="text-ink">₹{opportunity.budget_min} – ₹{opportunity.budget_max}</strong></span>
                  <span>{t('proposal.req_qty', 'Quantity')}: <strong className="text-ink">{opportunity.quantity_min || opportunity.min_quantity} – {opportunity.quantity_max || opportunity.max_quantity} pcs</strong></span>
                </div>
              </div>

              {/* Offer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-1">
                    {t('proposal.unit_price_label', 'Your Unit Price (₹)')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitPrice}
                    onChange={e => setUnitPrice(e.target.value)}
                    className="clay-input"
                    placeholder="e.g. 1500"
                  />
                </div>

                <div>
                  <label className="section-label block mb-1">
                    {t('proposal.quantity_label', 'Proposed Quantity')}
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
                </div>
              </div>

              <div>
                <label className="section-label block mb-1">
                  {t('proposal.lead_time_label', 'Estimated Production Time (Days)')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  required
                  value={leadTimeDays}
                  onChange={e => setLeadTimeDays(e.target.value)}
                  className="clay-input"
                  placeholder="e.g. 20"
                />
              </div>

              <div>
                <label className="section-label block mb-1">
                  {t('proposal.artisan_notes_label', 'Workshop Notes / Terms')}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="clay-input text-xs"
                  placeholder={t('proposal.notes_placeholder', 'Specify clay type, packaging details, or batch lead time...')}
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded bg-amber-soft border border-amber-acc/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-ink-muted block">{t('proposal.est_total', 'Total Proposal Value')}</span>
                  <span className="text-lg font-bold text-ink">₹{totalEstimated.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[11px] text-amber-acc font-medium bg-amber-acc/10 px-2 py-1 rounded">
                  {quantity || 0} units @ ₹{unitPrice || 0}
                </span>
              </div>

              {error && (
                <p className="text-xs text-rust bg-red-50 border border-red-200 rounded p-2">
                  {error}
                </p>
              )}

              {/* Submit CTA */}
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
                  className="clay-btn clay-btn-primary flex items-center gap-2 text-xs"
                >
                  {submitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t('proposal.send_cta', 'Send Proposal to Buyer')}</span>
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
