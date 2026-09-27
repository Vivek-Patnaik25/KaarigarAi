import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Buildings,
  MapPin,
  Tag,
  Package,
  CurrencyInr,
  PaperPlaneTilt,
  Sparkle,
  CheckCircle,
  Funnel,
  ArrowRight,
  Storefront,
  Clock,
  ArrowSquareOut
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import ProposalModal from '../components/ProposalModal'
import { fetchBuyerRequirements, fetchMyListings } from '../config/api'
import { getSentProposals } from '../config/auth'
import { useLanguageStore } from '../store/languageStore'
import { getLocalizedBuyerOpportunity } from '../config/buyerOpportunitiesLocalized'

export default function ArtisanOpportunitiesPage() {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const navigate = useNavigate()

  const [opportunities, setOpportunities] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [sentProposals, setSentProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('available') // 'available' | 'sent'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeOpportunity, setActiveOpportunity] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [buyerData, listingsData] = await Promise.all([
        fetchBuyerRequirements().catch(() => ({ buyers: [] })),
        fetchMyListings('KG-2024-8921').catch(() => ({ listings: [] }))
      ])

      const buyers = Array.isArray(buyerData) ? buyerData : (buyerData?.buyers || buyerData?.data || [])
      const items = Array.isArray(listingsData) ? listingsData : (listingsData?.listings || [])

      setOpportunities(buyers)
      setMyProducts(items)
      setSentProposals(getSentProposals())
    } catch (err) {
      console.warn('Failed to load opportunities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const handleProposalsChanged = () => setSentProposals(getSentProposals())
    window.addEventListener('karigaar_proposals_changed', handleProposalsChanged)
    return () => window.removeEventListener('karigaar_proposals_changed', handleProposalsChanged)
  }, [])

  const handleOpenProposal = (opp) => {
    setActiveOpportunity(opp)
    // Try to pre-select the most relevant product from artisan's catalog
    if (myProducts.length > 0) {
      const matchingProduct = myProducts.find(p =>
        opp.categories?.includes(p.category) || p.category?.includes('pottery')
      ) || myProducts[0]
      setSelectedProduct(matchingProduct)
    }
  }

  // Filter opportunities by craft and localize
  const filteredOpportunities = opportunities
    .filter(opp => selectedCategory === 'all' || opp.categories?.includes(selectedCategory))
    .map(opp => getLocalizedBuyerOpportunity(opp, language))

  // Format reasons why the opportunity matches
  const getMatchReason = (opp) => {
    return opp.match_reason || t('opportunities.matches_workshop', 'Matches your terracotta & craft specialty.')
  }

  return (
    <div className="min-h-screen bg-stone-bg flex flex-col pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="section-label mb-1">{t('opportunities.section_subtitle', 'Verified Inquiries')}</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink">
              {t('opportunities.title', 'Buyer Opportunities')}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              {t('opportunities.desc', 'Curated retail, boutique, and hospitality buyers seeking handcrafted artisan products.')}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('available')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                activeTab === 'available'
                  ? 'bg-white text-ink shadow-2xs font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t('opportunities.available_tab', 'Available')} ({opportunities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                activeTab === 'sent'
                  ? 'bg-white text-ink shadow-2xs font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t('opportunities.sent_tab', 'Sent Proposals')} ({sentProposals.length})
            </button>
          </div>
        </div>

        {/* ── Tab: Available Opportunities ──────────────────────────────── */}
        {activeTab === 'available' && (
          <div className="flex flex-col gap-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-ink-muted shrink-0 flex items-center gap-1">
                <Funnel size={13} /> {t('filter', 'Filter')}:
              </span>
              {[
                { id: 'all', label: t('all_crafts', 'All Crafts') },
                { id: 'pottery_terracotta', label: t('category.pottery', 'Pottery & Terracotta') },
                { id: 'textile_handloom', label: t('category.handloom', 'Textile Handloom') },
                { id: 'textile_embroidery', label: t('category.embroidery', 'Embroidery') },
                { id: 'woodcraft', label: t('category.woodcraft', 'Woodcraft') },
                { id: 'metalcraft', label: t('category.metalcraft', 'Metalcraft') },
                { id: 'painting_folk', label: t('category.painting', 'Folk Painting') },
                { id: 'jewellery_traditional', label: t('category.jewellery', 'Jewellery') },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-stone-900 text-white font-medium'
                      : 'bg-stone-100 hover:bg-stone-200 text-ink-muted hover:text-ink border border-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="clay-card p-5 h-48 skeleton" />
                ))}
              </div>
            )}

            {/* Opportunities List */}
            {!loading && filteredOpportunities.length === 0 && (
              <div className="clay-card p-10 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-stone-surface flex items-center justify-center text-xl">
                  📦
                </div>
                <h3 className="text-sm font-semibold text-ink">
                  {t('opportunities.empty_filtered_title', 'No buyer requirements in this category')}
                </h3>
                <p className="text-xs text-ink-muted">
                  {t('opportunities.empty_filtered_desc', 'Try selecting "All Crafts" to view all 25 active buyer requirements.')}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="clay-btn clay-btn-ghost text-xs mt-2"
                >
                  {t('opportunities.view_all_crafts', 'Show All Crafts')}
                </button>
              </div>
            )}

            {!loading && filteredOpportunities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOpportunities.map((opp) => (
                  <div
                    key={opp.buyer_id}
                    className="clay-card p-5 flex flex-col justify-between gap-4 hover:border-stone-400/60 transition-colors"
                  >
                    {/* Buyer identity */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="clay-badge clay-badge-neutral text-[10px] mb-1 inline-block">
                            {opp.buyer_type || 'Direct Buyer'}
                          </span>
                          <h3 className="text-base font-semibold text-ink leading-tight">
                            {opp.display_name || opp.buyer_name || 'Verified Retail Buyer'}
                          </h3>
                        </div>
                        {opp.region_preferences && (
                          <span className="text-[11px] text-ink-faint flex items-center gap-1 shrink-0">
                            <MapPin size={12} />
                            {Array.isArray(opp.region_preferences) ? opp.region_preferences[0] : opp.region_preferences}
                          </span>
                        )}
                      </div>

                      {/* Requirement description */}
                      <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed mb-3">
                        {opp.description}
                      </p>

                      {/* Opportunity Specs Grid */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-stone-50 border border-stone-200 text-xs">
                        <div>
                          <span className="text-[10px] text-ink-faint block uppercase font-medium">
                            {t('opportunities.quantity_needed', 'Quantity Needed')}
                          </span>
                          <span className="font-semibold text-ink">
                            {opp.quantity_min || opp.min_quantity} – {opp.quantity_max || opp.max_quantity} {t('opportunities.units_needed', 'pcs')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-ink-faint block uppercase font-medium">
                            {t('opportunities.budget_range', 'Budget / Piece')}
                          </span>
                          <span className="font-semibold text-forest">
                            ₹{opp.budget_min} – ₹{opp.budget_max}
                          </span>
                        </div>
                      </div>

                      {/* Why it matches */}
                      <div className="mt-3 flex items-start gap-1.5 text-[11px] text-ink-muted bg-amber-soft/50 p-2 rounded border border-amber-acc/20">
                        <Sparkle size={13} className="text-amber-acc shrink-0 mt-0.5" weight="fill" />
                        <span>{getMatchReason(opp)}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                      <div className="flex items-center gap-1 text-[11px] text-forest font-medium">
                        <ShieldCheck size={14} weight="fill" />
                        <span>{t('opportunities.verified_organization', 'Verified Buyer')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenProposal(opp)}
                        className="clay-btn clay-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
                      >
                        <span>{t('opportunities.send_proposal', 'Send Proposal')}</span>
                        <PaperPlaneTilt size={13} weight="bold" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Sent Proposals ────────────────────────────────────────── */}
        {activeTab === 'sent' && (
          <div className="flex flex-col gap-4">
            {sentProposals.length === 0 ? (
              <div className="clay-card p-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-stone-surface flex items-center justify-center text-xl">
                  📄
                </div>
                <h3 className="text-base font-semibold text-ink">
                  {t('opportunities.no_proposals_title', 'No proposals sent yet')}
                </h3>
                <p className="text-xs text-ink-muted max-w-sm">
                  {t('opportunities.no_proposals_desc', 'When you submit a quote for any buyer opportunity, your proposal history and terms will appear here.')}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('available')}
                  className="clay-btn clay-btn-primary text-xs mt-2"
                >
                  {t('opportunities.browse_opportunities', 'Browse Available Opportunities')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sentProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="clay-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="clay-badge clay-badge-success text-[10px]">
                          {t('status_sent', 'Proposal Sent')}
                        </span>
                        <span className="text-xs text-ink-faint">
                          {new Date(prop.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-ink">
                        {prop.buyer_name}
                      </h4>
                      <p className="text-xs text-ink-muted">
                        {prop.product_title} · {prop.proposed_quantity} units @ ₹{prop.offered_unit_price} / unit
                      </p>
                      {prop.artisan_notes && (
                        <p className="text-[11px] text-ink-faint italic mt-1 bg-stone-50 p-1.5 rounded">
                          "{prop.artisan_notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-ink-faint block">
                          {t('proposal.total_val', 'Total Value')}
                        </span>
                        <span className="text-base font-bold text-forest">
                          ₹{prop.total_value?.toLocaleString('en-IN') || (prop.offered_unit_price * prop.proposed_quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Proposal Editor Modal */}
      {activeOpportunity && (
        <ProposalModal
          isOpen={Boolean(activeOpportunity)}
          onClose={() => setActiveOpportunity(null)}
          opportunity={activeOpportunity}
          product={selectedProduct}
          onSuccess={() => {
            setSentProposals(getSentProposals())
          }}
        />
      )}
    </div>
  )
}
