/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#1B4332",
        pos: "#2F8F5B",
        neg: "#B3261E",
        info: "#2C6E9E",
      },
    },
  },
  plugins: [],
};
