/**
 * Pure, environment-independent webinar date helpers.
 *
 * Every webinar time is authored AND displayed in Europe/Berlin, so the date
 * shows identically on the server-rendered marketing pages (Vercel runs in UTC),
 * the client-rendered hero, and the admin (whatever the admin's own timezone is).
 * Without pinning the zone, `toLocaleString` silently used UTC on the server and
 * local time on the client — the same webinar appeared at two different times.
 *
 * No server-only imports here, so this is safe to use from client components too.
 */

export const WEBINAR_TZ = "Europe/Berlin";

/** Milliseconds Europe/Berlin is ahead of UTC at the given instant (handles DST). */
function berlinOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WEBINAR_TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  let hour = get("hour");
  if (hour === 24) hour = 0; // some engines emit "24" for midnight
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
  return asUtc - utcMs;
}

/** Parse a `<input type="datetime-local">` value ("YYYY-MM-DDTHH:mm") as Berlin → UTC ISO. */
export function berlinLocalToIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const off = berlinOffsetMs(guess);
  let t = guess - off;
  const off2 = berlinOffsetMs(t); // refine across a DST boundary
  if (off2 !== off) t = guess - off2;
  return new Date(t).toISOString();
}

/** ISO timestamp → `datetime-local` value in Berlin ("YYYY-MM-DDTHH:mm"). */
export function isoToBerlinLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WEBINAR_TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  let hh = get("hour");
  if (hh === "24") hh = "00";
  return `${get("year")}-${get("month")}-${get("day")}T${hh}:${get("minute")}`;
}

/** Format an ISO timestamp in Europe/Berlin (de-DE). Returns null for empty/invalid. */
export function formatBerlin(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("de-DE", { ...opts, timeZone: WEBINAR_TZ });
}
