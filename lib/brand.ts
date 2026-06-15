/** Canonical site logo — single source of truth for website + emails. */
export const SITE_LOGO_PATH = "/assets/logo-ai-goldmining-3d.png" as const;

export function resolveSiteLogoUrl(siteUrl?: string): string {
  const base = (siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com").replace(
    /\/$/,
    ""
  );
  return `${base}${SITE_LOGO_PATH}`;
}
