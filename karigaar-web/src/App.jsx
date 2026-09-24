import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LanguageSelectPage from './pages/LanguageSelectPage'
import InventoryDashboard from './pages/InventoryDashboard'
import CatalogPage from './pages/CatalogPage'
import SuccessPage from './pages/SuccessPage'
import ArtisanPassport from './pages/ArtisanPassport'
import WholesaleSheet from './pages/WholesaleSheet'
import PublicProductPage from './pages/PublicProductPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/60">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-6">
              An unexpected error occurred. You can return to the dashboard.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/dashboard'
              }}
              className="px-6 py-3 rounded-2xl bg-[#E8873A] text-white font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function RootRedirect() {
  const savedLang = localStorage.getItem('karigaar_lang')
  if (savedLang) {
    return <Navigate to="/dashboard" replace />
  }
  return <Navigate to="/language-select" replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/language-select" element={<LanguageSelectPage />} />
          <Route path="/dashboard" element={<InventoryDashboard />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/new-listing" element={<CatalogPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/p/:productId" element={<PublicProductPage />} />
          <Route path="/passport/:artisanId" element={<ArtisanPassport />} />
          <Route path="/passport" element={<ArtisanPassport />} />
          <Route path="/listing/:listingId/wholesale" element={<WholesaleSheet />} />
          <Route path="/listing/:listingId" element={<WholesaleSheet />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
