import { NextResponse } from "next/server";
import { grantFreebieCourse } from "@/lib/freebies";
import { confirmNewsletter } from "@/lib/newsletter";
import { absoluteUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const confirmation = await confirmNewsletter(token);
  const source = confirmation?.source ?? "";
  if (confirmation?.userId && source.startsWith("freebie:")) {
    const slug = source.slice("freebie:".length).trim();
    if (slug) {
      const granted = await grantFreebieCourse(confirmation.userId, slug);
      return NextResponse.redirect(
        absoluteUrl(
          granted
            ? `/db/kurse/${slug}?freebie=claimed`
            : `/freebie/${slug}?status=confirmed&error=grant`
        )
      );
    }
  }
  return NextResponse.redirect(
    absoluteUrl(`/newsletter?status=${confirmation ? "confirmed" : "invalid"}`)
  );
}
