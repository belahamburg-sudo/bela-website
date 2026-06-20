import { Activity, Database, HardDrive, Table2, Users, Shield } from "lucide-react";
import { PageHeader, Panel, EmptyState, AdminBadge } from "@/components/admin/ui";
import { Gauge, FunnelBars } from "@/components/admin/charts";
import { getSupabaseMetrics } from "@/lib/supabase-metrics";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatBytes(n: number): string {
  if (!n || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i > 0 && v < 10 ? 1 : 0)} ${units[i]}`;
}

function round(n: number): number {
  return Math.round(n);
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3.5">
      <p className="tac-label">{label}</p>
      <p className="mt-1.5 text-xl font-extrabold tracking-tight text-cream">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-cream/35">{sub}</p>}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 mt-10 flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300/70">{children}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

type TableCount = { name: string; count: number };

async function getTableCounts(): Promise<TableCount[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  const tables = [
    "profiles", "purchases", "leads", "courses", "lessons", "modules",
    "lesson_progress", "certificates", "course_reviews", "newsletter_subscribers",
    "telegram_subscriptions", "referrals", "affiliates", "broadcasts",
    "site_settings", "audit_log",
  ];

  const counts: TableCount[] = [];
  const results = await Promise.allSettled(
    tables.map(async (name) => {
      const { count, error } = await admin
        .from(name)
        .select("*", { count: "exact", head: true });
      if (error) return { name, count: -1 };
      return { name, count: count ?? 0 };
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") counts.push(r.value);
  }

  return counts.sort((a, b) => b.count - a.count);
}

type StorageBucket = { name: string; size: number; fileCount: number };

async function getStorageInfo(): Promise<StorageBucket[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  try {
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets) return [];

    const info: StorageBucket[] = [];
    for (const b of buckets) {
      try {
        const { data: files } = await admin.storage.from(b.name).list("", { limit: 1000 });
        const fileCount = files?.length ?? 0;
        let totalSize = 0;
        for (const f of files ?? []) {
          if (f.metadata?.size) totalSize += Number(f.metadata.size);
        }
        info.push({ name: b.name, size: totalSize, fileCount });
      } catch {
        info.push({ name: b.name, size: 0, fileCount: 0 });
      }
    }
    return info.sort((a, b) => b.size - a.size);
  } catch {
    return [];
  }
}

type AuthProviderCount = { provider: string; count: number };

async function getAuthProviders(): Promise<AuthProviderCount[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  try {
    const { data } = await admin.from("profiles").select("auth_provider");
    if (!data) return [];

    const map = new Map<string, number>();
    for (const row of data as { auth_provider: string | null }[]) {
      const p = row.auth_provider ?? "email";
      map.set(p, (map.get(p) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([provider, count]) => ({ provider, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

const TABLE_LABELS: Record<string, string> = {
  profiles: "Nutzer-Profile",
  purchases: "Käufe",
  leads: "Leads",
  courses: "Kurse",
  lessons: "Lektionen",
  modules: "Module",
  lesson_progress: "Lektionsfortschritt",
  certificates: "Zertifikate",
  course_reviews: "Bewertungen",
  newsletter_subscribers: "Newsletter",
  telegram_subscriptions: "Telegram-Abos",
  referrals: "Empfehlungen",
  affiliates: "Affiliates",
  broadcasts: "Broadcasts",
  site_settings: "Einstellungen",
  audit_log: "Audit-Log",
};

const PROVIDER_LABELS: Record<string, string> = {
  email: "E-Mail",
  google: "Google",
  github: "GitHub",
  apple: "Apple",
  phone: "Telefon",
};

export default async function AdminSystemPage() {
  const [m, tableCounts, storageBuckets, authProviders] = await Promise.all([
    getSupabaseMetrics(),
    getTableCounts(),
    getStorageInfo(),
    getAuthProviders(),
  ]);

  const cacheColor =
    m.cacheHitPct >= 95 ? "#34D399" : m.cacheHitPct >= 80 ? "#FBBF24" : "#FB7185";

  const totalRows = tableCounts.reduce((s, t) => s + (t.count >= 0 ? t.count : 0), 0);
  const totalStorage = storageBuckets.reduce((s, b) => s + b.size, 0);
  const totalFiles = storageBuckets.reduce((s, b) => s + b.fileCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="System"
        title="Datenbank & Infrastruktur"
        description="Live-Metriken, Tabellen, Storage und Auth-Provider — direkt aus Supabase."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]" />
            Live
          </span>
        }
      />

      {!m.configured ? (
        <div className="mt-8">
          <Panel>
            <EmptyState
              icon={Database}
              title="Metrics API nicht verfügbar"
              description="Prüfe SUPABASE_SERVICE_ROLE_KEY und NEXT_PUBLIC_SUPABASE_URL. Die Metrics API ist nur auf gehosteten Supabase-Projekten (nicht self-hosted) verfügbar."
            />
          </Panel>
        </div>
      ) : (
        <>
          {/* Auslastung */}
          <div className="mt-8">
            <Panel title="Auslastung" description="Aktuelle Ressourcen der Datenbank-Instanz">
              <div className="grid grid-cols-2 gap-6 py-2 sm:grid-cols-3 lg:grid-cols-5">
                <Gauge
                  percent={m.cpuPct ?? 0}
                  value={m.cpuPct === null ? "–" : `${round(m.cpuPct)}%`}
                  label="CPU"
                  caption="Auslastung"
                />
                <Gauge
                  percent={m.ramPct}
                  value={`${round(m.ramPct)}%`}
                  label="RAM"
                  caption={`${formatBytes(m.ramUsedBytes)} / ${formatBytes(m.ramTotalBytes)}`}
                />
                <Gauge
                  percent={m.diskPct}
                  value={`${round(m.diskPct)}%`}
                  label="Disk"
                  caption={`${formatBytes(m.diskUsedBytes)} / ${formatBytes(m.diskTotalBytes)}`}
                />
                <Gauge
                  percent={m.connectionsPct}
                  value={`${m.connections}/${m.maxConnections}`}
                  label="DB-Verbindungen"
                  caption={`${round(m.connectionsPct)}% belegt`}
                />
                <Gauge
                  percent={m.cacheHitPct}
                  value={`${m.cacheHitPct.toFixed(1)}%`}
                  label="Cache-Hit"
                  caption="je höher, desto besser"
                  color={cacheColor}
                />
              </div>
            </Panel>
          </div>

          {/* Datenbank & Aktivität */}
          <div className="mt-6">
            <Panel title="Datenbank & Aktivität" description="Postgres-Kennzahlen in Echtzeit">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <Stat
                  label="Transaktionen/s"
                  value={m.tps === null ? "–" : m.tps.toFixed(1)}
                  sub="Commits pro Sekunde"
                />
                <Stat label="DB-Größe" value={formatBytes(m.dbSizeBytes)} sub="Datenbank postgres" />
                <Stat
                  label="Commits gesamt"
                  value={m.commitsTotal.toLocaleString("de-DE")}
                  sub="seit Start"
                />
                <Stat
                  label="Rollbacks"
                  value={m.rollbacksTotal.toLocaleString("de-DE")}
                  sub="seit Start"
                />
                <Stat label="Auth-User" value={m.authUsers.toLocaleString("de-DE")} sub="in der DB" />
                <Stat
                  label="Realtime-Subs"
                  value={m.realtimeSubscriptions.toLocaleString("de-DE")}
                  sub="aktive Listener"
                />
              </div>
            </Panel>
          </div>
        </>
      )}

      {/* Tabellen */}
      <SectionLabel>Tabellen-Übersicht</SectionLabel>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title={`Tabellen (${tableCounts.length})`} description={`${totalRows.toLocaleString("de-DE")} Zeilen gesamt`}>
            {tableCounts.length === 0 ? (
              <p className="text-sm text-cream/35">Keine Tabellen gefunden.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {tableCounts.map((t) => (
                  <div key={t.name} className="rounded-lg border border-white/[0.06] bg-white/[0.01] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cream/35">
                      {TABLE_LABELS[t.name] ?? t.name}
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-cream">
                      {t.count >= 0 ? t.count.toLocaleString("de-DE") : "—"}
                    </p>
                    <p className="text-[9px] font-mono text-cream/20">{t.name}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <Panel title="Top-Tabellen">
          {tableCounts.length > 0 ? (
            <FunnelBars
              data={tableCounts
                .filter((t) => t.count > 0)
                .slice(0, 8)
                .map((t) => ({
                  label: TABLE_LABELS[t.name] ?? t.name,
                  value: t.count,
                }))}
            />
          ) : (
            <p className="text-sm text-cream/35">Keine Daten.</p>
          )}
        </Panel>
      </div>

      {/* Storage */}
      <SectionLabel>Storage</SectionLabel>
      <Panel
        title={`Storage-Buckets (${storageBuckets.length})`}
        description={`${formatBytes(totalStorage)} gesamt · ${totalFiles} Dateien`}
      >
        {storageBuckets.length === 0 ? (
          <p className="text-sm text-cream/35">Keine Storage-Buckets gefunden.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {storageBuckets.map((b) => (
              <div key={b.name} className="rounded-lg border border-white/[0.06] bg-white/[0.01] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-3.5 w-3.5 text-gold-300/40" />
                  <p className="text-xs font-bold text-cream/80">{b.name}</p>
                </div>
                <p className="mt-1.5 text-sm font-extrabold text-cream">{formatBytes(b.size)}</p>
                <p className="text-[10px] text-cream/30">{b.fileCount} Dateien</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Auth-Provider */}
      {authProviders.length > 0 && (
        <>
          <SectionLabel>Auth-Provider</SectionLabel>
          <Panel title="Registrierungen nach Provider" description="Wie sich Nutzer angemeldet haben">
            <FunnelBars
              data={authProviders.map((p) => ({
                label: PROVIDER_LABELS[p.provider] ?? p.provider,
                value: p.count,
              }))}
            />
          </Panel>
        </>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-cream/30">
        <Activity className="h-3.5 w-3.5" />
        Quelle: Supabase Metrics API (Prometheus, Beta) + Service-Role Queries. CPU & Transaktionen/s
        werden aus zwei Messpunkten berechnet.
      </p>
    </div>
  );
}
