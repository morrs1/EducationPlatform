import { updateViewerProfile, restoreViewer } from "./viewerSlice";
import {
  mapReadUserByIdResponseToViewerProfile,
  requestViewerProfileById,
  resolveRemoteViewerId,
} from "./userServiceApi";

export function submitViewerProfileUpdate(payload) {
  return (dispatch) => {
    const nextFirstName = payload.firstName?.trim() ?? "";
    const nextLastName = payload.lastName?.trim() ?? "";
    const nextHeadline = payload.headline?.trim() ?? "";
    const nextAbout = payload.about?.trim() ?? "";

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

    dispatch(
      updateViewerProfile({
        ...payload,
        firstName: nextFirstName,
        lastName: nextLastName,
        headline: nextHeadline,
        about: nextAbout,
      }),
    );

    return {
      ok: true,
      message: "Данные профиля сохранены.",
    };
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
      const remoteViewer =
        mapReadUserByIdResponseToViewerProfile(response, viewerStateId);
      const localViewer = state.viewer;

      dispatch(
        restoreViewer({
          ...localViewer,
          ...remoteViewer,
          headline: remoteViewer.headline || localViewer.headline,
          about: remoteViewer.about || localViewer.about,
          avatarUrl: remoteViewer.avatarUrl || localViewer.avatarUrl,
          favouriteCourseIds: localViewer.favouriteCourseIds,
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
