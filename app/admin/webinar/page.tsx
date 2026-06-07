import { CalendarClock, CheckCircle2, CalendarRange } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { WebinarManager, type WebinarRow } from "@/components/admin/system/webinar-manager";

export const dynamic = "force-dynamic";

type WebinarDbRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  starts_at: string | null;
  url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export default async function WebinarPage() {
  const admin = getSupabaseAdminClient();

  let webinars: WebinarDbRow[] = [];

  if (admin) {
    const { data } = await admin
      .from("webinars")
      .select("*")
      .order("starts_at", { ascending: false, nullsFirst: false });
    webinars = (data ?? []) as WebinarDbRow[];
  }

  const rows: WebinarRow[] = webinars.map((w) => ({
    id: w.id,
    title: w.title,
    subtitle: w.subtitle,
    description: w.description,
    startsAt: w.starts_at,
    url: w.url,
    isActive: w.is_active,
    createdAt: w.created_at,
  }));

  const activeCount = rows.filter((r) => r.isActive).length;
  const now = Date.now();
  const upcomingCount = rows.filter(
    (r) => r.startsAt && new Date(r.startsAt).getTime() >= now
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Inhalte"
        title="Webinar"
        description="Verwalte Live-Webinare, die auf der Website beworben werden."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Webinare gesamt" value={rows.length} icon={CalendarClock} />
        <StatCard label="Aktiv" value={activeCount} icon={CheckCircle2} hint="öffentlich sichtbar" />
        <StatCard label="Anstehend" value={upcomingCount} icon={CalendarRange} hint="in der Zukunft" />
      </div>

      <div className="mt-6">
        <WebinarManager rows={rows} />
      </div>
    </div>
  );
}
