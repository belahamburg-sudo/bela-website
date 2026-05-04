"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Gift, 
  Lock, 
  Play, 
  ShieldCheck, 
  Target, 
  TrendingUp,
  Activity,
  ArrowRight,
  Pickaxe
} from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { MemberAvatar } from "@/components/member-avatar";
import { getMemberLevel, getNextReward } from "@/lib/avatar-system";
import { formatEuro } from "@/lib/utils";
import type { DbCourse } from "@/lib/db-types";
import { GoldCrystal } from "@/components/gold-crystal";
import { SpatialBackground } from "@/components/spatial-background";

// Types for the dashboard data
type DashboardData = {
  user: {
    name: string | null;
    email: string | null;
    avatarId: string | null;
  };
  purchasedCourses: Array<DbCourse & { 
    progress: number; 
    completedLessons: number; 
    totalLessons: number;
    status: string;
  }>;
  availableCourses: DbCourse[];
  totalLessonsCompleted: number;
  completedCourses: number;
  points: number;
  rewardCount: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-6">
          <div className="relative mb-6 mx-auto w-16 h-16">
            <div className="absolute inset-0 border-2 border-gold-300/10 rounded-full" />
            <div className="absolute inset-0 border-2 border-t-gold-300 rounded-full animate-spin" />
            <Pickaxe className="absolute inset-0 m-auto h-6 w-6 text-gold-300 animate-pulse" />
          </div>
          <p className="tac-label text-gold-300 animate-pulse uppercase tracking-[0.2em]">Deine Welt wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 text-center">
        <div className="tac-panel tac-corners p-8 border-gold-300/20 bg-gold-300/[0.02] max-w-md">
          <p className="tac-label text-gold-300 mb-2">HINWEIS</p>
          <p className="text-cream/60 text-sm font-mono uppercase">Daten konnten nicht synchronisiert werden. Bitte versuche es erneut.</p>
        </div>
      </div>
    );
  }

  const { user, purchasedCourses, availableCourses, totalLessonsCompleted, completedCourses, points, rewardCount } = data;

  const inProgressCourses = purchasedCourses.filter((c) => c.status === "In Bearbeitung");
  const latestCourse = inProgressCourses[0] || purchasedCourses[0];
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "Gold Miner";
  const memberLevel = getMemberLevel(points);
  const nextReward = getNextReward(points);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AuthGate>
      <section className="py-12 sm:py-16 bg-obsidian min-h-screen relative overflow-hidden">
        <SpatialBackground />
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10"
          >
            {/* ─── HEADER ─── */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <span className="tac-label text-gold-300/60 uppercase tracking-[0.2em]">Mitglieds-Status: Premium</span>
                  <div className="h-px w-12 bg-gold-300/10" />
                </div>
                
                <h1 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(2.5rem,5vw,4rem)" }}>
                  WILLKOMMEN, {displayName.toUpperCase()}.
                </h1>
                <p className="max-w-xl text-gold-300/40 font-mono text-[10px] uppercase tracking-[0.3em]">
                  DEIN WEG ZUR DIGITALEN MEISTERSCHAFT
                </p>
              </div>

              {/* Quick Level Widget */}
              <Link href="/dashboard/profil" className="flex items-center gap-4 p-4 border border-gold-300/10 bg-gold-300/[0.02] hover:bg-gold-300/[0.05] transition-all group tac-corners">
                <div className="relative">
                  <ProgressRing progress={memberLevel.progress} size={48} stroke={2} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MemberAvatar avatarId={user.avatarId} size="sm" hidePoints />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold-300/60">Level {memberLevel.current.level}</p>
                  <p className="font-heading text-lg text-cream tracking-tight group-hover:text-gold-300 transition-colors">{memberLevel.current.title}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-gold-300 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </motion.div>

            {/* ─── MAIN CONTENT ─── */}
            <div className="grid gap-8 lg:grid-cols-3">
              
              {/* Left Column: Action Hub */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Resume Section: Now with 3D Visuals */}
                {latestCourse && (
                  <motion.div 
                    variants={itemVariants} 
                    className="relative group perspective-1000"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold-300/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-700 blur-xl" />
                    
                    <div className="relative bg-ink/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10 overflow-hidden flex flex-col md:flex-row items-center gap-10">
                      {/* 3D Asset Side */}
                      <div className="relative shrink-0 w-32 h-32 md:w-48 md:h-48 group-hover:scale-110 transition-transform duration-700">
                        <div className="absolute inset-0 bg-gold-300/10 rounded-full blur-3xl" />
                        <GoldCrystal className="w-full h-full relative z-10" />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                          <span className="font-heading text-3xl text-gold-300">{latestCourse.progress}%</span>
                          <span className="text-[8px] font-mono text-gold-300/40 uppercase tracking-[0.2em]">Progress</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-6 text-center md:text-left z-10">
                        <div>
                          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <div className="h-px w-8 bg-gold-300/30" />
                            <span className="tac-label text-gold-300/60 uppercase tracking-widest text-[9px]">Kurs Fortsetzen</span>
                          </div>
                          <h3 className="font-heading text-3xl md:text-5xl tracking-tight text-cream group-hover:text-gold-300 transition-colors">
                            {latestCourse.title}
                          </h3>
                          <p className="text-cream/40 text-[10px] font-mono mt-2 uppercase tracking-[0.3em]">
                             Sektor: {latestCourse.tagline || "Mining Operations"}
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <Button href={`/dashboard/kurse/${latestCourse.slug}`} className="w-full sm:w-auto h-12 px-10 bg-gold-300 text-ink hover:bg-white transition-all uppercase tracking-widest text-[10px] font-bold">
                            <Play className="h-4 w-4 fill-current" />
                            Operation Starten
                          </Button>
                          <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                            {latestCourse.completedLessons} von {latestCourse.totalLessons} Inhalten abgeschlossen
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Active Grid */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="flex items-center justify-between">
                      <h3 className="font-heading text-2xl tracking-tight uppercase">Deine Programme</h3>
                  </div>

                  {purchasedCourses.length === 0 ? (
                    <div className="tac-panel tac-corners p-12 text-center border-white/5 bg-white/[0.01]">
                      <Lock className="h-10 w-10 text-white/10 mx-auto mb-6" />
                      <p className="font-heading text-xl text-cream mb-2 uppercase">Keine Kurse gefunden</p>
                      <Button href="/dashboard/kurse" variant="outline">Store besuchen</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {purchasedCourses.map((course) => (
                        <Link
                          key={course.slug}
                          href={`/dashboard/kurse/${course.slug}`}
                          className="tac-panel tac-corners p-5 border-white/5 bg-white/[0.02] hover:border-gold-300/30 transition-all group flex flex-col justify-between min-h-[140px]"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                              course.status === "Abgeschlossen" ? "border-gold-300/40 text-gold-300 bg-gold-300/5" : "border-white/10 text-white/40"
                            }`}>
                              {course.status}
                            </span>
                            <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold-300/40 group-hover:bg-gold-300/[0.08] transition-all">
                              <ArrowRight className="h-3 w-3 text-white/20 group-hover:text-gold-300 translate-x-[-2px] group-hover:translate-x-0 transition-all" />
                            </div>
                          </div>
                          <div>
                            <p className="font-heading text-xl text-cream mb-1 group-hover:text-gold-300 transition-colors">{course.title}</p>
                            <div className="mt-3 h-1 w-full bg-white/5 overflow-hidden">
                              <div className="h-full bg-gold-300/20 group-hover:bg-gold-300/40 transition-all duration-700" style={{ width: `${course.progress}%` }} />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Right Column: Intel Sidebar */}
              <div className="space-y-8">
                
                {/* Quick Stats Panel */}
                <motion.div variants={itemVariants} className="tac-panel tac-corners p-6 border-white/5 bg-ink/40">
                  <p className="tac-label mb-6 text-white/20 uppercase tracking-[0.2em]">Leistungs-Index</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-white/5 bg-white/[0.01] tac-corners">
                      <p className="text-[9px] font-bold text-white/20 uppercase mb-1">XP</p>
                      <p className="font-heading text-2xl text-cream">{points}</p>
                    </div>
                    <div className="p-4 border border-white/5 bg-white/[0.01] tac-corners">
                      <p className="text-[9px] font-bold text-white/20 uppercase mb-1">Lektionen</p>
                      <p className="font-heading text-2xl text-cream">{totalLessonsCompleted}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Milestone Panel */}
                <motion.div variants={itemVariants} className="tac-panel tac-corners p-6 border-gold-300/10 bg-gold-300/[0.02]">
                  <div className="flex items-center gap-2 text-gold-300/60 mb-6">
                    <Gift className="h-4 w-4" />
                    <span className="tac-label uppercase tracking-widest">Nächster Meilenstein</span>
                  </div>
                  <div className="space-y-4">
                    <p className="font-heading text-xl text-cream tracking-tight">
                      {nextReward ? nextReward.title : "ALLE ZIELE ERREICHT"}
                    </p>
                    <div className="h-1.5 w-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-gold-300 transition-all duration-1000" style={{ width: `${memberLevel.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-cream/30 font-mono uppercase">
                      {nextReward
                        ? `Noch ${nextReward.points: points} XP bis zum Unlock`
                        : "Sektor vollständig erschlossen"}
                    </p>
                  </div>
                </motion.div>

                {/* Recommendations */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="tac-label text-white/20 uppercase tracking-widest text-[9px]">Empfehlungen</span>
                    <TrendingUp className="h-3 w-3 text-white/10" />
                  </div>
                  <div className="space-y-3">
                    {availableCourses.slice(0, 2).map((course) => (
                      <Link
                        key={course.slug}
                        href="/dashboard/kurse"
                        className="block p-4 border border-white/5 bg-white/[0.01] hover:border-gold-300/20 hover:bg-gold-300/[0.02] transition-all group tac-corners"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 h-8 w-8 shrink-0 flex items-center justify-center border border-white/10 bg-white/[0.02]">
                            <Lock className="h-3.5 w-3.5 text-white/20 group-hover:text-gold-300/40 transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-cream/60 truncate group-hover:text-cream transition-colors">{course.title}</p>
                            <p className="text-[9px] font-mono text-gold-300/40 mt-1 uppercase">{formatEuro(course.price_cents)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {/* Advice Card */}
                <motion.div variants={itemVariants} className="p-6 border border-gold-300/10 bg-gradient-to-br from-gold-300/[0.03] to-transparent tac-corners">
                  <Activity className="h-4 w-4 text-gold-300/40 mb-4" />
                  <p className="font-heading text-lg text-cream mb-2 uppercase tracking-tight">Kern-Methode</p>
                  <p className="text-[10px] text-cream/30 leading-relaxed font-mono uppercase">
                    Konsistenz schlägt Intensität: 30 Min täglich ist wertvoller als ein Marathon-Wochenende.
                  </p>
                </motion.div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </AuthGate>
  );
}

function ProgressRing({ progress, size, stroke = 3 }: { progress: number; size: number; stroke?: number }) {
  const radius = (size: stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference: (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        stroke="currentColor"
        strokeWidth={stroke}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        className="text-white/[0.05]"
      />
      <circle
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        style={{ strokeDashoffset: offset }}
        strokeLinecap="butt"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        className="text-gold-300 transition-all duration-1000 ease-out"
      />
    </svg>
  );
}
