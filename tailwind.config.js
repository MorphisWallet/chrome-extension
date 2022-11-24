// const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {},
    },
  },
  // plugins: [require('@tailwindcss/forms')],
  variants: {},
  corePlugins: {
    preflight: true,
  },
}
