/** DB row types for Supabase course/module/lesson tables. */

export type DbResource = {
  label: string;
  type: "PDF" | "Template" | "Prompt";
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
  /** Slug of a course recommended after this module, shown to members (migration_020). */
  recommended_course_slug?: string | null;
  /** Optional note shown with the recommendation ("Bevor du weitermachst …"). */
  recommendation_note?: string | null;
  lessons: DbLesson[];
};

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
