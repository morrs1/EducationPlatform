import {
  markStepCompleted,
  markStepViewed,
  setCurrentStep,
  setRunResult,
  setSubmissionResult,
} from "./lessonSessionSlice";
import { selectStepDraft } from "./selectors";
import { executeCodeStep } from "./codeExecutionGateway";

function createTimestamp() {
  return new Date().toISOString();
}

function areOptionIdsEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();

  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

function normalizeTextAnswer(answer, grader) {
  let value = answer ?? "";

  if (grader.trim) {
    value = value.trim();
  }

  if (grader.ignoreCase) {
    value = value.toLowerCase();
  }

  return value;
}

function gradeChoiceStep(step, grader, draft) {
  const selectedOptionIds = draft?.selectedOptionIds ?? [];

  if (selectedOptionIds.length === 0) {
    return {
      status: "incorrect",
      score: 0,
      maxScore: step.points ?? 0,
      feedback: "Выберите хотя бы один вариант ответа.",
      answerSnapshot: {
        selectedOptionIds: [],
      },
      checkedAt: createTimestamp(),
    };
  }

  const isCorrect = areOptionIdsEqual(
    selectedOptionIds,
    grader.correctOptionIds ?? [],
  );

  return {
    status: isCorrect ? "correct" : "incorrect",
    score: isCorrect ? step.points ?? 0 : 0,
    maxScore: step.points ?? 0,
    feedback: isCorrect
      ? "Верно. Ответ засчитан."
      : "Ответ пока неверный. Попробуйте еще раз.",
    answerSnapshot: {
      selectedOptionIds,
    },
    checkedAt: createTimestamp(),
  };
}

function gradeTextStep(step, grader, draft) {
  const rawAnswer = draft?.answer ?? "";
  const normalizedAnswer = normalizeTextAnswer(rawAnswer, grader);
  const acceptedAnswers = (grader.acceptedAnswers ?? []).map((answer) =>
    normalizeTextAnswer(answer, grader),
  );

  if (!normalizedAnswer) {
    return {
      status: "incorrect",
      score: 0,
      maxScore: step.points ?? 0,
      feedback: "Введите ответ перед проверкой.",
      answerSnapshot: {
        answer: rawAnswer,
      },
      checkedAt: createTimestamp(),
    };
  }

  const isCorrect = acceptedAnswers.includes(normalizedAnswer);

  return {
    status: isCorrect ? "correct" : "incorrect",
    score: isCorrect ? step.points ?? 0 : 0,
    maxScore: step.points ?? 0,
    feedback: isCorrect
      ? "Верно. Ответ засчитан."
      : "Ответ пока неверный. Попробуйте еще раз.",
    answerSnapshot: {
      answer: rawAnswer,
    },
    checkedAt: createTimestamp(),
  };
}

function createUnsupportedStepResult(step, type) {
  return {
    status: "incorrect",
    score: 0,
    maxScore: step.points ?? 0,
    feedback: `Тип шага "${type}" пока не поддерживается.`,
    checkedAt: createTimestamp(),
    answerSnapshot: null,
  };
}

export function openLessonStep({ lessonId, stepId, stepType }) {
  return (dispatch) => {
    dispatch(setCurrentStep({ lessonId, stepId }));
    dispatch(markStepViewed(stepId));

    if (stepType === "theory") {
      dispatch(markStepCompleted(stepId));
    }
  };
}

export function runCodeStep({ step }) {
  return async (dispatch, getState) => {
    if (!step || step.type !== "code" || !step.grader) {
      return {
        status: "failed",
        passedCases: 0,
        totalCases: 0,
        feedback: "Для шага не настроен code runner.",
        cases: [],
      };
    }

    const draft = selectStepDraft(getState(), step.id);
    const code = draft?.code ?? "";
    const result = await executeCodeStep({
      step,
      grader: step.grader,
      code,
      mode: "run",
    });

    dispatch(
      setRunResult({
        stepId: step.id,
        result: {
          ...result,
          updatedAt: createTimestamp(),
        },
      }),
    );

    return result;
  };
}

export function submitStepAnswer({ step }) {
  return async (dispatch, getState) => {
    if (!step) {
      return {
        status: "incorrect",
        score: 0,
        maxScore: 0,
        feedback: "Шаг не найден.",
      };
    }

    if (step.type === "theory") {
      dispatch(markStepCompleted(step.id));

      return {
        status: "correct",
        score: 0,
        maxScore: 0,
        feedback: "Теоретический шаг засчитан как просмотренный.",
      };
    }

    const draft = selectStepDraft(getState(), step.id);
    let result;

    if (step.type === "quiz_choice") {
      result = gradeChoiceStep(step, step.grader, draft);
    } else if (step.type === "quiz_text") {
      result = gradeTextStep(step, step.grader, draft);
    } else if (step.type === "code") {
      result = await executeCodeStep({
        step,
        grader: step.grader,
        code: draft?.code ?? "",
        mode: "submit",
      });
    } else {
      result = createUnsupportedStepResult(step, step.type);
    }

    dispatch(
      setSubmissionResult({
        stepId: step.id,
        result: {
          ...result,
          checkedAt: result.checkedAt ?? createTimestamp(),
        },
      }),
    );

    if (result.status === "correct") {
      dispatch(markStepCompleted(step.id));
    }

    return result;
  };
}
