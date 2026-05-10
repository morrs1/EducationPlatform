import {
  markLessonViewed,
  setSubmissionResult,
} from "./lessonSessionSlice";
import { selectLessonDraft } from "./selectors";
import { executeCodeStep } from "./codeExecutionGateway";
import { completeLessonWithLearningService } from "./learningProgressThunks";
import { gradeQuizLesson } from "./quizGrading";
import { createTimestamp } from "./time";

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
