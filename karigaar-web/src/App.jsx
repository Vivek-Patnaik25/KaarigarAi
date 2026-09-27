import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import LanguageSelectPage from './pages/LanguageSelectPage'
import InventoryDashboard from './pages/InventoryDashboard'
import ArtisanProductsPage from './pages/ArtisanProductsPage'
import ArtisanOpportunitiesPage from './pages/ArtisanOpportunitiesPage'
import CatalogPage from './pages/CatalogPage'
import SuccessPage from './pages/SuccessPage'
import ArtisanPassport from './pages/ArtisanPassport'
import WholesaleSheet from './pages/WholesaleSheet'
import PublicProductPage from './pages/PublicProductPage'
import BuyerDiscoverPage from './pages/BuyerDiscoverPage'
import BuyerShortlistPage from './pages/BuyerShortlistPage'
import BuyerRequestsPage from './pages/BuyerRequestsPage'
import BuyerProfilePage from './pages/BuyerProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import i18n from './config/i18n'
import { getStoredUser } from './config/auth'

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
        <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-center text-stone-900">
          <div className="p-8 max-w-md bg-white rounded-lg shadow-md border border-stone-200 flex flex-col items-center gap-4">
            <div className="w-[100px] h-[100px] rounded-2xl bg-white shadow-xs border border-stone-200 p-2 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="KarigaarAI"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/favicon_new.png'
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1B2E6B] mb-1.5">{i18n.t('screen.error_title', 'Something went wrong')}</h2>
              <p className="text-xs text-stone-500 mb-2 max-w-xs">
                {i18n.t('screen.error_description', 'An unexpected error occurred. You can return to the main dashboard.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/dashboard'
              }}
              className="clay-btn clay-btn-primary text-xs cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              {i18n.t('screen.dashboard_go', 'Go to Dashboard')}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/** Redirect root: no user → login, no lang → lang select, else → role-specific landing */
function RootRedirect() {
  const user = getStoredUser()
  if (!user) return <Navigate to="/login" replace />
  const savedLang = localStorage.getItem('karigaar_lang')
  if (!savedLang) return <Navigate to="/language-select" replace />

  if (user.role === 'buyer') {
    return <Navigate to="/buyer/discover" replace />
  }
  return <Navigate to="/dashboard" replace />
}

/** Guard any authenticated route — bounce to /login if no user session */
function RequireAuth({ children }) {
  const user = getStoredUser()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ── Public & Authentication ─────────────────────────────────── */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/language-select" element={<LanguageSelectPage />} />

          {/* ── Public Product & Passport Storefronts ─────────────────── */}
          <Route path="/p/:productId" element={<PublicProductPage />} />
          <Route path="/passport/:artisanId" element={<ArtisanPassport />} />
          <Route path="/passport" element={<ArtisanPassport />} />
          <Route path="/wholesale/:listingId" element={<WholesaleSheet />} />
          <Route path="/listing/:listingId/wholesale" element={<WholesaleSheet />} />
          <Route path="/listing/:listingId" element={<WholesaleSheet />} />

          {/* ── Artisan Experience Routes ───────────────────────────────── */}
          <Route path="/dashboard" element={<RequireAuth><InventoryDashboard /></RequireAuth>} />
          <Route path="/artisan/dashboard" element={<RequireAuth><InventoryDashboard /></RequireAuth>} />
          <Route path="/inventory" element={<RequireAuth><InventoryDashboard /></RequireAuth>} />
          <Route path="/artisan/products" element={<RequireAuth><ArtisanProductsPage /></RequireAuth>} />
          <Route path="/artisan/opportunities" element={<RequireAuth><ArtisanOpportunitiesPage /></RequireAuth>} />
          <Route path="/artisan/passport" element={<RequireAuth><ArtisanPassport /></RequireAuth>} />
          <Route path="/catalog" element={<RequireAuth><CatalogPage /></RequireAuth>} />
          <Route path="/new-listing" element={<RequireAuth><CatalogPage /></RequireAuth>} />
          <Route path="/success" element={<RequireAuth><SuccessPage /></RequireAuth>} />

          {/* ── Buyer Experience Routes ─────────────────────────────────── */}
          <Route path="/buyer" element={<RequireAuth><BuyerDiscoverPage /></RequireAuth>} />
          <Route path="/buyer/discover" element={<RequireAuth><BuyerDiscoverPage /></RequireAuth>} />
          <Route path="/marketplace" element={<RequireAuth><BuyerDiscoverPage /></RequireAuth>} />
          <Route path="/buyer/shortlist" element={<RequireAuth><BuyerShortlistPage /></RequireAuth>} />
          <Route path="/buyer/requests" element={<RequireAuth><BuyerRequestsPage /></RequireAuth>} />
          <Route path="/buyer/profile" element={<RequireAuth><BuyerProfilePage /></RequireAuth>} />

          {/* ── Settings Experience ───────────────────────────────────── */}
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="/artisan/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="/buyer/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />

          {/* ── 404 Catch-all ───────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
