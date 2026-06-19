/** Support & website contact. */
export const contactEmail =
  process.env.EMAIL_CONTACT ||
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
  "contact@aigoldmining.com";

/** Personal / brand address (legal, onboarding, purchases). */
export const belaEmail =
  process.env.EMAIL_BELA ||
  process.env.NEXT_PUBLIC_BELA_EMAIL ||
  "bela@aigoldmining.com";

/** Automated system mails — replies go to contact@ via Reply-To. */
export const noreplyEmail =
  process.env.EMAIL_NOREPLY || "noreply@aigoldmining.com";

export function formatEmailFrom(displayName: string, address: string): string {
  return `${displayName} <${address}>`;
}

export const emailSenders = {
  brand: formatEmailFrom("AI Goldmining", contactEmail),
  bela: formatEmailFrom("Bela Goldmann", belaEmail),
  noreply: formatEmailFrom("AI Goldmining", noreplyEmail),
} as const;

/** Personal touch — from bela@, replies to bela@. */
const PERSONAL_TEMPLATES = new Set([
  "course-completed",
  "course-unlocked",
  "onboarding-complete",
  "purchase-confirmation",
  "re-engagement",
  "telegram-free-welcome",
  "telegram-paid-welcome",
]);

/** Pure automation — from noreply@, but Reply-To stays contact@ so users aren't stuck. */
const NOREPLY_TEMPLATES = new Set([
  "change-email",
  "checkout-abandoned",
  "invite-user",
  "magic-link",
  "newsletter-double-opt-in",
  "newsletter-unsubscribe-confirmed",
  "newsletter-welcome",
  "password-reset",
  "reauthentication",
  "signup-confirmation",
]);

export type EmailEnvelope = {
  from: string;
  replyTo: string;
};

/** Resolve From + Reply-To for a template. EMAIL_FROM overrides the sender only. */
export function resolveEmailEnvelope(
  template: string,
  overrides?: { from?: string; replyTo?: string }
): EmailEnvelope {
  const personal = PERSONAL_TEMPLATES.has(template);
  const automated = NOREPLY_TEMPLATES.has(template);

  const defaultFrom = personal
    ? emailSenders.bela
    : automated
      ? emailSenders.noreply
      : emailSenders.brand;

  const defaultReplyTo = personal ? belaEmail : contactEmail;

  if (overrides?.from || overrides?.replyTo) {
    return {
      from: overrides.from ?? process.env.EMAIL_FROM ?? defaultFrom,
      replyTo: overrides.replyTo ?? defaultReplyTo,
    };
  }

  return {
    from: process.env.EMAIL_FROM ?? defaultFrom,
    replyTo: defaultReplyTo,
  };
}
