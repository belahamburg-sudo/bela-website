export const REFERRAL_COOKIE_NAME = "ai-goldmining-ref";
export const REFERRAL_STORAGE_KEY = "ai-goldmining-ref";
export const REFERRAL_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  const code = raw?.trim().toUpperCase();
  return code ? code : null;
}

export function readReferralFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === REFERRAL_COOKIE_NAME) {
      return normalizeReferralCode(decodeURIComponent(rest.join("=")));
    }
  }
  return null;
}
