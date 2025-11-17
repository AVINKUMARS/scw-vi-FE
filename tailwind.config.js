/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand1: '#702ABD',
        brand2: '#305FB3',
        brand3: '#2F7EC0',
        // Primary gradient colors - Purple to Blue
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Secondary gradient - Cyan
        secondary: {
          50: '#ecf0ff',
          600: '#0ea5e9',
          700: '#0284c7',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
        'gradient-primary-light': 'linear-gradient(135deg, #ede9fe 0%, #ecf0ff 100%)',
      },
      boxShadow: {
        'gradient': '0 10px 30px rgba(124, 58, 237, 0.2)',
        'gradient-hover': '0 15px 40px rgba(124, 58, 237, 0.3)',
      },
    },
  },
  plugins: [],
}
