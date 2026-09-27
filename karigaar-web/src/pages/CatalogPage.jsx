import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { 
  Camera, 
  Microphone, 
  Sparkle, 
  ArrowRight, 
  ArrowLeft, 
  Image as ImageIcon,
  CheckCircle,
  ArrowCounterClockwise,
  Info,
  Sliders,
  Plus,
  RocketLaunch,
  WarningCircle,
  FileText,
  Check,
  SpeakerHigh
} from '@phosphor-icons/react'

import { useCatalogStore } from '../store/catalogStore'
import { useLanguageStore } from '../store/languageStore'
import { SUPPORTED_LANGUAGES } from '../config/language'
import { processProduct, publishListing, transcribeAudio } from '../config/api'
import ClayButton from '../components/ClayButton'
import ClayBadge from '../components/ClayBadge'
import ClayInput from '../components/ClayInput'
import LoadingPipeline from '../components/LoadingPipeline'
import Navbar from '../components/Navbar'
import GITagBanner from '../components/GITagBanner'

// Helper to determine if the enhanced image URL is real (from the backend) vs placeholder
export const isRealEnhancedUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  const lower = url.toLowerCase().trim()
  
  if (
    lower.includes('placeholder') ||
    lower.includes('via.placeholder') ||
    lower.includes('trovecraft') ||
    lower.includes('unsplash.com') ||
    lower.includes('/demo/enhanced_pottery')
  ) {
    return false
  }

  if (lower.startsWith('/temp/') || lower.startsWith('temp/')) {
    return true
  }

  const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').toLowerCase().replace(/\/$/, '')
  if (lower.startsWith(backendUrl)) {
    return true
  }

  if (
    lower.startsWith('http://localhost:8000') ||
    lower.startsWith('http://127.0.0.1:8000') ||
    lower.startsWith('http://0.0.0.0:8000')
  ) {
    return true
  }

  try {
    const parsed = new URL(url)
    if (parsed.pathname.startsWith('/temp/')) {
      return true
    }
  } catch (e) {
    return false
  }

  return false
}

