import {
  BarChart3,
  Users,
  MousePointerClick,
  Eye,
  Timer,
  LogOut,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { PageHeader, Panel, StatCard, EmptyState } from "@/components/admin/ui";
import { DonutChart, AreaTrend, FunnelBars } from "@/components/admin/charts";
import { getGa4Analytics } from "@/lib/ga4";
import { getClarityAnalytics } from "@/lib/clarity";

export const dynamic = "force-dynamic";

const SA_EMAIL = "aigoldmining@project-58a0bf91-c784-41c0-813.iam.gserviceaccount.com";

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("de-DE");
}
function fmtDuration(sec: number): string {
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
function fmtDay(iso: string): string {
  if (!iso || iso.length < 10) return iso;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
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

function SectionLabel({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="mb-4 mt-10 flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300/70">{children}</span>
      {note && <span className="text-[11px] text-cream/30">{note}</span>}
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const [ga, clarity] = await Promise.all([getGa4Analytics(), getClarityAnalytics()]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Kontrollzentrale"
        title="Analytics"
        description="Besucher, Traffic-Quellen und Nutzerverhalten — Google Analytics & Microsoft Clarity."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]" />
            Live
          </span>
        }
      />

      {/* ── Google Analytics ── */}
      <SectionLabel note="Letzte 30 Tage">Besucher & Traffic · Google Analytics</SectionLabel>

      {!ga.configured ? (
        <Panel>
          <EmptyState
            icon={BarChart3}
            title="GA4 noch nicht verbunden"
            description={`Setze GA4_PROPERTY_ID + GOOGLE_SERVICE_ACCOUNT_JSON (base64) in Vercel und füge den Service-Account ${SA_EMAIL} als Viewer zur GA4-Property hinzu.`}
          />
        </Panel>
      ) : !ga.ok ? (
        <Panel>
          <EmptyState
            icon={AlertTriangle}
            title="GA4 verbunden, aber kein Zugriff"
            description={`Prüfe die GA4_PROPERTY_ID und füge ${SA_EMAIL} in GA unter „Property-Zugriffsverwaltung" als Viewer hinzu.`}
          />
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Nutzer" value={fmtInt(ga.activeUsers)} icon={Users} hint="aktive Nutzer" />
            <StatCard label="Sitzungen" value={fmtInt(ga.sessions)} icon={MousePointerClick} />
            <StatCard label="Seitenaufrufe" value={fmtInt(ga.pageViews)} icon={Eye} />
            <StatCard
              label="Ø Sitzungsdauer"
              value={fmtDuration(ga.avgSessionDurationSec)}
              icon={Timer}
            />
            <StatCard label="Absprungrate" value={`${Math.round(ga.bounceRatePct)}%`} icon={LogOut} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Panel title="Nutzer-Verlauf" description="Aktive Nutzer pro Tag (30 Tage)">
                <AreaTrend
                  data={ga.series.map((d) => ({ date: d.date, cents: d.users }))}
                  formatDay={fmtDay}
                />
              </Panel>
            </div>
            <Panel title="Traffic-Quellen">
              <DonutChart
                data={ga.channels.map((c) => ({ label: c.label, value: c.value }))}
                centerValue={fmtInt(ga.sessions)}
                centerLabel="Sitzungen"
              />
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Panel title="Top-Seiten">
              {ga.topPages.length === 0 ? (
                <p className="text-sm text-cream/35">Noch keine Daten.</p>
              ) : (
                <FunnelBars data={ga.topPages.map((p) => ({ label: p.label, value: p.value }))} />
              )}
            </Panel>
            <Panel title="Länder">
              {ga.countries.length === 0 ? (
                <p className="text-sm text-cream/35">Noch keine Daten.</p>
              ) : (
                <FunnelBars data={ga.countries.map((c) => ({ label: c.label, value: c.value }))} />
              )}
            </Panel>
            <Panel title="Geräte">
              <DonutChart
                data={ga.devices.map((d) => ({ label: d.label, value: d.value }))}
                centerValue={fmtInt(ga.devices.reduce((s, d) => s + d.value, 0))}
                centerLabel="Sitzungen"
              />
            </Panel>
          </div>
        </>
      )}

      {/* ── Microsoft Clarity ── */}
      <SectionLabel note={clarity.stale ? "zwischengespeichert" : "Letzte 3 Tage"}>
        Verhalten & UX · Microsoft Clarity
      </SectionLabel>

      {!clarity.configured ? (
        <Panel>
          <EmptyState
            icon={Activity}
            title="Clarity-Export nicht verbunden"
            description="Setze CLARITY_API_TOKEN in Vercel, um Verhaltens- und UX-Daten zu laden."
          />
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Sessions" value={fmtInt(clarity.sessions)} icon={MousePointerClick} />
            <StatCard label="Distinct Users" value={fmtInt(clarity.distinctUsers)} icon={Users} />
            <StatCard
              label="Bot-Sessions"
              value={fmtInt(clarity.botSessions)}
              icon={Activity}
            />
            <StatCard
              label="Seiten / Sitzung"
              value={clarity.pagesPerSession.toFixed(1)}
              icon={Eye}
            />
            <StatCard
              label="Scroll-Tiefe"
              value={`${Math.round(clarity.avgScrollDepth)}%`}
              icon={BarChart3}
            />
          </div>

          <div className="mt-6">
            <Panel
              title="UX-Frustrationssignale"
              description="Anteil der Sitzungen mit Reibung — je niedriger, desto besser"
            >
              {clarity.signals.every((s) => s.sessionsPct === 0 && s.count === 0) ? (
                <p className="py-2 text-sm text-cream/35">
                  Noch keine Signale erfasst (wenig Traffic oder keine Cookie-Zustimmungen bisher).
                </p>
              ) : (
                <FunnelBars
                  data={clarity.signals.map((s) => ({
                    label: s.label,
                    value: Math.round(s.sessionsPct),
                    hint: `${fmtInt(s.count)} gesamt`,
                  }))}
                />
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
