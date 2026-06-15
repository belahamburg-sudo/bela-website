import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  REFERRAL_COOKIE_NAME,
  REFERRAL_MAX_AGE_SECONDS,
  normalizeReferralCode,
} from "@/lib/referral";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const refCode = normalizeReferralCode(
    request.nextUrl.searchParams.get("ref") || request.nextUrl.searchParams.get("via")
  );
  if (refCode) {
    supabaseResponse.cookies.set(REFERRAL_COOKIE_NAME, refCode, {
      maxAge: REFERRAL_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
    });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this is the key call that keeps tokens alive
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
