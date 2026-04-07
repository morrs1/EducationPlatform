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
  createViewerProfileFromRegistration,
  saveViewerProfile,
} from "../../viewer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createUniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function submitLogin({ email, password }) {
  return (dispatch) => {
    dispatch(startLogin());

    const normalizedEmail = email?.trim().toLowerCase() ?? "";
    const normalizedPassword = password?.trim() ?? "";
    const account = findAccountByEmail(normalizedEmail);

    if (!account || account.password !== normalizedPassword) {
      const result = {
        ok: false,
        error: "Неверная почта или пароль",
      };

      dispatch(loginFailure(result.error));
      return result;
    }

    dispatch(
      loginSuccess({
        viewerId: account.viewerId,
        accountViewerId: account.viewerId,
        email: account.email,
        password: account.password,
      }),
    );

    return {
      ok: true,
      viewerId: account.viewerId,
    };
  };
}

export function submitRegister({ fullName, email, password }) {
  return (dispatch) => {
    const normalizedFullName = fullName?.trim() ?? "";
    const normalizedEmail = email?.trim().toLowerCase() ?? "";
    const normalizedPassword = password?.trim() ?? "";

    if (!normalizedFullName) {
      dispatch(loginFailure("Введите имя и фамилию."));
      return {
        ok: false,
        error: "Введите имя и фамилию.",
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

    if (findAccountByEmail(normalizedEmail)) {
      dispatch(loginFailure("Пользователь с такой почтой уже существует."));
      return {
        ok: false,
        error: "Пользователь с такой почтой уже существует.",
      };
    }

    const viewerId = createUniqueId("viewer");
    const account = upsertAccount({
      id: createUniqueId("account"),
      viewerId,
      email: normalizedEmail,
      password: normalizedPassword,
    });

    saveViewerProfile(
      createViewerProfileFromRegistration({
        viewerId,
        email: normalizedEmail,
        fullName: normalizedFullName,
      }),
    );

    dispatch(
      loginSuccess({
        viewerId,
        accountViewerId: viewerId,
        email: account.email,
        password: account.password,
      }),
    );

    return {
      ok: true,
      viewerId,
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
