import {
  addAssistantMessage,
  assistantReplyFailed,
  setAssistantThreadId,
  startAssistantReply,
} from "./assistantSlice";
import { requestAssistantReply } from "./requestAssistantReply";

function createUserMessage(text) {
  return {
    id: `user-message-${Date.now()}`,
    role: "user",
    text,
    createdAt: new Date().toISOString(),
  };
}

export function submitAssistantMessage({
  contextKey,
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
  return async (dispatch) => {
    const normalizedMessage = userMessage?.trim() ?? "";

    if (!contextKey || !normalizedMessage) {
      return {
        ok: false,
        error: "Введите сообщение для ассистента.",
      };
    }

    dispatch(
      addAssistantMessage({
        contextKey,
        message: createUserMessage(normalizedMessage),
      }),
    );

    dispatch(startAssistantReply({ contextKey }));

    try {
      const result = await requestAssistantReply({
        threadId,
        courseId,
        lessonId,
        stepId,
        userMessage: normalizedMessage,
        lessonTitle,
        stepTitle,
        stepType,
        stepMarkdown,
      });

      dispatch(
        setAssistantThreadId({
          contextKey,
          threadId: result.threadId,
        }),
      );

      dispatch(
        addAssistantMessage({
          contextKey,
          message: result.message,
        }),
      );

      return {
        ok: true,
        threadId: result.threadId,
      };
    } catch (error) {
      const errorMessage =
        error?.message ?? "Не удалось получить ответ ассистента.";

      dispatch(
        assistantReplyFailed({
          contextKey,
          error: errorMessage,
        }),
      );

      return {
        ok: false,
        error: errorMessage,
      };
    }
  };
}
