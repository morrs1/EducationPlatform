import { normalizeText } from "../../../shared/lib/gatewayValues";
import { getCourseCoverSrc } from "./getCourseCoverSrc";

/**
 * Maps a `pageData.course`-shaped object (after course-service + optional enrich)
 * into the shape expected by {@link CoursePreviewCard}.
 */
export function mapPageDataCourseToPreview(course) {
  if (!course?.id) {
    return null;
  }

  const tags = Array.isArray(course.tags) ? course.tags : [];
  const cover = normalizeText(course.coverUrl) || normalizeText(course.imageUrl);
  const forCover = cover ? { ...course, coverUrl: cover, imageUrl: cover } : course;

  return {
    id: String(course.id).trim(),
    title: course.title || "Курс",
    authorId: course.authorId ? String(course.authorId).trim() : "",
    authorName: normalizeText(course.authorName) || "",
    imageUrl: getCourseCoverSrc(forCover),
    studentsCount: course.studentsCount ?? null,
    durationLabel: course.durationLabel || "",
    categoryId: course.categoryId ?? null,
    categoryName: course.categoryName || "",
    categoryIcon: course.categoryIcon || "📘",
    subcategoryId: course.subcategoryId ?? null,
    subcategoryName: course.subcategoryName || "",
    shortDescription: course.shortDescription || "",
    level: course.level || course.difficulty || "beginner",
    tags,
    lessonsCount: Number(course.lessonsCount) || 0,
  };
}
