"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  User, 
  LogOut, 
  Pickaxe, 
  Shield, 
  Cpu,
  Settings,
  ChevronRight
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type NavLinkConfig = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact: boolean;
};

const NAV_LINKS: NavLinkConfig[] = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/kurse", label: "Meine Kurse", icon: BookOpen, exact: false },
  { href: "/dashboard/profil", label: "Mein Profil", icon: User, exact: false },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-4 py-4 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
        isActive
          ? "text-gold-300 bg-gold-300/[0.04] shadow-[inset_0_0_20px_rgba(200,146,42,0.05)]"
          : "text-cream/30 hover:text-cream/80 hover:bg-white/[0.02]"
      }`}
    >
      {isActive && (
        <motion.div 
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gold-300 shadow-[0_0_10px_rgba(200,146,42,0.5)]" 
        />
      )}
      
      <Icon
        className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? "text-gold-300" : "text-cream/20 group-hover:text-cream/40"}`}
      />
      <span className="flex-1">{label}</span>
      
      <ChevronRight className={`h-3 w-3 opacity-0 -translate-x-2 transition-all ${isActive ? "opacity-20 translate-x-0" : "group-hover:opacity-20 group-hover:translate-x-0"}`} />
    </Link>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const router = useRouter();

  async function handleLogout() {
    if (hasSupabasePublicEnv()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) await supabase.auth.signOut();
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("ai-goldmining-demo-user");
    }
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col bg-ink/80 backdrop-blur-2xl border-r border-white/10">
      {/* Brand / Logo Section */}
      <div className="p-6">
        <Link
          href="/dashboard"
          onClick={onNavClick}
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="absolute -inset-1 border border-gold-300/20 rounded-none group-hover:rotate-45 transition-transform duration-500" />
            <div className="relative flex h-9 w-9 items-center justify-center border border-gold-300/40 bg-gold-300/5">
              <Pickaxe className="h-4.5 w-4.5 text-gold-300" />
            </div>
          </div>
          <div className="min-w-0">
            <span className="block font-heading tracking-gta text-sm text-cream leading-none uppercase">
              AI Goldmining
            </span>
            <span className="block mt-1.5 text-[9px] font-mono text-gold-300/40 tracking-widest uppercase">
              Member Area
            </span>
          </div>
        </Link>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-300/10 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 py-8 space-y-1">
        <div className="px-6 mb-4">
          <span className="tac-label text-white/10">Navigation</span>
        </div>
        {NAV_LINKS.map((link) => (
          <NavLink key={link.href} {...link} onClick={onNavClick} />
        ))}
      </nav>

      {/* System Status / Intelligence Readout */}
      <div className="mt-auto p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2 py-3 border border-white/5 bg-white/[0.01]">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-[10px] font-bold text-cream/40 uppercase tracking-widest">Verbindung Aktiv</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 px-4 py-3 border border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40 transition-all hover:text-gold-300 hover:border-gold-300/20 hover:bg-gold-300/[0.02]"
        >
          <LogOut className="h-3.5 w-3.5 flex-shrink-0 opacity-40 group-hover:opacity-100" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-white/10 bg-ink/80 px-2 pb-[safe-area-inset-bottom] pt-2 backdrop-blur-2xl lg:hidden">
      {NAV_LINKS.map((link) => {
        const Icon = link.icon;
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1.5 px-3 py-1.5 transition-all duration-300 ${
              isActive ? "text-gold-300" : "text-cream/40"
            }`}
          >
            <div className={`relative flex h-9 w-14 items-center justify-center transition-all ${
              isActive ? "bg-gold-300/10 rounded-full" : "bg-transparent"
            }`}>
              {isActive && (
                <motion.div 
                  layoutId="activeMobileNav"
                  className="absolute inset-0 border border-gold-300/30 rounded-full" 
                />
              )}
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const router = useRouter();

  async function handleLogout() {
    if (hasSupabasePublicEnv()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) await supabase.auth.signOut();
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("ai-goldmining-demo-user");
    }
    router.push("/login");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Desktop spacer */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0" aria-hidden />

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gold-300/10 bg-ink/95 px-4 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center border border-gold-300/40 bg-gold-300/5">
            <Pickaxe className="h-3.5 w-3.5 text-gold-300" />
          </div>
          <div className="leading-none">
            <span className="block font-heading tracking-gta text-xs text-cream uppercase">
              AI Goldmining
            </span>
            <span className="block mt-0.5 text-[8px] font-mono text-gold-300/40 uppercase">
              Member
            </span>
          </div>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center border border-white/5 bg-white/[0.03] text-cream/40 transition-colors hover:text-gold-300"
          aria-label="Terminate Session"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile top bar spacer */}
      <div className="h-16 lg:hidden" aria-hidden />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Spacing for bottom nav on mobile */}
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}
