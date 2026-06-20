import { NextResponse } from "next/server";
import { unsubscribeNewsletter, verifyUnsubscribeToken } from "@/lib/newsletter";
import { absoluteUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token");

  // Require a valid signed token so a link can only unsubscribe the address it
  // was minted for — not any email an attacker types into the query string.
  if (!email || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.redirect(absoluteUrl(`/newsletter?status=invalid`));
  }

  await unsubscribeNewsletter(email);
  return NextResponse.redirect(absoluteUrl(`/newsletter?status=unsubscribed`));
}
