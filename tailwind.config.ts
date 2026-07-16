import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0D14',
          secondary: '#0F1322',
          tertiary: '#151B2E',
          hover: '#1A2035',
        },
        border: {
          subtle: '#1E2640',
          DEFAULT: '#2A3358',
          strong: '#3D4F7C',
        },
        text: {
          primary: '#F0F4FF',
          secondary: '#8B9CC0',
          tertiary: '#7B8DB5',
          disabled: '#3A4560',
        },
        accent: {
          50: '#FFF8E7',
          100: '#FEEFC3',
          200: '#FCD97A',
          300: '#F9BE42',
          400: '#F5A623',
          500: '#E08B0A',
          600: '#B86D06',
        },
        info: {
          DEFAULT: '#2DD4BF',
          dark: '#1A3A6B',
        },
        risk: {
          none: '#1A1F2E',
          low: '#1E4A3F',
          moderate: '#4A3B1A',
          high: '#6B2D10',
          critical: '#7A1515',
          new: '#2A4A6B',
        },
        success: '#1E6B4A',
        warning: '#7A5A0A',
        danger: '#7A1515',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.1', fontWeight: '600' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0,0,0,0.4)',
        md: '0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -1px rgba(0,0,0,0.3)',
        lg: '0 10px 15px -3px rgba(0,0,0,0.6), 0 4px 6px -2px rgba(0,0,0,0.4)',
        xl: '0 20px 25px -5px rgba(0,0,0,0.7), 0 10px 10px -5px rgba(0,0,0,0.4)',
        'glow-accent': '0 0 20px rgba(245,166,35,0.15)',
        'glow-risk': '0 0 16px rgba(122,21,21,0.2)',
      },
      animation: {
        'count-up': 'countUp 1s ease-out forwards',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-border': 'pulseBorder 2s ease-in-out infinite',
        'draw-line': 'drawLine 0.8s ease-out forwards',
      },
      keyframes: {
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseBorder: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1.0' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
