import React, { useState, useEffect } from 'react'
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
  CaretDown,
  CaretUp,
  ShieldCheck
} from '@phosphor-icons/react'
import { findMarketMatches, createDemoInquiry } from '../config/api'
import ClayCard from './ClayCard'
import ClayButton from './ClayButton'
import ClayBadge from './ClayBadge'

export default function MarketOpportunitiesModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  productCategory,
  productPrice
}) {
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState([])
  const [productProfile, setProductProfile] = useState(null)
  const [error, setError] = useState('')
  const [expandedMatchId, setExpandedMatchId] = useState(null)

  // Inquiry form modal state
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
        setError(err.message || 'बाज़ार के अवसरों को लोड करने में असमर्थ।')
      } finally {
        setLoading(false)
      }
    }

    loadOpportunities()
  }, [isOpen, productId])

  if (!isOpen) return null

  const handleOpenInquiry = (match) => {
    setActiveInquiryBuyer(match)
    setOfferPrice(productPrice ? String(productPrice) : String(match.budget_min || 450))
    setOfferQuantity(String(match.min_quantity || 20))
    setLeadTimeDays(String(match.lead_time_days || 25))
    setArtisanNotes('हम प्रामाणिक हस्तनिर्मित शिल्प गुणवत्ता के साथ समय पर डिलीवरी प्रदान करते हैं।')
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
      alert(err.message || 'डेमो पूछताछ दर्ज करने में विफल।')
    } finally {
      setInquirySubmitting(false)
    }
  }

  const getScoreBadge = (score, level) => {
    const percent = Math.round(score * 100)
    if (level === 'high' || percent >= 75) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-sm">
          <Sparkle size={13} weight="fill" className="text-emerald-600" />
          <span>{percent}% सुसंगत (High)</span>
        </span>
      )
    }
    if (level === 'moderate' || percent >= 50) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-sm">
          <span>{percent}% मध्यम (Moderate)</span>
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
        <span>{percent}% आंशिक (Low)</span>
      </span>
    )
  }

  const formatBuyerType = (type) => {
    const types = {
      boutique: 'बुटीक / हेरिटेज स्टोर (Boutique)',
      exporter: 'हस्तशिल्प निर्यातक (Exporter)',
      retailer: 'खुदरा स्टोर चेन (Retailer)',
      institutional: 'संस्थागत खरीदार (Institution)',
      ecommerce: 'ई-कॉमर्स प्लेटफॉर्म (E-Commerce)',
      corporate_gifting: 'कॉर्पोरेट उपहार (Gifting)',
      interior_designer: 'इंटीरियर डिज़ाइनर (Interior Studio)'
    }
    return types[type] || type?.replace('_', ' ') || 'खरीदार'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-clay-deep via-white to-amber-50/50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20 font-bold">
              <Buildings size={22} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-clay-indigo font-heading">
                  बाज़ार के अवसर (Market Opportunities)
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  DEMO REGISTRY
                </span>
              </div>
              <p className="text-xs text-clay-muted">
                {productTitle ? `${productTitle} (${productId})` : productId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Context Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2.5">
            <Info size={18} weight="fill" className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">सत्यापित शिल्प-खरीदार मिलान इंजन (Explainable Buyer Matching)</p>
              <p className="text-[11px] text-blue-800/90 mt-0.5">
                यह प्रणाली आपके उत्पाद की श्रेणी, मूल्य, सामग्री और परंपरा का मिलान विभिन्न संस्थागत व हेरिटेज खरीदार आवश्यकताओं से करती है। सभी खरीदार आवश्यकताएं डेमो सिमुलेशन पर आधारित हैं।
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-clay-muted">
              <CircleNotch size={36} className="animate-spin text-clay-primary" />
              <p className="text-xs font-bold font-heading text-clay-indigo">
                खरीदार आवश्यकताओं का मिलान किया जा रहा है...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
              <WarningCircle size={40} className="text-amber-500" />
              <p className="text-sm font-bold text-slate-800">{error}</p>
              <ClayButton variant="secondary" size="sm" onClick={onClose}>
                बंद करें
              </ClayButton>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3 text-clay-muted">
              <Package size={40} className="text-slate-300" />
              <p className="text-sm font-bold text-slate-700">वर्तमान में इस श्रेणी के लिए कोई सक्रिय अवसर नहीं मिला।</p>
              <p className="text-xs text-slate-500">जैसे ही नए खरीदार आवश्यकताएं जोड़ेंगे, आपको यहां मिलान दिखेगा।</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map((match, idx) => {
                const isExpanded = expandedMatchId === match.buyer_id
                return (
                  <div
                    key={match.buyer_id || idx}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? 'border-clay-primary/40 bg-white shadow-md'
                        : 'border-slate-200/80 bg-clay-surface/40 hover:bg-clay-surface/80'
                    }`}
                  >
                    {/* Collapsed Header */}
                    <div
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.buyer_id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {getScoreBadge(match.match_score, match.match_level)}
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {formatBuyerType(match.buyer_type)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {match.buyer_id}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-clay-indigo font-heading truncate">
                          {match.organization_name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-black text-clay-primary block">
                            ₹{match.budget_min} - ₹{match.budget_max}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            मात्रा: {match.min_quantity} - {match.max_quantity} इकाई
                          </span>
                        </div>
                        <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                          {isExpanded ? <CaretUp size={18} weight="bold" /> : <CaretDown size={18} weight="bold" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 flex flex-col gap-3">
                        {/* Key Requirements Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">लक्षित बजट</span>
                            <span className="font-extrabold text-slate-800">
                              ₹{match.budget_min} - ₹{match.budget_max}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">मांग मात्रा</span>
                            <span className="font-extrabold text-slate-800">
                              {match.min_quantity} - {match.max_quantity} pcs
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">डिलीवरी समय</span>
                            <span className="font-extrabold text-slate-800">
                              {match.lead_time_days} दिन (Days)
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">लक्ष्य क्षेत्र</span>
                            <span className="font-extrabold text-slate-800 truncate block">
                              {match.geographic_preferences?.join(', ') || 'अखिल भारतीय'}
                            </span>
                          </div>
                        </div>

                        {/* Explainability Reasons */}
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex flex-col gap-1.5 text-xs">
                          <span className="font-bold text-clay-indigo uppercase text-[10px] tracking-wider">
                            सुसंगतता का पारदर्शी विवरण (Matching Analysis)
                          </span>
                          <ul className="space-y-1">
                            {match.reasons?.map((reason, rIdx) => {
                              const isPositive = reason.startsWith('✓')
                              return (
                                <li
                                  key={rIdx}
                                  className={`flex items-start gap-1.5 ${
                                    isPositive ? 'text-emerald-900 font-medium' : 'text-slate-500 text-[11px]'
                                  }`}
                                >
                                  <span>{reason}</span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>

                        {/* Action CTA */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>डेमो सिमुलेटेड इन्क्वायरी सिस्टम</span>
                          </div>

                          <ClayButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenInquiry(match)}
                            icon={<PaperPlaneTilt size={16} weight="fill" />}
                          >
                            डेमो पूछताछ भेजें (Send Inquiry)
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
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 font-sans">
            कुल सुसंगत अवसर: <strong className="text-slate-800">{matches.length}</strong>
          </span>
          <ClayButton variant="secondary" size="sm" onClick={onClose}>
            बंद करें
          </ClayButton>
        </div>
      </div>

      {/* Demo Inquiry Sub-Modal */}
      {activeInquiryBuyer && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {inquirySuccess ? (
              <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CheckCircle size={36} weight="fill" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-clay-indigo font-heading">
                    डेमो पूछताछ सफलतापूर्वक दर्ज हुई!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 font-mono">
                    पूछताछ आईडी: <strong>{inquirySuccess.inquiry_id}</strong>
                  </p>
                </div>

                <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info size={16} weight="fill" className="text-amber-700" />
                    <span>सिमुलेशन नोटिस (Demo Simulation)</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 leading-relaxed">
                    यह एक डेमो वातावरण है। कोई वास्तविक ईमेल या व्हाट्सएप संदेश नहीं भेजा गया है। पूछताछ को डेटाबेस में 'simulated_draft' के रूप में सुरक्षित कर लिया गया है।
                  </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">प्रस्तावित मूल्य</span>
                    <strong>₹{inquirySuccess.offered_unit_price} / इकाई</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">प्रस्तावित मात्रा</span>
                    <strong>{inquirySuccess.proposed_quantity} इकाइयाँ</strong>
                  </div>
                </div>

                <ClayButton
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  onClick={() => {
                    setActiveInquiryBuyer(null)
                    setInquirySuccess(null)
                  }}
                >
                  पूर्ण (Done)
                </ClayButton>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="flex flex-col">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-clay-indigo font-heading">
                      खरीदार को डेमो प्रस्ताव भेजें
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      {activeInquiryBuyer.organization_name} ({activeInquiryBuyer.buyer_id})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveInquiryBuyer(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        प्रस्तावित इकाई मूल्य (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-clay-primary/30"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        प्रस्तावित मात्रा (इकाइयाँ)
                      </label>
                      <input
                        type="number"
                        required
                        value={offerQuantity}
                        onChange={(e) => setOfferQuantity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-clay-primary/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      डिलीवरी समय (दिन)
                    </label>
                    <input
                      type="number"
                      required
                      value={leadTimeDays}
                      onChange={(e) => setLeadTimeDays(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-clay-primary/30"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      कारीगर संदेश / विवरण
                    </label>
                    <textarea
                      rows={3}
                      value={artisanNotes}
                      onChange={(e) => setArtisanNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-clay-primary/30"
                      placeholder="अपने हस्तशिल्प की प्रामाणिकता और डिलीवरी क्षमता के बारे में बताएं..."
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
                    ⚠️ <strong>डेमो सिमुलेशन:</strong> यह एक प्रोटोटाइप क्रिया है जो परीक्षण के लिए डेमो पूछताछ रिकॉर्ड करेगी।
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                  <ClayButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveInquiryBuyer(null)}
                  >
                    रद्द करें
                  </ClayButton>
                  <ClayButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={inquirySubmitting}
                    icon={<PaperPlaneTilt size={16} weight="fill" />}
                  >
                    प्रस्ताव दर्ज करें (Submit Demo Inquiry)
                  </ClayButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
