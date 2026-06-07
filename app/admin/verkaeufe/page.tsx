import { Banknote, ShoppingCart, Clock, CalendarRange } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { formatEuro } from "@/lib/utils";
import { SalesTable, type SaleRow } from "@/components/admin/crm/sales-table";

export const dynamic = "force-dynamic";

type PurchaseRow = {
  id: string;
  user_id: string | null;
  course_slug: string;
  stripe_session_id: string | null;
  stripe_customer_id: string | null;
  amount_total: number | null;
  currency: string | null;
  status: string;
  created_at: string;
};

type ProfileEmailRow = {
  id: string;
  email: string | null;
};

export default async function VerkaeufePage() {
  const admin = getSupabaseAdminClient();

  let purchases: PurchaseRow[] = [];
  const emailById = new Map<string, string>();

  if (admin) {
    const { data: purchaseData } = await admin
      .from("purchases")
      .select("*")
      .order("created_at", { ascending: false });

    purchases = (purchaseData ?? []) as PurchaseRow[];

    const userIds = Array.from(
      new Set(
        purchases
          .map((p) => p.user_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (userIds.length > 0) {
      const { data: profileData } = await admin
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      for (const profile of (profileData ?? []) as ProfileEmailRow[]) {
        if (profile.email) emailById.set(profile.id, profile.email);
      }
    }
  }

  // KPIs
  const paid = purchases.filter((p) => p.status === "paid");
  const pending = purchases.filter((p) => p.status === "pending");
  const revenueCents = paid.reduce((sum, p) => sum + (p.amount_total ?? 0), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRevenueCents = paid
    .filter((p) => new Date(p.created_at) >= monthStart)
    .reduce((sum, p) => sum + (p.amount_total ?? 0), 0);

  const rows: SaleRow[] = purchases.map((p) => ({
    id: p.id,
    courseSlug: p.course_slug,
    email: p.user_id ? emailById.get(p.user_id) ?? null : null,
    amountTotal: p.amount_total ?? 0,
    currency: p.currency,
    status: p.status,
    createdAt: p.created_at,
    stripeSessionId: p.stripe_session_id,
    stripeCustomerId: p.stripe_customer_id,
    userId: p.user_id,
  }));

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Verkauf"
        title="Verkäufe"
        description="Alle Transaktionen, Umsätze und Zahlungsstatus deiner Goldmine."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Gesamtumsatz"
          value={formatEuro(revenueCents)}
          icon={Banknote}
          hint="bezahlt"
        />
        <StatCard
          label="Verkäufe bezahlt"
          value={paid.length}
          icon={ShoppingCart}
        />
        <StatCard label="Offen" value={pending.length} icon={Clock} hint="ausstehend" />
        <StatCard
          label="Umsatz diesen Monat"
          value={formatEuro(monthRevenueCents)}
          icon={CalendarRange}
        />
      </div>

      <div className="mt-6">
        <SalesTable rows={rows} />
      </div>
    </div>
  );
}
