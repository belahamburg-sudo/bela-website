import { MapPin } from "lucide-react";
import type { VipLocation } from "@/lib/vip-map";
import worldLandRaw from "@/lib/world-land.json";

// Simplified world landmasses: array of rings, each ring an array of [lng, lat].
const LAND = worldLandRaw as unknown as [number, number][][];

const W = 800;
const H = 440;

/**
 * "Goldminer weltweit" — aggregated VIP-member locations on a real (dependency-
 * free) world map: glowing gold continents + pulsing gold member dots (SMIL, no
 * client JS) sized by count, with labels + a top-cities list. Auto-zooms to the
 * members' region but never tighter than a continental view, so even a single
 * city shows in context. Counts only (no names).
 */
export function VipWorldMap({ points, total }: { points: VipLocation[]; total: number }) {
  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-ink/40 p-8 text-center backdrop-blur-xl">
        <MapPin className="mx-auto h-6 w-6 text-gold-300/60" aria-hidden />
        <p className="mt-3 text-sm text-cream/50">
          Die Goldminer-Karte füllt sich, sobald VIP-Mitglieder ihre Stadt hinterlegt haben.
        </p>
      </div>
    );
  }

  // Member bounding box + padding.
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);
  minLat -= (maxLat - minLat) * 0.3 + 2;
  maxLat += (maxLat - minLat) * 0.3 + 2;
  minLng -= (maxLng - minLng) * 0.3 + 2;
  maxLng += (maxLng - minLng) * 0.3 + 2;

  // Never zoom tighter than a continental view (so 1 city → ~Europe-scale map).
  const MIN_LAT_SPAN = 40;
  const MIN_LNG_SPAN = 70;
  const cLat = (minLat + maxLat) / 2;
  const cLng = (minLng + maxLng) / 2;
  if (maxLat - minLat < MIN_LAT_SPAN) {
    minLat = cLat - MIN_LAT_SPAN / 2;
    maxLat = cLat + MIN_LAT_SPAN / 2;
  }
  if (maxLng - minLng < MIN_LNG_SPAN) {
    minLng = cLng - MIN_LNG_SPAN / 2;
    maxLng = cLng + MIN_LNG_SPAN / 2;
  }
  // Clamp to the world; keep the aspect from collapsing.
  minLat = Math.max(minLat, -58);
  maxLat = Math.min(maxLat, 84);
  minLng = Math.max(minLng, -180);
  maxLng = Math.min(maxLng, 180);
  const spanLat = Math.max(maxLat - minLat, 1);
  const spanLng = Math.max(maxLng - minLng, 1);

  const px = (lng: number) => ((lng - minLng) / spanLng) * W;
  const py = (lat: number) => ((maxLat - lat) / spanLat) * H;

  // Build land paths, skipping rings entirely outside the visible window.
  const landPaths: string[] = [];
  for (const ring of LAND) {
    let rMinLng = Infinity, rMaxLng = -Infinity, rMinLat = Infinity, rMaxLat = -Infinity;
    for (const [lng, lat] of ring) {
      if (lng < rMinLng) rMinLng = lng;
      if (lng > rMaxLng) rMaxLng = lng;
      if (lat < rMinLat) rMinLat = lat;
      if (lat > rMaxLat) rMaxLat = lat;
    }
    if (rMaxLng < minLng || rMinLng > maxLng || rMaxLat < minLat || rMinLat > maxLat) continue;
    let d = "";
    for (let i = 0; i < ring.length; i++) {
      const x = px(ring[i][0]).toFixed(1);
      const y = py(ring[i][1]).toFixed(1);
      d += (i === 0 ? "M" : "L") + x + " " + y;
    }
    landPaths.push(d + "Z");
  }

  const maxCount = Math.max(...points.map((p) => p.count));
  const radius = (count: number) => 4 + (maxCount > 1 ? (count - 1) / (maxCount - 1) : 0) * 9;
  const labelled = points.slice(0, 6);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink/40 backdrop-blur-xl">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.06] px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-gold-200">
            <MapPin className="h-4 w-4" aria-hidden /> Goldminer weltweit
          </h3>
          <p className="mt-1 text-xs text-cream/45">
            {total} VIP-{total === 1 ? "Mitglied" : "Mitglieder"} in {points.length}{" "}
            {points.length === 1 ? "Stadt" : "Städten"}
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label="Weltkarte mit den Standorten der VIP-Mitglieder"
      >
        <defs>
          <radialGradient id="vipMapBg" cx="50%" cy="40%" r="85%">
            <stop offset="0%" stopColor="#15110a" />
            <stop offset="100%" stopColor="#0a0806" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#vipMapBg)" />

        {/* Continents */}
        <g>
          {landPaths.map((d, i) => (
            <path key={`land${i}`} d={d} fill="#E8C040" fillOpacity={0.06} stroke="#E8C040" strokeOpacity={0.22} strokeWidth={0.5} />
          ))}
        </g>

        {/* Member dots */}
        {points.map((p, i) => {
          const cx = px(p.lng);
          const cy = py(p.lat);
          const r = radius(p.count);
          const begin = `${(i % 5) * 0.4}s`;
          return (
            <g key={`d${i}`}>
              <title>{`${p.city} — ${p.count} Goldminer`}</title>
              <circle cx={cx} cy={cy} r={r * 2.4} fill="#E8C040" opacity={0.14}>
                <animate attributeName="opacity" values="0.06;0.22;0.06" dur="3s" begin={begin} repeatCount="indefinite" />
                <animate attributeName="r" values={`${r * 2};${r * 3.1};${r * 2}`} dur="3s" begin={begin} repeatCount="indefinite" />
              </circle>
              <circle cx={cx} cy={cy} r={r} fill="#F5D87A" stroke="#0a0806" strokeWidth={1} />
            </g>
          );
        })}

        {/* Labels */}
        {labelled.map((p, i) => {
          const cx = px(p.lng);
          const cy = py(p.lat);
          const toRight = cx < W - 130;
          return (
            <text
              key={`l${i}`}
              x={toRight ? cx + 11 : cx - 11}
              y={cy + 3}
              fontSize={12}
              fontWeight={600}
              fill="#f0e0bd"
              textAnchor={toRight ? "start" : "end"}
              paintOrder="stroke"
              stroke="#0a0806"
              strokeWidth={3}
            >
              {p.city}
            </text>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-2 px-5 py-4">
        {points.slice(0, 8).map((p, i) => (
          <span
            key={`c${i}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/20 bg-gold-300/[0.06] px-3 py-1 text-[11px] text-cream/70"
          >
            <MapPin className="h-3 w-3 text-gold-300" aria-hidden /> {p.city}
            <span className="font-bold text-gold-300/90">{p.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
