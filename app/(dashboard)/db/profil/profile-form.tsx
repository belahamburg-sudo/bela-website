"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Gift,
  Lock,
  Rocket,
  Save,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { MemberAvatar } from "@/components/member-avatar";
import { TelegramMembership } from "@/components/profile/telegram-membership";
import { XpRing } from "@/components/profile/xp-ring";
import { ProgressTrack } from "@/components/profile/progress-track";
import { RewardsRail } from "@/components/profile/rewards-rail";
import {
  DEFAULT_AVATAR_ID,
  MEMBER_AVATARS,
  getAvatarById,
  getMemberLevel,
  getUnlockedAvatarIds,
} from "@/lib/avatar-system";
import { updateProfile } from "./actions";

type Props = {
  initialName: string;
  initialCity: string;
  initialGoal: string;
  initialBusinessSnapshot: Record<string, string>;
  email: string;
  initialAvatarId: string | null;
  points: number;
  completedLessons: number;
  purchasedCourses: number;
  completedCourses: number;
  rewardCount: number;
  telegram?: { active: boolean; currentPeriodEnd: string | null } | null;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function ProfileForm({
  initialName,
  initialCity,
  initialGoal,
  initialBusinessSnapshot,
  email,
  initialAvatarId,
  points,
  completedLessons,
  purchasedCourses,
  completedCourses,
  rewardCount,
  telegram = null,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState(initialAvatarId ?? DEFAULT_AVATAR_ID);

  const unlockedIds = new Set(getUnlockedAvatarIds(points));
  const currentAvatar = getAvatarById(selectedAvatarId);
  const memberLevel = getMemberLevel(points);
  const xpToNext = memberLevel.next ? memberLevel.next.minPoints - points : 0;

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

  const statChips = [
    { label: "Lektionen", value: completedLessons, icon: Zap },
    { label: "Rewards", value: rewardCount, icon: Gift },
    { label: "Level", value: memberLevel.current.level, icon: Trophy },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-14">
      <input type="hidden" name="selectedAvatar" value={selectedAvatarId} readOnly />

      {/* ─── BLOCK 1: IDENTITY HEADER ─── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="tac-panel tac-corners relative overflow-hidden p-6 sm:p-10"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-300/[0.07] blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/30 to-transparent" />

        <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
          {/* XP Ring + Avatar */}
          <XpRing
            avatarId={selectedAvatarId}
            points={points}
            progress={memberLevel.progress}
            level={memberLevel.current.level}
          />

          {/* Identity copy */}
          <div className="flex-1 space-y-5 text-center lg:text-left">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <span className="border border-gold-300/30 bg-gold-300/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
                  Level {memberLevel.current.level}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/25" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cream/45">
                  {memberLevel.current.title}
                </span>
              </div>
              <h2 className="font-heading text-4xl uppercase tracking-tight text-cream sm:text-5xl lg:text-6xl">
                {currentAvatar.name}
              </h2>
            </div>

            {/* XP progress bar */}
            <div className="mx-auto max-w-md space-y-2 lg:mx-0">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cream/35">
                <span>{points} XP gesamt</span>
                <span className="text-gold-300/70">{memberLevel.progress}% Fortschritt</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden border border-white/8 bg-white/[0.04] p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-600 via-gold-100 to-gold-50 shadow-[0_0_16px_rgba(232,192,64,0.45)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${memberLevel.progress}%` }}
                  transition={{ duration: 1.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/25">
                {memberLevel.next
                  ? `Noch ${xpToNext} XP bis Level-up`
                  : "Maximale Stufe erreicht"}
              </p>
            </div>

            {/* Stat chips */}
            <div className="flex flex-wrap justify-center gap-3 pt-1 lg:justify-start">
              {statChips.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 border border-white/8 bg-white/[0.02] px-4 py-2.5"
                >
                  <stat.icon className="h-4 w-4 text-gold-300/40" />
                  <div className="text-left">
                    <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">
                      {stat.label}
                    </p>
                    <p className="font-heading text-lg leading-none text-cream">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── VIP TELEGRAM MEMBERSHIP ─── */}
      <section>
        <TelegramMembership
          active={telegram?.active ?? false}
          currentPeriodEnd={telegram?.currentPeriodEnd ?? null}
        />
      </section>

      {/* ─── BLOCK 2: PROGRESS TRACK (centerpiece) ─── */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 border-b border-white/5 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="tac-label tracking-widest text-gold-300/50">Deine Reise</p>
            <h3 className="font-heading text-3xl uppercase tracking-tight text-cream">
              Roadmap zum <span className="text-gold-300">Gipfel.</span>
            </h3>
          </div>
          <p className="max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-cream/30">
            Jede Lektion und jeder Kurs-Unlock bringt dich näher an Goldmaster Summit.
          </p>
        </div>

        <ProgressTrack points={points} />
      </section>

      {/* ─── BLOCK 3: REWARDS RAIL ─── */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 border-b border-white/5 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-gold-300/60">
              <Sparkles className="h-4 w-4" />
              <p className="tac-label tracking-widest">Belohnungen</p>
            </div>
            <h3 className="font-heading text-3xl uppercase tracking-tight text-cream">
              Reward-Stufen.
            </h3>
          </div>
          <p className="max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-cream/30">
            Sammle XP, um neue Tiers, Avatare und einen Gratis-Kurs freizuschalten.
          </p>
        </div>

        <RewardsRail points={points} />
      </section>

      {/* ─── BLOCK 4: SETTINGS (avatar collection + system profile) ─── */}
      <section className="grid gap-10 xl:grid-cols-[1fr_460px]">
        {/* Avatar collection */}
        <div className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3 text-gold-300/60">
              <Award className="h-5 w-5" />
              <p className="tac-label tracking-widest">Charakter-Safe</p>
            </div>
            <h3 className="font-heading text-3xl uppercase tracking-tight text-cream">
              Wähle deine Identität.
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/30">
              {unlockedIds.size} / {MEMBER_AVATARS.length} freigeschaltet
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
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
                  title={unlocked ? avatar.name : `${avatar.unlockPoints} XP benötigt`}
                  className={`group relative aspect-square border transition-all duration-300 ${
                    selected
                      ? "border-gold-300 bg-gold-300/10 shadow-[0_0_28px_rgba(232,192,64,0.18)] ring-1 ring-gold-300/30"
                      : "border-white/8 bg-white/[0.02] hover:border-white/25"
                  } ${
                    unlocked
                      ? "hover:scale-[1.04] active:scale-95"
                      : "cursor-not-allowed opacity-25 grayscale"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-2.5">
                    <MemberAvatar avatarId={avatar.id} points={0} size="sm" hidePoints />
                  </div>

                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-obsidian/55 backdrop-blur-[1px]">
                      <Lock className="h-4 w-4 text-white/45" />
                    </div>
                  )}

                  {selected && (
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-gold-gradient shadow-md">
                      <CheckCircle2 className="h-3 w-3 stroke-[3] text-obsidian" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* System profile form */}
        <div className="tac-panel tac-corners space-y-7 bg-ink/40 p-7 sm:p-8">
          <div className="flex items-center gap-3 text-gold-300">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-heading text-2xl uppercase tracking-tight">System-Profil</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                Identifizierte E-Mail
              </label>
              <div className="border-b border-white/8 py-2 font-mono text-sm text-white/45">
                {email}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="profile-name"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/60"
              >
                Rufname
              </label>
              <input
                id="profile-name"
                name="name"
                type="text"
                defaultValue={initialName}
                placeholder="Dein Vorname"
                className="w-full border border-white/10 bg-white/[0.02] px-4 py-3 text-white outline-none transition-all placeholder:text-white/15 focus:border-gold-300/40"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="profile-city"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/60"
              >
                Stadt
              </label>
              <input
                id="profile-city"
                name="city"
                type="text"
                defaultValue={initialCity}
                placeholder="z.B. Hamburg"
                autoComplete="address-level2"
                className="w-full border border-white/10 bg-white/[0.02] px-4 py-3 text-white outline-none transition-all placeholder:text-white/15 focus:border-gold-300/40"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="profile-goal"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/60"
              >
                Aktuelle Mission
              </label>
              <textarea
                id="profile-goal"
                name="goal"
                rows={3}
                defaultValue={initialGoal}
                placeholder="Was willst du erreichen?"
                className="w-full resize-none border border-white/10 bg-white/[0.02] px-4 py-3 text-white outline-none transition-all placeholder:text-white/15 focus:border-gold-300/40"
              />
            </div>
          </div>

          {/* Business snapshot */}
          <div className="space-y-5 border border-white/5 bg-white/[0.01] p-5">
            <div className="flex items-center gap-2 text-white/30">
              <Rocket className="h-4 w-4" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
                Business Snapshot
              </span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <label
                  htmlFor="profile-instagram"
                  className="block font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/40"
                >
                  Instagram
                </label>
                <input
                  id="profile-instagram"
                  name="instagramFollowers"
                  type="text"
                  defaultValue={instagramFollowers}
                  className="w-full border-b border-white/10 bg-transparent py-1 text-xs text-white outline-none focus:border-gold-300/30"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="profile-tiktok"
                  className="block font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/40"
                >
                  TikTok
                </label>
                <input
                  id="profile-tiktok"
                  name="tiktokFollowers"
                  type="text"
                  defaultValue={tiktokFollowers}
                  className="w-full border-b border-white/10 bg-transparent py-1 text-xs text-white outline-none focus:border-gold-300/30"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="profile-sales"
                  className="block font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/40"
                >
                  Sales / Mt.
                </label>
                <input
                  id="profile-sales"
                  name="monthlySales"
                  type="text"
                  defaultValue={monthlySales}
                  className="w-full border-b border-white/10 bg-transparent py-1 text-xs text-white outline-none focus:border-gold-300/30"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="profile-stage"
                  className="block font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/40"
                >
                  Status
                </label>
                <input
                  id="profile-stage"
                  name="businessStage"
                  type="text"
                  defaultValue={businessStage}
                  className="w-full border-b border-white/10 bg-transparent py-1 text-xs text-white outline-none focus:border-gold-300/30"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="btn-shimmer relative flex w-full items-center justify-center gap-3 bg-gold-gradient px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-obsidian transition-all hover:brightness-110 hover:shadow-[0_0_40px_rgba(232,192,64,0.25)] active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian/30 border-t-obsidian" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {pending ? "Daten werden gesichert..." : "System-Profil sichern"}
          </button>

          {saved && (
            <div className="flex items-center justify-center gap-2 text-gold-300 duration-300 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
                Update erfolgreich
              </span>
            </div>
          )}

          {error && (
            <div className="border border-red-500/30 bg-red-500/5 px-4 py-3 text-center">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-red-300/80">
                {error}
              </span>
            </div>
          )}
        </div>
      </section>
    </form>
  );
}
