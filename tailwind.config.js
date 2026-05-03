/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pepstack Davao - Pastel Pink Theme
        'theme-bg': '#FFF7FA',           // Soft pastel background
        'theme-text': '#5C2B3E',         // Soft plum text

        // Primary Palette - Pastel Pink
        'brand': {
          DEFAULT: '#FFB6C9', // Pastel pink
          50: '#FFF5F8',      // Almost-white pink
          100: '#FFEAF1',     // Very soft pastel
          200: '#FFD6E3',     // Light pastel pink
          300: '#FFC2D5',     // Pastel pink
          400: '#FFB6C9',     // Primary pastel pink
          500: '#FF9DB8',     // Soft rose
          600: '#FF85A8',     // Brighter rose accent
          700: '#F56991',     // Deeper rose for hover
          800: '#D9527B',     // Accent
          900: '#B23E62',     // Deep accent text
        },

        // Secondary & Neutral - warm soft pinks for backgrounds, soft plum text
        'charcoal': {
          DEFAULT: '#5C2B3E',
          50: '#FFF5F8',      // Pastel pink tint background
          100: '#FFEAF1',
          200: '#FFD6E3',
          300: '#D9B5C2',
          400: '#B08899',
          500: '#8A6273',
          600: '#6E4B5B',
          700: '#5C2B3E',
          800: '#4A2333',
          900: '#3D1B29',     // Soft plum dark text
        },

        // Backgrounds & Accents
        'cream': '#FFF7FA',
        'blush-light': '#FFF0F5',   // Pastel pink background
        'warm-white': '#FFF7FA',
        'gold': '#E8B5C4',          // Soft pink accent (replacing gold)
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
