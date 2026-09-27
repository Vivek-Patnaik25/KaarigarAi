import { create } from 'zustand'
import { localizedField, normalizeLanguage } from '../config/language'

const initialState = {
  currentStep: 1, // 1: Image, 2: Voice, 3: Processing, 4: Preview
  imageFile: null,
  imagePreview: null,
  uploadedImageFile: null,
  uploadedImagePreview: null,
  audioBlob: null,
  audioUrl: null,
  transcript: '',
  detectedLanguage: 'en',
  isProcessing: false,
  processingStage: 1, // 1 to 5
  processResponse: null,

  // Listing details for Step 4 Preview / Editing
  title: '',
  titleHi: '',
  titleEn: '',
  titleOr: '',
  titleTa: '',
  titleMr: '',
  titleBn: '',
  description: '',
  descriptionHi: '',
  descriptionEn: '',
  descriptionOr: '',
  descriptionTa: '',
  descriptionMr: '',
  descriptionBn: '',
  selectedDescLang: 'en',
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

  setProcessResponse: (data, activeLang = 'en') => {
    const listing = data.listing || {}
    const titleEn = listing.title_en || ''
    const titleHi = listing.title_hi || ''
    const titleOr = listing.title_or || ''
    const titleTa = listing.title_ta || ''
    const titleMr = listing.title_mr || ''
    const titleBn = listing.title_bn || ''

    const descEn = listing.description_en || ''
    const descHi = listing.description_hi || ''
    const descOr = listing.description_or || ''
    const descTa = listing.description_ta || ''
    const descMr = listing.description_mr || ''
    const descBn = listing.description_bn || ''
    const initialLang = normalizeLanguage(activeLang)
    const activeTitle = localizedField(listing, 'title', initialLang) || 'Handcrafted Artisan Item'
    const activeDesc = localizedField(listing, 'description', initialLang)

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
      title: activeTitle,
      titleHi,
      titleEn,
      titleOr,
      titleTa,
      titleMr,
      titleBn,
      description: activeDesc,
      descriptionHi: descHi,
      descriptionEn: descEn,
      descriptionOr: descOr,
      descriptionTa: descTa,
      descriptionMr: descMr,
      descriptionBn: descBn,
      selectedDescLang: initialLang,
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
    const selectedDescLang = normalizeLanguage(lang)
    const listing = {
      title_en: state.titleEn, title_hi: state.titleHi, title_or: state.titleOr,
      title_ta: state.titleTa, title_mr: state.titleMr, title_bn: state.titleBn,
      description_en: state.descriptionEn, description_hi: state.descriptionHi,
      description_or: state.descriptionOr, description_ta: state.descriptionTa, description_mr: state.descriptionMr, description_bn: state.descriptionBn,
    }
    return {
      selectedDescLang,
      title: localizedField(listing, 'title', selectedDescLang) || state.title,
      description: localizedField(listing, 'description', selectedDescLang) || state.description,
    }
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
