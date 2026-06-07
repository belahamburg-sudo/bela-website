import { getPublicCourses } from "@/lib/courses";
import { CoursesStore } from "./courses-store";

export const dynamic = "force-dynamic";

export default async function DashboardCoursesPage() {
  const courses = await getPublicCourses();
  return <CoursesStore courses={courses} />;
}
