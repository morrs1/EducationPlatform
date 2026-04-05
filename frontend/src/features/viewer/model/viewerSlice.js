import { createSlice } from "@reduxjs/toolkit";
import { mockCourses } from "../../../entities/course/model/mockCourses";
import {
  buildAvatarUrl,
  createInitialViewerState,
  normalizeViewerProfile,
} from "./factory";

function getCourseById(courseId) {
  return mockCourses.find((course) => course.id === courseId) ?? null;
}

function buildFullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
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
        headline = "",
        about = "",
        avatarUrl,
      } = action.payload;
      const nextFirstName = firstName.trim();
      const nextLastName = lastName.trim();
      const nextFullName =
        buildFullName(nextFirstName, nextLastName) || state.name;

      state.firstName = nextFirstName;
      state.lastName = nextLastName;
      state.name = nextFullName;
      state.headline = headline.trim();
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
      const courseId = action.payload;

      if (state.enrolledCourseIds.includes(courseId)) {
        return;
      }

      const course = getCourseById(courseId);

      if (!course) {
        return;
      }

      state.enrolledCourseIds.push(courseId);

      if (!state.progressByCourseId[courseId]) {
        state.progressByCourseId[courseId] = {
          completedLessons: 0,
          completedTests: 0,
          completedTasks: 0,
          lastVisitedAt: new Date().toISOString(),
        };
      }
    },

    toggleFavouriteCourse: (state, action) => {
      const courseId = action.payload;
      const favouriteIndex = state.favouriteCourseIds.indexOf(courseId);

      if (favouriteIndex >= 0) {
        state.favouriteCourseIds.splice(favouriteIndex, 1);
        return;
      }

      state.favouriteCourseIds.push(courseId);
    },

    leaveCourse: (state, action) => {
      const courseId = action.payload;

      if (!state.enrolledCourseIds.includes(courseId)) {
        return;
      }

      state.enrolledCourseIds = state.enrolledCourseIds.filter(
        (id) => id !== courseId,
      );

      if (!state.completedCourseIds.includes(courseId)) {
        delete state.progressByCourseId[courseId];
      }
    },

    markCourseCompleted: (state, action) => {
      const courseId = action.payload;
      const course = getCourseById(courseId);

      if (!course) {
        return;
      }

      if (!state.completedCourseIds.includes(courseId)) {
        state.completedCourseIds.push(courseId);
      }

      state.enrolledCourseIds = state.enrolledCourseIds.filter(
        (id) => id !== courseId,
      );

      state.progressByCourseId[courseId] = {
        completedLessons: course.lessonsCount,
        completedTests: course.testsCount,
        completedTasks: course.tasksCount,
        lastVisitedAt: new Date().toISOString(),
      };
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
  restoreViewer,
  resetDemoState,
} = viewerSlice.actions;

export default viewerSlice.reducer;
