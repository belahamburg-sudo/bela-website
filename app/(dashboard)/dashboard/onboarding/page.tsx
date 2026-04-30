"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Target, User, Zap } from "lucide-react";
import { MemberAvatar } from "@/components/member-avatar";
import { completeOnboarding } from "./actions";

// Provide 3 starting character classes for the user to choose from
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

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  
  // State
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [avatarId, setAvatarId] = useState(STARTER_CLASSES[0].id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 4) {
      if (step === 1 && !name.trim()) return;
      if (step === 2 && !goal) return;
      setStep(s => s + 1);
      return;
    }

    setPending(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("goal", goal);
    formData.append("avatarId", avatarId);
    await completeOnboarding(formData);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold-300/[0.03] blur-[150px] z-0" />
      
      <div className="w-full max-w-2xl relative z-10">
        
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step >= i ? "w-8 bg-gold-300" : "w-4 bg-white/10"
              }`} 
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="panel-surface rounded-[32px] p-8 md:p-12 relative overflow-hidden">
          {/* Subtle background texture inside panel */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,180,41,0.08),transparent_40%)]" />
          
          <div className="relative z-10">
            {/* STEP 1: NAME */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-300/20 bg-gold-300/10 shadow-[0_0_30px_rgba(240,180,41,0.15)]">
                    <User className="h-8 w-8 text-gold-300" />
                  </div>
                </div>
                <div className="text-center mb-10">
                  <h1 className="font-heading text-4xl text-cream mb-4">Wie dürfen wir dich nennen?</h1>
                  <p className="text-cream/40 text-lg">Dies ist dein Name auf der Member-Map.</p>
                </div>
                <input
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dein Anzeigename"
                  className="w-full text-center text-2xl rounded-2xl border border-white/[0.12] bg-white/[0.04] px-6 py-5 text-white placeholder-white/20 outline-none transition-all focus:border-gold-300/50 focus:ring-4 focus:ring-gold-300/10 mb-8"
                />
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gold-300 px-6 py-5 text-lg font-bold uppercase tracking-[0.1em] text-obsidian transition-all hover:bg-gold-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  Weiter <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* STEP 2: GOAL */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-300/20 bg-gold-300/10 shadow-[0_0_30px_rgba(240,180,41,0.15)]">
                    <Target className="h-8 w-8 text-gold-300" />
                  </div>
                </div>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-4xl text-cream mb-4">Hey {name}, was ist dein Ziel?</h1>
                  <p className="text-cream/40 text-lg">Das hilft uns, deinen Pfad besser anzupassen.</p>
                </div>
                <div className="grid gap-3 mb-8">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => { setGoal(g); setStep(3); }}
                      className={`text-left p-5 rounded-2xl border transition-all ${
                        goal === g 
                          ? "border-gold-300 bg-gold-300/10 shadow-[0_0_20px_rgba(240,180,41,0.1)]" 
                          : "border-white/10 bg-white/[0.03] hover:border-gold-300/30 hover:bg-white/[0.05]"
                      }`}
                    >
                      <p className={`text-lg font-medium ${goal === g ? "text-gold-300" : "text-cream/80"}`}>{g}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: AVATAR SELECTION */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-300/20 bg-gold-300/10 shadow-[0_0_30px_rgba(240,180,41,0.15)]">
                    <Zap className="h-8 w-8 text-gold-300" />
                  </div>
                </div>
                <div className="text-center mb-10">
                  <h1 className="font-heading text-4xl text-cream mb-4">Wähle deinen Charakter.</h1>
                  <p className="text-cream/40 text-lg">Das ist dein In-Game Avatar für die Goldmine.</p>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4 mb-10">
                  {STARTER_CLASSES.map((cls) => {
                    const isSelected = avatarId === cls.id;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setAvatarId(cls.id)}
                        className={`relative flex flex-col items-center text-center p-6 rounded-3xl border transition-all ${
                          isSelected 
                            ? "border-gold-300 bg-gold-300/[0.08] shadow-[0_20px_50px_rgba(240,180,41,0.2)] scale-105 z-10" 
                            : "border-white/10 bg-white/[0.02] hover:border-gold-300/30 hover:bg-white/[0.04]"
                        }`}
                      >
                        <MemberAvatar avatarId={cls.id} points={0} size="lg" hidePoints={true} />
                        <h3 className={`font-heading text-xl mt-5 mb-2 ${isSelected ? "text-gold-300" : "text-cream"}`}>
                          {cls.name}
                        </h3>
                        <p className="text-xs text-cream/40 leading-relaxed">
                          {cls.desc}
                        </p>
                        
                        {isSelected && (
                          <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-gold-300 flex items-center justify-center text-obsidian shadow-lg">
                            ✓
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gold-300 px-6 py-5 text-lg font-bold uppercase tracking-[0.1em] text-obsidian transition-all hover:bg-gold-200 hover:scale-[1.02]"
                >
                  Diesen Avatar wählen <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* STEP 4: SUMMARY & START */}
            {step === 4 && (
              <div className="animate-in zoom-in-95 duration-700 text-center">
                <div className="inline-block relative mb-8">
                  <div className="absolute inset-0 bg-gold-300 blur-[60px] opacity-20 rounded-full" />
                  <MemberAvatar avatarId={avatarId} points={0} size="xl" hidePoints={true} />
                </div>
                
                <h1 className="font-heading text-5xl text-cream mb-4">
                  Willkommen in der <br/><span className="gold-text">Goldmine</span>, {name}.
                </h1>
                
                <div className="max-w-md mx-auto mb-10 p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <p className="text-cream/50 text-sm uppercase tracking-[0.1em] mb-2">Deine Mission</p>
                  <p className="text-cream text-lg italic">&quot;{goal}&quot;</p>
                </div>
                
                <p className="text-cream/40 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                  Deine Map ist vorbereitet. Erledige Lektionen, sammle XP und schalte mächtigere Avatare auf deiner Reise frei.
                </p>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full sm:w-auto mx-auto flex items-center justify-center gap-3 rounded-2xl bg-gold-500 px-10 py-5 text-lg font-bold uppercase tracking-[0.1em] text-obsidian transition-all hover:bg-gold-400 hover:scale-[1.05] disabled:opacity-50 shadow-[0_0_40px_rgba(240,180,41,0.3)]"
                >
                  {pending ? "Lade Dashboard..." : "Mission starten"} <Sparkles className="h-5 w-5" />
                </button>
              </div>
            )}
            
          </div>
        </form>
      </div>
    </div>
  );
}
