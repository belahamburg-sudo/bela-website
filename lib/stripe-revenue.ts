import { getStripeClient } from "./stripe";
import { getSupabaseAdminClient } from "./supabase";

/**
 * Real revenue straight from Stripe (source of truth for money), classified by
 * source: one-time course payments (via completed Checkout Sessions) and
 * recurring VIP revenue (via paid subscription invoices — first payment + every
 * renewal). The DB `purchases` table is NOT used here, so manual 0€ grants and
 * a half-broken webhook never distort the numbers.
 */

export type StripeRevenue = {
  configured: boolean;
  totalCents: number;
  todayCents: number;
  last30dCents: number;
  paymentCount: number;
  payingCustomers: number;
  aovCents: number;
  series: { date: string; cents: number }[];
  bySource: { label: string; cents: number }[];
};

const TELEGRAM_LABEL = "Telegram VIP";
const MAX_ITEMS = 2000; // safety cap on pagination

function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function seriesKeys(days: number): string[] {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);
  const keys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export async function getStripeRevenue(days = 30): Promise<StripeRevenue> {
  const keys = seriesKeys(days);
  const empty: StripeRevenue = {
    configured: false,
    totalCents: 0,
    todayCents: 0,
    last30dCents: 0,
    paymentCount: 0,
    payingCustomers: 0,
    aovCents: 0,
    series: keys.map((date) => ({ date, cents: 0 })),
    bySource: [],
  };

  const stripe = getStripeClient();
  if (!stripe) return empty;

  // slug → title for nicer source labels (all courses, incl. drafts).
  const titleBySlug = new Map<string, string>();
  try {
    const admin = getSupabaseAdminClient();
    if (admin) {
      const { data } = await admin.from("courses").select("slug, title");
      for (const c of (data ?? []) as { slug: string; title: string }[]) {
        titleBySlug.set(c.slug, c.title);
      }
    }
  } catch {
    // labels fall back to the slug
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);

  const buckets = new Map<string, number>(keys.map((k) => [k, 0]));
  const bySource = new Map<string, number>();
  const customers = new Set<string>();
  let totalCents = 0;
  let todayCents = 0;
  let last30dCents = 0;
  let paymentCount = 0;

  function record(amount: number, createdUnix: number, label: string, customer: string | null) {
    if (!amount || amount <= 0) return;
    const d = new Date(createdUnix * 1000);
    totalCents += amount;
    if (d >= startOfToday) todayCents += amount;
    if (d >= since30) last30dCents += amount;
    const key = d.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + amount);
    bySource.set(label, (bySource.get(label) ?? 0) + amount);
    if (customer) customers.add(customer);
    paymentCount += 1;
  }

  try {
    // One-time course payments (mode=payment Checkout Sessions, paid).
    let count = 0;
    for await (const s of stripe.checkout.sessions.list({ limit: 100 })) {
      if (++count > MAX_ITEMS) break;
      if (s.mode !== "payment" || s.payment_status !== "paid") continue;
      const slug = (s.metadata?.course_slugs ?? s.metadata?.course_slug ?? "")
        .split(",")[0]
        ?.trim();
      const label = slug ? titleBySlug.get(slug) ?? slug : "Kurs";
      record(s.amount_total ?? 0, s.created, label, stripeId(s.customer));
    }

    // Recurring VIP revenue (paid subscription invoices — first + renewals).
    count = 0;
    for await (const inv of stripe.invoices.list({ limit: 100, status: "paid" })) {
      if (++count > MAX_ITEMS) break;
      if (!inv.subscription) continue;
      record(inv.amount_paid ?? 0, inv.created, TELEGRAM_LABEL, stripeId(inv.customer));
    }
  } catch {
    // On a Stripe/network error, return whatever we managed to total so far.
  }

  return {
    configured: true,
    totalCents,
    todayCents,
    last30dCents,
    paymentCount,
    payingCustomers: customers.size,
    aovCents: paymentCount > 0 ? Math.round(totalCents / paymentCount) : 0,
    series: keys.map((date) => ({ date, cents: buckets.get(date) ?? 0 })),
    bySource: [...bySource.entries()]
      .map(([label, cents]) => ({ label, cents }))
      .sort((a, b) => b.cents - a.cents),
  };
}
