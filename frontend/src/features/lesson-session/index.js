export { default as lessonSessionReducer } from "./model/lessonSessionSlice";
export {
  openLessonStep,
  runCodeStep,
  submitStepAnswer,
} from "./model/thunks";

export {
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
  createInitialLessonSessionState,
} from "./model/lessonSessionSlice";

export {
  selectLessonSession,
  selectCurrentStepIdByLessonId,
  selectViewedStepIds,
  selectCompletedStepIds,
  selectDraftsByStepId,
  selectSubmissionsByStepId,
  selectRunResultsByStepId,
  selectCurrentStepId,
  selectStepDraft,
  selectStepSubmission,
  selectStepRunResult,
  selectIsStepViewed,
  selectIsStepCompleted,
  selectLessonCompletedStepsCount,
} from "./model/selectors";

export {
  loadLessonSessionByViewerId,
  saveLessonSessionByViewerId,
} from "./model/persistence";
