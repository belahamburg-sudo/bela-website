"use client";

import { useState } from "react";
import { ChevronDown, PlayCircle, FileText, Lock, Layers } from "lucide-react";
import type { Course } from "@/lib/content";
import { cn } from "@/lib/utils";

type Module = Course["modules"][number];

type CourseCurriculumOutlineProps = {
  modules: Module[];
  /** Show a small "preview/locked" hint per lesson (used when not purchased). */
  locked?: boolean;
  /** Index of the module that starts expanded (default: first). */
  defaultOpenIndex?: number;
  className?: string;
};

function lessonCountLabel(count: number) {
  return count === 1 ? "1 Lektion" : `${count} Lektionen`;
}

/**
 * Reusable read-only curriculum outline: modules -> lessons with titles,
 * lesson counts and durations. No video/download access — purely an outline
 * preview. Shared by the public course detail and the member paywall preview.
 */
export function CourseCurriculumOutline({
  modules,
  locked = false,
  defaultOpenIndex = 0,
  className,
}: CourseCurriculumOutlineProps) {
  const [open, setOpen] = useState<number | null>(
    modules.length > 0 ? defaultOpenIndex : null
  );

  if (!modules || modules.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center",
          className
        )}
      >
        <Layers aria-hidden className="mx-auto mb-3 h-6 w-6 text-gold-300/40" />
        <p className="text-sm text-cream/40">Die Inhalte werden in Kürze ergänzt.</p>
      </div>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between px-1 text-[10px] font-mono uppercase tracking-[0.2em] text-cream/35">
        <span>
          {modules.length === 1 ? "1 Modul" : `${modules.length} Module`}
        </span>
        <span>{lessonCountLabel(totalLessons)}</span>
      </div>

      {modules.map((module, index) => {
        const isOpen = open === index;
        return (
          <div
            key={module.id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-ink/40 backdrop-blur-xl transition-colors duration-300",
              isOpen ? "border-gold-300/25" : "border-white/[0.07] hover:border-white/15"
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
            >
              <span
                className={cn(
                  "flex h-9 w-9 flex-none items-center justify-center rounded-xl border font-heading text-sm transition-colors",
                  isOpen
                    ? "border-gold-300/40 bg-gold-300/10 text-gold-200"
                    : "border-white/10 bg-white/[0.03] text-cream/50"
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-cream">{module.title}</span>
                <span className="mt-0.5 block text-[10px] font-mono uppercase tracking-[0.18em] text-cream/35">
                  {lessonCountLabel(module.lessons.length)}
                </span>
              </span>
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-4 w-4 flex-none text-cream/40 transition-transform duration-300",
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
                <ul className="divide-y divide-white/[0.04] border-t border-white/[0.06]">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-3 px-5 py-3 text-sm text-cream/55"
                    >
                      {locked ? (
                        <Lock aria-hidden className="h-3.5 w-3.5 flex-none text-cream/25" />
                      ) : lesson.videoUrl ? (
                        <PlayCircle aria-hidden className="h-4 w-4 flex-none text-gold-300/50" />
                      ) : (
                        <FileText aria-hidden className="h-4 w-4 flex-none text-gold-300/50" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                      {lesson.duration ? (
                        <span className="flex-none text-[11px] font-mono uppercase tracking-[0.12em] text-cream/30">
                          {lesson.duration}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
