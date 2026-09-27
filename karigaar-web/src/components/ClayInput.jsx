import React from 'react'

/**
 * EditorialInput — replaces ClayInput
 * Clean bordered input, 8px radius, stone palette.
 * Same prop API as before.
 */
export default function ClayInput({
  label,
  value,
  onChange,
  placeholder = '',
  isTextArea = false,
  rows = 4,
  className = '',
  helperText,
  error,
  ...props
}) {
  const inputClass = `clay-input${error ? ' border-rust ring-1 ring-rust/30' : ''}`

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-ink-muted tracking-wide uppercase" style={{ letterSpacing: '0.06em' }}>
          {label}
        </label>
      )}

      {isTextArea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className={inputClass}
          style={{ resize: 'vertical', lineHeight: '1.7' }}
          {...props}
        />
      ) : (
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass}
          {...props}
        />
      )}

      {helperText && !error && (
        <span className="text-xs text-ink-faint px-0.5">{helperText}</span>
      )}
      {error && (
        <span className="text-xs text-rust font-medium px-0.5">{error}</span>
      )}
    </div>
  )
}
