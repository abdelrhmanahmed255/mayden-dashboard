/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Government-style color palette
        gov: {
          primary: '#1a4480',      // Deep navy blue
          secondary: '#005ea2',    // Primary blue
          accent: '#0071bc',       // Light accent blue
          dark: '#1b1b1b',         // Near black
          light: '#f0f0f0',        // Light gray background
          white: '#ffffff',
          success: '#00a91c',      // Green for success
          error: '#d63e04',        // Red/orange for errors
          warning: '#ffbe2e',      // Amber for warnings
          muted: '#71767a',        // Muted gray text
          border: '#dfe1e2',       // Border color
        }
      },
      fontFamily: {
        sans: ['Source Sans Pro', 'Helvetica Neue', 'Helvetica', 'Roboto', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      boxShadow: {
        'gov': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'gov-lg': '0 4px 8px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
