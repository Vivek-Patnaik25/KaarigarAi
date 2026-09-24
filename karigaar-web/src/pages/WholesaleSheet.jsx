import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Printer, Storefront } from '@phosphor-icons/react'
import WholesaleSheetCard from '../components/WholesaleSheetCard'
import { useCatalogStore } from '../store/catalogStore'
import { fetchPublicProduct } from '../config/api'
import Navbar from '../components/Navbar'

export default function WholesaleSheet() {
  const { listingId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const catalogStore = useCatalogStore()
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
  const contactWhatsapp = import.meta.env.VITE_CONTACT_WHATSAPP || '919876543210'

  // Build listing object from fetched product or catalog store if available, else sample defaults
  const listing = {
    id: listingId || 'LST-8921',
    title: productData?.title || productData?.listing?.title_hi || catalogStore.title || 'हस्तनिर्मित राजस्थानी मिट्टी का घड़ा (Terracotta Pot)',
    category: productData?.category ? productData.category.replace(/_/g, ' ') : (catalogStore.category ? catalogStore.category.replace(/_/g, ' ') : 'मिट्टी और टेराकोटा (Pottery & Terracotta)'),
    price: productData?.price || catalogStore.price || 1939,
    image: productData?.image_url || productData?.images?.enhanced?.url || catalogStore.enhancedImageUrl || catalogStore.uploadedImagePreview || catalogStore.imagePreview || '/demo/enhanced_pottery.jpg',
    description: productData?.description || productData?.listing?.description_hi || catalogStore.description || 'शुद्ध मिट्टी से चाक पर निर्मित पारंपरिक राजस्थानी घड़ा। सूक्ष्म नक्काशी और प्राकृतिक टेराकोटा फिनिश।',
    material: 'प्राकृतिक नदी की मिट्टी एवं जैविक टेराकोटा रंग (Organic Terracotta Clay)',
    technique: 'कुम्हार के चाक पर हस्तनिर्मित, धूप में सुखाया व भट्टी में पकाया हुआ (Wheel-thrown & Kiln-fired)',
    dimensions: 'मानक माप: ऊंचाई 28 सेमी, व्यास 22 सेमी (कस्टम ऑर्डर संभव)',
    leadTime: '50 इकाइयों तक के लिए 3–4 सप्ताह (3-4 weeks for < 50 units)',
    giTag: 'भौगोलिक संकेत (GI) पात्र - राजस्थान टेराकोटा शिल्प',
  }

  const artisan = {
    name: 'रामेश्वर प्रजापति (Rameshwar Prajapati)',
    region: 'जयपुर, राजस्थान (Jaipur, Rajasthan)',
    yearsActive: '18 वर्ष (18 Years)',
    artisanId: 'KG-2024-8921',
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
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
            className="inline-flex items-center gap-2 text-sm font-heading font-bold text-slate-700 hover:text-orange-600 transition-colors px-3 py-2 rounded-xl bg-white shadow-sm border border-slate-200 cursor-pointer"
          >
            <ArrowLeft size={18} weight="bold" />
            <span>{t('back', 'Back')}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Printer size={18} />
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
