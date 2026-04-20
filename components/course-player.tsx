"use client";

import { CheckCircle2, Download, FileText, Lock, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Course, Lesson } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function CoursePlayer({ course }: { course: Course }) {
  const lessons = useMemo(
    () => course.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))),
    [course]
  );
  const [activeId, setActiveId] = useState(lessons[0]?.id || "");
  const [completed, setCompleted] = useState<string[]>([]);
  const storageKey = `ai-goldmining-progress-${course.slug}`;
  const activeLesson = lessons.find((lesson) => lesson.id === activeId) as (Lesson & { moduleTitle: string }) | undefined;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setCompleted(JSON.parse(saved) as string[]);
  }, [storageKey]);

  function markDone() {
    const next = completed.includes(activeId) ? completed : [...completed, activeId];
    setCompleted(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  const progress = lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside className="panel-surface rounded-[1.35rem] p-5 lg:sticky lg:top-28 lg:self-start">
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
        <section className="grid gap-6">
          <div className="panel-surface overflow-hidden rounded-[1.35rem]">
            <div className="aspect-video bg-black">
              <iframe
                src={activeLesson.videoUrl}
                title={activeLesson.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <p className="eyebrow">{activeLesson.moduleTitle}</p>
              <h1 className="mt-3 font-heading text-3xl font-black text-cream">{activeLesson.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{activeLesson.summary}</p>
              <Button onClick={markDone} className="mt-6">
                <CheckCircle2 aria-hidden className="h-4 w-4" />
                Als erledigt markieren
              </Button>
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
