import { createSelector } from "@reduxjs/toolkit";
import { getCourseProgressByCourseId } from "../../../entities/course/model/progress";
import {
  enrichCourse,
  getCourseById,
} from "../../../entities/course/model/selectors";
import {
  getViewerCourseStorageKey,
  normalizeViewerCourseId,
} from "./factory";

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
const selectViewedLessonIds = (state) =>
  state.lessonSession?.viewedLessonIds ?? [];
const selectCompletedLessonIds = (state) =>
  state.lessonSession?.completedLessonIds ?? [];
const selectCourseIdParam = (_state, courseId) => courseId;

function getViewerCourseRecord(viewer, courseId) {
  const normalizedCourseId = normalizeViewerCourseId(courseId);

  if (normalizedCourseId == null) {
    return null;
  }

  return (
    getCourseById(normalizedCourseId) ??
    viewer.courseSnapshotsById[getViewerCourseStorageKey(normalizedCourseId)] ??
    null
  );
}

function attachViewerState(
  course,
  viewer,
  sessionIsActive,
  viewedLessonIds,
  completedLessonIds,
) {
  const enrichedCourse = enrichCourse(course);
  const storageKey = getViewerCourseStorageKey(course.id);
  const progress = sessionIsActive
    ? getCourseProgressByCourseId({
        courseId: course.id,
        viewerProgress: viewer.progressByCourseId[storageKey] ?? null,
        viewedLessonIds,
        completedLessonIds,
        courseSnapshot: course,
      })
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
  state.viewer.enrolledCourseIds.includes(normalizeViewerCourseId(courseId));

export const selectIsFavouriteCourse = (state, courseId) =>
  selectViewerSessionActive(state) &&
  state.viewer.favouriteCourseIds.includes(normalizeViewerCourseId(courseId));

export const selectIsCompletedCourse = (state, courseId) =>
  selectViewerSessionActive(state) &&
  state.viewer.completedCourseIds.includes(normalizeViewerCourseId(courseId));

export const selectCanViewCourseContent = (state, courseId) =>
  selectIsEnrolledInCourse(state, courseId) ||
  selectIsCompletedCourse(state, courseId);

export const selectViewerCourseProgress = createSelector(
  [
    selectViewerSessionActive,
    selectViewerState,
    selectViewedLessonIds,
    selectCompletedLessonIds,
    selectCourseIdParam,
  ],
  (sessionIsActive, viewer, viewedLessonIds, completedLessonIds, courseId) => {
    if (!sessionIsActive) {
      return null;
    }

    const normalizedCourseId = normalizeViewerCourseId(courseId);

    if (normalizedCourseId == null) {
      return null;
    }

    return getCourseProgressByCourseId({
      courseId: normalizedCourseId,
      viewerProgress:
        viewer.progressByCourseId[getViewerCourseStorageKey(normalizedCourseId)] ??
        null,
      viewedLessonIds,
      completedLessonIds,
      courseSnapshot: getViewerCourseRecord(viewer, normalizedCourseId),
    });
  },
);

export const selectCurrentCourses = createSelector(
  [
    selectViewerSessionActive,
    selectViewerState,
    selectViewedLessonIds,
    selectCompletedLessonIds,
  ],
  (sessionIsActive, viewer, viewedLessonIds, completedLessonIds) =>
    !sessionIsActive
      ? []
      : viewer.enrolledCourseIds
          .map((courseId) => getViewerCourseRecord(viewer, courseId))
          .filter(Boolean)
          .map((course) =>
            attachViewerState(
              course,
              viewer,
              sessionIsActive,
              viewedLessonIds,
              completedLessonIds,
            ),
          ),
);

export const selectFavouriteCourses = createSelector(
  [
    selectViewerSessionActive,
    selectViewerState,
    selectViewedLessonIds,
    selectCompletedLessonIds,
  ],
  (sessionIsActive, viewer, viewedLessonIds, completedLessonIds) =>
    !sessionIsActive
      ? []
      : viewer.favouriteCourseIds
          .map((courseId) => getViewerCourseRecord(viewer, courseId))
          .filter(Boolean)
          .map((course) =>
            attachViewerState(
              course,
              viewer,
              sessionIsActive,
              viewedLessonIds,
              completedLessonIds,
            ),
          ),
);

export const selectCompletedCourses = createSelector(
  [
    selectViewerSessionActive,
    selectViewerState,
    selectViewedLessonIds,
    selectCompletedLessonIds,
  ],
  (sessionIsActive, viewer, viewedLessonIds, completedLessonIds) =>
    !sessionIsActive
      ? []
      : viewer.completedCourseIds
          .map((courseId) => getViewerCourseRecord(viewer, courseId))
          .filter(Boolean)
          .map((course) =>
            attachViewerState(
              course,
              viewer,
              sessionIsActive,
              viewedLessonIds,
              completedLessonIds,
            ),
          ),
);

export const selectViewerCourseById = createSelector(
  [
    selectViewerSessionActive,
    selectViewerState,
    selectViewedLessonIds,
    selectCompletedLessonIds,
    selectCourseIdParam,
  ],
  (sessionIsActive, viewer, viewedLessonIds, completedLessonIds, courseId) => {
    const course = getViewerCourseRecord(viewer, courseId);

    return course
      ? attachViewerState(
          course,
          viewer,
          sessionIsActive,
          viewedLessonIds,
          completedLessonIds,
        )
      : null;
  },
);
