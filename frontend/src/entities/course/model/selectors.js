import { mockCourses } from "./mockCourses";
import { getCourseCoverSrc } from "./getCourseCoverSrc";
import { mockUsersById } from "../../user/model/mockUsers";

const mockCoursesById = new Map(
  mockCourses.map((course) => [course.id, course]),
);

function sortByPopularity(courseA, courseB) {
  if (courseB.studentsCount !== courseA.studentsCount) {
    return courseB.studentsCount - courseA.studentsCount;
  }

  return courseB.rating - courseA.rating;
}

export function getCourseById(courseId) {
  return mockCoursesById.get(courseId) ?? null;
}

export function getCourseAuthor(course) {
  return mockUsersById[course.authorId] ?? null;
}

export function enrichCourse(course) {
  const author = getCourseAuthor(course);

  return {
    ...course,
    author,
    authorName: author?.name ?? "Автор курса",
    authorHeadline: author?.headline ?? "",
    authorAvatarUrl: author?.avatarUrl ?? "",
    imageUrl: getCourseCoverSrc(course),
  };
}

export function mapCourseToPreview(course) {
  const enrichedCourse = enrichCourse(course);

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
  };
}

export function getAllCourses() {
  return mockCourses.map(enrichCourse);
}

export function getCourseCategories() {
  const categoriesMap = new Map();

  for (const course of mockCourses) {
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
  return mockCourses.reduce((acc, course) => {
    if (!acc[course.categoryId]) {
      acc[course.categoryId] = [];
    }

    acc[course.categoryId].push(mapCourseToPreview(course));
    return acc;
  }, {});
}

export function getPopularCourses(limit = 18) {
  return [...mockCourses]
    .sort(sortByPopularity)
    .slice(0, limit)
    .map(mapCourseToPreview);
}
