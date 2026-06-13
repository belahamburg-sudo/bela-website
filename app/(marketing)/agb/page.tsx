import { LegalTextPage } from "@/components/legal-text-page";

// Rendered at build time (reads the external .txt from public/legal via fs).
export const dynamic = "force-static";

export default function AgbPage() {
  return <LegalTextPage slug="agb" eyebrow="AGB" />;
}
