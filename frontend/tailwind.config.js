/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0F17',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        cricket: {
          green: '#10B981',
          gold: '#F59E0B',
          accent: '#06B6D4',
        }
      }
    },
  },
  plugins: [],
}
