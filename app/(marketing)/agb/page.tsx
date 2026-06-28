import type { Metadata } from "next";
import { LegalTextPage } from "@/components/legal-text-page";

export const metadata: Metadata = {
  title: "AGB | AI Goldmining",
  description:
    "Allgemeine Geschäftsbedingungen von AI Goldmining – Konditionen für Kurse, Webinar und digitale Produkte.",
  alternates: { canonical: "/agb" },
};

// Rendered at build time (reads the external .txt from public/legal via fs).
export const dynamic = "force-static";

export default function AgbPage() {
  return <LegalTextPage slug="agb" eyebrow="AGB" />;
}
