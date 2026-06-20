import { createHash } from "node:crypto";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type CertificateInput = {
  name: string;
  courseTitle: string;
  dateStr: string;
  certId: string;
};

// Brand palette (mirrors the site: obsidian / gold / cream).
const OBSIDIAN = rgb(0.039, 0.031, 0.024);
const GOLD = rgb(0.91, 0.753, 0.251);
const CREAM = rgb(0.91, 0.835, 0.69);
const MUTED = rgb(0.659, 0.565, 0.439);

/** Stable, verifiable certificate id derived from user + course (no DB row needed). */
export function certificateId(userId: string, courseSlug: string): string {
  const hex = createHash("sha256").update(`${userId}:${courseSlug}`).digest("hex").toUpperCase();
  return `AG-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

/** Draw centered text with GTA-style letter spacing (pdf-lib has no native tracking). */
function drawCenteredTracked(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  tracking = 0
) {
  const chars = [...text];
  const widths = chars.map((ch) => font.widthOfTextAtSize(ch, size));
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
  let x = (page.getWidth() - total) / 2;
  chars.forEach((ch, i) => {
    page.drawText(ch, { x, y, size, font, color });
    x += widths[i] + tracking;
  });
}

/** Truncate a long course title so it always fits on one centered line. */
function fit(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 4 && font.widthOfTextAtSize(out + "…", size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return out + "…";
}

/** Generate a branded A4-landscape completion certificate as PDF bytes. */
export async function generateCertificatePdf(input: CertificateInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 landscape (pt)
  const { width, height } = page.getSize();

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const oblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // Background + double gold frame.
  page.drawRectangle({ x: 0, y: 0, width, height, color: OBSIDIAN });
  page.drawRectangle({ x: 26, y: 26, width: width - 52, height: height - 52, borderColor: GOLD, borderWidth: 2, borderOpacity: 0.9 });
  page.drawRectangle({ x: 34, y: 34, width: width - 68, height: height - 68, borderColor: GOLD, borderWidth: 0.5, borderOpacity: 0.45 });

  const inner = width - 2 * 60;

  // Brand wordmark.
  drawCenteredTracked(page, "AI GOLDMINING", height - 96, bold, 15, GOLD, 6);

  // Title + gold divider.
  drawCenteredTracked(page, "ZERTIFIKAT", height - 168, bold, 42, CREAM, 10);
  page.drawRectangle({ x: width / 2 - 40, y: height - 188, width: 80, height: 2, color: GOLD });

  // Body.
  drawCenteredTracked(page, "Hiermit wird bestätigt, dass", height - 232, helv, 13, MUTED, 1);
  drawCenteredTracked(page, input.name, height - 282, bold, 30, GOLD, 1);
  drawCenteredTracked(page, "den folgenden Kurs erfolgreich abgeschlossen hat:", height - 322, helv, 13, MUTED, 1);
  drawCenteredTracked(page, fit(input.courseTitle, bold, 20, inner), height - 360, bold, 20, CREAM, 1);

  // Signature + date row.
  const baseY = 120;
  const colW = 220;
  const leftCx = 60 + colW / 2;
  const rightCx = width - 60 - colW / 2;

  const centerInCol = (text: string, cx: number, y: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: cx - w / 2, y, size, font, color });
  };

  page.drawRectangle({ x: leftCx - colW / 2, y: baseY, width: colW, height: 0.75, color: MUTED, opacity: 0.6 });
  centerInCol(input.dateStr, leftCx, baseY + 8, helv, 12, CREAM);
  centerInCol("DATUM", leftCx, baseY - 16, helv, 8, MUTED);

  page.drawRectangle({ x: rightCx - colW / 2, y: baseY, width: colW, height: 0.75, color: MUTED, opacity: 0.6 });
  centerInCol("Bela Goldmann", rightCx, baseY + 8, oblique, 14, CREAM);
  centerInCol("AI GOLDMINING", rightCx, baseY - 16, helv, 8, MUTED);

  // Verification footer.
  drawCenteredTracked(page, `Zertifikat-ID: ${input.certId}   ·   aigoldmining.com`, 58, helv, 8, MUTED, 1);

  // Metadata.
  pdf.setTitle(`Zertifikat – ${input.courseTitle}`);
  pdf.setAuthor("AI Goldmining");
  pdf.setSubject(`Abschlusszertifikat für ${input.name}`);
  pdf.setKeywords([`cert:${input.certId}`, `name:${input.name}`, `course:${input.courseTitle}`]);

  return pdf.save();
}
