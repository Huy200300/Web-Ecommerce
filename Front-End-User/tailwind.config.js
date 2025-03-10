/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      lineHeight: {
        "20px": "20px",
      },
      animation: {
        spin: "spin 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};
