import { trustpilotUrl } from "@/lib/env";

export type TrustpilotReview = {
  author: string;
  title: string;
  text: string;
  rating: number;
  date: string;
};

/**
 * Public profile data — synced from de.trustpilot.com/review/aigoldmining.com.
 * Last synced: 2026-06-28. Score/count MUST match the live profile (the section
 * claims "echte Bewertungen … kein Fake-Social-Proof"). "Gut" is Trustpilot's
 * official German label for the 3.8–4.2 band; the gap between a 4.1 score and
 * all-5-star reviews is normal (Trustpilot uses a weighted, not flat, average).
 */
export const trustpilotProfile = {
  trustScore: 4.1,
  reviewCount: 5,
  starsLabel: "Gut",
  profileUrl: trustpilotUrl,
  reviews: [
    {
      author: "Julia Trost",
      title: "Alles super",
      text: "Alles super. Absolute Empfehlung!",
      rating: 5,
      date: "2026-06-16",
    },
    {
      author: "Benni",
      title: "Nichts auszusetzen",
      text: "Mit der Hilfe von AI Goldmining habe ich angefangen mich nebenbei für die Zukunft abzusichern. Ich war anfangs skeptisch, weil es sich so einfach angehört hat — aber es sind Methoden, die umgesetzt werden müssen und somit zu Erfolg führen. Ich bin sehr zufrieden und kann es nur empfehlen.",
      rating: 5,
      date: "2026-05-10",
    },
    {
      author: "Samuel Debes",
      title: "Super!",
      text: "AI Goldmining war super, sehr vertrauenswürdig.",
      rating: 5,
      date: "2026-05-08",
    },
    {
      author: "Max Seldis",
      title: "Durch diese Hilfe",
      text: "Durch diese Hilfe habe ich das Richtige für mich gefunden und kann endlich das machen, worauf ich Bock habe. Es ist alles detailliert und bis ins kleinste Detail erklärt. Kann ich nur weiterempfehlen.",
      rating: 5,
      date: "2026-05-08",
    },
    // Note: the profile has 5 reviews total (see reviewCount); we display the 4
    // newest in a 2x2 grid. The 5th remains visible via the "all reviews" link.
  ] satisfies TrustpilotReview[],
} as const;
