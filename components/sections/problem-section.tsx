"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

const MODELS = [
  {
    icon: "⏳",
    tag: "Kapitalintensiv",
    name: "Dropshipping",
    points: ["Hohes Testing-Budget nötig", "Logistik & Retouren", "Lange Margen-Kette"],
    primary: false,
  },
  {
    icon: "🔧",
    tag: "Zeit-gebunden",
    name: "Agenturen",
    points: ["Zeit gegen Geld", "Dauerhaft neue Kunden akquirieren", "Schwer skalierbar"],
    primary: false,
  },
  {
    icon: "💻",
    tag: "Technik-lastig",
    name: "SaaS",
    points: ["Monate Entwicklungszeit", "Support + Infrastruktur", "Startkapital nötig"],
    primary: false,
  },
  {
    icon: "✨",
    tag: "Die Methode",
    name: "Digitale Produkte",
    points: ["Einmal bauen, dauerhaft verkaufen", "Fast reine digitale Marge", "Mit AI in Tagen statt Monaten"],
    primary: true,
  },
];

function ModelCard({
  model,
  index,
}: {
  model: (typeof MODELS)[0];
  index: number;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={model.primary ? { scale: 1.02, y: -4 } : { y: -2 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-2xl border p-7 cursor-default transition-shadow duration-500 ${
        model.primary
          ? "border-gold-300/40 bg-gradient-to-br from-gold-500/10 via-transparent to-transparent shadow-[0_0_60px_rgba(214,168,79,0.1)]"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      {/* Spotlight on hover */}
      {hovered && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(250px circle at ${mousePos.x}px ${mousePos.y}px, ${model.primary ? "rgba(214,168,79,0.12)" : "rgba(214,168,79,0.06)"}, transparent 70%)`,
          }}
        />
      )}

      {model.primary && (
        <Sparkles className="absolute right-5 top-5 h-4 w-4 text-gold-300/70" aria-hidden />
      )}

      <div className="relative z-10">
        <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-3 ${model.primary ? "text-gold-300" : "text-white/30"}`}>
          {model.tag}
        </p>
        <h3 className="font-heading text-2xl text-white mb-6">{model.name}</h3>

        <ul className="space-y-3">
          {model.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm leading-relaxed">
              {model.primary ? (
                <Check className="mt-0.5 h-4 w-4 flex-none text-gold-300" aria-hidden />
              ) : (
                <X className="mt-0.5 h-4 w-4 flex-none text-white/25" aria-hidden />
              )}
              <span className={model.primary ? "text-white/80" : "text-white/35"}>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export function ProblemSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 bg-obsidian">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gold-300/3 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-3"
          >
            Die Haltung
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-heading text-4xl lg:text-5xl text-white"
          >
            Nicht jedes Online-Modell ist{" "}
            <em className="gold-text not-italic">clever für den Start.</em>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODELS.map((m, i) => (
            <ModelCard key={m.name} model={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
