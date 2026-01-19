/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "sans-serif"],
        sans: ['"Space Grotesk"', "Inter", "sans-serif"]
      },
      colors: {
        brand: {
          DEFAULT: "#0EA5E9",
          accent: "#14F4C5",
          surface: "#0B1220"
        }
      }
    }
  },
  plugins: []
};
