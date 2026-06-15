import { NextResponse } from "next/server";
import { calculateDiscountCents, resolvePromoCode } from "@/lib/promo";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Throttle to stop brute-force enumeration of valid promo codes.
    const limited = await checkRateLimit({
      bucket: "promo-validate",
      identifier: clientIp(request),
      limit: 30,
      windowSeconds: 10 * 60,
    });
    if (!limited.allowed) {
      return rateLimitResponse(limited.retryAfterSeconds ?? 600);
    }

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
