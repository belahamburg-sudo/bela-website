import { AuthGate } from "@/components/auth-gate";
import { SpatialBackground } from "@/components/spatial-background";
import { TelegramSubscribeCard } from "@/components/telegram-subscribe-card";
import { VipWorldMap } from "@/components/vip-world-map";
import { getVipLocations } from "@/lib/vip-map";
import { Crown, MessageCircle, BookOpen, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const PERKS = [
  {
    icon: MessageCircle,
    title: "Direkter Chatkontakt zu mir",
    copy: "Stell deine Fragen direkt in der Gruppe und bekomm echtes Feedback auf deine Produkte und Funnels.",
  },
  {
    icon: BookOpen,
    title: "Monatlich neue Kurse",
    copy: "Jeden Monat neue Inhalte und Calls, exklusiv für VIP-Mitglieder.",
  },
  {
    icon: Users,
    title: "Umsetzung Schulter an Schulter",
    copy: "Eine Community aus Umsetzern statt Zuschauern. Live-Calls, Austausch und gemeinsame Umsetzung.",
  },
];

export default async function VipPage() {
  const { points, total } = await getVipLocations();
  return (
    <AuthGate>
      <section className="relative min-h-screen overflow-hidden bg-obsidian py-16 sm:py-24">
        <SpatialBackground />

        <div className="container-shell relative z-10">
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-gold-300/30" />
              <span className="tac-label uppercase tracking-widest text-[9px] text-gold-300/60">
                VIP Mitgliedschaft
              </span>
            </div>
            <h1 className="mb-4 font-heading uppercase leading-tight tracking-gta text-cream text-4xl md:text-6xl">
              VIP <span className="text-gold-300">Member.</span>
            </h1>
            <p className="max-w-2xl text-[10px] font-mono uppercase leading-relaxed tracking-[0.2em] text-cream/30">
              Dein Zugang zur Paid Community mit direktem Draht zu mir, monatlich neuen Kursen und Umsetzung in der Gruppe.
            </p>
          </div>

          <TelegramSubscribeCard />

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {PERKS.map((perk) => (
              <div
                key={perk.title}
                className="border border-white/10 bg-ink/40 p-6 backdrop-blur-xl"
              >
                <perk.icon className="h-5 w-5 text-gold-300" />
                <h3 className="mt-4 font-heading text-lg text-cream">{perk.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/50">{perk.copy}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-cream/30">
            <Crown className="h-3.5 w-3.5 text-gold-300/60" />
            Jederzeit kündbar. Kein Risiko.
          </p>

          <div className="mt-12">
            <VipWorldMap points={points} total={total} />
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
