module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'Quantico': 'Quantico'
      }
    },
  },
  plugins: [
    require('./node_modules/tailwind-percentage-heights-plugin')(),
  ]
}
