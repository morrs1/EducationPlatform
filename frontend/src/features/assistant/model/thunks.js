import {
  assistantReplyFailed,
  assistantThreadLoaded,
  startAssistantThreadLoading,
  startAssistantReply,
} from "./assistantSlice";
import {
  isAnswerServiceUuid,
  requestAskAssistantQuestion,
  requestAssistantConversation,
  requestAssistantConversations,
  requestCreateAssistantConversation,
} from "../api/answerServiceApi";

function mapConversationToMessages(conversation) {
  return (conversation?.messages ?? []).flatMap((message) => {
    const createdAt = message.createdAt || new Date().toISOString();
    const messages = [];

    if (message.question) {
      messages.push({
        id: `${message.messageId}:question`,
        role: "user",
        text: message.question,
        createdAt,
      });
    }

    if (message.answer) {
      messages.push({
        id: `${message.messageId}:answer`,
        role: "assistant",
        text: message.answer,
        createdAt,
      });
    }

    return messages;
  });
}

function getLatestConversationForLesson(conversations, lessonId) {
  return (
    conversations.find((conversation) => conversation.lessonId === lessonId) ??
    null
  );
}

async function loadConversationById(conversationId) {
  const conversation = await requestAssistantConversation(conversationId);

  return {
    conversation,
    threadId: conversation.conversationId,
    messages: mapConversationToMessages(conversation),
  };
}

async function resolveConversationId({ threadId, userId, lessonId }) {
  if (isAnswerServiceUuid(threadId)) {
    return threadId;
  }

  const conversation = await requestCreateAssistantConversation({
    userId,
    lessonId,
  });

  return conversation.conversationId;
}

export function hydrateAssistantConversation({
  contextKey,
  threadId,
}) {
  return async (dispatch) => {
    if (!contextKey || !isAnswerServiceUuid(threadId)) {
      return {
        ok: false,
        skipped: true,
      };
    }

    dispatch(startAssistantThreadLoading({ contextKey }));

    try {
      const loadedConversation = await loadConversationById(threadId);

      dispatch(
        assistantThreadLoaded({
          contextKey,
          threadId: loadedConversation.threadId,
          messages: loadedConversation.messages,
        }),
      );

      return {
        ok: true,
        conversation: loadedConversation.conversation,
      };
    } catch (error) {
      const errorMessage =
        error?.message ?? "Не удалось загрузить историю чата.";

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

export function hydrateAssistantConversationForLesson({
  contextKey,
  threadId,
  userId,
  lessonId,
}) {
  return async (dispatch) => {
    if (!contextKey) {
      return {
        ok: false,
        skipped: true,
      };
    }

    if (!isAnswerServiceUuid(userId) || !isAnswerServiceUuid(lessonId)) {
      dispatch(
        assistantThreadLoaded({
          contextKey,
          threadId: null,
          messages: [],
        }),
      );

      return {
        ok: false,
        skipped: true,
      };
    }

    dispatch(startAssistantThreadLoading({ contextKey }));

    try {
      let conversationId = isAnswerServiceUuid(threadId) ? threadId : null;

      if (!conversationId) {
        const conversations = await requestAssistantConversations({
          userId,
          limit: 200,
        });
        const existingConversation = getLatestConversationForLesson(
          conversations,
          lessonId,
        );

        conversationId = existingConversation?.conversationId ?? null;
      }

      if (!conversationId) {
        dispatch(
          assistantThreadLoaded({
            contextKey,
            threadId: null,
            messages: [],
          }),
        );

        return {
          ok: true,
          skipped: true,
        };
      }

      const loadedConversation = await loadConversationById(conversationId);

      dispatch(
        assistantThreadLoaded({
          contextKey,
          threadId: loadedConversation.threadId,
          messages: loadedConversation.messages,
        }),
      );

      return {
        ok: true,
        conversation: loadedConversation.conversation,
      };
    } catch (error) {
      const errorMessage =
        error?.message ?? "Не удалось загрузить историю чата.";

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

export function submitAssistantMessage({
  contextKey,
  threadId,
  userId,
  lessonId,
  userMessage,
}) {
  return async (dispatch) => {
    const normalizedMessage = userMessage?.trim() ?? "";

    if (!contextKey || !normalizedMessage) {
      return {
        ok: false,
        error: "Введите сообщение для ассистента.",
      };
    }

    if (!isAnswerServiceUuid(userId) || !isAnswerServiceUuid(lessonId)) {
      const error = "Ассистент доступен только для уроков из answer_service.";

      dispatch(
        assistantReplyFailed({
          contextKey,
          error,
        }),
      );

      return {
        ok: false,
        error,
      };
    }

    dispatch(startAssistantReply({ contextKey }));

    try {
      const conversationId = await resolveConversationId({
        threadId,
        userId,
        lessonId,
      });
      const answer = await requestAskAssistantQuestion({
        conversationId,
        question: normalizedMessage,
      });
      const loadedConversation = await loadConversationById(
        answer.conversationId,
      );

      dispatch(
        assistantThreadLoaded({
          contextKey,
          threadId: loadedConversation.threadId,
          messages: loadedConversation.messages,
        }),
      );

      return {
        ok: true,
        threadId: loadedConversation.threadId,
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
