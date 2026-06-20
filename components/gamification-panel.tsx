import { Flame, Target, Trophy, Check } from "lucide-react";
import type { Gamification } from "@/lib/gamification";

function rankBadge(rank: number): string {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
}

export function GamificationPanel({ data }: { data: Gamification }) {
  const youInTop = data.leaderboard.some((r) => r.isYou);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Streak */}
      <div className="tac-panel p-5">
        <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">
          <Flame className="h-4 w-4 text-gold-300/70" /> Streak
        </div>
        <div className="flex items-end gap-2">
          <span className="font-heading text-5xl leading-none text-cream">{data.currentStreak}</span>
          <span className="mb-1 text-sm text-cream/50">{data.currentStreak === 1 ? "Tag" : "Tage"}</span>
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-cream/30">
          Längste Serie: {data.longestStreak} {data.longestStreak === 1 ? "Tag" : "Tage"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-cream/45">
          {data.currentStreak >= 2 ? "Bleib dran — nicht abreißen lassen! 🔥" : "Komm täglich vorbei und bau deine Serie auf."}
        </p>
      </div>

      {/* Quests */}
      <div className="tac-panel p-5">
        <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">
          <Target className="h-4 w-4 text-gold-300/70" /> Quests
        </div>
        <ul className="grid gap-3">
          {data.quests.map((q) => (
            <li key={q.key}>
              <div className="flex items-center justify-between gap-2">
                <span className={`flex items-center gap-2 text-xs ${q.done ? "text-cream/70" : "text-cream/50"}`}>
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      q.done ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300" : "border-white/15 text-transparent"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  {q.label}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-cream/35">
                  {q.progress}/{q.target}
                </span>
              </div>
              <div className="mt-1.5 ml-6 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full transition-all ${q.done ? "bg-emerald-400/70" : "bg-gold-gradient"}`}
                  style={{ width: `${Math.round((q.progress / q.target) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Leaderboard */}
      <div className="tac-panel p-5">
        <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">
          <Trophy className="h-4 w-4 text-gold-300/70" /> Bestenliste
        </div>
        {data.leaderboard.length === 0 ? (
          <p className="text-xs text-cream/40">Noch keine Platzierungen.</p>
        ) : (
          <ol className="grid gap-1.5">
            {data.leaderboard.map((r) => (
              <li
                key={r.rank}
                className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                  r.isYou ? "border border-gold-300/30 bg-gold-300/[0.08] text-cream" : "text-cream/60"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <span className="w-7 shrink-0 text-center text-xs font-bold text-gold-300/80">
                    {rankBadge(r.rank)}
                  </span>
                  <span className="truncate">
                    {r.name}
                    {r.isYou ? <span className="ml-1 text-[10px] text-gold-300/70">(du)</span> : null}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-gold-200/80">{r.points} XP</span>
              </li>
            ))}
          </ol>
        )}
        {!youInTop && data.yourRank ? (
          <p className="mt-3 border-t border-white/[0.06] pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/40">
            Dein Rang: <span className="text-gold-300">#{data.yourRank}</span> von {data.totalMembers}
          </p>
        ) : null}
      </div>
    </div>
  );
}
