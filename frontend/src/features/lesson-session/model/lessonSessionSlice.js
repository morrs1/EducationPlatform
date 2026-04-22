import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  viewedLessonIds: [],
  completedLessonIds: [],
  draftsByLessonId: {},
  submissionsByLessonId: {},
  runResultsByLessonId: {},
};

export function createInitialLessonSessionState() {
  return {
    viewedLessonIds: [],
    completedLessonIds: [],
    draftsByLessonId: {},
    submissionsByLessonId: {},
    runResultsByLessonId: {},
  };
}

function createTimestamp() {
  return new Date().toISOString();
}

function addUniqueValue(list, value) {
  if (!value || list.includes(value)) {
    return;
  }

  list.push(value);
}

function removeValue(list, value) {
  const index = list.indexOf(value);

  if (index >= 0) {
    list.splice(index, 1);
  }
}

function clearLessonState(state, lessonId) {
  delete state.draftsByLessonId[lessonId];
  delete state.submissionsByLessonId[lessonId];
  delete state.runResultsByLessonId[lessonId];
  removeValue(state.viewedLessonIds, lessonId);
  removeValue(state.completedLessonIds, lessonId);
}

const lessonSessionSlice = createSlice({
  name: "lessonSession",
  initialState,
  reducers: {
    markLessonViewed: (state, action) => {
      addUniqueValue(state.viewedLessonIds, action.payload);
    },

    markLessonCompleted: (state, action) => {
      addUniqueValue(state.completedLessonIds, action.payload);
    },

    saveChoiceDraft: (state, action) => {
      const {
        lessonId,
        questionId,
        selectedOptionIds = [],
      } = action.payload ?? {};

      if (!lessonId || !questionId) {
        return;
      }

      const previousDraft = state.draftsByLessonId[lessonId] ?? {};

      state.draftsByLessonId[lessonId] = {
        type: "quiz",
        answersByQuestionId: {
          ...(previousDraft.answersByQuestionId ?? {}),
          [questionId]: {
            type: "choice",
            selectedOptionIds: Array.from(
              new Set(selectedOptionIds.filter(Boolean)),
            ),
          },
        },
        updatedAt: createTimestamp(),
      };
    },

    saveTextDraft: (state, action) => {
      const { lessonId, questionId, answer = "" } = action.payload ?? {};

      if (!lessonId || !questionId) {
        return;
      }

      const previousDraft = state.draftsByLessonId[lessonId] ?? {};

      state.draftsByLessonId[lessonId] = {
        type: "quiz",
        answersByQuestionId: {
          ...(previousDraft.answersByQuestionId ?? {}),
          [questionId]: {
            type: "text",
            answer,
          },
        },
        updatedAt: createTimestamp(),
      };
    },

    saveCodeDraft: (state, action) => {
      const { lessonId, code = "" } = action.payload ?? {};

      if (!lessonId) {
        return;
      }

      state.draftsByLessonId[lessonId] = {
        type: "code",
        code,
        updatedAt: createTimestamp(),
      };
    },

    setRunResult: (state, action) => {
      const { lessonId, result } = action.payload ?? {};

      if (!lessonId || !result) {
        return;
      }

      state.runResultsByLessonId[lessonId] = {
        status: result.status ?? "idle",
        passedCases: result.passedCases ?? 0,
        totalCases: result.totalCases ?? 0,
        feedback: result.feedback ?? "",
        cases: result.cases ?? [],
        updatedAt: result.updatedAt ?? createTimestamp(),
      };
    },

    setSubmissionResult: (state, action) => {
      const { lessonId, result } = action.payload ?? {};

      if (!lessonId || !result) {
        return;
      }

      const previousAttemptCount =
        state.submissionsByLessonId[lessonId]?.attemptCount ?? 0;

      state.submissionsByLessonId[lessonId] = {
        status: result.status ?? "idle",
        score: result.score ?? 0,
        maxScore: result.maxScore ?? 0,
        feedback: result.feedback ?? "",
        attemptCount: result.attemptCount ?? previousAttemptCount + 1,
        checkedAt: result.checkedAt ?? createTimestamp(),
        answerSnapshot: result.answerSnapshot ?? null,
        passedCases: result.passedCases ?? null,
        totalCases: result.totalCases ?? null,
        cases: result.cases ?? [],
      };
    },

    restoreLessonSession: (_state, action) => {
      const payload = action.payload ?? null;

      if (!payload) {
        return createInitialLessonSessionState();
      }

      return {
        viewedLessonIds: payload.viewedLessonIds ?? [],
        completedLessonIds: payload.completedLessonIds ?? [],
        draftsByLessonId: payload.draftsByLessonId ?? {},
        submissionsByLessonId: payload.submissionsByLessonId ?? {},
        runResultsByLessonId: payload.runResultsByLessonId ?? {},
      };
    },

    resetLessonSession: (state, action) => {
      const { lessonId } = action.payload ?? {};

      if (!lessonId) {
        return;
      }

      clearLessonState(state, lessonId);
    },

    resetAllLessonSessions: () => initialState,
  },
});

export const {
  markLessonViewed,
  markLessonCompleted,
  saveChoiceDraft,
  saveTextDraft,
  saveCodeDraft,
  setRunResult,
  setSubmissionResult,
  restoreLessonSession,
  resetLessonSession,
  resetAllLessonSessions,
} = lessonSessionSlice.actions;

export default lessonSessionSlice.reducer;
