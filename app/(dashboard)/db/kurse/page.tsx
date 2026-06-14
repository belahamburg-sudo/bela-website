import { getStoreCatalog } from "@/lib/courses";
import { CoursesStore } from "./courses-store";

export const dynamic = "force-dynamic";

export default async function DashboardCoursesPage() {
  const courses = await getStoreCatalog();
  return <CoursesStore courses={courses} />;
}
