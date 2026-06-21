import { AuthGate } from "@/components/auth-gate";
import { SpatialBackground } from "@/components/spatial-background";
import { getMyTickets } from "./actions";
import { SupportClient } from "./support-client";

export const dynamic = "force-dynamic";

export default async function MemberSupportPage() {
  const tickets = await getMyTickets();

  return (
    <AuthGate>
      <section className="py-16 sm:py-24 relative overflow-hidden bg-obsidian min-h-screen">
        <SpatialBackground />
        <div className="container-shell relative z-10">
          <SupportClient initialTickets={tickets} />
        </div>
      </section>
    </AuthGate>
  );
}
