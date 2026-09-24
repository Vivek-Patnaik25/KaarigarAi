import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  PlusCircle, 
  Eye, 
  PencilSimple, 
  Coins, 
  Storefront, 
  House, 
  Sparkle,
  TrendUp,
  IdentificationBadge,
  FileText
} from '@phosphor-icons/react'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../store/languageStore'
import ClayCard from '../components/ClayCard'
import ClayButton from '../components/ClayButton'
import ClayBadge from '../components/ClayBadge'
import Navbar from '../components/Navbar'

// 4 hardcoded sample handcrafted listings so the dashboard never looks empty
const SAMPLE_LISTINGS = [
  {
    id: 'prod-001',
    title: 'हस्तनिर्मित राजस्थानी मिट्टी का घड़ा (Terracotta Pot)',
    category: 'मिट्टी और टेराकोटा',
    price: 1939,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    views: 142,
  },
  {
    id: 'prod-002',
    title: 'बनारसी ज़री हैंडलूम रेशमी दुपट्टा (Zari Silk Dupatta)',
    category: 'हथकरघा वस्त्र',
    price: 2850,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    views: 289,
  },
  {
    id: 'prod-003',
    title: 'पीतल की नक्काशीदार धूपदानी (Carved Brass Burner)',
    category: 'पीतल और धातु शिल्प',
    price: 1350,
    status: 'Draft',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    views: 45,
  },
  {
    id: 'prod-004',
    title: 'प्राकृतिक शीशम की नक्काशीदार थाली (Woodcraft Plate)',
    category: 'काष्ठ कला',
    price: 920,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    views: 98,
  },
]

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { language } = useLanguageStore()
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  return (
    <div className="min-h-screen bg-clay-bg flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 flex gap-8">
        {/* Left Sidebar (240px, desktop only) */}
        <aside className="hidden lg:flex flex-col justify-between w-60 shrink-0">
          <ClayCard className="p-5 flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-clay-muted mb-1">
              मेनू / Menu
            </span>

            <button
              type="button"
              className="px-4 py-3 rounded-2xl bg-clay-primary text-white font-heading font-bold text-sm flex items-center gap-3 shadow-md"
            >
              <House size={20} weight="fill" />
              <span>{t('dashboard')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="px-4 py-3 rounded-2xl hover:bg-clay-deep text-clay-indigo font-heading font-bold text-sm flex items-center gap-3 transition-colors"
            >
              <PlusCircle size={20} weight="bold" />
              <span>{t('add_new_product')}</span>
            </button>

            <a
              href="#listings"
              className="px-4 py-3 rounded-2xl hover:bg-clay-deep text-clay-indigo font-heading font-bold text-sm flex items-center gap-3 transition-colors"
            >
              <Storefront size={20} />
              <span>{t('my_listings')}</span>
            </a>

            <button
              type="button"
              onClick={() => navigate('/passport/KG-2024-8921')}
              className="px-4 py-3 rounded-2xl hover:bg-clay-deep text-clay-indigo font-heading font-bold text-sm flex items-center gap-3 transition-colors text-left"
            >
              <IdentificationBadge size={20} weight="fill" className="text-amber-600" />
              <span>{t('passport.title', 'Artisan Passport')}</span>
            </button>

            <div className="px-4 py-3 rounded-2xl hover:bg-clay-deep text-clay-indigo font-heading font-bold text-sm flex items-center gap-3 transition-colors">
              <Coins size={20} />
              <span>{t('earnings')}</span>
            </div>
          </ClayCard>

          {/* Sidebar Bottom: Current Language Badge */}
          <ClayCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentLang.flag}</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-clay-muted">भाषा / Language</span>
                <span className="text-sm font-black text-clay-indigo">{currentLang.native}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/language-select')}
              className="text-xs text-clay-primary font-bold hover:underline"
            >
              बदलें
            </button>
          </ClayCard>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6 sm:gap-8 min-w-0">
          {/* Top Greeting Card (clay-primary gradient bg) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="clay-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-clay-primary via-[#EA7824] to-[#C95C14] text-white shadow-xl relative overflow-hidden">
              {/* Background decorative circles */}
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute right-24 -top-8 w-32 h-32 rounded-full bg-orange-400/20 blur-lg pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-white/90">
                    <Sparkle weight="fill" size={20} className="text-amber-200" />
                    <span className="text-sm font-bold uppercase tracking-wider">
                      कारीगर डिजिटल केंद्र
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white font-heading leading-tight">
                    {t('greeting')}
                  </h1>
                  <p className="text-sm sm:text-base text-amber-100 font-medium mt-2">
                    {t('stats_summary', { count: 8, earnings: '18,450' })}
                  </p>
                </div>

                {/* Direct quick stats pill */}
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                  <TrendUp size={28} className="text-amber-200 shrink-0" />
                  <div>
                    <span className="text-xs text-white/80 uppercase font-bold block">
                      कुल दृश्य (Views)
                    </span>
                    <span className="text-lg font-black text-white">1,240 कारीगरी दर्शक</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Primary Action Button: "नया उत्पाद जोड़ें" - Impossible to miss */}
          <div className="flex justify-center my-1">
            <ClayButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/catalog')}
              icon={<PlusCircle weight="fill" size={28} />}
              className="w-full sm:w-auto px-10 py-5 text-xl shadow-2xl hover:scale-[1.02] transform transition-transform"
            >
              {t('add_new_product')} (New Listing)
            </ClayButton>
          </div>

          {/* Recent Listings Section */}
          <section id="listings" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-clay-indigo font-heading">
                {t('recent_listings')}
              </h2>
              <ClayBadge variant="indigo" className="hidden sm:inline-flex">
                4 सक्रिय उत्पाद
              </ClayBadge>
            </div>

            {/* 3 columns on desktop, 2 on tablet, 1 on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_LISTINGS.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <ClayCard className="overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all">
                    {/* Product Image */}
                    <div className="relative w-full h-[180px] overflow-hidden bg-clay-deep/40">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Status badge in corner */}
                      <div className="absolute top-3 right-3">
                        <ClayBadge
                          variant={item.status === 'Live' ? 'success' : 'muted'}
                        >
                          {item.status === 'Live' ? t('live') : t('draft')}
                        </ClayBadge>
                      </div>
                    </div>

                    {/* Listing Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-clay-muted uppercase tracking-wider block mb-1">
                          {item.category}
                        </span>
                        <h3 className="text-base font-bold text-clay-indigo font-heading line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-clay-muted/15">
                        {/* Price badge (clay-primary-soft bg, clay-indigo text) */}
                        <div className="px-3.5 py-1.5 rounded-xl bg-clay-primary-soft text-clay-indigo font-heading font-black text-lg shadow-sm border border-white/50">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>

                        {/* View, Edit, & Wholesale icon buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/listing/${item.id}/wholesale`)}
                            className="p-2.5 rounded-xl bg-clay-surface hover:bg-clay-deep text-orange-600 shadow-sm border border-white/50 transition-colors"
                            title="B2B Wholesale Sheet"
                          >
                            <FileText size={18} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/catalog')}
                            className="p-2.5 rounded-xl bg-clay-surface hover:bg-clay-deep text-clay-indigo shadow-sm border border-white/50 transition-colors"
                            title={t('view')}
                          >
                            <Eye size={18} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/catalog')}
                            className="p-2.5 rounded-xl bg-clay-surface hover:bg-clay-deep text-clay-primary shadow-sm border border-white/50 transition-colors"
                            title={t('edit')}
                          >
                            <PencilSimple size={18} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </ClayCard>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
