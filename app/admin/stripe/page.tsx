import {
  Banknote, CreditCard, RefreshCcw, ArrowDownToLine,
  Users, Package, AlertTriangle, TrendingUp,
  ExternalLink, Clock, CircleCheck, CircleOff, TriangleAlert,
} from "lucide-react";
import { PageHeader, StatCard, Panel, AdminBadge, EmptyState, KeyValue } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DonutChart, FunnelBars } from "@/components/admin/charts";
import { getStripeDashboard, type StripeCharge, type StripeRefund, type StripePayout, type StripeProduct, type StripeDispute } from "@/lib/stripe-dashboard";
import { formatEuro } from "@/lib/utils";

export const dynamic = "force-dynamic";

function fmtDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("de-DE", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function fmtDateShort(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("de-DE", {
    day: "2-digit", month: "short",
  });
}

function statusBadge(status: string) {
  const tones: Record<string, "green" | "red" | "amber" | "blue" | "neutral"> = {
    succeeded: "green", paid: "green", available: "green",
    failed: "red", canceled: "red", lost: "red",
    pending: "amber", in_transit: "amber", needs_response: "amber",
    refunded: "blue",
  };
  return <AdminBadge tone={tones[status] ?? "neutral"}>{status}</AdminBadge>;
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

function MiniStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <p className="tac-label">{label}</p>
      <p className="mt-1.5 text-lg font-extrabold tracking-tight text-cream">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-cream/35">{sub}</p>}
    </div>
  );
}

