import { getCourseSyllabus } from "./mockCourseSyllabus";
import { mockCourses } from "./mockCourses";
import { getLessonProgressMap } from "../../lesson/model/progress";

const mockCoursesById = new Map(
  mockCourses.map((course) => [course.id, course]),
);

function getInteractiveLessonIds(syllabus) {
  return (syllabus?.modules ?? [])
    .flatMap((module) => module.lessons.map((lesson) => lesson.lessonId))
    .filter(Boolean);
}

function getCourseInteractiveLessonIds(course) {
  if (!course) {
    return [];
  }

  if (Array.isArray(course.syllabusLessonIds)) {
    return course.syllabusLessonIds.filter(Boolean);
  }

  return getInteractiveLessonIds(getCourseSyllabus(course.id));
}

export function getCourseProgressByCourseId({
  courseId,
  viewerProgress = null,
  viewedLessonIds = [],
  completedLessonIds = [],
  courseSnapshot = null,
  isCompletedCourse = false,
}) {
  const course = courseSnapshot ?? mockCoursesById.get(courseId) ?? null;

  if (!course) {
    return viewerProgress ?? null;
  }

  const persistedProgress = viewerProgress ?? {};
  const lessonsCount = course.lessonsCount ?? 0;
  const completedTests = Number(persistedProgress.completedTests) || 0;
  const completedTasks = Number(persistedProgress.completedTasks) || 0;
  const lastVisitedAt =
    typeof persistedProgress.lastVisitedAt === "string" &&
    persistedProgress.lastVisitedAt
      ? persistedProgress.lastVisitedAt
      : null;
  const interactiveLessonIds = getCourseInteractiveLessonIds(course);
  const isPersistedAsComplete =
    lessonsCount > 0 &&
    Number(persistedProgress.completedLessons) >= lessonsCount;

  if (isCompletedCourse || isPersistedAsComplete) {
    return {
      completedLessons: lessonsCount,
      completedTests: Math.max(completedTests, course.testsCount ?? 0),
      completedTasks: Math.max(completedTasks, course.tasksCount ?? 0),
      lastVisitedAt,
      progressPercent: lessonsCount > 0 ? 100 : 0,
      interactiveLessonsCount: interactiveLessonIds.length,
      startedInteractiveLessonsCount: interactiveLessonIds.length,
      completedInteractiveLessonsCount: interactiveLessonIds.length,
    };
  }

  const lessonProgressByLessonId = getLessonProgressMap(
    viewedLessonIds,
    completedLessonIds,
  );

  const completedInteractiveLessonsCount = interactiveLessonIds.filter(
    (lessonId) => lessonProgressByLessonId[lessonId]?.isCompleted,
  ).length;
  const startedInteractiveLessonsCount = interactiveLessonIds.filter(
    (lessonId) => lessonProgressByLessonId[lessonId]?.isStarted,
  ).length;

  const interactiveLessonsCount = interactiveLessonIds.length;
  const persistedCompletedLessons =
    Number(persistedProgress.completedLessons) || 0;
  const shouldUsePersistedCompletedLessons =
    course.isBackendCourse || interactiveLessonsCount === 0;
  const baseCompletedLessons = shouldUsePersistedCompletedLessons
    ? persistedCompletedLessons
    : Math.min(
        persistedCompletedLessons,
        Math.max(lessonsCount - interactiveLessonsCount, 0),
      );
  const completedLessons = Math.min(
    baseCompletedLessons + completedInteractiveLessonsCount,
    lessonsCount,
  );
  const progressPercent =
    lessonsCount > 0
      ? Math.round((completedLessons / lessonsCount) * 100)
      : 0;

  return {
    completedLessons,
    completedTests,
    completedTasks,
    lastVisitedAt,
    progressPercent,
    interactiveLessonsCount: interactiveLessonIds.length,
    startedInteractiveLessonsCount,
    completedInteractiveLessonsCount,
  };
}
