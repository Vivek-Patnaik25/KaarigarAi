import { create } from 'zustand'

const initialState = {
  currentStep: 1, // 1: Image, 2: Voice, 3: Processing, 4: Preview
  imageFile: null,
  imagePreview: null,
  uploadedImageFile: null,
  uploadedImagePreview: null,
  audioBlob: null,
  audioUrl: null,
  transcript: '',
  detectedLanguage: 'hi',
  isProcessing: false,
  processingStage: 1, // 1 to 5
  processResponse: null,
  
  // Listing details for Step 4 Preview / Editing
  title: '',
  description: '',
  descriptionHi: '',
  descriptionEn: '',
  selectedDescLang: 'hi',
  price: 0,
  priceMin: 0,
  priceMax: 0,
  priceReasoning: '',
  tags: ['handmade', 'artisan', 'traditional'],
  category: 'pottery_terracotta',
  enhancedImageUrl: '',

  // Published result info
  publishedProductId: '',
  publishedPublicUrl: '',
}

export const useCatalogStore = create((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setImage: (file, previewUrl) => set({
    imageFile: file,
    uploadedImageFile: file,
    imagePreview: previewUrl,
    uploadedImagePreview: previewUrl,
  }),

  setAudio: (blob, url) => set({ audioBlob: blob, audioUrl: url }),

  setTranscript: (text) => set({ transcript: text }),

  setProcessing: (isProcessing, stage = 1) => set({ isProcessing, processingStage: stage }),

  setProcessResponse: (data) => {
    const listing = data.listing || {}
    const title = listing.title_hi || listing.title_en || 'हस्तनिर्मित उत्पाद'
    const descHi = listing.description_hi || ''
    const descEn = listing.description_en || ''
    const defaultDesc = descHi || descEn

    set({
      processResponse: data,
      enhancedImageUrl: data.enhanced_image_url || '',
      transcript: data.transcript || '',
      detectedLanguage: data.detected_language || 'hi',
      category: data.category || 'pottery_terracotta',
      price: data.price_suggested || 1939,
      priceMin: data.price_min || Math.round((data.price_suggested || 1939) * 0.8),
      priceMax: data.price_max || Math.round((data.price_suggested || 1939) * 1.25),
      priceReasoning: data.price_reasoning || 'उचित मूल्य अनुमान',
      title: title,
      description: defaultDesc,
      descriptionHi: descHi,
      descriptionEn: descEn,
      tags: listing.seo_tags && listing.seo_tags.length > 0 ? [...listing.seo_tags] : ['handmade', 'artisan'],
      isProcessing: false,
    })
  },

  setPublishedInfo: (productId, publicUrl) => set({
    publishedProductId: productId,
    publishedPublicUrl: publicUrl,
  }),

  updateTitle: (title) => set({ title }),

  updateDescription: (description) => set({ description }),

  setSelectedDescLang: (lang) => set((state) => {
    let desc = state.description
    if (lang === 'hi' && state.descriptionHi) desc = state.descriptionHi
    else if (lang === 'en' && state.descriptionEn) desc = state.descriptionEn
    return { selectedDescLang: lang, description: desc }
  }),

  updatePrice: (price) => set({ price: Number(price) }),

  addTag: (newTag) => set((state) => {
    const clean = newTag.trim().toLowerCase()
    if (!clean || state.tags.includes(clean)) return state
    return { tags: [...state.tags, clean] }
  }),

  removeTag: (tagToRemove) => set((state) => ({
    tags: state.tags.filter((t) => t !== tagToRemove),
  })),

  reset: () => set(initialState),
}))
