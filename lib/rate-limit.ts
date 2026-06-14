import { getSupabaseAdminClient } from "./supabase";

type RateLimitOptions = {
  bucket: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

/** Best-effort rate limit backed by Supabase (works across serverless instances). */
export async function checkRateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const admin = getSupabaseAdminClient();
  if (!admin) return { allowed: true };

  const key = `${opts.bucket}:${opts.identifier}`.slice(0, 200);
  const now = new Date();
  const windowStart = new Date(now.getTime() - opts.windowSeconds * 1000);

  const { data: row, error: readError } = await admin
    .from("rate_limits")
    .select("count, window_start")
    .eq("key", key)
    .maybeSingle();

  if (readError) {
    // Fail open so a missing migration does not take the site offline.
    return { allowed: true };
  }

  if (!row || new Date(row.window_start) < windowStart) {
    await admin.from("rate_limits").upsert({
      key,
      count: 1,
      window_start: now.toISOString(),
    });
    return { allowed: true };
  }

  if (row.count >= opts.limit) {
    return { allowed: false, retryAfterSeconds: opts.windowSeconds };
  }

  await admin
    .from("rate_limits")
    .update({ count: row.count + 1 })
    .eq("key", key);

  return { allowed: true };
}

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return new Response(
    JSON.stringify({ message: "Zu viele Anfragen. Bitte versuche es später erneut." }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfterSeconds),
      },
    }
  );
}
