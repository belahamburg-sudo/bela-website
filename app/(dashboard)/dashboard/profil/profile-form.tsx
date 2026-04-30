"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Lock } from "lucide-react";
import { MemberAvatar } from "@/components/member-avatar";
import { MemberProgressMap } from "@/components/member-progress-map";
import {
  DEFAULT_AVATAR_ID,
  FREE_COURSE_REWARD_POINTS,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <input type="hidden" name="selectedAvatar" value={selectedAvatarId} readOnly />
      
      {/* Top Section: Active Avatar & User Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-gold-300/14 bg-[radial-gradient(circle_at_top,rgba(240,180,41,0.18),transparent_55%),rgba(255,255,255,0.02)] p-8">
          <p className="eyebrow mb-6 text-gold-300/70">Aktiver Avatar</p>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="rounded-full bg-gold-300/5 p-2 ring-1 ring-gold-300/20">
              <MemberAvatar avatarId={selectedAvatarId} points={points} size="xl" hidePoints={true} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-heading text-3xl text-cream lg:text-4xl">{currentAvatar.name}</p>
              <div className="mt-2 flex items-center justify-center gap-3 sm:justify-start">
                <span className="rounded-full border border-gold-300/20 bg-gold-300/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-300">
                  Level {memberLevel.current.level}
                </span>
                <span className="text-sm font-semibold text-cream/40">
                  {memberLevel.current.title}
                </span>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-cream/40 mb-2">
                  <span>{points} XP</span>
                  <span>
                    {memberLevel.next
                      ? `${memberLevel.next.minPoints - points} XP bis Level ${memberLevel.next.level}`
                      : "Max Level erreicht"}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06] border border-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-500 via-gold-300 to-gold-200 shadow-[0_0_10px_rgba(240,180,41,0.3)] transition-all duration-1000"
                    style={{ width: `${memberLevel.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/30 mb-1">Lektionen</p>
            <p className="font-heading text-4xl text-cream">{completedLessons}</p>
            <div className="mt-3 h-1 w-8 bg-gold-300/30 rounded-full" />
          </div>
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/30 mb-1">Kurse gekauft</p>
            <p className="font-heading text-4xl text-cream">{purchasedCourses}</p>
            <div className="mt-3 h-1 w-8 bg-gold-300/30 rounded-full" />
          </div>
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/30 mb-1">Kurse beendet</p>
            <p className="font-heading text-4xl text-cream">{completedCourses}</p>
            <div className="mt-3 h-1 w-8 bg-gold-300/30 rounded-full" />
          </div>
          <div className="rounded-[24px] border border-gold-300/16 bg-gold-300/[0.06] p-6 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Gift className="h-12 w-12 text-gold-300" />
            </div>
            <div className="flex items-center gap-2 text-gold-300 mb-1">
              <p className="text-[11px] uppercase tracking-[0.14em]">Nächster Reward</p>
            </div>
            <p className="font-heading text-2xl text-cream">
              {nextReward ? nextReward.title : "Alles freigeschaltet"}
            </p>
            <p className="mt-1 text-[11px] text-cream/40 leading-relaxed">
              {nextReward
                ? `${nextReward.points - points} XP fehlen noch.`
                : `Glückwunsch! Alle Rewards persistiert.`}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Progress Map */}
      <div className="w-full">
        <MemberProgressMap
          points={points}
          selectedAvatarId={selectedAvatarId}
          completedLessons={completedLessons}
          purchasedCourses={purchasedCourses}
          completedCourses={completedCourses}
          rewardCount={rewardCount}
        />
      </div>

      {/* Bottom Section: Form & Avatar Vault */}
      <div className="grid gap-10 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6 rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8">
          <p className="eyebrow mb-6">Profil Details</p>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-white/40">E-Mail-Adresse</label>
              <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-sm text-white/30 font-mono">
                {email}
              </p>
            </div>

            <div>
              <label htmlFor="profile-name" className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-white/60">
                Anzeigename
              </label>
              <input
                id="profile-name"
                name="name"
                type="text"
                defaultValue={initialName}
                placeholder="Dein Name"
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3.5 text-white placeholder-white/20 outline-none transition-all focus:border-gold-300/40 focus:ring-4 focus:ring-gold-300/10"
              />
            </div>

            <div>
              <label htmlFor="profile-goal" className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-white/60">
                Dein aktuelles Ziel
              </label>
              <textarea
                id="profile-goal"
                name="goal"
                rows={3}
                defaultValue={initialGoal}
                placeholder="Was möchtest du mit AI Goldmining erreichen?"
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3.5 text-white placeholder-white/20 outline-none transition-all focus:border-gold-300/40 focus:ring-4 focus:ring-gold-300/10 resize-none"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-gold-300 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:bg-gold-200 hover:shadow-[0_10px_30px_rgba(240,180,41,0.25)] active:scale-[0.98] disabled:opacity-50"
              >
                {pending ? "Wird gespeichert…" : "Profil speichern"}
              </button>
              {saved && <p className="mt-3 text-center text-sm font-medium text-gold-300 animate-pulse">Gespeichert ✓</p>}
              {error && <p className="mt-3 text-center text-sm font-medium text-red-400">{error}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-2">Avatar Vault</p>
              <h2 className="font-heading text-3xl text-cream lg:text-4xl">Wähle deinen Runner.</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-cream/35 lg:text-right">
              Gesperrte Runner werden freigeschaltet, sobald du ihre XP-Station auf der Map erreichst.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
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
                  className={`group relative aspect-square rounded-[22px] border transition-all ${
                    selected
                      ? "border-gold-300 bg-gold-300/[0.12] shadow-[0_10px_30px_rgba(240,180,41,0.15)] ring-2 ring-gold-300/20"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                  } ${!unlocked ? "grayscale opacity-30 cursor-not-allowed" : "hover:scale-[1.05]"}`}
                  title={unlocked ? avatar.name : `${avatar.unlockPoints} XP benötigt`}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-2 lg:p-3">
                    <MemberAvatar avatarId={avatar.id} points={0} size="sm" hidePoints={true} />
                  </div>
                  
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-obsidian/40 backdrop-blur-[1px] rounded-[21px]">
                      <Lock className="h-4 w-4 text-white/40" />
                    </div>
                  )}
                  
                  {selected && (
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-300 shadow-lg">
                      <div className="h-2.5 w-2.5 rounded-full bg-obsidian" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </form>
  );
}
