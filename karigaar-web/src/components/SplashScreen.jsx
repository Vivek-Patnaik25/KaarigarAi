import React from 'react'
import { motion } from 'framer-motion'

export default function SplashScreen({ text = 'KarigaarAI' }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#FAFAF8] flex flex-col items-center justify-center p-6 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-5 text-center"
      >
        <div className="w-[160px] h-[160px] rounded-3xl bg-white shadow-md border border-stone-200/80 p-3 flex items-center justify-center">
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

        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#1B2E6B]">
            Karigaar<span className="text-[#E8762B]">AI</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium tracking-wider uppercase mt-1">
            सशक्त भारतीय कारीगर • Empowering Indian Artisans
          </p>
        </div>

        {/* Subtle loading pulse */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-2 h-2 rounded-full bg-[#1B2E6B] animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-[#E8762B] animate-pulse delay-100" />
          <span className="w-2 h-2 rounded-full bg-[#1B2E6B] animate-pulse delay-200" />
        </div>
      </motion.div>
    </div>
  )
}
