/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  safelist: [
    'bg-brand-50',
    'bg-brand-100',
    'bg-brand-300',
    'bg-brand-500',
    'bg-brand-700',
    'from-brand-50',
    'to-indigo-100',
    'animate-float',
    'animate-fadeUp',
    'animate-shimmer',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9efff',
          200: '#b9e2ff',
          300: '#89d0ff',
          400: '#56b9ff',
          500: '#1d9dff',
          600: '#0078d6',
          700: '#005fa8',
          800: '#004574',
          900: '#002944'
        }
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        fadeUp: 'fadeUp 0.6s ease forwards',
        shimmer: 'shimmer 8s ease-in-out infinite'
      },
      backgroundSize: {
        'gradient-move': '200% 200%'
      }
    },
  },
  plugins: [],
}
