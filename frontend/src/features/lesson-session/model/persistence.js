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
    currentStepIdByLessonId: normalizeObject(value.currentStepIdByLessonId),
    viewedStepIds: normalizeArray(value.viewedStepIds),
    completedStepIds: normalizeArray(value.completedStepIds),
    draftsByStepId: normalizeObject(value.draftsByStepId),
    submissionsByStepId: normalizeObject(value.submissionsByStepId),
    runResultsByStepId: normalizeObject(value.runResultsByStepId),
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
