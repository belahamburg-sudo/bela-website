import { LegalTextPage } from "@/components/legal-text-page";

// Rendered at build time (reads the external .txt from public/legal via fs).
export const dynamic = "force-static";

export default function ImpressumPage() {
  return <LegalTextPage slug="impressum" eyebrow="Impressum" />;
}
