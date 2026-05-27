import {
  loginFailure,
  loginSuccess,
  startLogin,
  updateAccountEmail,
  updateAccountPassword,
} from "./authSlice";
import {
  requestGatewayLogin,
  requestGatewayRegister,
  requestViewerEmailUpdate,
  requestViewerPasswordUpdate,
  uploadViewerProfilePhoto,
} from "../../../shared/api";
import { validateRequiredProfileNameParts } from "../../../shared/lib";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapGatewayUserToLoginPayload(data) {
  const user = data?.user ?? {};
  const id = user.id != null ? String(user.id) : null;

  return {
    viewerId: id,
    accountViewerId: id,
    email: typeof user.email === "string" ? user.email : "",
    accessToken: typeof data?.accessToken === "string" ? data.accessToken : "",
    userRole: typeof user.role === "string" ? user.role : "",
    userStatus: typeof user.userStatus === "string" ? user.userStatus : "",
  };
}

export function submitLogin({ email, password }) {
  return async (dispatch) => {
    dispatch(startLogin());

    const normalizedEmail = email?.trim().toLowerCase() ?? "";
    const normalizedPassword = password?.trim() ?? "";

    try {
      const data = await requestGatewayLogin({
        email: normalizedEmail,
        password: normalizedPassword,
      });
      const payload = mapGatewayUserToLoginPayload(data);

      if (!payload.viewerId || !payload.accessToken) {
        dispatch(loginFailure("Не удалось выполнить вход. Попробуйте позже."));
        return {
          ok: false,
          error: "Не удалось выполнить вход. Попробуйте позже.",
        };
      }

      dispatch(loginSuccess(payload));

      return {
        ok: true,
        viewerId: payload.viewerId,
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Неверная почта или пароль";

      dispatch(loginFailure(message));

      return {
        ok: false,
        error: message,
      };
    }
  };
}

export function submitRegister({ fullName, email, password, status, avatarFile }) {
  return async (dispatch) => {
    const normalizedFullName = fullName?.trim() ?? "";
    const normalizedEmail = email?.trim().toLowerCase() ?? "";
    const normalizedPassword = password?.trim() ?? "";
    const normalizedStatus = status?.trim() ?? "";
    const profilePhotoFile = avatarFile instanceof File ? avatarFile : null;

    const parts = normalizedFullName.split(/\s+/).filter(Boolean);

    if (parts.length < 3) {
      dispatch(
        loginFailure(
          "Введите фамилию, имя и отчество в формате: Фамилия Имя Отчество.",
        ),
      );
      return {
        ok: false,
        error:
          "Введите фамилию, имя и отчество в формате: Фамилия Имя Отчество.",
      };
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      dispatch(loginFailure("Введите корректный email-адрес."));
      return {
        ok: false,
        error: "Введите корректный email-адрес.",
      };
    }

    if (normalizedPassword.length < 8) {
      dispatch(loginFailure("Пароль должен содержать минимум 8 символов."));
      return {
        ok: false,
        error: "Пароль должен содержать минимум 8 символов.",
      };
    }

    const surname = parts[0] ?? "";
    const name = parts[1] ?? "";
    const patronymic = parts.length > 2 ? parts.slice(2).join(" ") : "";
    const nameValidationError = validateRequiredProfileNameParts({
      firstName: name,
      lastName: surname,
      patronymic,
    });

    if (nameValidationError) {
      dispatch(loginFailure(nameValidationError));
      return {
        ok: false,
        error: nameValidationError,
      };
    }

    dispatch(startLogin());

    try {
      await requestGatewayRegister({
        surname,
        name,
        patronymic,
        userStatus: normalizedStatus || "STUDENT",
        email: normalizedEmail,
        password: normalizedPassword,
        profilePhotoLink: "",
      });

      const data = await requestGatewayLogin({
        email: normalizedEmail,
        password: normalizedPassword,
      });
      const payload = mapGatewayUserToLoginPayload(data);

      if (!payload.viewerId || !payload.accessToken) {
        dispatch(
          loginFailure(
            "Аккаунт создан, но не удалось выполнить вход. Войдите вручную.",
          ),
        );
        return {
          ok: false,
          error:
            "Аккаунт создан, но не удалось выполнить вход. Войдите вручную.",
        };
      }

      dispatch(loginSuccess(payload));

      let profilePhotoUploadError = null;

      if (profilePhotoFile) {
        try {
          await uploadViewerProfilePhoto(payload.viewerId, profilePhotoFile);
        } catch (error) {
          profilePhotoUploadError =
            error instanceof Error && error.message
              ? error.message
              : "Аккаунт создан, но фото профиля не загрузилось.";
        }
      }

      return {
        ok: true,
        viewerId: payload.viewerId,
        profilePhotoUploadError,
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Не удалось зарегистрироваться. Попробуйте позже.";

      dispatch(loginFailure(message));

      return {
        ok: false,
        error: message,
      };
    }
  };
}

export function submitEmailChange({ nextEmail, oldEmail }) {
  return async (dispatch, getState) => {
    const state = getState();
    const viewerId = state.auth?.currentViewerId ?? state.auth?.accountViewerId;

    const normalizedNewEmail = nextEmail?.trim().toLowerCase() ?? "";
    const normalizedOldEmail =
      oldEmail?.trim().toLowerCase() ??
      state.auth?.accountEmail?.trim().toLowerCase();

    if (!viewerId) {
      return {
        ok: false,
        error: "Не удалось определить пользователя.",
      };
    }

    if (!normalizedOldEmail) {
      return {
        ok: false,
        error: "Не удалось определить текущий email.",
      };
    }

    if (!normalizedNewEmail) {
      return {
        ok: false,
        error: "Введите новый email.",
      };
    }

    if (!EMAIL_PATTERN.test(normalizedNewEmail)) {
      return {
        ok: false,
        error: "Введите корректный email-адрес.",
      };
    }

    if (normalizedNewEmail === normalizedOldEmail) {
      return {
        ok: false,
        error: "Укажите другой email, отличный от текущего.",
      };
    }

    try {
      await requestViewerEmailUpdate(
        viewerId,
        normalizedOldEmail,
        normalizedNewEmail,
      );

      dispatch(updateAccountEmail(normalizedNewEmail));

      return {
        ok: true,
        nextEmail: normalizedNewEmail,
        message:
          "Почта обновлена. Используйте новый адрес для входа и уведомлений.",
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Не удалось изменить почту. Попробуйте позже.";

      return {
        ok: false,
        error: message,
      };
    }
  };
}

export function submitPasswordChange({
  currentPassword,
  nextPassword,
  confirmPassword,
}) {
  return async (dispatch, getState) => {
    const state = getState();
    const normalizedCurrentPassword = currentPassword?.trim() ?? "";
    const normalizedNextPassword = nextPassword?.trim() ?? "";
    const normalizedConfirmPassword = confirmPassword?.trim() ?? "";

    if (!normalizedCurrentPassword) {
      return {
        ok: false,
        error: "Введите текущий пароль.",
      };
    }

    if (normalizedNextPassword.length < 8) {
      return {
        ok: false,
        error: "Новый пароль должен содержать минимум 8 символов.",
      };
    }

    if (normalizedNextPassword === normalizedCurrentPassword) {
      return {
        ok: false,
        error: "Новый пароль должен отличаться от текущего.",
      };
    }

    if (normalizedNextPassword !== normalizedConfirmPassword) {
      return {
        ok: false,
        error: "Подтверждение пароля не совпадает с новым паролем.",
      };
    }
    const viewerId = state.auth?.currentViewerId ?? state.auth?.accountViewerId;

    if (!viewerId) {
      return {
        ok: false,
        error: "Не удалось определить пользователя.",
      };
    }

    try {
      await requestViewerPasswordUpdate(
        viewerId,
        normalizedCurrentPassword,
        normalizedNextPassword,
      );

      dispatch(updateAccountPassword(normalizedNextPassword));

      return {
        ok: true,
        message: "Пароль обновлен. Используйте его при следующем входе.",
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Не удалось обновить пароль. Попробуйте позже.";

      return {
        ok: false,
        error: message,
      };
    }
  };
}
