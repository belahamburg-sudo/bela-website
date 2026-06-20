import { getStripeClient } from "./stripe";

export type StripeBalance = {
  available: { amount: number; currency: string }[];
  pending: { amount: number; currency: string }[];
};

export type StripeSubSummary = {
  active: number;
  pastDue: number;
  canceled: number;
  trialing: number;
  incomplete: number;
  mrrCents: number;
};

export type StripeCharge = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string | null;
  description: string | null;
  created: number;
  receiptUrl: string | null;
  refunded: boolean;
  disputed: boolean;
};

export type StripeRefund = {
  id: string;
  amount: number;
  currency: string;
  reason: string | null;
  status: string;
  created: number;
  chargeId: string | null;
};

export type StripePayout = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: number;
  created: number;
  method: string;
};

export type StripeProduct = {
  id: string;
  name: string;
  active: boolean;
  defaultPrice: number | null;
  currency: string | null;
  interval: string | null;
  created: number;
};

export type StripeDispute = {
  id: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  created: number;
};

export type StripeDashboardData = {
  configured: boolean;
  balance: StripeBalance;
  subscriptions: StripeSubSummary;
  charges: StripeCharge[];
  refunds: StripeRefund[];
  payouts: StripePayout[];
  products: StripeProduct[];
  disputes: StripeDispute[];
  customerCount: number;
  totalChargeVolume: number;
  totalRefundVolume: number;
};

const EMPTY: StripeDashboardData = {
  configured: false,
  balance: { available: [], pending: [] },
  subscriptions: { active: 0, pastDue: 0, canceled: 0, trialing: 0, incomplete: 0, mrrCents: 0 },
  charges: [],
  refunds: [],
  payouts: [],
  products: [],
  disputes: [],
  customerCount: 0,
  totalChargeVolume: 0,
  totalRefundVolume: 0,
};

function stripeId(val: string | { id: string } | null | undefined): string | null {
  if (!val) return null;
  return typeof val === "string" ? val : val.id;
}

export async function getStripeDashboard(): Promise<StripeDashboardData> {
  const stripe = getStripeClient();
  if (!stripe) return EMPTY;

  try {
    const [
      balanceRes,
      activeSubsRes,
      pastDueSubsRes,
      canceledSubsRes,
      trialingSubsRes,
      incompleteSubsRes,
      chargesRes,
      refundsRes,
      payoutsRes,
      productsRes,
      disputesRes,
      customersRes,
    ] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.subscriptions.list({ status: "active", limit: 100 }),
      stripe.subscriptions.list({ status: "past_due", limit: 100 }),
      stripe.subscriptions.list({ status: "canceled", limit: 20 }),
      stripe.subscriptions.list({ status: "trialing", limit: 100 }),
      stripe.subscriptions.list({ status: "incomplete", limit: 100 }),
      stripe.charges.list({ limit: 25 }),
      stripe.refunds.list({ limit: 15 }),
      stripe.payouts.list({ limit: 10 }),
      stripe.products.list({ limit: 50, active: true, expand: ["data.default_price"] }),
      stripe.disputes.list({ limit: 10 }),
      stripe.customers.list({ limit: 1 }),
    ]);

    const mrrCents = activeSubsRes.data.reduce((sum, sub) => {
      const item = sub.items?.data?.[0];
      if (!item?.price?.unit_amount) return sum;
      const amount = item.price.unit_amount;
      const interval = item.price.recurring?.interval;
      if (interval === "year") return sum + Math.round(amount / 12);
      return sum + amount;
    }, 0);

    const balance: StripeBalance = {
      available: (balanceRes.available ?? []).map((b) => ({ amount: b.amount, currency: b.currency })),
      pending: (balanceRes.pending ?? []).map((b) => ({ amount: b.amount, currency: b.currency })),
    };

    const charges: StripeCharge[] = chargesRes.data.map((c) => ({
      id: c.id,
      amount: c.amount,
      currency: c.currency,
      status: c.status,
      customerEmail: (c as unknown as { billing_details?: { email?: string } }).billing_details?.email ?? null,
      description: c.description,
      created: c.created,
      receiptUrl: c.receipt_url ?? null,
      refunded: c.refunded,
      disputed: c.disputed,
    }));

    const refunds: StripeRefund[] = refundsRes.data.map((r) => ({
      id: r.id,
      amount: r.amount,
      currency: r.currency,
      reason: r.reason ?? null,
      status: r.status ?? "unknown",
      created: r.created,
      chargeId: stripeId(r.charge),
    }));

    const payouts: StripePayout[] = payoutsRes.data.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      arrivalDate: p.arrival_date,
      created: p.created,
      method: p.method,
    }));

    const products: StripeProduct[] = productsRes.data.map((p) => {
      const dp = p.default_price && typeof p.default_price !== "string" ? p.default_price : null;
      return {
        id: p.id,
        name: p.name,
        active: p.active,
        defaultPrice: dp?.unit_amount ?? null,
        currency: dp?.currency ?? null,
        interval: dp?.recurring?.interval ?? null,
        created: p.created,
      };
    });

    const disputes: StripeDispute[] = disputesRes.data.map((d) => ({
      id: d.id,
      amount: d.amount,
      currency: d.currency,
      reason: d.reason,
      status: d.status,
      created: d.created,
    }));

    const totalChargeVolume = charges
      .filter((c) => c.status === "succeeded")
      .reduce((s, c) => s + c.amount, 0);
    const totalRefundVolume = refunds.reduce((s, r) => s + r.amount, 0);

    return {
      configured: true,
      balance,
      subscriptions: {
        active: activeSubsRes.data.length,
        pastDue: pastDueSubsRes.data.length,
        canceled: canceledSubsRes.data.length,
        trialing: trialingSubsRes.data.length,
        incomplete: incompleteSubsRes.data.length,
        mrrCents,
      },
      charges,
      refunds,
      payouts,
      products,
      disputes,
      customerCount: customersRes.data.length > 0 ? (customersRes as unknown as { total_count?: number }).total_count ?? 0 : 0,
      totalChargeVolume,
      totalRefundVolume,
    };
  } catch (err) {
    console.error("[stripe-dashboard]", err instanceof Error ? err.message : err);
    return { ...EMPTY, configured: true };
  }
}
