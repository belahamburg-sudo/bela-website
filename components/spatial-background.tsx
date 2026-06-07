"use client";

import { Particles } from "@/components/ui/particles";
import { DotPattern } from "@/components/ui/dot-pattern";

/**
 * Premium "gold vault" atmosphere for the member area.
 * Pure CSS + a lightweight canvas dust layer — no WebGL, no per-frame
 * randomisation, so it never glitches and stays cheap on the GPU.
 */
export function SpatialBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Warm vault base: top bloom + diagonal ambient glows over deep obsidian */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(62% 48% at 50% -8%, rgba(232,192,64,0.12) 0%, transparent 60%)," +
            "radial-gradient(50% 60% at 12% 16%, rgba(168,122,16,0.13) 0%, transparent 55%)," +
            "radial-gradient(48% 58% at 90% 88%, rgba(232,192,64,0.09) 0%, transparent 55%)," +
            "linear-gradient(160deg, #100c08 0%, #0a0806 56%, #0c0907 100%)",
        }}
      />

      {/* Tactical dot grid, masked so it dissolves toward the edges */}
      <DotPattern
        width={28}
        height={28}
        cr={1}
        className="fill-gold-300/[0.06] [mask-image:radial-gradient(72%_62%_at_50%_28%,#000_0%,transparent_78%)]"
      />

      {/* Two slow drifting aurora light pools (smooth, not noisy) */}
      <div className="absolute -inset-[20%]">
        <div
          className="absolute left-[8%] top-[12%] h-[34rem] w-[34rem] rounded-full blur-[130px]"
          style={{
            background: "radial-gradient(circle, rgba(232,192,64,0.11), transparent 65%)",
            animation: "aurora-drift 19s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute bottom-[8%] right-[6%] h-[40rem] w-[40rem] rounded-full blur-[150px]"
          style={{
            background: "radial-gradient(circle, rgba(168,122,16,0.12), transparent 65%)",
            animation: "aurora-drift 25s ease-in-out infinite alternate-reverse",
          }}
        />
      </div>

      {/* On-brand gold dust — the same canvas particles the marketing pages use */}
      <Particles
        className="absolute inset-0"
        quantity={70}
        ease={60}
        staticity={55}
        size={0.5}
        color="#E8C040"
        refresh
      />

      {/* Edge vignette to focus the content in the centre */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 92% at 50% 38%, transparent 55%, rgba(8,6,4,0.6) 100%)",
        }}
      />
    </div>
  );
}
