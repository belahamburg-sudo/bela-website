"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, Check, Users, Coins } from "lucide-react";
import { formatEuro } from "@/lib/utils";

type ReferralData = {
  code: string;
  referrals: number;
  earnedCents: number;
};

export function ReferAFriend() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/referral");
        if (!res.ok) return;
        const d = (await res.json()) as ReferralData;
        setData(d);
        if (typeof window !== "undefined") {
          setLink(`${window.location.origin}/?ref=${d.code}`);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  if (!data) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="relative overflow-hidden border border-gold-300/25 bg-gradient-to-br from-gold-300/[0.08] via-ink/60 to-ink/40 p-6 backdrop-blur-xl sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-300/15 blur-[90px]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-gold-300/80">
          <Gift className="h-4 w-4" />
          <span className="tac-label tracking-[0.22em]">Empfehlungsprogramm</span>
        </div>

        <h2 className="font-heading text-2xl uppercase leading-none text-cream sm:text-3xl">
          Schenk <span className="gold-text">20%</span>, bekomm{" "}
          <span className="gold-text">20%</span>.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/55">
          Teil deinen Link: Dein Freund bekommt 20% auf seinen ersten Kauf, du bekommst 20%
          Provision auf deinen nächsten.
        </p>

        {/* Share link */}
        <div className="mt-5 flex items-center gap-2 border border-white/10 bg-obsidian/60 p-1.5 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-cream/70">{link}</span>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 bg-gold-gradient px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-obsidian transition-all hover:brightness-110"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Kopiert" : "Kopieren"}
          </button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 border border-white/8 bg-white/[0.02] p-4">
            <Users className="h-5 w-5 text-gold-300/60" />
            <div>
              <p className="font-heading text-2xl leading-none text-cream">{data.referrals}</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cream/40">
                Empfehlungen
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-white/8 bg-white/[0.02] p-4">
            <Coins className="h-5 w-5 text-gold-300/60" />
            <div>
              <p className="font-heading text-2xl leading-none text-cream">
                {formatEuro(data.earnedCents)}
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cream/40">
                Verdient
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/30">
          Code: <span className="text-gold-300/70">{data.code}</span>
        </p>
      </div>
    </div>
  );
}
