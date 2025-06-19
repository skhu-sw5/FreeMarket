/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // 모던 보라-블루
          dark: '#4338ca',
          light: '#a5b4fc',
        },
        accent: {
          DEFAULT: '#38bdf8', // 밝은 블루
          dark: '#0ea5e9',
          light: '#bae6fd',
        },
        background: {
          light: '#f8fafc',
          dark: '#0f172a',
        },
        surface: {
          light: '#ffffff',
          dark: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
