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
        ruby: {
          50: "#fff1f3",
          500: "#a20f2d",
          700: "#7b0b22",
          900: "#3d0712"
        },
        charcoal: "#151313",
        champagne: "#d9b76f"
      },
      boxShadow: {
        luxury: "0 24px 80px rgba(61, 7, 18, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
