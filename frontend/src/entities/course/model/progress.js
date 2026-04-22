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

export function getCourseProgressByCourseId({
  courseId,
  viewerProgress = null,
  viewedLessonIds = [],
  completedLessonIds = [],
}) {
  const course = mockCoursesById.get(courseId) ?? null;

  if (!course) {
    return viewerProgress ?? null;
  }

  const persistedProgress = viewerProgress ?? {};
  const lessonsCount = course.lessonsCount ?? 0;
  const syllabus = getCourseSyllabus(course.id);
  const interactiveLessonIds = getInteractiveLessonIds(syllabus);
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
  const maxPersistedCompletedLessons = Math.max(
    lessonsCount - interactiveLessonsCount,
    0,
  );
  const baseCompletedLessons = Math.min(
    Number(persistedProgress.completedLessons) || 0,
    maxPersistedCompletedLessons,
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
    completedTests: Number(persistedProgress.completedTests) || 0,
    completedTasks: Number(persistedProgress.completedTasks) || 0,
    lastVisitedAt:
      typeof persistedProgress.lastVisitedAt === "string" &&
      persistedProgress.lastVisitedAt
        ? persistedProgress.lastVisitedAt
        : null,
    progressPercent,
    interactiveLessonsCount,
    startedInteractiveLessonsCount,
    completedInteractiveLessonsCount,
  };
}
