/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151f33',
          950: '#090d16',
        },
        electric: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        emerald: {
          450: '#10b981',
          500: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        card: ['"Space Mono"', '"Share Tech Mono"', '"Courier New"', 'monospace']
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(14, 165, 233, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'card-3d': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 20px 0 rgba(255, 255, 255, 0.05) inset',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      }
    },
  },
  plugins: [],
}
