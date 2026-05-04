function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildAssistantReplyText({
  userMessage,
  lessonTitle,
  stepTitle,
  stepType,
  stepMarkdown,
}) {
  const normalizedMessage = userMessage?.trim() ?? "";

  if (!normalizedMessage) {
    return "Уточните, пожалуйста, вопрос по текущему уроку, и я постараюсь помочь.";
  }

  if (stepType === "code") {
    return `Судя по уроку «${stepTitle}», здесь важно внимательно посмотреть на условие, входные данные и ожидаемый вывод. Попробуйте сначала разбить задачу на маленькие действия, а потом проверить решение на простом примере вручную.`;
  }

  if (stepType === "quiz") {
    return `В уроке «${stepTitle}» попробуйте опереться на материал выше и выделить ключевую идею. Если хотите, я могу помочь разобрать формулировку вопроса, но не буду сразу давать готовый ответ.`;
  }

  if (stepMarkdown?.length > 0) {
    return `Я вижу, что вы сейчас на уроке «${stepTitle}» курса «${lessonTitle}». Если хотите, я могу объяснить этот фрагмент проще, выделить главное или помочь разобрать непонятный термин из текста урока.`;
  }

  return `Я помогу с уроком «${stepTitle}» курса «${lessonTitle}». Можете спросить про теорию, формулировку задания или как лучше подступиться к решению.`;
}

export async function requestAssistantReply({
  threadId,
  courseId,
  lessonId,
  stepId,
  userMessage,
  lessonTitle,
  stepTitle,
  stepType,
  stepMarkdown,
}) {
  await delay(700);

  return {
    threadId:
      threadId ??
      `mock-thread:${courseId ?? "course"}:${lessonId ?? "lesson"}:${stepId ?? "step"}`,
    message: {
      id: `assistant-message-${Date.now()}`,
      role: "assistant",
      text: buildAssistantReplyText({
        userMessage,
        lessonTitle,
        stepTitle,
        stepType,
        stepMarkdown,
      }),
      createdAt: new Date().toISOString(),
    },
  };
}
