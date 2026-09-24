import React from 'react'
import { X } from '@phosphor-icons/react'

export default function ClayBadge({
  children,
  variant = 'primary', // 'primary' | 'indigo' | 'success' | 'muted'
  icon = null,
  onRemove = null,
  className = '',
  onClick,
}) {
  let variantClass = 'clay-badge-primary'
  if (variant === 'indigo') variantClass = 'clay-badge-indigo'
  else if (variant === 'success') variantClass = 'clay-badge-success'
  else if (variant === 'muted') variantClass = 'clay-badge-muted'

  return (
    <span
      onClick={onClick}
      className={`clay-badge ${variantClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors flex items-center justify-center text-xs"
          aria-label="Remove"
        >
          <X weight="bold" size={12} />
        </button>
      )}
    </span>
  )
}
