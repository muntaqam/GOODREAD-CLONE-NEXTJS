module.exports = {
  purge: ["./src/**/*.{js,ts,jsx,tsx}", "./styles/**/*.{css}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        text: "#0e0e10",
        background: "#f6f6f9",
        primary: "#625db6",
        secondary: "#a29de1",
        accent: "#5e57e0",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
