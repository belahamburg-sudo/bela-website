/* eslint-disable @next/next/no-img-element */
// A dense, slowly-scrolling photo wall built from Bela's lifestyle shots.
// Plain <img> (112 tiny ~13KB images, lazy-loaded) — Next/Image would be
// overkill here and the variable widths drive the mosaic look.

const SRC = (n: number) => `/assets/about-collage/collage-${String(n).padStart(3, "0")}.jpg`;

function range(start: number, end: number) {
  const items: number[] = [];
  for (let n = start; n <= end; n++) items.push(n);
  return items;
}

// Images that were removed from the set — skipped so the carousel never points
// at a missing file (which would render as a broken image).
const MISSING = new Set<number>([86]);
const keep = (n: number) => !MISSING.has(n);

// 112 images split across three rows that scroll in alternating directions.
const ROWS = [
  { items: range(1, 38).filter(keep), anim: "animate-collage-l", dur: "72s" },
  { items: range(39, 75).filter(keep), anim: "animate-collage-r", dur: "90s" },
  { items: range(76, 112).filter(keep), anim: "animate-collage-l", dur: "108s" },
];

export function AboutCollage() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {ROWS.map((row) => (
        <div
          key={row.dur}
          className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
        >
          <div
            className={`flex w-max gap-3 sm:gap-4 ${row.anim} motion-reduce:animate-none group-hover:[animation-play-state:paused]`}
            style={{ animationDuration: row.dur }}
          >
            {[...row.items, ...row.items].map((n, idx) => (
              <div
                key={`${n}-${idx}`}
                className="relative h-28 shrink-0 overflow-hidden rounded-sm border border-white/[0.04] sm:h-40"
              >
                <img
                  src={SRC(n)}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="h-full w-auto max-w-none object-cover opacity-90 transition duration-700 hover:scale-[1.06] hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
