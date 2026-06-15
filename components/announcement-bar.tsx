import Link from "next/link";
import { getSiteSettings, type AnnouncementSetting } from "@/lib/settings";

/**
 * Slim gold announcement bar shown at the very top of the marketing site.
 * Server component: reads the announcement setting and renders nothing when it
 * is disabled or has no text.
 */
export async function AnnouncementBar() {
  const { announcement } = await getSiteSettings();
  return <AnnouncementBarView announcement={announcement} />;
}

/** Pure presentational view — accepts the resolved announcement as a prop. */
export function AnnouncementBarView({
  announcement,
}: {
  announcement: AnnouncementSetting;
}) {
  if (!announcement.enabled || !announcement.text) return null;

  const content = (
    <span className="line-clamp-1 text-center text-xs font-semibold uppercase tracking-[0.12em] text-obsidian sm:text-[13px]">
      {announcement.text}
    </span>
  );

  return (
    <div className="relative z-[60] w-full bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400">
      <div className="container-shell">
        <div className="flex items-center justify-center px-4 py-2">
          {announcement.href ? (
            <Link
              href={announcement.href}
              className="focus-ring group inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
            >
              {content}
              <span
                aria-hidden
                className="text-xs font-bold text-obsidian transition-transform group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </Link>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}
