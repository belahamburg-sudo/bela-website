import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { getAllTickets } from "./actions";
import { SupportAdminClient } from "./support-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  await requireAdmin();

  const tickets = await getAllTickets();

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Kommunikation"
        title="Support-Tickets"
        description="Verwalte Anfragen deiner Mitglieder, antworte auf Tickets und behalte den Überblick."
      />

      <div className="mt-8">
        <SupportAdminClient initialTickets={tickets} />
      </div>
    </div>
  );
}
