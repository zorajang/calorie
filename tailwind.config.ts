import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f5f1e8",
        ink: "#1a1816",
        clay: "#c86a3c",
        moss: "#6f8b4e",
        mist: "#d8e3e0"
      }
    }
  },
  plugins: []
};

export default config;
