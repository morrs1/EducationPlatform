import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  closeAssistant,
  openAssistant,
  selectAssistantIsOpen,
  selectAssistantThreadByContextKey,
  setActiveAssistantContext,
  hydrateAssistantConversationForLesson,
  submitAssistantMessage,
} from "../../../features/assistant";
import { selectCurrentViewerId } from "../../../features/auth";
import { resolveRemoteViewerId } from "../../../shared/api";

export function useLessonAssistant({ course, lesson }) {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectAssistantIsOpen);
  const currentViewerId = useSelector(selectCurrentViewerId);
  const lessonId = lesson?.id ?? null;
  const userId = useMemo(
    () => resolveRemoteViewerId(currentViewerId, null),
    [currentViewerId],
  );
  const contextKey =
    lessonId && userId ? `assistant:${userId}:${lessonId}` : null;
  const thread = useSelector((state) =>
    selectAssistantThreadByContextKey(state, contextKey),
  );

  useEffect(() => {
    if (!contextKey) {
      return;
    }

    dispatch(setActiveAssistantContext(contextKey));
  }, [dispatch, contextKey]);

  useEffect(() => {
    if (!isOpen || !contextKey || !lessonId) {
      return;
    }

    dispatch(
      hydrateAssistantConversationForLesson({
        contextKey,
        threadId: thread.threadId,
        userId,
        lessonId,
      }),
    );
  }, [
    contextKey,
    dispatch,
    isOpen,
    lessonId,
    thread.threadId,
    userId,
  ]);

  function open() {
    if (!contextKey) {
      return;
    }

    dispatch(setActiveAssistantContext(contextKey));
    dispatch(openAssistant());
  }

  function close() {
    dispatch(closeAssistant());
  }

  async function submitMessage(messageText) {
    if (!course || !lesson || !contextKey) {
      return;
    }

    await dispatch(
      submitAssistantMessage({
        contextKey,
        threadId: thread.threadId,
        userId,
        lessonId,
        userMessage: messageText,
      }),
    );
  }

  return {
    isOpen,
    title: "Ассистент",
    subtitle: lesson?.title ?? "",
    messages: thread.messages,
    status: thread.status,
    error: thread.error,
    open,
    close,
    submitMessage,
  };
}
