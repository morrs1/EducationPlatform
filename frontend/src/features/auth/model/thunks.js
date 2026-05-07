import {
  loginFailure,
  loginSuccess,
  startLogin,
  updateAccountEmail,
  updateAccountPassword,
} from "./authSlice";
import {
  findAccountByEmail,
  getAccountByViewerId,
  upsertAccount,
} from "./persistence";
import {
  requestGatewayLogin,
  requestGatewayRegister,
} from "../../../shared/api/authGatewayApi";

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

export function submitRegister({ fullName, email, password, status, avatarUrl }) {
  return async (dispatch) => {
    const normalizedFullName = fullName?.trim() ?? "";
    const normalizedEmail = email?.trim().toLowerCase() ?? "";
    const normalizedPassword = password?.trim() ?? "";
    const normalizedStatus = status?.trim() ?? "";

    if (normalizedFullName.split(/\s+/).filter(Boolean).length < 2) {
      dispatch(
        loginFailure(
          "Введите минимум фамилию и имя в формате: Фамилия Имя [Отчество].",
        ),
      );
      return {
        ok: false,
        error:
          "Введите минимум фамилию и имя в формате: Фамилия Имя [Отчество].",
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

    if (normalizedFullName.split(/\s+/).filter(Boolean).length < 2) {
      dispatch(
        loginFailure(
          "Введите минимум фамилию и имя в формате: Фамилия Имя [Отчество].",
        ),
      );
      return {
        ok: false,
        error:
          "Введите минимум фамилию и имя в формате: Фамилия Имя [Отчество].",
      };
    }

    const parts = normalizedFullName.split(/\s+/).filter(Boolean);
    const surname = parts[0] ?? "";
    const name = parts[1] ?? "";
    const patronymic = parts.length > 2 ? parts.slice(2).join(" ") : "";

    dispatch(startLogin());

    try {
      await requestGatewayRegister({
        surname,
        name,
        patronymic,
        userStatus: normalizedStatus || "STUDENT",
        email: normalizedEmail,
        password: normalizedPassword,
        profilePhotoLink:
          typeof avatarUrl === "string" &&
          (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://"))
            ? avatarUrl
            : "",
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

      return {
        ok: true,
        viewerId: payload.viewerId,
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

export function submitEmailChange({ nextEmail, currentPassword }) {
  return (dispatch, getState) => {
    const state = getState();
    const normalizedEmail = nextEmail?.trim().toLowerCase() ?? "";

    if (!normalizedEmail) {
      return {
        ok: false,
        error: "Введите новый email.",
      };
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return {
        ok: false,
        error: "Введите корректный email-адрес.",
      };
    }

    if (normalizedEmail === state.auth.accountEmail.toLowerCase()) {
      return {
        ok: false,
        error: "Укажите другой email, отличный от текущего.",
      };
    }

    const existingAccount = findAccountByEmail(normalizedEmail);

    if (
      existingAccount &&
      existingAccount.viewerId !== state.auth.accountViewerId
    ) {
      return {
        ok: false,
        error: "Этот email уже используется другим аккаунтом.",
      };
    }

    if (!currentPassword) {
      return {
        ok: false,
        error: "Введите текущий пароль для подтверждения.",
      };
    }

    if (currentPassword !== state.auth.accountPassword) {
      return {
        ok: false,
        error: "Неверный текущий пароль.",
      };
    }

    const currentAccount = getAccountByViewerId(state.auth.accountViewerId);

    upsertAccount({
      ...currentAccount,
      viewerId: state.auth.accountViewerId,
      email: normalizedEmail,
      password: state.auth.accountPassword,
    });

    dispatch(updateAccountEmail(normalizedEmail));

    return {
      ok: true,
      nextEmail: normalizedEmail,
      message:
        "Почта обновлена. Используйте новый адрес для входа и уведомлений.",
    };
  };
}

export function submitPasswordChange({
  currentPassword,
  nextPassword,
  confirmPassword,
}) {
  return (dispatch, getState) => {
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

    if (normalizedCurrentPassword !== state.auth.accountPassword) {
      return {
        ok: false,
        error: "Текущий пароль введен неверно.",
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

    const currentAccount = getAccountByViewerId(state.auth.accountViewerId);

    upsertAccount({
      ...currentAccount,
      viewerId: state.auth.accountViewerId,
      email: state.auth.accountEmail,
      password: normalizedNextPassword,
    });

    dispatch(updateAccountPassword(normalizedNextPassword));

    return {
      ok: true,
      message: "Пароль обновлен. Используйте его при следующем входе.",
    };
  };
}
