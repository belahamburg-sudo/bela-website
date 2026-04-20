"use client";

import { CheckCircle2, Clock, Download, FileText, Lock, PlayCircle } from "lucide-react";
import { useMemo, useState } from "react";
import type { DbCourse, DbLesson } from "@/lib/db-types";
import { cn } from "@/lib/utils";
import { toggleLessonProgress } from "@/app/(dashboard)/dashboard/kurse/[slug]/actions";
import { Button } from "./button";

export function CoursePlayer({
  course,
  initialCompleted = [],
}: {
  course: DbCourse;
  initialCompleted?: string[];
}) {
  const lessons = useMemo(
    () => course.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))),
    [course]
  );
  const [activeId, setActiveId] = useState(lessons[0]?.id || "");
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const activeLesson = lessons.find((lesson) => lesson.id === activeId) as (DbLesson & { moduleTitle: string }) | undefined;
  const currentIndex = lessons.findIndex((l) => l.id === activeId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  function goToPrev() {
    if (hasPrev) setActiveId(lessons[currentIndex - 1].id);
  }

  function goToNext() {
    if (hasNext) setActiveId(lessons[currentIndex + 1].id);
  }

  function markDone() {
    const isCurrentlyDone = completed.includes(activeId);
    const next = isCurrentlyDone
      ? completed.filter((id) => id !== activeId)
      : [...completed, activeId];

    // Optimistic update — immediate UI response
    setCompleted(next);

    // DB write in background with rollback on error
    toggleLessonProgress(activeId, !isCurrentlyDone).then((result) => {
      if (!result.ok) {
        setCompleted(completed);
      }
    });

    // Auto-advance only when marking done (not un-marking)
    if (!isCurrentlyDone) {
      const nextLesson = lessons[currentIndex + 1];
      if (nextLesson) setActiveId(nextLesson.id);
    }
  }

  const progress = lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[360px_1fr]">
      <aside className="order-last panel-surface rounded-[1.35rem] p-5 lg:order-none lg:col-start-1 lg:row-start-1 lg:sticky lg:top-28 lg:self-start">
        <div className="mb-5">
          <p className="eyebrow">Kursfortschritt</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-gold-900/70">
            <div className="h-full rounded-full bg-gold-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-muted">{progress}% abgeschlossen</p>
        </div>
        <div className="grid gap-5">
          {course.modules.map((module) => (
            <section key={module.id}>
              <h2 className="mb-3 text-sm font-bold text-gold-100">{module.title}</h2>
              <div className="grid gap-2">
                {module.lessons.map((lesson) => {
                  const isActive = lesson.id === activeId;
                  const isDone = completed.includes(lesson.id);
                  return (
                    <button
                      type="button"
                      key={lesson.id}
                      onClick={() => setActiveId(lesson.id)}
                      className={cn(
                        "focus-ring flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                        isActive
                          ? "border-gold-300/60 bg-gold-500/12 text-cream"
                          : "border-gold-500/10 bg-obsidian text-muted hover:text-cream"
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 aria-hidden className="h-5 w-5 flex-none text-gold-300" />
                      ) : (
                        <PlayCircle aria-hidden className="h-5 w-5 flex-none text-gold-700" />
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{lesson.title}</span>
                        <span className="block text-xs text-muted">{lesson.duration}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </aside>

      {activeLesson ? (
        <section className="grid gap-6 lg:col-start-2">
          <div className="panel-surface overflow-hidden rounded-[1.35rem]">
            <div className="aspect-video bg-black">
              {activeLesson.video_url ? (
                <iframe
                  src={activeLesson.video_url}
                  title={activeLesson.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <Clock className="h-9 w-9 text-gold-700" aria-hidden />
                  <p className="font-heading text-xl text-cream">Video erscheint bald</p>
                  <p className="text-sm text-white/40">
                    Dieses Modul wird in Kürze freigeschaltet.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6">
              <p className="eyebrow">{activeLesson.moduleTitle}</p>
              <h1 className="mt-3 font-heading text-3xl font-black text-cream">{activeLesson.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{activeLesson.description}</p>
              <Button onClick={markDone} className="mt-6">
                <CheckCircle2 aria-hidden className="h-4 w-4" />
                {completed.includes(activeId) ? "Als erledigt markiert ✓" : "Als erledigt markieren"}
              </Button>
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-6">
                <button
                  type="button"
                  onClick={goToPrev}
                  disabled={!hasPrev}
                  className="rounded-full border border-white/[0.12] bg-transparent px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← Vorherige Lektion
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={!hasNext}
                  className="rounded-full border border-white/[0.12] bg-transparent px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Nächste Lektion →
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {activeLesson.resources.map((resource) => (
              <a
                key={resource.label}
                href={resource.href}
                className="focus-ring panel-surface flex min-h-24 items-center gap-4 rounded-[1.35rem] p-5 transition hover:border-gold-300/50"
              >
                {resource.type === "PDF" ? (
                  <FileText aria-hidden className="h-6 w-6 text-gold-300" />
                ) : (
                  <Download aria-hidden className="h-6 w-6 text-gold-300" />
                )}
                <span>
                  <span className="block font-bold text-cream">{resource.label}</span>
                  <span className="block text-sm text-muted">{resource.type} Platzhalter</span>
                </span>
              </a>
            ))}
            <div className="panel-surface flex min-h-24 items-center gap-4 rounded-[1.35rem] p-5 text-muted">
              <Lock aria-hidden className="h-6 w-6 text-gold-700" />
              Bonusmaterial wird im Live-System freigeschaltet.
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
