import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "./supabase";
import {
  DEFAULT_AVATAR_ID,
  MEMBER_REWARDS,
  calculateMemberPoints,
  getMemberLevel,
} from "@/lib/avatar-system";

export type MemberStateSnapshot = {
  selectedAvatarId: string;
  points: number;
  level: number;
  rewardKeys: string[];
  rewardCount: number;
  currentStreak: number;
  longestStreak: number;
  persistent: boolean;
};

/** Date in Europe/Berlin as YYYY-MM-DD, optionally offset by whole days. */
function berlinDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Advance a daily login streak based on the last active date. */
function nextStreak(
  lastActiveOn: string | null,
  current: number,
  longest: number
): { current: number; longest: number; today: string } {
  const today = berlinDate(0);
  const yesterday = berlinDate(-1);
  let cur = current ?? 0;
  if (lastActiveOn === today) {
    cur = Math.max(cur, 1); // already counted today
  } else if (lastActiveOn === yesterday) {
    cur = (current ?? 0) + 1;
  } else {
    cur = 1; // first day or streak broken
  }
  return { current: cur, longest: Math.max(longest ?? 0, cur), today };
}

type SyncInput = {
  supabase: SupabaseClient;
  userId: string;
  onboardingComplete: boolean;
  purchasedCourses: number;
  completedLessons: number;
  completedCourses: number;
  fallbackAvatarId?: string | null;
};

export async function syncMemberState({
  supabase,
  userId,
  onboardingComplete,
  purchasedCourses,
  completedLessons,
  completedCourses,
  fallbackAvatarId,
}: SyncInput): Promise<MemberStateSnapshot> {
  const points = calculateMemberPoints({
    onboardingComplete,
    purchasedCourses,
    completedLessons,
    completedCourses,
  });

  const rewardKeys = MEMBER_REWARDS.filter((reward) => points >= reward.points).map(
    (reward) => reward.key
  );
  const level = getMemberLevel(points).current.level;
  const defaultAvatarId = fallbackAvatarId ?? DEFAULT_AVATAR_ID;

  // Gamification state is NON-CRITICAL: a write failure (RLS, missing table,
  // transient error) must NEVER crash the member dashboard. So every DB op below
  // degrades to this in-memory snapshot instead of throwing.
  const fallback: MemberStateSnapshot = {
    selectedAvatarId: defaultAvatarId,
    points,
    level,
    rewardKeys,
    rewardCount: rewardKeys.length,
    currentStreak: 0,
    longestStreak: 0,
    persistent: false,
  };

  // Points/level/rewards are computed server-side from real data above and
  // written with the service role. Client writes to member_state / member_rewards
  // are blocked by RLS (migration_024) so a user can't self-inflate them by
  // calling Supabase directly. Degrades to the passed client if no admin key.
  const writer = getSupabaseAdminClient() ?? supabase;

  try {
    const stateResult = await writer
      .from("member_state")
      .select("selected_avatar, current_streak, longest_streak, last_active_on")
      .eq("user_id", userId)
      .maybeSingle();

    if (stateResult.error) return fallback;

    const selectedAvatarId = stateResult.data?.selected_avatar ?? defaultAvatarId;
    const streak = nextStreak(
      stateResult.data?.last_active_on ?? null,
      stateResult.data?.current_streak ?? 0,
      stateResult.data?.longest_streak ?? 0
    );

    const upsertResult = await writer.from("member_state").upsert(
      {
        user_id: userId,
        selected_avatar: selectedAvatarId,
        points,
        level,
        purchased_courses: purchasedCourses,
        completed_lessons: completedLessons,
        completed_courses: completedCourses,
        current_streak: streak.current,
        longest_streak: streak.longest,
        last_active_on: streak.today,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertResult.error) {
      return { ...fallback, selectedAvatarId, currentStreak: streak.current, longestStreak: streak.longest };
    }

    if (rewardKeys.length > 0) {
      // ignoreDuplicates → INSERT … ON CONFLICT DO NOTHING.
      await writer.from("member_rewards").upsert(
        rewardKeys.map((rewardKey) => ({
          user_id: userId,
          reward_key: rewardKey,
        })),
        { onConflict: "user_id,reward_key", ignoreDuplicates: true }
      );
      // Ignore any error here — rewards are cosmetic.
    }

    const claimedRewardsResult = await writer
      .from("member_rewards")
      .select("reward_key")
      .eq("user_id", userId);

    if (claimedRewardsResult.error) {
      return { ...fallback, selectedAvatarId, currentStreak: streak.current, longestStreak: streak.longest };
    }

    const claimedRewardKeys = (claimedRewardsResult.data ?? []).map(
      (reward: { reward_key: string }) => reward.reward_key
    );

    return {
      selectedAvatarId,
      points,
      level,
      rewardKeys: claimedRewardKeys,
      rewardCount: claimedRewardKeys.length,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      persistent: true,
    };
  } catch {
    return fallback;
  }
}
