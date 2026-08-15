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
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#EC4899',
          600: '#DB2777',
          650: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
          950: '#500724',
        },
        success: {
          DEFAULT: '#D4A72C', // Gold
          light: '#FFFBEB',
          dark: '#B45309',
        },
        warning: {
          DEFAULT: '#D4A72C', // Gold
          light: '#FFFBEB',
          dark: '#B45309',
        },
        finBg: '#FFF7FB',
        finText: '#1F1720',
        charcoal: '#1F1720',
        burgundy: '#BE185D',
        ruby: '#DB2777',
        gold: '#D4A72C',
        warmwhite: '#FAFAF9',
        darkText: '#1C1917',

        // Safety net: Map built-in blue, indigo, green, emerald, cyan, teal to avoid any blue/green leaks
        indigo: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
          950: '#500724',
        },
        emerald: {
          50: '#FFFBEB',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#D4A72C', // Gold
          500: '#D4A72C', // Gold
          600: '#A16207',
          700: '#854D0E',
          800: '#713F12',
          900: '#422006',
          950: '#1C1917',
        },
        blue: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
          950: '#500724',
        },
        green: {
          50: '#FFFBEB',
          100: '#FEF9C3',
          500: '#D4A72C', // Gold
          600: '#A16207',
        },
        cyan: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          500: '#EC4899',
          600: '#DB2777',
        },
        teal: {
          50: '#FFFBEB',
          100: '#FEF9C3',
          500: '#D4A72C', // Gold
          600: '#A16207',
        }
      },
    },
  },
  plugins: [],
}
