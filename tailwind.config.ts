import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Dark-theme neutrals (purple-tinted so it stays on-brand)
        night: {
          900: "#151221",
          800: "#1b1730",
          700: "#221d3a",
          600: "#2c2648",
          500: "#3a3358",
          border: "#332c52",
        },
        lav: {
          50: "#f8f6fe",
          100: "#f0ebfc",
          200: "#e3d9f8",
          300: "#cdbdf0",
          400: "#b3a0e6",
          500: "#9b85d9",
          600: "#8369c8",
          700: "#6f54b0",
          800: "#5b478f",
          900: "#4b3c74",
        },
        pastel: {
          pink: "#f4d9f0",
          blue: "#dbe4f7",
          mint: "#d9f5e8",
          peach: "#f8e6d6",
          yellow: "#f7f1d6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(91, 71, 143, 0.12)",
        glow: "0 8px 30px -6px rgba(123, 107, 181, 0.35)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-24px) translateX(10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0) scale(1)" },
          "50%": { transform: "translateY(28px) translateX(-14px) scale(1.05)" },
        },
        drift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        "bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 9s ease-in-out infinite",
        "float-slow": "float-slow 13s ease-in-out infinite",
        drift: "drift 8s ease-in-out infinite",
        shimmer: "shimmer 2.5s infinite",
        "pulse-ring": "pulse-ring 2.6s ease-out infinite",
        bob: "bob 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
