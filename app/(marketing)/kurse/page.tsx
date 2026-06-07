import { getPublicCourses } from "@/lib/courses";
import { CoursesStore } from "./courses-store";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getPublicCourses();
  return <CoursesStore courses={courses} />;
}
