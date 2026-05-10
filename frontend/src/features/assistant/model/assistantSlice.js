import { createSlice } from "@reduxjs/toolkit";

function createInitialThreadState() {
  return {
    messages: [],
    status: "idle",
    error: null,
    threadId: null,
  };
}

const initialState = {
  isOpen: false,
  activeContextKey: null,
  threadsByContextKey: {},
};

function ensureThread(state, contextKey) {
  if (!contextKey) {
    return null;
  }

  if (!state.threadsByContextKey[contextKey]) {
    state.threadsByContextKey[contextKey] = createInitialThreadState();
  }

  return state.threadsByContextKey[contextKey];
}

const assistantSlice = createSlice({
  name: "assistant",
  initialState,
  reducers: {
    openAssistant(state) {
      state.isOpen = true;
    },

    closeAssistant(state) {
      state.isOpen = false;
    },

    toggleAssistant(state) {
      state.isOpen = !state.isOpen;
    },

    setActiveAssistantContext(state, action) {
      const contextKey = action.payload ?? null;
      state.activeContextKey = contextKey;

      if (contextKey) {
        ensureThread(state, contextKey);
      }
    },

    startAssistantReply(state, action) {
      const { contextKey } = action.payload ?? {};
      const thread = ensureThread(state, contextKey);

      if (!thread) {
        return;
      }

      thread.status = "loading";
      thread.error = null;
    },

    assistantReplyFailed(state, action) {
      const { contextKey, error } = action.payload ?? {};
      const thread = ensureThread(state, contextKey);

      if (!thread) {
        return;
      }

      thread.status = "error";
      thread.error = error ?? "Не удалось получить ответ ассистента.";
    },

    startAssistantThreadLoading(state, action) {
      const { contextKey } = action.payload ?? {};
      const thread = ensureThread(state, contextKey);

      if (!thread) {
        return;
      }

      thread.status = "loading";
      thread.error = null;
    },

    assistantThreadLoaded(state, action) {
      const { contextKey, threadId, messages } = action.payload ?? {};
      const thread = ensureThread(state, contextKey);

      if (!thread) {
        return;
      }

      thread.threadId = Object.hasOwn(action.payload ?? {}, "threadId")
        ? threadId
        : thread.threadId;
      thread.messages = Array.isArray(messages) ? messages : thread.messages;
      thread.status = "idle";
      thread.error = null;
    },

    resetAssistantThread(state, action) {
      const contextKey = action.payload ?? null;

      if (!contextKey) {
        return;
      }

      delete state.threadsByContextKey[contextKey];

      if (state.activeContextKey === contextKey) {
        state.activeContextKey = null;
      }
    },
  },
});

export const {
  openAssistant,
  closeAssistant,
  toggleAssistant,
  setActiveAssistantContext,
  startAssistantReply,
  assistantReplyFailed,
  startAssistantThreadLoading,
  assistantThreadLoaded,
  resetAssistantThread,
} = assistantSlice.actions;

export default assistantSlice.reducer;
