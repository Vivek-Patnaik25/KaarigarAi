import React from 'react'
import ClayCard from './ClayCard'

/**
 * StatCard — redesigned as typographic anchors, not MBA metric boxes.
 * Removed icon backgrounds, colored borders. Just clean numbers.
 */
export default function StatCard({
  label,
  value,
  icon,
  subtext,
  variant = 'default',
  className = '',
  onClick,
}) {
  // Price/earnings values get forest green; others get ink
  const isMoneyValue = typeof value === 'string' && value.startsWith('₹')

  return (
    <div
      className={`flex flex-col gap-1 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Label */}
      <span className="section-label">
        {label}
      </span>

      {/* Value — typographic anchor */}
      <div className={`text-2xl font-semibold leading-none tracking-tight ${
        isMoneyValue ? 'price-display text-xl' : 'text-ink font-semibold'
      }`}>
        {value}
      </div>

      {/* Subtext */}
      {subtext && (
        <span className="text-xs text-ink-faint">{subtext}</span>
      )}
    </div>
  )
}
