import {
  enrollInCourse,
  markCourseCompleted,
  restoreViewer,
  syncLearningEnrollment,
  updateViewerProfile,
} from "./viewerSlice";
import {
  createViewerCourseSnapshot,
} from "../../../entities/viewer";
import {
  mapReadCourseByIdResponseToCoursePageData,
  requestCourseById,
} from "../../../entities/course";
import {
  isUuid as isLearningUuid,
  requestCompletedCoursesByUser,
  requestCompleteCourse,
  requestEnrollUserInCourse,
  requestIncompleteCoursesByUser,
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

const VIEWER_STATUS_PATTERN = /^[A-Z][A-Z_]{1,31}$/;

function normalizeStatus(value) {
  return (value ?? "").trim().replace(/\s+/g, "_").toUpperCase();
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

    if (!pageData?.course) {
      return null;
    }

    return createViewerCourseSnapshot(
      pageData.course,
      getSyllabusLessonIds(pageData.syllabus),
    );
  } catch {
    return null;
  }
}

async function loadCourseSnapshotsFromCourseService(courseIds) {
  const snapshots = await Promise.all(
    getUniqueCourseIds(courseIds).map(loadCourseSnapshotFromCourseService),
  );

  return snapshots.filter(Boolean);
}

function resolveLearningViewerId(state, explicitRemoteViewerId = null) {
  return resolveRemoteViewerId(
    state.auth.currentViewerId,
    explicitRemoteViewerId ?? state.viewer.remoteId,
  );
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

    if (!nextStatus) {
      return {
        ok: false,
        error: "Введите статус пользователя.",
      };
    }

    if (!VIEWER_STATUS_PATTERN.test(nextStatus)) {
      return {
        ok: false,
        error:
          "Статус должен содержать только латинские заглавные буквы и символы подчеркивания, например STUDENT или ACTIVE_USER.",
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
          ? "Данные профиля сохранены локально. Фото будет доступно после подключения user_service."
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
          "Не удалось сохранить изменения профиля через user_service.",
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
          "Не удалось загрузить профиль пользователя из user_service.",
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
      const [enrolledCourseIds, completedCourseIds] = await Promise.all([
        requestIncompleteCoursesByUser(remoteViewerId),
        requestCompletedCoursesByUser(remoteViewerId),
      ]);
      const courseSnapshots = await loadCourseSnapshotsFromCourseService([
        ...enrolledCourseIds,
        ...completedCourseIds,
      ]);

      dispatch(
        syncLearningEnrollment({
          enrolledCourseIds,
          completedCourseIds,
          courseSnapshots,
        }),
      );

      return {
        ok: true,
        viewerId: remoteViewerId,
        enrolledCourseIds,
        completedCourseIds,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось загрузить учебное состояние из learning_service.",
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
          error?.message ?? "Не удалось записаться на курс через learning_service.",
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
      await requestCompleteCourse({
        userId: remoteViewerId,
        courseId,
      });

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
          "Не удалось завершить курс через learning_service.",
      };
    }
  };
}
