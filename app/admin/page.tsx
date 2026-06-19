import {
  ArrowUpRight,
  Banknote,
  CalendarRange,
  Send,
  ShoppingCart,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader, StatCard, Panel, AdminBadge, EmptyState } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DonutChart, AreaTrend, FunnelBars } from "@/components/admin/charts";
import {
  getAdminOverview,
  getRecentPurchases,
  getRecentLeads,
  type AdminPurchase,
  type AdminLead,
} from "@/lib/admin-data";
import { getStripeRevenue } from "@/lib/stripe-revenue";
import { checkAllHealth, type HealthStatus } from "@/lib/health";
import { formatEuro, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

/* ---------------------------------------------------------------- */
/* System status                                                    */
/* ---------------------------------------------------------------- */

const HEALTH_META: Record<HealthStatus, { dot: string; glow: string; label: string; text: string }> = {
  ok: {
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]",
    label: "Verbunden",
    text: "text-emerald-300",
  },
  down: {
    dot: "bg-red-400",
    glow: "shadow-[0_0_8px_2px_rgba(248,113,113,0.5)]",
    label: "Fehler",
    text: "text-red-300",
  },
  not_configured: {
    dot: "bg-amber-400",
    glow: "shadow-[0_0_8px_2px_rgba(251,191,36,0.45)]",
    label: "Nicht konfiguriert",
    text: "text-amber-300",
  },
};

