import { Users, UserCheck, ShoppingBag } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { getSupabaseAdminClient } from "@/lib/supabase";
import {
  CustomersTable,
  type CustomerRow,
  type CustomerPurchase,
  type CourseOption,
} from "@/components/admin/crm/customers-table";

export const dynamic = "force-dynamic";

type DbProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  city: string | null;
  goal: string | null;
  onboarding_complete: boolean | null;
  created_at: string;
};

type DbPurchase = {
  id: string;
  user_id: string | null;
  course_slug: string;
  amount_total: number | null;
  currency: string | null;
  status: string;
  created_at: string;
};

type DbCourse = {
  slug: string;
  title: string;
  is_active: boolean | null;
};

type DbTelegram = {
  user_id: string;
  status: string | null;
  current_period_end: string | null;
};

export default async function KundenPage() {
  const admin = getSupabaseAdminClient();

  let profiles: DbProfile[] = [];
  let purchases: DbPurchase[] = [];
  let courses: DbCourse[] = [];
  let telegram: DbTelegram[] = [];

  if (admin) {
    const [profileRes, purchaseRes, courseRes, telegramRes] = await Promise.all([
      admin.from("profiles").select("*").order("created_at", { ascending: false }),
      admin
        .from("purchases")
        .select("id, user_id, course_slug, amount_total, currency, status, created_at")
        .order("created_at", { ascending: false }),
      admin.from("courses").select("slug, title, is_active").order("title"),
      admin
        .from("telegram_subscriptions")
        .select("user_id, status, current_period_end"),
    ]);

    profiles = (profileRes.data ?? []) as DbProfile[];
    purchases = (purchaseRes.data ?? []) as DbPurchase[];
    courses = (courseRes.data ?? []) as DbCourse[];
    telegram = (telegramRes.data ?? []) as DbTelegram[];
  }

  // Group purchases by user
  const purchasesByUser = new Map<string, CustomerPurchase[]>();
  for (const p of purchases) {
    if (!p.user_id) continue;
    const list = purchasesByUser.get(p.user_id) ?? [];
    list.push({
      id: p.id,
      courseSlug: p.course_slug,
      amountTotal: p.amount_total ?? 0,
      currency: p.currency,
      status: p.status,
      createdAt: p.created_at,
    });
    purchasesByUser.set(p.user_id, list);
  }

  const telegramByUser = new Map<string, DbTelegram>();
  for (const t of telegram) telegramByUser.set(t.user_id, t);

  // KPIs
  const memberCount = profiles.length;
  const onboardedCount = profiles.filter((p) => p.onboarding_complete).length;
  const buyerIds = new Set(
    purchases
      .filter((p) => p.status === "paid" && p.user_id)
      .map((p) => p.user_id as string)
  );

  const courseOptions: CourseOption[] = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
  }));

  const rows: CustomerRow[] = profiles.map((p) => {
    const list = purchasesByUser.get(p.id) ?? [];
    const paidList = list.filter((x) => x.status === "paid");
    const tg = telegramByUser.get(p.id);
    return {
      id: p.id,
      email: p.email ?? "—",
      fullName: p.full_name,
      city: p.city,
      goal: p.goal,
      onboardingComplete: Boolean(p.onboarding_complete),
      createdAt: p.created_at,
      paidCount: paidList.length,
      purchases: list,
      telegramStatus: tg?.status ?? null,
      telegramPeriodEnd: tg?.current_period_end ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Verkauf"
        title="Kunden"
        description="Mitglieder, ihre Käufe und manuelle Kursfreischaltungen verwalten."
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Mitglieder gesamt" value={memberCount} icon={Users} />
        <StatCard label="Onboarded" value={onboardedCount} icon={UserCheck} />
        <StatCard label="Käufer" value={buyerIds.size} icon={ShoppingBag} />
      </div>

      <div className="mt-6">
        <CustomersTable rows={rows} courseOptions={courseOptions} />
      </div>
    </div>
  );
}
