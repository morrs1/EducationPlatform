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
import { selectViewer } from "../../../features/viewer";
import { resolveRemoteViewerId } from "../../../shared/api";

export function useLessonAssistant({ course, lesson }) {
  const dispatch = useDispatch();
  const contextKey = lesson ? lesson.id : null;
  const isOpen = useSelector(selectAssistantIsOpen);
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
  const thread = useSelector((state) =>
    selectAssistantThreadByContextKey(state, contextKey),
  );
  const userId = useMemo(
    () => resolveRemoteViewerId(currentViewerId, viewer.remoteId),
    [currentViewerId, viewer.remoteId],
  );

  useEffect(() => {
    if (!contextKey) {
      return;
    }

    dispatch(setActiveAssistantContext(contextKey));
  }, [dispatch, contextKey, lesson]);

  useEffect(() => {
    if (!isOpen || !contextKey || !lesson?.id) {
      return;
    }

    dispatch(
      hydrateAssistantConversationForLesson({
        contextKey,
        threadId: thread.threadId,
        userId,
        lessonId: lesson.id,
      }),
    );
  }, [
    contextKey,
    dispatch,
    isOpen,
    lesson?.id,
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
        lessonId: lesson.id,
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
