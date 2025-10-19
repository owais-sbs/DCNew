/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      'arabic': ['Noto Sans Arabic', 'sans-serif'],
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      colors: {
        primary: {
          DEFAULT: '#952562',
          50: '#f7eaf3',
          100: '#f0d5e7',
          200: '#e1abcf',
          300: '#d181b7',
          400: '#c2579f',
          500: '#b32d87',
          600: '#952562',
          700: '#6e1b46',
          800: '#47122b',
          900: '#210810',
        },
        sidebar: '#9F9F9F',
        'sidebar-bg': '#EBEBEB',
        accent: {
          400: '#4a90e2',
        },
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a0',
        gradient: {
          start: '#E82B5E',
          end: '#942878'
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        pink: {
          DEFAULT: '#E82B5E',
          50: '#fdf2f6',
          100: '#fce7ef',
          200: '#fbd0e0',
          300: '#f9a8c6',
          400: '#f473a6',
          500: '#E82B5E',
          600: '#d41e4f',
          700: '#b11441',
          800: '#8e1134',
          900: '#731028',
        },
        purple: {
          dark: '#1B0E1B',
        },
        'purple-dark': '#4A235A',
        'pink-dark': '#d43d77',
      },
      spacing: {
        'sidebar': '280px',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to right, #E82B5E, #942878)',
        'primary-gradient-hover': 'linear-gradient(to right, #942878, #E82B5E)',
        'bg-gradient': 'linear-gradient(to bottom right, #9A2977, #1B0E1B)',
        'hero-pattern': "url('/src/assets/doctor-bg.jpg')",
      },
      borderRadius: {
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
  
  