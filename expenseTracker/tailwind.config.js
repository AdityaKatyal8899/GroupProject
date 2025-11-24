/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6A0DAD',
          dark: '#3c096c',
          light: '#9d4edd',
        },
        background: '#000000',
        card: '#121212',
        text: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        soft: '0 6px 22px rgba(0,0,0,0.25)',
      },
      fontFamily: {
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Work Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
