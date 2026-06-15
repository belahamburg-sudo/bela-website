import {
  Banknote,
  CalendarDays,
  CalendarRange,
  Receipt,
  ShoppingCart,
  Users,
  UserPlus,
  Send,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader, StatCard, Panel, AdminBadge, EmptyState } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import {
  getAdminStats,
  getRecentPurchases,
  getRecentLeads,
  getRevenueSeries,
  type AdminPurchase,
  type AdminLead,
} from "@/lib/admin-data";
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
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
}

/* ---------------------------------------------------------------- */
/* System status                                                    */
/* ---------------------------------------------------------------- */

const HEALTH_META: Record<
  HealthStatus,
  { dot: string; glow: string; label: string; text: string }
> = {
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
              <span
                className={cn(
                  "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                  meta.dot,
                  meta.glow
                )}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-cream/90">
                  {h.service}
                </p>
                {h.status === "down" && h.detail && (
                  <p className="truncate text-[11px] text-red-300/60">{h.detail}</p>
                )}
              </div>
            </div>
            <span
              className={cn(
                "flex-shrink-0 text-xs font-bold uppercase tracking-wide",
                meta.text
              )}
            >
              {meta.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------------------------------------- */
/* Revenue sparkline                                                */
/* ---------------------------------------------------------------- */

function RevenueChart({ data }: { data: { date: string; cents: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.cents));
  const total = data.reduce((s, d) => s + d.cents, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;
  const peak = data.reduce(
    (best, d) => (d.cents > best.cents ? d : best),
    data[0] ?? { date: "", cents: 0 }
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="tac-label">Summe {data.length} Tage</span>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-cream">
            {formatEuro(total)}
          </p>
        </div>
        <div className="flex items-center gap-5 text-right">
          <div>
            <span className="tac-label">Ø / Tag</span>
            <p className="mt-1 text-sm font-bold text-cream/80">{formatEuro(avg)}</p>
          </div>
          <div>
            <span className="tac-label">Bester Tag</span>
            <p className="mt-1 text-sm font-bold text-cream/80">
              {formatEuro(peak.cents)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-36 items-end gap-1.5">
        {data.map((d) => (
          <div
            key={d.date}
            className="group relative flex flex-1 flex-col justify-end"
          >
            <div
              className="w-full rounded-t bg-gradient-to-t from-gold-600/30 to-gold-300/80 transition-all group-hover:from-gold-500/50 group-hover:to-gold-200"
              style={{ height: `${Math.max(2, (d.cents / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-ink px-2 py-1 text-[10px] text-cream/80 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <span className="font-bold text-gold-200">{formatEuro(d.cents)}</span>
              <span className="ml-1 text-cream/40">{formatDay(d.date)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-cream/30">
        <span>{data.length > 0 ? formatDay(data[0].date) : ""}</span>
        <span>{data.length > 0 ? formatDay(data[data.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Page                                                             */
/* ---------------------------------------------------------------- */

export default async function AdminOverviewPage() {
  const [stats, purchases, leads, revenue, health] = await Promise.all([
    getAdminStats(),
    getRecentPurchases(6),
    getRecentLeads(6),
    getRevenueSeries(14),
    checkAllHealth(),
  ]);

  const purchaseColumns: Column<AdminPurchase>[] = [
    {
      key: "course_slug",
      header: "Kurs",
      render: (r) => <span className="font-medium text-cream/90">{r.course_slug}</span>,
    },
    {
      key: "amount_total",
      header: "Betrag",
      align: "right",
      render: (r) => formatEuro(r.amount_total ?? 0),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <AdminBadge tone={r.status === "paid" ? "green" : "amber"}>{r.status}</AdminBadge>
      ),
    },
    {
      key: "created_at",
      header: "Datum",
      align: "right",
      render: (r) => formatDate(r.created_at),
    },
  ];

  const leadColumns: Column<AdminLead>[] = [
    {
      key: "email",
      header: "E-Mail",
      render: (r) => <span className="font-medium text-cream/90">{r.email}</span>,
    },
    {
      key: "source",
      header: "Quelle",
      render: (r) => <AdminBadge tone="blue">{r.source}</AdminBadge>,
    },
    {
      key: "created_at",
      header: "Datum",
      align: "right",
      render: (r) => formatDate(r.created_at),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Kontrollzentrale"
        title="Übersicht"
        description="Echtzeit-Überblick über Umsatz, Mitglieder und Leads deiner Goldmine."
      />

      {/* KPI cockpit */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Umsatz gesamt"
          value={formatEuro(stats.revenueCents)}
          icon={Banknote}
          hint={`${stats.paidCount} Verkäufe`}
          href="/admin/verkaeufe"
        />
        <StatCard
          label="Umsatz heute"
          value={formatEuro(stats.revenueTodayCents)}
          icon={CalendarDays}
          hint="seit Mitternacht"
        />
        <StatCard
          label="Umsatz 30 Tage"
          value={formatEuro(stats.revenue30dCents)}
          icon={CalendarRange}
          hint="rollierend"
        />
        <StatCard
          label="Ø Bestellwert"
          value={formatEuro(stats.aovCents)}
          icon={Receipt}
          hint="pro Verkauf"
        />
        <StatCard
          label="Conversion"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          hint="bezahlt / Mitglieder"
        />
        <StatCard
          label="Verkäufe"
          value={stats.paidCount}
          icon={ShoppingCart}
          hint={`${stats.pendingCount} offen`}
          href="/admin/verkaeufe"
        />
        <StatCard
          label="Mitglieder"
          value={stats.memberCount}
          icon={Users}
          href="/admin/kunden"
        />
        <StatCard
          label="Leads"
          value={stats.leadCount}
          icon={UserPlus}
          href="/admin/leads"
        />
        <StatCard
          label="VIP aktiv"
          value={stats.telegramActive}
          icon={Send}
          hint="Telegram"
          href="/admin/telegram"
        />
      </div>

      {/* Revenue + system status */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Umsatzverlauf" description="Bezahlte Bestellungen pro Tag">
            <RevenueChart data={revenue} />
          </Panel>
        </div>
        <Panel
          title="System-Status"
          description="Live-Integrationen"
          noPadding
        >
          <SystemStatus health={health} />
        </Panel>
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
