export const selectLessonSession = (state) => state.lessonSession;

export const selectCurrentStepIdByLessonId = (state) =>
  selectLessonSession(state).currentStepIdByLessonId;

export const selectViewedStepIds = (state) =>
  selectLessonSession(state).viewedStepIds;

export const selectCompletedStepIds = (state) =>
  selectLessonSession(state).completedStepIds;

export const selectDraftsByStepId = (state) =>
  selectLessonSession(state).draftsByStepId;

export const selectSubmissionsByStepId = (state) =>
  selectLessonSession(state).submissionsByStepId;

export const selectRunResultsByStepId = (state) =>
  selectLessonSession(state).runResultsByStepId;

export const selectCurrentStepId = (state, lessonId) =>
  selectCurrentStepIdByLessonId(state)[lessonId] ?? null;

export const selectStepDraft = (state, stepId) =>
  selectDraftsByStepId(state)[stepId] ?? null;

export const selectStepSubmission = (state, stepId) =>
  selectSubmissionsByStepId(state)[stepId] ?? null;

export const selectStepRunResult = (state, stepId) =>
  selectRunResultsByStepId(state)[stepId] ?? null;

export const selectIsStepViewed = (state, stepId) =>
  selectViewedStepIds(state).includes(stepId);

export const selectIsStepCompleted = (state, stepId) =>
  selectCompletedStepIds(state).includes(stepId);

export const selectLessonCompletedStepsCount = (state, lesson) =>
  (lesson?.stepIds ?? []).filter((stepId) => selectIsStepCompleted(state, stepId))
    .length;
