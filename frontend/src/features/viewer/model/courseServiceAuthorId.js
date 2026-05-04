import { isUuid } from "../../../entities/course";

const COURSE_SERVICE_AUTHOR_IDS_STORAGE_KEY = "courseServiceAuthorIdsByViewer";
const DEFAULT_VIEWER_STORAGE_KEY = "__default__";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function loadAuthorIdsMap() {
  try {
    const savedValue = localStorage.getItem(COURSE_SERVICE_AUTHOR_IDS_STORAGE_KEY);
    const parsedValue = savedValue ? JSON.parse(savedValue) : null;

    return parsedValue && typeof parsedValue === "object" && !Array.isArray(parsedValue)
      ? parsedValue
      : {};
  } catch {
    return {};
  }
}

function saveAuthorIdsMap(authorIdsMap) {
  localStorage.setItem(
    COURSE_SERVICE_AUTHOR_IDS_STORAGE_KEY,
    JSON.stringify(authorIdsMap),
  );
}

function resolveViewerStorageKey(currentViewerId) {
  return normalizeText(currentViewerId) || DEFAULT_VIEWER_STORAGE_KEY;
}

export function resolveCourseServiceAuthorId(
  currentViewerId,
  preferredRemoteViewerId = null,
) {
  const viewerStorageKey = resolveViewerStorageKey(currentViewerId);
  const authorIdsMap = loadAuthorIdsMap();
  const persistedAuthorId = normalizeText(authorIdsMap[viewerStorageKey]);

  if (isUuid(persistedAuthorId)) {
    return persistedAuthorId;
  }

  const fallbackAuthorId =
    [
      normalizeText(preferredRemoteViewerId),
      normalizeText(currentViewerId),
      normalizeText(import.meta.env.VITE_USER_SERVICE_DEMO_USER_ID),
    ].find((candidate) => isUuid(candidate)) ?? crypto.randomUUID();

  authorIdsMap[viewerStorageKey] = fallbackAuthorId;
  saveAuthorIdsMap(authorIdsMap);

  return fallbackAuthorId;
}
