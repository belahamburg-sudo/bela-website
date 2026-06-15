"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Users,
  Wallet,
  Ticket,
  Settings2,
  Banknote,
  Power,
} from "lucide-react";
import { Panel, AdminBadge, KeyValue, EmptyState } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { formatEuro, absoluteUrl } from "@/lib/utils";
import type { AdminAffiliateRow, AffiliateTier } from "@/lib/affiliate";
import {
  updateAffiliate,
  createPayout,
  issueCoupon,
} from "@/app/admin/affiliate/actions";

function statusTone(status: string): "green" | "amber" | "red" | "neutral" {
  if (status === "active") return "green";
  if (status === "pending") return "amber";
  if (status === "suspended" || status === "inactive") return "red";
  return "neutral";
}

function statusLabel(status: string): string {
  if (status === "active") return "Aktiv";
  if (status === "pending") return "Ausstehend";
  if (status === "suspended") return "Gesperrt";
  if (status === "inactive") return "Inaktiv";
  return status;
}

export function AffiliatesTable({
  rows,
  tiers,
}: {
  rows: AdminAffiliateRow[];
  tiers: AffiliateTier[];
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<AdminAffiliateRow | null>(null);

  // Reward config form state
  const [cashPercent, setCashPercent] = useState("");
  const [selfDiscount, setSelfDiscount] = useState("");
  const [fixedCash, setFixedCash] = useState("");
  const [rewardType, setRewardType] = useState("percent_cash");
  const [canIssueCoupons, setCanIssueCoupons] = useState(false);
  const [tierId, setTierId] = useState("");
  const [notes, setNotes] = useState("");

  // Payout form state
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"stripe" | "manual">("manual");

  // Coupon form state
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.fullName ?? "").toLowerCase().includes(q) ||
        (r.code ?? "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  // Keep the open detail in sync with refreshed server data.
  const activeDetail = useMemo(() => {
    if (!detail) return null;
    return rows.find((r) => r.userId === detail.userId) ?? detail;
  }, [detail, rows]);

  const showPercent = rewardType === "percent_cash" || rewardType === "both";
  const showFixed = rewardType === "fixed_cash" || rewardType === "both";
  const affiliateLink = activeDetail?.code
    ? absoluteUrl(`/signup?ref=${activeDetail.code}`)
    : null;

  function openDetail(row: AdminAffiliateRow) {
    setDetail(row);
    setCashPercent(String(row.cashPercent ?? 0));
    setSelfDiscount(String(row.selfDiscountPercent ?? 0));
    setFixedCash(String((row.fixedCashCents ?? 0) / 100));
    setRewardType(row.rewardType ?? "percent_cash");
    setCanIssueCoupons(Boolean(row.canIssueCoupons));
    setTierId(row.tierId ?? "");
    setNotes(row.notes ?? "");
    setPayoutAmount("");
    setPayoutMethod(row.stripeOnboarded ? "stripe" : "manual");
    setCouponCode("");
    setCouponPercent("");
  }

  function handleSaveConfig() {
    if (!activeDetail) return;
    const userId = activeDetail.userId;
    startTransition(async () => {
      const res = await updateAffiliate({
        userId,
        cashPercent: Number(cashPercent) || 0,
        selfDiscountPercent: Number(selfDiscount) || 0,
        fixedCashCents: Math.round((Number(fixedCash) || 0) * 100),
        rewardType,
        canIssueCoupons,
        tierId: tierId || null,
        notes: notes.trim() || null,
      });
      if (res.ok) {
        success("Konfiguration gespeichert.");
        router.refresh();
      } else {
        error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  }

  function handleToggleStatus() {
    if (!activeDetail) return;
    const userId = activeDetail.userId;
    const next = activeDetail.status === "active" ? "suspended" : "active";
    startTransition(async () => {
      const res = await updateAffiliate({ userId, status: next });
      if (res.ok) {
        success(next === "active" ? "Affiliate aktiviert." : "Affiliate gesperrt.");
        router.refresh();
      } else {
        error(res.error ?? "Statuswechsel fehlgeschlagen.");
      }
    });
  }

  function handlePayout() {
    if (!activeDetail) return;
    const userId = activeDetail.userId;
    const cents = Math.round((Number(payoutAmount) || 0) * 100);
    if (cents <= 0) {
      error("Betrag muss positiv sein.");
      return;
    }
    startTransition(async () => {
      const res = await createPayout({ userId, amountCents: cents, method: payoutMethod });
      if (res.ok) {
        success("Auszahlung verbucht.");
        setPayoutAmount("");
        router.refresh();
      } else {
        error(res.error ?? "Auszahlung fehlgeschlagen.");
      }
    });
  }

  function handleIssueCoupon() {
    if (!activeDetail) return;
    const userId = activeDetail.userId;
    startTransition(async () => {
      const res = await issueCoupon({
        userId,
        percentOff: Number(couponPercent) || 0,
        code: couponCode,
      });
      if (res.ok) {
        success("Gutschein-Code erstellt.");
        setCouponCode("");
        setCouponPercent("");
        router.refresh();
      } else {
        error(res.error ?? "Code-Erstellung fehlgeschlagen.");
      }
    });
  }

  const columns: Column<AdminAffiliateRow>[] = [
    {
      key: "email",
      header: "Affiliate",
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-cream/90">
            {r.fullName || r.email || "—"}
          </div>
          {r.fullName && r.email && (
            <div className="truncate text-xs text-cream/40">{r.email}</div>
          )}
        </div>
      ),
    },
    {
      key: "code",
      header: "Code",
      render: (r) =>
        r.code ? (
          <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-xs text-gold-200">
            {r.code}
          </span>
        ) : (
          <span className="text-cream/30">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <AdminBadge tone={statusTone(r.status)}>{statusLabel(r.status)}</AdminBadge>
      ),
    },
    {
      key: "cashPercent",
      header: "Provision",
      align: "right",
      render: (r) => <span className="text-cream/70">{r.cashPercent}%</span>,
    },
    {
      key: "balance",
      header: "Guthaben",
      align: "right",
      render: (r) =>
        r.balanceCents > 0 ? (
          <span className="font-semibold text-gold-200">{formatEuro(r.balanceCents)}</span>
        ) : (
          <span className="text-cream/40">{formatEuro(0)}</span>
        ),
    },
    {
      key: "lifetime",
      header: "Lifetime",
      align: "right",
      render: (r) => (
        <span className="text-cream/60">{formatEuro(r.lifetimeEarnedCents)}</span>
      ),
    },
    {
      key: "referrals",
      header: "Empf.",
      align: "center",
      render: (r) =>
        r.stats.referralCount > 0 ? (
          <AdminBadge tone="gold">{r.stats.referralCount}</AdminBadge>
        ) : (
          <span className="text-cream/30">0</span>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <button
          onClick={() => openDetail(r)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cream/50 transition-colors hover:border-gold-300/40 hover:text-gold-200"
        >
          <Eye className="h-3.5 w-3.5" />
          Details
        </button>
      ),
    },
  ];

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

  return (
    <>
      <Panel
        title="Alle Affiliates"
        description={`${filtered.length} von ${rows.length} Partnern`}
        noPadding
      >
        <div className="border-b border-white/5 px-5 py-4">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cream/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E-Mail, Name oder Code suchen…"
              className="w-full rounded-lg border border-white/10 bg-obsidian/60 py-2 pl-9 pr-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.userId}
          emptyIcon={Users}
          emptyTitle="Keine Affiliates gefunden"
          emptyDescription="Lege oben einen neuen Affiliate an."
        />
      </Panel>

      <Modal
        open={Boolean(activeDetail)}
        onClose={() => setDetail(null)}
        title={activeDetail?.fullName || activeDetail?.email || "Affiliate"}
        description={activeDetail?.code ? `Code: ${activeDetail.code}` : activeDetail?.email ?? undefined}
        size="lg"
      >
        {activeDetail && (
          <div className="flex flex-col gap-6">
            {/* Overview */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KeyValue label="Status">
                <AdminBadge tone={statusTone(activeDetail.status)}>
                  {statusLabel(activeDetail.status)}
                </AdminBadge>
              </KeyValue>
              <KeyValue label="Guthaben">
                <span className="font-semibold text-gold-200">
                  {formatEuro(activeDetail.balanceCents)}
                </span>
              </KeyValue>
              <KeyValue label="Lifetime">
                {formatEuro(activeDetail.lifetimeEarnedCents)}
              </KeyValue>
              <KeyValue label="Empfehlungen">
                {activeDetail.stats.referralCount} ({activeDetail.stats.paidReferralCount} bezahlt)
              </KeyValue>
              <KeyValue label="Verdient">
                {formatEuro(activeDetail.stats.earnedCents)}
              </KeyValue>
              <KeyValue label="Offen">
                {formatEuro(activeDetail.stats.pendingCents)}
              </KeyValue>
              <KeyValue label="Umsatz gebracht">
                {formatEuro(activeDetail.stats.revenueBroughtCents)}
              </KeyValue>
              <KeyValue label="Stripe">
                <AdminBadge tone={activeDetail.stripeOnboarded ? "green" : "neutral"}>
                  {activeDetail.stripeOnboarded ? "Verbunden" : "Nicht verbunden"}
                </AdminBadge>
              </KeyValue>
            </div>

            {affiliateLink && (
              <KeyValue label="Affiliate-Link">
                <span className="break-all font-mono text-xs text-gold-200">
                  {affiliateLink}
                </span>
              </KeyValue>
            )}

            {/* Reward config */}
            <div className="rounded-xl border border-white/10 bg-panel/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-gold-300/60" />
                <span className="tac-label">Belohnungs-Konfiguration</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="tac-label">Belohnungs-Typ</span>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="percent_cash" className="bg-ink text-cream">
                      Cash % pro Verkauf
                    </option>
                    <option value="fixed_cash" className="bg-ink text-cream">
                      Fixbetrag pro Verkauf
                    </option>
                    <option value="both" className="bg-ink text-cream">
                      Beides
                    </option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="tac-label">Eigenrabatt (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={selfDiscount}
                    onChange={(e) => setSelfDiscount(e.target.value)}
                    className={inputClass}
                  />
                </label>
                {showPercent && (
                  <label className="flex flex-col gap-1">
                    <span className="tac-label">Cash % pro Verkauf</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={cashPercent}
                      onChange={(e) => setCashPercent(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                )}
                {showFixed && (
                  <label className="flex flex-col gap-1">
                    <span className="tac-label">Fixbetrag pro Verkauf (€)</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={fixedCash}
                      onChange={(e) => setFixedCash(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                )}
                <label className="flex flex-col gap-1">
                  <span className="tac-label">Tier</span>
                  <select
                    value={tierId}
                    onChange={(e) => setTierId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="" className="bg-ink text-cream">
                      Kein Tier
                    </option>
                    {tiers.map((t) => (
                      <option key={t.id} value={t.id} className="bg-ink text-cream">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={canIssueCoupons}
                    onChange={(e) => setCanIssueCoupons(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-obsidian/60 accent-gold-400"
                  />
                  <span className="text-sm text-cream/70">Darf Gutscheine ausgeben</span>
                </label>
              </div>
              <label className="mt-3 flex flex-col gap-1">
                <span className="tac-label">Notizen</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </label>
              <div className="mt-3 flex items-center justify-between gap-2">
                <AdminButton
                  variant={activeDetail.status === "active" ? "danger" : "secondary"}
                  size="sm"
                  icon={Power}
                  onClick={handleToggleStatus}
                  loading={pending}
                >
                  {activeDetail.status === "active" ? "Sperren" : "Aktivieren"}
                </AdminButton>
                <AdminButton
                  variant="primary"
                  size="md"
                  icon={Settings2}
                  onClick={handleSaveConfig}
                  loading={pending}
                >
                  Konfiguration speichern
                </AdminButton>
              </div>
            </div>

            {/* Payout */}
            <div className="rounded-xl border border-gold-300/20 bg-gold-300/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-gold-300/70" />
                <span className="tac-label text-gold-200/70">Auszahlung</span>
                <span className="ml-auto text-xs text-cream/40">
                  Verfügbar: {formatEuro(activeDetail.balanceCents)}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Betrag in €"
                  className={inputClass}
                />
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as "stripe" | "manual")}
                  className={inputClass}
                >
                  <option value="manual" className="bg-ink text-cream">
                    Manuell
                  </option>
                  <option
                    value="stripe"
                    disabled={!activeDetail.stripeOnboarded}
                    className="bg-ink text-cream"
                  >
                    Stripe {activeDetail.stripeOnboarded ? "" : "(nicht verbunden)"}
                  </option>
                </select>
                <AdminButton
                  variant="primary"
                  size="md"
                  icon={Wallet}
                  onClick={handlePayout}
                  loading={pending}
                  disabled={activeDetail.balanceCents <= 0}
                >
                  Auszahlen
                </AdminButton>
              </div>
            </div>

            {/* Coupon */}
            <div className="rounded-xl border border-white/10 bg-panel/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Ticket className="h-4 w-4 text-gold-300/60" />
                <span className="tac-label">Gutschein-Code ausgeben</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  className={`${inputClass} font-mono uppercase`}
                />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={couponPercent}
                  onChange={(e) => setCouponPercent(e.target.value)}
                  placeholder="Rabatt %"
                  className={inputClass}
                />
                <AdminButton
                  variant="secondary"
                  size="md"
                  icon={Ticket}
                  onClick={handleIssueCoupon}
                  loading={pending}
                  disabled={!couponCode.trim() || !couponPercent}
                >
                  Code erstellen
                </AdminButton>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
