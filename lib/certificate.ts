import { createHash } from "node:crypto";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { absoluteUrl } from "./utils";

export type CertificateInput = {
  name: string;
  courseTitle: string;
  dateStr: string;
  certId: string;
};

// Brand palette.
const OBSIDIAN = rgb(0.039, 0.031, 0.024);
const PANEL = rgb(0.07, 0.058, 0.04);
const GOLD = rgb(0.91, 0.753, 0.251);
const GOLD_SOFT = rgb(0.74, 0.62, 0.36);
const CREAM = rgb(0.93, 0.86, 0.72);
const MUTED = rgb(0.62, 0.54, 0.41);

export function certificateId(userId: string, courseSlug: string): string {
  const hex = createHash("sha256").update(`${userId}:${courseSlug}`).digest("hex").toUpperCase();
  return `AG-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

// Fetch over HTTP (not fs): Vercel doesn't bundle public/ into serverless
// functions, but the static asset is reachable at the site origin.
async function loadAsset(name: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(absoluteUrl(`/assets/${name}`));
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

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

function fit(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 4 && font.widthOfTextAtSize(out + "…", size) > maxWidth) out = out.slice(0, -1);
  return out + "…";
}

/** Generate a branded A4-landscape completion certificate as PDF bytes. */
export async function generateCertificatePdf(input: CertificateInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const [logoBytes, sigBytes] = await Promise.all([
    loadAsset("logo-ai-goldmining.png"),
    loadAsset("bela-signature-cream.png"),
  ]);
  const logo = logoBytes ? await pdf.embedPng(logoBytes).catch(() => null) : null;
  const sig = sigBytes ? await pdf.embedPng(sigBytes).catch(() => null) : null;

  // Background + inset panel + double gold frame.
  page.drawRectangle({ x: 0, y: 0, width, height, color: OBSIDIAN });
  page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, color: PANEL });
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: GOLD, borderWidth: 2, borderOpacity: 0.9 });
  page.drawRectangle({ x: 32, y: 32, width: width - 64, height: height - 64, borderColor: GOLD, borderWidth: 0.5, borderOpacity: 0.4 });

  // Corner accents.
  const corner = (cx: number, cy: number, dx: number, dy: number) => {
    page.drawLine({ start: { x: cx, y: cy }, end: { x: cx + dx, y: cy }, thickness: 1.5, color: GOLD, opacity: 0.8 });
    page.drawLine({ start: { x: cx, y: cy }, end: { x: cx, y: cy + dy }, thickness: 1.5, color: GOLD, opacity: 0.8 });
  };
  corner(40, 40, 26, 26);
  corner(width - 40, 40, -26, 26);
  corner(40, height - 40, 26, -26);
  corner(width - 40, height - 40, -26, -26);

  const cx = width / 2;
  const inner = width - 160;

  // Logo.
  if (logo) {
    const lw = 196;
    const lh = lw * (logo.height / logo.width);
    page.drawImage(logo, { x: cx - lw / 2, y: height - 66 - lh, width: lw, height: lh });
  } else {
    drawCenteredTracked(page, "AI GOLDMINING", height - 84, bold, 15, GOLD, 6);
  }

  // Title + divider.
  drawCenteredTracked(page, "ZERTIFIKAT", height - 168, bold, 40, CREAM, 12);
  page.drawRectangle({ x: cx - 46, y: height - 186, width: 92, height: 2, color: GOLD });

  // Body.
  drawCenteredTracked(page, "HIERMIT WIRD BESTÄTIGT, DASS", height - 224, helv, 11, MUTED, 3);
  drawCenteredTracked(page, input.name, height - 270, bold, 32, GOLD, 1);
  drawCenteredTracked(page, "den folgenden Kurs erfolgreich abgeschlossen hat", height - 304, helv, 12, MUTED, 1);
  drawCenteredTracked(page, fit(input.courseTitle, bold, 21, inner), height - 342, bold, 21, CREAM, 1);

  // Verified seal (gold ring + checkmark), centered above the footer row.
  const sealY = 168;
  page.drawCircle({ x: cx, y: sealY, size: 27, borderColor: GOLD, borderWidth: 1.5, borderOpacity: 0.95 });
  page.drawCircle({ x: cx, y: sealY, size: 21, borderColor: GOLD, borderWidth: 0.5, borderOpacity: 0.5 });
  page.drawLine({ start: { x: cx - 9, y: sealY + 1 }, end: { x: cx - 3, y: sealY - 7 }, thickness: 2.4, color: GOLD, lineCap: 1 });
  page.drawLine({ start: { x: cx - 3, y: sealY - 7 }, end: { x: cx + 11, y: sealY + 9 }, thickness: 2.4, color: GOLD, lineCap: 1 });

  // Footer signature row.
  const baseY = 96;
  const colW = 210;
  const leftCx = 120 + colW / 2;
  const rightCx = width - 120 - colW / 2;
  const centerInCol = (text: string, ccx: number, y: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: ccx - w / 2, y, size, font, color });
  };

  page.drawRectangle({ x: leftCx - colW / 2, y: baseY, width: colW, height: 0.75, color: GOLD_SOFT, opacity: 0.7 });
  centerInCol(input.dateStr, leftCx, baseY + 9, helv, 12, CREAM);
  centerInCol("DATUM", leftCx, baseY - 15, helv, 8, MUTED);

  page.drawRectangle({ x: rightCx - colW / 2, y: baseY, width: colW, height: 0.75, color: GOLD_SOFT, opacity: 0.7 });
  if (sig) {
    const sw = 150;
    const sh = sw * (sig.height / sig.width);
    page.drawImage(sig, { x: rightCx - sw / 2, y: baseY + 6, width: sw, height: sh });
  } else {
    centerInCol("B. Goldmann", rightCx, baseY + 9, bold, 13, CREAM);
  }
  centerInCol("BELA GOLDMANN · GRÜNDER", rightCx, baseY - 15, helv, 8, MUTED);

  // Verification footer.
  drawCenteredTracked(page, `ZERTIFIKAT-ID: ${input.certId}   ·   AIGOLDMINING.COM`, 54, helv, 8, MUTED, 1.5);

  pdf.setTitle(`Zertifikat – ${input.courseTitle}`);
  pdf.setAuthor("AI Goldmining");
  pdf.setSubject(`Abschlusszertifikat für ${input.name}`);
  pdf.setKeywords([`cert:${input.certId}`, `name:${input.name}`, `course:${input.courseTitle}`]);

  return pdf.save();
}
