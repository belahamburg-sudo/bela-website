"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Play,
  FileText,
  ShoppingBag,
  Library,
  Star,
  Check,
  Layers,
} from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { CheckoutButton } from "@/components/checkout-button";
import { SpatialBackground } from "@/components/spatial-background";
import { StoreProductCard, type StoreCardCourse } from "@/components/store-product-card";
import { TelegramSubscribeCard } from "@/components/telegram-subscribe-card";
import type { Course } from "@/lib/content";
import { formatEuro } from "@/lib/utils";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type StoreItem = StoreCardCourse & { featured: boolean; isPurchased: boolean };

type Filter = "all" | "video" | "pdf";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export function CoursesStore({ courses }: { courses: Course[] }) {
  const [hasMounted, setHasMounted] = useState(false);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    async function load() {
      let purchasedSlugs = new Set<string>();
      let completedIds = new Set<string>();

      try {
        if (hasSupabasePublicEnv()) {
          const supabase = getSupabaseBrowserClient();
          if (supabase) {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              const [pRes, prRes] = await Promise.all([
                supabase.from("purchases").select("course_slug").eq("user_id", user.id).eq("status", "paid"),
                supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
              ]);
              purchasedSlugs = new Set((pRes.data ?? []).map((p: { course_slug: string }) => p.course_slug));
              completedIds = new Set((prRes.data ?? []).map((p: { lesson_id: string }) => p.lesson_id));
            }
          }
        }
      } catch (err) {
        console.error("Store load error:", err);
      }

      const built: StoreItem[] = courses.map((c) => {
        const lessonIds = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
        const totalLessons = lessonIds.length;
        const completedLessons = lessonIds.filter((id) => completedIds.has(id)).length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        return {
          slug: c.slug,
          title: c.title,
          tagline: c.tagline,
          image: c.image,
          price_cents: c.priceCents,
          level: c.level,
          format: c.format,
          totalLessons,
          completedLessons,
          progress,
          isBundle: c.level === "Bundle",
          featured: Boolean(c.featured),
          isPurchased: purchasedSlugs.has(c.slug),
        };
      });

      setItems(built);
      setLoading(false);
    }

    load();
    setHasMounted(true);
  }, [courses]);

  if (!hasMounted || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gold-300/20 border-t-gold-300" />
          <p className="tac-label animate-pulse">Store wird geladen...</p>
        </div>
      </div>
    );
  }

  const purchased = items.filter((i) => i.isPurchased);
  const available = items.filter((i) => !i.isPurchased);
  const bundle = available.find((i) => i.isBundle);
  const bundleStatic = bundle ? courses.find((c) => c.slug === bundle.slug) : undefined;
  const catalog = available.filter((i) => !i.isBundle);
  const videoItems = catalog.filter((i) => i.format === "video");
  const pdfItems = catalog.filter((i) => i.format === "pdf");

  const totalCount = items.length;
  const videoCount = items.filter((i) => i.format === "video").length;
  const pdfCount = items.filter((i) => i.format === "pdf").length;

  const tabs: { key: Filter; label: string; icon: typeof Play; count: number }[] = [
    { key: "all", label: "Alle", icon: Layers, count: catalog.length },
    { key: "video", label: "Video-Kurse", icon: Play, count: videoItems.length },
    { key: "pdf", label: "PDF-Guides", icon: FileText, count: pdfItems.length },
  ];

  const renderGrid = (list: StoreItem[]) => (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      {list.map((c) => (
        <motion.div key={c.slug} variants={itemVariants}>
          <StoreProductCard course={c} isPurchased={false} />
        </motion.div>
      ))}
    </motion.div>
  );

  const sectionHeader = (icon: React.ReactNode, title: string, count: number, muted = false) => (
    <div className="mb-7 flex items-center gap-3">
      <span className={muted ? "text-cream/30" : "text-gold-300/70"}>{icon}</span>
      <h2 className="font-heading text-lg uppercase tracking-[0.12em] text-cream">{title}</h2>
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cream/30">{count}</span>
    </div>
  );

  return (
    <AuthGate>
      <section className="relative min-h-screen overflow-hidden bg-obsidian py-12 sm:py-20">
        <SpatialBackground />

        <div className="container-shell relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-gold-300/30" />
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-gold-300/60">
                Goldmine
              </span>
            </div>
            <h1 className="font-heading text-4xl uppercase leading-none tracking-gta text-cream md:text-6xl">
              DEINE <span className="gold-text">GOLDMINE.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/45">
              Alle Kurse, dein Elite-Miners-Zugang und jedes Produkt zum Freischalten —
              an einem Ort.
            </p>

            {/* Stat chips */}
            <div className="mt-7 flex flex-wrap gap-3">
              {[
                { icon: ShoppingBag, label: `${totalCount} Produkte` },
                { icon: Play, label: `${videoCount} Video-Kurse` },
                { icon: FileText, label: `${pdfCount} PDF-Guides` },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 border border-white/10 bg-ink/40 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-cream/50 backdrop-blur-md"
                >
                  <Icon className="h-3.5 w-3.5 text-gold-300/50" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Elite Miners — VIP Telegram subscription */}
          <div className="mb-16">
            <TelegramSubscribeCard />
          </div>

          {/* Library — purchased */}
          {purchased.length > 0 && (
            <div className="mb-16">
              {sectionHeader(<Library className="h-4 w-4" />, "Deine Bibliothek", purchased.length)}
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {purchased.map((c) => (
                  <motion.div key={c.slug} variants={itemVariants}>
                    <StoreProductCard course={c} isPurchased={true} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Featured bundle banner */}
          {bundle && bundleStatic && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative mb-16 overflow-hidden border border-gold-300/30 bg-gradient-to-br from-gold-300/[0.10] via-ink/70 to-ink/50 backdrop-blur-xl"
            >
              {/* glow */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-300/15 blur-[100px]" />

              <div className="relative grid items-center gap-8 p-7 md:grid-cols-[1.5fr_1fr] md:p-10">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold-300">
                    <Star className="h-3 w-3 fill-current" />
                    Komplett-Paket
                  </div>
                  <h2 className="font-heading text-3xl uppercase leading-none tracking-gta text-cream md:text-4xl">
                    {bundle.title}
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/50">
                    {bundleStatic.description}
                  </p>

                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {bundleStatic.includes.map((inc) => (
                      <li key={inc} className="flex items-center gap-2 text-[12px] text-cream/60">
                        <Check className="h-3.5 w-3.5 flex-none text-gold-300" />
                        {inc}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-end gap-5">
                    <div>
                      <span className="block text-[8px] font-mono uppercase tracking-[0.2em] text-cream/30">
                        Einmalig
                      </span>
                      <span className="gold-text font-heading text-4xl leading-none">
                        {formatEuro(bundle.price_cents)}
                      </span>
                    </div>
                    <CheckoutButton
                      courseSlug={bundle.slug}
                      label="Bundle sichern"
                      className="rounded-none px-7 py-3.5 text-[11px] tracking-[0.15em]"
                    />
                  </div>
                </div>

                {/* cover */}
                <div className="relative hidden aspect-[4/3] overflow-hidden border border-white/10 md:block">
                  <Image
                    src={bundle.image}
                    alt={bundle.title}
                    fill
                    sizes="33vw"
                    className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Catalog */}
          {catalog.length > 0 ? (
            <>
              {/* Filter tabs */}
              <div className="mb-10 inline-flex items-center gap-1 border border-white/10 bg-ink/40 p-1 backdrop-blur-md">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = filter === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setFilter(t.key)}
                      className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                        active ? "text-ink" : "text-cream/40 hover:text-cream/80"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="storeTab"
                          className="absolute inset-0 -z-10 bg-gold-gradient"
                        />
                      )}
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                      <span className={active ? "text-ink/60" : "text-cream/25"}>{t.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Grids */}
              {filter === "all" ? (
                <div className="space-y-16">
                  {videoItems.length > 0 && (
                    <div>
                      {sectionHeader(<Play className="h-4 w-4" />, "Video-Kurse", videoItems.length)}
                      {renderGrid(videoItems)}
                    </div>
                  )}
                  {pdfItems.length > 0 && (
                    <div>
                      {sectionHeader(<FileText className="h-4 w-4" />, "PDF-Guides", pdfItems.length)}
                      {renderGrid(pdfItems)}
                    </div>
                  )}
                </div>
              ) : filter === "video" ? (
                videoItems.length > 0 ? (
                  renderGrid(videoItems)
                ) : (
                  <EmptyCategory />
                )
              ) : pdfItems.length > 0 ? (
                renderGrid(pdfItems)
              ) : (
                <EmptyCategory />
              )}
            </>
          ) : (
            <div className="tac-panel tac-corners border-white/5 p-16 text-center">
              <Check className="mx-auto mb-4 h-8 w-8 text-gold-300/60" />
              <p className="font-heading text-xl uppercase tracking-[0.1em] text-cream">
                Alles freigeschaltet.
              </p>
              <p className="mt-2 text-[11px] font-mono uppercase tracking-[0.2em] text-cream/30">
                Du besitzt jeden Kurs im Store
              </p>
            </div>
          )}
        </div>
      </section>
    </AuthGate>
  );
}

function EmptyCategory() {
  return (
    <div className="tac-panel tac-corners border-white/5 p-14 text-center">
      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-cream/30">
        Keine Produkte in dieser Kategorie
      </p>
    </div>
  );
}
