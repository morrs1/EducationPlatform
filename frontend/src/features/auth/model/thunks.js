import { loginWithMockCredentials } from "./loginWithMockCredentials";
import {
  loginFailure,
  loginSuccess,
  startLogin,
  updateAccountEmail,
  updateAccountPassword,
} from "./authSlice";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function submitLogin({ email, password }) {
  return (dispatch, getState) => {
    dispatch(startLogin());

    const state = getState();
    const result = loginWithMockCredentials({
      email,
      password,
      accountEmail: state.auth.accountEmail,
      accountPassword: state.auth.accountPassword,
      viewerId: state.auth.accountViewerId,
    });

    if (!result.ok) {
      dispatch(loginFailure(result.error));
      return result;
    }

    dispatch(loginSuccess({ viewerId: result.viewerId }));

    return {
      ok: true,
      viewerId: result.viewerId,
    };
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

    dispatch(updateAccountPassword(normalizedNextPassword));

    return {
      ok: true,
      message: "Пароль обновлен. Используйте его при следующем входе.",
    };
  };
}
