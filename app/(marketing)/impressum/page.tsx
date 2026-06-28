import type { Metadata } from "next";
import { LegalTextPage } from "@/components/legal-text-page";

export const metadata: Metadata = {
  title: "Impressum | AI Goldmining",
  description: "Impressum und Anbieterkennzeichnung von AI Goldmining.",
  alternates: { canonical: "/impressum" },
};

// Rendered at build time (reads the external .txt from public/legal via fs).
export const dynamic = "force-static";

export default function ImpressumPage() {
  return <LegalTextPage slug="impressum" eyebrow="Impressum" />;
}
