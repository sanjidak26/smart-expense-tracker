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
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-light)',
          dark: 'var(--color-success-dark)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-light)',
          dark: 'var(--color-warning-dark)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          light: 'var(--color-error-light)',
          dark: 'var(--color-error-dark)',
        },
        income: {
          DEFAULT: 'var(--color-income)',
          light: 'var(--color-income-light)',
          dark: 'var(--color-income-dark)',
        },
        expense: {
          DEFAULT: 'var(--color-expense)',
          light: 'var(--color-expense-light)',
          dark: 'var(--color-expense-dark)',
        },
        finBg: '#FFF7FB',
        finText: '#1F1720',
        charcoal: '#1F1720',
        burgundy: '#BE185D',
        ruby: '#DB2777',
        gold: '#D4A72C',
        warmwhite: '#FAFAF9',
        darkText: '#1C1917',

        // Custom slate color shades to support non-standard classes used in the codebase
        slate: {
          150: '#EBF0F6',
          350: '#94A3B8',
          450: '#64748B',
          455: '#64748B',
          505: '#475569',
          550: '#475569',
          650: '#334155',
          655: '#334155',
          750: '#1E293B',
          850: '#111827',
          855: '#0F172A',
          905: '#020617',
        },

        // Safety net: Map built-in blue, indigo, cyan to brand pink to avoid blue leaks
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
        cyan: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          500: '#EC4899',
          600: '#DB2777',
        }
      },
    },
  },
  plugins: [],
}
