"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };
type CreateResult = ActionResult & { id?: string };

type OptionInput = { text: string; isCorrect: boolean };

export async function saveQuizQuestion(
  moduleId: string,
  question: string,
  options: OptionInput[],
  explanation?: string | null,
  position?: number | null,
  questionId?: string | null
): Promise<CreateResult> {
  if (!moduleId) return { ok: false, error: "Kein Modul angegeben." };
  const trimmed = question?.trim();
  if (!trimmed) return { ok: false, error: "Fragetext ist erforderlich." };

  // Validate options: at least 2, at most 4, at least one correct.
  const cleanOptions = (options ?? [])
    .map((o) => ({ text: o.text?.trim() ?? "", isCorrect: Boolean(o.isCorrect) }))
    .filter((o) => o.text.length > 0);

  if (cleanOptions.length < 2)
    return { ok: false, error: "Mindestens 2 Antwortmöglichkeiten erforderlich." };
  if (cleanOptions.length > 4)
    return { ok: false, error: "Maximal 4 Antwortmöglichkeiten erlaubt." };
  if (!cleanOptions.some((o) => o.isCorrect))
    return { ok: false, error: "Mindestens eine richtige Antwort markieren." };

  const { user, supabase } = await requireAdmin();

  if (questionId) {
    // Update existing question.
    const { error } = await supabase
      .from("quiz_questions")
      .update({
        question: trimmed,
        options: cleanOptions,
        explanation: explanation?.trim() || null,
        ...(typeof position === "number" ? { position } : {}),
      })
      .eq("id", questionId);

    if (error) return { ok: false, error: error.message };

    await logAudit({
      actorEmail: user.email,
      action: "quiz_question.update",
      entity: "quiz_questions",
      entityId: questionId,
      meta: { moduleId, question: trimmed },
    });

    revalidatePath("/admin/kurse");
    return { ok: true, id: questionId };
  }

  // Auto-assign position if not provided.
  let pos = position;
  if (typeof pos !== "number") {
    const { data: maxRow } = await supabase
      .from("quiz_questions")
      .select("position")
      .eq("module_id", moduleId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    pos = ((maxRow?.position as number | null) ?? -1) + 1;
  }

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      module_id: moduleId,
      question: trimmed,
      options: cleanOptions,
      explanation: explanation?.trim() || null,
      position: pos,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "quiz_question.create",
    entity: "quiz_questions",
    entityId: data?.id ?? null,
    meta: { moduleId, question: trimmed },
  });

  revalidatePath("/admin/kurse");
  return { ok: true, id: data?.id };
}

export async function deleteQuizQuestion(questionId: string): Promise<ActionResult> {
  if (!questionId) return { ok: false, error: "Keine Fragen-ID angegeben." };
  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "quiz_question.delete",
    entity: "quiz_questions",
    entityId: questionId,
  });

  revalidatePath("/admin/kurse");
  return { ok: true };
}

export async function reorderQuizQuestions(
  moduleId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  if (!moduleId) return { ok: false, error: "Kein Modul angegeben." };
  const { supabase } = await requireAdmin();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("quiz_questions")
        .update({ position: index })
        .eq("id", id)
        .eq("module_id", moduleId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidatePath("/admin/kurse");
  return { ok: true };
}
