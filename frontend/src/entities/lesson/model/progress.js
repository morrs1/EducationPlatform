import { mockLessons } from "./mockLessons";

function buildFallbackLessonProgress(
  lessonId,
  viewedLessonIds = [],
  completedLessonIds = [],
) {
  const isCompleted = completedLessonIds.includes(lessonId);
  const isStarted = isCompleted || viewedLessonIds.includes(lessonId);

  return {
    lessonId,
    isStarted,
    isCompleted,
  };
}

export function getLessonProgressByLessonId(
  lessonId,
  viewedLessonIds = [],
  completedLessonIds = [],
) {
  if (!lessonId) {
    return null;
  }

  const lesson = mockLessons.find((item) => item.id === lessonId);

  if (!lesson) {
    return buildFallbackLessonProgress(
      lessonId,
      viewedLessonIds,
      completedLessonIds,
    );
  }

  return {
    lessonId,
    isStarted:
      completedLessonIds.includes(lesson.id) ||
      viewedLessonIds.includes(lesson.id),
    isCompleted: completedLessonIds.includes(lesson.id),
  };
}

export function getLessonProgressMap(
  viewedLessonIds = [],
  completedLessonIds = [],
  lessonIds = [],
) {
  const progressMap = mockLessons.reduce((accumulator, lesson) => {
    accumulator[lesson.id] = getLessonProgressByLessonId(
      lesson.id,
      viewedLessonIds,
      completedLessonIds,
    );

    return accumulator;
  }, {});

  lessonIds.filter(Boolean).forEach((lessonId) => {
    if (!progressMap[lessonId]) {
      progressMap[lessonId] = getLessonProgressByLessonId(
        lessonId,
        viewedLessonIds,
        completedLessonIds,
      );
    }
  });

  return progressMap;
}
