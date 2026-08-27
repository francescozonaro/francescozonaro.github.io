/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
      colors: {
        background: {
          DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
          light: "rgb(var(--color-background-light) / <alpha-value>)",
          dark: "rgb(var(--color-background-dark) / <alpha-value>)",
          darker: "rgb(var(--color-background-darker) / <alpha-value>)",
        },

        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
        },

        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          light: "rgb(var(--color-primary-light) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
        },

        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          light: "rgb(var(--color-secondary-light) / <alpha-value>)",
          dark: "rgb(var(--color-secondary-dark) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".cardComponent": {
          "@apply rounded-md border-[0.5px] border-background-dark bg-background-dark hover:bg-background-darker hover:bg-opacity-50":
            {},
        },
        ".smallEnlarge": {
          "@apply transition-transform duration-200 hover:scale-110": {},
        },
        ".iconButton": {
          "@apply flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer":
            {},
        },
        ".accentButton": {
          "@apply border border-secondary/50 bg-secondary/10 text-secondary":
            {},
        },
        ".inputField": {
          "@apply rounded-md border border-background-dark bg-background-dark/80 text-primary placeholder-primary/40 focus:outline-none focus:border-secondary":
            {},
        },
      });
    },
  ],
};
