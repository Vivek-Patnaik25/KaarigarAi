import React from 'react'

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
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-bold text-clay-indigo tracking-wide font-heading">
          {label}
        </label>
      )}

      {isTextArea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className={`clay-input resize-y ${error ? 'border-clay-error ring-1 ring-clay-error' : ''}`}
          {...props}
        />
      ) : (
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`clay-input ${error ? 'border-clay-error ring-1 ring-clay-error' : ''}`}
          {...props}
        />
      )}

      {helperText && !error && (
        <span className="text-xs text-clay-muted px-1">{helperText}</span>
      )}
      {error && (
        <span className="text-xs text-clay-error font-semibold px-1">{error}</span>
      )}
    </div>
  )
}
