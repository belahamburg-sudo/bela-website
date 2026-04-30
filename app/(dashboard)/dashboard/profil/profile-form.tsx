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
    <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[1.05fr_1.35fr]">
      <input type="hidden" name="selectedAvatar" value={selectedAvatarId} readOnly />
      <div className="space-y-6">
        <div className="rounded-[28px] border border-gold-300/14 bg-[radial-gradient(circle_at_top,rgba(240,180,41,0.18),transparent_55%),rgba(255,255,255,0.02)] p-6">
          <p className="eyebrow mb-4">Aktiver Avatar</p>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <MemberAvatar avatarId={selectedAvatarId} points={points} size="lg" />
            <div className="flex-1">
              <p className="font-heading text-2xl text-cream">{currentAvatar.name}</p>
              <p className="mt-1 text-sm text-cream/40">
                Level {memberLevel.current.level} · {memberLevel.current.title}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                  style={{ width: `${memberLevel.progress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-cream/30">
                <span>{points} Punkte</span>
                <span>
                  {memberLevel.next
                    ? `${memberLevel.next.minPoints - points} bis Level ${memberLevel.next.level}`
                    : "Max Level erreicht"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">Lektionen</p>
            <p className="mt-2 font-heading text-3xl text-cream">{completedLessons}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">Kurse gekauft</p>
            <p className="mt-2 font-heading text-3xl text-cream">{purchasedCourses}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">Kurse beendet</p>
            <p className="mt-2 font-heading text-3xl text-cream">{completedCourses}</p>
          </div>
          <div className="rounded-2xl border border-gold-300/16 bg-gold-300/[0.06] p-4">
            <div className="flex items-center gap-2 text-gold-300">
              <Gift className="h-4 w-4" />
              <p className="text-[11px] uppercase tracking-[0.14em]">Nächster Reward</p>
            </div>
            <p className="mt-2 font-heading text-xl text-cream">
              {nextReward ? nextReward.title : "Alles freigeschaltet"}
            </p>
            <p className="mt-1 text-sm text-cream/40">
              {nextReward
                ? `${nextReward.points - points} Punkte fehlen noch.`
                : `Ab ${FREE_COURSE_REWARD_POINTS} Punkten ist auch der Gratis-Kurs-Reward erreicht.`}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-gold-300/70">
              {rewardCount} Rewards bereits persistiert
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/50">E-Mail-Adresse</label>
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/40">
              {email}
            </p>
          </div>

          <div>
            <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-white/70">
              Name
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              defaultValue={initialName}
              placeholder="Dein Name"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:ring-2 focus:ring-gold-300/30"
            />
          </div>

          <div>
            <label htmlFor="profile-goal" className="mb-2 block text-sm font-medium text-white/70">
              Dein Ziel
            </label>
            <input
              id="profile-goal"
              name="goal"
              type="text"
              defaultValue={initialGoal}
              placeholder="Was möchtest du erreichen?"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:ring-2 focus:ring-gold-300/30"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gold-500 px-6 py-3 text-sm font-medium text-obsidian transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Wird gespeichert…" : "Profil speichern"}
            </button>
            {saved && <span className="text-sm text-gold-300">Gespeichert ✓</span>}
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <MemberProgressMap
          points={points}
          selectedAvatarId={selectedAvatarId}
          completedLessons={completedLessons}
          purchasedCourses={purchasedCourses}
          completedCourses={completedCourses}
          rewardCount={rewardCount}
        />

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Avatar Vault</p>
            <h2 className="font-heading text-3xl text-cream">Wähle deinen Runner.</h2>
          </div>
          <p className="max-w-xs text-right text-sm text-cream/35">
            Jeder Avatar ist ein neuer Skin für deinen Fortschritt auf der Map. Gesperrte Runner gehen erst auf, wenn du ihre Station erreichst.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                className={`group rounded-[24px] border p-4 text-left transition-all ${
                  selected
                    ? "border-gold-300/40 bg-gold-300/[0.07] shadow-[0_18px_50px_rgba(240,180,41,0.12)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-gold-300/20"
                } ${!unlocked ? "opacity-55" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-[18px] border border-gold-300/20 bg-gradient-to-br ${avatar.accent} font-heading text-lg tracking-gta text-obsidian`}
                  >
                    {avatar.badge}
                  </div>
                  {!unlocked && (
                    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
                      <Lock className="h-3 w-3" />
                      Locked
                    </div>
                  )}
                </div>
                <p className="mt-4 font-heading text-lg text-cream">{avatar.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-cream/35">
                  {unlocked ? "Freigeschaltet" : `${avatar.unlockPoints} Punkte nötig`}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </form>
  );
}
