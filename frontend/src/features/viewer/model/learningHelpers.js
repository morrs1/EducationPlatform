import {
  resetCourseLessonSessions,
  syncCompletedLessonsForCourse,
} from "../../lesson-session/@x/viewer";
import {
  createViewerCourseSnapshot,
  getViewerCourseStorageKey,
} from "../../../entities/viewer";
import {
  enrichCoursePageDataWithAuthorName,
  mapReadCourseByIdResponseToCoursePageData,
  requestCourseById,
} from "../../../entities/course";
import {
  requestCompletedLessonsForCourse,
  resolveRemoteViewerId,
} from "../../../shared/api";

export function hasUnsupportedCourseIds(courseIds) {
  if (!Array.isArray(courseIds)) {
    return false;
  }

  return courseIds.some((courseId) => {
    const normalizedCourseId =
      typeof courseId === "string" ? courseId.trim() : courseId;

    if (normalizedCourseId === "" || normalizedCourseId == null) {
      return false;
    }

    return !Number.isFinite(Number(normalizedCourseId));
  });
}

export function pickCourseIdsForHydration(remoteCourseIds, localCourseIds) {
  return hasUnsupportedCourseIds(remoteCourseIds)
    ? localCourseIds
    : remoteCourseIds;
}

export function normalizeStatus(value) {
  return (value ?? "").trim();
}

export function normalizeCourseId(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function getUniqueCourseIds(...courseIdGroups) {
  const courseIdMap = new Map();

  courseIdGroups.flat().forEach((courseId) => {
    const normalizedCourseId = normalizeCourseId(courseId);

    if (!normalizedCourseId) {
      return;
    }

    courseIdMap.set(String(normalizedCourseId), normalizedCourseId);
  });

  return Array.from(courseIdMap.values());
}

export function getSyllabusLessonIds(syllabus) {
  return (syllabus?.modules ?? [])
    .flatMap((module) => module.lessons.map((lesson) => lesson.lessonId))
    .filter(Boolean);
}

export async function loadCourseSnapshotFromCourseService(courseId) {
  try {
    const courseResponse = await requestCourseById(courseId);
    const pageData = mapReadCourseByIdResponseToCoursePageData(
      courseResponse,
      courseId,
    );
    const enrichedPageData = await enrichCoursePageDataWithAuthorName(
      pageData,
    );

    if (!enrichedPageData?.course) {
      return null;
    }

    return createViewerCourseSnapshot(
      enrichedPageData.course,
      getSyllabusLessonIds(enrichedPageData.syllabus),
    );
  } catch (error) {
    if (error?.status !== 404) {
      return null;
    }

    return {
      courseId,
      isMissing: true,
    };
  }
}

export async function loadCourseSnapshotsFromCourseService(courseIds) {
  const results = await Promise.all(
    getUniqueCourseIds(courseIds).map(loadCourseSnapshotFromCourseService),
  );
  const courseSnapshots = [];
  const missingCourseIds = [];

  results.forEach((result) => {
    if (!result) {
      return;
    }

    if (result.isMissing) {
      missingCourseIds.push(result.courseId);
      return;
    }

    courseSnapshots.push(result);
  });

  return {
    courseSnapshots,
    missingCourseIds,
  };
}

export function resolveLearningViewerId(state, explicitRemoteViewerId = null) {
  return resolveRemoteViewerId(
    state.auth.currentViewerId,
    explicitRemoteViewerId ?? state.viewer.remoteId,
  );
}

export function getCourseLessonIdsForReset(state, courseId) {
  const storageKey = getViewerCourseStorageKey(courseId);

  if (!storageKey) {
    return [];
  }

  const courseSnapshot = state.viewer.courseSnapshotsById[storageKey];

  return Array.isArray(courseSnapshot?.syllabusLessonIds)
    ? courseSnapshot.syllabusLessonIds.filter(Boolean)
    : [];
}

export function resetLessonStateForCourse(dispatch, lessonIds) {
  if (!lessonIds.length) {
    return;
  }

  dispatch(
    resetCourseLessonSessions({
      lessonIds,
    }),
  );
}

export function getCourseSnapshotById(courseSnapshots, courseId) {
  return (
    courseSnapshots.find((courseSnapshot) => courseSnapshot.id === courseId) ??
    null
  );
}

export async function loadCompletedLessonIdsForCourse({ userId, courseId }) {
  const response = await requestCompletedLessonsForCourse({
    userId,
    courseId,
  });

  return response.completedLessons.map((lesson) => lesson.lessonId);
}

export function buildProgressByCourseIdFromCompletedLessons(entries) {
  return entries.reduce((progressMap, entry) => {
    const storageKey = getViewerCourseStorageKey(entry.courseId);

    if (!storageKey) {
      return progressMap;
    }

    progressMap[storageKey] = {
      completedLessons: entry.completedLessonIds.length,
      completedTests: 0,
      completedTasks: 0,
      lastVisitedAt: new Date().toISOString(),
    };

    return progressMap;
  }, {});
}

export async function loadCompletedLessonsForActiveCourses({
  userId,
  courseIds,
  courseSnapshots,
}) {
  const results = await Promise.allSettled(
    courseIds.map(async (courseId) => {
      const courseSnapshot = getCourseSnapshotById(courseSnapshots, courseId);
      const courseLessonIds = courseSnapshot?.syllabusLessonIds ?? [];

      if (!courseLessonIds.length) {
        return null;
      }

      const completedLessonIds = await loadCompletedLessonIdsForCourse({
        userId,
        courseId,
      });

      return {
        courseId,
        courseLessonIds,
        completedLessonIds,
      };
    }),
  );

  return results
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);
}

export function syncCompletedLessonsForActiveCourses(dispatch, entries) {
  entries.forEach(({ courseLessonIds, completedLessonIds }) => {
    dispatch(
      syncCompletedLessonsForCourse({
        courseLessonIds,
        completedLessonIds,
      }),
    );
  });
}

