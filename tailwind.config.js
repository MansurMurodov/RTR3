/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        primary: { DEFAULT: "#4f46e5", dark: "#4338ca", light: "#818cf8" },
        secondary: { DEFAULT: "#0d9488", light: "#2dd4bf" },
        accent: { DEFAULT: "#f59e0b", light: "#fbbf24" },
        navy: { 950: "#070d1a", 900: "#0b1220", 800: "#111a2e", 700: "#1a2540" },
      },
      boxShadow: { soft: "0 8px 30px rgba(79,70,229,0.10)" },
    },
  },
  plugins: [],
};
