/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563EB', // Core Blue Theme
          650: '#2563EB', // Compatibility hook for existing files
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        success: {
          DEFAULT: '#10B981', // Core Green Theme
          light: '#ecfdf5',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B', // Core Amber Theme
          light: '#fffbeb',
          dark: '#b45309',
        },
        finBg: '#F8FAFC',
        finText: '#1E293B',
      },
    },
  },
  plugins: [],
}
