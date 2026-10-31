import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        kingdom: {
          50: "#fdf8f1",
          100: "#fbead5",
          200: "#f5d3a8",
          300: "#edb873",
          400: "#e49a3f",
          500: "#d9831e",
          600: "#b86815",
          700: "#925213",
          800: "#774416",
          900: "#633a15",
        },
        stone: {
          50: "#fafaf8",
          100: "#f5f3ef",
          200: "#e8e4de",
          300: "#d6d0c4",
          400: "#b8b0a0",
          500: "#9a9080",
          600: "#8a8275",
          700: "#736c61",
          800: "#605a52",
          900: "#504c45",
        },
        ink: {
          900: "#1a1816",
          800: "#2a2724",
          700: "#3d3833",
          600: "#5c5750",
          500: "#7a756e",
          400: "#a8a29a",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(26,24,22,0.06), 0 4px 12px rgba(26,24,22,0.04)",
        card: "0 1px 2px rgba(26,24,22,0.06), 0 8px 24px rgba(26,24,22,0.06)",
        elevated: "0 4px 16px rgba(26,24,22,0.08), 0 16px 40px rgba(26,24,22,0.10)",
      }
    },
  },
  plugins: [],
};
export default config;
