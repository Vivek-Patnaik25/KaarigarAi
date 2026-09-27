import React from 'react'
import { X } from '@phosphor-icons/react'

/**
 * EditorialBadge — replaces ClayBadge
 * Same prop API. No gradients, no pill shapes, no heavy shadows.
 * variant: 'primary' | 'indigo' | 'success' | 'muted' | 'error'
 */
export default function ClayBadge({
  children,
  variant = 'primary',
  icon = null,
  onRemove = null,
  className = '',
  onClick,
}) {
  let variantClass = 'clay-badge-primary'
  if (variant === 'indigo')  variantClass = 'clay-badge-indigo'
  else if (variant === 'success') variantClass = 'clay-badge-success'
  else if (variant === 'muted')   variantClass = 'clay-badge-muted'
  else if (variant === 'error')   variantClass = 'clay-badge-error'

  return (
    <span
      onClick={onClick}
      className={`clay-badge ${variantClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Remove"
        >
          <X weight="bold" size={10} />
        </button>
      )}
    </span>
  )
}
