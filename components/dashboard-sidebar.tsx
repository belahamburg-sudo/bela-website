"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Pickaxe,
} from "lucide-react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/kurse", label: "Meine Kurse", icon: BookOpen, exact: false },
  { href: "/dashboard/profil", label: "Profil", icon: User, exact: false },
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
  icon: React.ElementType;
  exact: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition-colors ${
        isActive
          ? "bg-gold-300/10 text-gold-300 border-l-2 border-gold-300"
          : "text-cream/45 hover:bg-cream/[0.04] hover:text-cream/80 border-l-2 border-transparent"
      }`}
    >
      <Icon
        className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-gold-300" : "text-cream/30"}`}
      />
      {label}
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
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link
        href="/dashboard"
        onClick={onNavClick}
        className="flex items-center gap-2.5 border-b border-gold-300/10 px-4 py-6"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-gold-300/25 bg-gold-300/10">
          <Pickaxe className="h-4 w-4 text-gold-300" />
        </div>
        <span className="font-heading tracking-gta text-base text-cream">
          AI Goldmining
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {NAV_LINKS.map((link) => (
          <NavLink key={link.href} {...link} onClick={onNavClick} />
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gold-300/10 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-cream/35 transition-colors hover:bg-cream/[0.04] hover:text-cream/65"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Abmelden
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-shrink-0 lg:flex-col border-r border-gold-300/10 bg-graphite">
        <SidebarContent />
      </aside>

      {/* Desktop spacer */}
      <div className="hidden lg:block lg:w-60 lg:flex-shrink-0" aria-hidden />

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gold-300/10 bg-graphite/95 px-4 backdrop-blur-sm lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-gold-300/25 bg-gold-300/10">
            <Pickaxe className="h-3.5 w-3.5 text-gold-300" />
          </div>
          <span className="font-heading tracking-gta text-sm text-cream">
            AI Goldmining
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-sm p-2 text-cream/45 transition-colors hover:bg-cream/[0.06] hover:text-cream/80"
          aria-label="Navigation öffnen"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile top bar spacer */}
      <div className="h-14 lg:hidden" aria-hidden />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-60 border-r border-gold-300/10 bg-graphite"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="absolute right-3 top-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-sm p-2 text-cream/35 transition-colors hover:bg-cream/[0.06] hover:text-cream/65"
                  aria-label="Navigation schließen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
