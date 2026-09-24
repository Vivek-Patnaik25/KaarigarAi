import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
  FileText
} from '@phosphor-icons/react'

import { useCatalogStore } from '../store/catalogStore'
import { useLanguageStore } from '../store/languageStore'
import { processProduct, publishListing, transcribeAudio } from '../config/api'
import ClayButton from '../components/ClayButton'
import ClayCard from '../components/ClayCard'
import ClayBadge from '../components/ClayBadge'
import ClayInput from '../components/ClayInput'
import LoadingPipeline from '../components/LoadingPipeline'
import Navbar from '../components/Navbar'
import GITagBanner from '../components/GITagBanner'

// Helper to determine if the enhanced image URL is real (from the backend) vs placeholder
export const isRealEnhancedUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  const lower = url.toLowerCase().trim()
  
  // Exclude mock placeholders or external scraped domains
  if (
    lower.includes('placeholder') ||
    lower.includes('via.placeholder') ||
    lower.includes('trovecraft') ||
    lower.includes('unsplash.com') ||
    lower.includes('/demo/enhanced_pottery')
  ) {
    return false
  }

  // Relative /temp/ path
  if (lower.startsWith('/temp/') || lower.startsWith('temp/')) {
    return true
  }

  // Matching backend host or local address
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
    descriptionEn,
    descriptionHi,
    processResponse,
    detectedLanguage,
    reset,
  } = useCatalogStore()

  // Local state for Step 1 camera input
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Local state for Step 2 Audio Recorder
  const recorder = useAudioRecorder()
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const recordingTimerRef = useRef(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Local state for Step 4 Image Comparison Slider
  const [sliderPos, setSliderPos] = useState(50) // percentage 0 - 100
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const sliderContainerRef = useRef(null)
  const [showPriceReasoning, setShowPriceReasoning] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [publishLoading, setPublishLoading] = useState(false)
  const [errorToast, setErrorToast] = useState(null)

  // Handle dropzone for Step 1
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

  // Timer for Step 2 voice recording
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

  // Capture finished recording from recorder and transcribe live via backend
  useEffect(() => {
    let isCancelled = false
    const handleVoiceRecorded = async () => {
      if (recorder.recordingBlob && !recorder.isRecording) {
        const blobUrl = URL.createObjectURL(recorder.recordingBlob)
        setAudio(recorder.recordingBlob, blobUrl)
        
        // Call backend speech-to-text API live!
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

  // Step 3 AI Pipeline Trigger
  const handleStartProcessing = async () => {
    setStep(3)
    setProcessing(true, 1)
    setErrorToast(null)

    // Simulate stage progress sequence while waiting
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
        throw new Error('AI processing returned invalid or empty data.')
      }
      setProcessResponse(data)
      setStep(4)
    } catch (err) {
      clearTimeout(stageTimer1)
      clearTimeout(stageTimer2)
      clearTimeout(stageTimer3)
      clearTimeout(stageTimer4)
      setProcessing(false, 1)
      setErrorToast(err.message || 'AI प्रोसेसिंग में त्रुटि हुई। कृपया पुनः प्रयास करें।')
    }
  }

  // Handle Dragging Before/After Image Slider
  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return
    const rect = sliderContainerRef.current.getBoundingClientRect()
    const offsetX = clientX - rect.left
    const percent = Math.min(Math.max((offsetX / rect.width) * 100, 5), 95)
    setSliderPos(percent)
  }

  // Determine images for Step 4 Preview:
  // LEFT SIDE: ALWAYS the user's uploaded original image object URL
  const leftImage = uploadedImagePreview || imagePreview

  // RIGHT SIDE: Enhanced image if valid, otherwise fallback to the user's original image
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

  // Publish Listing Handler (Real One-Click Publishing to MongoDB)
  const handlePublish = async () => {
    setPublishLoading(true)
    try {
      const finalSellingPrice = Number(price) > 0 ? Number(price) : (processResponse?.price_suggested || 1939)
      const aiSuggested = processResponse?.price_suggested || finalSellingPrice
      const aiMin = processResponse?.price_min || priceMin || Math.round(aiSuggested * 0.8)
      const aiMax = processResponse?.price_max || priceMax || Math.round(aiSuggested * 1.25)

      const payload = {
        artisan_id: 'KG-2024-8921',
        title: title || 'हस्तनिर्मित उत्पाद',
        description: description || '',
        price: finalSellingPrice,
        category: category || 'pottery_terracotta',
        tags: tags || ['handmade', 'artisan'],
        image_url: rightImage,
        language: language || 'hi',
        listing: {
          title_en: title,
          title_hi: title,
          description_en: descriptionEn || description,
          description_hi: descriptionHi || description,
          seo_tags: tags,
          craft_tradition: processResponse?.listing?.craft_tradition,
          material_detected: processResponse?.listing?.material_detected,
        },
        ai_metadata: {
          category: category || 'pottery_terracotta',
          category_confidence: processResponse?.category_confidence || 0.90,
          detected_language: detectedLanguage || 'hi',
          language_confidence: processResponse?.language_confidence || 1.0,
          image_quality_score: processResponse?.image_quality_score || 0.85,
          price_min: aiMin,
          price_suggested: aiSuggested,
          price_max: aiMax,
          price_reasoning: priceReasoning || processResponse?.price_reasoning || 'उचित मूल्य अनुमान',
        },
        source: {
          transcript: transcript || '',
          detected_language: detectedLanguage || 'hi',
        },
        status: 'published',
      }

      const res = await publishListing(payload)
      const data = res?.data || res
      const publishedId = data?.product_id || `KRG-${Date.now()}`
      const publicUrl = data?.public_url || `${window.location.origin}/p/${publishedId}`

      // Save in Zustand store for Success page
      useCatalogStore.getState().setPublishedInfo(publishedId, publicUrl)

      navigate('/success')
    } catch (err) {
      console.error('Publication error:', err)
      setErrorToast(err.message || 'प्रकाशित करने में त्रुटि हुई। कृपया पुनः प्रयास करें।')
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
    <div className="min-h-screen bg-clay-bg flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 flex-1 flex flex-col">
        {/* Step Indicator Header */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
            {stepsList.map((step) => {
              const isCurrent = currentStep === step.num
              const isDone = currentStep > step.num

              return (
                <div
                  key={step.num}
                  className={`flex flex-col items-center text-center p-2 rounded-2xl transition-all duration-200 ${
                    isCurrent
                      ? 'bg-clay-primary text-white shadow-lg shadow-clay-primary/30 scale-105'
                      : isDone
                      ? 'bg-clay-surface text-clay-indigo border border-white/60'
                      : 'bg-clay-surface/50 text-clay-muted opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1 font-heading font-black text-sm sm:text-base">
                    {isDone ? (
                      <CheckCircle weight="fill" size={18} className="text-clay-success" />
                    ) : (
                      <span>{step.num}</span>
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold truncate max-w-full">
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Toast if any */}
        {errorToast && (
          <div className="mb-6 p-4 rounded-2xl bg-red-100 border-2 border-clay-error text-clay-error flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <WarningCircle size={24} weight="fill" />
              <span className="font-bold text-sm">{errorToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorToast(null)}
              className="text-xs font-black underline hover:opacity-80"
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-clay-indigo font-heading">
                    {t('step1_heading')}
                  </h2>
                  <p className="text-sm sm:text-base text-clay-muted mt-1">
                    {t('step1_sub')}
                  </p>
                </div>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`clay-dropzone p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden transition-all ${
                    isDragActive ? 'active border-clay-primary scale-[0.99]' : ''
                  }`}
                >
                  <input {...getInputProps()} />

                  {imagePreview ? (
                    <div className="relative w-full max-w-md h-64 rounded-2xl overflow-hidden shadow-md group">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-contain bg-clay-deep/20"
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                        <Camera size={36} weight="bold" />
                        <span className="text-sm font-bold">{t('change_photo')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-3xl bg-white/70 shadow-inner flex items-center justify-center text-clay-indigo">
                        <Camera size={48} weight="duotone" className="text-clay-primary" />
                      </div>
                      <h3 className="text-xl font-black text-clay-indigo font-heading">
                        {t('drop_photo')}
                      </h3>
                      <p className="text-sm text-clay-muted font-medium">
                        {t('browse_photo')} (JPG, PNG, WEBP)
                      </p>
                    </div>
                  )}
                </div>

                {/* Pill Action Buttons (Use Camera & Upload from Gallery) */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {/* Hidden camera input with capture attribute */}
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
                    variant="ghost"
                    icon={<Camera size={20} />}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    {t('use_camera')}
                  </ClayButton>

                  <ClayButton
                    variant="ghost"
                    icon={<ImageIcon size={20} />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('upload_gallery')}
                  </ClayButton>
                </div>

                {/* Back to Dashboard & Next Button */}
                <div className="flex items-center justify-between pt-4">
                  <ClayButton
                    variant="ghost"
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    icon={<ArrowLeft weight="bold" size={20} />}
                  >
                    {t('back', 'Back')}
                  </ClayButton>

                  <ClayButton
                    variant="primary"
                    size="lg"
                    disabled={!imagePreview}
                    onClick={() => setStep(2)}
                    icon={<ArrowRight weight="bold" size={20} />}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-clay-indigo font-heading">
                    {t('step2_heading')}
                  </h2>
                  <p className="text-sm sm:text-base text-clay-muted mt-1">
                    {t('voice_hint')}
                  </p>
                </div>

                {/* Top: Uploaded image thumbnail preview */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md border-2 border-white/60 bg-clay-surface flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Uploaded craft"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-clay-muted uppercase">
                      {t('selected_photo')}
                    </span>
                    <h4 className="text-sm font-bold text-clay-indigo">
                      {t('photo_attached')}
                    </h4>
                  </div>
                </div>

                {/* Center: Large Clay Microphone Card */}
                <ClayCard className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full">
                  {/* Mic Button Circle */}
                  <div className="my-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (recorder.isRecording) {
                          recorder.stopRecording()
                        } else {
                          recorder.startRecording()
                        }
                      }}
                      className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                        recorder.isRecording
                          ? 'bg-gradient-to-br from-clay-primary to-orange-600 text-white mic-recording-pulse'
                          : 'bg-gradient-to-br from-clay-surface to-clay-deep text-clay-indigo shadow-xl hover:scale-105 active:scale-95 border-2 border-white/80'
                      }`}
                      aria-label="Toggle recording"
                    >
                      <Microphone
                        size={56}
                        weight={recorder.isRecording ? 'fill' : 'duotone'}
                        className={recorder.isRecording ? 'animate-pulse' : 'text-clay-indigo'}
                      />
                    </button>
                  </div>

                  {/* Status labels */}
                  {recorder.isRecording ? (
                    <div className="flex flex-col items-center gap-1 mt-2">
                      <div className="flex items-center gap-2 text-clay-primary font-black text-lg">
                        <span className="w-3 h-3 rounded-full bg-clay-primary animate-ping" />
                        <span>{t('listening')}</span>
                      </div>
                      <span className="text-sm font-bold text-clay-indigo">
                        {recordingSeconds}s
                      </span>
                    </div>
                  ) : isTranscribing ? (
                    <div className="flex flex-col items-center gap-1 mt-2">
                      <div className="flex items-center gap-2 text-clay-primary font-black text-base animate-pulse">
                        <Sparkle className="animate-spin text-clay-primary" size={20} weight="fill" />
                        <span>{language === 'hi' ? 'आवाज़ को टेक्स्ट में बदला जा रहा है...' : 'Transcribing voice in real-time...'}</span>
                      </div>
                      <span className="text-xs text-clay-muted">
                        {language === 'hi' ? 'कृपया प्रतीक्षा करें...' : 'Please wait a moment...'}
                      </span>
                    </div>
                  ) : audioUrl ? (
                    <div className="flex flex-col items-center gap-1 mt-2">
                      <div className="flex items-center gap-2 text-clay-success font-black text-lg">
                        <CheckCircle size={22} weight="fill" />
                        <span>{t('voice_recorded')}</span>
                      </div>
                      <span className="text-xs text-clay-muted">
                        {t('transcript_ready')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 mt-2">
                      <span className="text-lg font-black text-clay-indigo font-heading">
                        {t('tap_to_speak')}
                      </span>
                      <span className="text-xs text-clay-muted">
                        {t('tap_instruction')}
                      </span>
                    </div>
                  )}

                  {/* Transcript speech bubble & editable transcript if recorded */}
                  {!isTranscribing && (audioUrl || transcript) && (
                    <div className="w-full mt-6 p-4 rounded-2xl bg-clay-surface border border-white/80 shadow-inner text-left flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-clay-primary">
                          {t('transcript_label')}
                        </span>
                        <span className="text-[11px] font-bold text-clay-muted">
                          {language === 'hi' ? 'आवश्यकतानुसार एडिट करें' : 'Edit if needed'}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder={language === 'hi' ? 'बोले गए शब्द यहाँ दिखेंगे...' : 'Transcribed voice text will appear here...'}
                        className="w-full p-3 rounded-xl bg-white border border-clay-muted/30 focus:border-clay-primary focus:ring-2 focus:ring-clay-primary/20 text-sm text-clay-text font-medium leading-relaxed outline-none resize-none shadow-sm transition-all"
                      />
                    </div>
                  )}

                  {/* Re-record button */}
                  {audioUrl && (
                    <div className="mt-4">
                      <ClayButton
                        variant="ghost"
                        size="sm"
                        icon={<ArrowCounterClockwise size={18} />}
                        onClick={() => {
                          setAudio(null, null)
                          setTranscript('')
                        }}
                      >
                        {t('speak_again')}
                      </ClayButton>
                    </div>
                  )}
                </ClayCard>

                {/* Back and Next navigation buttons */}
                <div className="flex items-center justify-between pt-4">
                  <ClayButton
                    variant="ghost"
                    size="lg"
                    onClick={() => setStep(1)}
                    icon={<ArrowLeft weight="bold" size={20} />}
                  >
                    {t('back')}
                  </ClayButton>

                  <ClayButton
                    variant="primary"
                    size="lg"
                    disabled={recorder.isRecording}
                    onClick={handleStartProcessing}
                    icon={<Sparkle weight="fill" size={20} />}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-clay-primary-soft text-clay-indigo text-xs font-black uppercase tracking-wider mb-2">
                    <Sparkle weight="fill" size={16} className="text-clay-primary" />
                    {t('ai_active_badge')}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-clay-indigo font-heading">
                    {t('step3_heading')}
                  </h2>
                  <p className="text-sm text-clay-muted mt-1">
                    {t('step3_sub')}
                  </p>
                </div>

                {/* 5-step animated progress */}
                <LoadingPipeline activeStage={processingStage} language={language} />

                {/* Retry action if needed */}
                {!isProcessing && errorToast && (
                  <div className="mt-4">
                    <ClayButton
                      variant="primary"
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-clay-indigo font-heading">
                      {t('step4_heading')}
                    </h2>
                    <p className="text-xs sm:text-sm text-clay-muted">
                      {t('step4_sub')}
                    </p>
                  </div>

                  <ClayBadge variant="success" icon={<CheckCircle weight="fill" />}>
                    {t('ai_verified')}
                  </ClayBadge>
                </div>

                {/* Split Panels: Left (Before/After Slider) & Right (Listing Details) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* LEFT PANEL: Before / After Slider */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-clay-muted">
                        {t('original_image')}
                      </span>
                      <ClayBadge variant={hasRealEnhanced ? 'primary' : 'muted'}>
                        {hasRealEnhanced ? t('enhanced_image') : t('demo_preview_label')}
                      </ClayBadge>
                    </div>

                    {/* Draggable Slider Container */}
                    <ClayCard
                      className="relative w-full h-[360px] sm:h-[440px] overflow-hidden select-none p-1 rounded-3xl"
                    >
                      <div
                        ref={sliderContainerRef}
                        className="relative w-full h-full rounded-2xl overflow-hidden cursor-ew-resize select-none"
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
                          <div className="w-1 h-full bg-clay-primary shadow-lg" />
                          <div className="comparison-slider-handle absolute pointer-events-auto">
                            <Sliders weight="bold" size={20} />
                          </div>
                        </div>

                        {/* Floating Labels on image */}
                        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                          <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
                            {t('original_label')}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                          <span className={`px-2.5 py-1 rounded-xl backdrop-blur-sm text-white text-[11px] font-bold ${
                            hasRealEnhanced ? 'bg-clay-primary/90' : 'bg-clay-indigo/90'
                          }`}>
                            {hasRealEnhanced ? t('studio_label') : t('demo_preview_label')}
                          </span>
                        </div>
                      </div>
                    </ClayCard>

                    {/* Note if enhancement preview is unavailable in demo */}
                    {!hasRealEnhanced && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 shadow-sm">
                        <Info size={18} weight="fill" className="text-amber-600 shrink-0" />
                        <span>{t('enhancement_unavailable')}</span>
                      </div>
                    )}

                    <p className="text-center text-xs text-clay-muted">
                      {t('slider_instruction')}
                    </p>
                  </div>

                  {/* RIGHT PANEL: Listing Details */}
                  <div className="flex flex-col gap-5">
                    {/* Editable Title */}
                    <ClayCard className="p-5 flex flex-col gap-3">
                      <ClayInput
                        label={t('product_title')}
                        value={title}
                        onChange={(e) => updateTitle(e.target.value)}
                        placeholder={t('enter_title')}
                      />
                    </ClayCard>

                    {/* Multilingual Description Section */}
                    <ClayCard className="p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-clay-indigo font-heading">
                          {t('product_story')}
                        </label>
                        {/* Language Toggle Pills */}
                        <div className="flex items-center gap-1 p-1 bg-clay-deep/50 rounded-xl">
                          {['hi', 'en', 'or'].map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => setSelectedDescLang(lang)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                                selectedDescLang === lang
                                  ? 'bg-clay-primary text-white shadow-sm'
                                  : 'text-clay-text hover:bg-clay-surface'
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
                    </ClayCard>

                    {/* GI Tag Opportunity Banner */}
                    <GITagBanner detectedCategory={category} />

                    {/* Price Section (Clay Card with clay-primary-soft background) */}
                    {/* Price Section (Clay Card with AI recommendation + Editable Artisan Price) */}
                    <div className="clay-card p-5 bg-gradient-to-br from-[#FDF0E2] to-[#F8DEC7] border-2 border-clay-primary/30 flex flex-col gap-4">
                      {/* AI Recommended Price Range */}
                      <div className="p-3.5 rounded-2xl bg-white/70 border border-white/80 flex flex-col gap-1 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-clay-muted">
                            {t('ai_recommended_price', 'AI Recommended Price')}
                          </span>
                          <ClayBadge variant="primary">
                            {t('ai_fair_value', 'AI Fair Value')}
                          </ClayBadge>
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-clay-indigo font-heading">
                          ₹{(priceMin || 1833).toLocaleString('en-IN')} – ₹{(priceMax || 2290).toLocaleString('en-IN')}
                        </span>
                        <p className="text-[11px] text-clay-muted font-medium">
                          {t('based_on_factors', 'Based on craft type, materials, technique and market factors.')}
                        </p>
                      </div>

                      {/* Artisan Selling Price (Directly Editable) */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-clay-text">
                            {t('suggested_selling_price', 'Selling Price')} (₹)
                          </label>
                          <span className="text-[11px] font-bold text-clay-primary">
                            {t('artisan_decision', 'Artisan Final Price')}
                          </span>
                        </div>
                        
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-lg font-black text-clay-primary">₹</span>
                          <input
                            type="number"
                            min={10}
                            step={10}
                            value={price || ''}
                            onChange={(e) => updatePrice(Number(e.target.value) || 0)}
                            className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-white border-2 border-clay-primary/40 focus:border-clay-primary focus:ring-2 focus:ring-clay-primary/20 text-xl sm:text-2xl font-black text-clay-primary font-heading transition-all shadow-inner outline-none"
                            placeholder="Enter selling price"
                          />
                        </div>

                        <p className="text-[11px] text-clay-muted">
                          {t('adjust_price_hint', 'You can adjust this price before publishing.')}
                        </p>
                      </div>

                      {/* Range Slider for Quick Artisan Adjustment */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        <div className="flex justify-between text-xs font-bold text-clay-muted">
                          <span>{t('min_price')}: ₹{priceMin || 1833}</span>
                          <span>{t('max_price')}: ₹{priceMax || 2290}</span>
                        </div>
                        <input
                          type="range"
                          min={Math.min(priceMin || 1833, price)}
                          max={Math.max(priceMax || 2290, price)}
                          value={price || 1939}
                          onChange={(e) => updatePrice(Number(e.target.value) || 0)}
                          className="w-full accent-clay-primary cursor-pointer h-2 bg-clay-surface rounded-lg"
                        />
                      </div>

                      {/* Expandable "Why this price?" */}
                      <div className="border-t border-clay-muted/20 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowPriceReasoning(!showPriceReasoning)}
                          className="text-xs font-bold text-clay-indigo hover:text-clay-primary flex items-center gap-1.5"
                        >
                          <Info size={16} />
                          <span>{t('why_this_price')}</span>
                          <span>{showPriceReasoning ? '▲' : '▼'}</span>
                        </button>

                        {showPriceReasoning && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 p-3 bg-white/70 rounded-xl text-xs text-clay-text font-medium leading-relaxed border border-white"
                          >
                            {priceReasoning || (
                              language === 'en'
                                ? 'Fair valuation based on authentic handcrafted pottery, material costs, labor hours, and current marketplace benchmarks.'
                                : 'हाथ से बना टेराकोटा उत्पाद, राजस्थान की प्रामाणिक पारंपरिक शिल्पकला और सामग्री गुणवत्ता के आधार पर उचित मूल्य।'
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Search & Marketplace Tags */}
                    <ClayCard className="p-5 flex flex-col gap-3">
                      <label className="text-sm font-bold text-clay-indigo font-heading">
                        {t('tags')}
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <ClayBadge
                            key={tag}
                            variant="indigo"
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
                          className="clay-input text-xs py-2 px-3 flex-1"
                        />
                        <ClayButton
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (newTagInput) {
                              addTag(newTagInput)
                              setNewTagInput('')
                            }
                          }}
                          icon={<Plus size={16} />}
                        >
                          {t('add_btn')}
                        </ClayButton>
                      </div>
                    </ClayCard>

                    {/* Large Full-Width Publish Button & B2B Inquiry Button */}
                    <div className="pt-2 flex flex-col gap-3">
                      <ClayButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={publishLoading}
                        onClick={handlePublish}
                        icon={<RocketLaunch weight="fill" size={24} />}
                        className="py-5 text-xl shadow-2xl"
                      >
                        {t('publish_cta')}
                      </ClayButton>

                      {/* Secondary Actions: Back & B2B Inquiry */}
                      <div className="flex items-center gap-3">
                        <ClayButton
                          variant="ghost"
                          size="md"
                          onClick={() => setStep(2)}
                          icon={<ArrowLeft size={20} weight="bold" />}
                          className="border-2 border-clay-indigo/30 text-clay-indigo hover:border-clay-indigo py-3.5 flex-1"
                        >
                          {t('back', 'Back')}
                        </ClayButton>

                        <ClayButton
                          variant="ghost"
                          size="md"
                          onClick={() => navigate('/listing/current/wholesale')}
                          icon={<FileText size={20} weight="bold" />}
                          className="border-2 border-clay-indigo/30 text-clay-indigo hover:border-clay-indigo py-3.5 flex-1"
                        >
                          {t('wholesale.b2b_inquiry_btn', '📄 B2B Inquiry')}
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
