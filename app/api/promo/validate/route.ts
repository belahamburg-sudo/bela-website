import { NextResponse } from "next/server";
import { calculateDiscountCents, resolvePromoCode } from "@/lib/promo";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string; amountCents?: number };
    const code = body.code?.trim();
    if (!code) {
      return NextResponse.json({ valid: false, message: "Bitte einen Code eingeben." }, { status: 400 });
    }

    const promo = await resolvePromoCode(code);
    if (!promo) {
      return NextResponse.json({ valid: false, message: "Dieser Rabattcode ist ungültig." });
    }

    const amountCents = Math.max(0, body.amountCents ?? 0);
    const discountCents = calculateDiscountCents(amountCents, promo);

    return NextResponse.json({
      valid: true,
      code: promo.code,
      percentOff: promo.percentOff,
      amountOff: promo.amountOff,
      discountCents,
      totalCents: Math.max(0, amountCents - discountCents),
      source: promo.source,
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: error instanceof Error ? error.message : "Validierung fehlgeschlagen." },
      { status: 500 }
    );
  }
}
