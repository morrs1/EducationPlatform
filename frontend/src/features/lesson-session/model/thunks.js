import {
  markLessonCompleted,
  markLessonViewed,
  setRunResult,
  setSubmissionResult,
  syncCompletedLessonsForCourse,
} from "./lessonSessionSlice";
import { syncCourseLessonProgress } from "../../viewer/model/viewerSlice";
import { selectLessonDraft } from "./selectors";
import { executeCodeStep } from "./codeExecutionGateway";
import {
  isUuid as isLearningUuid,
  requestCompletedLessonsForCourse,
  requestCompleteLesson,
} from "../../../shared/api/learningServiceApi";
import { resolveRemoteViewerId } from "../../../shared/api/userServiceApi";

function createTimestamp() {
  return new Date().toISOString();
}

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

function areOptionIdsEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();

  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

function normalizeTextAnswer(answer, question) {
  let value = answer ?? "";

  if (question?.trim) {
    value = value.trim();
  }

  if (question?.ignoreCase) {
    value = value.toLowerCase();
  }

  return value;
}

function getQuestionCorrectOptionIds(question) {
  if (Array.isArray(question?.correctOptionIds)) {
    return question.correctOptionIds;
  }

  return (question?.options ?? [])
    .filter((option) => option.isCorrect)
    .map((option) => option.id);
}

function gradeQuizLesson(lesson, draft) {
  const questions = lesson?.questions ?? [];

  if (!questions.length) {
    return {
      status: "incorrect",
      score: 0,
      maxScore: lesson?.points ?? 0,
      feedback: "В уроке пока нет вопросов для проверки.",
      answerSnapshot: {
        answersByQuestionId: {},
      },
      checkedAt: createTimestamp(),
      passedCases: 0,
      totalCases: 0,
    };
  }

  const answersByQuestionId = draft?.answersByQuestionId ?? {};
  let correctAnswersCount = 0;
  let answeredQuestionsCount = 0;

  questions.forEach((question) => {
    const answerDraft = answersByQuestionId[question.id] ?? null;

    if (question.type === "text") {
      const rawAnswer = answerDraft?.answer ?? "";
      const normalizedAnswer = normalizeTextAnswer(rawAnswer, question);

      if (!normalizedAnswer) {
        return;
      }

      answeredQuestionsCount += 1;

      const acceptedAnswers = (question.acceptedAnswers ?? []).map((answer) =>
        normalizeTextAnswer(answer, question),
      );

      if (acceptedAnswers.includes(normalizedAnswer)) {
        correctAnswersCount += 1;
      }

      return;
    }

    const selectedOptionIds = answerDraft?.selectedOptionIds ?? [];

    if (!selectedOptionIds.length) {
      return;
    }

    answeredQuestionsCount += 1;

    if (
      areOptionIdsEqual(selectedOptionIds, getQuestionCorrectOptionIds(question))
    ) {
      correctAnswersCount += 1;
    }
  });

  const totalQuestionsCount = questions.length;
  const isCompleted = correctAnswersCount === totalQuestionsCount;
  const maxScore = lesson?.points ?? totalQuestionsCount;
  const feedback =
    answeredQuestionsCount === 0
      ? "Ответьте хотя бы на один вопрос перед проверкой."
      : isCompleted
        ? "Верно. Все ответы засчитаны."
        : `Пока верно ${correctAnswersCount} из ${totalQuestionsCount}.`;

  return {
    status: isCompleted ? "correct" : "incorrect",
    score: isCompleted ? maxScore : 0,
    maxScore,
    feedback,
    answerSnapshot: {
      answersByQuestionId,
    },
    checkedAt: createTimestamp(),
    passedCases: correctAnswersCount,
    totalCases: totalQuestionsCount,
  };
}

function createUnsupportedLessonResult(lesson, type) {
  return {
    status: "incorrect",
    score: 0,
    maxScore: lesson?.points ?? 0,
    feedback: `Тип урока "${type}" пока не поддерживается.`,
    checkedAt: createTimestamp(),
    answerSnapshot: null,
  };
}

export function openLesson({
  lesson,
  courseId = null,
  courseLessonIds = [],
} = {}) {
  return async (dispatch, getState) => {
    if (!lesson?.id) {
      return;
    }

    const wasCompleted = getState().lessonSession.completedLessonIds.includes(
      lesson.id,
    );

    dispatch(markLessonViewed(lesson.id));

    if (lesson.type === "theory" && !wasCompleted) {
      await dispatch(
        completeLessonWithLearningService({
          lesson,
          courseId,
          courseLessonIds,
        }),
      );
    }
  };
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

export function runCodeLesson({ lesson }) {
  return async (dispatch, getState) => {
    if (!lesson || lesson.type !== "code" || !lesson.grader) {
      return {
        status: "failed",
        passedCases: 0,
        totalCases: 0,
        feedback: "Для урока пока не настроен code runner.",
        cases: [],
      };
    }

    const draft = selectLessonDraft(getState(), lesson.id);
    const code = draft?.code ?? "";
    const result = await executeCodeStep({
      lesson,
      grader: lesson.grader,
      code,
      mode: "run",
    });

    dispatch(
      setRunResult({
        lessonId: lesson.id,
        result: {
          ...result,
          updatedAt: createTimestamp(),
        },
      }),
    );

    return result;
  };
}

export function submitLessonAnswer({
  lesson,
  courseId = null,
  courseLessonIds = [],
} = {}) {
  return async (dispatch, getState) => {
    if (!lesson) {
      return {
        status: "incorrect",
        score: 0,
        maxScore: 0,
        feedback: "Урок не найден.",
      };
    }

    if (lesson.type === "theory") {
      const completionResult = await dispatch(
        completeLessonWithLearningService({
          lesson,
          courseId,
          courseLessonIds,
        }),
      );

      return {
        status: completionResult?.ok ? "correct" : "incorrect",
        score: 0,
        maxScore: 0,
        feedback: completionResult?.ok
          ? "Теоретический урок засчитан как просмотренный."
          : completionResult?.error ?? "Не удалось сохранить прогресс урока.",
      };
    }

    const draft = selectLessonDraft(getState(), lesson.id);
    let result;

    if (lesson.type === "quiz") {
      result = gradeQuizLesson(lesson, draft);
    } else if (lesson.type === "code") {
      result = await executeCodeStep({
        lesson,
        grader: lesson.grader,
        code: draft?.code ?? "",
        mode: "submit",
      });
    } else {
      result = createUnsupportedLessonResult(lesson, lesson.type);
    }

    if (result.status === "correct") {
      const completionResult = await dispatch(
        completeLessonWithLearningService({
          lesson,
          courseId,
          courseLessonIds,
        }),
      );

      if (!completionResult?.ok) {
        result = {
          ...result,
          status: "incorrect",
          feedback:
            completionResult?.error ??
            "Ответ верный, но прогресс урока не удалось сохранить.",
        };
      }
    }

    dispatch(
      setSubmissionResult({
        lessonId: lesson.id,
        result: {
          ...result,
          checkedAt: result.checkedAt ?? createTimestamp(),
        },
      }),
    );

    return result;
  };
}
