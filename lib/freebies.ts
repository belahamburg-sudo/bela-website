import { getSupabaseAdminClient } from "./supabase";

export async function grantFreebieCourse(userId: string, slug: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const courseSlug = slug.trim();
  if (!admin || !userId || !courseSlug) return false;

  const { data: course } = await admin
    .from("courses")
    .select("slug")
    .eq("slug", courseSlug)
    .eq("is_active", true)
    .eq("is_unlisted", true)
    .maybeSingle();
  if (!course) return false;

  const { data: existing } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .in("status", ["paid", "free"])
    .maybeSingle();
  if (existing) return true;

  const { error } = await admin.from("purchases").insert({
    user_id: userId,
    course_slug: courseSlug,
    stripe_session_id: `freebie:${userId}:${courseSlug}`,
    amount_total: 0,
    currency: "eur",
    status: "free",
  });

  return !error;
}
