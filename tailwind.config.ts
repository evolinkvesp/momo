import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "Syne", "system-ui", "sans-serif"],
      },
      colors: {
        // Ember orange palette
        brand: {
          50: "#fff4ed",
          100: "#ffe6d5",
          200: "#ffccaa",
          300: "#ffa574",
          400: "#ff7433",
          500: "#ff6500",
          600: "#e55a00",
          700: "#cc4c00",
          800: "#a33c00",
          900: "#7a2e00",
        },
        ember: "#ff6500",
        "ember-light": "#ff7a1a",
        "ember-dim": "#cc4c00",
        // Dark surfaces
        surface: "#1a1a1a",
        "surface-mid": "#222222",
        "surface-border": "#2d2d2d",
        bg: "#0d0d0d",
        // Keep forest as alias to ember for compatibility
        forest: "#ff6500",
        "forest-light": "#ff7a1a",
      },
      boxShadow: {
        premium: "0 2px 16px rgba(0,0,0,0.4)",
        dose: "0 4px 16px rgba(255,101,0,0.3)",
        ember: "0 8px 32px rgba(255,101,0,0.25)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        emberPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,101,0,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255,101,0,0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "ember-pulse": "emberPulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
