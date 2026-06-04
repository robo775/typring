import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ringTeal: "#16b8a6",
        ringBlue: "#3b82f6",
        ringViolet: "#7c3aed",
        ink: "#172033"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

