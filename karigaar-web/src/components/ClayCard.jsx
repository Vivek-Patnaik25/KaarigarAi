import React from 'react'

/**
 * EditorialCard — replaces ClayCard
 * Keeps the same prop API so all existing JSX works unchanged.
 * variant: 'default' | 'elevated' | 'selected' | 'inset'
 */
export default function ClayCard({
  children,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) {
  let variantClass = 'clay-card'
  if (variant === 'elevated') variantClass = 'clay-card-elevated'
  else if (variant === 'selected') variantClass = 'clay-card-selected'
  else if (variant === 'inset') variantClass = 'clay-card-inset'

  return (
    <div
      className={`${variantClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
