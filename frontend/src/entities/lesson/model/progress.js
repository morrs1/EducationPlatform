import { mockLessons } from "./mockLessons";

export function getLessonProgressByLessonId(lessonId, completedStepIds = []) {
  if (!lessonId) {
    return null;
  }

  const lesson = mockLessons.find((item) => item.id === lessonId);

  if (!lesson) {
    return null;
  }

  const totalStepsCount = lesson.stepIds.length;
  const completedStepsCount = lesson.stepIds.filter((stepId) =>
    completedStepIds.includes(stepId),
  ).length;

  return {
    lessonId,
    totalStepsCount,
    completedStepsCount,
    isStarted: completedStepsCount > 0,
    isCompleted:
      totalStepsCount > 0 && completedStepsCount === totalStepsCount,
  };
}

export function getLessonProgressMap(completedStepIds = []) {
  return mockLessons.reduce((accumulator, lesson) => {
    accumulator[lesson.id] = getLessonProgressByLessonId(
      lesson.id,
      completedStepIds,
    );

    return accumulator;
  }, {});
}
