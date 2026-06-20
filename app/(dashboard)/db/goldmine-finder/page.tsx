import { AuthGate } from "@/components/auth-gate";
import { SpatialBackground } from "@/components/spatial-background";
import { GoldmineFinder } from "@/components/goldmine-finder";

export const dynamic = "force-dynamic";

export default function GoldmineFinderPage() {
  return (
    <AuthGate>
      <section className="relative min-h-screen overflow-hidden bg-obsidian py-16 sm:py-24">
        <SpatialBackground />

        <div className="container-shell relative z-10">
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-gold-300/30" />
              <span className="tac-label uppercase tracking-widest text-[9px] text-gold-300/60">
                AI-Tool
              </span>
            </div>
            <h1 className="mb-4 font-heading uppercase leading-tight tracking-gta text-cream text-4xl md:text-6xl">
              GOLDMINE<span className="text-gold-300">-FINDER.</span>
            </h1>
            <p className="max-w-2xl text-[10px] font-mono uppercase leading-relaxed tracking-[0.2em] text-cream/30">
              Dein persönlicher AI-Strategie-Coach. Bekomm in Sekunden 3 maßgeschneiderte AI-Business-Ideen plus den nächsten Schritt — basierend auf deinem Profil.
            </p>
          </div>

          <GoldmineFinder />
        </div>
      </section>
    </AuthGate>
  );
}
