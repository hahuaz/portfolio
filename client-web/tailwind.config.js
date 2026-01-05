/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        github: {
          inactiveBackground: "#0d1117",
          black: "#010409",
          gray: "#161b22",
          blue: "#1f6feb",
          white: {
            link: "#f0f6fc",
            comment: "#8b949e",
            normal: "#c9d1d9",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addVariant }) {
      addVariant("children", "& *");
    },
  ],
};