export default async function AdminStripePage() {
  const d = await getStripeDashboard();

  if (!d.configured) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <PageHeader eyebrow="Finanzen" title="Stripe" description="Zahlungen, Abos, Auszahlungen und Produkte." />
        <div className="mt-8">
          <Panel>
            <EmptyState icon={CreditCard} title="Stripe nicht verbunden" description="Setze STRIPE_SECRET_KEY in den Umgebungsvariablen." />
          </Panel>
        </div>
      </div>
    );
  }

  const avail = d.balance.available.reduce((s, b) => s + b.amount, 0);
  const pend = d.balance.pending.reduce((s, b) => s + b.amount, 0);
  const subs = d.subscriptions;
  const totalSubs = subs.active + subs.pastDue + subs.trialing + subs.incomplete;
  const succeededCharges = d.charges.filter((c) => c.status === "succeeded");
  const failedCharges = d.charges.filter((c) => c.status === "failed");

  const chargeColumns: Column<StripeCharge>[] = [
    {
      key: "customerEmail",
      header: "Kunde",
      render: (r) => (
        <span className="font-medium text-cream/90 text-xs">
          {r.customerEmail ?? <span className="text-cream/30">unbekannt</span>}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Betrag",
      align: "right",
      render: (r) => <span className="font-bold text-cream/90">{formatEuro(r.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {statusBadge(r.refunded ? "refunded" : r.status)}
          {r.disputed && <AdminBadge tone="red">Dispute</AdminBadge>}
        </div>
      ),
    },
    {
      key: "description",
      header: "Beschreibung",
      render: (r) => <span className="text-xs text-cream/50 truncate max-w-[200px] block">{r.description ?? "—"}</span>,
    },
    {
      key: "created",
      header: "Datum",
      align: "right",
      render: (r) => <span className="text-xs text-cream/50">{fmtDate(r.created)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => r.receiptUrl ? (
        <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-gold-300/60 hover:text-gold-300">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : null,
    },
  ];

  const refundColumns: Column<StripeRefund>[] = [
    {
      key: "amount",
      header: "Betrag",
      render: (r) => <span className="font-bold text-cream/90">{formatEuro(r.amount)}</span>,
    },
    { key: "reason", header: "Grund", render: (r) => <span className="text-xs text-cream/60">{r.reason ?? "—"}</span> },
    { key: "status", header: "Status", render: (r) => statusBadge(r.status) },
    { key: "created", header: "Datum", align: "right", render: (r) => <span className="text-xs text-cream/50">{fmtDate(r.created)}</span> },
  ];

  const payoutColumns: Column<StripePayout>[] = [
    {
      key: "amount",
      header: "Betrag",
      render: (r) => <span className="font-bold text-cream/90">{formatEuro(r.amount)}</span>,
    },
    { key: "status", header: "Status", render: (r) => statusBadge(r.status) },
    { key: "method", header: "Methode", render: (r) => <span className="text-xs text-cream/60 uppercase">{r.method}</span> },
    {
      key: "arrivalDate",
      header: "Ankunft",
      align: "right",
      render: (r) => <span className="text-xs text-cream/50">{fmtDateShort(r.arrivalDate)}</span>,
    },
  ];

  const productColumns: Column<StripeProduct>[] = [
    {
      key: "name",
      header: "Produkt",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-cream/90">{r.name}</span>
          {r.interval && <AdminBadge tone="blue">{r.interval === "month" ? "Abo" : r.interval === "year" ? "Jahresabo" : r.interval}</AdminBadge>}
        </div>
      ),
    },
    {
      key: "defaultPrice",
      header: "Preis",
      align: "right",
      render: (r) => r.defaultPrice ? (
        <span className="font-bold text-cream/90">
          {formatEuro(r.defaultPrice)}
          {r.interval && <span className="text-cream/40 font-normal">/{r.interval === "month" ? "Mo" : "Jahr"}</span>}
        </span>
      ) : <span className="text-cream/30">—</span>,
    },
    {
      key: "active",
      header: "Status",
      render: (r) => <AdminBadge tone={r.active ? "green" : "neutral"}>{r.active ? "Aktiv" : "Inaktiv"}</AdminBadge>,
    },
  ];

  const disputeColumns: Column<StripeDispute>[] = [
    {
      key: "amount",
      header: "Betrag",
      render: (r) => <span className="font-bold text-red-300">{formatEuro(r.amount)}</span>,
    },
    { key: "reason", header: "Grund", render: (r) => <span className="text-xs text-cream/60">{r.reason}</span> },
    { key: "status", header: "Status", render: (r) => statusBadge(r.status) },
    { key: "created", header: "Datum", align: "right", render: (r) => <span className="text-xs text-cream/50">{fmtDate(r.created)}</span> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Finanzen"
        title="Stripe"
        description="Echtzeit-Überblick über Zahlungen, Abos, Auszahlungen und Produkte."
        actions={
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-cream/50 hover:text-gold-300 hover:border-gold-300/30"
          >
            Stripe öffnen <ExternalLink className="h-3 w-3" />
          </a>
        }
      />

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Verfügbar" value={formatEuro(avail)} icon={Banknote} hint="Stripe-Guthaben" />
        <StatCard label="Ausstehend" value={formatEuro(pend)} icon={Clock} hint="wird ausgezahlt" />
        <StatCard label="MRR" value={formatEuro(subs.mrrCents)} icon={TrendingUp} hint="monatl. Abo-Umsatz" />
        <StatCard
          label="Aktive Abos"
          value={subs.active}
          icon={Users}
          hint={subs.trialing > 0 ? `+ ${subs.trialing} Trial` : undefined}
        />
      </div>

      {/* Abo-Details */}
      <SectionLabel>Abonnements</SectionLabel>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Abo-Übersicht">
          <DonutChart
            data={[
              { label: "Aktiv", value: subs.active, color: "#34D399" },
              { label: "Trial", value: subs.trialing, color: "#38BDF8" },
              { label: "Überfällig", value: subs.pastDue, color: "#FBBF24" },
              { label: "Unvollständig", value: subs.incomplete, color: "#FB7185" },
            ].filter((d) => d.value > 0)}
            centerValue={String(totalSubs)}
            centerLabel="Abos"
          />
        </Panel>
        <div className="lg:col-span-2">
          <Panel title="Abo-Kennzahlen">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <MiniStat label="Aktiv" value={subs.active} sub="laufende Abos" />
              <MiniStat label="Trial" value={subs.trialing} sub="Testphase" />
              <MiniStat label="Überfällig" value={subs.pastDue} sub="Zahlung ausstehend" />
              <MiniStat label="Unvollständig" value={subs.incomplete} sub="Setup nicht fertig" />
              <MiniStat label="Gekündigt" value={subs.canceled} sub="letzte 20" />
              <MiniStat label="MRR" value={formatEuro(subs.mrrCents)} sub="monatl. wiederkehrend" />
            </div>
          </Panel>
        </div>
      </div>

      {/* Guthaben & Auszahlungen */}
      <SectionLabel>Guthaben & Auszahlungen</SectionLabel>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Stripe-Guthaben">
          <div className="space-y-4">
            {d.balance.available.length > 0 ? d.balance.available.map((b) => (
              <KeyValue key={`avail-${b.currency}`} label={`Verfügbar (${b.currency.toUpperCase()})`}>
                <span className="text-lg font-extrabold text-emerald-300">{formatEuro(b.amount)}</span>
              </KeyValue>
            )) : (
              <KeyValue label="Verfügbar"><span className="text-cream/40">0,00 €</span></KeyValue>
            )}
            {d.balance.pending.map((b) => (
              <KeyValue key={`pend-${b.currency}`} label={`Ausstehend (${b.currency.toUpperCase()})`}>
                <span className="text-lg font-extrabold text-amber-300">{formatEuro(b.amount)}</span>
              </KeyValue>
            ))}
          </div>
        </Panel>
        <div className="lg:col-span-2">
          <Panel title="Letzte Auszahlungen" noPadding>
            {d.payouts.length === 0 ? (
              <EmptyState icon={ArrowDownToLine} title="Keine Auszahlungen" description="Auszahlungen erscheinen hier sobald Stripe sie auslöst." />
            ) : (
              <DataTable columns={payoutColumns} rows={d.payouts} getRowKey={(r) => r.id} />
            )}
          </Panel>
        </div>
      </div>

      {/* Zahlungen */}
      <SectionLabel note="letzte 25">Zahlungen</SectionLabel>
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <MiniStat label="Erfolgreich" value={succeededCharges.length} sub={`von ${d.charges.length}`} />
          <MiniStat label="Fehlgeschlagen" value={failedCharges.length} sub={failedCharges.length > 0 ? "Achtung" : "alles OK"} />
        </div>
        <div className="lg:col-span-3">
          <Panel title="Letzte Zahlungen" noPadding>
            {d.charges.length === 0 ? (
              <EmptyState icon={CreditCard} title="Noch keine Zahlungen" />
            ) : (
              <DataTable columns={chargeColumns} rows={d.charges} getRowKey={(r) => r.id} />
            )}
          </Panel>
        </div>
      </div>

      {/* Erstattungen */}
      {d.refunds.length > 0 && (
        <>
          <SectionLabel>Erstattungen</SectionLabel>
          <Panel title={`Letzte Erstattungen (${d.refunds.length})`} description={`Gesamt: ${formatEuro(d.totalRefundVolume)}`} noPadding>
            <DataTable columns={refundColumns} rows={d.refunds} getRowKey={(r) => r.id} />
          </Panel>
        </>
      )}

      {/* Disputes */}
      {d.disputes.length > 0 && (
        <>
          <SectionLabel>Disputes</SectionLabel>
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{d.disputes.length} offene{d.disputes.length === 1 ? "r" : ""} Dispute{d.disputes.length === 1 ? "" : "s"} — bitte im Stripe-Dashboard reagieren.</p>
          </div>
          <Panel noPadding>
            <DataTable columns={disputeColumns} rows={d.disputes} getRowKey={(r) => r.id} />
          </Panel>
        </>
      )}

      {/* Produkte */}
      <SectionLabel>Produkte & Preise</SectionLabel>
      <Panel title={`Aktive Produkte (${d.products.length})`} noPadding>
        {d.products.length === 0 ? (
          <EmptyState icon={Package} title="Keine aktiven Produkte" />
        ) : (
          <DataTable columns={productColumns} rows={d.products} getRowKey={(r) => r.id} />
        )}
      </Panel>
    </div>
  );
}
