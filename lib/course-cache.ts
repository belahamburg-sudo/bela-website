import { revalidatePath } from "next/cache";

export function revalidatePublicCoursePaths(slug?: string) {
  revalidatePath("/kurse");
  revalidatePath("/db/kurse");
  if (!slug) return;
  revalidatePath(`/kurse/${slug}`);
  revalidatePath(`/freebie/${slug}`);
  revalidatePath(`/db/kurse/${slug}`);
}
