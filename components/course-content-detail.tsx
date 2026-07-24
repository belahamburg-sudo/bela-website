"use client";

import { useState } from "react";
import { ChevronDown, PlayCircle, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type CourseContentModule = {
  id: string;
  title: string;
  /** 3–5 sales bullets shown inside the module's dropdown. */
  highlights: string[];
  /** Resolved preview video URL (empty = none). */
  previewVideoUrl?: string;
  lessons: Array<{ id: string; title: string; duration?: string }>;
};

function lessonCountLabel(count: number) {
  return count === 1 ? "1 Lektion" : `${count} Lektionen`;
}

/**
 * Product-page course content as ONE accordion: each row is the module
 * overview (number + title + lesson count); opening the dropdown reveals the
 * detail — preview video, highlight bullets and the (locked) lesson list.
 * Merges the former "Das steckt drin" cards and the separate "Alle Kursinhalte"
 * outline so every module title appears exactly once.
 */
export function CourseContentDetail({
  modules,
  owned = false,
  defaultOpenIndex = 0,
}: {
  modules: CourseContentModule[];
  owned?: boolean;
  /** Which module starts expanded (default: first). Pass -1 for all collapsed. */
  defaultOpenIndex?: number;
}) {
  const [open, setOpen] = useState<number | null>(
    modules.length > 0 ? defaultOpenIndex : null
  );
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div>
      <p className="eyebrow mb-5">Kursinhalt im Detail</p>
      <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="font-heading text-3xl text-white sm:text-4xl">Das steckt drin.</h2>
        {modules.length > 0 && (
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-white/40">
            {modules.length === 1 ? "1 Modul" : `${modules.length} Module`} ·{" "}
            {lessonCountLabel(totalLessons)}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {modules.map((m, i) => {
          const isOpen = open === i;
          const hasVideo = Boolean(m.previewVideoUrl);
          const hasBullets = m.highlights.length > 0;
          const hasLessons = m.lessons.length > 0;
          return (
            <div
              key={m.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white/[0.02] transition-colors duration-300",
                isOpen ? "border-gold-300/25" : "border-white/[0.07] hover:border-white/15"
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 flex-none items-center justify-center rounded-xl border font-heading text-sm transition-colors",
                    isOpen
                      ? "border-gold-300/40 bg-gold-300/10 text-gold-200"
                      : "border-white/10 bg-white/[0.03] text-white/50"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-heading text-lg text-white">{m.title}</span>
                  {hasLessons && (
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                      {lessonCountLabel(m.lessons.length)}
                    </span>
                  )}
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "h-4 w-4 flex-none text-white/40 transition-transform duration-300",
                    isOpen && "rotate-180 text-gold-300/70"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-white/[0.06] px-5 py-4">
                    {hasVideo && (
                      <div className="mb-4 overflow-hidden rounded-xl border border-gold-500/20">
                        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                        <video
                          src={m.previewVideoUrl}
                          controls
                          playsInline
                          className="aspect-video w-full bg-black"
                        />
                      </div>
                    )}

                    {hasBullets && (
                      <ul className="grid gap-2">
                        {m.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2.5 text-white/70">
                            <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 flex-none text-gold-300" />
                            <span className="leading-7">{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {hasLessons && (
                      <ul
                        className={cn(
                          "divide-y divide-white/[0.04]",
                          (hasVideo || hasBullets) && "mt-4 border-t border-white/[0.06] pt-1"
                        )}
                      >
                        {m.lessons.map((l) => (
                          <li
                            key={l.id}
                            className="flex items-center gap-3 py-2.5 text-sm text-white/55"
                          >
                            {owned ? (
                              <PlayCircle aria-hidden className="h-4 w-4 flex-none text-gold-300/50" />
                            ) : (
                              <Lock aria-hidden className="h-3.5 w-3.5 flex-none text-white/25" />
                            )}
                            <span className="min-w-0 flex-1 truncate">{l.title}</span>
                            {l.duration && (
                              <span className="flex-none font-mono text-[11px] uppercase tracking-[0.12em] text-white/30">
                                {l.duration}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {!hasVideo && !hasBullets && !hasLessons && (
                      <p className="text-sm text-white/40">Die Inhalte werden in Kürze ergänzt.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {owned ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm leading-7 text-emerald-100">
          <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none" />
          Du hast diesen Kurs freigeschaltet. Videos und Downloads findest du im Dashboard.
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold-500/15 bg-gold-500/[0.07] p-4 text-sm leading-7 text-gold-100">
          <Lock aria-hidden className="mt-1 h-5 w-5 flex-none" />
          Vorschau der Inhalte. Nach dem Kauf schaltest du Videos und Downloads im Dashboard frei.
        </div>
      )}
    </div>
  );
}
