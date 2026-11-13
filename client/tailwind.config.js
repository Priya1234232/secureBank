/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0A1128',
          850: '#0F1A3A',
          800: '#14214D',
          700: '#1C2F6C',
          600: '#263E8F',
        },
        cyan: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          glow: '#00F0FF',
        },
        brand: {
          blue: '#1E40AF',
          cyan: '#00B4D8',
          accent: '#0077B6',
          dark: '#03071E',
          card: '#0D1B3E',
          cardBorder: '#1E3A8A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 180, 216, 0.35)',
        'glow-lg': '0 0 35px rgba(0, 180, 216, 0.45)',
        card: '0 8px 30px rgba(0, 0, 0, 0.3)'
      }
    },
  },
  plugins: [],
}
