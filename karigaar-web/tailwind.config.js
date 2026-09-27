/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── KarigaarAI Theme Palette ──────────────────────────────────────
        // Background & Surfaces
        'stone-bg':       '#FAFAF8',
        'stone-surface':  '#FFFFFF',
        'stone-deep':     '#F5F5F4',
        'stone-border':   '#E7E5E4',
        // Text & Structural elements
        'ink':            '#1C1917',
        'ink-soft':       '#292524',
        'ink-muted':      '#78716C',
        'ink-faint':      '#A8A29E',
        // Brand Navy & Orange
        'brand-navy':     '#1B2E6B',
        'brand-orange':   '#E8762B',
        'amber-acc':      '#E8762B',
        'amber-soft':     '#FFF3EB',
        'amber-light':    '#FFF8F5',
        // Price / earnings / success
        'forest':         '#15803D',
        'forest-soft':    '#DCFCE7',
        'forest-faint':   '#F0FDF4',
        // Destructive
        'rust':           '#DC2626',
        // WhatsApp — ONLY for actual WhatsApp actions
        'whatsapp':       '#25D366',
        'whatsapp-dark':  '#128C4E',

        // ── Legacy clay tokens → mapped to new theme values ──────────────
        'clay-bg':            '#FAFAF8',
        'clay-surface':       '#FFFFFF',
        'clay-deep':          '#F5F5F4',
        'clay-primary':       '#E8762B',
        'clay-primary-soft':  '#FFF3EB',
        'clay-indigo':        '#1B2E6B',
        'clay-indigo-soft':   '#E7E5E4',
        'clay-success':       '#15803D',
        'clay-error':         '#DC2626',
        'clay-text':          '#1C1917',
        'clay-muted':         '#78716C',
      },

      fontFamily: {
        // Multilingual-safe sans — covers Latin, Devanagari, Bengali, Tamil, Odia
        sans: [
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          '"Noto Sans Bengali"',
          '"Noto Sans Tamil"',
          '"Noto Sans Oriya"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        // Alias — some components still use font-heading/font-body
        heading: [
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          '"Noto Sans Bengali"',
          '"Noto Sans Tamil"',
          '"Noto Sans Oriya"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        body: [
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          '"Noto Sans Bengali"',
          '"Noto Sans Tamil"',
          '"Noto Sans Oriya"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        // Monospace — prices, IDs, codes
        mono: [
          '"IBM Plex Mono"',
          '"Fira Code"',
          'Menlo',
          'monospace',
        ],
        // Indic alias kept for components that reference it explicitly
        indic: [
          '"Noto Sans Devanagari"',
          '"Noto Sans Bengali"',
          '"Noto Sans Tamil"',
          '"Noto Sans Oriya"',
          'sans-serif',
        ],
        // Legacy serif alias — resolves to sans so Indic scripts render
        serif: [
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },

      borderRadius: {
        'none': '0px',
        'sm':   '2px',
        'DEFAULT': '6px',
        'md':   '6px',
        'lg':   '8px',
        'xl':   '10px',
        '2xl':  '12px',
        '3xl':  '12px',   // clamped — prevents excessive pill shapes
        'full': '9999px', // kept for avatar circles only
        // Legacy clay tokens
        'clay-sm': '4px',
        'clay-md': '6px',
        'clay-lg': '8px',
      },

      boxShadow: {
        // Very restrained — stone-toned, no colored glow
        'editorial':    '0 1px 2px 0 rgba(28,25,23,0.06)',
        'editorial-md': '0 2px 8px -1px rgba(28,25,23,0.08), 0 1px 3px -1px rgba(28,25,23,0.05)',
        'editorial-lg': '0 4px 16px -2px rgba(28,25,23,0.08), 0 2px 6px -2px rgba(28,25,23,0.04)',
        // Used on focused inputs
        'focus-ring':   '0 0 0 2px #FAFAF9, 0 0 0 4px #B45309',
      },

      fontSize: {
        // Section labels — tight, uppercase
        'label': ['11px', { letterSpacing: '0.08em', lineHeight: '1.4' }],
      },

      lineHeight: {
        // Indic scripts need more leading than Latin
        'indic': '1.8',
        'relaxed': '1.7',
      },

      spacing: {
        // Touch targets
        'touch': '48px',
        'touch-sm': '44px',
      },
    },
  },
  plugins: [],
}
