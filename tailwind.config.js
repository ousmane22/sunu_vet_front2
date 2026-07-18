/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#006d77', // Brand Teal
          600: '#005a63',
          700: '#00474e',
          800: '#00343a',
          900: '#002226',
        },
      },
    },
  },
  plugins: [],
}
