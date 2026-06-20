import { getSupabaseAdminClient } from "./supabase";
import { geocodeCity } from "./geocode";

export type VipLocation = {
  city: string;
  lat: number;
  lng: number;
  count: number;
};

/**
 * Aggregated locations of ACTIVE VIP members for the world map. Reads active
 * telegram subscriptions → profiles, lazily geocodes any city without cached
 * coordinates (capped per call, persisted), and returns city-level clusters
 * with counts only — no names, so it's safe to show as social proof.
 */
export async function getVipLocations(): Promise<{ points: VipLocation[]; total: number }> {
  const admin = getSupabaseAdminClient();
  if (!admin) return { points: [], total: 0 };

  try {
    const { data: subs } = await admin
      .from("telegram_subscriptions")
      .select("user_id, status")
      .in("status", ["active", "trialing"]);

    const userIds = Array.from(
      new Set(
        ((subs ?? []) as { user_id: string | null }[])
          .map((s) => s.user_id)
          .filter((id): id is string => Boolean(id))
      )
    );
    if (userIds.length === 0) return { points: [], total: 0 };

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, city, lat, lng, geocoded_at")
      .in("id", userIds);

    const rows = (profiles ?? []) as {
      id: string;
      city: string | null;
      lat: number | null;
      lng: number | null;
      geocoded_at: string | null;
    }[];

    // Lazily geocode cities without cached coords (cap to keep page loads snappy;
    // persisted, so it converges over a few loads). Skip rows already attempted.
    let budget = 10;
    for (const r of rows) {
      const needs = r.lat == null || r.lng == null;
      if (needs && !r.geocoded_at && r.city && r.city.trim() && budget > 0) {
        budget--;
        const geo = await geocodeCity(r.city);
        const stamp = new Date().toISOString();
        if (geo) {
          r.lat = geo.lat;
          r.lng = geo.lng;
          await admin
            .from("profiles")
            .update({ lat: geo.lat, lng: geo.lng, geocoded_at: stamp })
            .eq("id", r.id);
        } else {
          // Mark attempted so a bad city isn't retried on every render.
          await admin.from("profiles").update({ geocoded_at: stamp }).eq("id", r.id);
        }
      }
    }

    const byKey = new Map<string, VipLocation>();
    let total = 0;
    for (const r of rows) {
      if (r.lat == null || r.lng == null) continue;
      total++;
      const key = `${r.lat.toFixed(1)},${r.lng.toFixed(1)}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.count++;
      } else {
        byKey.set(key, {
          city: (r.city ?? "").trim() || "Unbekannt",
          lat: r.lat,
          lng: r.lng,
          count: 1,
        });
      }
    }

    return {
      points: Array.from(byKey.values()).sort((a, b) => b.count - a.count),
      total,
    };
  } catch {
    return { points: [], total: 0 };
  }
}
