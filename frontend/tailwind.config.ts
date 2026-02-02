import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c3d66"
        },
        gradient: {
          start: "#0ea5e9",
          end: "#6366f1",
        }
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
        "gradient-dark": "linear-gradient(135deg, #0c3d66 0%, #312e81 100%)",
      },
      boxShadow: {
        "glow": "0 0 20px rgba(14, 165, 233, 0.3)",
        "glow-lg": "0 0 30px rgba(14, 165, 233, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      }
    }
  },
  plugins: [typography]
} satisfies Config;
