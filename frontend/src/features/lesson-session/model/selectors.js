export const selectLessonSession = (state) => state.lessonSession;

export const selectViewedLessonIds = (state) =>
  selectLessonSession(state).viewedLessonIds;

export const selectCompletedLessonIds = (state) =>
  selectLessonSession(state).completedLessonIds;

export const selectDraftsByLessonId = (state) =>
  selectLessonSession(state).draftsByLessonId;

export const selectSubmissionsByLessonId = (state) =>
  selectLessonSession(state).submissionsByLessonId;

export const selectRunResultsByLessonId = (state) =>
  selectLessonSession(state).runResultsByLessonId;

export const selectLessonDraft = (state, lessonId) =>
  selectDraftsByLessonId(state)[lessonId] ?? null;

export const selectLessonSubmission = (state, lessonId) =>
  selectSubmissionsByLessonId(state)[lessonId] ?? null;

export const selectLessonRunResult = (state, lessonId) =>
  selectRunResultsByLessonId(state)[lessonId] ?? null;

export const selectIsLessonViewed = (state, lessonId) =>
  selectViewedLessonIds(state).includes(lessonId);

export const selectIsLessonCompleted = (state, lessonId) =>
  selectCompletedLessonIds(state).includes(lessonId);