function SystemStatus({
  health,
}: {
  health: { service: string; status: HealthStatus; detail?: string }[];
}) {
  return (
    <ul className="divide-y divide-white/5">
      {health.map((h) => {
        const meta = HEALTH_META[h.status];
        return (
          <li
            key={h.service}
            className="flex items-center justify-between gap-4 px-5 py-3.5 first:pt-4 last:pb-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={cn("h-2.5 w-2.5 flex-shrink-0 rounded-full", meta.dot, meta.glow)} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-cream/90">{h.service}</p>
                {h.status === "down" && h.detail && (
                  <p className="truncate text-[11px] text-red-300/60">{h.detail}</p>
                )}
              </div>
            </div>
            <span className={cn("flex-shrink-0 text-xs font-bold uppercase tracking-wide", meta.text)}>
              {meta.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------------------------------------- */
/* Compact secondary metric tile                                    */
/* ---------------------------------------------------------------- */

function MiniStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <p className="tac-label">{label}</p>
      <p className="mt-1.5 text-lg font-extrabold tracking-tight text-cream">{value}</p>
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

/* ---------------------------------------------------------------- */
/* Page                                                             */
/* ---------------------------------------------------------------- */

export default async function AdminOverviewPage() {
  const [o, rev, purchases, leads, health] = await Promise.all([
    getAdminOverview(),
    getStripeRevenue(30),
    getRecentPurchases(6),
    getRecentLeads(6),
    checkAllHealth(),
  ]);

  const seriesSum = rev.series.reduce((s, d) => s + d.cents, 0);
  const revenueAvg = rev.series.length > 0 ? Math.round(seriesSum / rev.series.length) : 0;
  const revenuePeak = rev.series.reduce((m, d) => Math.max(m, d.cents), 0);
  const convRate =
    o.memberCount > 0 ? Math.round((rev.payingCustomers / o.memberCount) * 1000) / 10 : 0;

  const purchaseColumns: Column<AdminPurchase>[] = [
    {
      key: "course_slug",
      header: "Kurs",
      render: (r) => <span className="font-medium text-cream/90">{r.course_slug}</span>,
    },
    { key: "amount_total", header: "Betrag", align: "right", render: (r) => formatEuro(r.amount_total ?? 0) },
    {
      key: "status",
      header: "Status",
      render: (r) => <AdminBadge tone={r.status === "paid" ? "green" : "amber"}>{r.status}</AdminBadge>,
    },
    { key: "created_at", header: "Datum", align: "right", render: (r) => formatDate(r.created_at) },
  ];

  const leadColumns: Column<AdminLead>[] = [
    {
      key: "email",
      header: "E-Mail",
      render: (r) => <span className="font-medium text-cream/90">{r.email}</span>,
    },
    { key: "source", header: "Quelle", render: (r) => <AdminBadge tone="blue">{r.source}</AdminBadge> },
    { key: "created_at", header: "Datum", align: "right", render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Kontrollzentrale"
        title="Übersicht"
        description="Echtzeit-Überblick über Umsatz, Mitglieder, Community und Leads deiner Goldmine."
      />

      {/* ── Hero KPIs (Umsatz aus Stripe) ── */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Umsatz gesamt"
          value={formatEuro(rev.totalCents)}
          icon={Banknote}
          hint={rev.configured ? `${rev.paymentCount} Zahlungen` : "Stripe nicht verbunden"}
          href="/admin/verkaeufe"
        />
        <StatCard
          label="Umsatz 30 Tage"
          value={formatEuro(rev.last30dCents)}
          icon={CalendarRange}
          hint="rollierend"
        />
        <StatCard
          label="VIP aktiv"
          value={o.telegramActive}
          icon={Send}
          hint={`≈ ${formatEuro(o.vipMrrCentsEst)}/Mo`}
          href="/admin/telegram"
        />
        <StatCard
          label="Mitglieder"
          value={o.memberCount}
          icon={Users}
          hint={`${convRate}% Conversion`}
          href="/admin/kunden"
        />
      </div>

      {/* ── Umsatz ── */}
      <SectionLabel>Umsatz</SectionLabel>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Umsatzverlauf" description="Echte Stripe-Zahlungen pro Tag (30 Tage)">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="tac-label">Summe 30 Tage</span>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-cream">
                  {formatEuro(seriesSum)}
                </p>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <span className="tac-label">Ø / Tag</span>
                  <p className="mt-1 text-sm font-bold text-cream/80">{formatEuro(revenueAvg)}</p>
                </div>
                <div>
                  <span className="tac-label">Bester Tag</span>
                  <p className="mt-1 text-sm font-bold text-cream/80">{formatEuro(revenuePeak)}</p>
                </div>
              </div>
            </div>
            <AreaTrend data={rev.series} formatDay={formatDay} />
          </Panel>
        </div>
        <Panel title="Umsatz nach Quelle" description="Kurse & Telegram-VIP">
          <DonutChart
            data={rev.bySource.map((s) => ({ label: s.label, value: s.cents }))}
            centerValue={formatEuro(rev.totalCents)}
            centerLabel="gesamt"
            formatValue={formatEuro}
          />
        </Panel>
      </div>

      {/* ── Akquise & Community ── */}
      <SectionLabel>Akquise & Community</SectionLabel>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Leads nach Quelle">
          <DonutChart data={o.leadsBySource} centerValue={String(o.leadCount)} centerLabel="Leads" />
        </Panel>
        <Panel title="Conversion-Funnel" description="Vom Lead zum VIP">
          <FunnelBars
            data={[
              { label: "Leads", value: o.leadCount },
              { label: "Mitglieder", value: o.memberCount },
              { label: "Käufer", value: rev.payingCustomers },
              { label: "VIP-Abos", value: o.telegramActive },
            ]}
          />
        </Panel>
        <Panel title="System-Status" description="Live-Integrationen" noPadding>
          <SystemStatus health={health} />
        </Panel>
      </div>

      {/* ── Weitere Kennzahlen ── */}
      <SectionLabel>Weitere Kennzahlen</SectionLabel>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Umsatz heute" value={formatEuro(rev.todayCents)} sub="seit Mitternacht" />
        <MiniStat label="Ø Bestellwert" value={formatEuro(rev.aovCents)} sub="pro Zahlung" />
        <MiniStat
          label="Onboarding"
          value={`${o.onboardingRate}%`}
          sub={`${o.onboardingComplete}/${o.memberCount} abgeschlossen`}
        />
        <MiniStat label="Newsletter" value={o.newsletterConfirmed} sub={`${o.newsletterPending} offen`} />
        <MiniStat
          label="Ø Bewertung"
          value={o.reviewCount > 0 ? `${o.reviewAvg.toFixed(1)} ★` : "–"}
          sub={`${o.reviewCount} Reviews`}
        />
        <MiniStat
          label="Lektionen erledigt"
          value={o.completedLessons}
          sub={`${o.activeLearners} aktive Lerner`}
        />
        <MiniStat
          label="Affiliate-Provision"
          value={formatEuro(o.affiliateEarnedCents)}
          sub={`${formatEuro(o.affiliatePaidCents)} ausgezahlt`}
        />
        <MiniStat label="Kurse" value={o.courseCount} sub="im Katalog" />
      </div>

      {/* ── Letzte Aktivität ── */}
      <SectionLabel>Letzte Aktivität</SectionLabel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Neueste Verkäufe"
          noPadding
          actions={
            <a
              href="/admin/verkaeufe"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gold-300/70 hover:text-gold-300"
            >
              Alle <ArrowUpRight className="h-3 w-3" />
            </a>
          }
        >
          {purchases.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Noch keine Verkäufe" />
          ) : (
            <DataTable columns={purchaseColumns} rows={purchases} getRowKey={(r) => r.id} />
          )}
        </Panel>

        <Panel
          title="Neueste Leads"
          noPadding
          actions={
            <a
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gold-300/70 hover:text-gold-300"
            >
              Alle <ArrowUpRight className="h-3 w-3" />
            </a>
          }
        >
          {leads.length === 0 ? (
            <EmptyState icon={UserPlus} title="Noch keine Leads" />
          ) : (
            <DataTable columns={leadColumns} rows={leads} getRowKey={(r) => r.id} />
          )}
        </Panel>
      </div>
    </div>
  );
}
