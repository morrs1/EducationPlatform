import { updateViewerProfile } from "./viewerSlice";

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
