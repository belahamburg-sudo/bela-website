"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext, logAudit } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };

/** Pin or unpin a comment (admin only). */
export async function adminPinComment(
  commentId: string,
  pin: boolean
): Promise<ActionResult> {
  if (!commentId) return { ok: false, error: "Keine Kommentar-ID." };

  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Kein Admin-Zugang." };

  const { error } = await ctx.supabase
    .from("lesson_comments")
    .update({ is_pinned: pin, updated_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: ctx.user.email,
    action: pin ? "comment.pin" : "comment.unpin",
    entity: "lesson_comments",
    entityId: commentId,
  });

  revalidatePath("/admin/kommentare");
  return { ok: true };
}

/** Soft-delete a comment (admin only). */
export async function adminDeleteComment(
  commentId: string
): Promise<ActionResult> {
  if (!commentId) return { ok: false, error: "Keine Kommentar-ID." };

  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Kein Admin-Zugang." };

  const { error } = await ctx.supabase
    .from("lesson_comments")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: ctx.user.email,
    action: "comment.delete",
    entity: "lesson_comments",
    entityId: commentId,
  });

  revalidatePath("/admin/kommentare");
  return { ok: true };
}
