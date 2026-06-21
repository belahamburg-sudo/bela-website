"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitQuizAttempt } from "@/app/(dashboard)/db/kurse/[slug]/quiz-actions";

export type QuizQuestion = {
  id: string;
  question: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string | null;
  position: number;
};

type QuizPlayerProps = {
  moduleId: string;
  moduleTitle: string;
  questions: QuizQuestion[];
  previousBest?: { score: number; total: number; passed: boolean } | null;
};

const LABELS = ["A", "B", "C", "D"] as const;

export function QuizPlayer({
  moduleId,
  moduleTitle,
  questions,
  previousBest,
}: QuizPlayerProps) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.position - b.position),
    [questions]
  );

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([]);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
    pointsEarned: number;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const question = sorted[current];
  const progress = sorted.length > 0 ? ((current + (submitted ? 1 : 0)) / sorted.length) * 100 : 0;
  const isLast = current === sorted.length - 1;

  const handleSelect = useCallback((index: number) => {
    setSelected(index);
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    if (selected === null) return;
    setSubmitted(true);
    setAnswers((prev) => [
      ...prev,
      { questionId: question.id, selectedIndex: selected },
    ]);
  }, [selected, question]);

  const handleNext = useCallback(() => {
    if (isLast) {
      // Submit quiz to server.
      const finalAnswers = [
        ...answers,
      ];
      startTransition(async () => {
        setServerError(null);
        const res = await submitQuizAttempt(moduleId, finalAnswers);
        if (res.ok) {
          setResult({
            score: res.score!,
            total: res.total!,
            passed: res.passed!,
            pointsEarned: res.pointsEarned!,
          });
        } else {
          setServerError(res.error ?? "Fehler beim Speichern.");
          // Still show local score as fallback.
          const total = sorted.length;
          let score = 0;
          for (const ans of finalAnswers) {
            const q = sorted.find((qq) => qq.id === ans.questionId);
            if (q?.options[ans.selectedIndex]?.isCorrect) score++;
          }
          setResult({
            score,
            total,
            passed: total > 0 && score / total >= 0.7,
            pointsEarned: 0,
          });
        }
      });
    } else {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }, [isLast, answers, moduleId, sorted, startTransition]);

  const handleRetry = useCallback(() => {
    setCurrent(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers([]);
    setResult(null);
    setServerError(null);
  }, []);

  if (sorted.length === 0) return null;

  // ── Result screen ──
  if (result) {
    const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div className="panel-surface overflow-hidden rounded-[1.35rem]">
        <div className="relative flex flex-col items-center gap-5 px-6 py-10 text-center sm:px-10 sm:py-14">
          {/* Celebratory glow on pass */}
          {result.passed && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gold-300/[0.08] via-transparent to-transparent" />
          )}

          <div
            className={cn(
              "relative flex h-20 w-20 items-center justify-center rounded-full border-2",
              result.passed
                ? "border-gold-300/60 bg-gold-300/[0.12]"
                : "border-white/20 bg-white/[0.04]"
            )}
          >
            {result.passed ? (
              <Trophy className="h-9 w-9 text-gold-300" />
            ) : (
              <RefreshCw className="h-9 w-9 text-cream/40" />
            )}
            {result.passed && (
              <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold-300 text-[11px] font-black text-obsidian">
                <Check className="h-4 w-4" />
              </span>
            )}
          </div>

          <div>
            <h3 className="font-heading text-2xl font-black uppercase tracking-gta text-cream sm:text-3xl">
              {result.passed ? "Bestanden!" : "Nicht bestanden"}
            </h3>
            <p className="mt-2 text-sm text-cream/55">
              {result.passed
                ? "Glückwunsch, du hast das Modul-Quiz gemeistert."
                : "Du brauchst mindestens 70% richtige Antworten. Versuch es nochmal!"}
            </p>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-5xl font-black text-cream">{pct}</span>
            <span className="text-lg font-bold text-cream/40">%</span>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/40">
            {result.score} von {result.total} richtig
          </p>

          {result.passed && result.pointsEarned > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-gold-300/30 bg-gold-300/[0.08] px-4 py-2">
              <Zap className="h-4 w-4 text-gold-300" />
              <span className="text-sm font-bold text-gold-200">
                +{result.pointsEarned} XP verdient
              </span>
            </div>
          )}

          {serverError && (
            <p className="mt-1 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-2 text-xs text-red-300">
              {serverError}
            </p>
          )}

          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {!result.passed && (
              <button
                type="button"
                onClick={handleRetry}
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-obsidian shadow-[0_10px_50px_-10px_rgba(201,169,97,0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
              >
                <RefreshCw className="h-4 w-4" />
                Erneut versuchen
              </button>
            )}
            {result.passed && (
              <button
                type="button"
                onClick={handleRetry}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-gold-300/25 bg-panel/60 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-cream backdrop-blur-md transition-all duration-300 hover:border-gold-300/60 hover:bg-gold-300/[0.06] active:scale-[0.97]"
              >
                <RefreshCw className="h-4 w-4" />
                Nochmal spielen
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Question screen ──
  const correctIndex = question.options.findIndex((o) => o.isCorrect);

  return (
    <div className="panel-surface overflow-hidden rounded-[1.35rem]">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Award className="h-5 w-5 flex-none text-gold-300" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-cream">Quiz: {moduleTitle}</p>
              {previousBest && (
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cream/40">
                  Bisheriges Bestes: {previousBest.score}/{previousBest.total}{" "}
                  {previousBest.passed ? (
                    <span className="text-emerald-300">bestanden</span>
                  ) : (
                    <span className="text-red-300">nicht bestanden</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/40">
            {current + 1}/{sorted.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gold-gradient transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="px-5 py-6 sm:px-6 sm:py-8">
        <h3 className="font-heading text-xl font-black text-cream sm:text-2xl">
          {question.question}
        </h3>

        <div className="mt-6 grid gap-3">
          {question.options.map((option, idx) => {
            const isSelected = selected === idx;
            const isCorrect = submitted && option.isCorrect;
            const isWrong = submitted && isSelected && !option.isCorrect;

            let borderClass = "border-white/10 hover:border-white/25";
            let bgClass = "bg-white/[0.02] hover:bg-white/[0.04]";
            let textClass = "text-cream/80";
            let labelClass =
              "border-white/20 bg-white/[0.04] text-cream/50";

            if (!submitted && isSelected) {
              borderClass = "border-gold-300/50";
              bgClass = "bg-gold-300/[0.08]";
              textClass = "text-cream";
              labelClass = "border-gold-300/40 bg-gold-300/[0.15] text-gold-200";
            }
            if (isCorrect) {
              borderClass = "border-emerald-400/50";
              bgClass = "bg-emerald-500/[0.08]";
              textClass = "text-cream";
              labelClass = "border-emerald-400/40 bg-emerald-500/20 text-emerald-200";
            }
            if (isWrong) {
              borderClass = "border-red-400/50";
              bgClass = "bg-red-500/[0.08]";
              textClass = "text-cream";
              labelClass = "border-red-400/40 bg-red-500/20 text-red-200";
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "focus-ring flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-200",
                  borderClass,
                  bgClass,
                  submitted && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 flex-none items-center justify-center rounded-lg border text-xs font-bold transition-all",
                    labelClass
                  )}
                >
                  {submitted && isCorrect ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : submitted && isWrong ? (
                    <X className="h-4 w-4" />
                  ) : (
                    LABELS[idx]
                  )}
                </span>
                <span className={cn("flex-1 text-[15px] font-medium leading-snug", textClass)}>
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after submit) */}
        {submitted && question.explanation && (
          <div className="mt-5 rounded-xl border border-gold-300/20 bg-gold-300/[0.04] px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-200/70">
              Erklärung
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-cream/70">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {!submitted ? (
            <button
              type="button"
              disabled={selected === null}
              onClick={handleSubmitAnswer}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-obsidian shadow-[0_10px_50px_-10px_rgba(201,169,97,0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Antwort prüfen
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={pending}
              className={cn(
                "focus-ring inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] transition-all duration-300 active:scale-[0.97] disabled:opacity-60",
                isLast
                  ? "bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 text-obsidian shadow-[0_10px_50px_-10px_rgba(201,169,97,0.6)] hover:brightness-110"
                  : "border border-gold-300/25 bg-panel/60 text-cream backdrop-blur-md hover:border-gold-300/60 hover:bg-gold-300/[0.06]"
              )}
            >
              {pending ? (
                "Wird ausgewertet..."
              ) : isLast ? (
                <>
                  Quiz auswerten
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Nächste Frage
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
