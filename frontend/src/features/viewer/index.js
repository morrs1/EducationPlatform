export { default as viewerReducer } from "./model/viewerSlice";
export {
  submitViewerProfileUpdate,
  hydrateViewerFromUserService,
  hydrateViewerLearningFromLearningService,
  enrollViewerInCourseWithLearningService,
  leaveViewerCourseWithLearningService,
  completeViewerCourseWithLearningService,
} from "./model/thunks";
export { default as ViewerProfileBootstrap } from "./ui/ViewerProfileBootstrap";

export {
  updateViewerProfile,
  changeViewerEmail,
  enrollInCourse,
  leaveCourse,
  markCourseCompleted,
  syncLearningEnrollment,
  syncCourseLessonProgress,
  upsertViewerCourseSnapshot,
  restoreViewer,
  mergeCertificateCourseIds,
  resetDemoState,
} from "./model/viewerSlice";

export {
  buildAvatarUrl,
  createViewerCourseSnapshot,
  createInitialViewerState,
  createViewerProfileFromRegistration,
} from "../../entities/viewer";
export { resolveCourseServiceAuthorId } from "./model/courseServiceAuthorId";

export {
  loadViewerProfilesMap,
  saveViewerProfilesMap,
  loadViewerProfileByViewerId,
  saveViewerProfile,
} from "../../entities/viewer";

export {
  requestViewerDisplayProfileById,
  resolveRemoteViewerId,
} from "../../shared/api/userServiceApi";

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
  selectCompletedCourseIds,
  selectCertificateCourseIds,
  selectProgressByCourseId,
  selectIsEnrolledInCourse,
  selectIsCompletedCourse,
  selectCanViewCourseContent,
  selectViewerCourseProgress,
  selectCurrentCourses,
  selectCompletedCourses,
  selectViewerCourseById,
} from "./model/selectors";
