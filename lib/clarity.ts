/**
 * Microsoft Clarity "Data Export" API — behaviour & UX-frustration metrics.
 * Server-side only (bearer token never reaches the client). The API is hard
 * capped at 10 requests/day and only covers the last 1–3 days, so results are
 * cached in-memory for 2h and we make a single (no-dimension) totals call.
 */

export type ClaritySignal = {
  key: string;
  label: string;
  sessionsPct: number; // % of sessions where this happened
  count: number; // raw occurrences
};

export type ClarityAnalytics = {
  configured: boolean;
  stale: boolean;
  sessions: number;
  botSessions: number;
  distinctUsers: number;
  pagesPerSession: number;
  avgScrollDepth: number; // %
  totalTime: number; // raw engagement time (Clarity unit)
  activeTime: number;
  signals: ClaritySignal[];
  fetchedAt: number;
};

const EMPTY: ClarityAnalytics = {
  configured: false,
  stale: false,
  sessions: 0,
  botSessions: 0,
  distinctUsers: 0,
  pagesPerSession: 0,
  avgScrollDepth: 0,
  totalTime: 0,
  activeTime: 0,
  signals: [],
  fetchedAt: 0,
};

const SIGNAL_LABELS: Record<string, string> = {
  RageClickCount: "Wut-Klicks",
  DeadClickCount: "Tote Klicks",
  QuickbackClick: "Schnelles Zurück",
  ExcessiveScroll: "Übermäßiges Scrollen",
  ScriptErrorCount: "Script-Fehler",
  ErrorClickCount: "Fehler-Klicks",
};

const TTL_MS = 2 * 60 * 60 * 1000; // 2h
let cache: ClarityAnalytics | null = null;

type Info = Record<string, string | number | null>;
type Metric = { metricName: string; information: Info[] };

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
}

export async function getClarityAnalytics(): Promise<ClarityAnalytics> {
  const token = process.env.CLARITY_API_TOKEN;
  if (!token) return EMPTY;

  if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      "https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3",
      { headers: { authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) {
      // Rate-limited or transient — serve the last snapshot, marked stale.
      return cache ? { ...cache, stale: true } : { ...EMPTY, configured: true };
    }

    const metrics = (await res.json()) as Metric[];
    const byName = new Map(metrics.map((m) => [m.metricName, m.information?.[0] ?? {}]));

    const traffic = byName.get("Traffic") ?? {};
    const engagement = byName.get("EngagementTime") ?? {};
    const scroll = byName.get("ScrollDepth") ?? {};

    const signals: ClaritySignal[] = Object.keys(SIGNAL_LABELS)
      .map((key) => {
        const info = byName.get(key) ?? {};
        return {
          key,
          label: SIGNAL_LABELS[key],
          sessionsPct: num(info.sessionsWithMetricPercentage),
          count: num(info.subTotal),
        };
      })
      .sort((a, b) => b.sessionsPct - a.sessionsPct);

    cache = {
      configured: true,
      stale: false,
      sessions: num(traffic.totalSessionCount),
      botSessions: num(traffic.totalBotSessionCount),
      distinctUsers: num(traffic.distinctUserCount),
      pagesPerSession: num(traffic.pagesPerSessionPercentage),
      avgScrollDepth: num(scroll.averageScrollDepth),
      totalTime: num(engagement.totalTime),
      activeTime: num(engagement.activeTime),
      signals,
      fetchedAt: Date.now(),
    };
    return cache;
  } catch {
    return cache ? { ...cache, stale: true } : { ...EMPTY, configured: true };
  }
}
