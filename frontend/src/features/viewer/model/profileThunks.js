import { restoreViewer, updateViewerProfile } from "./viewerSlice";
import { normalizeStatus, pickCourseIdsForHydration } from "./learningHelpers";
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
} from "../../../shared/api";
import { validateRequiredProfileNameParts } from "../../../shared/lib";

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

    const nameValidationError = validateRequiredProfileNameParts({
      firstName: nextFirstName,
      lastName: nextLastName,
      patronymic: nextPatronymic,
    });

    if (nameValidationError) {
      return {
        ok: false,
        error: nameValidationError,
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
