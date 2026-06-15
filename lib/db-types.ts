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
  // Marketing-fidelity columns (migration_007).
  level?: string | null;
  format?: string | null;
  audience?: string | null;
  outcome?: string | null;
  featured?: boolean | null;
  includes?: string[] | null;
  /** Slugs of other courses unlocked when this course is purchased (migration_014). */
  bundled_courses?: string[] | null;
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
