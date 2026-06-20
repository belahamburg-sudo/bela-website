"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext, logAudit } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };

/** Manually grants a customer access to a course by inserting a paid purchase. */
export async function grantCourseAccess(input: {
  userId: string;
  courseSlug: string;
}): Promise<ActionResult> {
  if (!input.userId) return { ok: false, error: "Kein Kunde angegeben." };
  if (!input.courseSlug) return { ok: false, error: "Kein Kurs ausgewählt." };

  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

  // Grant the parent course (idempotent — skip if already owned).
  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", input.userId)
    .eq("course_slug", input.courseSlug)
    .in("status", ["paid", "free"])
    .limit(1);

  const alreadyOwned = Boolean(existing && existing.length > 0);
  let purchaseId: string | null = null;

  if (!alreadyOwned) {
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
    purchaseId = data?.id ?? null;
  }

  // Expand bundles: also unlock (free) every course this one includes — even when
  // the parent was already owned, so re-running tops up missing bundled courses.
  let bundledGranted = 0;
  try {
    const { data: course } = await supabase
      .from("courses")
      .select("bundled_courses")
      .eq("slug", input.courseSlug)
      .maybeSingle();
    const bundled = Array.isArray(course?.bundled_courses)
      ? (course!.bundled_courses as string[])
      : [];
    const toCheck = bundled.filter((s) => s && s !== input.courseSlug);
    if (toCheck.length > 0) {
      const { data: owned } = await supabase
        .from("purchases")
        .select("course_slug")
        .eq("user_id", input.userId)
        .in("course_slug", toCheck)
        .in("status", ["paid", "free"]);
      const ownedSet = new Set(
        ((owned ?? []) as { course_slug: string }[]).map((r) => r.course_slug)
      );
      const toGrant = toCheck.filter((s) => !ownedSet.has(s));
      if (toGrant.length > 0) {
        const { error: bundleErr } = await supabase.from("purchases").upsert(
          toGrant.map((s) => ({
            user_id: input.userId,
            course_slug: s,
            stripe_session_id: `bundle:${input.userId}:${s}`,
            amount_total: 0,
            currency: "eur",
            status: "paid",
          })),
          { onConflict: "stripe_session_id,course_slug", ignoreDuplicates: true }
        );
        if (!bundleErr) bundledGranted = toGrant.length;
      }
    }
  } catch (e) {
    console.error("grantCourseAccess bundle expansion failed:", e instanceof Error ? e.message : e);
  }

  if (alreadyOwned && bundledGranted === 0) {
    return { ok: false, error: "Kurs (inkl. Bundle) ist für diesen Kunden bereits freigeschaltet." };
  }

  await logAudit({
    actorEmail: user.email,
    action: "course.grant_access",
    entity: "purchases",
    entityId: purchaseId,
    meta: { userId: input.userId, courseSlug: input.courseSlug, bundledGranted },
  });

  revalidatePath("/admin/kunden");
  return { ok: true };
}

/** Revokes a manually granted course by deleting the purchase row. */
export async function revokeCourseAccess(input: {
  purchaseId: string;
}): Promise<ActionResult> {
  if (!input.purchaseId) return { ok: false, error: "Kein Eintrag angegeben." };

  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

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
