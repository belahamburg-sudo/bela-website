import { getNewsletterStatus, subscribeNewsletter } from "./newsletter";
import { getSupabaseAdminClient } from "./supabase";

export type FreebieClaimResult =
  | { status: "granted" }
  | { status: "already_owned" }
  | { status: "pending_newsletter" }
  | { status: "invalid_course" }
  | { status: "error"; reason: string };

const FREEBIE_SELECT = "slug, title, tagline, description, image_url, level, format, modules(*, lessons(*))";

export async function getFreebieCourse(slug: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  const courseSlug = slug.trim();
  if (!courseSlug) return null;

  const { data, error } = await admin
    .from("courses")
    .select(FREEBIE_SELECT)
    .eq("slug", courseSlug)
    .eq("is_active", true)
    .eq("is_unlisted", true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function userOwnsFreebie(userId: string, slug: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const courseSlug = slug.trim();
  if (!admin || !userId || !courseSlug) return false;

  const { data } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .in("status", ["paid", "free"])
    .maybeSingle();

  return Boolean(data);
}

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

  if (error) {
    console.error("grantFreebieCourse insert failed:", error.message);
    return false;
  }
  return true;
}

export async function claimFreebieForUser(
  userId: string,
  email: string,
  slug: string,
  opts: { name?: string }
): Promise<FreebieClaimResult> {
  const course = await getFreebieCourse(slug);
  if (!course) return { status: "invalid_course" };

  if (await userOwnsFreebie(userId, slug)) {
    return { status: "already_owned" };
  }

  const newsletterStatus = await getNewsletterStatus(email);
  if (newsletterStatus === "confirmed") {
    const granted = await grantFreebieCourse(userId, slug);
    return granted
      ? { status: "granted" }
      : { status: "error", reason: "purchase_insert_failed" };
  }

  const freebieSource = `freebie:${slug.trim()}`;
  await subscribeNewsletter(email, {
    userId,
    source: freebieSource,
    name: opts.name,
    resend: newsletterStatus === "pending",
  });

  return { status: "pending_newsletter" };
}

export function freebieFunnelStep(user: { id: string } | null, owned: boolean): 1 | 2 | 3 {
  if (owned) return 3;
  if (!user) return 1;
  return 2;
}
