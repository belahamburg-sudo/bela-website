import { getSupabaseAdminClient } from "./supabase";

export type Webinar = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  startsAt: string | null;
  url: string | null;
  isActive: boolean;
};

type DbWebinar = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  starts_at: string | null;
  url: string | null;
  is_active: boolean;
};

function map(row: DbWebinar): Webinar {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    startsAt: row.starts_at,
    url: row.url,
    isActive: row.is_active,
  };
}

/**
 * The single webinar the public site should advertise: the active one with the
 * soonest upcoming start (falls back to the most recently created active row).
 * Returns null when nothing is scheduled — callers then hide webinar CTAs or
 * fall back to the static /webinar page.
 */
export async function getActiveWebinar(): Promise<Webinar | null> {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  try {
    const nowIso = new Date().toISOString();

    // Prefer an upcoming session.
    const upcoming = await admin
      .from("webinars")
      .select("id, title, subtitle, description, starts_at, url, is_active")
      .eq("is_active", true)
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (upcoming.data) return map(upcoming.data as DbWebinar);

    // Otherwise the latest active row (e.g. evergreen / on-demand).
    const latest = await admin
      .from("webinars")
      .select("id, title, subtitle, description, starts_at, url, is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return latest.data ? map(latest.data as DbWebinar) : null;
  } catch {
    return null;
  }
}
