import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, Send, ArrowRight } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { belaPrivateTelegram } from "@/lib/env";
import { absoluteUrl } from "@/lib/utils";
import {
  getAffiliateForUser,
  getAffiliateStats,
  getAffiliateTiers,
  getAffiliatePayouts,
} from "@/lib/affiliate";
import { AffiliateDashboard } from "@/components/affiliate/affiliate-dashboard";

export const dynamic = "force-dynamic";

export default async function AffiliatePage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return <InviteScreen />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/db/affiliate");

  const affiliate = await getAffiliateForUser(user.id);
  if (!affiliate) {
    return <InviteScreen />;
  }

  const [stats, tiers, payouts] = await Promise.all([
    getAffiliateStats(user.id),
    getAffiliateTiers(),
    getAffiliatePayouts(user.id),
  ]);

  // Withdrawable balance is derived (earned − payouts already made/pending), so
  // the displayed balance + payout button always match real earnings.
  const reservedCents = payouts
    .filter((p) => p.status !== "rejected" && p.status !== "failed")
    .reduce((s, p) => s + p.amountCents, 0);
  const affiliateView = {
    ...affiliate,
    balanceCents: Math.max(0, stats.earnedCents - reservedCents),
  };

  const shareLink = absoluteUrl(`/signup?ref=${affiliate.code ?? ""}`);

  return (
    <AffiliateDashboard
      affiliate={affiliateView}
      stats={stats}
      tiers={tiers}
      payouts={payouts}
      shareLink={shareLink}
    />
  );
}

/** Shown to members who are NOT yet in the affiliate program. */
function InviteScreen() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-16 text-center sm:py-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-300/20 bg-gold-300/[0.04]">
        <Lock className="h-7 w-7 text-gold-300/70" />
      </div>
      <h1 className="mt-6 font-heading text-3xl text-cream sm:text-4xl">
        Affiliate-Programm
      </h1>
      <p className="mt-4 text-cream/50">
        Das Affiliate-Programm ist auf Einladung. Als Affiliate verdienst du an
        jedem Kauf, den du bringst — mit deinem eigenen Link, Rabatt-Codes und
        Bonus-Stufen.
      </p>
      <p className="mt-3 text-cream/50">
        Du möchtest dabei sein? Schreib Bela auf Telegram, um eingeladen zu werden.
      </p>
      <Link
        href={belaPrivateTelegram}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-shimmer mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-obsidian shadow-[0_10px_40px_-10px_rgba(201,169,97,0.5)] transition hover:brightness-110"
      >
        <Send className="h-4 w-4" />
        Bela auf Telegram schreiben
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
