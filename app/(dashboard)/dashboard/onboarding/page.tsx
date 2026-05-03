"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, Target, User, Zap } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { MemberAvatar } from "@/components/member-avatar";
import { completeOnboarding } from "./actions";

const STARTER_CLASSES = [
  { id: "miner-01", name: "The Builder", desc: "Fokus auf schnelles Umsetzen und Produkt-Kreation." },
  { id: "miner-02", name: "The Strategist", desc: "Fokus auf Funnels, Systeme und Automatisierung." },
  { id: "miner-03", name: "The Creator", desc: "Fokus auf Content, Reichweite und Community." },
];

const GOALS = [
  "Ich will mein erstes digitales Produkt verkaufen.",
  "Ich will den 9-to-5 Job hinter mir lassen.",
  "Ich will mein bestehendes Business mit AI skalieren.",
  "Ich will AI-Skills lernen und verstehen.",
];

const STAGES = [
  "Ich fange komplett bei null an.",
  "Ich habe erste Ideen, aber noch kein Produkt.",
  "Ich habe bereits erste Verkäufe oder Follower.",
  "Ich bin schon im Markt und will skalieren.",
];

function StepPill({ active, done }: { active?: boolean; done?: boolean }) {
  return (
    <div
      className={`h-1.5 rounded-full transition-all duration-500 ${
        active || done ? "w-8 bg-gold-300" : "w-4 bg-white/10"
      }`}
    />
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [stage, setStage] = useState("");
  const [instagramFollowers, setInstagramFollowers] = useState("");
  const [tiktokFollowers, setTiktokFollowers] = useState("");
  const [monthlySales, setMonthlySales] = useState("");
  const [avatarId, setAvatarId] = useState(STARTER_CLASSES[0].id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (step < 6) {
      if (step === 1 && !name.trim()) return;
      if (step === 2 && !goal) return;
      if (step === 3 && !stage) return;
      if (step === 4 && !instagramFollowers.trim() && !tiktokFollowers.trim() && !monthlySales.trim()) return;
      setStep((current) => current + 1);
      return;
    }

    setPending(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("goal", goal);
    formData.append("avatarId", avatarId);
    formData.append("instagramFollowers", instagramFollowers);
    formData.append("tiktokFollowers", tiktokFollowers);
    formData.append("monthlySales", monthlySales);
    formData.append("businessStage", stage);
    await completeOnboarding(formData);
  }

  return (
    <AuthGate>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian px-4 py-16 sm:px-6">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300/[0.03] blur-[160px]"
          aria-hidden
        />

        <div className="relative z-10 w-full max-w-3xl">
          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <StepPill key={i} active={step === i} done={step > i} />
            ))}
          </div>

          <div className="mb-6 text-center">
            <p className="eyebrow mb-4">AI Onboarding</p>
            <h1 className="font-heading text-4xl leading-[0.95] text-cream sm:text-5xl lg:text-[4.5rem]">
              Erst die Fragen.
              <span className="gold-text block">Dann das Dashboard.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-cream/45 sm:text-lg">
              Dieses Onboarding sammelt die wichtigsten Informationen zu deinem Status, deiner Richtung und deinem Setup,
              damit dein Member-Bereich später nicht generisch wirkt.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[2rem] border border-gold-300/14 bg-[#120e08]/90 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,180,41,0.08),transparent_40%)]" aria-hidden />

            <div className="relative z-10">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-300/20 bg-gold-300/10 shadow-[0_0_30px_rgba(240,180,41,0.15)]">
                      <User className="h-8 w-8 text-gold-300" />
                    </div>
                  </div>
                  <div className="mb-10 text-center">
                    <h2 className="font-heading text-3xl text-cream sm:text-4xl">Wie dürfen wir dich nennen?</h2>
                    <p className="mt-3 text-cream/40">Der Name auf deiner Member-Map und im Dashboard.</p>
                  </div>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Dein Anzeigename"
                    className="mb-8 w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-6 py-5 text-center text-2xl text-white placeholder-white/20 outline-none transition-all focus:border-gold-300/50 focus:ring-4 focus:ring-gold-300/10"
                  />
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gold-300 px-6 py-5 text-lg font-bold uppercase tracking-[0.1em] text-obsidian transition-all hover:bg-gold-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Weiter <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-300/20 bg-gold-300/10 shadow-[0_0_30px_rgba(240,180,41,0.15)]">
                      <Target className="h-8 w-8 text-gold-300" />
                    </div>
                  </div>
                  <div className="mb-8 text-center">
                    <h2 className="font-heading text-3xl text-cream sm:text-4xl">Was ist dein Hauptziel?</h2>
                    <p className="mt-3 text-cream/40">Damit wir dein Onboarding auf die richtige Mission ausrichten.</p>
                  </div>
                  <div className="grid gap-3">
                    {GOALS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setGoal(item);
                          setStep(3);
                        }}
                        className={`rounded-2xl border p-5 text-left transition-all ${
                          goal === item
                            ? "border-gold-300 bg-gold-300/10 shadow-[0_0_20px_rgba(240,180,41,0.1)]"
                            : "border-white/10 bg-white/[0.03] hover:border-gold-300/30 hover:bg-white/[0.05]"
                        }`}
                      >
                        <p className={`text-lg font-medium ${goal === item ? "text-gold-300" : "text-cream/80"}`}>
                          {item}
                        </p>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-cream/30 transition-colors hover:text-cream/60"
                  >
                    Zurück
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-300/20 bg-gold-300/10 shadow-[0_0_30px_rgba(240,180,41,0.15)]">
                      <Sparkles className="h-8 w-8 text-gold-300" />
                    </div>
                  </div>
                  <div className="mb-8 text-center">
                    <h2 className="font-heading text-3xl text-cream sm:text-4xl">Wo stehst du gerade?</h2>
                    <p className="mt-3 text-cream/40">Das hilft später bei der Einordnung von Profil und Empfehlungen.</p>
                  </div>
                  <div className="grid gap-3">
                    {STAGES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setStage(item);
                          setStep(4);
                        }}
                        className={`rounded-2xl border p-5 text-left transition-all ${
                          stage === item
                            ? "border-gold-300 bg-gold-300/10 shadow-[0_0_20px_rgba(240,180,41,0.1)]"
                            : "border-white/10 bg-white/[0.03] hover:border-gold-300/30 hover:bg-white/[0.05]"
                        }`}
                      >
                        <p className={`text-lg font-medium ${stage === item ? "text-gold-300" : "text-cream/80"}`}>
                          {item}
                        </p>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-cream/30 transition-colors hover:text-cream/60"
                  >
                    Zurück
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-300/20 bg-gold-300/10 shadow-[0_0_30px_rgba(240,180,41,0.15)]">
                      <Zap className="h-8 w-8 text-gold-300" />
                    </div>
                  </div>
                  <div className="mb-8 text-center">
                    <h2 className="font-heading text-3xl text-cream sm:text-4xl">Welche Zahlen sind wichtig?</h2>
                    <p className="mt-3 text-cream/40">Kurzer Snapshot zu deinem aktuellen Setup. Keine Pflicht für alles, aber hilfreich.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="instagramFollowers" className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-gold-300/70">
                        Instagram Follower
                      </label>
                      <input
                        id="instagramFollowers"
                        type="text"
                        value={instagramFollowers}
                        onChange={(event) => setInstagramFollowers(event.target.value)}
                        placeholder="z.B. 12.4k"
                        className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-4 text-white placeholder-white/20 outline-none transition-all focus:border-gold-300/50 focus:ring-4 focus:ring-gold-300/10"
                      />
                    </div>
                    <div>
                      <label htmlFor="tiktokFollowers" className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-gold-300/70">
                        TikTok Follower
                      </label>
                      <input
                        id="tiktokFollowers"
                        type="text"
                        value={tiktokFollowers}
                        onChange={(event) => setTiktokFollowers(event.target.value)}
                        placeholder="z.B. 8.1k"
                        className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-4 text-white placeholder-white/20 outline-none transition-all focus:border-gold-300/50 focus:ring-4 focus:ring-gold-300/10"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="monthlySales" className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-gold-300/70">
                        Monatliche Sales
                      </label>
                      <input
                        id="monthlySales"
                        type="text"
                        value={monthlySales}
                        onChange={(event) => setMonthlySales(event.target.value)}
                        placeholder="z.B. 14"
                        className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-4 text-white placeholder-white/20 outline-none transition-all focus:border-gold-300/50 focus:ring-4 focus:ring-gold-300/10"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-2xl border border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-cream/55 transition-all hover:border-gold-300/30 hover:text-cream"
                    >
                      Zurück
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-2xl bg-gold-300 px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-obsidian transition-all hover:bg-gold-200"
                    >
                      Weiter zur Avatar-Wahl <ArrowRight className="ml-2 inline-block h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-300/20 bg-gold-300/10 shadow-[0_0_30px_rgba(240,180,41,0.15)]">
                      <Zap className="h-8 w-8 text-gold-300" />
                    </div>
                  </div>
                  <div className="mb-8 text-center">
                    <h2 className="font-heading text-3xl text-cream sm:text-4xl">Wähle deinen Charakter.</h2>
                    <p className="mt-3 text-cream/40">Das ist dein In-Game Avatar für die Goldmine.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {STARTER_CLASSES.map((starterClass) => {
                      const isSelected = avatarId === starterClass.id;
                      return (
                        <button
                          key={starterClass.id}
                          type="button"
                          onClick={() => setAvatarId(starterClass.id)}
                          className={`relative flex flex-col items-center rounded-3xl border p-6 text-center transition-all ${
                            isSelected
                              ? "z-10 scale-[1.02] border-gold-300 bg-gold-300/[0.08] shadow-[0_20px_50px_rgba(240,180,41,0.2)]"
                              : "border-white/10 bg-white/[0.02] hover:border-gold-300/30 hover:bg-white/[0.04]"
                          }`}
                        >
                          <MemberAvatar avatarId={starterClass.id} points={0} size="lg" hidePoints />
                          <h3 className={`mt-5 mb-2 font-heading text-xl ${isSelected ? "text-gold-300" : "text-cream"}`}>
                            {starterClass.name}
                          </h3>
                          <p className="text-xs leading-relaxed text-cream/40">{starterClass.desc}</p>
                          {isSelected ? (
                            <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gold-300 text-obsidian shadow-lg">
                              ✓
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="rounded-2xl border border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-cream/55 transition-all hover:border-gold-300/30 hover:text-cream"
                    >
                      Zurück
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-2xl bg-gold-300 px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-obsidian transition-all hover:bg-gold-200"
                    >
                      Weiter zur Zusammenfassung <ArrowRight className="ml-2 inline-block h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="animate-in zoom-in-95 duration-700 text-center">
                  <div className="relative mx-auto mb-8 inline-block">
                    <div className="absolute inset-0 rounded-full bg-gold-300/20 blur-[60px]" />
                    <MemberAvatar avatarId={avatarId} points={0} size="xl" hidePoints />
                  </div>

                  <h2 className="font-heading text-4xl text-cream sm:text-5xl">
                    Willkommen in der <span className="gold-text block">Goldmine</span>, {name}.
                  </h2>

                  <div className="mx-auto mb-8 mt-8 max-w-xl rounded-[1.75rem] border border-white/10 bg-white/[0.02] p-6 text-left">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-cream/35">Dein Snapshot</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/65">Ziel</p>
                        <p className="mt-1 text-cream/80">{goal}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/65">Status</p>
                        <p className="mt-1 text-cream/80">{stage}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/65">Instagram</p>
                        <p className="mt-1 text-cream/80">{instagramFollowers || "nicht angegeben"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/65">TikTok</p>
                        <p className="mt-1 text-cream/80">{tiktokFollowers || "nicht angegeben"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/65">Sales</p>
                        <p className="mt-1 text-cream/80">{monthlySales || "nicht angegeben"}</p>
                      </div>
                    </div>
                  </div>

                  <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-cream/45">
                    Deine Map ist vorbereitet. Erledige Lektionen, sammle XP und schalte mächtigere Avatare auf deiner Reise frei.
                  </p>

                  <button
                    type="submit"
                    disabled={pending}
                    className="mx-auto flex w-full items-center justify-center gap-3 rounded-2xl bg-gold-300 px-10 py-5 text-lg font-bold uppercase tracking-[0.1em] text-obsidian transition-all hover:bg-gold-200 hover:scale-[1.02] disabled:opacity-50"
                  >
                    {pending ? "Lade Dashboard..." : "Mission starten"}
                    <Sparkles className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </AuthGate>
  );
}
