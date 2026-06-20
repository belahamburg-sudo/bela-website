import { MapPin } from "lucide-react";
import type { VipLocation } from "@/lib/vip-map";

const W = 800;
const H = 440;

/**
 * "Goldminer weltweit" — aggregated VIP-member locations on an auto-zoomed
 * equirectangular map. Dependency-free SVG: faint graticule + pulsing gold dots
 * (SMIL, no client JS) sized by member count, with city labels + a top-cities
 * list. Shows counts only (no names).
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

  // Auto-zoom to the members' bounding box (+ padding, clamped to the world).
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);
  const padLat = Math.max((maxLat - minLat) * 0.3, 3);
  const padLng = Math.max((maxLng - minLng) * 0.3, 5);
  minLat = Math.max(minLat - padLat, -85);
  maxLat = Math.min(maxLat + padLat, 85);
  minLng = Math.max(minLng - padLng, -180);
  maxLng = Math.min(maxLng + padLng, 180);
  const spanLat = Math.max(maxLat - minLat, 0.5);
  const spanLng = Math.max(maxLng - minLng, 0.5);

  const px = (lng: number) => ((lng - minLng) / spanLng) * W;
  const py = (lat: number) => ((maxLat - lat) / spanLat) * H;

  const maxCount = Math.max(...points.map((p) => p.count));
  const radius = (count: number) => 4 + (maxCount > 1 ? (count - 1) / (maxCount - 1) : 0) * 9;

  const cols = 7;
  const rows = 4;
  const vlines = Array.from({ length: cols + 1 }, (_, i) => (i / cols) * W);
  const hlines = Array.from({ length: rows + 1 }, (_, i) => (i / rows) * H);
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
        aria-label="Karte mit den Standorten der VIP-Mitglieder"
      >
        <defs>
          <radialGradient id="vipMapBg" cx="50%" cy="38%" r="80%">
            <stop offset="0%" stopColor="#191207" />
            <stop offset="100%" stopColor="#0a0806" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#vipMapBg)" />

        {vlines.map((x, i) => (
          <line key={`v${i}`} x1={x} y1={0} x2={x} y2={H} stroke="#E8C040" strokeOpacity={0.06} strokeWidth={1} />
        ))}
        {hlines.map((y, i) => (
          <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} stroke="#E8C040" strokeOpacity={0.06} strokeWidth={1} />
        ))}

        {points.map((p, i) => {
          const cx = px(p.lng);
          const cy = py(p.lat);
          const r = radius(p.count);
          const begin = `${(i % 5) * 0.4}s`;
          return (
            <g key={`d${i}`}>
              <title>{`${p.city} — ${p.count} Goldminer`}</title>
              <circle cx={cx} cy={cy} r={r * 2.4} fill="#E8C040" opacity={0.12}>
                <animate attributeName="opacity" values="0.05;0.18;0.05" dur="3s" begin={begin} repeatCount="indefinite" />
                <animate attributeName="r" values={`${r * 2};${r * 3};${r * 2}`} dur="3s" begin={begin} repeatCount="indefinite" />
              </circle>
              <circle cx={cx} cy={cy} r={r} fill="#E8C040" stroke="#0a0806" strokeWidth={1} />
            </g>
          );
        })}

        {labelled.map((p, i) => {
          const cx = px(p.lng);
          const cy = py(p.lat);
          const toRight = cx < W - 130;
          return (
            <text
              key={`l${i}`}
              x={toRight ? cx + 12 : cx - 12}
              y={cy + 3}
              fontSize={12}
              fontWeight={600}
              fill="#e8d5b0"
              textAnchor={toRight ? "start" : "end"}
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
