import { PageHeader } from "@/components/admin/ui";
import { CoachIndexButton } from "@/components/admin/coach-index-button";

export const dynamic = "force-dynamic";

export default function AdminCoachPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="AI-Coach"
        title="Kurs-Coach Index"
        description="Indexiert die Kursinhalte (Beschreibungen, Module, Lektionen), damit der AI-Lern-Coach im Mitgliederbereich Fragen zu jedem gekauften Kurs beantworten kann. Nach inhaltlichen Änderungen einfach erneut ausführen."
      />

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <p className="mb-5 text-sm leading-relaxed text-cream/55">
          Der Coach beantwortet nur Fragen zu Kursen, die ein Mitglied besitzt, und ausschließlich
          auf Basis der hier indexierten Inhalte. Aktuell werden die Texte aus Kurs-/Modul-/
          Lektionsbeschreibungen verwendet (keine Video-Transkripte).
        </p>
        <CoachIndexButton />
      </div>
    </div>
  );
}
