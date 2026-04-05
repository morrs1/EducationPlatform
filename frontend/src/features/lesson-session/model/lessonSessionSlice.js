import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentStepIdByLessonId: {},
  viewedStepIds: [],
  completedStepIds: [],
  draftsByStepId: {},
  submissionsByStepId: {},
  runResultsByStepId: {},
};

export function createInitialLessonSessionState() {
  return {
    currentStepIdByLessonId: {},
    viewedStepIds: [],
    completedStepIds: [],
    draftsByStepId: {},
    submissionsByStepId: {},
    runResultsByStepId: {},
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

function clearStepState(state, stepId) {
  delete state.draftsByStepId[stepId];
  delete state.submissionsByStepId[stepId];
  delete state.runResultsByStepId[stepId];
  removeValue(state.viewedStepIds, stepId);
  removeValue(state.completedStepIds, stepId);
}

const lessonSessionSlice = createSlice({
  name: "lessonSession",
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      const { lessonId, stepId } = action.payload ?? {};

      if (!lessonId || !stepId) {
        return;
      }

      state.currentStepIdByLessonId[lessonId] = stepId;
    },

    markStepViewed: (state, action) => {
      const stepId = action.payload;

      addUniqueValue(state.viewedStepIds, stepId);
    },

    markStepCompleted: (state, action) => {
      const stepId = action.payload;

      addUniqueValue(state.completedStepIds, stepId);
    },

    saveChoiceDraft: (state, action) => {
      const { stepId, selectedOptionIds = [] } = action.payload ?? {};

      if (!stepId) {
        return;
      }

      state.draftsByStepId[stepId] = {
        type: "quiz_choice",
        selectedOptionIds: Array.from(
          new Set(selectedOptionIds.filter(Boolean)),
        ),
        updatedAt: createTimestamp(),
      };
    },

    saveTextDraft: (state, action) => {
      const { stepId, answer = "" } = action.payload ?? {};

      if (!stepId) {
        return;
      }

      state.draftsByStepId[stepId] = {
        type: "quiz_text",
        answer,
        updatedAt: createTimestamp(),
      };
    },

    saveCodeDraft: (state, action) => {
      const { stepId, code = "" } = action.payload ?? {};

      if (!stepId) {
        return;
      }

      state.draftsByStepId[stepId] = {
        type: "code",
        code,
        updatedAt: createTimestamp(),
      };
    },

    setRunResult: (state, action) => {
      const { stepId, result } = action.payload ?? {};

      if (!stepId || !result) {
        return;
      }

      state.runResultsByStepId[stepId] = {
        status: result.status ?? "idle",
        passedCases: result.passedCases ?? 0,
        totalCases: result.totalCases ?? 0,
        feedback: result.feedback ?? "",
        cases: result.cases ?? [],
        updatedAt: result.updatedAt ?? createTimestamp(),
      };
    },

    setSubmissionResult: (state, action) => {
      const { stepId, result } = action.payload ?? {};

      if (!stepId || !result) {
        return;
      }

      const previousAttemptCount =
        state.submissionsByStepId[stepId]?.attemptCount ?? 0;

      state.submissionsByStepId[stepId] = {
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
        currentStepIdByLessonId: payload.currentStepIdByLessonId ?? {},
        viewedStepIds: payload.viewedStepIds ?? [],
        completedStepIds: payload.completedStepIds ?? [],
        draftsByStepId: payload.draftsByStepId ?? {},
        submissionsByStepId: payload.submissionsByStepId ?? {},
        runResultsByStepId: payload.runResultsByStepId ?? {},
      };
    },

    resetStepSession: (state, action) => {
      const { stepId } = action.payload ?? {};

      if (!stepId) {
        return;
      }

      clearStepState(state, stepId);
    },

    resetLessonSession: (state, action) => {
      const { lessonId, stepIds = [] } = action.payload ?? {};

      if (!lessonId) {
        return;
      }

      delete state.currentStepIdByLessonId[lessonId];

      stepIds.forEach((stepId) => {
        clearStepState(state, stepId);
      });
    },

    resetAllLessonSessions: () => initialState,
  },
});

export const {
  setCurrentStep,
  markStepViewed,
  markStepCompleted,
  saveChoiceDraft,
  saveTextDraft,
  saveCodeDraft,
  setRunResult,
  setSubmissionResult,
  restoreLessonSession,
  resetStepSession,
  resetLessonSession,
  resetAllLessonSessions,
} = lessonSessionSlice.actions;

export default lessonSessionSlice.reducer;
