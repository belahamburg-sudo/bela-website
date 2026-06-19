import { getSupabaseAdminClient } from "./supabase";

/** Aggregated read helpers for the admin area. All run with the service role. */

export type AdminPurchase = {
  id: string;
  user_id: string | null;
  course_slug: string;
  stripe_session_id: string | null;
  stripe_customer_id: string | null;
  amount_total: number | null;
  currency: string | null;
  status: string;
  created_at: string;
};

export type AdminLead = {
  id: string;
  email: string;
  name: string | null;
  source: string;
  status: string;
  created_at: string;
};

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  city: string | null;
  goal: string | null;
  onboarding_complete: boolean;
  created_at: string;
};

export type AdminStats = {
  revenueCents: number;
  revenueTodayCents: number;
  revenue30dCents: number;
  aovCents: number;
  paidCount: number;
  pendingCount: number;
  leadCount: number;
  memberCount: number;
  courseCount: number;
  telegramActive: number;
  /** paid customers / members, as a 0–100 percentage. */
  conversionRate: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const empty: AdminStats = {
    revenueCents: 0,
    revenueTodayCents: 0,
    revenue30dCents: 0,
    aovCents: 0,
    paidCount: 0,
    pendingCount: 0,
    leadCount: 0,
    memberCount: 0,
    courseCount: 0,
    telegramActive: 0,
    conversionRate: 0,
  };
  const admin = getSupabaseAdminClient();
  if (!admin) return empty;

  const [purchases, leads, members, courses, telegram] = await Promise.all([
    admin.from("purchases").select("amount_total, status, created_at"),
    admin.from("leads").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("courses").select("id", { count: "exact", head: true }),
    admin.from("telegram_subscriptions").select("status").eq("status", "active"),
  ]);

  const rows = (purchases.data ?? []) as {
    amount_total: number | null;
    status: string;
    created_at: string;
  }[];
  // A "sale" is a paid purchase with a real amount. Manually granted (free)
  // course unlocks have amount_total = 0 and must NOT count as sales/revenue.
  const paid = rows.filter((r) => r.status === "paid" && (r.amount_total ?? 0) > 0);
  const revenueCents = paid.reduce((sum, r) => sum + (r.amount_total ?? 0), 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);

  const revenueTodayCents = paid
    .filter((r) => new Date(r.created_at) >= startOfToday)
    .reduce((s, r) => s + (r.amount_total ?? 0), 0);
  const revenue30dCents = paid
    .filter((r) => new Date(r.created_at) >= since30)
    .reduce((s, r) => s + (r.amount_total ?? 0), 0);

  const memberCount = members.count ?? 0;
  const paidCount = paid.length;

  return {
    revenueCents,
    revenueTodayCents,
    revenue30dCents,
    aovCents: paidCount > 0 ? Math.round(revenueCents / paidCount) : 0,
    paidCount,
    pendingCount: rows.length - paidCount,
    leadCount: leads.count ?? 0,
    memberCount,
    courseCount: courses.count ?? 0,
    telegramActive: (telegram.data ?? []).length,
    conversionRate: memberCount > 0 ? Math.round((paidCount / memberCount) * 1000) / 10 : 0,
  };
}

export type CategoryDatum = { label: string; value: number };

export type AdminOverview = {
  // Revenue (course sales — paid rows with amount > 0)
  revenueCents: number;
  revenueTodayCents: number;
  revenue30dCents: number;
  aovCents: number;
  paidCount: number;
  pendingCount: number;
  // Audience
  memberCount: number;
  leadCount: number;
  courseCount: number;
  conversionRate: number;
  onboardingComplete: number;
  onboardingRate: number;
  // VIP / Telegram (MRR is an estimate: active × 9€/mo, since the plan price
  // isn't stored per row — labelled as such in the UI).
  telegramActive: number;
  vipMrrCentsEst: number;
  // Community / engagement
  newsletterConfirmed: number;
  newsletterPending: number;
  reviewCount: number;
  reviewAvg: number;
  completedLessons: number;
  activeLearners: number;
  affiliateEarnedCents: number;
  affiliatePaidCents: number;
  // Breakdowns for charts
  revenueByCourse: { slug: string; title: string; cents: number }[];
  leadsBySource: CategoryDatum[];
};

