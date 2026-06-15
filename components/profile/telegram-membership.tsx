import Link from "next/link";
import { Crown, Check } from "lucide-react";
import { TelegramAccessButton } from "@/components/telegram-access-button";

type Props = {
  active: boolean;
  currentPeriodEnd: string | null;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export function TelegramMembership({ active, currentPeriodEnd }: Props) {
  const renewal = active && currentPeriodEnd ? formatDate(currentPeriodEnd) : null;

  return (
    <div className="tac-panel tac-corners relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-300/[0.06] blur-[100px]" />

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gold-300/60">
            <Crown className="h-5 w-5" />
            <p className="tac-label tracking-widest">VIP Community</p>
          </div>
          <h3 className="font-heading text-2xl uppercase tracking-tight text-cream sm:text-3xl">
            Telegram-Mitgliedschaft.
          </h3>

          {active ? (
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                VIP aktiv
              </span>
              {renewal ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/35">
                  Verlängert sich am {renewal}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/30">
              Keine aktive VIP-Mitgliedschaft
            </p>
          )}
        </div>

        <div className="flex-none w-full sm:w-auto">
          {active ? (
            <TelegramAccessButton active className="w-full sm:min-w-[260px]" />
          ) : (
            <Link
              href="/db/kurse"
              className="focus-ring inline-flex items-center justify-center gap-2.5 border border-gold-300/30 bg-gold-300/5 px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300 transition-all hover:border-gold-300/60 hover:bg-gold-300/10"
            >
              <Crown className="h-4 w-4" />
              VIP beitreten · ab 9€/Monat
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
