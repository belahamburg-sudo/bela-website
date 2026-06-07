/** Recipient segments for e-mail broadcasts (shared by server actions + UI). */

export type Segment = "all_members" | "all_leads" | "newsletter" | "buyers";

export const SEGMENT_LABELS: Record<Segment, string> = {
  all_members: "Alle Mitglieder",
  all_leads: "Alle Leads",
  newsletter: "Newsletter-Abonnenten",
  buyers: "Käufer",
};
