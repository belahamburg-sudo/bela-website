import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { getActiveWebinar } from "@/lib/webinar";

/** Formats an ISO date as e.g. "Mittwoch, 18. Juni 2026, 19:00 Uhr". */
function formatWebinarDate(startsAt: string | null): string | null {
  if (!startsAt) return null;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.toLocaleString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })} Uhr`;
}

/**
 * Reusable, on-brand webinar banner for marketing pages.
 * Renders nothing when no webinar is active.
 */
export async function WebinarCta() {
  const webinar = await getActiveWebinar();
  if (!webinar) return null;

  const formattedDate = formatWebinarDate(webinar.startsAt);
  const href = webinar.url ?? "/webinar#anmeldung";
  const isExternal = href.startsWith("http");

  return (
    <section className="bg-obsidian px-6 py-12">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gold-300/25 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-8 backdrop-blur-md sm:p-10">
        {/* Gold glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{ background: "radial-gradient(ellipse 60% 80% at 20% 0%, rgba(201, 169, 97,0.12) 0%, transparent 70%)" }}
        />

        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="min-w-0">
            <p className="eyebrow mb-3">Kostenloses Webinar</p>
            <h3
              className="font-heading font-extrabold tracking-gta leading-[1.05] text-cream"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)" }}
            >
              {webinar.title}
            </h3>
            {formattedDate && (
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gold-100">
                <CalendarClock className="h-4 w-4 text-gold-300/80 shrink-0" />
                {formattedDate}
              </span>
            )}
          </div>

          <Link
            href={href}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="btn-shimmer group inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:brightness-110 shadow-[0_0_30px_rgba(201, 169, 97,0.35)] relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative">Platz sichern</span>
            <span className="relative">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
