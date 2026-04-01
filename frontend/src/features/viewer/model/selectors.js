import {
  enrichCourse,
  getCourseById,
} from "../../../entities/course/model/selectors";

export const selectViewer = (state) => state.viewer;
export const selectViewerId = (state) => state.viewer.id;
export const selectViewerFirstName = (state) => state.viewer.firstName;
export const selectViewerLastName = (state) => state.viewer.lastName;
export const selectViewerName = (state) => state.viewer.name;
export const selectViewerEmail = (state) => state.viewer.email;
export const selectViewerAvatarUrl = (state) => state.viewer.avatarUrl;
export const selectViewerHeadline = (state) => state.viewer.headline;
export const selectViewerAbout = (state) => state.viewer.about;
export const selectEnrolledCourseIds = (state) => state.viewer.enrolledCourseIds;
export const selectFavouriteCourseIds = (state) =>
  state.viewer.favouriteCourseIds;
export const selectCompletedCourseIds = (state) =>
  state.viewer.completedCourseIds;
export const selectCertificateCourseIds = (state) =>
  state.viewer.certificateCourseIds;
export const selectProgressByCourseId = (state) =>
  state.viewer.progressByCourseId;

function isViewerSessionActive(state) {
  return state.auth?.isLogged ?? false;
}

function attachViewerState(course, state) {
  const enrichedCourse = enrichCourse(course);
  const sessionIsActive = isViewerSessionActive(state);
  const progress = sessionIsActive
    ? state.viewer.progressByCourseId[course.id] ?? null
    : null;

  return {
    ...enrichedCourse,
    isEnrolled:
      sessionIsActive && state.viewer.enrolledCourseIds.includes(course.id),
    isFavourite:
      sessionIsActive && state.viewer.favouriteCourseIds.includes(course.id),
    isCompleted:
      sessionIsActive && state.viewer.completedCourseIds.includes(course.id),
    hasCertificate:
      sessionIsActive && state.viewer.certificateCourseIds.includes(course.id),
    progress,
  };
}

export const selectIsEnrolledInCourse = (state, courseId) =>
  isViewerSessionActive(state) && state.viewer.enrolledCourseIds.includes(courseId);

export const selectIsFavouriteCourse = (state, courseId) =>
  isViewerSessionActive(state) &&
  state.viewer.favouriteCourseIds.includes(courseId);

export const selectIsCompletedCourse = (state, courseId) =>
  isViewerSessionActive(state) &&
  state.viewer.completedCourseIds.includes(courseId);

export const selectCanViewCourseContent = (state, courseId) =>
  selectIsEnrolledInCourse(state, courseId) ||
  selectIsCompletedCourse(state, courseId);

export const selectViewerCourseProgress = (state, courseId) =>
  isViewerSessionActive(state)
    ? state.viewer.progressByCourseId[courseId] ?? null
    : null;

export const selectCurrentCourses = (state) =>
  !isViewerSessionActive(state)
    ? []
    : state.viewer.enrolledCourseIds
        .map(getCourseById)
        .filter(Boolean)
        .map((course) => attachViewerState(course, state));

export const selectFavouriteCourses = (state) =>
  !isViewerSessionActive(state)
    ? []
    : state.viewer.favouriteCourseIds
        .map(getCourseById)
        .filter(Boolean)
        .map((course) => attachViewerState(course, state));

export const selectCompletedCourses = (state) =>
  !isViewerSessionActive(state)
    ? []
    : state.viewer.completedCourseIds
        .map(getCourseById)
        .filter(Boolean)
        .map((course) => attachViewerState(course, state));

export const selectViewerCourseById = (state, courseId) => {
  const course = getCourseById(courseId);

  return course ? attachViewerState(course, state) : null;
};
