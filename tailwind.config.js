/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Libre Franklin"],
        sans: ["Montserrat"],
        code: ["Consolas"],
      },
      colors: {
        ["background"]: "rgb(var(--color-background) / <alpha-value>)",
        ["background-light"]:
          "rgb(var(--color-background-light) / <alpha-value>)",
        ["background-dark"]:
          "rgb(var(--color-background-dark) / <alpha-value>)",

        ["border"]: "rgb(var(--color-border) / <alpha-value>)",
        ["border-light"]: "rgb(var(--color-border-light) / <alpha-value>)",
        ["border-dark"]: "rgb(var(--color-border-dark) / <alpha-value>)",

        ["primary"]: "rgb(var(--color-primary) / <alpha-value>)",
        ["primary-light"]: "rgb(var(--color-primary-light) / <alpha-value>)",
        ["primary-dark"]: "rgb(var(--color-primary-shadow) / <alpha-value>)",

        ["secondary"]: "rgb(var(--color-secondary) / <alpha-value>)",
        ["secondary-light"]:
          "rgb(var(--color-secondary-light) / <alpha-value>)",
        ["secondary-dark"]: "rgb(var(--color-secondary-dark) / <alpha-value>)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".cardComponent": {
          "@apply rounded-md border-[0.5px] border-background-light bg-background-dark hover:bg-background-light hover:bg-opacity-50":
            {},
        },
        ".smallEnlarge": {
          "@apply transition-transform duration-200 hover:scale-110": {},
        },
      });
    },
  ],
};
