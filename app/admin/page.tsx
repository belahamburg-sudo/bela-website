import {
  Banknote,
  ShoppingCart,
  Users,
  UserPlus,
  GraduationCap,
  Send,
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
import { formatEuro } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RevenueChart({ data }: { data: { date: string; cents: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.cents));
  const total = data.reduce((s, d) => s + d.cents, 0);

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-cream">{formatEuro(total)}</span>
        <span className="text-xs text-cream/40">letzte {data.length} Tage</span>
      </div>
      <div className="flex h-32 items-end gap-1">
        {data.map((d) => (
          <div key={d.date} className="group relative flex flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t bg-gradient-to-t from-gold-600/40 to-gold-300/80 transition-all group-hover:from-gold-500/60 group-hover:to-gold-200"
              style={{ height: `${Math.max(2, (d.cents / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-white/10 bg-ink px-2 py-1 text-[10px] text-cream/80 opacity-0 transition-opacity group-hover:opacity-100">
              {formatEuro(d.cents)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [stats, purchases, leads, revenue] = await Promise.all([
    getAdminStats(),
    getRecentPurchases(6),
    getRecentLeads(6),
    getRevenueSeries(14),
  ]);

  const purchaseColumns: Column<AdminPurchase>[] = [
    { key: "course_slug", header: "Kurs", render: (r) => <span className="font-medium text-cream/90">{r.course_slug}</span> },
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
    { key: "created_at", header: "Datum", align: "right", render: (r) => formatDate(r.created_at) },
  ];

  const leadColumns: Column<AdminLead>[] = [
    { key: "email", header: "E-Mail", render: (r) => <span className="font-medium text-cream/90">{r.email}</span> },
    { key: "source", header: "Quelle", render: (r) => <AdminBadge tone="blue">{r.source}</AdminBadge> },
    { key: "created_at", header: "Datum", align: "right", render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Kontrollzentrale"
        title="Übersicht"
        description="Echtzeit-Überblick über Umsatz, Mitglieder und Leads deiner Goldmine."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Umsatz (bezahlt)" value={formatEuro(stats.revenueCents)} icon={Banknote} hint={`${stats.paidCount} Verkäufe`} href="/admin/verkaeufe" />
        <StatCard label="Verkäufe offen" value={stats.pendingCount} icon={ShoppingCart} hint="ausstehend" href="/admin/verkaeufe" />
        <StatCard label="Mitglieder" value={stats.memberCount} icon={Users} href="/admin/kunden" />
        <StatCard label="Leads" value={stats.leadCount} icon={UserPlus} href="/admin/leads" />
        <StatCard label="Kurse" value={stats.courseCount} icon={GraduationCap} href="/admin/kurse" />
        <StatCard label="Telegram aktiv" value={stats.telegramActive} icon={Send} href="/admin/telegram" />
      </div>

      <div className="mt-6">
        <Panel title="Umsatzverlauf">
          <RevenueChart data={revenue} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Neueste Verkäufe"
          noPadding
          actions={
            <a href="/admin/verkaeufe" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gold-300/70 hover:text-gold-300">
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
            <a href="/admin/leads" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gold-300/70 hover:text-gold-300">
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
