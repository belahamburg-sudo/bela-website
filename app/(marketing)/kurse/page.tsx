import type { Metadata } from "next";
import { getPublicCourses } from "@/lib/courses";
import { CoursesStore } from "./courses-store";

export const dynamic = "force-dynamic";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Kurse: AI & digitale Produkte lernen · AI Goldmining",
  description:
    "Alle Kurse von AI Goldmining im Überblick: Schritt für Schritt digitale Produkte mit AI bauen, vermarkten und verkaufen. Vom Einstieg bis zum System.",
  openGraph: {
    title: "Kurse: AI & digitale Produkte lernen · AI Goldmining",
    description:
      "Alle Kurse von AI Goldmining im Überblick: Schritt für Schritt digitale Produkte mit AI bauen, vermarkten und verkaufen. Vom Einstieg bis zum System.",
    url: `${BASE_URL}/kurse`,
    type: "website",
  },
  alternates: { canonical: `${BASE_URL}/kurse` },
};

export default async function CoursesPage() {
  const courses = await getPublicCourses();
  return <CoursesStore courses={courses} />;
}
