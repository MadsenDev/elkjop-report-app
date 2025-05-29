/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'elkjop-green': '#75BC26',
        'elkjop-blue': '#041752',
        'elkjop-blue-dark': '#031652',
      },
      fontFamily: {
        sans: ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Times New Roman', 'serif'],
        mono: ['Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};