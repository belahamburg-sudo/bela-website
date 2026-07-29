import type { Course } from "@/lib/content";

export function isListedStoreCourse(course: Pick<Course, "isUnlisted">): boolean {
  return !course.isUnlisted;
}

export function filterListedStoreCourses<T extends Pick<Course, "isUnlisted">>(courses: T[]): T[] {
  return courses.filter(isListedStoreCourse);
}
