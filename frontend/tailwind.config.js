/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        traxosBlue: '#0a1d37',
        traxosOrange: '#ff6b00',
      },
    },
  },
  plugins: [],
}