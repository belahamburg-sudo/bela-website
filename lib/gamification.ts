import { getSupabaseAdminClient } from "./supabase";

export type LeaderRow = {
  rank: number;
  name: string;
  points: number;
  level: number;
  isYou: boolean;
};

export type Quest = {
  key: string;
  label: string;
  progress: number;
  target: number;
  done: boolean;
};

export type Gamification = {
  currentStreak: number;
  longestStreak: number;
  yourRank: number | null;
  totalMembers: number;
  leaderboard: LeaderRow[];
  quests: Quest[];
};

function firstName(full: string | null | undefined, fallback: string): string {
  const n = (full ?? "").trim().split(/\s+/)[0];
  return n || fallback;
}

/** Streak + leaderboard + weekly quests for the dashboard. Read-only (admin). */
export async function getGamification(userId: string): Promise<Gamification | null> {
  const admin = getSupabaseAdminClient();
  if (!admin || !userId) return null;

  try {
    const [meRes, topRes, totalRes, weekRes] = await Promise.all([
      admin
        .from("member_state")
        .select("points, current_streak, longest_streak")
        .eq("user_id", userId)
        .maybeSingle(),
      admin
        .from("member_state")
        .select("user_id, points, level")
        .order("points", { ascending: false })
        .limit(10),
      admin.from("member_state").select("user_id", { count: "exact", head: true }),
      admin
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("completed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const me = meRes.data as
      | { points: number | null; current_streak: number | null; longest_streak: number | null }
      | null;
    const myPoints = me?.points ?? 0;
    const currentStreak = me?.current_streak ?? 0;
    const longestStreak = me?.longest_streak ?? 0;

    const { count: higher } = await admin
      .from("member_state")
      .select("user_id", { count: "exact", head: true })
      .gt("points", myPoints);

    const top = (topRes.data ?? []) as { user_id: string; points: number; level: number }[];
    const ids = top.map((r) => r.user_id);
    const nameById = new Map<string, string | null>();
    if (ids.length > 0) {
      const { data: profs } = await admin.from("profiles").select("id, full_name").in("id", ids);
      for (const p of (profs ?? []) as { id: string; full_name: string | null }[]) {
        nameById.set(p.id, p.full_name);
      }
    }

    const leaderboard: LeaderRow[] = top.map((r, i) => ({
      rank: i + 1,
      name: firstName(nameById.get(r.user_id), "Goldminer"),
      points: r.points ?? 0,
      level: r.level ?? 1,
      isYou: r.user_id === userId,
    }));

    const weekLessons = weekRes.count ?? 0;
    const quests: Quest[] = [
      { key: "lesson1", label: "Schließe diese Woche 1 Lektion ab", target: 1, progress: Math.min(weekLessons, 1), done: weekLessons >= 1 },
      { key: "lesson3", label: "Schließe diese Woche 3 Lektionen ab", target: 3, progress: Math.min(weekLessons, 3), done: weekLessons >= 3 },
      { key: "streak3", label: "Sei 3 Tage in Folge dabei", target: 3, progress: Math.min(currentStreak, 3), done: currentStreak >= 3 },
    ];

    return {
      currentStreak,
      longestStreak,
      yourRank: (higher ?? 0) + 1,
      totalMembers: totalRes.count ?? 0,
      leaderboard,
      quests,
    };
  } catch {
    return null;
  }
}
