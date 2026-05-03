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
        obsidian: "#0a0806",
        graphite: "#110e0a",
        panel: "#1a1510",
        ink: "#221c14",
        gold: {
          50: "#FFF6D8",
          100: "#FFE99D",
          200: "#FFD76A",
          300: "#F0B429",
          400: "#C98B00",
          500: "#A06B00",
          600: "#7A4F00",
          700: "#5C3A00",
          800: "#3D2500",
          900: "#1F1200"
        },
        cream: "#F5EDD6",
        bone: "#E0D3B0",
        muted: "#7A6B50",
        hairline: "rgba(240, 180, 41, 0.15)"
      },
      fontFamily: {
        heading: ["Chalet Comprime Cologne Seventy", "var(--font-heading)", "Barlow Condensed", "Arial Narrow", "sans-serif"],
        body: ["var(--font-body)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      fontSize: {
        "display-xl": ["clamp(2.5rem, 8vw, 9rem)", { lineHeight: "0.93", letterSpacing: "0.04em", fontWeight: "800" }],
        "display-lg": ["clamp(2rem, 6vw, 6.5rem)", { lineHeight: "0.95", letterSpacing: "0.04em", fontWeight: "800" }],
        "display-md": ["clamp(1.75rem, 4vw, 4rem)", { lineHeight: "0.97", letterSpacing: "0.03em", fontWeight: "800" }]
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(240,180,41,0.25), 0 20px 60px -20px rgba(192,140,0,0.6)",
        "gold-sm": "0 0 0 1px rgba(240,180,41,0.18), 0 10px 30px -10px rgba(192,140,0,0.4)",
        soft: "0 24px 80px rgba(0, 0, 0, 0.75)",
        ring: "inset 0 1px 0 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(240,180,41,0.18)"
      },
      backgroundImage: {
        "gold-radial": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(240,180,41,0.28), transparent 60%)",
        "gold-sweep": "linear-gradient(120deg, transparent 0%, rgba(240,180,41,0.10) 45%, rgba(255,215,100,0.22) 50%, rgba(240,180,41,0.10) 55%, transparent 100%)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.94 0 0 0 0 0.71 0 0 0 0 0.16 0 0 0 0.14 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out both",
        "shimmer": "shimmer 2.4s ease-in-out infinite",
        "breathe": "breathe 8s ease-in-out infinite",
        "flicker": "flicker 3.1s ease-in-out infinite",
        "grain": "grain 1.2s steps(6) infinite",
        "drift": "drift 7s linear infinite",
        "camera": "camera 10s cubic-bezier(.65,.02,.35,1) infinite"
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
        },
        flicker: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "43%": { opacity: "0.95" },
          "45%": { opacity: "0.55", filter: "brightness(.7)" },
          "47%": { opacity: "1", filter: "brightness(1.1)" },
          "62%": { opacity: "0.85" },
          "64%": { opacity: "1" },
          "85%": { opacity: "0.7", filter: "brightness(.8)" },
          "87%": { opacity: "1" }
        },
        grain: {
          "0%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-2%,1%)" },
          "40%": { transform: "translate(1%,-2%)" },
          "60%": { transform: "translate(-1%,2%)" },
          "80%": { transform: "translate(2%,1%)" },
          "100%": { transform: "translate(0,0)" }
        },
        drift: {
          "0%": { opacity: "0", transform: "translate(0,0)" },
          "10%": { opacity: "0.9" },
          "90%": { opacity: "0.7" },
          "100%": { opacity: "0", transform: "translate(-40px,-180px)" }
        },
        camera: {
          "0%": { transform: "scale(1) translate(0,0)" },
          "30%": { transform: "scale(1.35) translate(15%,-2%)" },
          "55%": { transform: "scale(1.35) translate(-1%,0%)" },
          "80%": { transform: "scale(1.30) translate(-27%,5%)" },
          "100%": { transform: "scale(1) translate(0,0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
