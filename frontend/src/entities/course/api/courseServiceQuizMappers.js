import {
  normalizeArray,
  normalizeText,
  unwrapBoolean,
  unwrapString,
} from "./courseServiceCommon";

function mapBackendQuestionType(questionType) {
  const normalizedType = normalizeText(questionType).toLowerCase();

  if (
    normalizedType === "text" ||
    normalizedType === "text_input" ||
    normalizedType === "short_answer"
  ) {
    return "text";
  }

  if (normalizedType === "multiple_choice") {
    return "multiple_choice";
  }

  return "single_choice";
}

export function mapQuizQuestion(question, questionIndex) {
  const mappedType = mapBackendQuestionType(question?.type);
  const questionId =
    normalizeText(question?.id) || `backend-question-${questionIndex + 1}`;
  const options = normalizeArray(question?.options).map((option, optionIndex) => ({
    id:
      normalizeText(option?.id) ||
      `${questionId}-option-${optionIndex + 1}`,
    label: unwrapString(option?.text, "text") || `Вариант ${optionIndex + 1}`,
    isCorrect:
      unwrapBoolean(option?.isCorrect, "isCorrect") ||
      unwrapBoolean(option?.correct, "correct"),
  }));

  if (mappedType === "text") {
    return {
      id: questionId,
      type: "text",
      text:
        unwrapString(question?.text, "text") || `Вопрос ${questionIndex + 1}`,
      acceptedAnswers: options
        .filter((option) => option.isCorrect)
        .map((option) => option.label),
      trim: true,
      ignoreCase: true,
    };
  }

  return {
    id: questionId,
    type: mappedType,
    text:
      unwrapString(question?.text, "text") || `Вопрос ${questionIndex + 1}`,
    options: options.map((option) => ({
      id: option.id,
      label: option.label,
    })),
    correctOptionIds: options
      .filter((option) => option.isCorrect)
      .map((option) => option.id),
  };
}

export function mapQuizEditorQuestion(question, questionIndex) {
  const mappedType = mapBackendQuestionType(question?.type);
  const questionId =
    normalizeText(question?.id) || crypto.randomUUID();
  const options = normalizeArray(question?.options).map((option, optionIndex) => ({
    id: normalizeText(option?.id) || crypto.randomUUID(),
    text: unwrapString(option?.text, "text") || `Вариант ${optionIndex + 1}`,
    isCorrect:
      unwrapBoolean(option?.isCorrect, "isCorrect") ||
      unwrapBoolean(option?.correct, "correct"),
  }));

  return {
    id: questionId,
    type:
      mappedType === "multiple_choice" ? "multiple_choice" : "single_choice",
    text:
      unwrapString(question?.text, "text") || `Вопрос ${questionIndex + 1}`,
    options: options.length
      ? options
      : [
          {
            id: crypto.randomUUID(),
            text: "Вариант 1",
            isCorrect: true,
          },
          {
            id: crypto.randomUUID(),
            text: "Вариант 2",
            isCorrect: false,
          },
        ],
  };
}
