import { getSupabaseAdminClient } from "./supabase";

/**
 * Affiliate data layer (tables from migration_013). Every query tolerates the
 * tables being absent (migration not yet run) by returning null/empty, so the
 * site keeps building and running before the migration is applied.
 */

export type AffiliateTier = {
  id: string;
  name: string;
  minSales: number;
  cashPercent: number;
  fixedCashCents: number;
  selfDiscountPercent: number;
  perks: string[];
  sortOrder: number;
};

export type Affiliate = {
  userId: string;
  code: string | null;
  status: string;
  rewardType: string;
  cashPercent: number;
  fixedCashCents: number;
  selfDiscountPercent: number;
  canIssueCoupons: boolean;
  tierId: string | null;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  balanceCents: number;
  lifetimeEarnedCents: number;
  notes: string | null;
};

export type AffiliatePayout = {
  id: string;
  amountCents: number;
  status: string;
  method: string;
  note: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type AffiliateStats = {
  referralCount: number;
  paidReferralCount: number;
  earnedCents: number; // approved + paid
  pendingCents: number; // pending
  revenueBroughtCents: number;
};

export type AffiliateSignup = {
  referredUserId: string | null;
  email: string | null;
  fullName: string | null;
  status: string | null;
  commissionCents: number;
  createdAt: string | null;
};

type DbAffiliate = {
  user_id: string;
  code: string | null;
  status: string;
  reward_type: string;
  cash_percent: number;
  fixed_cash_cents: number;
  self_discount_percent: number;
  can_issue_coupons: boolean;
  tier_id: string | null;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  balance_cents: number;
  lifetime_earned_cents: number;
  notes: string | null;
};

const AFFILIATE_COLS =
  "user_id, code, status, reward_type, cash_percent, fixed_cash_cents, self_discount_percent, can_issue_coupons, tier_id, stripe_account_id, stripe_onboarded, balance_cents, lifetime_earned_cents, notes";

function mapAffiliate(r: DbAffiliate): Affiliate {
  return {
    userId: r.user_id,
    code: r.code,
    status: r.status,
    rewardType: r.reward_type,
    cashPercent: r.cash_percent,
    fixedCashCents: r.fixed_cash_cents,
    selfDiscountPercent: r.self_discount_percent,
    canIssueCoupons: r.can_issue_coupons,
    tierId: r.tier_id,
    stripeAccountId: r.stripe_account_id,
    stripeOnboarded: r.stripe_onboarded,
    balanceCents: r.balance_cents,
    lifetimeEarnedCents: r.lifetime_earned_cents,
    notes: r.notes,
  };
}

export async function getAffiliateForUser(userId: string): Promise<Affiliate | null> {
  const admin = getSupabaseAdminClient();
  if (!admin || !userId) return null;
  try {
    const { data, error } = await admin
      .from("affiliates")
      .select(AFFILIATE_COLS)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return mapAffiliate(data as DbAffiliate);
  } catch {
    return null;
  }
}

export async function getAffiliateTiers(): Promise<AffiliateTier[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];
  try {
    const { data } = await admin
      .from("affiliate_tiers")
      .select("*")
      .order("sort_order", { ascending: true });
    return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
      id: r.id as string,
      name: r.name as string,
      minSales: (r.min_sales as number) ?? 0,
      cashPercent: (r.cash_percent as number) ?? 0,
      fixedCashCents: (r.fixed_cash_cents as number) ?? 0,
      selfDiscountPercent: (r.self_discount_percent as number) ?? 0,
      perks: Array.isArray(r.perks) ? (r.perks as string[]) : [],
      sortOrder: (r.sort_order as number) ?? 0,
    }));
  } catch {
    return [];
  }
}

/** Earnings/referral stats for an affiliate, derived from the referrals table. */
export async function getAffiliateStats(userId: string): Promise<AffiliateStats> {
  const empty: AffiliateStats = {
    referralCount: 0,
    paidReferralCount: 0,
    earnedCents: 0,
    pendingCents: 0,
    revenueBroughtCents: 0,
  };
  const admin = getSupabaseAdminClient();
  if (!admin || !userId) return empty;
  try {
    const { data } = await admin
      .from("referrals")
      .select("commission_cents, amount_total, status")
      .eq("referrer_user_id", userId);
    const rows = (data ?? []) as {
      commission_cents: number | null;
      amount_total: number | null;
      status: string | null;
    }[];
    return {
      referralCount: rows.length,
      paidReferralCount: rows.filter((r) => r.status === "paid" || r.status === "approved").length,
      earnedCents: rows
        .filter((r) => r.status === "approved" || r.status === "paid")
        .reduce((s, r) => s + (r.commission_cents ?? 0), 0),
      pendingCents: rows
        .filter((r) => r.status === "pending")
        .reduce((s, r) => s + (r.commission_cents ?? 0), 0),
      revenueBroughtCents: rows.reduce((s, r) => s + (r.amount_total ?? 0), 0),
    };
  } catch {
    return empty;
  }
}

