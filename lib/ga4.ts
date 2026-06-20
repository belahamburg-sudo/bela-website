import crypto from "crypto";

/**
 * Google Analytics 4 (GA4) Data API — traffic & audience metrics.
 * Auth is dependency-free: we sign a service-account JWT with Node crypto and
 * exchange it for an access token (cached). Gated on GA4_PROPERTY_ID +
 * GOOGLE_SERVICE_ACCOUNT_JSON (raw or base64). Server-side only.
 */

export type NameValue = { label: string; value: number };

export type Ga4Analytics = {
  configured: boolean; // env present
  ok: boolean; // data fetched successfully
  activeUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDurationSec: number;
  bounceRatePct: number;
  series: { date: string; users: number; sessions: number }[];
  topPages: NameValue[];
  channels: NameValue[];
  countries: NameValue[];
  devices: NameValue[];
};

type ServiceAccount = { client_email: string; private_key: string; token_uri: string };

function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const sa = JSON.parse(json);
    if (!sa.client_email || !sa.private_key) return null;
    return {
      client_email: sa.client_email,
      private_key: sa.private_key,
      token_uri: sa.token_uri || "https://oauth2.googleapis.com/token",
    };
  } catch {
    return null;
  }
}

let tokenCache: { token: string; exp: number } | null = null;

async function getAccessToken(sa: ServiceAccount): Promise<string | null> {
  if (tokenCache && tokenCache.exp - 60 > Math.floor(Date.now() / 1000)) {
    return tokenCache.token;
  }
  const now = Math.floor(Date.now() / 1000);
  const enc = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const header = enc({ alg: "RS256", typ: "JWT" });
  const claims = enc({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  });
  try {
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(`${header}.${claims}`);
    const signature = signer.sign(sa.private_key).toString("base64url");
    const assertion = `${header}.${claims}.${signature}`;

    const res = await fetch(sa.token_uri, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!j.access_token) return null;
    tokenCache = { token: j.access_token, exp: now + (j.expires_in ?? 3600) };
    return j.access_token;
  } catch {
    return null;
  }
}

type GaRow = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };
type GaReport = { rows?: GaRow[] };

async function runReport(
  propertyId: string,
  token: string,
  body: Record<string, unknown>
): Promise<GaReport | null> {
  try {
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as GaReport;
  } catch {
    return null;
  }
}

const n = (v: string | undefined) => {
  const x = parseFloat(v ?? "0");
  return Number.isNaN(x) ? 0 : x;
};

function toNameValues(report: GaReport | null): NameValue[] {
  return (report?.rows ?? []).map((r) => ({
    label: r.dimensionValues?.[0]?.value ?? "—",
    value: n(r.metricValues?.[0]?.value),
  }));
}

export type Ga4Extended = {
  configured: boolean;
  ok: boolean;
  landingPages: NameValue[];
  newVsReturning: NameValue[];
  browsers: NameValue[];
  operatingSystems: NameValue[];
  referrers: NameValue[];
  events: NameValue[];
  sessionSeries: { date: string; sessions: number }[];
};

const EMPTY: Ga4Analytics = {
  configured: false,
  ok: false,
  activeUsers: 0,
  sessions: 0,
  pageViews: 0,
  avgSessionDurationSec: 0,
  bounceRatePct: 0,
  series: [],
  topPages: [],
  channels: [],
  countries: [],
  devices: [],
};

const EMPTY_EXT: Ga4Extended = {
  configured: false,
  ok: false,
  landingPages: [],
  newVsReturning: [],
  browsers: [],
  operatingSystems: [],
  referrers: [],
  events: [],
  sessionSeries: [],
};

let cache: { data: Ga4Analytics; at: number } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 min

export async function getGa4Analytics(): Promise<Ga4Analytics> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const sa = loadServiceAccount();
  if (!propertyId || !sa) return EMPTY;

  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  const token = await getAccessToken(sa);
  if (!token) return { ...EMPTY, configured: true, ok: false };

  const range = [{ startDate: "30daysAgo", endDate: "today" }];
  const [totals, series, pages, channels, countries, devices] = await Promise.all([
    runReport(propertyId, token, {
      dateRanges: range,
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 8,
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 8,
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
  ]);

  if (!totals) return { ...EMPTY, configured: true, ok: false };

  const t = totals.rows?.[0]?.metricValues ?? [];
  const data: Ga4Analytics = {
    configured: true,
    ok: true,
    activeUsers: n(t[0]?.value),
    sessions: n(t[1]?.value),
    pageViews: n(t[2]?.value),
    avgSessionDurationSec: n(t[3]?.value),
    bounceRatePct: n(t[4]?.value) * 100,
    series: (series?.rows ?? []).map((r) => {
      const d = r.dimensionValues?.[0]?.value ?? "";
      const date = d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d;
      return { date, users: n(r.metricValues?.[0]?.value), sessions: n(r.metricValues?.[1]?.value) };
    }),
    topPages: toNameValues(pages),
    channels: toNameValues(channels),
    countries: toNameValues(countries),
    devices: toNameValues(devices),
  };
  cache = { data, at: Date.now() };
  return data;
}

let extCache: { data: Ga4Extended; at: number } | null = null;

export async function getGa4Extended(): Promise<Ga4Extended> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const sa = loadServiceAccount();
  if (!propertyId || !sa) return EMPTY_EXT;

  if (extCache && Date.now() - extCache.at < TTL_MS) return extCache.data;

  const token = await getAccessToken(sa);
  if (!token) return { ...EMPTY_EXT, configured: true, ok: false };

  const range = [{ startDate: "30daysAgo", endDate: "today" }];
  const [landing, newRet, browsers, os, referrers, events, sessionSeries] = await Promise.all([
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "landingPagePlusQueryString" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "newVsReturning" }],
      metrics: [{ name: "activeUsers" }],
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "operatingSystem" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 12,
    }),
    runReport(propertyId, token, {
      dateRanges: range,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
  ]);

  const NEW_RET_LABELS: Record<string, string> = { new: "Neue Nutzer", returning: "Wiederkehrend" };

  const data: Ga4Extended = {
    configured: true,
    ok: true,
    landingPages: toNameValues(landing).map((v) => ({
      ...v,
      label: v.label === "(not set)" ? "(direkt)" : v.label,
    })),
    newVsReturning: toNameValues(newRet).map((v) => ({
      ...v,
      label: NEW_RET_LABELS[v.label] ?? v.label,
    })),
    browsers: toNameValues(browsers),
    operatingSystems: toNameValues(os),
    referrers: toNameValues(referrers).map((v) => ({
      ...v,
      label: v.label === "(direct)" ? "(direkt)" : v.label,
    })),
    events: toNameValues(events),
    sessionSeries: (sessionSeries?.rows ?? []).map((r) => {
      const d = r.dimensionValues?.[0]?.value ?? "";
      const date = d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d;
      return { date, sessions: n(r.metricValues?.[0]?.value) };
    }),
  };
  extCache = { data, at: Date.now() };
  return data;
}
