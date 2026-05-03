import {
  createEmptyViewerProfile,
  createInitialViewerState,
  normalizeViewerProfile,
} from "./factory";

const VIEWER_PROFILES_STORAGE_KEY = "viewerProfilesById";

export function createDefaultViewerProfilesMap() {
  const defaultViewer = createInitialViewerState();

  return defaultViewer.id
    ? {
        [defaultViewer.id]: defaultViewer,
      }
    : {};
}

function normalizeViewerProfilesMapValue(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.values(value).reduce((viewerProfilesMap, viewerProfile) => {
    const normalizedViewerProfile = normalizeViewerProfile(viewerProfile);

    if (normalizedViewerProfile.id) {
      viewerProfilesMap[normalizedViewerProfile.id] = normalizedViewerProfile;
    }

    return viewerProfilesMap;
  }, {});
}

export function loadViewerProfilesMap() {
  try {
    const savedValue = localStorage.getItem(VIEWER_PROFILES_STORAGE_KEY);
    const parsedValue = savedValue ? JSON.parse(savedValue) : null;

    return {
      ...createDefaultViewerProfilesMap(),
      ...normalizeViewerProfilesMapValue(parsedValue),
    };
  } catch {
    return createDefaultViewerProfilesMap();
  }
}

export function saveViewerProfilesMap(viewerProfilesMap) {
  localStorage.setItem(
    VIEWER_PROFILES_STORAGE_KEY,
    JSON.stringify(normalizeViewerProfilesMapValue(viewerProfilesMap)),
  );
}

export function loadViewerProfileByViewerId(
  viewerId,
  viewerProfilesMap = loadViewerProfilesMap(),
) {
  if (!viewerId) {
    return createInitialViewerState();
  }

  return viewerProfilesMap[viewerId] ?? createEmptyViewerProfile(viewerId);
}

export function saveViewerProfile(viewerProfile) {
  const normalizedViewerProfile = normalizeViewerProfile(viewerProfile);

  if (!normalizedViewerProfile.id) {
    return null;
  }

  const viewerProfilesMap = loadViewerProfilesMap();
  viewerProfilesMap[normalizedViewerProfile.id] = normalizedViewerProfile;
  saveViewerProfilesMap(viewerProfilesMap);

  return normalizedViewerProfile;
}
