/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern DocuFlow color palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Legacy gov colors mapped to new palette for compatibility
        gov: {
          primary: '#0369a1',
          secondary: '#9333ea',
          accent: '#0ea5e9',
          dark: '#0f172a',
          light: '#f8fafc',
          white: '#ffffff',
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          muted: '#64748b',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cairo', 'Space Grotesk', 'Inter', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gov': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'gov-lg': '0 4px 8px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}
