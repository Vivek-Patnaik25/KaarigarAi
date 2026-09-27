import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, CircleNotch, Warning } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

export const PIPELINE_STAGES = [
  {
    id: 1,
    icon: '🖼',
    titleEn: 'Image Enhancement',
    desc: 'Enhancing quality, lighting and colour balance',
  },
  {
    id: 2,
    icon: '🎙',
    titleEn: 'Voice Transcription',
    desc: 'Converting speech to text',
  },
  {
    id: 3,
    icon: '🎨',
    titleEn: 'Craft Identification',
    desc: 'Identifying craft type and tradition',
  },
  {
    id: 4,
    icon: '₹',
    titleEn: 'Price Estimation',
    desc: 'Estimating fair market value',
  },
  {
    id: 5,
    icon: '✍',
    titleEn: 'Catalogue Generation',
    desc: 'Writing multilingual product catalogue',
  },
]

export default function LoadingPipeline({ activeStage = 1, language = 'hi' }) {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Wrapper card */}
      <div className="clay-card overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-deep">
          <p className="section-label">{t('ai_processing', 'AI Processing')}</p>
          <p className="text-xs text-ink-faint mt-0.5">
            {t('ai_processing_sub', 'Each step completes in sequence')}
          </p>
        </div>

        <div>
          {PIPELINE_STAGES.map((stage, index) => {
            const isCompleted = activeStage > stage.id
            const isActive    = activeStage === stage.id
            const isPending   = activeStage < stage.id

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: isPending ? 0.45 : 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="pipeline-stage"
              >
                {/* Stage number / status indicator */}
                <div
                  className={`pipeline-stage-num ${
                    isCompleted ? 'complete' : isActive ? 'active' : 'pending'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle weight="fill" size={14} />
                  ) : isActive ? (
                    <CircleNotch size={14} className="animate-spin" />
                  ) : (
                    <span>{stage.id}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${
                    isActive ? 'text-ink' : isCompleted ? 'text-forest' : 'text-ink-faint'
                  }`}>
                    {t(`ai_stage_${stage.id}`, stage.titleEn)}
                  </p>
                  {(isActive || isCompleted) && (
                    <p className="text-xs text-ink-faint mt-0.5">{stage.desc}</p>
                  )}
                </div>

                {/* Right status */}
                <div className="shrink-0 w-16 text-right">
                  {isCompleted && (
                    <span className="text-[10px] font-medium text-forest uppercase tracking-wide">
                      {t('done', 'Done')}
                    </span>
                  )}
                  {isActive && (
                    <span className="text-[10px] font-medium text-amber-acc uppercase tracking-wide">
                      {t('processing', 'Working…')}
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] text-ink-faint">
                      {t('waiting', 'Pending')}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
