import { Users, Wallet, TrendingUp, Share2, Layers, Percent } from "lucide-react";
import { PageHeader, StatCard, Panel, AdminBadge, EmptyState } from "@/components/admin/ui";
import { listAffiliatesAdmin, getAffiliateTiers } from "@/lib/affiliate";
import { formatEuro } from "@/lib/utils";
import { AffiliatesTable } from "@/components/admin/affiliate/affiliates-table";
import { CreateAffiliate } from "@/components/admin/affiliate/create-affiliate";

export const dynamic = "force-dynamic";

export default async function AffiliatePage() {
  const [rows, tiers] = await Promise.all([
    listAffiliatesAdmin(),
    getAffiliateTiers(),
  ]);

  const totalAffiliates = rows.length;
  const openBalance = rows.reduce((s, r) => s + (r.balanceCents ?? 0), 0);
  const lifetimePaid = rows.reduce((s, r) => s + (r.lifetimeEarnedCents ?? 0), 0);
  const totalReferrals = rows.reduce((s, r) => s + (r.stats.referralCount ?? 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Partner-Programm"
        title="Affiliates"
        description="Verwalte Partner, Provisionen, Auszahlungen und Gutschein-Codes."
        actions={<CreateAffiliate />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Affiliates gesamt"
          value={totalAffiliates}
          icon={Users}
          hint="aktive Partner"
        />
        <StatCard
          label="Offenes Guthaben"
          value={formatEuro(openBalance)}
          icon={Wallet}
          hint="Summe Balance"
        />
        <StatCard
          label="Lifetime verdient"
          value={formatEuro(lifetimePaid)}
          icon={TrendingUp}
          hint="kumuliert"
        />
        <StatCard
          label="Empfehlungen gesamt"
          value={totalReferrals}
          icon={Share2}
          hint="über alle Partner"
        />
      </div>

      <AffiliatesTable rows={rows} tiers={tiers} />

      <Panel
        title="Tiers"
        description="Provisions-Stufen des Partner-Programms"
        noPadding
      >
        {tiers.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Keine Tiers konfiguriert"
            description="Lege Tiers in der Datenbank an, um Partner automatisch einzustufen."
          />
        ) : (
          <div className="divide-y divide-white/5">
            {tiers.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cream/90">{t.name}</span>
                    <AdminBadge tone="gold">ab {t.minSales} Verkäufe</AdminBadge>
                  </div>
                  {t.perks.length > 0 && (
                    <div className="mt-1 text-xs text-cream/40">
                      {t.perks.join(" · ")}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1 text-cream/70">
                    <Percent className="h-3.5 w-3.5 text-gold-300/60" />
                    {t.cashPercent}% Cash
                  </span>
                  {t.fixedCashCents > 0 && (
                    <span className="text-cream/60">
                      + {formatEuro(t.fixedCashCents)} fix
                    </span>
                  )}
                  {t.selfDiscountPercent > 0 && (
                    <span className="text-cream/50">
                      {t.selfDiscountPercent}% Eigenrabatt
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
