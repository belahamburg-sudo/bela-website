"use client";

import { useState, useTransition } from "react";
import {
  Gift,
  Users,
  Wallet,
  Clock,
  TrendingUp,
  Ticket,
  Crown,
  Check,
  CreditCard,
  ShieldCheck,
  Loader2,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { CopyField } from "@/components/affiliate/copy-field";
import { formatEuro } from "@/lib/utils";
import {
  resolveTier,
  type Affiliate,
  type AffiliateStats,
  type AffiliateTier,
  type AffiliatePayout,
} from "@/lib/affiliate";
import { startStripeOnboarding, requestPayout } from "@/app/(dashboard)/db/affiliate/actions";

type Props = {
  affiliate: Affiliate;
  stats: AffiliateStats;
  tiers: AffiliateTier[];
  payouts: AffiliatePayout[];
  shareLink: string;
};

export function AffiliateDashboard({
  affiliate,
  stats,
  tiers,
  payouts,
  shareLink,
}: Props) {
  const currentTier = resolveTier(stats.paidReferralCount, tiers);
  const sortedTiers = [...tiers].sort((a, b) => a.minSales - b.minSales);
  const nextTier =
    sortedTiers.find((t) => t.minSales > stats.paidReferralCount) ?? null;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300/60">
        <TrendingUp className="h-3.5 w-3.5" />
        Affiliate-Programm
      </div>
      <h1 className="mt-3 font-heading text-4xl text-cream sm:text-5xl">
        Dein Affiliate-Dashboard
      </h1>
      <p className="mt-3 max-w-2xl text-cream/50">
        Teile deinen persönlichen Link. Jede Anmeldung & jeder Kauf darüber wird
        dir gutgeschrieben.
      </p>

      {/* Metrics */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Empfehlungen"
          value={String(stats.referralCount)}
        />
        <MetricCard
          icon={Wallet}
          label="Verdient"
          value={formatEuro(stats.earnedCents)}
          accent
        />
        <MetricCard
          icon={Clock}
          label="Ausstehend"
          value={formatEuro(stats.pendingCents)}
        />
        <MetricCard
          icon={Banknote}
          label="Guthaben"
          value={formatEuro(affiliate.balanceCents)}
          accent
        />
      </div>

      {/* Link + Code */}
      <div className="mt-6 rounded-2xl border border-gold-300/20 bg-gold-300/[0.03] p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-gold-200/80">
          <Gift className="h-4 w-4" />
          Dein Affiliate-Link
        </div>
        <p className="mt-1 text-sm text-cream/50">
          Führt direkt zur Anmeldung. Freunde bekommen deinen persönlichen
          Vorteil – du verdienst an jedem Kauf.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <CopyField label="Link teilen" value={shareLink} />
          {affiliate.code && (
            <div className="sm:pb-0.5">
              <CopyField label="Code" value={affiliate.code} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RewardTerms affiliate={affiliate} />
        <PayoutSetup affiliate={affiliate} />
      </div>

      <TierProgress
        currentTier={currentTier}
        nextTier={nextTier}
        tiers={sortedTiers}
        paidReferralCount={stats.paidReferralCount}
      />

      <Payouts payouts={payouts} balanceCents={affiliate.balanceCents} />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-gold-300/30 bg-gold-300/[0.04]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <Icon className={`h-5 w-5 ${accent ? "text-gold-300" : "text-cream/30"}`} />
      <div className="mt-3 text-2xl font-bold text-cream">{value}</div>
      <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-cream/40">
        {label}
      </div>
    </div>
  );
}

function RewardTerms({ affiliate }: { affiliate: Affiliate }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-2 text-sm font-bold text-gold-200/80">
        <Wallet className="h-4 w-4" />
        Deine Konditionen
      </div>
      <ul className="mt-4 space-y-3 text-sm text-cream/70">
        <li className="flex items-start gap-2.5">
          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-300" />
          <span>
            Du erhältst{" "}
            <span className="font-bold text-cream">
              {affiliate.cashPercent}% Cash
            </span>{" "}
            pro Verkauf
            {affiliate.fixedCashCents > 0 && (
              <>
                {" "}
                <span className="text-cream/50">+</span>{" "}
                <span className="font-bold text-cream">
                  {formatEuro(affiliate.fixedCashCents)}
                </span>{" "}
                Fixbetrag
              </>
            )}
            .
          </span>
        </li>
        {affiliate.selfDiscountPercent > 0 && (
          <li className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-300" />
            <span>
              <span className="font-bold text-cream">
                {affiliate.selfDiscountPercent}% Eigenrabatt
              </span>{" "}
              auf deine eigenen Käufe.
            </span>
          </li>
        )}
        {affiliate.canIssueCoupons && (
          <li className="flex items-start gap-2.5">
            <Ticket className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-300" />
            <span>
              Du kannst{" "}
              <span className="font-bold text-cream">eigene Rabatt-Codes</span>{" "}
              für deine Community erstellen.
            </span>
          </li>
        )}
      </ul>
      {affiliate.notes && (
        <p className="mt-4 rounded-xl border border-white/5 bg-obsidian/40 p-3 text-xs text-cream/40">
          {affiliate.notes}
        </p>
      )}
    </div>
  );
}

function PayoutSetup({ affiliate }: { affiliate: Affiliate }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSetup() {
    setError(null);
    startTransition(async () => {
      const res = await startStripeOnboarding();
      if (res.ok && res.url) {
        window.location.href = res.url;
      } else {
        setError(res.error ?? "Etwas ist schiefgelaufen.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-2 text-sm font-bold text-gold-200/80">
        <CreditCard className="h-4 w-4" />
        Auszahlungen
      </div>

      {affiliate.stripeOnboarded ? (
        <>
          <p className="mt-4 text-sm text-cream/50">
            Dein Auszahlungskonto ist verbunden. Angeforderte Beträge werden per
            Stripe an dich überwiesen.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            Auszahlungen aktiv
          </div>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-cream/50">
            Verbinde dein Konto über Stripe, um Auszahlungen zu erhalten. Die
            Verifizierung dauert nur wenige Minuten.
          </p>
          <button
            type="button"
            onClick={onSetup}
            disabled={pending}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-300 px-6 py-3 text-sm font-bold uppercase tracking-wider text-obsidian transition hover:bg-gold-200 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Auszahlungen einrichten (Stripe)
          </button>
          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function TierProgress({
  currentTier,
  nextTier,
  tiers,
  paidReferralCount,
}: {
  currentTier: AffiliateTier | null;
  nextTier: AffiliateTier | null;
  tiers: AffiliateTier[];
  paidReferralCount: number;
}) {
  if (tiers.length === 0) return null;

  const base = currentTier?.minSales ?? 0;
  const target = nextTier?.minSales ?? base;
  const span = Math.max(1, target - base);
  const progress = nextTier
    ? Math.min(100, Math.max(0, ((paidReferralCount - base) / span) * 100))
    : 100;
  const remaining = nextTier ? Math.max(0, nextTier.minSales - paidReferralCount) : 0;

  return (
    <div className="mt-6 rounded-2xl border border-gold-300/20 bg-gold-300/[0.03] p-6">
      <div className="flex items-center gap-2 text-sm font-bold text-gold-200/80">
        <Crown className="h-4 w-4" />
        Deine Stufe
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-2xl font-bold text-cream">
            {currentTier?.name ?? "Einsteiger"}
          </div>
          <div className="mt-0.5 text-xs text-cream/40">
            {paidReferralCount} qualifizierte Empfehlungen
          </div>
        </div>
        {nextTier ? (
          <div className="text-right text-xs text-cream/50">
            Noch{" "}
            <span className="font-bold text-gold-300">{remaining}</span> bis{" "}
            <span className="font-bold text-cream">{nextTier.name}</span>
          </div>
        ) : (
          <div className="text-right text-xs font-bold uppercase tracking-wider text-gold-300">
            Höchste Stufe erreicht
          </div>
        )}
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-obsidian/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-200 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* All tiers */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {tiers.map((tier) => {
          const isCurrent = currentTier?.id === tier.id;
          const reached = paidReferralCount >= tier.minSales;
          return (
            <div
              key={tier.id}
              className={`rounded-xl border p-4 ${
                isCurrent
                  ? "border-gold-300/40 bg-gold-300/[0.06]"
                  : reached
                    ? "border-white/10 bg-white/[0.02]"
                    : "border-white/5 bg-white/[0.01] opacity-70"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-cream">{tier.name}</span>
                {isCurrent && (
                  <span className="rounded-full bg-gold-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-obsidian">
                    Aktuell
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-cream/40">
                ab {tier.minSales} Verkäufen · {tier.cashPercent}% Cash
                {tier.fixedCashCents > 0 && ` + ${formatEuro(tier.fixedCashCents)}`}
              </div>
              {tier.perks.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {tier.perks.map((perk, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-cream/60"
                    >
                      <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold-300/70" />
                      {perk}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Ausstehend",
      className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    },
    approved: {
      label: "Genehmigt",
      className: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    },
    paid: {
      label: "Ausgezahlt",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    },
    rejected: {
      label: "Abgelehnt",
      className: "border-red-400/30 bg-red-400/10 text-red-300",
    },
  };
  const s = map[status] ?? {
    label: status,
    className: "border-white/10 bg-white/5 text-cream/50",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.className}`}
    >
      {s.label}
    </span>
  );
}

function Payouts({
  payouts,
  balanceCents,
}: {
  payouts: AffiliatePayout[];
  balanceCents: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onRequest() {
    setError(null);
    startTransition(async () => {
      const res = await requestPayout();
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.error ?? "Etwas ist schiefgelaufen.");
      }
    });
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gold-200/80">
          <Banknote className="h-4 w-4" />
          Auszahlungen
        </div>
        <button
          type="button"
          onClick={onRequest}
          disabled={balanceCents <= 0 || pending || done}
          className="inline-flex items-center gap-2 rounded-full bg-gold-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-obsidian transition hover:bg-gold-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wallet className="h-3.5 w-3.5" />
          )}
          {done ? "Angefordert" : `Auszahlung anfordern (${formatEuro(balanceCents)})`}
        </button>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
      {done && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-300">
          <Check className="h-3.5 w-3.5" />
          Deine Auszahlung wurde angefordert und wird geprüft.
        </p>
      )}

      {payouts.length === 0 ? (
        <p className="mt-4 text-sm text-cream/40">
          Noch keine Auszahlungen. Sobald du Guthaben hast, kannst du es hier
          anfordern.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[11px] font-bold uppercase tracking-widest text-cream/40">
                <th className="pb-2 pr-4 font-bold">Datum</th>
                <th className="pb-2 pr-4 font-bold">Betrag</th>
                <th className="pb-2 pr-4 font-bold">Methode</th>
                <th className="pb-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-4 text-cream/60">
                    {new Date(p.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td className="py-3 pr-4 font-bold text-cream">
                    {formatEuro(p.amountCents)}
                  </td>
                  <td className="py-3 pr-4 uppercase text-cream/50">{p.method}</td>
                  <td className="py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
