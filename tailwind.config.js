/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fce8',
          100: '#eefacc',
          200: '#e0f69d',
          300: '#c8f135',
          400: '#b0d930',
          500: '#9bc42a',
          600: '#7faa00',
          700: '#5c7d00',
          800: '#3a4e00',
          900: '#1d2700',
        },
        navy: {
          700: '#334155',
          800: '#1e293b',
          850: '#172235',
          900: '#101827',
          950: '#080d17',
        },
        // Theme-aware surfaces derived from CSS custom properties (RGB triplets)
        canvas: 'rgb(var(--c-canvas))',
        surface: 'rgb(var(--c-surface))',
        surface2: 'rgb(var(--c-surface-2))',
        surface3: 'rgb(var(--c-surface-3))',
        line: 'rgb(var(--c-line))',
        'line-strong': 'rgb(var(--c-line-strong))',
        ink: {
          DEFAULT: 'rgb(var(--c-ink))',
          soft: 'rgb(var(--c-ink-soft))',
          faint: 'rgb(var(--c-ink-faint))',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13, 13, 13, 0.04), 0 1px 3px rgba(13, 13, 13, 0.06)',
        lift: '0 4px 8px -2px rgba(13, 13, 13, 0.10), 0 2px 4px -2px rgba(13, 13, 13, 0.05)',
        panel: '0 16px 32px -12px rgba(13, 13, 13, 0.22), 0 4px 8px -4px rgba(13, 13, 13, 0.08)',
        'glow-brand': '0 0 0 3px rgba(200, 241, 53, 0.22)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        'dash-flow': {
          to: { strokeDashoffset: '-24' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.2s ease-in-out infinite',
        'ping-slow': 'ping-slow 1.9s cubic-bezier(0, 0, 0.2, 1) infinite',
        'dash-flow': 'dash-flow 1.1s linear infinite',
        'slide-in-right': 'slide-in-right 0.18s ease-out',
        'slide-in-up': 'slide-in-up 0.16s ease-out',
        'fade-in': 'fade-in 0.14s ease-out',
        'scale-in': 'scale-in 0.13s ease-out',
      },
    },
  },
  plugins: [],
}