/** One comprehensive read for the admin overview dashboard. */
export async function getAdminOverview(): Promise<AdminOverview> {
  const empty: AdminOverview = {
    revenueCents: 0,
    revenueTodayCents: 0,
    revenue30dCents: 0,
    aovCents: 0,
    paidCount: 0,
    pendingCount: 0,
    memberCount: 0,
    leadCount: 0,
    courseCount: 0,
    conversionRate: 0,
    onboardingComplete: 0,
    onboardingRate: 0,
    telegramActive: 0,
    vipMrrCentsEst: 0,
    newsletterConfirmed: 0,
    newsletterPending: 0,
    reviewCount: 0,
    reviewAvg: 0,
    completedLessons: 0,
    activeLearners: 0,
    affiliateEarnedCents: 0,
    affiliatePaidCents: 0,
    revenueByCourse: [],
    leadsBySource: [],
  };
  const admin = getSupabaseAdminClient();
  if (!admin) return empty;

  const [
    purchases,
    leads,
    members,
    onboarded,
    courses,
    telegram,
    newsConfirmed,
    newsPending,
    reviews,
    referrals,
    progress,
  ] = await Promise.all([
    admin.from("purchases").select("amount_total, status, created_at, course_slug"),
    admin.from("leads").select("source"),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("onboarding_complete", true),
    admin.from("courses").select("slug, title"),
    admin.from("telegram_subscriptions").select("status").eq("status", "active"),
    admin
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),
    admin
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("course_reviews").select("rating").eq("is_published", true),
    admin.from("referrals").select("commission_cents, status"),
    admin.from("lesson_progress").select("user_id"),
  ]);

  const rows = (purchases.data ?? []) as {
    amount_total: number | null;
    status: string;
    created_at: string;
    course_slug: string;
  }[];
  const paid = rows.filter((r) => r.status === "paid" && (r.amount_total ?? 0) > 0);
  const revenueCents = paid.reduce((s, r) => s + (r.amount_total ?? 0), 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const revenueTodayCents = paid
    .filter((r) => new Date(r.created_at) >= startOfToday)
    .reduce((s, r) => s + (r.amount_total ?? 0), 0);
  const revenue30dCents = paid
    .filter((r) => new Date(r.created_at) >= since30)
    .reduce((s, r) => s + (r.amount_total ?? 0), 0);

  // Revenue by course (top 6, rest folded into "Weitere").
  const titleBySlug = new Map(
    ((courses.data ?? []) as { slug: string; title: string }[]).map((c) => [c.slug, c.title])
  );
  const byCourse = new Map<string, number>();
  for (const r of paid) byCourse.set(r.course_slug, (byCourse.get(r.course_slug) ?? 0) + (r.amount_total ?? 0));
  const sortedCourses = [...byCourse.entries()].sort((a, b) => b[1] - a[1]);
  const topCourses = sortedCourses.slice(0, 6).map(([slug, cents]) => ({
    slug,
    title: titleBySlug.get(slug) ?? slug,
    cents,
  }));
  const restCents = sortedCourses.slice(6).reduce((s, [, c]) => s + c, 0);
  if (restCents > 0) topCourses.push({ slug: "__rest__", title: "Weitere", cents: restCents });

  // Leads by source.
  const sourceCounts = new Map<string, number>();
  for (const l of (leads.data ?? []) as { source: string }[]) {
    sourceCounts.set(l.source, (sourceCounts.get(l.source) ?? 0) + 1);
  }
  const SOURCE_LABELS: Record<string, string> = {
    newsletter: "Newsletter",
    webinar: "Webinar",
    community: "Community",
  };
  const leadsBySource = [...sourceCounts.entries()]
    .map(([source, count]) => ({ label: SOURCE_LABELS[source] ?? source, value: count }))
    .sort((a, b) => b.value - a.value);

  const ratings = ((reviews.data ?? []) as { rating: number }[]).map((r) => r.rating);
  const reviewAvg =
    ratings.length > 0 ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10 : 0;

  let affiliateEarnedCents = 0;
  let affiliatePaidCents = 0;
  for (const ref of (referrals.data ?? []) as { commission_cents: number | null; status: string }[]) {
    const c = ref.commission_cents ?? 0;
    if (ref.status === "approved" || ref.status === "paid") affiliateEarnedCents += c;
    if (ref.status === "paid") affiliatePaidCents += c;
  }

  const learnerSet = new Set(
    ((progress.data ?? []) as { user_id: string }[]).map((p) => p.user_id)
  );

  const memberCount = members.count ?? 0;
  const onboardingComplete = onboarded.count ?? 0;
  const paidCount = paid.length;
  const telegramActive = (telegram.data ?? []).length;
  const leadCount = (leads.data ?? []).length;

  return {
    revenueCents,
    revenueTodayCents,
    revenue30dCents,
    aovCents: paidCount > 0 ? Math.round(revenueCents / paidCount) : 0,
    paidCount,
    pendingCount: rows.length - paidCount,
    memberCount,
    leadCount,
    courseCount: (courses.data ?? []).length,
    conversionRate: memberCount > 0 ? Math.round((paidCount / memberCount) * 1000) / 10 : 0,
    onboardingComplete,
    onboardingRate: memberCount > 0 ? Math.round((onboardingComplete / memberCount) * 100) : 0,
    telegramActive,
    vipMrrCentsEst: telegramActive * 900,
    newsletterConfirmed: newsConfirmed.count ?? 0,
    newsletterPending: newsPending.count ?? 0,
    reviewCount: ratings.length,
    reviewAvg,
    completedLessons: (progress.data ?? []).length,
    activeLearners: learnerSet.size,
    affiliateEarnedCents,
    affiliatePaidCents,
    revenueByCourse: topCourses,
    leadsBySource,
  };
}

export async function getRecentPurchases(limit = 8): Promise<AdminPurchase[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as AdminPurchase[];
}

export async function getRecentLeads(limit = 8): Promise<AdminLead[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as AdminLead[];
}

/** Revenue grouped by day for the last `days` days (oldest → newest). */
export async function getRevenueSeries(
  days = 14
): Promise<{ date: string; cents: number }[]> {
  const admin = getSupabaseAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  if (admin) {
    const { data } = await admin
      .from("purchases")
      .select("amount_total, created_at, status")
      .eq("status", "paid")
      .gte("created_at", since.toISOString());

    for (const row of (data ?? []) as {
      amount_total: number | null;
      created_at: string;
    }[]) {
      const key = row.created_at.slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + (row.amount_total ?? 0));
      }
    }
  }

  return Array.from(buckets.entries()).map(([date, cents]) => ({ date, cents }));
}
