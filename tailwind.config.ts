import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary':   '#0B0B0F',
        'bg-card':      '#111118',
        'bg-secondary': '#1A1A2E',
        'accent':       '#6C63FF',
        'accent-hover': '#7C74FF',
        'income':       '#22C55E',
        'expense':      '#EF4444',
        'text-primary': '#F5F5F5',
        'text-secondary':'#A1A1AA',
        'border-app':   '#3F3F46',
      },
    },
  },
  plugins: [],
} satisfies Config