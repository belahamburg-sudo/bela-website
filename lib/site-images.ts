import { getSupabaseAdminClient } from "./supabase";

/**
 * Swappable website images ("Website-Bilder"). Each slot maps to a single
 * <Image> on a public page; the admin can replace it without touching code.
 * The override URL is stored in `site_settings` under the key `img:<key>` with
 * a value of `{ url: <publicUrl> }`. When no override exists the original
 * static asset (`defaultSrc`) is used, so the site never breaks.
 */

export type SiteImageSlot = {
  key: string;
  label: string;
  defaultSrc: string;
};

/** One entry per swappable image on the public About page. */
export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: "about_portrait",
    label: "Über mich · Portrait (Hero)",
    defaultSrc: "/assets/bela-portrait.jpeg",
  },
  {
    key: "about_timeline_1",
    label: "Über mich · Timeline 01 (Notizbuch / mit Vater)",
    defaultSrc: "/assets/bela-with-dad.jpeg",
  },
  {
    key: "about_timeline_2",
    label: "Über mich · Timeline 02 (Party Hamburg)",
    defaultSrc: "/assets/bela-party.jpg",
  },
  {
    key: "about_timeline_3",
    label: "Über mich · Timeline 03 (Seoul)",
    defaultSrc: "/assets/bela-seoul.jpeg",
  },
  {
    key: "about_timeline_4",
    label: "Über mich · Timeline 04 (Golf)",
    defaultSrc: "/assets/bela-golf-1.jpeg",
  },
  {
    key: "about_timeline_5",
    label: "Über mich · Timeline 05 (Wendepunkt AI)",
    defaultSrc: "/assets/bela-with-dad.jpeg",
  },
  {
    key: "about_timeline_6",
    label: "Über mich · Timeline 06 (Istanbul Terrasse)",
    defaultSrc: "/assets/bela-terrace.jpg",
  },
  {
    key: "about_lifestyle_1",
    label: "Über mich · Lifestyle 1 (Golf)",
    defaultSrc: "/assets/bela-golf-2.jpeg",
  },
  {
    key: "about_lifestyle_2",
    label: "Über mich · Lifestyle 2 (Seoul)",
    defaultSrc: "/assets/bela-seoul.jpeg",
  },
  {
    key: "about_lifestyle_3",
    label: "Über mich · Lifestyle 3 (Istanbul)",
    defaultSrc: "/assets/bela-terrace.jpg",
  },
  {
    key: "about_lifestyle_4",
    label: "Über mich · Lifestyle 4 (Hamburg)",
    defaultSrc: "/assets/bela-party.jpg",
  },
];

const SLOT_BY_KEY: Record<string, SiteImageSlot> = Object.fromEntries(
  SITE_IMAGE_SLOTS.map((s) => [s.key, s])
);

/** The `site_settings` row key that stores a slot's override. */
export function siteImageSettingKey(key: string): string {
  return `img:${key}`;
}

/** Read the raw override URLs for the given setting keys (service role). */
async function readOverrides(settingKeys: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (settingKeys.length === 0) return out;
  const admin = getSupabaseAdminClient();
  if (!admin) return out;
  try {
    const { data } = await admin
      .from("site_settings")
      .select("key, value")
      .in("key", settingKeys);
    for (const row of (data ?? []) as { key: string; value: Record<string, unknown> | null }[]) {
      const url = row.value?.url;
      if (typeof url === "string" && url.trim()) out.set(row.key, url.trim());
    }
  } catch {
    // fall back to defaults on any read error
  }
  return out;
}

/**
 * Effective URL for a single slot: the admin override if present, otherwise the
 * original static asset path. Unknown keys return an empty string.
 */
export async function getSiteImage(key: string): Promise<string> {
  const slot = SLOT_BY_KEY[key];
  if (!slot) return "";
  const overrides = await readOverrides([siteImageSettingKey(key)]);
  return overrides.get(siteImageSettingKey(key)) ?? slot.defaultSrc;
}

/** Effective URLs for every slot, keyed by slot key. */
export async function getSiteImages(): Promise<Record<string, string>> {
  const overrides = await readOverrides(SITE_IMAGE_SLOTS.map((s) => siteImageSettingKey(s.key)));
  const out: Record<string, string> = {};
  for (const slot of SITE_IMAGE_SLOTS) {
    out[slot.key] = overrides.get(siteImageSettingKey(slot.key)) ?? slot.defaultSrc;
  }
  return out;
}
