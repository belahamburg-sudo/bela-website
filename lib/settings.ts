import { getSupabaseAdminClient } from "./supabase";

/**
 * Typed access to the `site_settings` key/value (jsonb) store. Each setting is a
 * small JSON object under a string key. Consumers read through getSiteSettings()
 * and fall back to sensible defaults so the site never breaks on a missing row.
 */

export type AnnouncementSetting = {
  enabled: boolean;
  text: string;
  href: string;
};

export type SiteSettings = {
  heroHeadline: string | null;
  heroSubline: string | null;
  announcement: AnnouncementSetting;
  featuredCourseSlug: string | null;
  telegramFreeUrl: string | null;
  telegramPaidUrl: string | null;
  contactEmail: string | null;
  promoBanner: AnnouncementSetting;
};

type RawSettings = Record<string, Record<string, unknown>>;

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function announcement(raw: Record<string, unknown> | undefined): AnnouncementSetting {
  return {
    enabled: Boolean(raw?.enabled),
    text: str(raw?.text) ?? "",
    href: str(raw?.href) ?? "",
  };
}

/** Load every setting row into a key→value map (service role). */
export async function getRawSiteSettings(): Promise<RawSettings> {
  const admin = getSupabaseAdminClient();
  if (!admin) return {};
  try {
    const { data } = await admin.from("site_settings").select("key, value");
    const out: RawSettings = {};
    for (const row of (data ?? []) as { key: string; value: Record<string, unknown> }[]) {
      out[row.key] = row.value ?? {};
    }
    return out;
  } catch {
    return {};
  }
}

/** Resolved, typed settings with defaults applied. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await getRawSiteSettings();
  return {
    heroHeadline: str(raw.hero?.headline) ?? str(raw.hero_headline?.value),
    heroSubline: str(raw.hero?.subline) ?? str(raw.hero_subline?.value),
    announcement: announcement(raw.announcement_bar ?? raw.announcement),
    featuredCourseSlug: str(raw.featured_course?.slug),
    telegramFreeUrl: str(raw.telegram?.free_url),
    telegramPaidUrl: str(raw.telegram?.paid_url),
    contactEmail: str(raw.contact?.email) ?? str(raw.contact_email?.value),
    promoBanner: announcement(raw.promo_banner),
  };
}
