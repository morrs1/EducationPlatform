export { default as viewerReducer } from "./model/viewerSlice";
export { submitViewerProfileUpdate } from "./model/thunks";

export {
  updateViewerProfile,
  changeViewerEmail,
  enrollInCourse,
  toggleFavouriteCourse,
  leaveCourse,
  markCourseCompleted,
  resetDemoState,
} from "./model/viewerSlice";

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
