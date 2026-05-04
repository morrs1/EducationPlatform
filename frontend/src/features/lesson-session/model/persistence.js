import { createInitialLessonSessionState } from "./lessonSessionSlice";

const LESSON_SESSION_STORAGE_KEY = "lessonSessionByViewerId";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function normalizeLessonSessionState(value) {
  const initialState = createInitialLessonSessionState();

  if (!value || typeof value !== "object") {
    return initialState;
  }

  return {
    viewedLessonIds: normalizeArray(
      value.viewedLessonIds ?? value.viewedStepIds,
    ),
    completedLessonIds: normalizeArray(
      value.completedLessonIds ?? value.completedStepIds,
    ),
    draftsByLessonId: normalizeObject(
      value.draftsByLessonId ?? value.draftsByStepId,
    ),
    submissionsByLessonId: normalizeObject(
      value.submissionsByLessonId ?? value.submissionsByStepId,
    ),
    runResultsByLessonId: normalizeObject(
      value.runResultsByLessonId ?? value.runResultsByStepId,
    ),
  };
}

export function readLessonSessionMap() {
  try {
    const savedValue = localStorage.getItem(LESSON_SESSION_STORAGE_KEY);
    const parsedValue = savedValue ? JSON.parse(savedValue) : null;

    return normalizeObject(parsedValue);
  } catch {
    return {};
  }
}

export function loadLessonSessionByViewerId(viewerId) {
  if (!viewerId) {
    return createInitialLessonSessionState();
  }

  const persistedMap = readLessonSessionMap();

  return normalizeLessonSessionState(persistedMap[viewerId]);
}

export function saveLessonSessionByViewerId(viewerId, lessonSessionState) {
  if (!viewerId) {
    return;
  }

  const persistedMap = readLessonSessionMap();

  persistedMap[viewerId] = normalizeLessonSessionState(lessonSessionState);

  localStorage.setItem(
    LESSON_SESSION_STORAGE_KEY,
    JSON.stringify(persistedMap),
  );
}
