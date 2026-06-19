import { Activity, Database } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/admin/ui";
import { Gauge } from "@/components/admin/charts";
import { getSupabaseMetrics } from "@/lib/supabase-metrics";

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

export default async function AdminSystemPage() {
  const m = await getSupabaseMetrics();

  const cacheColor =
    m.cacheHitPct >= 95 ? "#34D399" : m.cacheHitPct >= 80 ? "#FBBF24" : "#FB7185";

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="System"
        title="Datenbank & Infrastruktur"
        description="Live-Metriken direkt aus Supabase (Prometheus). Punktgenaue Momentaufnahme bei jedem Laden."
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

          <p className="mt-6 flex items-center gap-2 text-xs text-cream/30">
            <Activity className="h-3.5 w-3.5" />
            Quelle: Supabase Metrics API (Prometheus, Beta). CPU & Transaktionen/s werden aus zwei
            Messpunkten berechnet.
          </p>
        </>
      )}
    </div>
  );
}
