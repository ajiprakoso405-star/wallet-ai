import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: "#f8fafc",
          100: "#1a1a2e",
          200: "#16213e",
          300: "#0f3460",
          400: "#162032",
          500: "#1e2a3a",
          600: "#253345",
          700: "#2d3f52",
          800: "#0d1117",
          900: "#080c10",
        },
        accent: {
          blue: "#3b82f6",
          green: "#22c55e",
          red: "#ef4444",
          orange: "#f97316",
          purple: "#a855f7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
