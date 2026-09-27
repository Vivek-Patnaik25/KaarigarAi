import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Buildings,
  Tag,
  Package,
  CalendarBlank,
  MapPin,
  CheckCircle,
  WarningCircle,
  Sparkle,
  PaperPlaneTilt,
  Info,
  CircleNotch,
  ArrowRight,
  ArrowLeft,
  CaretDown,
  CaretUp,
  ShieldCheck
} from '@phosphor-icons/react'
import { findMarketMatches, createDemoInquiry } from '../config/api'
import ClayButton from './ClayButton'
import { useLanguageStore } from '../store/languageStore'
import { getLocalizedBuyerOpportunity } from '../config/buyerOpportunitiesLocalized'

export default function MarketOpportunitiesModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  productCategory,
  productPrice
}) {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState([])
  const [productProfile, setProductProfile] = useState(null)
  const [error, setError] = useState('')
  const [expandedMatchId, setExpandedMatchId] = useState(null)

  // Inquiry inline state
  const [activeInquiryBuyer, setActiveInquiryBuyer] = useState(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerQuantity, setOfferQuantity] = useState('')
  const [leadTimeDays, setLeadTimeDays] = useState('20')
  const [artisanNotes, setArtisanNotes] = useState('')
  const [inquirySubmitting, setInquirySubmitting] = useState(false)
  const [inquirySuccess, setInquirySuccess] = useState(null)

  useEffect(() => {
    if (!isOpen || !productId) return

    async function loadOpportunities() {
      setLoading(true)
      setError('')
      setMatches([])
      setActiveInquiryBuyer(null)
      setInquirySuccess(null)
      try {
        const data = await findMarketMatches(productId, 10)
        if (data && data.matches) {
          setMatches(data.matches)
          setProductProfile(data.product_profile)
          if (data.matches.length > 0) {
            setExpandedMatchId(data.matches[0].buyer_id)
          }
        }
      } catch (err) {
        console.error('Failed to load market opportunities:', err)
        setError(err.message || t('screen.market_load_error'))
      } finally {
        setLoading(false)
      }
    }

    loadOpportunities()
  }, [isOpen, productId, t])

  if (!isOpen) return null

  const handleOpenInquiry = (match) => {
    setActiveInquiryBuyer(match)
    setOfferPrice(productPrice ? String(productPrice) : String(match.budget_min || 450))
    setOfferQuantity(String(match.min_quantity || 20))
    setLeadTimeDays(String(match.lead_time_days || 25))
    setArtisanNotes(t('screen.demo_notes'))
    setInquirySuccess(null)
  }

  const handleSubmitInquiry = async (e) => {
    e.preventDefault()
    if (!activeInquiryBuyer || !productId) return

    setInquirySubmitting(true)
    try {
      const payload = {
        product_id: productId,
        buyer_id: activeInquiryBuyer.buyer_id,
        offered_unit_price: Number(offerPrice) || Number(productPrice) || 450,
        proposed_quantity: Number(offerQuantity) || Number(activeInquiryBuyer.min_quantity) || 20,
        lead_time_days: Number(leadTimeDays) || 20,
        artisan_notes: artisanNotes
      }

      const result = await createDemoInquiry(payload)
      setInquirySuccess(result)
    } catch (err) {
      console.error('Failed to submit demo inquiry:', err)
      alert(err.message || t('screen.demo_inquiry_error'))
    } finally {
      setInquirySubmitting(false)
    }
  }

  const getScoreBadge = (score, level) => {
    const percent = Math.round(score * 100)
    if (level === 'high' || percent >= 75) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>{percent}% {t('screen.high')}</span>
        </span>
      )
    }
    if (level === 'moderate' || percent >= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          <span>{percent}% {t('screen.moderate')}</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
        <span>{percent}% {t('screen.low')}</span>
      </span>
    )
  }

  const formatBuyerType = (type) => {
    return type ? t('screen.buyer') : t('screen.buyer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-stone-800 text-amber-400 flex items-center justify-center border border-stone-700">
              <Buildings size={20} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  {t('screen.market_title')}
                </h2>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  DEMO REGISTRY
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {productTitle ? `${productTitle} (${productId})` : productId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 bg-stone-50/50">
          {/* Context Notice Banner */}
          <div className="p-3.5 rounded-md bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
            <Info size={16} weight="bold" className="text-stone-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-900">{t('screen.matching_engine')}</p>
              <p className="text-[11px] text-stone-600 mt-0.5">
                {t('screen.matching_description')}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-500">
              <CircleNotch size={32} className="animate-spin text-stone-800" />
              <p className="text-xs font-medium text-stone-700">
                {t('screen.matching_loading')}
              </p>
            </div>
          ) : error ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
              <WarningCircle size={36} className="text-amber-700" />
              <p className="text-sm font-semibold text-stone-900">{error}</p>
              <ClayButton variant="secondary" size="sm" onClick={onClose}>
                {t('screen.close')}
              </ClayButton>
            </div>
          ) : activeInquiryBuyer ? (
            /* Inline Inquiry Form (Avoids modal-on-modal) */
            <div className="bg-white rounded-md border border-stone-200 p-5">
              {inquirySuccess ? (
                <div className="py-6 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <CheckCircle size={28} weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">
                      {t('screen.inquiry_success')}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 font-mono">
                      {t('screen.inquiry_id')}: <strong>{inquirySuccess.inquiry_id}</strong>
                    </p>
                  </div>

                  <div className="w-full p-3.5 rounded bg-amber-50/70 border border-amber-200 text-left text-xs text-amber-950 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Info size={15} weight="fill" className="text-amber-800" />
                      <span>{t('screen.simulation_notice')}</span>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      {t('screen.simulation_description')}
                    </p>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-2 text-xs text-stone-700 bg-stone-50 p-3 rounded border border-stone-200">
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase font-semibold">{t('screen.offered_price')}</span>
                      <strong className="font-mono text-sm text-stone-900">₹{inquirySuccess.offered_unit_price}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase font-semibold">{t('screen.proposed_quantity')}</span>
                      <strong className="font-mono text-sm text-stone-900">{inquirySuccess.proposed_quantity} {t('screen.units')}</strong>
                    </div>
                  </div>

                  <ClayButton
                    variant="primary"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      setActiveInquiryBuyer(null)
                      setInquirySuccess(null)
                    }}
                  >
                    {t('screen.done')}
                  </ClayButton>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveInquiryBuyer(null)}
                        className="p-1 rounded hover:bg-stone-100 text-stone-600 mr-1 cursor-pointer"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div>
                        <h3 className="text-sm font-semibold text-stone-900">
                          {t('screen.send_demo_offer')}
                        </h3>
                        <p className="text-xs text-stone-500">
                          {activeInquiryBuyer.organization_name} ({activeInquiryBuyer.buyer_id})
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-medium text-stone-700 block mb-1">
                        {t('screen.offered_unit_price')} (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-stone-300 font-mono text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-stone-700 block mb-1">
                        {t('screen.proposed_units')}
                      </label>
                      <input
                        type="number"
                        required
                        value={offerQuantity}
                        onChange={(e) => setOfferQuantity(e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-stone-300 font-mono text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="font-medium text-stone-700 block mb-1">
                      {t('screen.delivery_time')} ({t('screen.days')})
                    </label>
                    <input
                      type="number"
                      required
                      value={leadTimeDays}
                      onChange={(e) => setLeadTimeDays(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-stone-300 font-mono text-xs focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="font-medium text-stone-700 block mb-1">
                      {t('screen.artisan_message')}
                    </label>
                    <textarea
                      rows={2}
                      value={artisanNotes}
                      onChange={(e) => setArtisanNotes(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
                      placeholder={t('screen.artisan_message_placeholder')}
                    />
                  </div>

                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                    ℹ️ {t('screen.demo_warning')}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                    <ClayButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveInquiryBuyer(null)}
                    >
                      {t('screen.cancel')}
                    </ClayButton>
                    <ClayButton
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={inquirySubmitting}
                      icon={<PaperPlaneTilt size={14} weight="fill" />}
                    >
                      {t('screen.submit_offer')}
                    </ClayButton>
                  </div>
                </form>
              )}
            </div>
          ) : matches.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3 text-stone-500">
              <Package size={36} className="text-stone-300" />
              <p className="text-sm font-semibold text-stone-800">{t('screen.no_opportunities')}</p>
              <p className="text-xs text-stone-500">{t('screen.no_opportunities_sub')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {matches.map((match, idx) => {
                const rawBuyer = match.buyer || match || {}
                const buyerObj = getLocalizedBuyerOpportunity(rawBuyer, language)
                const buyerId = buyerObj.buyer_id || match.buyer_id || `BUYER-${idx + 1}`
                const orgName = buyerObj.organization_name || match.organization_name || t('screen.verified_buyer')
                const bType = buyerObj.buyer_type || match.buyer_type || 'Boutique / Retailer'
                const bMin = buyerObj.budget_min ?? match.budget_min ?? 500
                const bMax = buyerObj.budget_max ?? match.budget_max ?? 5000
                const qMin = buyerObj.min_quantity ?? buyerObj.quantity_min ?? match.min_quantity ?? match.quantity_min ?? 10
                const qMax = buyerObj.max_quantity ?? buyerObj.quantity_max ?? match.max_quantity ?? match.quantity_max ?? 100
                const leadDays = buyerObj.lead_time_days ?? match.lead_time_days ?? 25
                const regions = buyerObj.geographic_preferences || buyerObj.region_preferences || match.geographic_preferences || match.region_preferences || [t('screen.all_india')]
                const isExpanded = expandedMatchId === buyerId

                return (
                  <div
                    key={buyerId}
                    className={`rounded-md border transition-all ${
                      isExpanded
                        ? 'border-stone-400 bg-white shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    {/* Collapsed Header */}
                    <div
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                      onClick={() => setExpandedMatchId(isExpanded ? null : buyerId)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {getScoreBadge(match.match_score, match.match_level)}
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                            {formatBuyerType(bType)}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">
                            {buyerId}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                          {orgName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-mono font-semibold text-emerald-700 block">
                            ₹{bMin.toLocaleString('en-IN')} - ₹{bMax.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-stone-500 block">
                            {t('screen.quantity')}: {qMin} - {qMax} {t('screen.units')}
                          </span>
                        </div>
                        <div className="p-1 text-stone-400 hover:text-stone-700">
                          {isExpanded ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-stone-100 flex flex-col gap-3">
                        {/* Key Requirements Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1.5">
                          <div className="p-2 rounded bg-stone-50 border border-stone-200">
                            <span className="text-[10px] font-semibold text-stone-500 uppercase block">{t('screen.target_budget')}</span>
                            <span className="font-mono text-xs font-semibold text-stone-900">
                              ₹{bMin.toLocaleString('en-IN')} - ₹{bMax.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-stone-50 border border-stone-200">
                            <span className="text-[10px] font-semibold text-stone-500 uppercase block">{t('screen.demand_quantity')}</span>
                            <span className="font-mono text-xs font-semibold text-stone-900">
                              {qMin} - {qMax} {t('opportunities.units_needed', 'pcs')}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-stone-50 border border-stone-200">
                            <span className="text-[10px] font-semibold text-stone-500 uppercase block">{t('screen.delivery_time')}</span>
                            <span className="font-mono text-xs font-semibold text-stone-900">
                              {leadDays} {t('screen.days')}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-stone-50 border border-stone-200">
                            <span className="text-[10px] font-semibold text-stone-500 uppercase block">{t('screen.target_region')}</span>
                            <span className="text-xs font-medium text-stone-900 truncate block">
                              {Array.isArray(regions) ? regions.join(', ') : String(regions)}
                            </span>
                          </div>
                        </div>

                        {/* Explainability Reasons */}
                        {match.reasons && match.reasons.length > 0 && (
                          <div className="p-2.5 rounded bg-stone-50 border border-stone-200 flex flex-col gap-1 text-xs">
                            <span className="font-semibold text-stone-700 uppercase text-[10px] tracking-wider">
                              {t('screen.matching_analysis')}
                            </span>
                            <ul className="space-y-1">
                              {match.reasons.map((reason, rIdx) => {
                                const isPositive = reason.startsWith('✓')
                                return (
                                  <li
                                    key={rIdx}
                                    className={`flex items-start gap-1.5 ${
                                      isPositive ? 'text-emerald-800 font-medium text-xs' : 'text-stone-600 text-[11px]'
                                    }`}
                                  >
                                    <span>{reason}</span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}

                        {/* Action CTA */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="text-[11px] text-stone-500 flex items-center gap-1">
                            <ShieldCheck size={14} className="text-emerald-700" />
                            <span>{t('screen.demo_inquiry_system')}</span>
                          </div>

                          <ClayButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenInquiry({ ...buyerObj, ...match, buyer_id: buyerId, organization_name: orgName, budget_min: bMin, budget_max: bMax, min_quantity: qMin, max_quantity: qMax, lead_time_days: leadDays })}
                            icon={<PaperPlaneTilt size={14} weight="fill" />}
                          >
                            {t('screen.send_demo_inquiry')}
                          </ClayButton>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-stone-600 font-sans">
            {t('screen.total_matches')}: <strong className="text-stone-900">{matches.length}</strong>
          </span>
          <ClayButton variant="secondary" size="sm" onClick={onClose}>
            {t('screen.close')}
          </ClayButton>
        </div>
      </div>
    </div>
  )
}
