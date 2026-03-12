/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Peptijene - Soft Modern Biotech Theme
        'theme-bg': '#FFFFFF',           // Pure White
        'theme-text': '#2B2B2B',         // Dark Text

        // Primary Palette - Pink
        'brand': {
          DEFAULT: '#F06292', // Primary Pink
          50: '#FFF0F3',      // Soft Pink Background
          100: '#FCE4EC',
          200: '#F8BBD0',     // Light Pink
          300: '#F48FB1',     // Medium Pink
          400: '#F06292',     // Pink
          500: '#EC407A',     // Primary Pink
          600: '#E91E78',
          700: '#C2185B',     // Deep Pink
          800: '#AD1457',
          900: '#880E4F',
        },

        // Secondary & Neutral
        'charcoal': {
          DEFAULT: '#2B2B2B',
          50: '#FFF0F3',      // Soft Pink Tint
          100: '#FCE4EC',
          200: '#F8BBD0',
          300: '#B0B0B0',
          400: '#858585',
          500: '#595959',
          600: '#4D4D4D',
          700: '#3D3D3D',
          800: '#2E2E2E',
          900: '#2B2B2B',     // Dark Text
        },

        // Backgrounds & Accents
        'cream': '#FFFFFF',
        'blush-light': '#FFF0F3',   // Soft Pink Background
        'warm-white': '#FFF0F3',
        'gold': '#C8A46B',          // Gold Accent
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        // Soft white card shadow
        'soft': '0 4px 20px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)',
        'luxury': '0 8px 30px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        'full': '9999px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-out',
        'slideUp': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
