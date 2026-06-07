"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };

/** Manually grants a customer access to a course by inserting a paid purchase. */
export async function grantCourseAccess(input: {
  userId: string;
  courseSlug: string;
}): Promise<ActionResult> {
  if (!input.userId) return { ok: false, error: "Kein Kunde angegeben." };
  if (!input.courseSlug) return { ok: false, error: "Kein Kurs ausgewählt." };

  const { user, supabase } = await requireAdmin();

  // Avoid duplicate grants for the same user + course.
  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", input.userId)
    .eq("course_slug", input.courseSlug)
    .eq("status", "paid")
    .limit(1);

  if (existing && existing.length > 0) {
    return { ok: false, error: "Kurs ist für diesen Kunden bereits freigeschaltet." };
  }

  const { data, error } = await supabase
    .from("purchases")
    .insert({
      user_id: input.userId,
      course_slug: input.courseSlug,
      status: "paid",
      amount_total: 0,
      currency: "eur",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "course.grant_access",
    entity: "purchases",
    entityId: data?.id ?? null,
    meta: { userId: input.userId, courseSlug: input.courseSlug },
  });

  revalidatePath("/admin/kunden");
  return { ok: true };
}

/** Revokes a manually granted course by deleting the purchase row. */
export async function revokeCourseAccess(input: {
  purchaseId: string;
}): Promise<ActionResult> {
  if (!input.purchaseId) return { ok: false, error: "Kein Eintrag angegeben." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("purchases")
    .delete()
    .eq("id", input.purchaseId);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "course.revoke_access",
    entity: "purchases",
    entityId: input.purchaseId,
  });

  revalidatePath("/admin/kunden");
  return { ok: true };
}
