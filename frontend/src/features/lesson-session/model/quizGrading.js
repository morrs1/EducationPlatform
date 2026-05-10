import { createTimestamp } from "./time";

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

export function gradeQuizLesson(lesson, draft) {
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
