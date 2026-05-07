import { getMockCourses } from "./mockCourses";
import { getCourseCoverSrc } from "./getCourseCoverSrc";
import { mockUsersById } from "../../user/model/mockUsers";

function sortByPopularity(courseA, courseB) {
  if (courseB.studentsCount !== courseA.studentsCount) {
    return courseB.studentsCount - courseA.studentsCount;
  }

  return courseB.rating - courseA.rating;
}

export function getCourseById(courseId) {
  return getMockCourses().find((course) => course.id === courseId) ?? null;
}

export function getCourseAuthor(course) {
  return mockUsersById[course.authorId] ?? null;
}

export function enrichCourse(course) {
  const author = getCourseAuthor(course);
  const tags = Array.isArray(course?.tags)
    ? course.tags
    : course?.subcategoryName
      ? [course.subcategoryName]
      : [];

  return {
    ...course,
    author,
    authorName: author?.name ?? course.authorName ?? "Автор курса",
    authorHeadline: author?.headline ?? "",
    authorAvatarUrl: author?.avatarUrl ?? "",
    imageUrl: course.imageUrl || getCourseCoverSrc(course),
    tags,
  };
}

export function mapCourseToPreview(course) {
  const enrichedCourse = enrichCourse(course);
  const tags = Array.isArray(enrichedCourse.tags)
    ? enrichedCourse.tags
    : [];

  return {
    id: enrichedCourse.id,
    title: enrichedCourse.title,
    authorId: enrichedCourse.authorId,
    authorName: enrichedCourse.authorName,
    imageUrl: enrichedCourse.imageUrl,
    rating: enrichedCourse.rating,
    studentsCount: enrichedCourse.studentsCount,
    durationLabel: enrichedCourse.durationLabel,
    categoryId: enrichedCourse.categoryId,
    categoryName: enrichedCourse.categoryName,
    categoryIcon: enrichedCourse.categoryIcon,
    subcategoryId: enrichedCourse.subcategoryId,
    subcategoryName: enrichedCourse.subcategoryName,
    shortDescription: enrichedCourse.shortDescription,
    level: enrichedCourse.level,
    tags,
  };
}

export function getAllCourses() {
  return getMockCourses().map(enrichCourse);
}

export function getCourseCategories() {
  const categoriesMap = new Map();

  for (const course of getMockCourses()) {
    if (categoriesMap.has(course.categoryId)) {
      continue;
    }

    categoriesMap.set(course.categoryId, {
      id: course.categoryId,
      name: course.categoryName,
      icon: course.categoryIcon,
    });
  }

  return Array.from(categoriesMap.values());
}

export function getCoursesByCategory() {
  return getMockCourses().reduce((acc, course) => {
    if (!acc[course.categoryId]) {
      acc[course.categoryId] = [];
    }

    acc[course.categoryId].push(mapCourseToPreview(course));
    return acc;
  }, {});
}

export function getPopularCourses(limit = 18) {
  return [...getMockCourses()]
    .sort(sortByPopularity)
    .slice(0, limit)
    .map(mapCourseToPreview);
}
