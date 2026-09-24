import React from 'react'

export default function ClayCard({
  children,
  variant = 'default', // 'default' | 'elevated' | 'selected' | 'inset'
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
