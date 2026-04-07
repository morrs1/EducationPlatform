export { default as viewerReducer } from "./model/viewerSlice";
export { submitViewerProfileUpdate } from "./model/thunks";

export {
  updateViewerProfile,
  changeViewerEmail,
  enrollInCourse,
  toggleFavouriteCourse,
  leaveCourse,
  markCourseCompleted,
  restoreViewer,
  resetDemoState,
} from "./model/viewerSlice";

export {
  buildAvatarUrl,
  createInitialViewerState,
  createViewerProfileFromRegistration,
} from "./model/factory";

export {
  loadViewerProfilesMap,
  saveViewerProfilesMap,
  loadViewerProfileByViewerId,
  saveViewerProfile,
} from "./model/persistence";

export {
  selectViewer,
  selectViewerId,
  selectViewerFirstName,
  selectViewerLastName,
  selectViewerName,
  selectViewerEmail,
  selectViewerAvatarUrl,
  selectViewerHeadline,
  selectViewerAbout,
  selectEnrolledCourseIds,
  selectFavouriteCourseIds,
  selectCompletedCourseIds,
  selectCertificateCourseIds,
  selectProgressByCourseId,
  selectIsEnrolledInCourse,
  selectIsFavouriteCourse,
  selectIsCompletedCourse,
  selectCanViewCourseContent,
  selectViewerCourseProgress,
  selectCurrentCourses,
  selectFavouriteCourses,
  selectCompletedCourses,
  selectViewerCourseById,
} from "./model/selectors";
