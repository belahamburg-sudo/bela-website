"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  ShoppingCart,
  Users,
  UserPlus,
  Send,
  Mail,
  CalendarClock,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Gift,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type NavLinkConfig = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  links: NavLinkConfig[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Cockpit",
    links: [{ href: "/admin", label: "Übersicht", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Inhalte",
    links: [
      { href: "/admin/kurse", label: "Kurse", icon: GraduationCap },
      { href: "/admin/medien", label: "Medien", icon: ImageIcon },
      { href: "/admin/webinar", label: "Webinar", icon: CalendarClock },
    ],
  },
  {
    label: "Verkauf",
    links: [
      { href: "/admin/verkaeufe", label: "Verkäufe", icon: ShoppingCart },
      { href: "/admin/kunden", label: "Kunden", icon: Users },
      { href: "/admin/leads", label: "Leads", icon: UserPlus },
      { href: "/admin/affiliate", label: "Affiliate", icon: Gift },
    ],
  },
  {
    label: "Kommunikation",
    links: [
      { href: "/admin/emails", label: "E-Mails", icon: Mail },
      { href: "/admin/telegram", label: "Telegram", icon: Send },
    ],
  },
  {
    label: "System",
    links: [{ href: "/admin/einstellungen", label: "Einstellungen", icon: Settings }],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: NavLinkConfig & { onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
        isActive
          ? "text-gold-300 bg-gold-300/[0.04] shadow-[inset_0_0_20px_rgba(201, 169, 97,0.05)]"
          : "text-cream/30 hover:text-cream/80 hover:bg-white/[0.02]"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="adminActiveNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-gold-300 shadow-[0_0_10px_rgba(201, 169, 97,0.5)]"
        />
      )}
      <Icon
        className={`h-4 w-4 flex-shrink-0 transition-colors ${
          isActive ? "text-gold-300" : "text-cream/20 group-hover:text-cream/40"
        }`}
      />
      <span className="flex-1">{label}</span>
      <ChevronRight
        className={`h-3 w-3 transition-all ${
          isActive
            ? "translate-x-0 opacity-20"
            : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-20"
        }`}
      />
    </Link>
  );
}

function SidebarContent({
  email,
  onNavClick,
}: {
  email: string;
  onNavClick?: () => void;
}) {
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
      <div className="p-6">
        <Link href="/admin" onClick={onNavClick} className="group flex flex-col gap-2">
          <Image
            src="/assets/logo-ai-goldmining-3d.png"
            alt="AI Goldmining"
            width={1200}
            height={204}
            className="w-auto transition-opacity group-hover:opacity-90"
            style={{ height: "30px" }}
            priority
          />
          <span className="pl-0.5 text-[9px] font-mono uppercase tracking-[0.3em] text-gold-300/40">
            Kontrollzentrale
          </span>
        </Link>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-300/10 to-transparent" />

      <nav className="flex-1 space-y-6 overflow-y-auto py-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="mb-2 px-6">
              <span className="tac-label text-white/15">{group.label}</span>
            </div>
            <div className="space-y-0.5">
              {group.links.map((link) => (
                <NavLink key={link.href} {...link} onClick={onNavClick} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-3 p-6">
        <Link
          href="/"
          onClick={onNavClick}
          className="group flex w-full items-center gap-3 border border-white/5 bg-white/[0.02] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40 transition-all hover:border-gold-300/20 hover:bg-gold-300/[0.02] hover:text-gold-300"
        >
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-40 group-hover:opacity-100" />
          <span>Zur Website</span>
        </Link>

        <div className="flex items-center gap-3 border border-white/5 bg-white/[0.01] px-3 py-3">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold-300/10 text-[11px] font-bold uppercase text-gold-300">
            {email.charAt(0)}
          </div>
          <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-cream/50">
            {email}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 border border-white/5 bg-white/[0.02] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40 transition-all hover:border-gold-300/20 hover:bg-gold-300/[0.02] hover:text-gold-300"
        >
          <LogOut className="h-3.5 w-3.5 flex-shrink-0 opacity-40 group-hover:opacity-100" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ email }: { email: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col">
        <SidebarContent email={email} />
      </aside>
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0" aria-hidden />

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gold-300/10 bg-ink/95 px-4 backdrop-blur-md lg:hidden">
        <Link href="/admin" className="flex items-center">
          <Image
            src="/assets/logo-ai-goldmining-3d.png"
            alt="AI Goldmining"
            width={1200}
            height={204}
            className="w-auto"
            style={{ height: "24px" }}
            priority
          />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center border border-white/5 bg-white/[0.03] text-cream/60 transition-colors hover:text-gold-300"
          aria-label="Menü öffnen"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <div className="h-16 lg:hidden" aria-hidden />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center text-cream/50 hover:text-gold-300"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent email={email} onNavClick={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
