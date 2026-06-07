import { UserPlus, Mail, Radio, Users2, Sparkles } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { LeadsManager, type LeadRow } from "@/components/admin/crm/leads-manager";

export const dynamic = "force-dynamic";

type DbLead = {
  id: string;
  email: string;
  name: string | null;
  source: string;
  status: string;
  created_at: string;
};

export default async function LeadsPage() {
  const admin = getSupabaseAdminClient();

  let leads: DbLead[] = [];

  if (admin) {
    const { data } = await admin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    leads = (data ?? []) as DbLead[];
  }

  const total = leads.length;
  const bySource = (source: string) =>
    leads.filter((l) => l.source === source).length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newThisWeek = leads.filter((l) => new Date(l.created_at) >= weekAgo).length;

  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    email: l.email,
    name: l.name,
    source: l.source,
    status: l.status,
    createdAt: l.created_at,
  }));

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Verkauf"
        title="Leads"
        description="Interessenten aus Newsletter, Webinaren und Community im Blick."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Leads gesamt" value={total} icon={UserPlus} />
        <StatCard label="Newsletter" value={bySource("newsletter")} icon={Mail} />
        <StatCard label="Webinar" value={bySource("webinar")} icon={Radio} />
        <StatCard label="Community" value={bySource("community")} icon={Users2} />
        <StatCard
          label="Neu diese Woche"
          value={newThisWeek}
          icon={Sparkles}
          hint="letzte 7 Tage"
        />
      </div>

      <div className="mt-6">
        <LeadsManager rows={rows} />
      </div>
    </div>
  );
}
