export type GeoResult = { lat: number; lng: number; country: string | null };

/**
 * Resolve a free-text city to coordinates via Open-Meteo's free geocoding API
 * (no API key, server-side only). Returns null on any failure. 5s timeout so a
 * slow lookup never hangs the page.
 */
export async function geocodeCity(city: string): Promise<GeoResult | null> {
  const q = city.trim();
  if (!q) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q
    )}&count=1&language=de&format=json`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{ latitude?: number; longitude?: number; country?: string }>;
    };
    const r = data.results?.[0];
    if (!r || typeof r.latitude !== "number" || typeof r.longitude !== "number") return null;
    return { lat: r.latitude, lng: r.longitude, country: r.country ?? null };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
