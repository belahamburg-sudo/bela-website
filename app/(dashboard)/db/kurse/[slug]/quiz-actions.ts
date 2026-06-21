"use server";

import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";

type Answer = { questionId: string; selectedIndex: number };

type QuizResult = {
  ok: boolean;
  error?: string;
  score?: number;
  total?: number;
  passed?: boolean;
  pointsEarned?: number;
};

export async function submitQuizAttempt(
  moduleId: string,
  answers: Answer[]
): Promise<QuizResult> {
  if (!moduleId) return { ok: false, error: "Kein Modul angegeben." };
  if (!answers || answers.length === 0)
    return { ok: false, error: "Keine Antworten übermittelt." };
  if (!hasSupabasePublicEnv()) return { ok: false, error: "no env" };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "no client" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  const admin = getSupabaseAdminClient();
  const reader = admin ?? supabase;

  // Fetch the actual questions to grade server-side (never trust client scores).
  const { data: questions, error: qErr } = await reader
    .from("quiz_questions")
    .select("id, options")
    .eq("module_id", moduleId);

  if (qErr || !questions || questions.length === 0) {
    return { ok: false, error: "Quizfragen konnten nicht geladen werden." };
  }

  const questionMap = new Map(
    (questions as { id: string; options: { text: string; isCorrect: boolean }[] }[]).map(
      (q) => [q.id, q.options]
    )
  );

  let score = 0;
  const total = questionMap.size;

  for (const answer of answers) {
    const options = questionMap.get(answer.questionId);
    if (!options) continue;
    const selected = options[answer.selectedIndex];
    if (selected?.isCorrect) score += 1;
  }

  const passed = total > 0 && score / total >= 0.7;
  const pointsEarned = passed ? score * 5 : 0;

  // Insert the attempt record.
  const writer = admin ?? supabase;
  const { error: insertErr } = await writer.from("quiz_attempts").insert({
    user_id: user.id,
    module_id: moduleId,
    score,
    total,
    answers: answers as unknown as Record<string, unknown>[],
    passed,
  });

  if (insertErr) {
    return { ok: false, error: insertErr.message };
  }

  // Award XP points on pass via member_state (service-role, same pattern as
  // syncMemberState). Best-effort: a failure here must never lose the quiz result.
  if (passed && pointsEarned > 0 && admin) {
    try {
      const { data: state } = await admin
        .from("member_state")
        .select("points")
        .eq("user_id", user.id)
        .maybeSingle();

      const current = (state?.points as number | null) ?? 0;

      await admin
        .from("member_state")
        .upsert(
          {
            user_id: user.id,
            points: current + pointsEarned,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
    } catch {
      // XP award is best-effort — quiz result is already saved.
    }
  }

  return { ok: true, score, total, passed, pointsEarned };
}
