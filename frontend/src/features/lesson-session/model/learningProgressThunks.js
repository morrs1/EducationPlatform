import {
  markLessonCompleted,
  syncCompletedLessonsForCourse,
} from "./lessonSessionSlice";
import { syncCourseLessonProgress } from "../../viewer/@x/lesson-session";
import {
  isUuid as isLearningUuid,
  requestCompletedLessonsForCourse,
  requestCompleteLesson,
  resolveRemoteViewerId,
} from "../../../shared/api";

function resolveLearningViewerId(state) {
  return resolveRemoteViewerId(
    state.auth?.currentViewerId,
    state.viewer?.remoteId,
  );
}

function shouldUseLearningServiceForLesson(state, lesson, explicitCourseId) {
  const courseId = explicitCourseId ?? lesson?.courseId;
  const userId = resolveLearningViewerId(state);
  const hasActiveEnrollment = state.viewer?.enrolledCourseIds?.includes(courseId);
  const isCourseCompleted = state.viewer?.completedCourseIds?.includes(courseId);

  return {
    userId,
    courseId,
    lessonId: lesson?.id,
    hasValidLearningIds:
      isLearningUuid(userId) &&
      isLearningUuid(courseId) &&
      isLearningUuid(lesson?.id),
    hasActiveEnrollment,
    isCourseCompleted,
    canUseLearningService:
      isLearningUuid(userId) &&
      isLearningUuid(courseId) &&
      isLearningUuid(lesson?.id) &&
      hasActiveEnrollment &&
      !isCourseCompleted,
  };
}

const pendingLessonCompletionKeys = new Set();

function buildLessonCompletionKey({ userId, courseId, lessonId }) {
  return `${userId}:${courseId}:${lessonId}`;
}

function isLessonAlreadyCompletedError(error) {
  const message = error?.responseBody?.msg ?? error?.message ?? "";

  return error?.status === 400 && message.includes("Lesson already completed");
}

export function hydrateCompletedLessonsFromLearningService({
  courseId,
  courseLessonIds = [],
} = {}) {
  return async (dispatch, getState) => {
    const state = getState();
    const userId = resolveLearningViewerId(state);

    if (!isLearningUuid(userId) || !isLearningUuid(courseId)) {
      return {
        ok: false,
        skipped: true,
      };
    }

    try {
      const response = await requestCompletedLessonsForCourse({
        userId,
        courseId,
      });
      const completedLessonIds = response.completedLessons.map(
        (lesson) => lesson.lessonId,
      );

      dispatch(
        syncCompletedLessonsForCourse({
          courseLessonIds,
          completedLessonIds,
        }),
      );
      dispatch(
        syncCourseLessonProgress({
          courseId,
          completedLessons: completedLessonIds.length,
        }),
      );

      return {
        ok: true,
        enrollmentId: response.enrollmentId,
        enrollmentStatus: response.enrollmentStatus,
        completedLessonIds,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось загрузить прогресс уроков.",
      };
    }
  };
}

export function completeLessonWithLearningService({
  lesson,
  courseId = null,
  courseLessonIds = [],
} = {}) {
  return async (dispatch, getState) => {
    if (!lesson?.id) {
      return {
        ok: false,
        skipped: true,
      };
    }

    const state = getState();
    const learningContext = shouldUseLearningServiceForLesson(
      state,
      lesson,
      courseId,
    );

    if (!learningContext.canUseLearningService) {
      if (
        !learningContext.hasValidLearningIds ||
        learningContext.isCourseCompleted
      ) {
        dispatch(markLessonCompleted(lesson.id));
      }

      return {
        ok: false,
        skipped: true,
      };
    }

    if (state.lessonSession.completedLessonIds.includes(lesson.id)) {
      return {
        ok: true,
        skipped: true,
      };
    }

    const completionKey = buildLessonCompletionKey(learningContext);

    if (pendingLessonCompletionKeys.has(completionKey)) {
      return {
        ok: true,
        skipped: true,
      };
    }

    try {
      pendingLessonCompletionKeys.add(completionKey);

      await requestCompleteLesson({
        userId: learningContext.userId,
        courseId: learningContext.courseId,
        lessonId: learningContext.lessonId,
      });

      const progressResponse = await requestCompletedLessonsForCourse({
        userId: learningContext.userId,
        courseId: learningContext.courseId,
      });
      const completedLessonIds = progressResponse.completedLessons.map(
        (completedLesson) => completedLesson.lessonId,
      );

      dispatch(
        syncCompletedLessonsForCourse({
          courseLessonIds,
          completedLessonIds,
        }),
      );

      return {
        ok: true,
        completedLessonIds,
      };
    } catch (error) {
      if (isLessonAlreadyCompletedError(error)) {
        const progressResponse = await requestCompletedLessonsForCourse({
          userId: learningContext.userId,
          courseId: learningContext.courseId,
        });
        const completedLessonIds = progressResponse.completedLessons.map(
          (completedLesson) => completedLesson.lessonId,
        );

        dispatch(
          syncCompletedLessonsForCourse({
            courseLessonIds,
            completedLessonIds,
          }),
        );
        dispatch(
          syncCourseLessonProgress({
            courseId: learningContext.courseId,
            completedLessons: completedLessonIds.length,
          }),
        );

        return {
          ok: true,
          completedLessonIds,
        };
      }

      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось отметить урок как завершенный.",
      };
    } finally {
      pendingLessonCompletionKeys.delete(completionKey);
    }
  };
}
