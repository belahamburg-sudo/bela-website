import { NextResponse } from "next/server";
import { unsubscribeNewsletter } from "@/lib/newsletter";
import { absoluteUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email") ?? "";
  await unsubscribeNewsletter(email);
  return NextResponse.redirect(absoluteUrl(`/newsletter?status=unsubscribed`));
}
