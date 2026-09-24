/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'clay-bg': '#FDF6EE',
        'clay-surface': '#F5EDE0',
        'clay-deep': '#EDD9C0',
        'clay-primary': '#E8873A',
        'clay-primary-soft': '#F5C49A',
        'clay-indigo': '#3D5A8A',
        'clay-indigo-soft': '#B8C8E8',
        'clay-success': '#6DBF8A',
        'clay-error': '#E87070',
        'clay-text': '#2D2420',
        'clay-muted': '#8C7B6E',
      },
      fontFamily: {
        heading: ['Nunito', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        indic: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      borderRadius: {
        'clay-sm': '16px',
        'clay-md': '24px',
        'clay-lg': '32px',
      },
    },
  },
  plugins: [],
}
