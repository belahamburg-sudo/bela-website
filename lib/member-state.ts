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
  persistent: boolean;
};

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
      .select("selected_avatar")
      .eq("user_id", userId)
      .maybeSingle();

    if (stateResult.error) return fallback;

    const selectedAvatarId = stateResult.data?.selected_avatar ?? defaultAvatarId;

    const upsertResult = await writer.from("member_state").upsert(
      {
        user_id: userId,
        selected_avatar: selectedAvatarId,
        points,
        level,
        purchased_courses: purchasedCourses,
        completed_lessons: completedLessons,
        completed_courses: completedCourses,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertResult.error) {
      return { ...fallback, selectedAvatarId };
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
      return { ...fallback, selectedAvatarId };
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
      persistent: true,
    };
  } catch {
    return fallback;
  }
}
