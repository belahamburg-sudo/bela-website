"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Lock,
  PlayCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DbCourse, DbLesson } from "@/lib/db-types";
import { cn } from "@/lib/utils";
import { toggleLessonProgress } from "@/app/(dashboard)/db/kurse/[slug]/actions";
import { Button } from "./button";
import { DownloadButton } from "./download-button";

export type RecommendedCourseCard = {
  slug: string;
  title: string;
  image: string;
  priceCents: number;
  comingSoon: boolean;
};

const VIDEO_FILE_EXTENSIONS = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;

function isDirectVideoFile(url: string): boolean {
  try {
    return VIDEO_FILE_EXTENSIONS.test(new URL(url).pathname);
  } catch {
    return VIDEO_FILE_EXTENSIONS.test(url.split("?")[0]);
  }
}

export function CoursePlayer({
  course,
  initialCompleted = [],
  recommendedCourses = {},
}: {
  course: DbCourse;
  initialCompleted?: string[];
  recommendedCourses?: Record<string, RecommendedCourseCard>;
}) {
  const lessons = useMemo(
    () =>
      course.modules.flatMap((module) =>
        module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title, moduleId: module.id }))
      ),
    [course]
  );

  const [activeId, setActiveId] = useState(lessons[0]?.id || "");
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(course.modules[0] ? [course.modules[0].id] : [])
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const completedSet = useMemo(() => new Set(completed), [completed]);
  const activeLesson = lessons.find((l) => l.id === activeId) as
    | (DbLesson & { moduleTitle: string; moduleId: string })
    | undefined;
  const currentIndex = lessons.findIndex((l) => l.id === activeId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;
  const progress = lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0;

  const selectLesson = useCallback(
    (id: string, scroll = false) => {
      setActiveId(id);
      const mod = lessons.find((l) => l.id === id)?.moduleId;
      if (mod) setExpanded((prev) => new Set(prev).add(mod));
      if (scroll) contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [lessons]
  );

  // Let the AI-Coach (or any other widget) jump to a specific lesson.
  useEffect(() => {
    function onOpen(e: Event) {
      const id = (e as CustomEvent<{ lessonId?: string }>).detail?.lessonId;
      if (id && lessons.some((l) => l.id === id)) selectLesson(id, true);
    }
    window.addEventListener("course:open-lesson", onOpen);
    return () => window.removeEventListener("course:open-lesson", onOpen);
  }, [lessons, selectLesson]);

  function toggleModule(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function markDone() {
    const isDone = completedSet.has(activeId);
    const next = isDone ? completed.filter((id) => id !== activeId) : [...completed, activeId];
    setCompleted(next);
    toggleLessonProgress(activeId, !isDone).then((r) => {
      if (!r.ok) setCompleted(completed);
    });
    if (!isDone && hasNext) selectLesson(lessons[currentIndex + 1].id);
  }

  const hasVideo = Boolean(activeLesson?.video_url);
  const resources = activeLesson?.resources ?? [];
  const hasResources = resources.length > 0;

  const activeModule = course.modules.find((m) => m.lessons.some((l) => l.id === activeId));
  const onLastLessonOfModule = Boolean(
    activeModule && activeModule.lessons[activeModule.lessons.length - 1]?.id === activeId
  );
  const activeModuleRec = activeModule?.recommended_course_slug
    ? recommendedCourses[activeModule.recommended_course_slug]
    : undefined;
  const activeModuleRecNote = activeModule?.recommendation_note ?? "";

  return (
    <div className="grid gap-6">
      {/* ─── Course header: title + overall progress ─── */}
      <div className="panel-surface rounded-[1.35rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow text-gold-300/60">Kurs</p>
            <h1 className="mt-1 truncate font-heading text-2xl font-black uppercase tracking-gta text-cream sm:text-3xl">
              {course.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-heading text-2xl leading-none text-gold-300">{progress}%</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/40">
                {completed.length}/{lessons.length} Lektionen
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gold-gradient transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[340px_1fr]">
        {/* ─── Sidebar: collapsible modules ─── */}
        <aside className="order-last lg:order-none lg:sticky lg:top-24 lg:self-start">
          <div className="grid gap-2.5">
            {course.modules.map((module, mi) => {
              const total = module.lessons.length;
              const done = module.lessons.filter((l) => completedSet.has(l.id)).length;
              const isOpen = expanded.has(module.id);
              const hasActive = module.lessons.some((l) => l.id === activeId);
              return (
                <div
                  key={module.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-ink/40 backdrop-blur-xl transition",
                    hasActive ? "border-gold-300/30" : "border-white/10"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="focus-ring flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.02]"
                  >
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-gold-300/30 text-[11px] font-bold text-gold-300">
                      {done === total && total > 0 ? <Check className="h-3.5 w-3.5" /> : mi + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-cream">{module.title}</span>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-cream/40">
                        {done}/{total} erledigt
                      </span>
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={cn("h-4 w-4 flex-none text-cream/40 transition-transform", isOpen && "rotate-180")}
                    />
                  </button>

                  {isOpen ? (
                    <div className="grid gap-1 px-2 pb-2">
                      {module.lessons.map((lesson, li) => {
                        const isActive = lesson.id === activeId;
                        const isDone = completedSet.has(lesson.id);
                        return (
                          <button
                            type="button"
                            key={lesson.id}
                            onClick={() => selectLesson(lesson.id)}
                            className={cn(
                              "focus-ring flex w-full items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-left transition",
                              isActive
                                ? "border-gold-300 bg-gold-300/[0.08] text-cream"
                                : "border-transparent text-cream/55 hover:bg-white/[0.02] hover:text-cream/85"
                            )}
                          >
                            {isDone ? (
                              <CheckCircle2 aria-hidden className="h-4 w-4 flex-none text-gold-300" />
                            ) : (
                              <PlayCircle aria-hidden className={cn("h-4 w-4 flex-none", isActive ? "text-gold-300" : "text-cream/25")} />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-medium leading-tight">
                                {li + 1}. {lesson.title}
                              </span>
                              {lesson.duration ? (
                                <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-cream/30">
                                  {lesson.duration}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ─── Content ─── */}
        {activeLesson ? (
          <section ref={contentRef} className="grid scroll-mt-24 gap-6 lg:col-start-2">
            <div className="panel-surface overflow-hidden rounded-[1.35rem]">
              {hasVideo ? (
                <div className="aspect-video bg-black">
                  {isDirectVideoFile(activeLesson.video_url!) ? (
                    <video
                      key={activeLesson.video_url}
                      src={activeLesson.video_url!}
                      title={activeLesson.title}
                      className="h-full w-full"
                      controls
                      controlsList="nodownload"
                      playsInline
                    />
                  ) : (
                    <iframe
                      src={activeLesson.video_url!}
                      title={activeLesson.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              ) : null}

              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-gold-300/25 bg-gold-300/[0.06] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-gold-200/80">
                    {activeLesson.moduleTitle}
                  </span>
                  {completedSet.has(activeId) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300/90">
                      <Check className="h-3 w-3" /> erledigt
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 font-heading text-2xl font-black text-cream sm:text-3xl">
                  {activeLesson.title}
                </h2>
                {activeLesson.description ? (
                  <p className="mt-4 max-w-3xl whitespace-pre-wrap text-[15px] leading-8 text-cream/65">
                    {activeLesson.description}
                  </p>
                ) : null}

                {/* PDF-only lesson: resources are the hero. */}
                {!hasVideo ? (
                  hasResources ? (
                    <div className="mt-6 grid gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-200">
                        {resources.length === 1 ? "Dein Material" : "Deine Materialien"}
                      </p>
                      {resources.map((resource) => (
                        <div
                          key={resource.label}
                          className="rounded-2xl border border-gold-300/25 bg-gold-300/[0.05] p-4 sm:p-5"
                        >
                          <div className="mb-3 flex items-center gap-3">
                            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-gold-300/30 bg-gold-300/10">
                              <FileText aria-hidden className="h-5 w-5 text-gold-200" />
                            </span>
                            <span className="min-w-0">
                              <span className="block font-heading text-lg font-black text-cream">{resource.label}</span>
                              <span className="block text-xs text-gold-200/70">{resource.type} · sofort verfügbar</span>
                            </span>
                          </div>
                          <DownloadButton courseSlug={course.slug} resource={resource} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gold-500/20 bg-gold-500/[0.04] px-6 py-12 text-center">
                      <Clock className="h-8 w-8 text-gold-700" aria-hidden />
                      <p className="font-heading text-lg text-cream">Material erscheint bald</p>
                      <p className="text-sm text-white/40">Diese Lektion wird in Kürze freigeschaltet.</p>
                    </div>
                  )
                ) : null}

                {/* Action row */}
                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-6">
                  <Button onClick={markDone} variant={completedSet.has(activeId) ? "secondary" : "primary"}>
                    <CheckCircle2 aria-hidden className="h-4 w-4" />
                    {completedSet.has(activeId) ? "Erledigt ✓" : "Als erledigt markieren"}
                  </Button>
                  <span className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => hasPrev && selectLesson(lessons[currentIndex - 1].id, true)}
                      disabled={!hasPrev}
                      className="rounded-full border border-white/[0.12] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => hasNext && selectLesson(lessons[currentIndex + 1].id, true)}
                      disabled={!hasNext}
                      className="rounded-full border border-white/[0.12] px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Nächste →
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Video-lesson downloads */}
            {hasVideo && hasResources ? (
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Download aria-hidden className="h-5 w-5 text-gold-300" />
                  <h3 className="font-heading text-lg uppercase tracking-gta text-cream">Downloads zur Lektion</h3>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {resources.map((resource) => (
                    <DownloadButton key={resource.label} courseSlug={course.slug} resource={resource} />
                  ))}
                </div>
              </div>
            ) : null}

            {hasResources ? (
              <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-relaxed text-cream/45">
                <Lock aria-hidden className="h-4 w-4 flex-none text-gold-700" />
                <span>
                  Downloads sind personalisiert (sichtbares + unsichtbares Wasserzeichen). Videos sind nicht
                  herunterladbar.
                </span>
              </div>
            ) : null}

            {/* End-of-module next-course nudge */}
            {onLastLessonOfModule && activeModuleRec ? (
              <div className="rounded-2xl border border-gold-300/30 bg-gold-500/[0.07] p-6">
                <p className="eyebrow text-gold-200">Geschafft — dein nächster Schritt</p>
                <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative h-36 w-full flex-none overflow-hidden rounded-2xl sm:h-20 sm:w-32">
                    <Image
                      src={activeModuleRec.image}
                      alt={activeModuleRec.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 128px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-xl font-black text-cream">{activeModuleRec.title}</h3>
                    <p className="mt-1.5 text-sm leading-7 text-cream/70">
                      {activeModuleRecNote || "Mach genau hier weiter, um auf dem nächsten Level dranzubleiben."}
                    </p>
                  </div>
                  <Button href={`/bibliothek/${activeModuleRec.slug}`} className="flex-none">
                    {activeModuleRec.comingSoon ? "Bald verfügbar" : "Kurs ansehen"}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
