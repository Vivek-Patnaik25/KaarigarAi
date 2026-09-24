import axios from 'axios'

// Mock response for offline/isolated frontend preview tests
export const MOCK_PROCESS_RESPONSE = {
  enhanced_image_url: '/demo/enhanced_pottery.jpg',
  image_quality_score: 0.87,
  transcript: 'यह मिट्टी का घड़ा राजस्थान के कुम्हारों ने हाथ से बनाया है',
  detected_language: 'hi',
  category: 'pottery_terracotta',
  category_confidence: 0.91,
  price_min: 1833,
  price_suggested: 1939,
  price_max: 2290,
  price_reasoning: 'Suggested price ₹1,939 — handcrafted terracotta, authentic Rajasthan origin (Range: ₹1,833 - ₹2,290)',
  listing: {
    title_en: 'Handcrafted Rajasthani Terracotta Pot',
    title_hi: 'हस्तनिर्मित राजस्थानी मिट्टी का घड़ा',
    description_en: 'A beautiful hand-thrown terracotta pot crafted by skilled potters of Rajasthan. Perfect for traditional cooling of drinking water and authentic rustic home decor.',
    description_hi: 'राजस्थान के कुशल कुम्हारों द्वारा हाथ से बनाया गया सुंदर मिट्टी का घड़ा। प्राकृतिक रूप से पानी ठंडा रखने और घर की सजावट के लिए सर्वोत्तम।',
    seo_tags: ['terracotta', 'rajasthan', 'handmade', 'pottery', 'earthen'],
    craft_tradition: 'Rajasthani Terracotta Art',
    material_detected: 'terracotta clay'
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 45000, // 45s for AI models
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.message || err.response?.data?.detail || err.message || 'कुछ गलत हो गया। फिर कोशिश करें।'
    return Promise.reject(new Error(message))
  }
)

export const transcribeAudio = async (audioBlob, languageHint = 'hi') => {
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === true
  if (isDemo) {
    return { success: true, data: { transcript: 'यह मिट्टी का घड़ा राजस्थान के कुम्हारों ने हाथ से बनाया है' } }
  }

  const form = new FormData()
  const isWebm = audioBlob?.type?.includes('webm')
  const isOgg = audioBlob?.type?.includes('ogg')
  const filename = isWebm ? 'voice.webm' : (isOgg ? 'voice.ogg' : 'voice.wav')
  form.append('audio', audioBlob, filename)
  if (languageHint) {
    form.append('language_hint', languageHint)
  }

  const response = await api.post('/catalog/transcribe', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response?.data || response
}

export const processProduct = async (imageFile, audioBlob, languageHint = 'hi', textDescription = '') => {
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === true
  
  if (isDemo) {
    await new Promise(resolve => setTimeout(resolve, 2500))
    return { success: true, data: MOCK_PROCESS_RESPONSE }
  }

  const form = new FormData()
  if (imageFile) {
    form.append('image', imageFile)
  }
  if (audioBlob) {
    const isWebm = audioBlob?.type?.includes('webm')
    const filename = isWebm ? 'voice.webm' : 'voice.wav'
    form.append('audio', audioBlob, filename)
  }
  if (textDescription) {
    form.append('text_description', textDescription)
  }
  form.append('language_hint', languageHint)

  const response = await api.post('/catalog/process', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  if (response && response.data) {
    return response
  }
  return { success: true, data: response }
}


export const publishListing = async (listingPayload) => {
  try {
    const response = await api.post('/catalog/publish', listingPayload)
    return response
  } catch (error) {
    console.error('Publish API call failed:', error.message)
    throw error
  }
}

export const fetchMyListings = async (artisanId = 'KG-2024-8921', status = null) => {
  const params = { artisan_id: artisanId }
  if (status) params.status = status
  const response = await api.get('/catalog/my-listings', { params })
  return response?.data || response || []
}

export const fetchProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`)
  return response?.data || response
}

export const fetchPublicProduct = fetchProductById

export const updateProductStatus = async (productId, status) => {
  const response = await api.patch(`/products/${productId}/status`, { status })
  return response?.data || response
}

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`)
  return response?.data || response
}

export const checkHealth = async () => {
  return await api.get('/health')
}

export const predictPrice = (payload) => api.post('/catalog/predict-price', payload)

// ==========================================
// Market Linkage & Buyer Matching API
// ==========================================

export const findMarketMatches = async (productId) => {
  const response = await api.post('/market/match', { product_id: productId })
  return response?.data || response
}

export const fetchBuyerRequirements = async (category = null) => {
  const params = {}
  if (category) params.category = category
  const response = await api.get('/market/buyers', { params })
  return response?.data || response
}

export const fetchBuyerById = async (buyerId) => {
  const response = await api.get(`/market/buyers/${buyerId}`)
  return response?.data || response
}

export const createDemoInquiry = async (payload) => {
  const response = await api.post('/market/inquiries', payload)
  return response?.data || response
}

export const fetchProductInquiries = async (productId) => {
  const response = await api.get(`/market/inquiries/${productId}`)
  return response?.data || response
}

export default api
