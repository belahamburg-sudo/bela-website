import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export type BuyerStamp = {
  name: string;
  email: string;
  orderId: string;
  date: string;
};

/**
 * Stamp every page of a PDF with the buyer's identity:
 *  - a visible footer on each page (name · email · order id · date)
 *  - a faint diagonal "Lizenziert für <email>" watermark
 *  - invisible document metadata (title/author/subject/keywords)
 *
 * Returns the stamped PDF bytes. Brief section 2, steps 3.
 */
export async function stampPdf(input: Uint8Array, buyer: BuyerStamp): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(input, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const footer = `Lizenziert für ${buyer.name} · ${buyer.email} · Bestell-ID ${buyer.orderId} · ${buyer.date}`;
  const diagonal = `Lizenziert für ${buyer.email}`;

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();

    // Faint diagonal watermark across the page.
    const dSize = Math.max(14, Math.min(28, width / 22));
    page.drawText(diagonal, {
      x: width * 0.12,
      y: height * 0.42,
      size: dSize,
      font,
      color: rgb(0.79, 0.66, 0.38),
      opacity: 0.07,
      rotate: degrees(35),
    });

    // Visible footer, centered.
    const fSize = 7;
    const fWidth = font.widthOfTextAtSize(footer, fSize);
    page.drawText(footer, {
      x: Math.max(8, (width - fWidth) / 2),
      y: 10,
      size: fSize,
      font,
      color: rgb(0.5, 0.45, 0.32),
      opacity: 0.7,
    });
  }

  // Invisible metadata (steganographic-ish — survives copy, not visible on page).
  pdf.setTitle(`AI Goldmining – lizenziert für ${buyer.email}`);
  pdf.setAuthor("AI Goldmining");
  pdf.setSubject(`Bestell-ID ${buyer.orderId} · ${buyer.name}`);
  pdf.setKeywords([
    `buyer:${buyer.email}`,
    `name:${buyer.name}`,
    `order:${buyer.orderId}`,
    `date:${buyer.date}`,
  ]);
  pdf.setProducer("AI Goldmining Watermark Pipeline");
  pdf.setCreator("AI Goldmining");

  return pdf.save();
}

export function isPdfPath(path: string): boolean {
  return /\.pdf(\?|$)/i.test(path);
}
