export {
  buildAvatarInitialsSeed,
  buildAvatarUrl,
  buildViewerDisplayName,
  createEmptyViewerProfile,
  createInitialViewerState,
  createViewerCourseSnapshot,
  createViewerProfileFromRegistration,
  getViewerCourseStorageKey,
  normalizeViewerCourseId,
  normalizeViewerCourseSnapshot,
  normalizeViewerProfile,
} from "./model/factory";

export {
  createDefaultViewerProfilesMap,
  loadViewerProfileByViewerId,
  loadViewerProfilesMap,
  saveViewerProfile,
  saveViewerProfilesMap,
} from "./model/persistence";
