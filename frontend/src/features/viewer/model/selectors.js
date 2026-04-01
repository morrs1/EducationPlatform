import { createSelector } from "@reduxjs/toolkit";
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

const selectViewerSessionActive = (state) => state.auth?.isLogged ?? false;
const selectViewerState = (state) => state.viewer;
const selectCourseIdParam = (_state, courseId) => courseId;

function attachViewerState(course, viewer, sessionIsActive) {
  const enrichedCourse = enrichCourse(course);
  const progress = sessionIsActive
    ? viewer.progressByCourseId[course.id] ?? null
    : null;

  return {
    ...enrichedCourse,
    isEnrolled: sessionIsActive && viewer.enrolledCourseIds.includes(course.id),
    isFavourite:
      sessionIsActive && viewer.favouriteCourseIds.includes(course.id),
    isCompleted:
      sessionIsActive && viewer.completedCourseIds.includes(course.id),
    hasCertificate:
      sessionIsActive && viewer.certificateCourseIds.includes(course.id),
    progress,
  };
}

export const selectIsEnrolledInCourse = (state, courseId) =>
  selectViewerSessionActive(state) &&
  state.viewer.enrolledCourseIds.includes(courseId);

export const selectIsFavouriteCourse = (state, courseId) =>
  selectViewerSessionActive(state) &&
  state.viewer.favouriteCourseIds.includes(courseId);

export const selectIsCompletedCourse = (state, courseId) =>
  selectViewerSessionActive(state) &&
  state.viewer.completedCourseIds.includes(courseId);

export const selectCanViewCourseContent = (state, courseId) =>
  selectIsEnrolledInCourse(state, courseId) ||
  selectIsCompletedCourse(state, courseId);

export const selectViewerCourseProgress = (state, courseId) =>
  selectViewerSessionActive(state)
    ? state.viewer.progressByCourseId[courseId] ?? null
    : null;

export const selectCurrentCourses = createSelector(
  [selectViewerSessionActive, selectViewerState],
  (sessionIsActive, viewer) =>
    !sessionIsActive
      ? []
      : viewer.enrolledCourseIds
          .map(getCourseById)
          .filter(Boolean)
          .map((course) => attachViewerState(course, viewer, sessionIsActive)),
);

export const selectFavouriteCourses = createSelector(
  [selectViewerSessionActive, selectViewerState],
  (sessionIsActive, viewer) =>
    !sessionIsActive
      ? []
      : viewer.favouriteCourseIds
          .map(getCourseById)
          .filter(Boolean)
          .map((course) => attachViewerState(course, viewer, sessionIsActive)),
);

export const selectCompletedCourses = createSelector(
  [selectViewerSessionActive, selectViewerState],
  (sessionIsActive, viewer) =>
    !sessionIsActive
      ? []
      : viewer.completedCourseIds
          .map(getCourseById)
          .filter(Boolean)
          .map((course) => attachViewerState(course, viewer, sessionIsActive)),
);

export const selectViewerCourseById = createSelector(
  [selectViewerSessionActive, selectViewerState, selectCourseIdParam],
  (sessionIsActive, viewer, courseId) => {
    const course = getCourseById(courseId);

    return course ? attachViewerState(course, viewer, sessionIsActive) : null;
  },
);
