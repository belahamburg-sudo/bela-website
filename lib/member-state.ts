import type { SupabaseClient } from "@supabase/supabase-js";
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

function isMissingRelationError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "42P01"
  );
}

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

  const stateResult = await supabase
    .from("member_state")
    .select("selected_avatar")
    .eq("user_id", userId)
    .maybeSingle();

  if (stateResult.error && isMissingRelationError(stateResult.error)) {
    return {
      selectedAvatarId: defaultAvatarId,
      points,
      level,
      rewardKeys,
      rewardCount: rewardKeys.length,
      persistent: false,
    };
  }

  if (stateResult.error) {
    throw stateResult.error;
  }

  const selectedAvatarId = stateResult.data?.selected_avatar ?? defaultAvatarId;

  const upsertResult = await supabase.from("member_state").upsert(
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

  if (upsertResult.error && isMissingRelationError(upsertResult.error)) {
    return {
      selectedAvatarId,
      points,
      level,
      rewardKeys,
      rewardCount: rewardKeys.length,
      persistent: false,
    };
  }

  if (upsertResult.error) {
    throw upsertResult.error;
  }

  if (rewardKeys.length > 0) {
    const rewardsResult = await supabase.from("member_rewards").upsert(
      rewardKeys.map((rewardKey) => ({
        user_id: userId,
        reward_key: rewardKey,
      })),
      { onConflict: "user_id,reward_key" }
    );

    if (rewardsResult.error && !isMissingRelationError(rewardsResult.error)) {
      throw rewardsResult.error;
    }
  }

  const claimedRewardsResult = await supabase
    .from("member_rewards")
    .select("reward_key")
    .eq("user_id", userId);

  if (claimedRewardsResult.error && isMissingRelationError(claimedRewardsResult.error)) {
    return {
      selectedAvatarId,
      points,
      level,
      rewardKeys,
      rewardCount: rewardKeys.length,
      persistent: false,
    };
  }

  if (claimedRewardsResult.error) {
    throw claimedRewardsResult.error;
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
}
