import type { MetadataRoute } from "next";
import { getPublicCourses } from "@/lib/courses";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com"
).replace(/\/$/, "");

/** Static marketing routes that always belong in the sitemap. */
const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/kurse", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/webinar", changeFrequency: "weekly", priority: 0.8 },
  { path: "/community", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/datenschutz", changeFrequency: "yearly", priority: 0.3 },
  { path: "/impressum", changeFrequency: "yearly", priority: 0.3 },
  { path: "/income-disclaimer", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // One entry per active course. A DB hiccup must never break the sitemap, so
  // fall back to the static routes only.
  try {
    const courses = await getPublicCourses();
    for (const course of courses) {
      entries.push({
        url: `${BASE_URL}/kurse/${course.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Ignore: keep the static routes only.
  }

  return entries;
}
