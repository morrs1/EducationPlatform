import {
  markLessonCompleted,
  markLessonViewed,
  setRunResult,
  setSubmissionResult,
  syncCompletedLessonsForCourse,
} from "./lessonSessionSlice";
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

  return {
    userId,
    courseId,
    lessonId: lesson?.id,
    canUseLearningService:
      isLearningUuid(userId) &&
      isLearningUuid(courseId) &&
      isLearningUuid(lesson?.id),
  };
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

export function openLesson({ lesson, courseId = null } = {}) {
  return async (dispatch) => {
    if (!lesson?.id) {
      return;
    }

    dispatch(markLessonViewed(lesson.id));

    if (lesson.type === "theory") {
      dispatch(markLessonCompleted(lesson.id));
      await dispatch(completeLessonWithLearningService({ lesson, courseId }));
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
      return {
        ok: false,
        skipped: true,
      };
    }

    try {
      await requestCompleteLesson({
        userId: learningContext.userId,
        courseId: learningContext.courseId,
        lessonId: learningContext.lessonId,
      });

      dispatch(markLessonCompleted(lesson.id));

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось отметить урок как завершенный.",
      };
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

export function submitLessonAnswer({ lesson, courseId = null } = {}) {
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
      dispatch(markLessonCompleted(lesson.id));
      await dispatch(completeLessonWithLearningService({ lesson, courseId }));

      return {
        status: "correct",
        score: 0,
        maxScore: 0,
        feedback: "Теоретический урок засчитан как просмотренный.",
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

    dispatch(
      setSubmissionResult({
        lessonId: lesson.id,
        result: {
          ...result,
          checkedAt: result.checkedAt ?? createTimestamp(),
        },
      }),
    );

    if (result.status === "correct") {
      dispatch(markLessonCompleted(lesson.id));
      await dispatch(completeLessonWithLearningService({ lesson, courseId }));
    }

    return result;
  };
}
