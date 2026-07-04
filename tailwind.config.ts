import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
