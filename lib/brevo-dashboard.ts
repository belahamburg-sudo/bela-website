import { getSupabaseAdminClient } from "./supabase";

export type BrevoDomain = {
  id: string;
  name: string;
  authenticated: boolean;
  verified: boolean;
};

export type BrevoPlan = {
  type: string;
  credits: number;
  creditsType: string;
};

export type BrevoAccount = {
  /** true = key accepted, false = key rejected (401/403), null = Brevo unreachable. */
  keyValid: boolean | null;
  email: string | null;
  plans: BrevoPlan[];
};

export type CronEmailStat = {
  job: string;
  total: number;
  lastSent: string | null;
};

export type BroadcastRecord = {
  id: string;
  template: string;
  subject: string;
  recipientCount: number;
  sentAt: string;
  sentBy: string | null;
};

export type BrevoDashboardData = {
  configured: boolean;
  apiKeySet: boolean;
  account: BrevoAccount;
  domains: BrevoDomain[];
  cronStats: CronEmailStat[];
  recentBroadcasts: BroadcastRecord[];
  totalCronEmails: number;
  totalBroadcasts: number;
  templateCount: number;
};

const EMPTY: BrevoDashboardData = {
  configured: false,
  apiKeySet: false,
  account: { keyValid: null, email: null, plans: [] },
  domains: [],
  cronStats: [],
  recentBroadcasts: [],
  totalCronEmails: 0,
  totalBroadcasts: 0,
  templateCount: 0,
};

const TEMPLATES = [
  "change-email", "checkout-abandoned", "course-completed", "course-unlocked",
  "invite-user", "magic-link", "newsletter-double-opt-in",
  "newsletter-unsubscribe-confirmed", "newsletter-welcome", "onboarding-complete",
  "password-reset", "payment-failed", "purchase-confirmation", "re-engagement",
  "reauthentication", "signup-confirmation",
  "telegram-free-welcome", "telegram-paid-welcome", "telegram-subscription-ended",
  "webinar-registration-confirmed", "webinar-reminder-1h", "webinar-reminder-24h",
];

const BREVO_API = "https://api.brevo.com/v3";

async function fetchBrevoAccount(apiKey: string): Promise<BrevoAccount> {
  try {
    const res = await fetch(`${BREVO_API}/account`, {
      headers: { "api-key": apiKey, accept: "application/json" },
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) return { keyValid: false, email: null, plans: [] };
    if (!res.ok) return { keyValid: null, email: null, plans: [] };
    const data = (await res.json()) as { email?: string; plan?: BrevoPlan[] };
    return { keyValid: true, email: data.email ?? null, plans: data.plan ?? [] };
  } catch {
    return { keyValid: null, email: null, plans: [] };
  }
}

async function fetchBrevoDomains(apiKey: string): Promise<BrevoDomain[]> {
  try {
    const res = await fetch(`${BREVO_API}/senders/domains`, {
      headers: { "api-key": apiKey, accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      domains?: { id: string | number; domain_name: string; authenticated: boolean; verified: boolean }[];
    };
    return (data.domains ?? []).map((d) => ({
      id: String(d.id),
      name: d.domain_name,
      authenticated: d.authenticated,
      verified: d.verified,
    }));
  } catch {
    return [];
  }
}

export async function getBrevoDashboard(): Promise<BrevoDashboardData> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return EMPTY;

  const admin = getSupabaseAdminClient();

  const [account, domains, cronStats, broadcasts] = await Promise.all([
    fetchBrevoAccount(apiKey),
    fetchBrevoDomains(apiKey),
    loadCronStats(admin),
    loadBroadcasts(admin),
  ]);

  const totalCronEmails = cronStats.reduce((s, c) => s + c.total, 0);

  return {
    configured: true,
    apiKeySet: true,
    account,
    domains,
    cronStats,
    recentBroadcasts: broadcasts,
    totalCronEmails,
    totalBroadcasts: broadcasts.length,
    templateCount: TEMPLATES.length,
  };
}

async function loadCronStats(admin: ReturnType<typeof getSupabaseAdminClient>): Promise<CronEmailStat[]> {
  if (!admin) return [];
  try {
    const { data } = await admin
      .from("email_cron_log")
      .select("job, sent_at");
    if (!data || !Array.isArray(data)) return [];

    const map = new Map<string, { total: number; lastSent: string | null }>();
    for (const row of data as { job: string; sent_at: string }[]) {
      const existing = map.get(row.job);
      if (existing) {
        existing.total += 1;
        if (!existing.lastSent || row.sent_at > existing.lastSent) existing.lastSent = row.sent_at;
      } else {
        map.set(row.job, { total: 1, lastSent: row.sent_at });
      }
    }

    return [...map.entries()]
      .map(([job, s]) => ({ job, total: s.total, lastSent: s.lastSent }))
      .sort((a, b) => b.total - a.total);
  } catch {
    return [];
  }
}

async function loadBroadcasts(admin: ReturnType<typeof getSupabaseAdminClient>): Promise<BroadcastRecord[]> {
  if (!admin) return [];
  try {
    const { data } = await admin
      .from("broadcasts")
      .select("id, template, subject, recipient_count, sent_at, sent_by")
      .order("sent_at", { ascending: false })
      .limit(20);
    if (!data) return [];
    return (data as { id: string; template: string; subject: string; recipient_count: number; sent_at: string; sent_by: string | null }[]).map((b) => ({
      id: b.id,
      template: b.template,
      subject: b.subject,
      recipientCount: b.recipient_count,
      sentAt: b.sent_at,
      sentBy: b.sent_by,
    }));
  } catch {
    return [];
  }
}

export { TEMPLATES };