export default function CatalogPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { language } = useLanguageStore()

  const {
    currentStep,
    setStep,
    imageFile,
    imagePreview,
    uploadedImageFile,
    uploadedImagePreview,
    setImage,
    audioBlob,
    audioUrl,
    setAudio,
    transcript,
    setTranscript,
    isProcessing,
    processingStage,
    setProcessing,
    setProcessResponse,
    title,
    updateTitle,
    description,
    updateDescription,
    selectedDescLang,
    setSelectedDescLang,
    price,
    updatePrice,
    priceMin,
    priceMax,
    priceReasoning,
    tags,
    addTag,
    removeTag,
    enhancedImageUrl,
    category,
    titleEn,
    titleHi,
    titleOr,
    titleTa,
    titleMr,
    titleBn,
    descriptionEn,
    descriptionHi,
    descriptionOr,
    descriptionTa,
    descriptionMr,
    descriptionBn,
    processResponse,
    detectedLanguage,
    publishedProductId,
    reset,
  } = useCatalogStore()

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Automatically reset if explicitly navigating to start a new product
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('new') === 'true' || searchParams.get('new') === '1' || location.state?.reset) {
      reset()
    }
  }, [location.search, location.state, reset])

  const recorder = useAudioRecorder()
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const recordingTimerRef = useRef(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const [sliderPos, setSliderPos] = useState(50)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const sliderContainerRef = useRef(null)
  const [showPriceReasoning, setShowPriceReasoning] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [publishLoading, setPublishLoading] = useState(false)
  const [errorToast, setErrorToast] = useState(null)

  const speakText = (text, langCode = 'mr') => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const langMap = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      en: 'en-IN',
      ta: 'ta-IN',
      bn: 'bn-IN',
      or: 'or-IN',
    }
    utterance.lang = langMap[langCode] || `${langCode}-IN`
    window.speechSynthesis.speak(utterance)
  }

  const getListenLabel = (langCode) => {
    const code = (langCode || language || 'mr').toLowerCase()
    if (code === 'mr') return 'ऐका'
    if (code === 'hi') return 'सुनें'
    return 'Listen'
  }

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const preview = URL.createObjectURL(file)
      setImage(file, preview)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
  })

  useEffect(() => {
    if (recorder.isRecording) {
      setRecordingSeconds(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [recorder.isRecording])

  useEffect(() => {
    let isCancelled = false
    const handleVoiceRecorded = async () => {
      if (recorder.recordingBlob && !recorder.isRecording) {
        const blobUrl = URL.createObjectURL(recorder.recordingBlob)
        setAudio(recorder.recordingBlob, blobUrl)
        
        setIsTranscribing(true)
        try {
          const res = await transcribeAudio(recorder.recordingBlob, language)
          const data = res?.data || res
          if (!isCancelled && data?.transcript) {
            setTranscript(data.transcript)
          }
        } catch (err) {
          console.warn('Live voice transcription warning:', err.message)
        } finally {
          if (!isCancelled) {
            setIsTranscribing(false)
          }
        }
      }
    }
    handleVoiceRecorded()
    return () => {
      isCancelled = true
    }
  }, [recorder.recordingBlob, recorder.isRecording, language])

  const handleStartProcessing = async () => {
    setStep(3)
    setProcessing(true, 1)
    setErrorToast(null)

    const stageTimer1 = setTimeout(() => setProcessing(true, 2), 600)
    const stageTimer2 = setTimeout(() => setProcessing(true, 3), 1300)
    const stageTimer3 = setTimeout(() => setProcessing(true, 4), 2000)
    const stageTimer4 = setTimeout(() => setProcessing(true, 5), 2600)

    try {
      const response = await processProduct(imageFile, audioBlob, language, transcript)
      clearTimeout(stageTimer1)
      clearTimeout(stageTimer2)
      clearTimeout(stageTimer3)
      clearTimeout(stageTimer4)

      setProcessing(true, 5)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const data = response.data || response
      if (!data || (!data.listing && !data.category)) {
        throw new Error(t('screen.processing_error'))
      }

      if (data.llm_success === false && data.llm_used === 'local_template') {
        setErrorToast('⚠ AI story enhancement unavailable — local catalog generated successfully.')
        setTimeout(() => setErrorToast(null), 6000)
      }

      setProcessResponse(data, language)
      setStep(4)
    } catch (err) {
      clearTimeout(stageTimer1)
      clearTimeout(stageTimer2)
      clearTimeout(stageTimer3)
      clearTimeout(stageTimer4)
      setProcessing(false, 1)
      setErrorToast(err.message || t('screen.processing_error'))
    }
  }

  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return
    const rect = sliderContainerRef.current.getBoundingClientRect()
    const offsetX = clientX - rect.left
    const percent = Math.min(Math.max((offsetX / rect.width) * 100, 5), 95)
    setSliderPos(percent)
  }

  const leftImage = uploadedImagePreview || imagePreview
  const hasRealEnhanced = isRealEnhancedUrl(enhancedImageUrl)
  let rightImage = leftImage

  if (hasRealEnhanced) {
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
    if (enhancedImageUrl.startsWith('/temp/') || enhancedImageUrl.startsWith('temp/')) {
      rightImage = `${backendBase}/${enhancedImageUrl.replace(/^\//, '')}`
    } else {
      rightImage = enhancedImageUrl
    }
  }

  const handlePublish = async () => {
    setPublishLoading(true)
    try {
      const finalSellingPrice = Number(price) > 0 ? Number(price) : (processResponse?.price_suggested || 1939)
      const aiSuggested = processResponse?.price_suggested || finalSellingPrice
      const aiMin = processResponse?.price_min || priceMin || Math.round(aiSuggested * 0.8)
      const aiMax = processResponse?.price_max || priceMax || Math.round(aiSuggested * 1.25)

      const payload = {
        artisan_id: 'KG-2024-8921',
        title: title || t('product_title'),
        description: description || '',
        price: finalSellingPrice,
        category: category || 'pottery_terracotta',
        tags: tags || ['handmade', 'artisan'],
        image_url: rightImage,
        language,
        listing: {
          title_en: titleEn || (language === 'en' ? title : processResponse?.listing?.title_en || title),
          title_hi: titleHi || (language === 'hi' ? title : processResponse?.listing?.title_hi || title),
          title_or: titleOr || processResponse?.listing?.title_or || title,
          title_ta: titleTa || processResponse?.listing?.title_ta || title,
          title_mr: titleMr || processResponse?.listing?.title_mr || title,
          title_bn: titleBn || processResponse?.listing?.title_bn || title,
          description_en: descriptionEn || description,
          description_hi: descriptionHi || description,
          description_regional: descriptionOr || processResponse?.listing?.description_regional || description,
          description_or: descriptionOr || processResponse?.listing?.description_or || '',
          description_ta: descriptionTa || processResponse?.listing?.description_ta || '',
          description_mr: descriptionMr || processResponse?.listing?.description_mr || '',
          description_bn: descriptionBn || processResponse?.listing?.description_bn || '',
          seo_tags: tags,
          craft_tradition: processResponse?.listing?.craft_tradition,
          material_detected: processResponse?.listing?.material_detected,
        },
        ai_metadata: {
          category: category || 'pottery_terracotta',
          category_confidence: processResponse?.category_confidence || 0.90,
          detected_language: detectedLanguage || language,
          language_confidence: processResponse?.language_confidence || 1.0,
          image_quality_score: processResponse?.image_quality_score || 0.85,
          price_min: aiMin,
          price_suggested: aiSuggested,
          price_max: aiMax,
          price_reasoning: priceReasoning || processResponse?.price_reasoning || t('price_recommendation'),
        },
        source: {
          transcript: transcript || '',
          detected_language: detectedLanguage || language,
        },
        status: 'published',
      }

      const res = await publishListing(payload)
      const data = res?.data || res
      const publishedId = data?.product_id || `KRG-${Date.now()}`
      const publicUrl = data?.public_url || `${window.location.origin}/p/${publishedId}`

      useCatalogStore.getState().setPublishedInfo(publishedId, publicUrl)
      navigate('/success', {
        state: {
          product_id: publishedId,
          public_url: publicUrl,
          title: title || t('product_title'),
          price: finalSellingPrice,
          image: rightImage || leftImage || enhancedImageUrl || imagePreview,
        }
      })
    } catch (err) {
      console.error('Publication error:', err)
      setErrorToast(err.message || t('screen.publish_error'))
    } finally {
      setPublishLoading(false)
    }
  }

  const stepsList = [
    { num: 1, label: t('step_1') },
    { num: 2, label: t('step_2') },
    { num: 3, label: t('step_3') },
    { num: 4, label: t('step_4') },
  ]

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col">
        {/* Step Indicator Header */}
        <div className="mb-6 sm:mb-8 flex flex-col items-center gap-2">
          <div className="grid grid-cols-4 gap-2 max-w-xl w-full mx-auto">
            {stepsList.map((step) => {
              const isCurrent = currentStep === step.num
              const isDone = currentStep > step.num

              return (
                <div
                  key={step.num}
                  className={`flex flex-col items-center text-center p-2 rounded transition-colors ${
                    isCurrent
                      ? 'bg-stone-900 text-white shadow-xs'
                      : isDone
                      ? 'bg-stone-200/80 text-stone-800'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-1 font-semibold text-xs sm:text-sm">
                    {isDone ? (
                      <Check size={14} weight="bold" className="text-emerald-600" />
                    ) : (
                      <span>{step.num}</span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium truncate max-w-full">
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {(currentStep > 1 || imagePreview) && (
            <button
              type="button"
              onClick={() => reset()}
              className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1.5 transition-colors cursor-pointer mt-1"
            >
              <ArrowCounterClockwise size={13} />
              <span>{t('start_new_product', 'Discard & Start New Product')}</span>
            </button>
          )}
        </div>

        {/* Error Toast if any */}
        {errorToast && (
          <div className="mb-5 p-3.5 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <WarningCircle size={18} weight="bold" className="text-amber-700 shrink-0" />
              <span className="font-medium">{errorToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorToast(null)}
              className="text-stone-500 hover:text-stone-900 text-xs font-semibold cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Step Transition Content */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* ==========================================================
                STEP 1: UPLOAD IMAGE
                ========================================================== */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5 max-w-2xl mx-auto w-full"
              >
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-semibold text-stone-900">
                    {t('step1_heading')}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    {t('step1_sub')}
                  </p>
                </div>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-[300px] rounded-lg border-2 border-dashed transition-colors bg-white cursor-pointer ${
                    isDragActive ? 'border-amber-700 bg-amber-50/20' : 'border-stone-300 hover:border-stone-400'
                  }`}
                >
                  <input {...getInputProps()} />

                  {imagePreview ? (
                    <div className="relative w-full max-w-sm h-60 rounded overflow-hidden border border-stone-200 group">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-contain bg-stone-50"
                      />
                      <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5">
                        <Camera size={28} />
                        <span className="text-xs font-medium">{t('change_photo')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-14 h-14 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
                        <Camera size={28} />
                      </div>
                      <h3 className="text-base font-semibold text-stone-900">
                        {t('drop_photo')}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t('browse_photo')} (JPG, PNG, WEBP)
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onDrop([e.target.files[0]])
                      }
                    }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onDrop([e.target.files[0]])
                      }
                    }}
                  />

                  <ClayButton
                    variant="secondary"
                    size="sm"
                    icon={<Camera size={16} />}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    {t('use_camera')}
                  </ClayButton>

                  <ClayButton
                    variant="secondary"
                    size="sm"
                    icon={<ImageIcon size={16} />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('upload_gallery')}
                  </ClayButton>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                  <ClayButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    icon={<ArrowLeft size={16} />}
                  >
                    {t('back', 'Back')}
                  </ClayButton>

                  <ClayButton
                    variant="primary"
                    size="sm"
                    disabled={!imagePreview}
                    onClick={() => setStep(2)}
                    icon={<ArrowRight size={16} />}
                  >
                    {t('next')}
                  </ClayButton>
                </div>
              </motion.div>
            )}

            {/* ==========================================================
                STEP 2: VOICE DESCRIPTION
                ========================================================== */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5 max-w-2xl mx-auto w-full"
              >
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-semibold text-stone-900">
                    {t('step2_heading')}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    {t('voice_hint')}
                  </p>
                </div>

                {/* Image thumbnail preview */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                    <img
                      src={imagePreview}
                      alt="Uploaded craft"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-semibold text-stone-500">
                      {t('selected_photo')}
                    </span>
                    <h4 className="text-xs font-semibold text-stone-900">
                      {t('photo_attached')}
                    </h4>
                  </div>
                </div>

                {/* Center: Microphone Card */}
                <div className="bg-white rounded-lg border border-stone-200 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                  <div className="my-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (recorder.isRecording) {
                          recorder.stopRecording()
                        } else {
                          recorder.startRecording()
                        }
                      }}
                      className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                        recorder.isRecording
                          ? 'bg-amber-700 text-white animate-pulse'
                          : 'bg-stone-900 text-white hover:bg-stone-800'
                      }`}
                      aria-label="Toggle recording"
                    >
                      <Microphone
                        size={40}
                        weight={recorder.isRecording ? 'fill' : 'regular'}
                      />
                    </button>
                  </div>

                  {/* Status labels */}
                  {recorder.isRecording ? (
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                        <span className="w-2 h-2 rounded-full bg-amber-700 animate-ping" />
                        <span>{t('listening')}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-stone-700">
                        {recordingSeconds}s
                      </span>
                    </div>
                  ) : isTranscribing ? (
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="flex items-center gap-1.5 text-stone-800 font-semibold text-xs">
                        <Sparkle className="animate-spin text-stone-700" size={16} weight="fill" />
                        <span>{t('ai_stage_2')}</span>
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {t('step3_sub')}
                      </span>
                    </div>
                  ) : audioUrl ? (
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                        <CheckCircle size={16} weight="fill" />
                        <span>{t('voice_recorded')}</span>
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {t('transcript_ready')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5 mt-1">
                      <span className="text-sm font-semibold text-stone-900">
                        {t('tap_to_speak')}
                      </span>
                      <span className="text-xs text-stone-500">
                        {t('tap_instruction')}
                      </span>
                    </div>
                  )}

                  {/* Transcript speech bubble & editable transcript if recorded */}
                  {!isTranscribing && (audioUrl || transcript) && (
                    <div className="w-full mt-4 p-3 rounded bg-stone-50 border border-stone-200 text-left flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          {t('transcript_label')}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {t('edit')}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder={t('transcript_label')}
                        className="w-full p-2.5 rounded bg-white border border-stone-300 focus:border-stone-900 text-xs text-stone-800 leading-relaxed outline-none resize-none"
                      />
                    </div>
                  )}

                  {/* Re-record button */}
                  {audioUrl && (
                    <div className="mt-3">
                      <ClayButton
                        variant="ghost"
                        size="sm"
                        icon={<ArrowCounterClockwise size={14} />}
                        onClick={() => {
                          setAudio(null, null)
                          setTranscript('')
                        }}
                      >
                        {t('speak_again')}
                      </ClayButton>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                  <ClayButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    icon={<ArrowLeft size={16} />}
                  >
                    {t('back')}
                  </ClayButton>

                  <ClayButton
                    variant="primary"
                    size="sm"
                    disabled={recorder.isRecording}
                    onClick={handleStartProcessing}
                    icon={<Sparkle weight="fill" size={16} />}
                  >
                    {t('next_ai_step')}
                  </ClayButton>
                </div>
              </motion.div>
            )}

            {/* ==========================================================
                STEP 3: AI PROCESSING (LoadingPipeline)
                ========================================================== */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center py-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-stone-900">
                    {t('step3_heading')}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    {t('step3_sub')}
                  </p>
                </div>

                <LoadingPipeline activeStage={processingStage} language={language} />

                {!isProcessing && errorToast && (
                  <div className="mt-4">
                    <ClayButton
                      variant="primary"
                      size="sm"
                      onClick={handleStartProcessing}
                    >
                      {t('try_again')}
                    </ClayButton>
                  </div>
                )}
              </motion.div>
            )}

            {/* ==========================================================
                STEP 4: LISTING PREVIEW (Split Layout)
                ========================================================== */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-stone-900">
                      {t('step4_heading')}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500">
                      {t('step4_sub')}
                    </p>
                  </div>

                  <ClayBadge variant="success" icon={<CheckCircle weight="fill" />}>
                    {t('ai_verified')}
                  </ClayBadge>
                </div>

                {/* Split Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* LEFT PANEL: Before / After Slider */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                        {t('original_image')}
                      </span>
                      <ClayBadge variant={hasRealEnhanced ? 'primary' : 'muted'}>
                        {hasRealEnhanced ? t('enhanced_image') : t('demo_preview_label')}
                      </ClayBadge>
                    </div>

                    {/* Draggable Slider Container */}
                    <div
                      className="relative w-full h-[340px] sm:h-[400px] overflow-hidden select-none bg-stone-100 rounded-lg border border-stone-200"
                    >
                      <div
                        ref={sliderContainerRef}
                        className="relative w-full h-full overflow-hidden cursor-ew-resize select-none"
                        onMouseDown={() => setIsDraggingSlider(true)}
                        onMouseUp={() => setIsDraggingSlider(false)}
                        onMouseLeave={() => setIsDraggingSlider(false)}
                        onMouseMove={(e) => {
                          if (isDraggingSlider) handleSliderMove(e.clientX)
                        }}
                        onTouchMove={(e) => {
                          if (e.touches && e.touches[0]) {
                            handleSliderMove(e.touches[0].clientX)
                          }
                        }}
                      >
                        {/* 1. Base Layer (Right): AI Enhanced image or original fallback */}
                        <img
                          src={rightImage}
                          alt="Enhanced studio product"
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        />

                        {/* 2. Clipped Overlay Layer (Left): User's uploaded original image */}
                        <img
                          src={leftImage}
                          alt="Original user upload"
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none filter saturate-90"
                          style={{
                            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                            WebkitClipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                          }}
                        />

                        {/* 3. Divider Line & Handle */}
                        <div
                          className="absolute inset-y-0 z-20 flex items-center justify-center pointer-events-none"
                          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className="w-0.5 h-full bg-stone-900 shadow-md" />
                          <div className="comparison-slider-handle absolute pointer-events-auto bg-stone-900 text-white rounded-full p-1 border border-white shadow-sm">
                            <Sliders weight="bold" size={14} />
                          </div>
                        </div>

                        {/* Floating Labels */}
                        <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
                          <span className="px-2 py-0.5 rounded bg-stone-900/70 backdrop-blur-xs text-white text-[10px] font-medium">
                            {t('original_label')}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
                          <span className={`px-2 py-0.5 rounded backdrop-blur-xs text-white text-[10px] font-medium ${
                            hasRealEnhanced ? 'bg-amber-800/80' : 'bg-stone-800/80'
                          }`}>
                            {hasRealEnhanced ? t('studio_label') : t('demo_preview_label')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!hasRealEnhanced && (
                      <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-1.5">
                        <Info size={15} weight="bold" className="text-amber-700 shrink-0" />
                        <span>{t('enhancement_unavailable')}</span>
                      </div>
                    )}

                    <p className="text-center text-[11px] text-stone-500">
                      {t('slider_instruction')}
                    </p>
                  </div>

                  {/* RIGHT PANEL: Listing Details */}
                  <div className="flex flex-col gap-4">
                    {/* Editable Title */}
                    <div className="bg-white rounded-lg border border-stone-200 p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                          {t('product_title')}
                        </label>
                        {title && (
                          <button
                            type="button"
                            onClick={() => speakText(title, selectedDescLang || language)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors cursor-pointer"
                            title="Listen to Title"
                          >
                            <SpeakerHigh size={15} weight="bold" className="text-amber-800" />
                            <span>{getListenLabel(selectedDescLang || language)}</span>
                          </button>
                        )}
                      </div>
                      <ClayInput
                        value={title}
                        onChange={(e) => updateTitle(e.target.value)}
                        placeholder={t('enter_title')}
                      />
                    </div>

                    {/* Multilingual Description Section */}
                    <div className="bg-white rounded-lg border border-stone-200 p-4 flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                            {t('product_story')}
                          </label>
                          {description && (
                            <button
                              type="button"
                              onClick={() => speakText(description, selectedDescLang || language)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors cursor-pointer"
                              title="Listen to Description"
                            >
                              <SpeakerHigh size={15} weight="bold" className="text-amber-800" />
                              <span>{getListenLabel(selectedDescLang || language)}</span>
                            </button>
                          )}
                        </div>
                        {/* Language Toggle */}
                        <div className="flex items-center gap-0.5 p-0.5 bg-stone-100 rounded border border-stone-200">
                          {SUPPORTED_LANGUAGES.map(({ code: lang }) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => setSelectedDescLang(lang)}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase transition-colors cursor-pointer ${
                                selectedDescLang === lang
                                  ? 'bg-white text-stone-900 shadow-2xs'
                                  : 'text-stone-500 hover:text-stone-800'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      <ClayInput
                        isTextArea
                        rows={4}
                        value={description}
                        onChange={(e) => updateDescription(e.target.value)}
                        placeholder={t('enter_story')}
                      />
                    </div>

                    {/* GI Tag Opportunity Banner */}
                    <GITagBanner detectedCategory={category} />

                    {/* Price Section */}
                    <div className="bg-white rounded-lg border border-stone-200 p-4 flex flex-col gap-3">
                      {/* AI Recommended Price Range */}
                      <div className="p-3 rounded bg-stone-50 border border-stone-200 flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                            {t('ai_recommended_price', 'AI Recommended Price')}
                          </span>
                          <ClayBadge variant="primary">
                            {t('ai_fair_value', 'AI Fair Value')}
                          </ClayBadge>
                        </div>
                        <span className="text-lg font-mono font-semibold text-stone-900">
                          ₹{(priceMin || 1833).toLocaleString('en-IN')} – ₹{(priceMax || 2290).toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-stone-500">
                          {t('based_on_factors', 'Based on craft type, materials, technique and market factors.')}
                        </p>
                      </div>

                      {/* Artisan Selling Price */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-700">
                            {t('suggested_selling_price', 'Selling Price')} (₹)
                          </label>
                          <span className="text-[10px] font-medium text-amber-800">
                            {t('artisan_decision', 'Artisan Final Price')}
                          </span>
                        </div>
                        
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-base font-semibold font-mono text-stone-500">₹</span>
                          <input
                            type="number"
                            min={10}
                            step={10}
                            value={price || ''}
                            onChange={(e) => updatePrice(Number(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-1.5 rounded border border-stone-300 focus:border-stone-900 text-base font-mono font-semibold text-emerald-800 outline-none"
                            placeholder="Enter selling price"
                          />
                        </div>

                        <p className="text-[10px] text-stone-500">
                          {t('adjust_price_hint', 'You can adjust this price before publishing.')}
                        </p>
                      </div>

                      {/* Range Slider */}
                      <div className="flex flex-col gap-1 pt-0.5">
                        <div className="flex justify-between text-[10px] font-mono text-stone-500">
                          <span>₹{priceMin || 1833}</span>
                          <span>₹{priceMax || 2290}</span>
                        </div>
                        <input
                          type="range"
                          min={Math.min(priceMin || 1833, price)}
                          max={Math.max(priceMax || 2290, price)}
                          value={price || 1939}
                          onChange={(e) => updatePrice(Number(e.target.value) || 0)}
                          className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded"
                        />
                      </div>

                      {/* Expandable "Why this price?" */}
                      <div className="border-t border-stone-100 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowPriceReasoning(!showPriceReasoning)}
                          className="text-[11px] font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Info size={14} />
                          <span>{t('why_this_price')}</span>
                          <span>{showPriceReasoning ? '▲' : '▼'}</span>
                        </button>

                        {showPriceReasoning && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 p-2.5 bg-stone-50 rounded text-[11px] text-stone-700 leading-relaxed border border-stone-200"
                          >
                            {priceReasoning || (
                              language === 'en'
                                ? 'Fair valuation based on authentic handcrafted pottery, material costs, labor hours, and current marketplace benchmarks.'
                                : t('based_on_factors')
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Search & Marketplace Tags */}
                    <div className="bg-white rounded-lg border border-stone-200 p-4 flex flex-col gap-2.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                        {t('tags')}
                      </label>

                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <ClayBadge
                            key={tag}
                            variant="secondary"
                            onRemove={() => removeTag(tag)}
                          >
                            #{tag}
                          </ClayBadge>
                        ))}
                      </div>

                      {/* Add new tag inline */}
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (newTagInput) {
                                addTag(newTagInput)
                                setNewTagInput('')
                              }
                            }
                          }}
                          placeholder={t('enter_tag')}
                          className="text-xs py-1.5 px-2.5 rounded border border-stone-300 focus:outline-none focus:border-stone-900 flex-1"
                        />
                        <ClayButton
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            if (newTagInput) {
                              addTag(newTagInput)
                              setNewTagInput('')
                            }
                          }}
                          icon={<Plus size={14} />}
                        >
                          {t('add_btn')}
                        </ClayButton>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-col gap-2.5">
                      <ClayButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={publishLoading}
                        onClick={handlePublish}
                        icon={<RocketLaunch weight="fill" size={18} />}
                      >
                        {t('publish_cta')}
                      </ClayButton>

                      <div className="flex items-center gap-2">
                        <ClayButton
                          variant="secondary"
                          size="md"
                          onClick={() => setStep(2)}
                          icon={<ArrowLeft size={16} />}
                          className="flex-1"
                        >
                          {t('back', 'Back')}
                        </ClayButton>

                        <ClayButton
                          variant="secondary"
                          size="md"
                          onClick={() => navigate('/listing/current/wholesale')}
                          icon={<FileText size={16} />}
                          className="flex-1"
                        >
                          {t('wholesale.b2b_inquiry_btn', '📄 B2B Spec Sheet')}
                        </ClayButton>

                        <ClayButton
                          variant="ghost"
                          size="md"
                          onClick={() => reset()}
                          icon={<ArrowCounterClockwise size={16} />}
                          className="text-stone-600 hover:text-stone-900"
                        >
                          {t('start_new_product', 'Start New')}
                        </ClayButton>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
