import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#13a4ec",
        "background-light": "#f6f7f8",
        "background-dark": "#101c22",
        "surface-dark": "#192b33",
        "border-dark": "#325567",
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
