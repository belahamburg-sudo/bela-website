/**
 * Live database & infrastructure metrics from the Supabase Prometheus endpoint
 * (`/customer/v1/privileged/metrics`, Basic auth with the service-role key).
 *
 * The endpoint is a point-in-time scrape, so rate-based figures (CPU %, TPS) are
 * derived from two samples taken a short interval apart. Everything is read
 * server-side only — the service-role key never reaches the client.
 */

export type SupabaseMetrics = {
  configured: boolean;
  // Gauges (0–100)
  cpuPct: number | null;
  ramPct: number;
  diskPct: number;
  connectionsPct: number;
  cacheHitPct: number;
  // Absolute values
  ramUsedBytes: number;
  ramTotalBytes: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  connections: number;
  maxConnections: number;
  dbSizeBytes: number;
  tps: number | null;
  commitsTotal: number;
  rollbacksTotal: number;
  authUsers: number;
  realtimeSubscriptions: number;
};

const EMPTY: SupabaseMetrics = {
  configured: false,
  cpuPct: null,
  ramPct: 0,
  diskPct: 0,
  connectionsPct: 0,
  cacheHitPct: 0,
  ramUsedBytes: 0,
  ramTotalBytes: 0,
  diskUsedBytes: 0,
  diskTotalBytes: 0,
  connections: 0,
  maxConnections: 0,
  dbSizeBytes: 0,
  tps: null,
  commitsTotal: 0,
  rollbacksTotal: 0,
  authUsers: 0,
  realtimeSubscriptions: 0,
};

async function scrape(): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;
  const url = `${base.replace(/\/$/, "")}/customer/v1/privileged/metrics`;
  const auth = Buffer.from(`service_role:${key}`).toString("base64");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      headers: { authorization: `Basic ${auth}` },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Sum all samples of a metric, optionally filtered to lines whose label set contains `contains`. */
function sum(text: string, name: string, contains?: string): number {
  const re = new RegExp(`^${name}(\\{[^}]*\\})?\\s+([-0-9.eE+]+)`);
  let total = 0;
  for (const line of text.split("\n")) {
    if (line.charCodeAt(0) === 35 /* # */ || !line.startsWith(name)) continue;
    if (contains && !line.includes(contains)) continue;
    const m = re.exec(line);
    if (m) {
      const v = parseFloat(m[2]);
      if (!Number.isNaN(v)) total += v;
    }
  }
  return total;
}

/** First matching sample of a metric (optionally label-filtered). */
function first(text: string, name: string, contains?: string): number {
  const re = new RegExp(`^${name}(\\{[^}]*\\})?\\s+([-0-9.eE+]+)`);
  for (const line of text.split("\n")) {
    if (line.charCodeAt(0) === 35 || !line.startsWith(name)) continue;
    if (contains && !line.includes(contains)) continue;
    const m = re.exec(line);
    if (m) {
      const v = parseFloat(m[2]);
      if (!Number.isNaN(v)) return v;
    }
  }
  return 0;
}

const pct = (used: number, total: number) => (total > 0 ? (used / total) * 100 : 0);

export async function getSupabaseMetrics(): Promise<SupabaseMetrics> {
  const sample1 = await scrape();
  if (!sample1) return EMPTY;

  // Second sample (for CPU% and TPS rates). Best-effort — gauges still work
  // without it.
  const t1 = Date.now();
  const cpuIdle1 = sum(sample1, "node_cpu_seconds_total", 'mode="idle"');
  const cpuTotal1 = sum(sample1, "node_cpu_seconds_total");
  const commits1 = first(sample1, "pg_stat_database_xact_commit_total");

  await new Promise((r) => setTimeout(r, 800));
  const sample2 = await scrape();
  const t2 = Date.now();

  let cpuPct: number | null = null;
  let tps: number | null = null;
  if (sample2) {
    const cpuIdle2 = sum(sample2, "node_cpu_seconds_total", 'mode="idle"');
    const cpuTotal2 = sum(sample2, "node_cpu_seconds_total");
    const dTotal = cpuTotal2 - cpuTotal1;
    const dIdle = cpuIdle2 - cpuIdle1;
    if (dTotal > 0) cpuPct = Math.max(0, Math.min(100, (1 - dIdle / dTotal) * 100));

    const commits2 = first(sample2, "pg_stat_database_xact_commit_total");
    const dt = (t2 - t1) / 1000;
    if (dt > 0) tps = Math.max(0, (commits2 - commits1) / dt);
  }

  const ramTotal = first(sample1, "node_memory_MemTotal_bytes");
  const ramAvail = first(sample1, "node_memory_MemAvailable_bytes");
  const ramUsed = Math.max(0, ramTotal - ramAvail);

  const diskTotal = first(sample1, "node_filesystem_size_bytes", 'mountpoint="/"');
  const diskAvail = first(sample1, "node_filesystem_avail_bytes", 'mountpoint="/"');
  const diskUsed = Math.max(0, diskTotal - diskAvail);

  const connections = sum(sample1, "connection_stats_connection_count");
  const maxConnections = first(sample1, "max_connections_connection_count");

  const blksHit = first(sample1, "pg_stat_database_blks_hit_total");
  const blksRead = first(sample1, "pg_stat_database_blks_read_total");
  const cacheHitPct = blksHit + blksRead > 0 ? (blksHit / (blksHit + blksRead)) * 100 : 100;

  return {
    configured: true,
    cpuPct,
    ramPct: pct(ramUsed, ramTotal),
    diskPct: pct(diskUsed, diskTotal),
    connectionsPct: pct(connections, maxConnections),
    cacheHitPct,
    ramUsedBytes: ramUsed,
    ramTotalBytes: ramTotal,
    diskUsedBytes: diskUsed,
    diskTotalBytes: diskTotal,
    connections,
    maxConnections,
    dbSizeBytes: first(sample1, "pg_database_size_bytes", 'datname="postgres"'),
    tps,
    commitsTotal: first(sample1, "pg_stat_database_xact_commit_total"),
    rollbacksTotal: first(sample1, "pg_stat_database_xact_rollback_total"),
    authUsers: first(sample1, "auth_users_user_count"),
    realtimeSubscriptions: sum(sample1, "realtime_postgres_changes_total_subscriptions"),
  };
}
