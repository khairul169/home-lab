/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1",
          50: "#FFFFFF",
          100: "#F9F9FE",
          200: "#D3D4FB",
          300: "#AEAFF8",
          400: "#888BF4",
          500: "#6366F1",
          600: "#3034EC",
          700: "#1317D1",
          800: "#0E119E",
          900: "#0A0C6A",
          950: "#070950",
        },
        'primary-foreground': '#fff',
        secondary: {
          DEFAULT: "#10B981",
          50: "#8CF5D2",
          100: "#79F3CB",
          200: "#53F0BC",
          300: "#2EEDAE",
          400: "#13DF9B",
          500: "#10B981",
          600: "#0C855D",
          700: "#075239",
          800: "#031E15",
          900: "#000000",
          950: "#000000",
        },
        'secondary-foreground': '#161616',
      },
    },
  },
};
