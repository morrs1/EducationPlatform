import { createSelector } from "@reduxjs/toolkit";
import { getCourseProgressByCourseId } from "../../../entities/course/model/progress";
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
const selectViewedLessonIds = (state) =>
  state.lessonSession?.viewedLessonIds ?? [];
const selectCompletedLessonIds = (state) =>
  state.lessonSession?.completedLessonIds ?? [];
const selectCourseIdParam = (_state, courseId) => courseId;

function attachViewerState(
  course,
  viewer,
  sessionIsActive,
  viewedLessonIds,
  completedLessonIds,
) {
  const enrichedCourse = enrichCourse(course);
  const progress = sessionIsActive
    ? getCourseProgressByCourseId({
        courseId: course.id,
        viewerProgress: viewer.progressByCourseId[course.id] ?? null,
        viewedLessonIds,
        completedLessonIds,
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
    ? getCourseProgressByCourseId({
        courseId,
        viewerProgress: state.viewer.progressByCourseId[courseId] ?? null,
        viewedLessonIds: selectViewedLessonIds(state),
        completedLessonIds: selectCompletedLessonIds(state),
      })
    : null;

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
          .map(getCourseById)
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
          .map(getCourseById)
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
          .map(getCourseById)
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
    const course = getCourseById(courseId);

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
