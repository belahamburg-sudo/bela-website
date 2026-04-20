import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#050505",
        graphite: "#0A0A0D",
        panel: "#111114",
        ink: "#18181C",
        gold: {
          50: "#FFF6D8",
          100: "#FFE99D",
          200: "#FFDE7A",
          300: "#FFD76A",
          400: "#EBBE5A",
          500: "#D6A84F",
          600: "#B8893A",
          700: "#9C7431",
          800: "#5F4619",
          900: "#3C2A0E"
        },
        cream: "#F5F2E9",
        bone: "#E8E4D7",
        muted: "#8A8A8F",
        hairline: "rgba(214, 168, 79, 0.12)"
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Instrument Serif", "Georgia", "Times New Roman", "serif"],
        body: ["var(--font-body)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 6.5vw, 6.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "400" }],
        "display-lg": ["clamp(2.5rem, 5vw, 4.75rem)", { lineHeight: "1.08", letterSpacing: "-0.015em", fontWeight: "400" }],
        "display-md": ["clamp(2rem, 3.6vw, 3.25rem)", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "400" }]
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(255,215,106,0.18), 0 20px 60px -20px rgba(214,168,79,0.45)",
        "gold-sm": "0 0 0 1px rgba(255,215,106,0.14), 0 10px 30px -10px rgba(214,168,79,0.35)",
        soft: "0 24px 80px rgba(0, 0, 0, 0.55)",
        ring: "inset 0 1px 0 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(214,168,79,0.14)"
      },
      backgroundImage: {
        "gold-radial": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255, 215, 106, 0.22), transparent 60%)",
        "gold-sweep": "linear-gradient(120deg, transparent 0%, rgba(255,215,106,0.08) 45%, rgba(255,215,106,0.18) 50%, rgba(255,215,106,0.08) 55%, transparent 100%)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.85 0 0 0 0 0.70 0 0 0 0 0.38 0 0 0 0.12 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out both",
        "shimmer": "shimmer 2.4s ease-in-out infinite",
        "breathe": "breathe 8s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.05)", opacity: "0.7" }
        }
      }
    }
  },
  plugins: []
};

export default config;
