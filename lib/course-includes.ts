/**
 * Parsing/serialising for a course's "Enthalten" bullet points, which may
 * optionally carry a link: "Label | https://…" (external) or
 * "Label -> /kurse/slug" (course cross-reference). Plain lines stay plain.
 *
 * Lives in a normal module (not a "use server" file) so both the client course
 * editor and the server actions can import it.
 */

/** Human-readable label for where the starter-catalog import reads from. */
export const IMPORT_SOURCE_LABEL =
  "lib/content.ts → courses[] (mitgelieferter Starter-Katalog)";

export function parseIncludeLine(
  raw: string
): { label: string; href: string | null } | null {
  const line = raw.trim();
  if (!line) return null;

  // Split on the first " | " or " -> " delimiter only.
  const match = line.match(/^(.*?)\s*(?:\||->)\s*(\S.*)$/);
  if (match) {
    const label = match[1].trim();
    const href = match[2].trim();
    if (label && href) return { label, href };
    // Delimiter present but one side empty → treat whole line as plain label.
    return { label: line.replace(/\s*(?:\||->)\s*$/, "").trim() || line, href: null };
  }
  return { label: line, href: null };
}

/** Serialise parsed include points back into clean canonical lines for storage. */
export function serializeIncludes(lines: string[]): string[] {
  return lines
    .map((l) => parseIncludeLine(l))
    .filter((p): p is { label: string; href: string } => Boolean(p))
    .map((p) => (p.href ? `${p.label} | ${p.href}` : p.label));
}
