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
