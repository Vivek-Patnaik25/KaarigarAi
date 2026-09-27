import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Printer, Storefront } from '@phosphor-icons/react'
import WholesaleSheetCard from '../components/WholesaleSheetCard'
import { useCatalogStore } from '../store/catalogStore'
import { fetchPublicProduct } from '../config/api'
import Navbar from '../components/Navbar'
import { localizedField } from '../config/language'
import { useLanguageStore } from '../store/languageStore'

export default function WholesaleSheet() {
  const { listingId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const catalogStore = useCatalogStore()
  const { language } = useLanguageStore()
  const [productData, setProductData] = useState(null)

  useEffect(() => {
    if (listingId && listingId.startsWith('KRG-')) {
      fetchPublicProduct(listingId)
        .then((res) => {
          if (res && res.data) {
            setProductData(res.data)
          }
        })
        .catch((err) => console.error('Error fetching product for wholesale sheet:', err))
    }
  }, [listingId])

  // WhatsApp number from environment variable with fallback
  const contactWhatsapp = productData?.artisan_phone || import.meta.env.VITE_CONTACT_WHATSAPP || '+919556828397'

  // Build listing object from fetched product or catalog store if available, else sample defaults
  const listing = {
    id: listingId || 'LST-8921',
    title: localizedField(productData?.listing, 'title', language) || productData?.title || catalogStore.title || 'Handcrafted Terracotta Pot',
    category: productData?.category ? productData.category.replace(/_/g, ' ') : (catalogStore.category ? catalogStore.category.replace(/_/g, ' ') : 'Pottery and Terracotta'),
    price: productData?.price || catalogStore.price || 1939,
    image: productData?.image_url || productData?.images?.enhanced?.url || catalogStore.enhancedImageUrl || catalogStore.uploadedImagePreview || catalogStore.imagePreview || '/demo/enhanced_pottery.jpg',
    description: localizedField(productData?.listing, 'description', language) || productData?.description || catalogStore.description || 'Traditional wheel-thrown terracotta with a natural finish.',
    artisan_phone: productData?.artisan_phone || contactWhatsapp,
    material: 'Natural river clay and terracotta pigments',
    technique: 'Hand-thrown on a traditional wheel, sun-dried and kiln-fired',
    dimensions: 'Standard dimensions: H 28 cm, diameter 22 cm (custom orders available)',
    leadTime: '3–4 weeks for up to 50 units',
    giTag: 'Geographical indication eligible: Rajasthan terracotta craft',
  }

  const artisan = {
    name: productData?.artisan_name || 'Rameshwar Prajapati',
    region: productData?.location || 'Jaipur, Rajasthan',
    yearsActive: '18 years',
    artisanId: productData?.artisan_id || 'KG-2024-8921',
    phone: productData?.artisan_phone || contactWhatsapp,
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900">
      {/* Top Navbar - hidden during printing */}
      <div className="no-print">
        <Navbar />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Navigation & Header Controls (no-print) */}
        <div className="w-full flex items-center justify-between mb-6 no-print">
          <button
            type="button"
            onClick={() => (window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/dashboard'))}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors px-2.5 py-1.5 rounded bg-white shadow-2xs border border-stone-200 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t('back', 'Back')}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 px-3 py-1.5 rounded shadow-2xs transition-colors cursor-pointer"
            >
              <Printer size={16} />
              <span>{t('wholesale.download_pdf', 'Print / PDF')}</span>
            </button>
          </div>
        </div>

        {/* Printable Wholesale Document Card */}
        <WholesaleSheetCard
          listing={listing}
          artisan={artisan}
          whatsappNumber={contactWhatsapp}
          onDownloadPdf={handlePrint}
        />
      </main>
    </div>
  )
}
