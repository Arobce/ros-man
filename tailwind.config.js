/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./index.html", "./node_modules/flowbite/**/*.js"],
  plugins: [require("flowbite/plugin")],
  theme: {
    extend: {
      container: {
        padding: "2rem",
        center: true,
      },
    },
  },
  plugins: [],
};
