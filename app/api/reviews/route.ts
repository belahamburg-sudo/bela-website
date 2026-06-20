import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

type ReviewRow = {
  id: string;
  course_slug: string;
  author_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  photo_url: string | null;
  is_verified: boolean;
  created_at: string;
};

// GET /api/reviews?course=slug — published reviews + aggregate.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const course = searchParams.get("course");
  if (!course) {
    return NextResponse.json({ message: "course fehlt." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ reviews: [], count: 0, average: 0, demo: true });
  }

  const { data, error } = await admin
    .from("course_reviews")
    .select("id, course_slug, author_name, rating, title, body, photo_url, is_verified, created_at")
    .eq("course_slug", course)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ reviews: [], count: 0, average: 0 });
  }

  const reviews = (data ?? []) as ReviewRow[];
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  return NextResponse.json({ reviews, count, average: Math.round(average * 10) / 10 });
}

// POST /api/reviews — submit a verified review (buyers only).
export async function POST(request: Request) {
  const body = (await request.json()) as {
    courseSlug?: string;
    rating?: number;
    title?: string;
    text?: string;
  };

  const courseSlug = body.courseSlug?.trim();
  const rating = Math.round(Number(body.rating));
  if (!courseSlug || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Ungültige Bewertung." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Bewertungen sind nicht verfügbar." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Bitte melde dich an, um zu bewerten." }, { status: 401 });
  }

  const rl = await checkRateLimit({
    bucket: "reviews",
    identifier: user.id,
    limit: 10,
    windowSeconds: 3600,
  });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds ?? 3600);

  // Only buyers may review (verified reviews).
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .eq("status", "paid")
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json(
      { message: "Nur Käufer dieses Kurses können eine Bewertung abgeben." },
      { status: 403 }
    );
  }

  // Author name from profile, falling back to the email prefix.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const authorName = profile?.full_name || user.email?.split("@")[0] || "Mitglied";

  // Write with the service role AFTER the auth + purchase checks above. Direct
  // client writes to course_reviews are blocked by RLS (migration_024), so the
  // "buyers only / verified" gate can't be bypassed by calling Supabase directly
  // and self-setting is_verified / is_published.
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "Bewertungen sind nicht verfügbar." }, { status: 503 });
  }

  const { error } = await admin.from("course_reviews").upsert(
    {
      course_slug: courseSlug,
      user_id: user.id,
      author_name: authorName,
      rating,
      title: body.title?.trim().slice(0, 120) || null,
      body: body.text?.trim().slice(0, 2000) || null,
      is_verified: true,
      is_published: true,
    },
    { onConflict: "course_slug,user_id" }
  );

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
