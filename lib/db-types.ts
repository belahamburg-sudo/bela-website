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
  modules: DbModule[];
};
