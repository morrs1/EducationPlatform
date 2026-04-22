import { createSlice } from "@reduxjs/toolkit";
import { mockCourses } from "../../../entities/course/model/mockCourses";
import {
  buildAvatarUrl,
  buildViewerDisplayName,
  createViewerCourseSnapshot,
  createInitialViewerState,
  getViewerCourseStorageKey,
  normalizeViewerCourseId,
  normalizeViewerCourseSnapshot,
  normalizeViewerProfile,
} from "./factory";

function getCourseById(courseId) {
  return mockCourses.find((course) => course.id === courseId) ?? null;
}

function getViewerCourseRecord(state, courseId) {
  const normalizedCourseId = normalizeViewerCourseId(courseId);

  if (normalizedCourseId == null) {
    return null;
  }

  return (
    getCourseById(normalizedCourseId) ??
    state.courseSnapshotsById[getViewerCourseStorageKey(normalizedCourseId)] ??
    null
  );
}

function resolveViewerCourseActionPayload(payload) {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    ("courseId" in payload || "courseSnapshot" in payload)
  ) {
    return {
      courseId: normalizeViewerCourseId(payload.courseId),
      courseSnapshot:
        normalizeViewerCourseSnapshot(payload.courseSnapshot) ?? null,
    };
  }

  return {
    courseId: normalizeViewerCourseId(payload),
    courseSnapshot: null,
  };
}

function upsertCourseSnapshot(state, courseSnapshot) {
  if (!courseSnapshot) {
    return;
  }

  state.courseSnapshotsById[String(courseSnapshot.id)] = courseSnapshot;
}

function isGeneratedViewerAvatar(avatarUrl) {
  return avatarUrl.includes("api.dicebear.com/9.x/initials/svg");
}

const viewerSlice = createSlice({
  name: "viewer",
  initialState: createInitialViewerState(),
  reducers: {
    updateViewerProfile: (state, action) => {
      const {
        firstName = "",
        lastName = "",
        patronymic = "",
        status = "",
        headline = "",
        about = "",
        avatarUrl,
      } = action.payload;
      const nextFirstName = firstName.trim();
      const nextLastName = lastName.trim();
      const nextPatronymic = patronymic.trim();
      const nextStatus = status.trim() || headline.trim();
      const nextFullName =
        buildViewerDisplayName(
          nextFirstName,
          nextLastName,
          nextPatronymic,
        ) || state.name;

      state.firstName = nextFirstName;
      state.lastName = nextLastName;
      state.patronymic = nextPatronymic;
      state.name = nextFullName;
      state.status = nextStatus;
      state.headline = nextStatus;
      state.about = about.trim();

      if (avatarUrl) {
        state.avatarUrl = avatarUrl;
      } else if (isGeneratedViewerAvatar(state.avatarUrl)) {
        state.avatarUrl = buildAvatarUrl(nextFullName);
      }
    },

    changeViewerEmail: (state, action) => {
      const nextEmail = action.payload?.trim().toLowerCase();

      if (!nextEmail) {
        return;
      }

      state.email = nextEmail;
    },

    restoreViewer: (_state, action) =>
      normalizeViewerProfile(action.payload ?? createInitialViewerState()),

    enrollInCourse: (state, action) => {
      const { courseId, courseSnapshot } = resolveViewerCourseActionPayload(
        action.payload,
      );

      if (courseId == null) {
        return;
      }

      upsertCourseSnapshot(state, courseSnapshot);

      if (state.enrolledCourseIds.includes(courseId)) {
        return;
      }

      state.enrolledCourseIds.push(courseId);

      const storageKey = getViewerCourseStorageKey(courseId);

      if (!storageKey || !state.progressByCourseId[storageKey]) {
        state.progressByCourseId[storageKey] = {
          completedLessons: 0,
          completedTests: 0,
          completedTasks: 0,
          lastVisitedAt: new Date().toISOString(),
        };
      }
    },

    toggleFavouriteCourse: (state, action) => {
      const { courseId, courseSnapshot } = resolveViewerCourseActionPayload(
        action.payload,
      );

      if (courseId == null) {
        return;
      }

      upsertCourseSnapshot(state, courseSnapshot);

      const favouriteIndex = state.favouriteCourseIds.indexOf(courseId);

      if (favouriteIndex >= 0) {
        state.favouriteCourseIds.splice(favouriteIndex, 1);
        return;
      }

      state.favouriteCourseIds.push(courseId);
    },

    leaveCourse: (state, action) => {
      const courseId = normalizeViewerCourseId(action.payload);

      if (courseId == null || !state.enrolledCourseIds.includes(courseId)) {
        return;
      }

      state.enrolledCourseIds = state.enrolledCourseIds.filter(
        (id) => id !== courseId,
      );

      const storageKey = getViewerCourseStorageKey(courseId);

      if (!state.completedCourseIds.includes(courseId)) {
        delete state.progressByCourseId[storageKey];
      }
    },

    markCourseCompleted: (state, action) => {
      const { courseId, courseSnapshot } = resolveViewerCourseActionPayload(
        action.payload,
      );

      if (courseId == null) {
        return;
      }

      upsertCourseSnapshot(state, courseSnapshot);

      const course = getViewerCourseRecord(state, courseId);

      if (!state.completedCourseIds.includes(courseId)) {
        state.completedCourseIds.push(courseId);
      }

      state.enrolledCourseIds = state.enrolledCourseIds.filter(
        (id) => id !== courseId,
      );

      const storageKey = getViewerCourseStorageKey(courseId);

      state.progressByCourseId[storageKey] = {
        completedLessons: course?.lessonsCount ?? 0,
        completedTests: course?.testsCount ?? 0,
        completedTasks: course?.tasksCount ?? 0,
        lastVisitedAt: new Date().toISOString(),
      };
    },

    upsertViewerCourseSnapshot: (state, action) => {
      const courseSnapshot =
        action.payload?.courseSnapshot ?? action.payload ?? null;

      upsertCourseSnapshot(
        state,
        normalizeViewerCourseSnapshot(courseSnapshot) ??
          createViewerCourseSnapshot(courseSnapshot),
      );
    },

    resetDemoState: () => createInitialViewerState(),
  },
});

export const {
  updateViewerProfile,
  changeViewerEmail,
  enrollInCourse,
  toggleFavouriteCourse,
  leaveCourse,
  markCourseCompleted,
  upsertViewerCourseSnapshot,
  restoreViewer,
  resetDemoState,
} = viewerSlice.actions;

export default viewerSlice.reducer;
