import {
  enrollInCourse,
  leaveCourse,
  markCourseCompleted,
  mergeCertificateCourseIds,
  restoreViewer,
  syncLearningEnrollment,
  updateViewerProfile,
} from "./viewerSlice";
import {
  resetCourseLessonSessions,
  syncCompletedLessonsForCourse,
} from "../../lesson-session/model/lessonSessionSlice";
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
  isUuid as isLearningUuid,
  requestCertificatesByUser,
  requestCompletedCoursesByUser,
  requestCompletedLessonsForCourse,
  requestCompleteCourse,
  requestCreateCertificate,
  requestEnrollUserInCourse,
  requestIncompleteCoursesByUser,
  requestLeaveCourse,
} from "../../../shared/api/learningServiceApi";
import {
  buildUserServiceMediaProxyUrl,
  mapReadUserByIdResponseToViewerProfile,
  normalizeUserServicePhotoUrl,
  requestViewerProfileById,
  requestViewerNameUpdate,
  requestViewerPatronymicUpdate,
  requestViewerStatusUpdate,
  requestViewerSurnameUpdate,
  resolveRemoteViewerId,
  uploadViewerProfilePhoto,
} from "../../../shared/api/userServiceApi";

function hasUnsupportedCourseIds(courseIds) {
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

function pickCourseIdsForHydration(remoteCourseIds, localCourseIds) {
  return hasUnsupportedCourseIds(remoteCourseIds)
    ? localCourseIds
    : remoteCourseIds;
}

function normalizeStatus(value) {
  return (value ?? "").trim();
}

function normalizeCourseId(value) {
  return typeof value === "string" ? value.trim() : value;
}

function getUniqueCourseIds(...courseIdGroups) {
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

function getSyllabusLessonIds(syllabus) {
  return (syllabus?.modules ?? [])
    .flatMap((module) => module.lessons.map((lesson) => lesson.lessonId))
    .filter(Boolean);
}

async function loadCourseSnapshotFromCourseService(courseId) {
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

async function loadCourseSnapshotsFromCourseService(courseIds) {
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

function resolveLearningViewerId(state, explicitRemoteViewerId = null) {
  return resolveRemoteViewerId(
    state.auth.currentViewerId,
    explicitRemoteViewerId ?? state.viewer.remoteId,
  );
}

function getCourseLessonIdsForReset(state, courseId) {
  const storageKey = getViewerCourseStorageKey(courseId);

  if (!storageKey) {
    return [];
  }

  const courseSnapshot = state.viewer.courseSnapshotsById[storageKey];

  return Array.isArray(courseSnapshot?.syllabusLessonIds)
    ? courseSnapshot.syllabusLessonIds.filter(Boolean)
    : [];
}

function resetLessonStateForCourse(dispatch, lessonIds) {
  if (!lessonIds.length) {
    return;
  }

  dispatch(
    resetCourseLessonSessions({
      lessonIds,
    }),
  );
}

function getCourseSnapshotById(courseSnapshots, courseId) {
  return (
    courseSnapshots.find((courseSnapshot) => courseSnapshot.id === courseId) ??
    null
  );
}

async function loadCompletedLessonIdsForCourse({ userId, courseId }) {
  const response = await requestCompletedLessonsForCourse({
    userId,
    courseId,
  });

  return response.completedLessons.map((lesson) => lesson.lessonId);
}

function buildProgressByCourseIdFromCompletedLessons(entries) {
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

async function loadCompletedLessonsForActiveCourses({
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

function syncCompletedLessonsForActiveCourses(dispatch, entries) {
  entries.forEach(({ courseLessonIds, completedLessonIds }) => {
    dispatch(
      syncCompletedLessonsForCourse({
        courseLessonIds,
        completedLessonIds,
      }),
    );
  });
}

function saveViewerProfileLocally(dispatch, viewer, profile) {
  dispatch(
    updateViewerProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      patronymic: profile.patronymic,
      status: profile.status,
      about: viewer.about ?? "",
      avatarUrl: viewer.avatarUrl,
    }),
  );
}

export function submitViewerProfileUpdate(payload) {
  return async (dispatch, getState) => {
    const state = getState();
    const viewer = state.viewer;
    const nextFirstName = payload.firstName?.trim() ?? "";
    const nextLastName = payload.lastName?.trim() ?? "";
    const nextPatronymic = payload.patronymic?.trim() ?? "";
    const nextStatus = normalizeStatus(payload.status);
    const nextAvatarFile =
      payload.avatarFile instanceof File ? payload.avatarFile : null;
    const remoteViewerId = resolveRemoteViewerId(
      state.auth.currentViewerId,
      payload.remoteViewerId ?? viewer.remoteId,
    );

    if (!nextFirstName) {
      return {
        ok: false,
        error: "Введите имя.",
      };
    }

    if (!nextLastName) {
      return {
        ok: false,
        error: "Введите фамилию.",
      };
    }

    if (!nextPatronymic) {
      return {
        ok: false,
        error: "Введите отчество.",
      };
    }

    if (!remoteViewerId) {
      saveViewerProfileLocally(dispatch, viewer, {
        firstName: nextFirstName,
        lastName: nextLastName,
        patronymic: nextPatronymic,
        status: nextStatus,
      });

      return {
        ok: true,
        message: nextAvatarFile
          ? "Данные профиля сохранены. Фото станет доступно позже."
          : "Данные профиля сохранены локально.",
      };
    }

    const operations = [];
    let uploadedPhotoUrl = null;

    if (viewer.firstName !== nextFirstName) {
      operations.push(() =>
        requestViewerNameUpdate(remoteViewerId, nextFirstName),
      );
    }

    if (viewer.lastName !== nextLastName) {
      operations.push(() =>
        requestViewerSurnameUpdate(remoteViewerId, nextLastName),
      );
    }

    if ((viewer.patronymic ?? "") !== nextPatronymic) {
      operations.push(() =>
        requestViewerPatronymicUpdate(remoteViewerId, nextPatronymic),
      );
    }

    if ((viewer.status ?? viewer.headline ?? "") !== nextStatus) {
      operations.push(() =>
        requestViewerStatusUpdate(remoteViewerId, nextStatus),
      );
    }

    if (nextAvatarFile) {
      operations.push(async () => {
        const uploadResult = await uploadViewerProfilePhoto(
          remoteViewerId,
          nextAvatarFile,
        );
        uploadedPhotoUrl =
          buildUserServiceMediaProxyUrl(
            uploadResult?.bucket,
            uploadResult?.key,
          ) || normalizeUserServicePhotoUrl(uploadResult?.url);
      });
    }

    if (!operations.length) {
      return {
        ok: true,
        message: "Изменений нет, профиль уже актуален.",
      };
    }

    let hasSuccessfulMutation = false;

    try {
      for (const runOperation of operations) {
        await runOperation();
        hasSuccessfulMutation = true;
      }

      const refreshResult = await dispatch(
        hydrateViewerFromUserService({
          remoteViewerId,
        }),
      );

      if (!refreshResult?.ok) {
        dispatch(
          updateViewerProfile({
            firstName: nextFirstName,
            lastName: nextLastName,
            patronymic: nextPatronymic,
            status: nextStatus,
            avatarUrl: normalizeUserServicePhotoUrl(uploadedPhotoUrl),
            about: viewer.about ?? "",
          }),
        );
      }

      return {
        ok: true,
        message: "Данные профиля сохранены.",
      };
    } catch (error) {
      if (hasSuccessfulMutation) {
        await dispatch(
          hydrateViewerFromUserService({
            remoteViewerId,
          }),
        );
      }

      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось сохранить изменения профиля.",
      };
    }
  };
}

export function hydrateViewerFromUserService(options = {}) {
  return async (dispatch, getState) => {
    const state = getState();
    const remoteViewerId = resolveRemoteViewerId(
      state.auth.currentViewerId,
      options.remoteViewerId,
    );

    if (!state.auth.isLogged || !remoteViewerId) {
      return {
        ok: false,
        skipped: true,
      };
    }

    try {
      const response = await requestViewerProfileById(remoteViewerId);
      const viewerStateId = state.auth.currentViewerId ?? remoteViewerId;
      const remoteViewer = mapReadUserByIdResponseToViewerProfile(
        response,
        viewerStateId,
      );
      const localViewer = state.viewer;

      dispatch(
        restoreViewer({
          ...localViewer,
          ...remoteViewer,
          remoteId: remoteViewerId,
          status:
            remoteViewer.status || localViewer.status || localViewer.headline,
          headline:
            remoteViewer.headline || localViewer.status || localViewer.headline,
          about: localViewer.about,
          avatarUrl: remoteViewer.avatarUrl || localViewer.avatarUrl,
          enrolledCourseIds: pickCourseIdsForHydration(
            response?.currentCourses,
            localViewer.enrolledCourseIds,
          ),
          favouriteCourseIds: localViewer.favouriteCourseIds,
          completedCourseIds: pickCourseIdsForHydration(
            response?.finishedCourses,
            localViewer.completedCourseIds,
          ),
          certificateCourseIds: pickCourseIdsForHydration(
            response?.certificates,
            localViewer.certificateCourseIds,
          ),
          progressByCourseId: localViewer.progressByCourseId,
        }),
      );

      return {
        ok: true,
        viewerId: remoteViewerId,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось загрузить профиль пользователя.",
      };
    }
  };
}

export function hydrateViewerLearningFromLearningService(options = {}) {
  return async (dispatch, getState) => {
    const state = getState();
    const remoteViewerId = resolveLearningViewerId(
      state,
      options.remoteViewerId,
    );

    if (!state.auth.isLogged || !remoteViewerId) {
      return {
        ok: false,
        skipped: true,
      };
    }

    try {
      const [enrolledCourseIds, completedCourseIds, certificates] =
        await Promise.all([
          requestIncompleteCoursesByUser(remoteViewerId),
          requestCompletedCoursesByUser(remoteViewerId),
          requestCertificatesByUser(remoteViewerId).catch(() => []),
        ]);
      const { courseSnapshots, missingCourseIds } =
        await loadCourseSnapshotsFromCourseService([
          ...enrolledCourseIds,
          ...completedCourseIds,
        ]);
      const activeEnrolledCourseIds = enrolledCourseIds.filter(
        (courseId) => !missingCourseIds.includes(courseId),
      );
      const activeCompletedCourseIds = completedCourseIds.filter(
        (courseId) => !missingCourseIds.includes(courseId),
      );
      const completedLessonEntries = await loadCompletedLessonsForActiveCourses(
        {
          userId: remoteViewerId,
          courseIds: activeEnrolledCourseIds,
          courseSnapshots,
        },
      );

      dispatch(
        syncLearningEnrollment({
          enrolledCourseIds: activeEnrolledCourseIds,
          completedCourseIds: activeCompletedCourseIds,
          courseSnapshots,
          progressByCourseId:
            buildProgressByCourseIdFromCompletedLessons(
              completedLessonEntries,
            ),
        }),
      );

      const certificateCourseIdsFromApi = certificates
        .map((certificate) => certificate.courseId)
        .filter(
          (certificateCourseId) =>
            certificateCourseId &&
            !missingCourseIds.includes(certificateCourseId),
        );

      if (certificateCourseIdsFromApi.length) {
        dispatch(
          mergeCertificateCourseIds({
            courseIds: certificateCourseIdsFromApi,
          }),
        );
      }

      syncCompletedLessonsForActiveCourses(dispatch, completedLessonEntries);

      await Promise.allSettled(
        missingCourseIds.map((courseId) =>
          requestLeaveCourse({
            userId: remoteViewerId,
            courseId,
          }),
        ),
      );

      return {
        ok: true,
        viewerId: remoteViewerId,
        enrolledCourseIds: activeEnrolledCourseIds,
        completedCourseIds: activeCompletedCourseIds,
        certificates,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось загрузить учебное состояние.",
      };
    }
  };
}

export function enrollViewerInCourseWithLearningService(payload) {
  return async (dispatch, getState) => {
    const state = getState();
    const courseId = normalizeCourseId(payload?.courseId ?? payload);
    const courseSnapshot = payload?.courseSnapshot ?? null;
    const remoteViewerId = resolveLearningViewerId(
      state,
      payload?.remoteViewerId,
    );
    if (!state.auth.isLogged) {
      return {
        ok: false,
        error: "Войдите в аккаунт, чтобы записаться на курс.",
      };
    }

    if (!isLearningUuid(courseId) || !remoteViewerId) {
      dispatch(enrollInCourse({ courseId, courseSnapshot }));

      return {
        ok: true,
        local: true,
      };
    }

    try {
      await requestEnrollUserInCourse({
        userId: remoteViewerId,
        courseId,
      });

      const hydrationResult = await dispatch(
        hydrateViewerLearningFromLearningService({
          remoteViewerId,
        }),
      );

      if (!hydrationResult?.ok) {
        dispatch(enrollInCourse({ courseId, courseSnapshot }));
      }

      return {
        ok: true,
        viewerId: remoteViewerId,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ?? "Не удалось записаться на курс.",
      };
    }
  };
}

export function leaveViewerCourseWithLearningService(payload) {
  return async (dispatch, getState) => {
    const state = getState();
    const courseId = normalizeCourseId(payload?.courseId ?? payload);
    const remoteViewerId = resolveLearningViewerId(
      state,
      payload?.remoteViewerId,
    );
    const courseLessonIds = getCourseLessonIdsForReset(state, courseId);

    if (!state.auth.isLogged) {
      return {
        ok: false,
        error: "Войдите в аккаунт, чтобы покинуть курс.",
      };
    }

    if (!isLearningUuid(courseId) || !remoteViewerId) {
      dispatch(leaveCourse(courseId));
      resetLessonStateForCourse(dispatch, courseLessonIds);

      return {
        ok: true,
        local: true,
      };
    }

    try {
      await requestLeaveCourse({
        userId: remoteViewerId,
        courseId,
      });

      const hydrationResult = await dispatch(
        hydrateViewerLearningFromLearningService({
          remoteViewerId,
        }),
      );

      if (!hydrationResult?.ok) {
        dispatch(leaveCourse(courseId));
      }

      resetLessonStateForCourse(dispatch, courseLessonIds);

      return {
        ok: true,
        viewerId: remoteViewerId,
      };
    } catch (error) {
      if (error?.status === 404) {
        dispatch(leaveCourse(courseId));
        resetLessonStateForCourse(dispatch, courseLessonIds);
        await dispatch(
          hydrateViewerLearningFromLearningService({
            remoteViewerId,
          }),
        );

        return {
          ok: true,
          viewerId: remoteViewerId,
        };
      }

      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось покинуть курс.",
      };
    }
  };
}

export function completeViewerCourseWithLearningService(payload) {
  return async (dispatch, getState) => {
    const state = getState();
    const courseId = normalizeCourseId(payload?.courseId ?? payload);
    const courseSnapshot = payload?.courseSnapshot ?? null;
    const remoteViewerId = resolveLearningViewerId(
      state,
      payload?.remoteViewerId,
    );

    if (!isLearningUuid(courseId) || !remoteViewerId) {
      dispatch(markCourseCompleted({ courseId, courseSnapshot }));

      return {
        ok: true,
        local: true,
      };
    }

    try {
      const completeCourseBody = await requestCompleteCourse({
        userId: remoteViewerId,
        courseId,
      });
      const enrollmentId = normalizeCourseId(
        completeCourseBody?.enrollmentId,
      );

      if (isLearningUuid(enrollmentId)) {
        try {
          await requestCreateCertificate({
            enrollmentId,
          });
          dispatch(mergeCertificateCourseIds({ courseIds: [courseId] }));
        } catch (certificateError) {
          if (certificateError?.status === 409) {
            dispatch(mergeCertificateCourseIds({ courseIds: [courseId] }));
          }
        }
      }

      const hydrationResult = await dispatch(
        hydrateViewerLearningFromLearningService({
          remoteViewerId,
        }),
      );

      if (!hydrationResult?.ok) {
        dispatch(markCourseCompleted({ courseId, courseSnapshot }));
      }

      return {
        ok: true,
        viewerId: remoteViewerId,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось завершить курс.",
      };
    }
  };
}
