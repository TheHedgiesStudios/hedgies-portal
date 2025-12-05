/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./styles/**/*.css"     // fixed glob pattern
  ],

  theme: {
    extend: {
      colors: {
        hedgieRoyal: "#0A1A3A",
        hedgieLight: "#00AEEF",
        hedgieRed: "#E02229",
        hedgieOrange: "#FF7A21",
        hedgieBg: "#0E1116",
      },
    },
  },

  safelist: [
    // keep your animation keyframes in output
    'gridFloat',
    'cometGlow',

    // keep pseudo-element styles
    {
      pattern: /(before|after)/,
      variants: ['before', 'after']
    }
  ],

  plugins: [],
}
