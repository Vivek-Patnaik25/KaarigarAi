// User and role configuration for KarigaarAI

export const DEMO_ARTISAN = {
  role: 'artisan',
  phone: '+919556828397',
  pin: '1234',
  name: 'Rameshwar Prajapati',
  nameHi: 'रामेश्वर प्रजापति',
  artisanId: 'KG-2024-8921',
  craft: 'pottery_terracotta',
  craftTitle: 'Terracotta & Pottery',
  location: 'Jaipur, Rajasthan',
  workshopName: 'Prajapati Terracotta Studio',
  yearsActive: '18 years',
  avatarUrl: '/artisan_avatar.png',
  bio: '4th generation master terracotta craftsman specializing in traditional Rajasthani earthen cookware, decorative terracotta pots, and clay craft.',
  languages: ['हिन्दी (Hindi)', 'English', 'मारवाड़ी (Marwari)'],
}

export const DEMO_BUYER = {
  role: 'buyer',
  phone: '+919876543211',
  pin: '1234',
  name: 'Ananya Sharma',
  title: 'Co-Founder & Chief Curator',
  buyerId: 'BUYER-MUM-PRM-001',
  buyerName: 'Parampara Heritage Retail & Living',
  organizationName: 'Parampara Heritage Retail & Living',
  buyerType: 'Premium Boutique & Retailer',
  location: 'Kala Ghoda, Mumbai, Maharashtra',
  categories: ['pottery_terracotta', 'textile_handloom'],
  interests: 'Artisanal earthen cookware, decorative terracotta, and GI-certified handlooms',
  avatarUrl: '',
  gstin: '27AABCP1234F1Z8',
}

const USER_STORAGE_KEY = 'karigaar_user'
const ARTISAN_PROFILE_KEY = 'karigaar_artisan_profile'
const BUYER_PROFILE_KEY = 'karigaar_buyer_profile'
const SHORTLIST_STORAGE_KEY = 'karigaar_buyer_shortlist'
const PROPOSALS_STORAGE_KEY = 'karigaar_sent_proposals'
const BUYER_REQUESTS_STORAGE_KEY = 'karigaar_buyer_requests'

export function getArtisanProfile() {
  try {
    const raw = localStorage.getItem(ARTISAN_PROFILE_KEY)
    if (!raw) return DEMO_ARTISAN
    return { ...DEMO_ARTISAN, ...JSON.parse(raw) }
  } catch (_) {
    return DEMO_ARTISAN
  }
}

export function setArtisanProfile(profile) {
  try {
    const current = getArtisanProfile()
    const updated = { ...current, ...profile }
    localStorage.setItem(ARTISAN_PROFILE_KEY, JSON.stringify(updated))
    const user = getStoredUser()
    if (user?.role === 'artisan') {
      setStoredUser(updated)
    }
    window.dispatchEvent(new Event('karigaar_user_changed'))
    return updated
  } catch (_) {
    return profile
  }
}

export function getBuyerProfile() {
  try {
    const raw = localStorage.getItem(BUYER_PROFILE_KEY)
    if (!raw) return DEMO_BUYER
    return { ...DEMO_BUYER, ...JSON.parse(raw) }
  } catch (_) {
    return DEMO_BUYER
  }
}

export function setBuyerProfile(profile) {
  try {
    const current = getBuyerProfile()
    const updated = { ...current, ...profile }
    localStorage.setItem(BUYER_PROFILE_KEY, JSON.stringify(updated))
    const user = getStoredUser()
    if (user?.role === 'buyer') {
      setStoredUser(updated)
    }
    window.dispatchEvent(new Event('karigaar_user_changed'))
    return updated
  } catch (_) {
    return profile
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (_) {
    return null
  }
}

export function setStoredUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(USER_STORAGE_KEY)
    } else {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }
  } catch (_) {}
}

export function getCurrentRole() {
  const user = getStoredUser()
  return user?.role === 'buyer' ? 'buyer' : 'artisan'
}

export function switchRole(targetRole) {
  if (targetRole === 'buyer') {
    setStoredUser(getBuyerProfile())
  } else {
    setStoredUser(getArtisanProfile())
  }
  window.dispatchEvent(new Event('karigaar_user_changed'))
}

// ── Buyer Shortlist helpers ──────────────────────────────────────────

export function getShortlist() {
  try {
    const raw = localStorage.getItem(SHORTLIST_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (_) {
    return []
  }
}

export function isInShortlist(productId) {
  if (!productId) return false
  const list = getShortlist()
  return list.some(item => (item.id === productId || item.product_id === productId))
}

export function toggleShortlist(product) {
  if (!product) return getShortlist()
  const list = getShortlist()
  const pId = product.id || product.product_id
  const exists = list.some(item => (item.id === pId || item.product_id === pId))
  
  let updated
  if (exists) {
    updated = list.filter(item => (item.id !== pId && item.product_id !== pId))
  } else {
    updated = [product, ...list]
  }
  
  try {
    localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('karigaar_shortlist_changed'))
  } catch (_) {}
  
  return updated
}

// ── Sent Proposals / Requests helpers ────────────────────────────────

export function getSentProposals() {
  try {
    const raw = localStorage.getItem(PROPOSALS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (_) {
    return []
  }
}

export function saveSentProposal(proposal) {
  const list = getSentProposals()
  const updated = [
    {
      ...proposal,
      id: proposal.id || `PROP-${Date.now()}`,
      sentAt: new Date().toISOString(),
      status: 'sent',
    },
    ...list,
  ]
  try {
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('karigaar_proposals_changed'))
  } catch (_) {}
  return updated
}

export function getBuyerRequests() {
  try {
    const raw = localStorage.getItem(BUYER_REQUESTS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (_) {
    return []
  }
}

export function saveBuyerRequest(request) {
  const list = getBuyerRequests()
  const updated = [
    {
      ...request,
      id: request.id || `REQ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'submitted',
    },
    ...list,
  ]
  try {
    localStorage.setItem(BUYER_REQUESTS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('karigaar_requests_changed'))
  } catch (_) {}
  return updated
}
