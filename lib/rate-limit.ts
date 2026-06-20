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

  // Preferred path: a single ATOMIC SQL function. This closes the read-then-write
  // race where many concurrent requests each read count < limit and all proceed
  // (which would let a burst sail past the limit). Falls back to the best-effort
  // counter below if the function isn't deployed yet (migration_024 not applied).
  try {
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: key,
      p_window_seconds: opts.windowSeconds,
      p_limit: opts.limit,
    });
    if (!error && data) {
      const result = data as { allowed: boolean; retry_after?: number };
      return result.allowed
        ? { allowed: true }
        : { allowed: false, retryAfterSeconds: result.retry_after ?? opts.windowSeconds };
    }
  } catch {
    // fall through to the non-atomic fallback
  }

  // Fallback (non-atomic read-modify-write): kept so the limiter still works
  // before the RPC migration is applied. Fails open on any DB error so a missing
  // migration never takes the site offline.
  const now = new Date();
  const windowStart = new Date(now.getTime() - opts.windowSeconds * 1000);

  const { data: row, error: readError } = await admin
    .from("rate_limits")
    .select("count, window_start")
    .eq("key", key)
    .maybeSingle();

  if (readError) {
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
  // Prefer the platform-set x-real-ip: on Vercel this is the true peer IP and a
  // client CANNOT override it. The left-most x-forwarded-for entry is
  // client-controlled (trivially spoofable with a per-request header) and must
  // NOT be trusted for rate limiting — otherwise every IP-keyed limit (checkout,
  // promo brute-force, signup/reset spam) is bypassable.
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

  // Fallback for non-Vercel hosts: take the LAST hop (added by the closest
  // trusted proxy), not the first (attacker-controlled) entry.
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return "unknown";
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
