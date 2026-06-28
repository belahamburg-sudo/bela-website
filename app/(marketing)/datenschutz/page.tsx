import type { Metadata } from "next";
import { LegalTextPage } from "@/components/legal-text-page";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | AI Goldmining",
  description:
    "Datenschutzerklärung von AI Goldmining – wie wir deine Daten verarbeiten und schützen.",
  alternates: { canonical: "/datenschutz" },
};

// Rendered at build time (reads the external .txt from public/legal via fs).
export const dynamic = "force-static";

export default function DatenschutzPage() {
  return <LegalTextPage slug="datenschutz" eyebrow="Datenschutz" />;
}
