/** DB row types for Supabase course/module/lesson tables. */

export type DbResource = {
  label: string;
  type: "PDF" | "Template" | "Prompt" | "XLSX" | "TXT" | "HTML";
  href: string;
};

export type DbLesson = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration: string | null;
  position: number;
  resources: DbResource[];
};

export type DbModule = {
  id: string;
  course_id: string;
  title: string;
  position: number;
  /** Ordered courses recommended after this module, shown to members (migration_031). */
  recommended_courses?: ModuleRecommendation[] | null;
  /** @deprecated Legacy single recommendation (migration_020); superseded by recommended_courses. */
  recommended_course_slug?: string | null;
  /** @deprecated Legacy single-recommendation note (migration_020). */
  recommendation_note?: string | null;
  /** 3–5 sales bullets shown per module on the product page (migration_022). */
  highlights?: string[] | null;
  /** Public preview video shown per module on the product page (migration_032). */
  preview_video_url?: string | null;
  /** Drip content: days after purchase before this module unlocks (migration_030). */
  drip_days?: number | null;
  lessons: DbLesson[];
};

/** One "next step" course recommendation attached to a module. */
export type ModuleRecommendation = { slug: string; note: string };

/**
 * Normalize a module's recommendations to a clean list, falling back to the
 * legacy single-slug columns when the new `recommended_courses` column is empty
 * or absent (pre-migration_031). Pure — safe to import from server or client.
 */
export function moduleRecommendations(m: {
  recommended_courses?: Array<{ slug?: string | null; note?: string | null }> | null;
  recommended_course_slug?: string | null;
  recommendation_note?: string | null;
}): ModuleRecommendation[] {
  if (Array.isArray(m.recommended_courses) && m.recommended_courses.length > 0) {
    return m.recommended_courses
      .filter((r): r is { slug: string; note?: string | null } => Boolean(r && r.slug))
      .map((r) => ({ slug: r.slug, note: typeof r.note === "string" ? r.note : "" }));
  }
  if (m.recommended_course_slug) {
    return [{ slug: m.recommended_course_slug, note: m.recommendation_note ?? "" }];
  }
  return [];
}

export type DbCourse = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  is_active: boolean;
  /** Hidden lead magnet courses (migration_019). */
  is_unlisted?: boolean | null;
  // Marketing-fidelity columns (migration_007).
  level?: string | null;
  format?: string | null;
  audience?: string | null;
  outcome?: string | null;
  featured?: boolean | null;
  includes?: string[] | null;
  /** Slugs of other courses unlocked when this course is purchased (migration_014). */
  bundled_courses?: string[] | null;
  // Rich product page / pricing columns (migration_017).
  /** Strikethrough "anchor" price; a "-X% OFF" badge is derived when price is lower. */
  compare_at_price_cents?: number | null;
  /** Promo video shown on the product page, separate from the cover. */
  promo_video_url?: string | null;
  /** Hand-picked cross-sell course slugs shown under the lesson videos. */
  cross_sell_slugs?: string[] | null;
  /** Per-course affiliate / tools text shown under the lesson videos. */
  affiliate_text?: string | null;
  /** Editable sales-page sections; empty keys hide their section. */
  product_page?: Record<string, unknown> | null;
  /** Linked Stripe product/price (migration_021) — set via the admin sync button. */
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
  sort_order?: number | null;
  updated_at?: string | null;
  created_at?: string | null;
  /** Drip content: time-gate modules after purchase (migration_030). */
  drip_enabled?: boolean | null;
  /** Installment checkout: number of monthly payments (migration_030). */
  installment_count?: number | null;
  /** Installment checkout: price per installment in cents (migration_030). */
  installment_price_cents?: number | null;
  modules: DbModule[];
};

export type DbProfile = {
  id: string;
  email: string;
  full_name: string | null;
  city: string | null;
  goal: string | null;
  business_snapshot: Record<string, string> | null;
  onboarding_complete: boolean;
  created_at: string;
};
