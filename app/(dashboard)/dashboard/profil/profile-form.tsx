"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Lock, User, Target, Rocket, Award, Mail, Save, CheckCircle2, Trophy, ShieldCheck, Pickaxe } from "lucide-react";
import { MemberAvatar } from "@/components/member-avatar";
import { MemberProgressMap } from "@/components/member-progress-map";
import {
  DEFAULT_AVATAR_ID,
  MEMBER_AVATARS,
  getAvatarById,
  getMemberLevel,
  getNextReward,
  getUnlockedAvatarIds,
} from "@/lib/avatar-system";
import { updateProfile } from "./actions";

type Props = {
  initialName: string;
  initialGoal: string;
  initialBusinessSnapshot: Record<string, string>;
  email: string;
  initialAvatarId: string | null;
  points: number;
  completedLessons: number;
  purchasedCourses: number;
  completedCourses: number;
  rewardCount: number;
};

export function ProfileForm({
  initialName,
  initialGoal,
  initialBusinessSnapshot,
  email,
  initialAvatarId,
  points,
  completedLessons,
  purchasedCourses,
  completedCourses,
  rewardCount,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState(initialAvatarId ?? DEFAULT_AVATAR_ID);

  const unlockedIds = new Set(getUnlockedAvatarIds(points));
  const currentAvatar = getAvatarById(selectedAvatarId);
  const memberLevel = getMemberLevel(points);
  const nextReward = getNextReward(points);
  const instagramFollowers = initialBusinessSnapshot.instagramFollowers ?? "";
  const tiktokFollowers = initialBusinessSnapshot.tiktokFollowers ?? "";
  const monthlySales = initialBusinessSnapshot.monthlySales ?? "";
  const businessStage = initialBusinessSnapshot.businessStage ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("selectedAvatar", selectedAvatarId);
      const result = await updateProfile(formData);

      if (!result.ok) {
        throw new Error(result.error ?? "Speichern fehlgeschlagen.");
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Speichern fehlgeschlagen."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-16">
      <input type="hidden" name="selectedAvatar" value={selectedAvatarId} readOnly />
      
      {/* ─── SECTION 1: Identity Hero ─── */}
      <section className="relative">
        <div className="absolute -inset-x-6 -top-12 h-64 bg-gradient-to-b from-gold-300/[0.03] to-transparent pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          {/* Large Character Display */}
          <div className="relative shrink-0">
            <div className="absolute -inset-8 border border-gold-300/10 rounded-full animate-[spin_40s_linear_infinite]" />
            <div className="absolute -inset-4 border border-gold-300/20 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            <div className="rounded-full bg-gold-300/5 p-5 ring-1 ring-gold-300/30 backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(240,180,41,0.1)]">
              <MemberAvatar avatarId={selectedAvatarId} points={points} size="xl" hidePoints={true} />
              
              <div className="absolute -bottom-2 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-gold-300 text-obsidian shadow-lg border-2 border-obsidian">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <span className="px-3 py-1 rounded-sm border border-gold-300/20 bg-gold-300/10 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">
                  LEVEL {memberLevel.current.level}
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span className="text-sm font-bold uppercase tracking-widest text-cream/40">
                  {memberLevel.current.title}
                </span>
              </div>
              <h2 className="font-heading text-5xl lg:text-7xl text-cream tracking-tight mb-2 uppercase">{currentAvatar.name}</h2>
            </div>
            
            <div className="max-w-md space-y-3 mx-auto md:mx-0">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-cream/30">
                <span>{points} XP Gesamt</span>
                <span className="text-gold-300/60">{memberLevel.progress}% Fortschritt</span>
              </div>
              <div className="h-3 w-full rounded-none bg-white/5 border border-white/5 overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-gold-600 via-gold-300 to-gold-200 shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all duration-1000"
                  style={{ width: `${memberLevel.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-cream/20 font-mono text-center md:text-left uppercase">
                {memberLevel.next
                  ? `Noch ${memberLevel.next.minPoints - points} XP bis zum Aufstieg in den nächsten Sektor`
                  : "Maximale Autoritätsstufe im System erreicht"}
              </p>
            </div>
          </div>

          {/* Hall of Fame Stats */}
          <div className="hidden lg:grid grid-cols-1 gap-3 shrink-0 min-w-[200px]">
            {[
              { label: "Lektionen", value: completedLessons, icon: Pickaxe },
              { label: "Rewards", value: rewardCount, icon: Gift },
              { label: "Level", value: memberLevel.current.level, icon: Trophy },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 px-5 py-3 border border-white/5 bg-white/[0.01] tac-corners">
                <stat.icon className="h-4 w-4 text-gold-300/30" />
                <div>
                  <p className="text-[9px] font-bold text-white/20 uppercase">{stat.label}</p>
                  <p className="font-heading text-xl text-cream leading-none">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: The Journey Map (Centerpiece) ─── */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <p className="tac-label text-gold-300/40 uppercase tracking-widest">Die Roadmap</p>
            <h3 className="font-heading text-4xl text-cream tracking-tight uppercase">Deine Reise.</h3>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-cream/30 font-mono uppercase">
            Jede abgeschlossene Lektion und jeder Kurs-Unlock bringt dich näher an den Gipfel.
          </p>
        </div>
        
        <MemberProgressMap
          points={points}
          selectedAvatarId={selectedAvatarId}
          completedLessons={completedLessons}
          purchasedCourses={purchasedCourses}
          completedCourses={completedCourses}
          rewardCount={rewardCount}
        />
      </section>

      {/* ─── SECTION 3: Vault & Data ─── */}
      <section className="grid gap-12 xl:grid-cols-[1fr_450px]">
        
        {/* Character Vault */}
        <div className="space-y-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-gold-300/60">
              <Award className="h-5 w-5" />
              <p className="tac-label uppercase tracking-widest">Charakter-Safe</p>
            </div>
            <h3 className="font-heading text-3xl text-cream tracking-tight uppercase">Wähle deine Identität.</h3>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-4">
            {MEMBER_AVATARS.map((avatar) => {
              const unlocked = unlockedIds.has(avatar.id);
              const selected = avatar.id === selectedAvatarId;

              return (
                <button
                  key={avatar.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    if (unlocked) setSelectedAvatarId(avatar.id);
                  }}
                  className={`group relative aspect-square rounded-none border transition-all duration-300 ${
                    selected
                      ? "border-gold-300 bg-gold-300/10 shadow-[0_0_30px_rgba(240,180,41,0.15)] ring-1 ring-gold-300/20"
                      : "border-white/5 bg-white/[0.01] hover:border-white/20"
                  } ${!unlocked ? "grayscale opacity-20 cursor-not-allowed" : "hover:scale-105 active:scale-95"}`}
                  title={unlocked ? avatar.name : `${avatar.unlockPoints} XP benötigt`}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    <MemberAvatar avatarId={avatar.id} points={0} size="sm" hidePoints={true} />
                  </div>
                  
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-obsidian/60 backdrop-blur-[1px]">
                      <Lock className="h-4 w-4 text-white/40" />
                    </div>
                  )}
                  
                  {selected && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-gold-300 shadow-md">
                      <CheckCircle2 className="h-3 w-3 text-obsidian stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-8">
          <div className="tac-panel tac-corners p-8 bg-ink/40 border-gold-300/10 space-y-8">
            <div className="flex items-center gap-3 text-gold-300">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-heading text-2xl tracking-tight uppercase">System-Profil</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Identifizierte E-Mail</label>
                <div className="border-b border-white/5 py-2 text-sm text-white/40 font-mono">
                  {email}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="profile-name" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                  Rufname
                </label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  defaultValue={initialName}
                  placeholder="Dein Vorname"
                  className="w-full bg-white/[0.02] border border-white/10 px-4 py-3 text-white placeholder-white/10 outline-none focus:border-gold-300/40 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="profile-goal" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                  Aktuelle Mission
                </label>
                <textarea
                  id="profile-goal"
                  name="goal"
                  rows={3}
                  defaultValue={initialGoal}
                  placeholder="Was willst du erreichen?"
                  className="w-full bg-white/[0.02] border border-white/10 px-4 py-3 text-white placeholder-white/10 outline-none focus:border-gold-300/40 transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-6 border border-white/5 bg-white/[0.01] space-y-6">
              <div className="flex items-center gap-2 text-white/20">
                <Rocket className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Business Snapshot</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="profile-instagram" className="block text-[9px] font-bold text-white/40 uppercase">Instagram</label>
                  <input
                    id="profile-instagram"
                    name="instagramFollowers"
                    type="text"
                    defaultValue={instagramFollowers}
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white outline-none focus:border-gold-300/30"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="profile-tiktok" className="block text-[9px] font-bold text-white/40 uppercase">TikTok</label>
                  <input
                    id="profile-tiktok"
                    name="tiktokFollowers"
                    type="text"
                    defaultValue={tiktokFollowers}
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white outline-none focus:border-gold-300/30"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="profile-sales" className="block text-[9px] font-bold text-white/40 uppercase">Sales / Mt.</label>
                  <input
                    id="profile-sales"
                    name="monthlySales"
                    type="text"
                    defaultValue={monthlySales}
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white outline-none focus:border-gold-300/30"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="profile-stage" className="block text-[9px] font-bold text-white/40 uppercase">Status</label>
                  <input
                    id="profile-stage"
                    name="businessStage"
                    type="text"
                    defaultValue={businessStage}
                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white outline-none focus:border-gold-300/30"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full relative flex items-center justify-center gap-3 bg-gold-300 px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-obsidian transition-all hover:bg-gold-200 hover:shadow-[0_0_40px_rgba(240,180,41,0.25)] active:scale-98 disabled:opacity-50"
            >
              {pending ? (
                <div className="h-4 w-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {pending ? "Daten werden gesichert..." : "System-Profil sichern"}
            </button>

            {saved && (
              <div className="flex items-center justify-center gap-2 text-gold-300 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Update erfolgreich</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </form>
  );
}