/**
 * Who signed up via this affiliate's link/code. Reads `referrals` for the
 * affiliate, then joins `profiles` (by referred_user_id) for name/email.
 * Tolerates missing tables/columns by returning [].
 */
export async function getAffiliateSignups(userId: string): Promise<AffiliateSignup[]> {
  const admin = getSupabaseAdminClient();
  if (!admin || !userId) return [];
  try {
    const { data, error } = await admin
      .from("referrals")
      .select("referred_user_id, status, commission_cents, created_at")
      .eq("referrer_user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return [];

    const rows = (data ?? []) as {
      referred_user_id: string | null;
      status: string | null;
      commission_cents: number | null;
      created_at: string | null;
    }[];
    if (rows.length === 0) return [];

    const ids = Array.from(
      new Set(rows.map((r) => r.referred_user_id).filter((id): id is string => Boolean(id)))
    );
    const byId = new Map<string, { email: string | null; full_name: string | null }>();
    if (ids.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", ids);
      for (const p of (profiles ?? []) as {
        id: string;
        email: string | null;
        full_name: string | null;
      }[]) {
        byId.set(p.id, { email: p.email, full_name: p.full_name });
      }
    }

    return rows.map((r) => {
      const profile = r.referred_user_id ? byId.get(r.referred_user_id) : undefined;
      return {
        referredUserId: r.referred_user_id,
        email: profile?.email ?? null,
        fullName: profile?.full_name ?? null,
        status: r.status,
        commissionCents: r.commission_cents ?? 0,
        createdAt: r.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function getAffiliatePayouts(userId: string): Promise<AffiliatePayout[]> {
  const admin = getSupabaseAdminClient();
  if (!admin || !userId) return [];
  try {
    const { data } = await admin
      .from("affiliate_payouts")
      .select("id, amount_cents, status, method, note, created_at, paid_at")
      .eq("affiliate_user_id", userId)
      .order("created_at", { ascending: false });
    return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
      id: r.id as string,
      amountCents: (r.amount_cents as number) ?? 0,
      status: r.status as string,
      method: r.method as string,
      note: (r.note as string) ?? null,
      createdAt: r.created_at as string,
      paidAt: (r.paid_at as string) ?? null,
    }));
  } catch {
    return [];
  }
}

export type AdminAffiliateRow = Affiliate & {
  email: string | null;
  fullName: string | null;
  stats: AffiliateStats;
};

/** Rich rows for the admin affiliate table: profile + email + live stats. */
export async function listAffiliatesAdmin(): Promise<AdminAffiliateRow[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];
  try {
    const { data } = await admin
      .from("affiliates")
      .select(AFFILIATE_COLS)
      .order("created_at", { ascending: false });
    const affiliates = ((data ?? []) as DbAffiliate[]).map(mapAffiliate);
    if (affiliates.length === 0) return [];

    const ids = affiliates.map((a) => a.userId);
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, email, full_name")
      .in("id", ids);
    const byId = new Map<string, { email: string | null; full_name: string | null }>();
    for (const p of (profiles ?? []) as { id: string; email: string | null; full_name: string | null }[]) {
      byId.set(p.id, { email: p.email, full_name: p.full_name });
    }

    const rows = await Promise.all(
      affiliates.map(async (a) => ({
        ...a,
        email: byId.get(a.userId)?.email ?? null,
        fullName: byId.get(a.userId)?.full_name ?? null,
        stats: await getAffiliateStats(a.userId),
      }))
    );
    return rows;
  } catch {
    return [];
  }
}

/** The tier an affiliate currently qualifies for, by paid-referral count. */
export function resolveTier(
  paidReferralCount: number,
  tiers: AffiliateTier[]
): AffiliateTier | null {
  const sorted = [...tiers].sort((a, b) => a.minSales - b.minSales);
  let current: AffiliateTier | null = null;
  for (const t of sorted) {
    if (paidReferralCount >= t.minSales) current = t;
  }
  return current;
}
