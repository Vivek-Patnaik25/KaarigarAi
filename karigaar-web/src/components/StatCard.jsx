import React from 'react'
import ClayCard from './ClayCard'

export default function StatCard({
  label,
  value,
  icon,
  subtext,
  variant = 'default',
  className = '',
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'text-clay-primary bg-clay-primary/10 border-clay-primary/30'
      case 'indigo':
        return 'text-clay-indigo bg-clay-indigo/10 border-clay-indigo/30'
      case 'success':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300'
      default:
        return 'text-clay-indigo bg-clay-surface border-clay-deep'
    }
  }

  return (
    <ClayCard className={`p-5 sm:p-6 flex flex-col justify-between gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-clay-muted uppercase tracking-wider font-heading">
          {label}
        </span>
        {icon && (
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm ${getVariantStyles()}`}>
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-black text-clay-indigo font-heading tracking-tight">
          {value}
        </div>
        {subtext && (
          <span className="text-xs font-semibold text-clay-muted mt-1 block">
            {subtext}
          </span>
        )}
      </div>
    </ClayCard>
  )
}
