import { getSupabaseAdminClient } from "./supabase";
import { socialLinks } from "./env";
import { belaEmail, contactEmail } from "./email-addresses";

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

export type SocialLinks = {
  instagram: string;
  tiktok: string;
  youtube: string;
  telegram: string;
};

export type SiteSettings = {
  heroHeadline: string | null;
  heroSubline: string | null;
  announcement: AnnouncementSetting;
  featuredCourseSlug: string | null;
  telegramFreeUrl: string | null;
  telegramPaidUrl: string | null;
  contactEmail: string;
  belaEmail: string;
  promoBanner: AnnouncementSetting;
  socials: SocialLinks;
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

/**
 * Resolve the social-media links from the `socials` site_settings row, falling
 * back to the hardcoded brand defaults in lib/env.ts for any missing/empty value.
 */
function resolveSocials(raw: Record<string, unknown> | undefined): SocialLinks {
  return {
    instagram: str(raw?.instagram) ?? socialLinks.instagram,
    tiktok: str(raw?.tiktok) ?? socialLinks.tiktok,
    youtube: str(raw?.youtube) ?? socialLinks.youtube,
    telegram: str(raw?.telegram) ?? socialLinks.telegram,
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
    contactEmail: str(raw.contact?.email) ?? str(raw.contact_email?.value) ?? contactEmail,
    belaEmail: str(raw.bela?.email) ?? belaEmail,
    promoBanner: announcement(raw.promo_banner),
    socials: resolveSocials(raw.socials),
  };
}

/**
 * Effective social-media links (admin overrides + env defaults), for use in
 * server components like the footer so editing them in admin updates the site.
 */
export async function getEffectiveSocials(): Promise<SocialLinks> {
  const raw = await getRawSiteSettings();
  return resolveSocials(raw.socials);
}
