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
    },
  },
  plugins: [],
};