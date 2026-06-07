/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light:   '#F59E0B',
          DEFAULT: '#F59E0B',
          dark:    '#F97316',
        },
        navy: {
          DEFAULT: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50:  '#F8FAFC',
        },
      },
      fontFamily: {
        sans:    ['Poppins', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        body:    ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 10px 25px rgba(0,0,0,0.05)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.10)',
        orange: '0 8px 24px rgba(249,115,22,0.30)',
        'orange-lg': '0 16px 40px rgba(249,115,22,0.35)',
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #F59E0B, #F97316)',
        'gradient-page':   'linear-gradient(180deg, #FFFFFF, #F1F5F9)',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'float-delayed':  'float 6s ease-in-out 3s infinite',
        'fade-up':        'fadeUp 0.6s ease-out forwards',
        'pulse-ring':     'pulseRing 2s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
