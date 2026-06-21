import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";

export async function GET(request: NextRequest) {
  const denied = verifyCronSecret(request);
  if (denied) return denied;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const secret = process.env.CRON_SECRET;
  const headers: Record<string, string> = secret
    ? { authorization: `Bearer ${secret}` }
    : {};

  const jobs = [
    "/api/cron/checkout-abandoned",
    "/api/cron/webinar-reminder",
    "/api/cron/re-engagement",
  ];

  const results = await Promise.allSettled(
    jobs.map(async (path) => {
      const res = await fetch(`${base}${path}`, { headers });
      return { path, status: res.status, ok: res.ok };
    })
  );

  const summary = results.map((r, i) =>
    r.status === "fulfilled"
      ? { job: jobs[i], ...r.value }
      : { job: jobs[i], error: String((r as PromiseRejectedResult).reason) }
  );

  return NextResponse.json({ ok: true, jobs: summary });
}
