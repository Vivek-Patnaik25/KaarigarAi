import React from 'react'

/**
 * EditorialButton — replaces ClayButton
 * Same prop API, new visual language.
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size:    'sm' | 'md' | 'lg'
 */
export default function ClayButton({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  fullWidth = false,
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) {
  // Map variant → CSS class
  let variantClass = 'clay-btn-primary'
  if (variant === 'secondary') variantClass = 'clay-btn-secondary'
  else if (variant === 'ghost')     variantClass = 'clay-btn-ghost'
  else if (variant === 'danger')    variantClass = 'clay-btn-danger'

  // Size — enforce minimum 48px CTA touch target by default, 8px radius
  let sizeStyle = { borderRadius: '8px' }
  if (size === 'sm') {
    sizeStyle = { minHeight: '40px', padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }
  } else if (size === 'lg') {
    sizeStyle = { minHeight: '52px', padding: '14px 26px', fontSize: '15px', borderRadius: '8px' }
  } else {
    // md default — min 48px height
    sizeStyle = { minHeight: '48px', padding: '12px 22px', fontSize: '14px', borderRadius: '8px' }
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`clay-btn ${variantClass} ${widthClass} ${className}`}
      style={sizeStyle}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="flex items-center shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </button>
  )
}
