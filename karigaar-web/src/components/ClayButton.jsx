import React from 'react'

export default function ClayButton({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  fullWidth = false,
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) {
  let variantClass = 'clay-btn-primary'
  if (variant === 'secondary') variantClass = 'clay-btn-secondary'
  else if (variant === 'ghost') variantClass = 'clay-btn-ghost'

  let sizeClass = 'px-6 py-3 text-base min-h-[48px]'
  if (size === 'sm') sizeClass = 'px-4 py-2 text-sm min-h-[40px] rounded-xl'
  else if (size === 'lg') sizeClass = 'px-8 py-4 text-lg min-h-[56px] rounded-3xl'

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`clay-btn ${variantClass} ${sizeClass} ${widthClass} ${className} flex items-center justify-center gap-2`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="text-xl flex items-center">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  )
}
