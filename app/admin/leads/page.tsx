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
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_path: string | null;
  ip: string | null;
  user_agent: string | null;
  ref_code: string | null;
};

type DbProfile = {
  id: string;
  email: string;
  full_name: string | null;
  city: string | null;
  goal: string | null;
  onboarding_complete: boolean | null;
  created_at: string;
};

const LEAD_COLUMNS =
  "id,email,name,source,status,created_at,utm_source,utm_medium,utm_campaign,utm_term,utm_content,referrer,landing_path,ip,user_agent,ref_code";

export default async function LeadsPage() {
  const admin = getSupabaseAdminClient();

  let leads: DbLead[] = [];
  let profiles: DbProfile[] = [];

  if (admin) {
    const [leadsRes, profilesRes] = await Promise.all([
      admin
        .from("leads")
        .select(LEAD_COLUMNS)
        .order("created_at", { ascending: false }),
      admin
        .from("profiles")
        .select("id,email,full_name,city,goal,onboarding_complete,created_at"),
    ]);
    leads = (leadsRes.data ?? []) as unknown as DbLead[];
    profiles = (profilesRes.data ?? []) as unknown as DbProfile[];
  }

  // email (lowercased) → profile, for joining lead data with member profiles.
  const profileByEmail = new Map<string, DbProfile>();
  for (const p of profiles) {
    if (p.email) profileByEmail.set(p.email.trim().toLowerCase(), p);
  }

  const total = leads.length;
  const bySource = (source: string) =>
    leads.filter((l) => l.source === source).length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newThisWeek = leads.filter((l) => new Date(l.created_at) >= weekAgo).length;

  const rows: LeadRow[] = leads.map((l) => {
    const profile = profileByEmail.get(l.email.trim().toLowerCase()) ?? null;
    return {
      id: l.id,
      email: l.email,
      name: l.name,
      source: l.source,
      status: l.status,
      createdAt: l.created_at,
      utmSource: l.utm_source,
      utmMedium: l.utm_medium,
      utmCampaign: l.utm_campaign,
      utmTerm: l.utm_term,
      utmContent: l.utm_content,
      referrer: l.referrer,
      landingPath: l.landing_path,
      ip: l.ip,
      userAgent: l.user_agent,
      refCode: l.ref_code,
      profileCity: profile?.city ?? null,
      profileGoal: profile?.goal ?? null,
      profileFullName: profile?.full_name ?? null,
      profileOnboardingComplete: profile?.onboarding_complete ?? null,
      profileCreatedAt: profile ? profile.created_at : null,
    };
  });

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
