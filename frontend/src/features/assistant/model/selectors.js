const EMPTY_ASSISTANT_THREAD = {
  messages: [],
  status: "idle",
  error: null,
  threadId: null,
};

export const selectAssistant = (state) => state.assistant;

export const selectAssistantIsOpen = (state) => selectAssistant(state).isOpen;

export const selectActiveAssistantContextKey = (state) =>
  selectAssistant(state).activeContextKey;

export const selectAssistantThreadsByContextKey = (state) =>
  selectAssistant(state).threadsByContextKey;

export const selectAssistantThreadByContextKey = (state, contextKey) =>
  selectAssistantThreadsByContextKey(state)[contextKey] ?? EMPTY_ASSISTANT_THREAD;

export const selectActiveAssistantThread = (state) => {
  const activeContextKey = selectActiveAssistantContextKey(state);

  if (!activeContextKey) {
    return EMPTY_ASSISTANT_THREAD;
  }

  return selectAssistantThreadByContextKey(state, activeContextKey);
};
