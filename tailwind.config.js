/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx", "./pages/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        highlight: "#73ee87",
        background: {
          primary: "#263238",
          highlight: "#e7ecef20",
          light: "#314149",
        },
        text: {
          primary: "#e6edf2",
          highlight: "#73ee87",
          faded: "#a3b6c2",
        },
        divider: "#49636f",
      },
    },
    fontFamily: {
      sans: ['"Red Hat Display"', "sans-serif"],
      mono: ['"Source Code Pro"', "monospace"],
    },
  },
  plugins: [],
};
