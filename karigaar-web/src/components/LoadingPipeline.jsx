import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, CircleNotch } from '@phosphor-icons/react'
import ClayCard from './ClayCard'

export const PIPELINE_STAGES = [
  {
    id: 1,
    icon: '🖼️',
    titleHi: 'फोटो बेहतर हो रही है...',
    titleEn: 'Studio Image Enhancing...',
    desc: 'U²-Net + OpenCV CLAHE & Gray World White Balance',
  },
  {
    id: 2,
    icon: '🎙️',
    titleHi: 'आवाज़ समझी जा रही है...',
    titleEn: 'Transcribing Voice Speech...',
    desc: 'Faster-Whisper int8 STT & Indic Dialect Detection',
  },
  {
    id: 3,
    icon: '🎨',
    titleHi: 'शिल्प पहचाना जा रहा है...',
    titleEn: 'Classifying Craft Heritage...',
    desc: 'CLIP Multimodal & TF-IDF Category Intelligence',
  },
  {
    id: 4,
    icon: '💰',
    titleHi: 'सही कीमत लगाई जा रही है...',
    titleEn: 'Estimating Fair Market Price...',
    desc: 'GradientBoosting Multimodal Pricing & Value Comps',
  },
  {
    id: 5,
    icon: '✍️',
    titleHi: 'विवरण लिखा जा रहा है...',
    titleEn: 'Writing Multilingual Catalog & Story...',
    desc: 'Groq Llama-3.1 / Gemini High-Converting SEO Story',
  },
]

export default function LoadingPipeline({ activeStage = 1, language = 'hi' }) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 py-4">
      {PIPELINE_STAGES.map((stage, index) => {
        const isCompleted = activeStage > stage.id
        const isActive = activeStage === stage.id
        const isPending = activeStage < stage.id

        return (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.15 }}
          >
            <ClayCard
              variant={isActive ? 'selected' : isCompleted ? 'default' : 'inset'}
              className={`p-4 sm:p-5 transition-all duration-300 flex items-center justify-between gap-4 ${
                isActive ? 'scale-[1.02] ring-2 ring-clay-primary shadow-xl' : ''
              } ${isPending ? 'opacity-60 grayscale-[40%]' : 'opacity-100'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl p-2.5 rounded-2xl bg-white/60 shadow-inner flex items-center justify-center">
                  {stage.icon}
                </span>
                <div>
                  <h4 className={`text-base sm:text-lg font-bold ${isActive ? 'text-clay-primary' : 'text-clay-indigo'}`}>
                    {language === 'en' ? stage.titleEn : stage.titleHi}
                  </h4>
                  <p className="text-xs sm:text-sm text-clay-muted">
                    {stage.desc}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                {isCompleted && (
                  <div className="w-8 h-8 rounded-full bg-clay-success text-white flex items-center justify-center shadow-md animate-bounce">
                    <CheckCircle weight="fill" size={24} />
                  </div>
                )}
                {isActive && (
                  <div className="w-8 h-8 rounded-full bg-clay-primary text-white flex items-center justify-center shadow-md animate-spin">
                    <CircleNotch weight="bold" size={22} />
                  </div>
                )}
                {isPending && (
                  <div className="w-8 h-8 rounded-full border-2 border-clay-muted/40 flex items-center justify-center text-xs font-bold text-clay-muted">
                    {stage.id}
                  </div>
                )}
              </div>
            </ClayCard>
          </motion.div>
        )
      })}
    </div>
  )
}
