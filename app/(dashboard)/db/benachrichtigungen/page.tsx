import { AuthGate } from "@/components/auth-gate";
import { SpatialBackground } from "@/components/spatial-background";
import { NotificationList } from "./notification-list";
import { getNotifications } from "./actions";

export const metadata = {
  title: "Benachrichtigungen | AI Goldmining",
};

export default async function NotificationsPage() {
  const initial = await getNotifications(30, 0);

  return (
    <AuthGate>
      <section className="relative min-h-screen overflow-hidden bg-obsidian py-16 sm:py-24">
        <SpatialBackground />

        <div className="container-shell relative z-10">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-gold-300/30" />
              <span className="tac-label text-[9px] uppercase tracking-widest text-gold-300/60">
                Updates & Aktivitaet
              </span>
            </div>
            <h1 className="font-heading tracking-gta mb-4 text-4xl uppercase leading-tight text-cream md:text-6xl">
              BENACH&shy;RICHTI&shy;GUNGEN<span className="text-gold-300">.</span>
            </h1>
            <p className="max-w-2xl text-[10px] font-mono uppercase tracking-[0.2em] leading-relaxed text-cream/30">
              Alle deine Kurs-Updates, Achievements und System-Nachrichten auf einen Blick.
            </p>
          </div>

          {/* Client list component with load-more */}
          <NotificationList
            initialNotifications={initial.notifications}
            initialUnreadCount={initial.unreadCount}
          />
        </div>
      </section>
    </AuthGate>
  );
}
