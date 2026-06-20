import { getSupabaseAdminClient } from "./supabase";

export type ResendDomain = {
  id: string;
  name: string;
  status: string;
  region: string;
  created_at: string;
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

export type ResendDashboardData = {
  configured: boolean;
  apiKeySet: boolean;
  domains: ResendDomain[];
  cronStats: CronEmailStat[];
  recentBroadcasts: BroadcastRecord[];
  totalCronEmails: number;
  totalBroadcasts: number;
  templateCount: number;
};

const EMPTY: ResendDashboardData = {
  configured: false,
  apiKeySet: false,
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

async function fetchResendDomains(apiKey: string): Promise<ResendDomain[]> {
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: ResendDomain[] };
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function fetchResendApiKeys(apiKey: string): Promise<{ id: string; name: string; created_at: string }[]> {
  try {
    const res = await fetch("https://api.resend.com/api-keys", {
      headers: { authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { id: string; name: string; created_at: string }[] };
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getResendDashboard(): Promise<ResendDashboardData> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return EMPTY;

  const admin = getSupabaseAdminClient();

  const [domains, cronStats, broadcasts] = await Promise.all([
    fetchResendDomains(apiKey),
    loadCronStats(admin),
    loadBroadcasts(admin),
  ]);

  const totalCronEmails = cronStats.reduce((s, c) => s + c.total, 0);

  return {
    configured: true,
    apiKeySet: true,
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
