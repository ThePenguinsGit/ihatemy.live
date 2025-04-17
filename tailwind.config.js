/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./content/**/*.md",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        'secondary': '#2B303A',
        'secondaryLight': '#454E5E'
      },
      backgroundImage: {
        'nick1': "url('/img/nick/background1.png')",
      }
    },
  },
  plugins: [],
}

